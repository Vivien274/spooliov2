import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategoryPageData,
  generateCategoryMetadata,
} from "@/services/categoryService";
import CategoryPageView from "@/components/taxonomy/CategoryPageView";

export async function generateCategoryRouteMetadata(
  universeSlug: string,
  categorySlug: string
): Promise<Metadata> {
  return generateCategoryMetadata(universeSlug, categorySlug);
}

export async function renderCategoryRoute(
  universeSlug: string,
  categorySlug: string
) {
  // Note: La redirection permanente de /art-toys/cabinet-noir vers /collections/cabinet-noir
  // est gérée centralement par next.config.ts (HTTP 308).

  const data = await getCategoryPageData(universeSlug, categorySlug);

  if (!data) {
    notFound();
  }

  return <CategoryPageView data={data} />;
}
