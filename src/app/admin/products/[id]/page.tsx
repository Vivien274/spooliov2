import type { Metadata } from "next";
import ProductFormClient from "./ProductFormClient";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Modifier le produit — Admin | Spoolio",
};

async function getProduct(id: string) {
  if (id === "new") return null;
  const numericId = parseInt(id);
  if (isNaN(numericId)) return null;

  // 1. Try Prisma DB first
  try {
    const p = await prisma.product.findUnique({
      where: { id: numericId },
      include: {
        images: true,
        categories: true,
      }
    });

    if (p) {
      let attributesObj = { attributes: [] as any[], variationPrices: [] as any[] };
      if (p.attributes) {
        try {
          const parsed = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes;
          if (Array.isArray(parsed)) {
            attributesObj.attributes = parsed;
          } else if (parsed && typeof parsed === 'object') {
            attributesObj = {
              attributes: parsed.attributes || [],
              variationPrices: parsed.variationPrices || [],
            };
          }
        } catch (e) {
          console.warn("Could not parse product attributes:", e);
        }
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription || "",
        description: p.description || "",
        category: p.categories[0]?.name || "Accessoires & Petits Objets",
        tags: [],
        price: p.price,
        salePrice: p.salePrice || "",
        productType: p.productType || "simple",
        status: p.status || "publish",
        stock: p.stock,
        metaTitle: p.name + " — Spoolio",
        metaDescription: p.shortDescription || p.name,
        images: p.images.map((img: any) => ({
          id: img.id,
          src: img.src,
          alt: img.alt || p.name
        })),
        attributes: attributesObj,
        variations: [],
      };
    }
  } catch (err: any) {
    console.error("Error loading product from Prisma DB in admin page:", err.message);
  }

  // 2. Try JSON file fallback
  try {
    const jsonPath = path.join(process.cwd(), "src/data/products.json");
    if (fs.existsSync(jsonPath)) {
      const fileData = fs.readFileSync(jsonPath, "utf8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        const match = parsed.find(p => p.id === numericId);
        if (match) {
          let attributesObj = { attributes: [] as any[], variationPrices: [] as any[] };
          if (match.attributes) {
            try {
              const parsed = typeof match.attributes === 'string' ? JSON.parse(match.attributes) : match.attributes;
              if (Array.isArray(parsed)) {
                attributesObj.attributes = parsed;
              } else if (parsed && typeof parsed === 'object') {
                attributesObj = {
                  attributes: parsed.attributes || [],
                  variationPrices: parsed.variationPrices || [],
                };
              }
            } catch (e) {
              console.warn("Could not parse JSON product attributes:", e);
            }
          }

          return {
            id: match.id,
            name: match.name,
            slug: match.slug,
            shortDescription: match.short_description || "",
            description: match.description || "",
            category: match.categories?.[0]?.name || "Accessoires & Petits Objets",
            tags: [],
            price: match.price || "0",
            salePrice: match.sale_price || "",
            productType: match.type || "simple",
            status: match.status || "publish",
            stock: match.stock_quantity || 10,
            metaTitle: match.name + " — Spoolio",
            metaDescription: match.short_description || match.name,
            images: (match.images || []).map((img: any, idx: number) => ({
              id: img.id || idx,
              src: img.src || "/images/figma_keychains.jpg",
              alt: img.alt || match.name
            })),
            attributes: attributesObj,
            variations: [],
          };
        }
      }
    }
  } catch (err: any) {
    console.error("Error loading product from JSON in admin page:", err.message);
  }

  return null;
}

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  return <ProductFormClient product={product} isNew={id === "new"} />;
}
