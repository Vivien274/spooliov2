import fs from "fs";
import path from "path";
import { Pack, PackComponent, PackagingType } from "@/types/packs";
import { getPublishedProducts } from "@/lib/serverProducts";
import { Product } from "@/components/ProductCard";
import { getSupabaseServerClient } from "@/lib/supabaseClient";

const PACKS_FILE_PATH = path.join(process.cwd(), "src/data/packs.json");

interface DbPackComponentRow {
  id: string;
  pack_id: string;
  product_id: number;
  variant?: string | null;
  quantity: number;
  display_order: number;
}

interface DbPackRow {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  short_description?: string | null;
  description?: string | null;
  image: string;
  gallery?: string[] | null;
  price: number;
  status: "active" | "draft" | "archived";
  start_date?: string | null;
  end_date?: string | null;
  max_quantity?: number | null;
  display_order: number;
  category: string;
  packaging_type: PackagingType;
  packaging_notes?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at?: string;
  updated_at?: string;
  pack_components?: DbPackComponentRow[];
}

function mapDbPackToPack(row: DbPackRow): Pack {
  const items: PackComponent[] = (row.pack_components || [])
    .map((c) => ({
      id: c.id,
      productId: c.product_id,
      variant: c.variant || null,
      quantity: c.quantity || 1,
      displayOrder: c.display_order || 0,
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline || "",
    shortDescription: row.short_description || "",
    description: row.description || "",
    image: row.image || "/images/clicker_gallery_2.jpg",
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    price: Number(row.price) || 0,
    status: row.status || "active",
    startDate: row.start_date || null,
    endDate: row.end_date || null,
    maxQuantity: row.max_quantity ?? null,
    displayOrder: row.display_order || 0,
    category: row.category || "bundles",
    packagingType: row.packaging_type || "boite_kraft",
    packagingNotes: row.packaging_notes || "",
    seoTitle: row.seo_title || "",
    seoDescription: row.seo_description || "",
    items,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getRawPacksFromFile(): Pack[] {
  try {
    if (!fs.existsSync(PACKS_FILE_PATH)) {
      return [];
    }
    const content = fs.readFileSync(PACKS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error("[serverPacks] Error reading packs.json:", error);
  }
  return [];
}

export function savePacksToFile(packs: Pack[]): boolean {
  try {
    fs.writeFileSync(PACKS_FILE_PATH, JSON.stringify(packs, null, 2), "utf-8");
    return true;
  } catch (error) {
    // Expected on serverless read-only filesystem (e.g., Vercel)
    console.warn("[serverPacks] Local packs.json write skipped:", (error as Error).message);
    return false;
  }
}

async function fetchPacksFromSupabase(): Promise<Pack[] | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("packs")
      .select("*, pack_components(*)")
      .order("display_order", { ascending: true });

    if (error) {
      console.warn("[serverPacks] Supabase fetch error (falling back to local JSON):", error.message);
      return null;
    }

    if (Array.isArray(data) && data.length > 0) {
      return (data as DbPackRow[]).map(mapDbPackToPack);
    }

    return [];
  } catch (err) {
    console.warn("[serverPacks] Supabase exception:", (err as Error).message);
    return null;
  }
}

async function getRawPacks(): Promise<Pack[]> {
  const dbPacks = await fetchPacksFromSupabase();
  if (dbPacks && dbPacks.length > 0) {
    return dbPacks;
  }
  // Fallback to local JSON seed if DB is empty or unreachable
  return getRawPacksFromFile();
}

/**
 * Hydrates a pack with live product details, computes total component value,
 * client savings, and availability based on stock rules.
 */
export async function hydratePack(pack: Pack, allProducts?: Product[]): Promise<Pack> {
  const products = allProducts || (await getPublishedProducts());
  const productMap = new Map<number, Product>();
  products.forEach((p) => productMap.set(p.id, p));

  let totalValue = 0;
  let minPackStock = Infinity;
  let allComponentsAvailable = true;

  const hydratedItems: PackComponent[] = pack.items.map((item) => {
    const prod = productMap.get(item.productId);
    const itemPrice = prod && prod.price ? parseFloat(prod.price) : (item.productPrice || 0);
    const itemQty = item.quantity > 0 ? item.quantity : 1;

    totalValue += itemPrice * itemQty;

    // Availability check
    if (prod) {
      if (typeof prod.stock === "number" && prod.stock >= 0) {
        const componentCanMake = Math.floor(prod.stock / itemQty);
        if (componentCanMake < minPackStock) {
          minPackStock = componentCanMake;
        }
        if (prod.stock <= 0) {
          allComponentsAvailable = false;
        }
      }
    }

    return {
      ...item,
      productName: prod ? prod.name : item.productName || `Produit #${item.productId}`,
      productSlug: prod ? prod.slug : item.productSlug || "",
      productPrice: itemPrice,
      productImage:
        prod && prod.images && prod.images.length > 0
          ? prod.images[0].src
          : item.productImage || "/images/figma_keychains.jpg",
    };
  });

  const roundedTotalValue = Math.round(totalValue * 100) / 100;
  const savings = Math.max(0, Math.round((roundedTotalValue - pack.price) * 100) / 100);
  const savingsPercent = roundedTotalValue > 0 ? Math.round((savings / roundedTotalValue) * 100) : 0;

  // Max quantity cap if configured
  if (typeof pack.maxQuantity === "number" && pack.maxQuantity > 0) {
    minPackStock = Math.min(minPackStock, pack.maxQuantity);
  }

  const effectiveStock = minPackStock === Infinity ? 999 : minPackStock;
  const isAvailable = pack.status === "active" && allComponentsAvailable && effectiveStock > 0;

  return {
    ...pack,
    items: hydratedItems,
    totalComponentsValue: roundedTotalValue,
    savingsAmount: savings,
    savingsPercentage: savingsPercent,
    isAvailable,
    availableStock: effectiveStock,
  };
}

export async function getAllPacks(includeInactive = false): Promise<Pack[]> {
  const rawPacks = await getRawPacks();
  const allProducts = await getPublishedProducts();

  const filtered = includeInactive
    ? rawPacks
    : rawPacks.filter((p) => p.status === "active");

  const hydrated = await Promise.all(filtered.map((p) => hydratePack(p, allProducts)));
  return hydrated.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getPackBySlug(slug: string): Promise<Pack | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("packs")
      .select("*, pack_components(*)")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      return hydratePack(mapDbPackToPack(data as DbPackRow));
    }
  } catch (err) {
    console.warn("[serverPacks] getPackBySlug Supabase fallback:", (err as Error).message);
  }

  const rawPacks = getRawPacksFromFile();
  const match = rawPacks.find((p) => p.slug === slug);
  if (!match) return null;
  return hydratePack(match);
}

export async function getPackById(id: string): Promise<Pack | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("packs")
      .select("*, pack_components(*)")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return hydratePack(mapDbPackToPack(data as DbPackRow));
    }
  } catch (err) {
    console.warn("[serverPacks] getPackById Supabase fallback:", (err as Error).message);
  }

  const rawPacks = getRawPacksFromFile();
  const match = rawPacks.find((p) => p.id === id);
  if (!match) return null;
  return hydratePack(match);
}

export async function savePack(data: Partial<Pack> & { name: string; price: number }): Promise<Pack> {
  const existingPacks = await getRawPacks();
  const now = new Date().toISOString();

  const id = data.id || `pack_${Date.now()}`;
  const slug =
    data.slug ||
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    id;

  const existing = existingPacks.find((p) => p.id === id || p.slug === slug);

  const packRecord: Pack = {
    id,
    name: data.name,
    slug,
    tagline: data.tagline || "",
    shortDescription: data.shortDescription || "",
    description: data.description || "",
    image:
      data.image ||
      (data.items && data.items.length > 0 && data.items[0].productImage
        ? data.items[0].productImage
        : "/images/clicker_gallery_2.jpg"),
    gallery: data.gallery || [],
    price: data.price,
    status: data.status || "active",
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    maxQuantity: data.maxQuantity ?? null,
    displayOrder:
      typeof data.displayOrder === "number" ? data.displayOrder : existingPacks.length + 1,
    category: data.category || "bundles",
    packagingType: data.packagingType || "boite_kraft",
    packagingNotes: data.packagingNotes || "",
    seoTitle: data.seoTitle || `Pack ${data.name} — Spoolio`,
    seoDescription: data.seoDescription || data.shortDescription || "",
    items: (data.items || []).map((it, idx) => ({
      ...it,
      id: it.id || `comp_${id}_${it.productId}_${idx + 1}`,
      displayOrder: it.displayOrder || idx + 1,
    })),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  // 1. Persist to Supabase
  const supabase = getSupabaseServerClient();
  const { error: upsertError } = await supabase.from("packs").upsert(
    {
      id: packRecord.id,
      name: packRecord.name,
      slug: packRecord.slug,
      tagline: packRecord.tagline || null,
      short_description: packRecord.shortDescription || null,
      description: packRecord.description || null,
      image: packRecord.image,
      gallery: packRecord.gallery || [],
      price: packRecord.price,
      status: packRecord.status,
      start_date: packRecord.startDate || null,
      end_date: packRecord.endDate || null,
      max_quantity: packRecord.maxQuantity ?? null,
      display_order: packRecord.displayOrder,
      category: packRecord.category,
      packaging_type: packRecord.packagingType,
      packaging_notes: packRecord.packagingNotes || null,
      seo_title: packRecord.seoTitle || null,
      seo_description: packRecord.seoDescription || null,
      updated_at: now,
    },
    { onConflict: "id" }
  );

  if (upsertError) {
    throw new Error(`Erreur Supabase lors de la sauvegarde du pack : ${upsertError.message}`);
  }

  // Replace components for this pack
  const { error: deleteCompError } = await supabase
    .from("pack_components")
    .delete()
    .eq("pack_id", packRecord.id);

  if (deleteCompError) {
    throw new Error(`Erreur Supabase (suppression anciens composants) : ${deleteCompError.message}`);
  }

  if (packRecord.items.length > 0) {
    const componentRows = packRecord.items.map((item, idx) => ({
      id: item.id || `comp_${packRecord.id}_${item.productId}_${idx + 1}`,
      pack_id: packRecord.id,
      product_id: item.productId,
      variant: item.variant || null,
      quantity: item.quantity > 0 ? item.quantity : 1,
      display_order: item.displayOrder || idx + 1,
    }));

    const { error: insertCompError } = await supabase
      .from("pack_components")
      .insert(componentRows);

    if (insertCompError) {
      throw new Error(`Erreur Supabase (insertion composants) : ${insertCompError.message}`);
    }
  }

  // 2. Keep local JSON in sync when filesystem is writable (dev)
  const localPacks = getRawPacksFromFile();
  const localIdx = localPacks.findIndex((p) => p.id === id || p.slug === slug);
  if (localIdx >= 0) {
    localPacks[localIdx] = packRecord;
  } else {
    localPacks.push(packRecord);
  }
  savePacksToFile(localPacks);

  return hydratePack(packRecord);
}

export async function deletePack(id: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("packs").delete().eq("id", id);

  if (error) {
    console.error("[serverPacks] Supabase delete error:", error.message);
    return false;
  }

  // Also sync local JSON if present
  const rawPacks = getRawPacksFromFile();
  const filtered = rawPacks.filter((p) => p.id !== id && p.slug !== id);
  if (filtered.length !== rawPacks.length) {
    savePacksToFile(filtered);
  }

  return true;
}
