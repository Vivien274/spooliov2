import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUniversePageData, generateUniverseMetadata } from "@/services/universeService";
import UniversePageView from "@/components/universe/UniversePageView";

const UNIVERSE_SLUG = "tactile";

export async function generateMetadata(): Promise<Metadata> {
  return generateUniverseMetadata(UNIVERSE_SLUG);
}

export default async function TactileUniversePage() {
  const data = await getUniversePageData(UNIVERSE_SLUG);

  if (!data) {
    notFound();
  }

  return <UniversePageView data={data} />;
}
