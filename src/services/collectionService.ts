/**
 * Spoolio V2.1 — Collection Page Data Service
 * 
 * Récupère de façon consolidée et performante les données d'une Collection :
 * - Informations de la collection (catalog_taxonomy + fallback éditorial)
 * - Navigation contextuelle vers les autres collections actives
 * - Produits associés et actifs (product_taxonomy -> getPublishedProducts)
 *   (Peuvent provenir de plusieurs univers différents sans aucun filtrage d'univers)
 * - Métadonnées SEO dynamiques
 */

import type { Metadata } from "next";
import { getTaxonomies } from "@/services/taxonomyService";
import { getPublishedProducts } from "@/lib/serverProducts";
import { getSupabaseServerClient } from "@/lib/supabaseClient";
import fallbackData from "@/data/taxonomy_fallback.json";
import { COLLECTION_EDITORIAL_CONFIG } from "@/config/collectionEditorialConfig";
import type { CatalogTaxonomyItem } from "@/types/taxonomy";
import type { Product } from "@/components/ProductCard";

export interface SiblingCollectionInfo extends CatalogTaxonomyItem {
  productCount: number;
  url: string;
}

export interface CollectionPageData {
  collection: CatalogTaxonomyItem & {
    editorialSubtitle: string;
    editorialDescription: string;
    tagline: string;
  };
  siblingCollections: SiblingCollectionInfo[];
  products: Product[];
  totalProducts: number;
  productContextMap: Record<number, { universeName?: string; categoryName?: string }>;
}

const isProduction = process.env.NODE_ENV === "production";

/**
 * Récupère les IDs des produits associés à une collection
 */
async function getCollectionProductIds(collectionId: number): Promise<number[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data: rows, error } = await supabase
      .from("product_taxonomy")
      .select("product_id")
      .eq("taxonomy_id", collectionId);

    if (error || !rows) {
      console.warn(`[Taxonomy Service] getCollectionProductIds repli fallback:`, error?.message);
      return (fallbackData.productTaxonomy as any[])
        .filter((pt) => pt.taxonomy_id === collectionId)
        .map((pt) => pt.product_id);
    }

    return rows.map((r: any) => r.product_id);
  } catch (err: any) {
    console.warn(`[Taxonomy Service] getCollectionProductIds exception, repli fallback:`, err.message);
    return (fallbackData.productTaxonomy as any[])
      .filter((pt) => pt.taxonomy_id === collectionId)
      .map((pt) => pt.product_id);
  }
}

/**
 * Récupère le nombre de produits pour chaque collection active
 */
async function getCollectionProductCounts(collectionIds: number[]): Promise<Record<number, number>> {
  const counts: Record<number, number> = {};
  collectionIds.forEach((id) => {
    counts[id] = 0;
  });

  if (collectionIds.length === 0) return counts;

  try {
    const supabase = getSupabaseServerClient();
    const { data: rows, error } = await supabase
      .from("product_taxonomy")
      .select("product_id, taxonomy_id")
      .in("taxonomy_id", collectionIds);

    if (error || !rows) {
      console.warn(`[Taxonomy Service] getCollectionProductCounts repli fallback:`, error?.message);
      (fallbackData.productTaxonomy as any[])
        .filter((pt) => collectionIds.includes(pt.taxonomy_id))
        .forEach((pt) => {
          counts[pt.taxonomy_id] = (counts[pt.taxonomy_id] || 0) + 1;
        });
      return counts;
    }

    rows.forEach((r: any) => {
      counts[r.taxonomy_id] = (counts[r.taxonomy_id] || 0) + 1;
    });
    return counts;
  } catch (err: any) {
    console.warn(`[Taxonomy Service] getCollectionProductCounts exception, repli fallback:`, err.message);
    (fallbackData.productTaxonomy as any[])
      .filter((pt) => collectionIds.includes(pt.taxonomy_id))
      .forEach((pt) => {
        counts[pt.taxonomy_id] = (counts[pt.taxonomy_id] || 0) + 1;
      });
    return counts;
  }
}

/**
 * Récupère le contexte (univers & catégorie) pour une liste de produits
 */
async function getProductsContext(
  productIds: number[],
  allTaxonomies: CatalogTaxonomyItem[]
): Promise<Record<number, { universeName?: string; categoryName?: string }>> {
  const contextMap: Record<number, { universeName?: string; categoryName?: string }> = {};
  if (productIds.length === 0) return contextMap;

  const taxonomyById = new Map<number, CatalogTaxonomyItem>();
  allTaxonomies.forEach((t) => taxonomyById.set(t.id, t));

  try {
    const supabase = getSupabaseServerClient();
    const { data: rows } = await supabase
      .from("product_taxonomy")
      .select("product_id, taxonomy_id, is_primary")
      .in("product_id", productIds);

    const mappings = rows || (fallbackData.productTaxonomy as any[]).filter((pt) =>
      productIds.includes(pt.product_id)
    );

    mappings.forEach((m: any) => {
      const taxItem = taxonomyById.get(m.taxonomy_id);
      if (!taxItem) return;

      if (!contextMap[m.product_id]) {
        contextMap[m.product_id] = {};
      }

      if (taxItem.type === "universe") {
        contextMap[m.product_id].universeName = taxItem.name;
      } else if (taxItem.type === "category" && m.is_primary) {
        contextMap[m.product_id].categoryName = taxItem.name;
      }
    });

    return contextMap;
  } catch {
    return contextMap;
  }
}

/**
 * Récupère l'ensemble des données d'une collection
 */
export async function getCollectionPageData(collectionSlug: string): Promise<CollectionPageData | null> {
  const allTaxonomies = await getTaxonomies();

  // 1. Trouver la collection demandée (active seulement)
  const collection = allTaxonomies.find(
    (item) => item.type === "collection" && item.slug === collectionSlug && item.is_active
  );

  if (!collection) {
    return null;
  }

  // 2. Trouver les autres collections actives pour la navigation contextuelle
  const siblingCollectionsRaw = allTaxonomies
    .filter((item) => item.type === "collection" && item.is_active)
    .sort((a, b) => (a.sort_order ?? 10) - (b.sort_order ?? 10));

  const siblingIds = siblingCollectionsRaw.map((c) => c.id);

  // 3. Charger en parallèle : IDs produits de la collection, compteurs des collections, catalogue publié
  const [productIds, countsMap, allPublishedProducts] = await Promise.all([
    getCollectionProductIds(collection.id),
    getCollectionProductCounts(siblingIds),
    getPublishedProducts(),
  ]);

  const targetIdSet = new Set(productIds);

  // 4. Filtrer les produits publiés (ATTENTION : aucun filtre d'univers, transversal !)
  const collectionProducts = allPublishedProducts.filter((product) =>
    targetIdSet.has(product.id) && (product.status === "publish" || !product.status)
  );

  // 5. Récupérer le contexte léger (univers/catégorie) pour chaque produit
  const productContextMap = await getProductsContext(productIds, allTaxonomies);

  // 6. Structurer les collections sœurs avec URLs
  const siblingCollections: SiblingCollectionInfo[] = siblingCollectionsRaw.map((sib) => ({
    ...sib,
    productCount: countsMap[sib.id] || 0,
    url: `/collections/${sib.slug}`,
  }));

  // 7. Fallbacks éditoriaux
  const fallback = COLLECTION_EDITORIAL_CONFIG[collectionSlug];

  const enrichedCollection = {
    ...collection,
    editorialSubtitle:
      collection.subtitle ||
      fallback?.subtitle ||
      `Collection contemporaine Spoolio`,
    editorialDescription:
      collection.description ||
      fallback?.description ||
      "",
    tagline: fallback?.tagline || `// COLLECTION ${collection.name.toUpperCase()}`,
  };

  return {
    collection: enrichedCollection,
    siblingCollections,
    products: collectionProducts,
    totalProducts: collectionProducts.length,
    productContextMap,
  };
}

/**
 * Génère les métadonnées SEO dynamiques pour une page collection
 */
export async function generateCollectionMetadata(collectionSlug: string): Promise<Metadata> {
  const allTaxonomies = await getTaxonomies();

  const collection = allTaxonomies.find(
    (item) => item.type === "collection" && item.slug === collectionSlug
  );

  const fallback = COLLECTION_EDITORIAL_CONFIG[collectionSlug];

  const title =
    collection?.seo_title ||
    fallback?.seoTitle ||
    `${collection?.name || "Collection"} — Collection Spoolio`;

  const description =
    collection?.seo_description ||
    fallback?.seoDescription ||
    collection?.description ||
    fallback?.description ||
    `Découvrez la collection ${collection?.name} par l'atelier Spoolio.`;

  const canonicalUrl = `https://www.spoolio.fr/collections/${collectionSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Spoolio",
      locale: "fr_FR",
      type: "website",
      images: [
        {
          url: "/images/og-spoolio.jpg",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og-spoolio.jpg"],
    },
  };
}
