import type { Metadata } from "next";
import { getAllDrops } from "@/lib/drops";
import DropsHubClient from "./DropsHubClient";
import { getPageSeoMetadata } from "@/lib/seoPages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const base = getPageSeoMetadata("drops");
  return {
    ...base,
    title: "Drops Exclusifs & Séries Limitées | Spoolio 3D",
    description: "Découvrez les drops exclusifs Spoolio : séries limitées de fidgets, figurines d'atelier peintes à la main et créations imprimées en 3D à Comines.",
  };
}

export default function DropsPage() {
  const drops = getAllDrops();

  return <DropsHubClient drops={drops} />;
}
