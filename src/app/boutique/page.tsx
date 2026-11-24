import type { Metadata } from "next";
import BoutiqueClient from "./BoutiqueClient";
import { getPageSeoMetadata } from "@/lib/seoPages";
import { getPublishedProducts, slimProductForGrid } from "@/lib/serverProducts";
import { getFeaturedDrop } from "@/lib/serverDrops";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("boutique");
}

export default async function BoutiquePage() {
  const [rawProducts, featuredDrop] = await Promise.all([
    getPublishedProducts(),
    getFeaturedDrop(),
  ]);
  const initialProducts = rawProducts.map(slimProductForGrid);

  return (
    <BoutiqueClient
      initialProducts={initialProducts}
      featuredDrop={featuredDrop}
    />
  );
}
