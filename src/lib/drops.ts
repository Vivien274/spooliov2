import fs from "fs";
import path from "path";
import { Product } from "@/components/ProductCard";

export interface DropTheme {
  bgColor?: string;
  cardBgColor?: string;
  borderColor?: string;
  textColor?: string;
  subtitleColor?: string;
  accentColor?: string;
  titleFont?: string;
  bodyFont?: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

export interface Drop {
  id: string;
  slug: string;
  dropNumber?: string;
  dropName?: string;
  title: string;
  tagline: string;
  quote?: string;
  description: string;
  status: "upcoming" | "live" | "ended";
  startDate: string;
  endDate?: string;
  bannerImage: string;
  bannerVideo?: string;
  badge: string;
  themeColor?: string;
  theme?: DropTheme;
  editionSize?: number;
  productIds: number[];
  products?: Product[];
}

import { prisma } from "@/lib/prisma";
import { mapRawProduct } from "@/lib/serverProducts";

export function getDropsFromFile(): Drop[] {
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
 * Synchronise et publie automatiquement les drops et leurs produits associés
 * dès que la date de lancement (startDate) est atteinte ou dépassée.
 */
export async function syncAndAutoPublishDrops(drops: Drop[]): Promise<Drop[]> {
  const now = Date.now();
  let hasChanges = false;
  const productIdsToPublish: number[] = [];

  const updatedDrops: Drop[] = drops.map((d) => {
    const drop = { ...d };
    const startTime = drop.startDate ? new Date(drop.startDate).getTime() : 0;
    const endTime = drop.endDate ? new Date(drop.endDate).getTime() : 0;

    // Bascule automatique vers "live" si la date de lancement est atteinte
    if (drop.status === "upcoming" && startTime > 0 && now >= startTime) {
      drop.status = "live";
      hasChanges = true;
      if (drop.productIds && drop.productIds.length > 0) {
        productIdsToPublish.push(...drop.productIds);
      }
    } else if (drop.status === "live" && endTime > 0 && now >= endTime) {
      // Clôture automatique si la date de fin est dépassée
      drop.status = "ended";
      hasChanges = true;
    }

    return drop;
  });

  // Si au moins un drop a basculé vers "live", on publie automatiquement ses produits en DB
  if (productIdsToPublish.length > 0 && prisma) {
    try {
      await prisma.product.updateMany({
        where: { id: { in: productIdsToPublish } },
        data: { status: "publish" },
      });
      console.log(`[AutoDrop] ${productIdsToPublish.length} produits de drop automatiquement publiés :`, productIdsToPublish);
    } catch (dbErr) {
      console.error("[AutoDrop] Erreur lors de la publication automatique des produits :", dbErr);
    }
  }

  // Sauvegarde persistante des drops mis à jour en base de données
  if (hasChanges && prisma) {
    try {
      await prisma.page.upsert({
        where: { slug: "config-drops" },
        update: { content: JSON.stringify(updatedDrops, null, 2) },
        create: {
          title: "Configuration Drops",
          slug: "config-drops",
          content: JSON.stringify(updatedDrops, null, 2),
          status: "publish",
        },
      });
    } catch (saveErr) {
      console.warn("[AutoDrop] Sauvegarde DB config-drops échouée :", saveErr);
    }
  }

  return updatedDrops;
}

/**
 * Lit tous les drops depuis la base de données (Prisma) avec fallback sur drops.json,
 * et applique la vérification automatique de publication.
 */
export async function getAllDrops(): Promise<Drop[]> {
  let rawDrops: Drop[] = [];

  try {
    if (prisma) {
      const page = await prisma.page.findUnique({
        where: { slug: "config-drops" },
      });
      if (page && page.content) {
        const parsed = JSON.parse(page.content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawDrops = parsed;
        }
      }
    }
  } catch (error) {
    console.warn("Erreur lors de la lecture des drops depuis Prisma, fallback JSON:", error);
  }

  if (rawDrops.length === 0) {
    rawDrops = getDropsFromFile();
  }

  return syncAndAutoPublishDrops(rawDrops);
}

/**
 * Version synchrone pour les contextes où l'async n'est pas possible (fallback fichier)
 */
export function getAllDropsSync(): Drop[] {
  const drops = getDropsFromFile();
  const now = Date.now();
  return drops.map((d) => {
    const startTime = d.startDate ? new Date(d.startDate).getTime() : 0;
    if (d.status === "upcoming" && startTime > 0 && now >= startTime) {
      return { ...d, status: "live" };
    }
    return d;
  });
}

/**
 * Récupère le drop phare du moment (live en priorité, puis upcoming, sinon le plus récent)
 */
export async function getFeaturedDrop(): Promise<Drop | null> {
  const drops = await getAllDrops();
  if (drops.length === 0) return null;

  const live = drops.find((d) => d.status === "live");
  if (live) return live;

  const upcoming = drops.find((d) => d.status === "upcoming");
  if (upcoming) return upcoming;

  return drops[0];
}

/**
 * Récupère un drop par son slug et hydrate les produits associés depuis Prisma DB
 */
export async function getDropBySlug(slug: string): Promise<(Drop & { products: Product[] }) | null> {
  const drops = await getAllDrops();
  const drop = drops.find((d) => d.slug === slug);
  if (!drop) return null;

  let associatedProducts: Product[] = [];

  // 1. Charger les produits à jour depuis la base de données Prisma
  try {
    if (prisma && drop.productIds && drop.productIds.length > 0) {
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: drop.productIds } },
        include: {
          images: true,
          categories: true,
        },
      });

      if (dbProducts && dbProducts.length > 0) {
        const mapped = dbProducts.map(mapRawProduct);
        associatedProducts = drop.productIds
          .map((id) => mapped.find((p) => p.id === id))
          .filter((p): p is Product => Boolean(p));
      }
    }
  } catch (err) {
    console.warn("Erreur chargement produits drop depuis Prisma:", err);
  }

  // 2. Fallback products.json
  if (associatedProducts.length === 0 && drop.productIds && drop.productIds.length > 0) {
    try {
      const productsPath = path.join(process.cwd(), "src/data/products.json");
      if (fs.existsSync(productsPath)) {
        const allProducts = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
        associatedProducts = drop.productIds
          .map((id) => allProducts.find((p: any) => p.id === id))
          .filter(Boolean)
          .map(mapRawProduct);
      }
    } catch (error) {
      console.error("Erreur lecture products.json:", error);
    }
  }

  return {
    ...drop,
    products: associatedProducts,
  };
}
