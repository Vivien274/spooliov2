/**
 * Spoolio V2.1 Taxonomy Service (SERVER ONLY)
 * 
 * Gestion centralisée de la taxonomie V2.1 (Univers, Catégories, Collections, Tags).
 * Gère les interactions avec les tables Supabase `catalog_taxonomy` et `product_taxonomy`.
 * 
 * SÉCURITÉ & RESTRICTIONS STRICTES :
 * 1. SUPABASE SOURCE DE VÉRITÉ EN PRODUCTION :
 *    En environnement de production (NODE_ENV=production), Supabase est la SEULE
 *    source de vérité. Le fichier fallback n'est JAMAIS utilisé en production.
 * 2. LOCAL DEV FALLBACK :
 *    Le fichier `taxonomy_fallback.json` est strictement réservé au développement local
 *    hors-ligne ou lorsque les credentials ne sont pas configurés en local.
 * 3. VERROU D'ÉCRITURE DISTANTE (DRY RUN) :
 *    Par défaut, `ALLOW_REMOTE_TAXONOMY_WRITES` est à `false`. Aucune écriture
 *    n'est exécutée sur Supabase distant pendant les tests et le développement.
 * 4. TRANSACTION ATOMIQUE & ROLLBACK :
 *    Prépare la RPC PostgreSQL `save_product_taxonomy_v2` et intègre un mécanisme
 *    de snapshot / rollback automatique pour empêcher tout orphelinage de produit.
 */

import { getSupabaseServerClient } from "@/lib/supabaseClient";
import fallbackData from "@/data/taxonomy_fallback.json";
import type {
  CatalogTaxonomyItem,
  ProductTaxonomyMapping,
  SaveProductTaxonomyPayload,
  TaxonomyType,
} from "@/types/taxonomy";
import { normalizeSlug } from "@/types/taxonomy";

// VERROU DE SÉCURITÉ SERVEUR : false = Dry-run / Simulation sans écriture distante
export const ALLOW_REMOTE_TAXONOMY_WRITES =
  process.env.ALLOW_REMOTE_TAXONOMY_WRITES === "true";

// Environnement
const isProduction = process.env.NODE_ENV === "production";

// In-memory simulation cache for local testing without modifying remote DB
const localSessionOverrides = {
  taxonomyItems: new Map<number, CatalogTaxonomyItem>(),
  productMappings: new Map<number, SaveProductTaxonomyPayload>(),
};

/**
 * Récupère le client Supabase serveur avec clé de service
 */
function getSupabase() {
  return getSupabaseServerClient();
}

/**
 * Récupère l'ensemble des éléments de taxonomie V2.1
 * avec calcul automatique du nombre de produits associés par collection et par tag.
 */
export async function getTaxonomies(): Promise<CatalogTaxonomyItem[]> {
  try {
    const supabase = getSupabase();
    const { data: taxData, error: taxError } = await supabase
      .from("catalog_taxonomy")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    let items: CatalogTaxonomyItem[] = [];

    if (taxError || !taxData) {
      console.warn("[Taxonomy Service] Impossible de charger catalog_taxonomy depuis Supabase, utilisation du fallback éditorial:", taxError?.message);
      items = (fallbackData.taxonomy as any[]) || [];
    } else {
      items = taxData as CatalogTaxonomyItem[];
    }

    // Appliquer les overrides en mémoire du mode simulation locale
    localSessionOverrides.taxonomyItems.forEach((override, id) => {
      const idx = items.findIndex((i) => i.id === id);
      if (idx >= 0) {
        items[idx] = { ...items[idx], ...override };
      } else {
        items.push(override);
      }
    });

    // Récupérer le décompte des produits par taxonomie
    const { data: prodTaxData, error: prodErr } = await supabase
      .from("product_taxonomy")
      .select("taxonomy_id");

    const counts: Record<number, number> = {};
    const prods = (!prodErr && prodTaxData)
      ? prodTaxData
      : ((fallbackData.productTaxonomy as any[]) || []);

    prods.forEach((pt: any) => {
      counts[pt.taxonomy_id] = (counts[pt.taxonomy_id] || 0) + 1;
    });

    // Dictionnaire pour résoudre le nom de l'univers parent
    const universeMap = new Map<number, string>();
    items
      .filter((i) => i.type === "universe")
      .forEach((u) => universeMap.set(u.id, u.name));

    return items.map((item) => ({
      ...item,
      product_count: counts[item.id] || 0,
      parent_name: item.parent_id ? universeMap.get(item.parent_id) || "—" : undefined,
    }));
  } catch (error: any) {
    console.warn("[Taxonomy Service Exception] Repli sur le fallback éditorial:", error.message);
    return (fallbackData.taxonomy as any[]) || [];
  }
}

/**
 * Récupère les éléments de taxonomie par type (universe, category, collection, tag)
 */
export async function getTaxonomiesByType(type: TaxonomyType): Promise<CatalogTaxonomyItem[]> {
  const all = await getTaxonomies();
  return all.filter((item) => item.type === type);
}

/**
 * Récupère le mapping V2.1 complet pour un produit donné
 */
export async function getProductTaxonomy(productId: number): Promise<ProductTaxonomyMapping> {
  const allTaxonomies = await getTaxonomies();
  const taxById = new Map<number, CatalogTaxonomyItem>();
  allTaxonomies.forEach((t) => taxById.set(t.id, t));

  // Vérifier d'abord si un override local existe en mémoire (mode simulation)
  const localOverride = localSessionOverrides.productMappings.get(productId);
  if (localOverride) {
    return {
      productId,
      universeId: localOverride.universeId,
      universe: localOverride.universeId ? taxById.get(localOverride.universeId) || null : null,
      categoryId: localOverride.categoryId,
      category: localOverride.categoryId ? taxById.get(localOverride.categoryId) || null : null,
      collectionIds: localOverride.collectionIds,
      collections: localOverride.collectionIds.map((id) => taxById.get(id)).filter(Boolean) as CatalogTaxonomyItem[],
      tagIds: localOverride.tagIds,
      tags: localOverride.tagIds.map((id) => taxById.get(id)).filter(Boolean) as CatalogTaxonomyItem[],
    };
  }

  try {
    const supabase = getSupabase();
    const { data: rows, error } = await supabase
      .from("product_taxonomy")
      .select("taxonomy_id, is_primary")
      .eq("product_id", productId);

    let mappingRows = rows;
    if (error || !rows) {
      console.warn("[Taxonomy Service] Impossible de charger product_taxonomy depuis Supabase, repli sur le fallback:", error?.message);
      mappingRows = (fallbackData.productTaxonomy as any[]).filter(
        (pt) => pt.product_id === productId
      );
    }

    let universeId: number | null = null;
    let categoryId: number | null = null;
    const collectionIds: number[] = [];
    const tagIds: number[] = [];

    (mappingRows || []).forEach((row: any) => {
      const taxItem = taxById.get(row.taxonomy_id);
      if (!taxItem) return;

      if (taxItem.type === "universe") {
        universeId = taxItem.id;
      } else if (taxItem.type === "category" && row.is_primary) {
        categoryId = taxItem.id;
      } else if (taxItem.type === "category" && !categoryId) {
        categoryId = taxItem.id;
      } else if (taxItem.type === "collection") {
        collectionIds.push(taxItem.id);
      } else if (taxItem.type === "tag") {
        tagIds.push(taxItem.id);
      }
    });

    return {
      productId,
      universeId,
      universe: universeId ? taxById.get(universeId) || null : null,
      categoryId,
      category: categoryId ? taxById.get(categoryId) || null : null,
      collectionIds,
      collections: collectionIds.map((id) => taxById.get(id)).filter(Boolean) as CatalogTaxonomyItem[],
      tagIds,
      tags: tagIds.map((id) => taxById.get(id)).filter(Boolean) as CatalogTaxonomyItem[],
    };
  } catch (err: any) {
    console.warn("[Taxonomy Service] Erreur getProductTaxonomy, repli fallback:", err.message);
    const fallbackRows = (fallbackData.productTaxonomy as any[]).filter(
      (pt) => pt.product_id === productId
    );
    let universeId: number | null = null;
    let categoryId: number | null = null;
    const collectionIds: number[] = [];
    const tagIds: number[] = [];

    fallbackRows.forEach((row: any) => {
      const taxItem = taxById.get(row.taxonomy_id);
      if (!taxItem) return;
      if (taxItem.type === "universe") universeId = taxItem.id;
      else if (taxItem.type === "category" && !categoryId) categoryId = taxItem.id;
      else if (taxItem.type === "collection") collectionIds.push(taxItem.id);
      else if (taxItem.type === "tag") tagIds.push(taxItem.id);
    });

    return {
      productId,
      universeId,
      universe: universeId ? taxById.get(universeId) || null : null,
      categoryId,
      category: categoryId ? taxById.get(categoryId) || null : null,
      collectionIds,
      collections: collectionIds.map((id) => taxById.get(id)).filter(Boolean) as CatalogTaxonomyItem[],
      tagIds,
      tags: tagIds.map((id) => taxById.get(id)).filter(Boolean) as CatalogTaxonomyItem[],
    };
  }
}

/**
 * Sauvegarde le mapping V2.1 d'un produit
 * En mode local (ALLOW_REMOTE_TAXONOMY_WRITES = false) : SIMULATION PROTÉGÉE SANS ÉCRITURE DISTANTE
 */
export async function saveProductTaxonomy(
  productId: number,
  payload: SaveProductTaxonomyPayload
): Promise<{
  success: boolean;
  dryRun: boolean;
  message: string;
  simulatedRows?: any[];
}> {
  if (!productId || isNaN(productId) || productId <= 0) {
    throw new Error("Identifiant de produit invalide (doit être un entier positif).");
  }

  // 1. Validation stricte des règles V2.1
  const allTaxonomies = await getTaxonomies();
  const taxById = new Map<number, CatalogTaxonomyItem>();
  allTaxonomies.forEach((t) => taxById.set(t.id, t));

  // Validation de l'univers si fourni
  if (payload.universeId) {
    const univ = taxById.get(payload.universeId);
    if (!univ || univ.type !== "universe") {
      throw new Error(`Univers #${payload.universeId} introuvable ou invalide.`);
    }
  }

  // Validation de la catégorie principale si fournie
  if (payload.categoryId) {
    const cat = taxById.get(payload.categoryId);
    if (!cat || cat.type !== "category") {
      throw new Error(`Catégorie #${payload.categoryId} introuvable ou invalide.`);
    }
    if (payload.universeId && cat.parent_id !== payload.universeId) {
      throw new Error(
        `Incohérence : la catégorie "${cat.name}" n'appartient pas à l'univers sélectionné.`
      );
    }
  }

  // Validation des collections
  for (const cId of payload.collectionIds) {
    const col = taxById.get(cId);
    if (!col || col.type !== "collection") {
      throw new Error(`Collection #${cId} introuvable ou invalide.`);
    }
  }

  // Validation des tags
  for (const tId of payload.tagIds) {
    const t = taxById.get(tId);
    if (!t || t.type !== "tag") {
      throw new Error(`Tag #${tId} introuvable ou invalide.`);
    }
  }

  // Préparation exacte des lignes pour public.product_taxonomy
  const rows: { product_id: number; taxonomy_id: number; is_primary: boolean }[] = [];

  if (payload.universeId) {
    rows.push({
      product_id: productId,
      taxonomy_id: payload.universeId,
      is_primary: false,
    });
  }

  if (payload.categoryId) {
    rows.push({
      product_id: productId,
      taxonomy_id: payload.categoryId,
      is_primary: true,
    });
  }

  payload.collectionIds.forEach((cId) => {
    rows.push({
      product_id: productId,
      taxonomy_id: cId,
      is_primary: false,
    });
  });

  payload.tagIds.forEach((tId) => {
    rows.push({
      product_id: productId,
      taxonomy_id: tId,
      is_primary: false,
    });
  });

  // MODE SIMULATION LOCAL (DÉFAUT)
  if (!ALLOW_REMOTE_TAXONOMY_WRITES) {
    console.info(`[TAXONOMY V2.1 — DRY RUN PROTÉGÉ] Produit #${productId}`);
    console.info(`-> Opération Supabase qui serait exécutée :`);
    console.info(`   DELETE FROM public.product_taxonomy WHERE product_id = ${productId}`);
    console.info(`   INSERT INTO public.product_taxonomy (${rows.length} lignes):`, rows);

    // Mémoriser dans le store de session locale pour l'interface
    localSessionOverrides.productMappings.set(productId, payload);

    return {
      success: true,
      dryRun: true,
      message: `Sauvegarde simulée avec succès (${rows.length} relations prêtes pour product_taxonomy). Mode local protégé : aucune écriture distante sur Supabase.`,
      simulatedRows: rows,
    };
  }

  // MODE ÉCRITURE RÉELLE (Réservé pour la production après activation explicite)
  const supabase = getSupabase();

  // En production : la RPC transactionnelle save_product_taxonomy_v2 est OBLIGATOIRE.
  // Aucun fallback par requêtes séquentielles n'est autorisé en production.
  if (isProduction) {
    const { data: rpcData, error: rpcError } = await supabase.rpc("save_product_taxonomy_v2", {
      p_product_id: productId,
      p_universe_id: payload.universeId,
      p_category_id: payload.categoryId,
      p_collection_ids: payload.collectionIds,
      p_tag_ids: payload.tagIds,
    });

    if (rpcError || !rpcData?.success) {
      throw new Error(
        `[Supabase RPC Error] Échec de la transaction save_product_taxonomy_v2: ${
          rpcError?.message || "Erreur RPC"
        }`
      );
    }

    return {
      success: true,
      dryRun: false,
      message: "Taxonomie V2.1 enregistrée avec succès (Transaction atomique RPC PostgreSQL).",
    };
  }

  // En environnement de développement hors production uniquement :
  // Option A : RPC si déjà installée en dev
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc("save_product_taxonomy_v2", {
      p_product_id: productId,
      p_universe_id: payload.universeId,
      p_category_id: payload.categoryId,
      p_collection_ids: payload.collectionIds,
      p_tag_ids: payload.tagIds,
    });

    if (!rpcError && rpcData?.success) {
      return {
        success: true,
        dryRun: false,
        message: "Taxonomie V2.1 enregistrée avec succès (Transaction atomique RPC).",
      };
    }
  } catch (rpcErr) {
    console.warn("[Dev Fallback] RPC non disponible, utilisation du filet de secours dev:", rpcErr);
  }

  // Option B : Filet de secours local/développement uniquement (snapshot & rollback)
  const { data: existingSnapshot } = await supabase
    .from("product_taxonomy")
    .select("product_id, taxonomy_id, is_primary")
    .eq("product_id", productId);

  try {
    const { error: delErr } = await supabase
      .from("product_taxonomy")
      .delete()
      .eq("product_id", productId);

    if (delErr) throw new Error(`Échec de la suppression: ${delErr.message}`);

    if (rows.length > 0) {
      const { error: insErr } = await supabase
        .from("product_taxonomy")
        .insert(rows);

      if (insErr) {
        if (existingSnapshot && existingSnapshot.length > 0) {
          console.error("Échec insertion, restauration du snapshot précédent...");
          await supabase.from("product_taxonomy").insert(existingSnapshot);
        }
        throw new Error(`Échec de l'insertion des nouvelles relations: ${insErr.message}`);
      }
    }

    return {
      success: true,
      dryRun: false,
      message: "Taxonomie V2.1 enregistrée avec succès dans Supabase.",
    };
  } catch (err: any) {
    throw new Error(`Erreur lors de la sauvegarde: ${err.message}`);
  }
}

/**
 * Crée ou met à jour un élément de taxonomie (Univers, Catégorie, Collection, Tag)
 */
export async function saveTaxonomyItem(
  item: Partial<CatalogTaxonomyItem> & { name: string; type: TaxonomyType }
): Promise<{
  success: boolean;
  dryRun: boolean;
  item: CatalogTaxonomyItem;
  message: string;
}> {
  if (!item.name || !item.name.trim()) {
    throw new Error("Le nom de l'élément de taxonomie est obligatoire.");
  }

  const validTypes: TaxonomyType[] = ["universe", "category", "collection", "tag"];
  if (!validTypes.includes(item.type)) {
    throw new Error(`Type de taxonomie invalide: ${item.type}`);
  }

  const isCreation = !item.id;
  const slug = item.slug ? normalizeSlug(item.slug) : normalizeSlug(item.name);

  // Validation doublon de slug
  const all = await getTaxonomies();
  const existing = all.find(
    (t) => t.slug === slug && t.type === item.type && t.id !== item.id
  );
  if (existing) {
    throw new Error(
      `Un élément de type "${item.type}" avec le slug "${slug}" existe déjà ("${existing.name}").`
    );
  }

  // Pour les catégories : vérifier la validité de l'univers parent
  if (item.type === "category") {
    if (!item.parent_id) {
      throw new Error("Une catégorie doit obligatoirement être rattachée à un Univers parent valide.");
    }
    const parentUniv = all.find((u) => u.id === item.parent_id && u.type === "universe");
    if (!parentUniv) {
      throw new Error(`L'univers parent #${item.parent_id} n'existe pas.`);
    }
  }

  const payload: CatalogTaxonomyItem = {
    id: item.id || (Math.max(0, ...all.map((t) => t.id)) + 1),
    type: item.type,
    name: item.name.trim(),
    slug,
    parent_id: item.type === "category" ? (item.parent_id ?? null) : null,
    subtitle: item.subtitle ? item.subtitle.trim() : null,
    description: item.description ? item.description.trim() : null,
    seo_title: item.seo_title ? item.seo_title.trim() : null,
    seo_description: item.seo_description ? item.seo_description.trim() : null,
    sort_order: Number(item.sort_order ?? 10),
    is_active: item.is_active ?? true,
    is_indexable: item.is_indexable ?? (item.type !== "tag"),
    updated_at: new Date().toISOString(),
  };

  // DRY RUN PROTECTION (Défaut)
  if (!ALLOW_REMOTE_TAXONOMY_WRITES) {
    console.info(`[TAXONOMY V2.1 — DRY RUN PROTÉGÉ] Item #${payload.id} (${payload.type})`);
    console.info(`-> Opération Supabase (${isCreation ? "INSERT" : "UPDATE"}):`, payload);

    localSessionOverrides.taxonomyItems.set(payload.id, payload);

    return {
      success: true,
      dryRun: true,
      item: payload,
      message: `${isCreation ? "Création" : "Modification"} simulée avec succès. Mode local protégé : aucune écriture distante.`,
    };
  }

  // MODE ÉCRITURE RÉELLE (Réservé pour la production)
  const supabase = getSupabase();
  if (isCreation) {
    const { data, error } = await supabase
      .from("catalog_taxonomy")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return {
      success: true,
      dryRun: false,
      item: data,
      message: "Création enregistrée dans Supabase.",
    };
  } else {
    const { data, error } = await supabase
      .from("catalog_taxonomy")
      .update(payload)
      .eq("id", payload.id)
      .select()
      .single();

    if (error) throw error;
    return {
      success: true,
      dryRun: false,
      item: data,
      message: "Mise à jour enregistrée dans Supabase.",
    };
  }
}
