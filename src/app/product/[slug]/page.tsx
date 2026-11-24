import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/serverProducts";
import { getPackBySlug } from "@/lib/serverPacks";
import { buildPageMetadata, formatDescription } from "@/lib/seoMetadata";
import { renderProductDetailPage } from "./ProductPageServer";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    const pack = await getPackBySlug(slug);
    if (pack) {
      return buildPageMetadata({
        title: pack.name,
        description: formatDescription(
          pack.shortDescription || pack.description || "",
          `${pack.name} — Coffret imprimé en 3D à l'atelier Spoolio à Comines.`
        ),
        path: `/product/${slug}`,
        ogImage: pack.image,
        noIndex: pack.status !== "active",
      });
    }

    return {
      title: "Produit Introuvable | Spoolio",
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    title: product.name,
    description: formatDescription(
      product.short_description || product.description || "",
      `Découvrez ${product.name} imprimé en 3D avec soin dans notre atelier à Comines.`
    ),
    path: `/product/${slug}`,
    ogImage: product.images?.[0]?.src,
    noIndex: product.status !== "publish",
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  return renderProductDetailPage(slug, false);
}
