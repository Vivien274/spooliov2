import fs from "fs";
import path from "path";
import { Product } from "@/components/ProductCard";

export interface Drop {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  status: "upcoming" | "live" | "ended";
  startDate: string;
  endDate?: string;
  bannerImage: string;
  badge: string;
  themeColor?: string;
  editionSize?: number;
  productIds: number[];
  products?: Product[];
}

/**
 * Lit tous les drops depuis le fichier drops.json
 */
export function getAllDrops(): Drop[] {
  try {
    const filePath = path.join(process.cwd(), "src/data/drops.json");
    if (!fs.existsSync(filePath)) return [];
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (Array.isArray(data)) {
      return data;
    }
  } catch (error) {
    console.error("Erreur lors de la lecture de src/data/drops.json:", error);
  }
  return [];
}

/**
 * Récupère le drop phare du moment (live en priorité, puis upcoming, sinon le plus récent)
 */
export function getFeaturedDrop(): Drop | null {
  const drops = getAllDrops();
  if (drops.length === 0) return null;

  const live = drops.find((d) => d.status === "live");
  if (live) return live;

  const upcoming = drops.find((d) => d.status === "upcoming");
  if (upcoming) return upcoming;

  return drops[0];
}

/**
 * Récupère un drop par son slug et hydrate les produits associés
 */
export function getDropBySlug(slug: string): (Drop & { products: Product[] }) | null {
  const drops = getAllDrops();
  const drop = drops.find((d) => d.slug === slug);
  if (!drop) return null;

  let allProducts: Product[] = [];
  try {
    const productsPath = path.join(process.cwd(), "src/data/products.json");
    if (fs.existsSync(productsPath)) {
      allProducts = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
    }
  } catch (error) {
    console.error("Erreur lecture products.json:", error);
  }

  // Filtrer les produits associés dans l'ordre spécifié
  const associatedProducts: Product[] = drop.productIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  return {
    ...drop,
    products: associatedProducts,
  };
}
