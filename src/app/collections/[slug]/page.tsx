import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCollectionPageData,
  generateCollectionMetadata,
} from "@/services/collectionService";
import CollectionPageView from "@/components/taxonomy/CollectionPageView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return generateCollectionMetadata(slug);
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCollectionPageData(slug);

  if (!data) {
    notFound();
  }

  return <CollectionPageView data={data} />;
}
