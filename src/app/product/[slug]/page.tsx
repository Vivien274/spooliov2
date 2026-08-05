import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Dynamically generate metadata for SEO from MySQL data or local JSON fallback
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "clicker-mecanique-sur-mesure") {
    return {
      title: "Créateur de Clicker 3D Sur-Mesure | Spoolio",
      description: "Personnalisez votre clicker mécanique 3D sur-mesure avec vos couleurs, formes, switchs et symboles.",
    };
  }

  let productName = "";
  let productDesc = "";
  let found = false;

  // 1. Try Prisma DB with an 800ms timeout race to avoid blocking on blocked hosts
  try {
    const product = await Promise.race([
      prisma.product.findUnique({ where: { slug } }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 5000))
    ]) as any;

    if (product) {
      productName = product.metaTitle || product.name;
      productDesc = product.metaDescription || product.shortDescription?.replace(/<[^>]*>/g, '') || `Découvrez le produit ${product.name} imprimé en 3D par Spoolio.`;
      found = true;
    }
  } catch (e) {
    console.warn("DB metadata fetch failed or timed out, trying JSON fallback...");
  }

  // 2. Try products.json fallback
  if (!found) {
    try {
      const jsonPath = path.join(process.cwd(), "src/data/products.json");
      if (fs.existsSync(jsonPath)) {
        const fileData = fs.readFileSync(jsonPath, "utf8");
        const parsed = JSON.parse(fileData);
        if (Array.isArray(parsed)) {
          const match = parsed.find(p => p.slug === slug || String(p.id) === slug);
          if (match) {
            productName = match.name;
            productDesc = (match.short_description || match.description || "").replace(/<[^>]*>/g, '').substring(0, 160) || `Découvrez le produit ${match.name} imprimé en 3D par Spoolio.`;
            found = true;
          }
        }
      }
    } catch (jsonErr: any) {
      console.warn("JSON metadata fallback failed:", jsonErr.message);
    }
  }

  // 3. Fallback metadata names
  if (!found) {
    const fallbackTitles: Record<string, string> = {
      "pack-alien-capsule": "Pack Alien / Capsule",
      "support-telephone-industriel": "Support Téléphone Industriel",
      "chat-goofy": "Chat Goofy",
      "support-clavier-mecanique": "Support Clavier Mécanique",
      "porte-cles-nfc-spoolio": "Porte-clés NFC Spoolio",
      "marcel-le-poulpe-fidget": "Marcel le Poulpe Fidget",
    };

    productName = fallbackTitles[slug] || "Produit";
    productDesc = `Découvrez le produit ${productName} imprimé en 3D par Spoolio.`;
  }

  return {
    metadataBase: new URL("https://spoolio.fr"),
    alternates: {
      canonical: `https://spoolio.fr/product/${slug}`,
    },
    title: `${productName} | Spoolio`,
    description: productDesc,
  };
}

import JsonLdScript from "@/components/JsonLdScript";
import { getProductJsonLd, getBreadcrumbJsonLd } from "@/lib/jsonLd";

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "clicker-mecanique-sur-mesure") {
    redirect("/createur-cliqueur");
  }

  const productName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const productLd = getProductJsonLd({
    name: productName,
    description: `Découvrez le produit ${productName} imprimé en 3D de haute qualité par Spoolio à Comines.`,
    slug: slug,
    price: 5.00,
    ratingValue: 4.9,
    reviewCount: 48
  });

  const breadcrumbLd = getBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Boutique", url: "/boutique" },
    { name: productName, url: `/product/${slug}` }
  ]);

  return (
    <>
      <JsonLdScript data={productLd} id={`product-jsonld-${slug}`} />
      <JsonLdScript data={breadcrumbLd} id={`breadcrumb-jsonld-${slug}`} />
      <ProductDetailClient slug={slug} />
    </>
  );
}
