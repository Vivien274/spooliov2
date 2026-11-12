import type { Metadata } from "next";
import { getAllDrops } from "@/lib/serverDrops";
import { getPublishedProducts } from "@/lib/serverProducts";
import NouveautesClient from "./NouveautesClient";
import { getPageSeoMetadata } from "@/lib/seoPages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const base = getPageSeoMetadata("nouveautes");
  return {
    ...base,
    title: "Nouveautés & Dernières Créations 3D | Spoolio",
    description:
      "Découvrez toutes les nouveautés imprimées en 3D à l'atelier Spoolio : fidgets tactiles, figurines d'atelier, curiosités et drops exclusifs.",
    alternates: {
      canonical: "https://www.spoolio.fr/nouveautes",
    },
    openGraph: {
      ...base.openGraph,
      url: "https://www.spoolio.fr/nouveautes",
      title: "Nouveautés & Dernières Créations 3D | Spoolio",
      description:
        "Découvrez toutes les nouveautés imprimées en 3D à l'atelier Spoolio : fidgets tactiles, figurines d'atelier, curiosités et drops exclusifs.",
    },
  };
}

export default async function NouveautesPage() {
  const [drops, products] = await Promise.all([
    getAllDrops(),
    getPublishedProducts(),
  ]);

  return <NouveautesClient drops={drops} products={products} />;
}
