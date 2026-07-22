import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

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

function mapProduct(p: any) {
  // Clean images structure to match what ProductCard expects
  const rawImages = p.images || [];
  const images = rawImages.map((img: any, idx: number) => ({
    id: img.id || idx,
    src: img.src || img.sourceUrl || img.source_url || "/images/figma_keychains.jpg",
    name: decodeHtml(img.name || p.name),
    alt: img.alt || p.name
  }));

  let tagsList: string[] = [];
  let parsedAttributes: any = [];

  if (p.attributes) {
    try {
      const parsed = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        tagsList = parsed.tags || [];
        parsedAttributes = parsed; // Keep the whole parsed object (with variationPrices) instead of throwing it away
      } else if (Array.isArray(parsed)) {
        parsedAttributes = parsed;
      }
    } catch (e) {
      console.warn("Could not parse attributes/tags JSON:", e);
    }
  }

  // Fallback for tags if directly provided
  if ((!tagsList || tagsList.length === 0) && p.tags) {
    tagsList = Array.isArray(p.tags)
      ? p.tags.map((t: any) => typeof t === 'object' ? t.name : t)
      : [];
  }

  return {
    id: p.id,
    name: decodeHtml(p.name),
    slug: p.slug,
    permalink: p.permalink,
    price: p.price || "4.00",
    regular_price: p.regularPrice || p.regular_price || p.price || "4.00",
    sale_price: p.salePrice || p.sale_price || "",
    on_sale: !!(p.onSale || p.on_sale),
    categories: (p.categories || []).map((c: any) => ({
      ...c,
      name: decodeHtml(c.name || "")
    })),
    images: images.length > 0 ? images : [{ id: 1, src: "/images/figma_keychains.jpg", name: decodeHtml(p.name), alt: p.name }],
    short_description: p.shortDescription || p.short_description || "",
    description: p.description || "",
    date_created: p.dateCreated ? new Date(p.dateCreated).toISOString() : (p.date_created ? new Date(p.date_created).toISOString() : null),
    attributes: parsedAttributes,
    tags: tagsList,
    stock: typeof p.stock === 'number' ? p.stock : (typeof p.stock_quantity === 'number' ? p.stock_quantity : -1),
    status: p.status || "publish",
  };
}

// Resilient product fetcher
async function fetchAllProducts(status: string) {
  const wcUrl = process.env.NEXT_PUBLIC_WC_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  // 1. Try Prisma Database client first (with a timeout race)
  try {
    console.log(`Attempting Prisma Database fetch with status filter: ${status}...`);
    const dbProducts = await Promise.race([
      prisma.product.findMany({
        where: status === 'all' ? {} : {
          status: {
            in: ['publish', '']
          }
        },
        include: {
          images: true,
          categories: true,
        },
        orderBy: {
          dateCreated: 'desc',
        },
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 5000))
    ]) as any;

    if (dbProducts && dbProducts.length > 0) {
      console.log("Successfully fetched products from Prisma Database.");
      return dbProducts.map(mapProduct);
    }
  } catch (e: any) {
    console.warn("Prisma query failed or timed out, trying local JSON...", e.message);
  }

  // 2. Try Local JSON file fallback next (to get local modifications)
  try {
    const jsonPath = path.join(process.cwd(), 'src/data/products.json');
    if (fs.existsSync(jsonPath)) {
      console.log("Attempting Local products.json fetch...");
      const fileData = fs.readFileSync(jsonPath, 'utf8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log("Successfully fetched products from Local products.json.");
        const filtered = status === 'all'
          ? parsed
          : parsed.filter((p: any) => p.status === 'publish' || !p.status);
        return filtered.map(mapProduct);
      }
    }
  } catch (e: any) {
    console.warn("Failed to load local products.json, trying WooCommerce API...", e.message);
  }

  // 3. Try WooCommerce REST API directly as a backup
  if (wcUrl && consumerKey && consumerSecret) {
    try {
      console.log("Attempting WooCommerce API fetch...");
      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
      const response = await fetch(`${wcUrl.replace(/\/$/, '')}/wp-json/wc/v3/products?per_page=50`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 60 } // Cache for 60 seconds
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          console.log("Successfully fetched products from WooCommerce API.");
          const filtered = status === 'all'
            ? data
            : data.filter((p: any) => p.status === 'publish' || !p.status);
          return filtered.map(mapProduct);
        }
      } else {
        console.warn(`WooCommerce API returned status ${response.status}`);
      }
    } catch (e: any) {
      console.warn("Failed fetching from WooCommerce API", e.message);
    }
  }

  // 4. Fallback Mockup Data (8 Mini-boîte de survie)
  console.log("Using Mockup Data fallback...");
  return Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: "Mini-boîte de survie",
    slug: `mini-boite-de-survie-${i + 1}`,
    permalink: `/product/mini-boite-de-survie-${i + 1}`,
    price: "5.00",
    regular_price: "5.00",
    sale_price: "",
    on_sale: false,
    categories: [{ id: 14, name: "Accessoires", slug: "accessoires" }],
    images: [{ id: 100 + i, src: "/images/figma_keychains.jpg", name: "Mini-boîte de survie", alt: "Mini-boîte de survie" }],
    short_description: "La mini-boîte qui sauve tes soirées (et tes lendemains). Bouchons d'oreille, cachet du matin.",
    description: "",
    date_created: new Date().toISOString()
  }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'publish';
    const products = await fetchAllProducts(status);
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Fatal error in products API route:', error);
    // Absolute backup safety response
    return NextResponse.json(
      Array.from({ length: 8 }).map((_, i) => ({
        id: i + 1,
        name: "Mini-boîte de survie",
        slug: `mini-boite-de-survie-${i + 1}`,
        permalink: `/product/mini-boite-de-survie-${i + 1}`,
        price: "5.00",
        regular_price: "5.00",
        sale_price: "",
        on_sale: false,
        categories: [{ id: 14, name: "Accessoires", slug: "accessoires" }],
        images: [{ id: 100 + i, src: "/images/figma_keychains.jpg", name: "Mini-boîte de survie", alt: "Mini-boîte de survie" }],
        short_description: "La mini-boîte qui sauve tes soirées (et tes lendemains). Bouchons d'oreille, cachet du matin.",
        description: "",
        date_created: new Date().toISOString()
      }))
    );
  }
}
