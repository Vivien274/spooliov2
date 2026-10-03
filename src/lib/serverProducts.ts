import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { Product } from "@/components/ProductCard";

function decodeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&nbsp;/g, " ");
}

export function mapRawProduct(p: any): Product {
  const rawImages = p.images || [];
  const images = rawImages.map((img: any, idx: number) => ({
    id: img.id || idx,
    src: img.src || img.sourceUrl || img.source_url || "/images/figma_keychains.jpg",
    name: decodeHtml(img.name || p.name),
    alt: img.alt || p.name,
  }));

  let tagsList: string[] = [];
  let parsedAttributes: any = [];

  if (p.attributes) {
    try {
      const parsed = typeof p.attributes === "string" ? JSON.parse(p.attributes) : p.attributes;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        tagsList = parsed.tags || [];
        parsedAttributes = parsed;
      } else if (Array.isArray(parsed)) {
        parsedAttributes = { attributes: parsed, variationPrices: [] };
      }

      if (parsedAttributes && Array.isArray(parsedAttributes.attributes)) {
        parsedAttributes.attributes = parsedAttributes.attributes.map((attr: any) => ({
          ...attr,
          name: decodeHtml(attr.name),
          options: Array.isArray(attr.options)
            ? [...attr.options].sort((a: string, b: string) =>
                String(a).localeCompare(String(b), "fr", { sensitivity: "base", numeric: true })
              )
            : attr.options,
        }));
      }
    } catch (e) {
      console.warn("Could not parse attributes JSON:", e);
    }
  }

  if ((!tagsList || tagsList.length === 0) && p.tags) {
    tagsList = Array.isArray(p.tags)
      ? p.tags.map((t: any) => (typeof t === "object" ? t.name : t))
      : [];
  }

  let rawPrice = String(p.price || "").trim();
  let rawRegPrice = String(p.regularPrice || p.regular_price || p.price || "").trim();
  const isPriceZero = !rawPrice || rawPrice === "0" || rawPrice === "0.00" || parseFloat(rawPrice) === 0;

  if (isPriceZero) {
    if (parsedAttributes && Array.isArray(parsedAttributes.variationPrices)) {
      const validVarPrices = parsedAttributes.variationPrices
        .map((vp: any) => parseFloat(vp.price))
        .filter((priceNum: number) => !isNaN(priceNum) && priceNum > 0);

      if (validVarPrices.length > 0) {
        rawPrice = Math.min(...validVarPrices).toString();
        if (!rawRegPrice || rawRegPrice === "0" || parseFloat(rawRegPrice) === 0) {
          rawRegPrice = rawPrice;
        }
      }
    }
  }

  // Ne jamais inventer de prix de secours artificiel (ex: 4.00)
  if (!rawPrice) {
    rawPrice = "";
  }
  if (!rawRegPrice) {
    rawRegPrice = rawPrice;
  }

  return {
    id: p.id,
    name: decodeHtml(p.name),
    slug: p.slug,
    permalink: p.permalink || `/product/${p.slug}`,
    price: rawPrice,
    regular_price: rawRegPrice,
    sale_price: p.salePrice || p.sale_price || "",
    on_sale: !!(p.onSale || p.on_sale),
    categories: (p.categories || []).map((c: any) => ({
      id: c.id,
      name: decodeHtml(c.name || ""),
      slug: c.slug || c.name?.toLowerCase().replace(/\s+/g, "-") || "",
    })),
    images: images.length > 0 ? images : [{ id: 1, src: "/images/figma_keychains.jpg", name: decodeHtml(p.name), alt: p.name }],
    short_description: p.shortDescription || p.short_description || "",
    short_description_en: p.shortDescriptionEn || p.short_description_en || null,
    shortDescriptionEn: p.shortDescriptionEn || p.short_description_en || null,
    description: p.description || "",
    description_en: p.descriptionEn || p.description_en || null,
    descriptionEn: p.descriptionEn || p.description_en || null,
    name_en: p.nameEn || p.name_en || null,
    nameEn: p.nameEn || p.name_en || null,
    date_created: p.dateCreated ? new Date(p.dateCreated).toISOString() : (p.date_created ? new Date(p.date_created).toISOString() : undefined),
    attributes: parsedAttributes,
    tags: tagsList,
    badge: parsedAttributes?.badge ? String(parsedAttributes.badge).trim() : (p.badge || null),
    stock: typeof p.stock === "number" ? p.stock : (typeof p.stock_quantity === "number" ? p.stock_quantity : -1),
    status: p.status || "publish",
    productType: p.productType || "simple",
  };
}

/**
 * Fetch a single product by slug on the server (Prisma + fallback)
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  // 1. Try Prisma DB
  try {
    const dbProduct = await Promise.race([
      prisma.product.findUnique({
        where: { slug },
        include: {
          images: true,
          categories: true,
          reviews: {
            where: { approved: true },
            select: { id: true, rating: true, comment: true, customerName: true, createdAt: true },
          },
        },
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 3000)),
    ]);

    if (dbProduct) {
      return mapRawProduct(dbProduct);
    }
  } catch (err: any) {
    console.warn("Prisma query getProductBySlug failed:", err.message);
  }

  // 2. Try JSON fallback
  try {
    const jsonPath = path.join(process.cwd(), "src/data/products.json");
    if (fs.existsSync(jsonPath)) {
      const fileData = fs.readFileSync(jsonPath, "utf8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        const match = parsed.find((p) => p.slug === slug);
        if (match) {
          return mapRawProduct(match);
        }
      }
    }
  } catch (err: any) {
    console.warn("JSON fallback getProductBySlug failed:", err.message);
  }

  return null;
}

/**
 * Fetch all published products on the server
 */
export async function getPublishedProducts(): Promise<Product[]> {
  try {
    const dbProducts = await Promise.race([
      prisma.product.findMany({
        where: { status: "publish" },
        include: {
          images: true,
          categories: true,
        },
        orderBy: { dateCreated: "desc" },
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 4000)),
    ]);

    if (dbProducts && Array.isArray(dbProducts) && dbProducts.length > 0) {
      return dbProducts.map(mapRawProduct);
    }
  } catch (err: any) {
    console.warn("Prisma query getPublishedProducts failed:", err.message);
  }

  // JSON fallback
  try {
    const jsonPath = path.join(process.cwd(), "src/data/products.json");
    if (fs.existsSync(jsonPath)) {
      const fileData = fs.readFileSync(jsonPath, "utf8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((p) => p.status === "publish" || !p.status)
          .map(mapRawProduct);
      }
    }
  } catch (err: any) {
    console.warn("JSON fallback getPublishedProducts failed:", err.message);
  }

  return [];
}

/**
 * Fetch products for a category by name or slug
 */
export async function getCategoryProducts(categoryNameOrSlug: string): Promise<Product[]> {
  const decoded = decodeURIComponent(categoryNameOrSlug).trim();

  // 1. Try Prisma DB first
  try {
    const dbProducts = await prisma.product.findMany({
      where: {
        categories: {
          some: {
            OR: [
              { slug: { equals: decoded, mode: "insensitive" } },
              { name: { equals: decoded, mode: "insensitive" } },
              { name: { equals: decoded.replace(/&/g, "&amp;"), mode: "insensitive" } },
              { name: { equals: decoded.replace(/'/g, "&#039;").replace(/&/g, "&amp;"), mode: "insensitive" } },
              { name: { equals: decoded.replace(/'/g, "&#39;").replace(/&/g, "&amp;"), mode: "insensitive" } },
            ],
          },
        },
        status: "publish",
      },
      include: {
        images: true,
        categories: true,
      },
      orderBy: {
        dateCreated: "desc",
      },
    });

    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map(mapRawProduct);
    }
  } catch (err: any) {
    console.error("Prisma error fetching category products:", err.message);
  }

  // 2. Try JSON fallback
  try {
    const jsonPath = path.join(process.cwd(), "src/data/products.json");
    if (fs.existsSync(jsonPath)) {
      const fileData = fs.readFileSync(jsonPath, "utf8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((p) => {
          return (
            (p.status === "publish" || !p.status) &&
            p.categories?.some(
              (c: any) =>
                decodeHtml(c.name || "").toLowerCase() === decoded.toLowerCase() ||
                c.slug?.toLowerCase() === decoded.toLowerCase()
            )
          );
        });
        return filtered.map(mapRawProduct);
      }
    }
  } catch (err: any) {
    console.error("JSON fallback error for category products:", err.message);
  }

  return [];
}

/**
 * Fetch related products for a product
 */
export async function getRelatedProducts(slug: string, categoryId?: number): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "publish",
        slug: { not: slug },
        ...(categoryId ? { categories: { some: { id: categoryId } } } : {}),
      },
      include: {
        images: true,
        categories: true,
      },
      take: 4,
    });
    if (products.length > 0) {
      return products.map(mapRawProduct);
    }
  } catch (e) {}

  // Fallback to any published products
  const all = await getPublishedProducts();
  return all.filter((p) => p.slug !== slug).slice(0, 4);
}


