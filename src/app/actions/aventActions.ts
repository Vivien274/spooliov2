"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { AdventData, AdventObjectItem, PackagingItem, AdventConfig } from "@/types/avent";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "aventData.json");

/**
 * Helper to read local JSON data.
 */
export async function getAdventDataAction(): Promise<AdventData> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(fileContent) as AdventData;
  } catch (error) {
    console.error("Error reading aventData.json:", error);
    throw new Error("Impossible de lire les données du calendrier de l'Avent");
  }
}

/**
 * Helper to write updated local JSON data.
 */
async function saveAdventData(data: AdventData): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing aventData.json:", error);
    throw new Error("Impossible de sauvegarder les données du calendrier de l'Avent");
  }
}

/**
 * Update global config (title, prices, dates).
 */
export async function updateAdventConfigAction(newConfig: Partial<AdventConfig>): Promise<AdventData> {
  const data = await getAdventDataAction();
  data.config = { ...data.config, ...newConfig };
  await saveAdventData(data);
  revalidatePath("/admin/calendrier-avent");
  revalidatePath("/calendrier-avent");
  return data;
}

/**
 * Update a specific day object in the advent calendar pipeline.
 */
export async function updateAdventObjectAction(updatedObject: AdventObjectItem): Promise<AdventData> {
  const data = await getAdventDataAction();
  const index = data.objects.findIndex((obj) => obj.day === updatedObject.day);
  if (index !== -1) {
    data.objects[index] = { ...data.objects[index], ...updatedObject };
  } else {
    data.objects.push(updatedObject);
    data.objects.sort((a, b) => a.day - b.day);
  }
  await saveAdventData(data);
  revalidatePath("/admin/calendrier-avent");
  revalidatePath("/calendrier-avent");
  return data;
}

/**
 * Update or add a packaging item.
 */
export async function savePackagingItemAction(packagingItem: PackagingItem): Promise<AdventData> {
  const data = await getAdventDataAction();
  const index = data.packaging.findIndex((item) => item.id === packagingItem.id);
  if (index !== -1) {
    data.packaging[index] = packagingItem;
  } else {
    data.packaging.push(packagingItem);
  }
  await saveAdventData(data);
  revalidatePath("/admin/calendrier-avent");
  return data;
}

/**
 * Delete a packaging item.
 */
export async function deletePackagingItemAction(id: string): Promise<AdventData> {
  const data = await getAdventDataAction();
  data.packaging = data.packaging.filter((item) => item.id !== id);
  await saveAdventData(data);
  revalidatePath("/admin/calendrier-avent");
  return data;
}

/**
 * Increment like count for a specific advent object.
 */
export async function likeAdventObjectAction(day: number): Promise<AdventData> {
  const data = await getAdventDataAction();
  const obj = data.objects.find((o) => o.day === day);
  if (obj) {
    obj.likesCount = (obj.likesCount || 0) + 1;
    await saveAdventData(data);
    revalidatePath("/calendrier-avent");
  }
  return data;
}
