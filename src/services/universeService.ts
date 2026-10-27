/**
 * Spoolio V2.1 — Universe Page Data Service
 * 
 * Récupère de façon consolidée et performante les données d'un Univers :
 * - Informations de l'univers (Supabase catalog_taxonomy + fallback éditorial)
 * - Catégories enfants (parent_id = universe.id)
 * - Produits associés et actifs (product_taxonomy -> getPublishedProducts)
 * - Métadonnées SEO dynamiques
 */

import type { Metadata } from "next";
import { getTaxonomies } from "@/services/taxonomyService";
import { getPublishedProducts } from "@/lib/serverProducts";
import { getSupabaseServerClient } from "@/lib/supabaseClient";
import fallbackData from "@/data/taxonomy_fallback.json";
import {
  UNIVERSE_EDITORIAL_CONFIG,
  UniverseEditorial,
} from "@/config/universeEditorialConfig";
import type { CatalogTaxonomyItem } from "@/types/taxonomy";
import type { Product } from "@/components/ProductCard";

export interface UniversePageData {
  universe: CatalogTaxonomyItem & {
    editorialSubtitle: string;
    editorialDescription: string;
    tagline: string;
  };
  categories: CatalogTaxonomyItem[];
  categoryProductMap: Record<number, number[]>;
  products: Product[];
  totalProducts: number;
}

const isProduction = process.env.NODE_ENV === "production";

/**
 * Récupère les IDs des produits associés à un univers
 */
async function getUniverseProductIds(universeId: number): Promise<number[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data: rows, error } = await supabase
      .from("product_taxonomy")
      .select("product_id")
      .eq("taxonomy_id", universeId);

    if (error || !rows) {
      console.warn(`[Taxonomy Service] getUniverseProductIds repli fallback:`, error?.message);
      return (fallbackData.productTaxonomy as any[])
        .filter((pt) => pt.taxonomy_id === universeId)
        .map((pt) => pt.product_id);
    }

    return rows.map((r: any) => r.product_id);
  } catch (err: any) {
    console.warn(`[Taxonomy Service] getUniverseProductIds exception, repli fallback:`, err.message);
    return (fallbackData.productTaxonomy as any[])
      .filter((pt) => pt.taxonomy_id === universeId)
      .map((pt) => pt.product_id);
  }
}

/**
 * Récupère les IDs des produits associés à chaque catégorie enfant
 */
async function getCategoryProductMap(categoryIds: number[]): Promise<Record<number, number[]>> {
  const map: Record<number, number[]> = {};
  categoryIds.forEach((id) => {
    map[id] = [];
  });

  if (categoryIds.length === 0) return map;

  try {
    const supabase = getSupabaseServerClient();
    const { data: rows, error } = await supabase
      .from("product_taxonomy")
      .select("product_id, taxonomy_id")
      .in("taxonomy_id", categoryIds);

    if (error || !rows) {
      console.warn(`[Taxonomy Service] getCategoryProductMap repli fallback:`, error?.message);
      (fallbackData.productTaxonomy as any[])
        .filter((pt) => categoryIds.includes(pt.taxonomy_id))
        .forEach((pt) => {
          if (!map[pt.taxonomy_id]) map[pt.taxonomy_id] = [];
          map[pt.taxonomy_id].push(pt.product_id);
        });
      return map;
    }

    rows.forEach((r: any) => {
      if (!map[r.taxonomy_id]) map[r.taxonomy_id] = [];
      map[r.taxonomy_id].push(r.product_id);
    });
    return map;
  } catch (err: any) {
    console.warn(`[Taxonomy Service] getCategoryProductMap exception, repli fallback:`, err.message);
    (fallbackData.productTaxonomy as any[])
      .filter((pt) => categoryIds.includes(pt.taxonomy_id))
      .forEach((pt) => {
        if (!map[pt.taxonomy_id]) map[pt.taxonomy_id] = [];
        map[pt.taxonomy_id].push(pt.product_id);
      });
    return map;
  }
}

/**
 * Récupère l'ensemble des données d'un univers pour le moteur de page
 */
export async function getUniversePageData(slug: string): Promise<UniversePageData | null> {
  // 1. Récupérer toutes les taxonomies
  const allTaxonomies = await getTaxonomies();

  // 2. Trouver l'univers correspondant
  const universeItem = allTaxonomies.find(
    (item) => item.type === "universe" && item.slug === slug
  );

  if (!universeItem) {
    return null;
  }

  // 3. Récupérer les catégories enfants (parent_id = universe.id et is_active)
  const childCategories = allTaxonomies
    .filter(
      (item) =>
        item.type === "category" &&
        item.parent_id === universeItem.id &&
        item.is_active
    )
    .sort((a, b) => (a.sort_order ?? 10) - (b.sort_order ?? 10));

  const childCategoryIds = childCategories.map((c) => c.id);

  // 4. Récupérer les IDs de produits associés, le mapping catégorie-produit, et les produits publiés en parallèle
  const [universeProductIds, categoryProductMap, allPublishedProducts] = await Promise.all([
    getUniverseProductIds(universeItem.id),
    getCategoryProductMap(childCategoryIds),
    getPublishedProducts(),
  ]);

  const targetIdSet = new Set(universeProductIds);

  // Filtrer les produits : seuls les produits associés à l'univers et actifs (publish)
  const universeProducts = allPublishedProducts.filter((product) =>
    targetIdSet.has(product.id) && (product.status === "publish" || !product.status)
  );

  // 5. Appliquer les fallbacks éditoriaux locaux si subtitle ou description sont vides
  const fallbackEditorial: UniverseEditorial | undefined = UNIVERSE_EDITORIAL_CONFIG[slug];

  const enrichedUniverse = {
    ...universeItem,
    editorialSubtitle:
      universeItem.subtitle ||
      fallbackEditorial?.subtitle ||
      "Collection contemporaine Spoolio",
    editorialDescription:
      universeItem.description ||
      fallbackEditorial?.description ||
      "",
    tagline: fallbackEditorial?.tagline || "// UNIVERS SPOOLIO V2.1",
  };

  return {
    universe: enrichedUniverse,
    categories: childCategories,
    categoryProductMap,
    products: universeProducts,
    totalProducts: universeProducts.length,
  };
}

/**
 * Génère les métadonnées SEO dynamiques pour un univers
 */
export async function generateUniverseMetadata(slug: string): Promise<Metadata> {
  const allTaxonomies = await getTaxonomies();
  const universe = allTaxonomies.find(
    (item) => item.type === "universe" && item.slug === slug
  );

  const fallback = UNIVERSE_EDITORIAL_CONFIG[slug];

  const title =
    universe?.seo_title ||
    fallback?.seoTitle ||
    `${universe?.name || "Univers"} — Spoolio`;

  const description =
    universe?.seo_description ||
    fallback?.seoDescription ||
    universe?.description ||
    fallback?.description ||
    "Objets 3D contemporains conçus et fabriqués dans l'atelier Spoolio.";

  const canonicalUrl = `https://www.spoolio.fr/${slug}`;

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
