import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seoMetadata";
import { notFound } from "next/navigation";
import { getAllDrops, getDropBySlug } from "@/lib/drops";
import DropDetailClient from "./DropDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const drop = await getDropBySlug(slug);

  if (!drop) {
    return {
      title: "Drop Introuvable | Spoolio 3D",
      robots: { index: false, follow: false },
    };
  }

  const cleanName = drop.dropName || (drop.title ? drop.title.replace(/^DROP\s*\d*\s*—\s*/i, "").trim() : drop.title);
  const effectiveTagline = slug === "drop-kurb-monsters" ? "Trois gueules. Zéro règle. Trois pièces uniques faites à la main à Comines." : (drop.tagline || drop.description.slice(0, 160));

  return buildPageMetadata({
    title: `Drop - ${cleanName} | Spoolio`,
    description: effectiveTagline,
    path: `/drops/${slug}`,
    ogImage: drop.bannerImage,
  });
}

export default async function DropDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const drop = await getDropBySlug(slug);

  if (!drop) {
    notFound();
  }

  return <DropDetailClient drop={drop} />;
}
