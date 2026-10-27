import type { Metadata } from "next";
import {
  generateCategoryRouteMetadata,
  renderCategoryRoute,
} from "@/components/taxonomy/CategoryRouteHelper";

const UNIVERSE_SLUG = "tabletop";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  return generateCategoryRouteMetadata(UNIVERSE_SLUG, category);
}

export default async function TabletopCategoryPage({ params }: PageProps) {
  const { category } = await params;
  return renderCategoryRoute(UNIVERSE_SLUG, category);
}
