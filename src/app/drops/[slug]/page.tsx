import type { Metadata } from "next";
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
  const drop = getDropBySlug(slug);

  if (!drop) {
    return {
      title: "Drop Introuvable | Spoolio 3D",
    };
  }

  return {
    title: `${drop.title} | Drop Exclusif Spoolio`,
    description: drop.tagline || drop.description.slice(0, 160),
    openGraph: {
      title: `${drop.title} | Drop Exclusif Spoolio`,
      description: drop.tagline,
      images: [
        {
          url: drop.bannerImage.startsWith("http") ? drop.bannerImage : `https://spoolio.fr${drop.bannerImage}`,
          width: 1200,
          height: 630,
          alt: drop.title,
        },
      ],
    },
  };
}

export default async function DropDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const drop = getDropBySlug(slug);

  if (!drop) {
    notFound();
  }

  return <DropDetailClient drop={drop} />;
}
