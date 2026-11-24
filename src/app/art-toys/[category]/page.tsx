import type { Metadata } from "next";
import {
  generateCategoryRouteMetadata,
  renderCategoryRoute,
} from "@/components/taxonomy/CategoryRouteHelper";

const UNIVERSE_SLUG = "art-toys";
export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  return generateCategoryRouteMetadata(UNIVERSE_SLUG, category);
}

export default async function ArtToysCategoryPage({ params }: PageProps) {
  const { category } = await params;
  return renderCategoryRoute(UNIVERSE_SLUG, category);
}
