import type { Metadata } from "next";
import { getAllDrops } from "@/lib/drops";
import DropsHubClient from "../drops/DropsHubClient";
import { getPageSeoMetadata } from "@/lib/seoPages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const base = getPageSeoMetadata("drops");
  return {
    ...base,
    title: "Nouveautés & Drops Exclusifs 3D | Spoolio",
    description:
      "Découvrez les nouveautés et les drops exclusifs Spoolio : séries limitées de fidgets, figurines d'atelier et créations imprimées en 3D à Comines.",
  };
}

export default async function NouveautesPage() {
  const drops = await getAllDrops();

  return <DropsHubClient drops={drops} />;
}
