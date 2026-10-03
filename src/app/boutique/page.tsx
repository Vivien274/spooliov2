import type { Metadata } from "next";
import BoutiqueClient from "./BoutiqueClient";
import { getPageSeoMetadata } from "@/lib/seoPages";
import { getPublishedProducts } from "@/lib/serverProducts";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("boutique");
}

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; q?: string }>;
}) {
  const initialProducts = await getPublishedProducts();
  const params = searchParams ? await searchParams : {};

  return (
    <BoutiqueClient
      initialProducts={initialProducts}
      initialCategory={params.category}
      initialQuery={params.q}
    />
  );
}
