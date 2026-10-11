/**
 * Spoolio Taxonomy V2.1 Types & Utilities
 * 
 * Fichier partagé Client & Serveur.
 * Ne contient AUCUNE logique d'accès aux bases de données, ni secrets, ni JSON de fallback.
 */

export type TaxonomyType = "universe" | "category" | "collection" | "tag";

export interface CatalogTaxonomyItem {
  id: number;
  type: TaxonomyType;
  name: string;
  slug: string;
  parent_id: number | null;
  subtitle: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  is_active: boolean;
  is_indexable: boolean;
  created_at?: string;
  updated_at?: string;
  // Computed / joined fields
  product_count?: number;
  parent_name?: string;
}

export interface ProductTaxonomyMapping {
  productId: number;
  universeId: number | null;
  universe?: CatalogTaxonomyItem | null;
  categoryId: number | null;
  category?: CatalogTaxonomyItem | null;
  collectionIds: number[];
  collections?: CatalogTaxonomyItem[];
  tagIds: number[];
  tags?: CatalogTaxonomyItem[];
}

export interface SaveProductTaxonomyPayload {
  universeId: number | null;
  categoryId: number | null;
  collectionIds: number[];
  tagIds: number[];
}

/**
 * Normalise un texte en slug URL propre
 */
export function normalizeSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
