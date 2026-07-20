import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Dynamically generate metadata for SEO from MySQL data or local JSON fallback
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let productName = "";
  let productDesc = "";
  let found = false;

  // 1. Try Prisma DB with an 800ms timeout race to avoid blocking on blocked hosts
  try {
    const product = await Promise.race([
      prisma.product.findUnique({ where: { slug } }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 800))
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
    title: `${productName} | Spoolio`,
    description: productDesc,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
