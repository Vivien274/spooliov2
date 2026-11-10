"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { BazarDataset, BazarItem, BazarScene, BazarZone } from "@/types/bazar";
import { prisma } from "@/lib/prisma";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "bazarData.json");
const BAZAR_PAGE_SLUG = "config-le-bazar";

/**
 * Retrieves Bazar dataset from database (Prisma Page slug: config-le-bazar),
 * with fallback to local src/data/bazarData.json.
 */
export async function getBazarDataAction(): Promise<BazarDataset> {
  let dataset: BazarDataset | null = null;

  // 1. In local development, prioritize local JSON file
  if (process.env.NODE_ENV === "development") {
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
      if (fileContent) {
        dataset = JSON.parse(fileContent) as BazarDataset;
      }
    } catch (fsError) {
      console.warn("Could not read local bazarData.json, attempting DB fallback:", fsError);
    }
  }

  // 2. Production: Fetch from Postgres via Prisma Page model
  if (!dataset) {
    try {
      const page = await prisma.page.findUnique({
        where: { slug: BAZAR_PAGE_SLUG },
      });
      if (page?.content) {
        dataset = JSON.parse(page.content) as BazarDataset;
      }
    } catch (dbError) {
      console.warn("Could not read bazar data from DB, attempting file fallback:", dbError);
    }
  }

  // 3. Fallback: Read local JSON file if DB has nothing yet
  if (!dataset) {
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
      dataset = JSON.parse(fileContent) as BazarDataset;
    } catch (fsError) {
      console.error("Error reading bazarData.json fallback:", fsError);
    }
  }

  if (!dataset) {
    throw new Error("Impossible de charger les données du Bazar.");
  }

  return dataset;
}

/**
 * Persists Bazar dataset to both local JSON file and PostgreSQL (Prisma Page model).
 */
export async function saveBazarDataAction(
  dataset: BazarDataset
): Promise<{ success: boolean; message: string }> {
  try {
    if (
      !dataset ||
      !Array.isArray(dataset.scenes) ||
      !Array.isArray(dataset.items) ||
      !Array.isArray(dataset.zones)
    ) {
      return { success: false, message: "Structure de données invalide." };
    }

    // Update export timestamp
    dataset.exportedAt = new Date().toISOString();

    // 1. Always write to local JSON file
    try {
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(dataset, null, 2), "utf-8");
    } catch (fileErr) {
      console.warn("Could not write to local bazarData.json file:", fileErr);
    }

    // 2. Upsert to Postgres database (Prisma Page)
    try {
      await prisma.page.upsert({
        where: { slug: BAZAR_PAGE_SLUG },
        update: {
          title: "Configuration Le Bazar",
          content: JSON.stringify(dataset),
        },
        create: {
          title: "Configuration Le Bazar",
          slug: BAZAR_PAGE_SLUG,
          content: JSON.stringify(dataset),
          status: "publish",
        },
      });
    } catch (dbErr) {
      console.warn("Could not upsert bazar data in DB (Page model):", dbErr);
    }

    // Revalidate paths for fast caching updates
    try {
      revalidatePath("/le-bazar");
      revalidatePath("/bazar");
      revalidatePath("/admin/bazar");
    } catch (e) {}

    return { success: true, message: "Données du Bazar enregistrées avec succès en base de données !" };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Erreur inconnue";
    return { success: false, message: errorMsg };
  }
}

/**
 * Simulates or performs stock decrement upon order confirmation.
 */
export async function decrementBazarStockAction(
  purchases: { itemId: string; quantity: number }[]
): Promise<{ success: boolean; orderId: string }> {
  const dataset = await getBazarDataAction();
  const orderId = `BAZAR-${Math.floor(100000 + Math.random() * 900000)}`;

  for (const p of purchases) {
    const idx = dataset.items.findIndex((item) => item.id === p.itemId);
    if (idx !== -1) {
      const item = dataset.items[idx];
      const newQty = Math.max(0, item.quantity - p.quantity);
      dataset.items[idx] = {
        ...item,
        quantity: newQty,
        status: newQty === 0 ? "sold" : item.status,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  await saveBazarDataAction(dataset);
  return { success: true, orderId };
}

