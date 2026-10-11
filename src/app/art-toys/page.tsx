import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUniversePageData, generateUniverseMetadata } from "@/services/universeService";
import UniversePageView from "@/components/universe/UniversePageView";

const UNIVERSE_SLUG = "art-toys";

export async function generateMetadata(): Promise<Metadata> {
  return generateUniverseMetadata(UNIVERSE_SLUG);
}

export default async function ArtToysUniversePage() {
  const data = await getUniversePageData(UNIVERSE_SLUG);

  if (!data) {
    notFound();
  }

  return <UniversePageView data={data} />;
}
