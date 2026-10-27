/**
 * Spoolio V2.1 — Category Page Data Service
 * 
 * Récupère de façon consolidée et performante les données d'une Catégorie :
 * - Catégorie & Univers parent (catalog_taxonomy)
 * - Navigation contextuelle vers les catégories sœurs du même univers
 * - Produits associés et actifs (product_taxonomy -> getPublishedProducts)
 * - Fallbacks éditoriaux locaux
 * - Métadonnées SEO dynamiques
 */

import type { Metadata } from "next";
import { getTaxonomies } from "@/services/taxonomyService";
import { getPublishedProducts } from "@/lib/serverProducts";
import { getSupabaseServerClient } from "@/lib/supabaseClient";
import fallbackData from "@/data/taxonomy_fallback.json";
import { CATEGORY_EDITORIAL_CONFIG } from "@/config/categoryEditorialConfig";
import type { CatalogTaxonomyItem } from "@/types/taxonomy";
import type { Product } from "@/components/ProductCard";

export interface SiblingCategoryInfo extends CatalogTaxonomyItem {
  productCount: number;
  url: string;
}

export interface CategoryPageData {
  category: CatalogTaxonomyItem & {
    editorialSubtitle: string;
    editorialDescription: string;
    tagline: string;
  };
  universe: CatalogTaxonomyItem;
  siblingCategories: SiblingCategoryInfo[];
  products: Product[];
  totalProducts: number;
}

const isProduction = process.env.NODE_ENV === "production";

/**
 * Récupère les IDs des produits associés à une taxonomie
 */
async function getTaxonomyProductIds(taxonomyId: number): Promise<number[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data: rows, error } = await supabase
      .from("product_taxonomy")
      .select("product_id")
      .eq("taxonomy_id", taxonomyId);

    if (error || !rows) {
      console.warn(`[Taxonomy Service] getTaxonomyProductIds repli fallback:`, error?.message);
      return (fallbackData.productTaxonomy as any[])
        .filter((pt) => pt.taxonomy_id === taxonomyId)
        .map((pt) => pt.product_id);
    }

    return rows.map((r: any) => r.product_id);
  } catch (err: any) {
    console.warn(`[Taxonomy Service] getTaxonomyProductIds exception, repli fallback:`, err.message);
    return (fallbackData.productTaxonomy as any[])
      .filter((pt) => pt.taxonomy_id === taxonomyId)
      .map((pt) => pt.product_id);
  }
}

/**
 * Récupère le nombre de produits pour chaque catégorie sœur
 */
async function getTaxonomyProductCounts(taxonomyIds: number[]): Promise<Record<number, number>> {
  const counts: Record<number, number> = {};
  taxonomyIds.forEach((id) => {
    counts[id] = 0;
  });

  if (taxonomyIds.length === 0) return counts;

  try {
    const supabase = getSupabaseServerClient();
    const { data: rows, error } = await supabase
      .from("product_taxonomy")
      .select("product_id, taxonomy_id")
      .in("taxonomy_id", taxonomyIds);

    if (error || !rows) {
      console.warn(`[Taxonomy Service] getTaxonomyProductCounts repli fallback:`, error?.message);
      (fallbackData.productTaxonomy as any[])
        .filter((pt) => taxonomyIds.includes(pt.taxonomy_id))
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
    console.warn(`[Taxonomy Service] getTaxonomyProductCounts exception, repli fallback:`, err.message);
    (fallbackData.productTaxonomy as any[])
      .filter((pt) => taxonomyIds.includes(pt.taxonomy_id))
      .forEach((pt) => {
        counts[pt.taxonomy_id] = (counts[pt.taxonomy_id] || 0) + 1;
      });
    return counts;
  }
}

/**
 * Récupère l'ensemble des données d'une catégorie
 */
export async function getCategoryPageData(
  universeSlug: string,
  categorySlug: string
): Promise<CategoryPageData | null> {
  const allTaxonomies = await getTaxonomies();

  // 1. Trouver l'univers parent
  const universe = allTaxonomies.find(
    (item) => item.type === "universe" && item.slug === universeSlug
  );

  if (!universe) {
    return null;
  }

  // 2. Trouver la catégorie demandée
  const category = allTaxonomies.find(
    (item) =>
      item.type === "category" &&
      item.slug === categorySlug &&
      item.parent_id === universe.id &&
      item.is_active
  );

  if (!category) {
    return null;
  }

  // 3. Trouver les catégories sœurs (même univers parent, actives)
  const siblingCategoriesRaw = allTaxonomies
    .filter(
      (item) =>
        item.type === "category" &&
        item.parent_id === universe.id &&
        item.is_active
    )
    .sort((a, b) => (a.sort_order ?? 10) - (b.sort_order ?? 10));

  const siblingIds = siblingCategoriesRaw.map((c) => c.id);

  // 4. Charger en parallèle les mappings et les produits publiés
  const [productIds, countsMap, allPublishedProducts] = await Promise.all([
    getTaxonomyProductIds(category.id),
    getTaxonomyProductCounts(siblingIds),
    getPublishedProducts(),
  ]);

  const targetIdSet = new Set(productIds);

  // Filtrer les produits actifs
  const categoryProducts = allPublishedProducts.filter((product) =>
    targetIdSet.has(product.id) && (product.status === "publish" || !product.status)
  );

  // Structurer les catégories sœurs avec URLs appropriées
  const siblingCategories: SiblingCategoryInfo[] = siblingCategoriesRaw.map((sib) => {
    // Cas spécial obligatoire : Cabinet noir pointe vers /collections/cabinet-noir
    const url =
      sib.slug === "cabinet-noir"
        ? "/collections/cabinet-noir"
        : `/${universeSlug}/${sib.slug}`;

    return {
      ...sib,
      productCount: countsMap[sib.id] || 0,
      url,
    };
  });

  // Fallbacks éditoriaux
  const fallback = CATEGORY_EDITORIAL_CONFIG[categorySlug];

  const enrichedCategory = {
    ...category,
    editorialSubtitle:
      category.subtitle ||
      fallback?.subtitle ||
      `Créations de la catégorie ${category.name}`,
    editorialDescription:
      category.description ||
      fallback?.description ||
      "",
    tagline: fallback?.tagline || `// CATÉGORIE ${category.name.toUpperCase()}`,
  };

  return {
    category: enrichedCategory,
    universe,
    siblingCategories,
    products: categoryProducts,
    totalProducts: categoryProducts.length,
  };
}

/**
 * Génère les métadonnées SEO dynamiques pour une page catégorie
 */
export async function generateCategoryMetadata(
  universeSlug: string,
  categorySlug: string
): Promise<Metadata> {
  const allTaxonomies = await getTaxonomies();

  const category = allTaxonomies.find(
    (item) => item.type === "category" && item.slug === categorySlug
  );

  const fallback = CATEGORY_EDITORIAL_CONFIG[categorySlug];

  const title =
    category?.seo_title ||
    `${category?.name || "Catégorie"} — Spoolio`;

  const description =
    category?.seo_description ||
    fallback?.description ||
    category?.description ||
    fallback?.subtitle ||
    `Découvrez les créations ${category?.name} conçues et fabriquées dans l'atelier Spoolio.`;

  const canonicalUrl = `https://www.spoolio.fr/${universeSlug}/${categorySlug}`;

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
