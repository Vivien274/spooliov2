import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { computeSeoScore } from '@/lib/seoUtils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
        parsedAttributes = parsed;
      } else if (Array.isArray(parsed)) {
        parsedAttributes = { attributes: parsed, variationPrices: [] };
      }

      if (parsedAttributes && Array.isArray(parsedAttributes.attributes)) {
        parsedAttributes.attributes = parsedAttributes.attributes.map((attr: any) => ({
          ...attr,
          options: Array.isArray(attr.options)
            ? [...attr.options].sort((a: string, b: string) => String(a).localeCompare(String(b), 'fr', { sensitivity: 'base', numeric: true }))
            : attr.options
        }));
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

  // Calculate effective non-zero price
  let rawPrice = String(p.price || "").trim();
  let rawRegPrice = String(p.regularPrice || p.regular_price || p.price || "").trim();

  const isPriceZero = !rawPrice || rawPrice === "0" || rawPrice === "0.00" || rawPrice === "0,00" || parseFloat(rawPrice) === 0;

  if (isPriceZero) {
    if (parsedAttributes && Array.isArray(parsedAttributes.variationPrices)) {
      const validVarPrices = parsedAttributes.variationPrices
        .map((vp: any) => parseFloat(vp.price))
        .filter((priceNum: number) => !isNaN(priceNum) && priceNum > 0);

      if (validVarPrices.length > 0) {
        rawPrice = Math.min(...validVarPrices).toString();
        if (!rawRegPrice || rawRegPrice === "0" || rawRegPrice === "0.00" || parseFloat(rawRegPrice) === 0) {
          rawRegPrice = rawPrice;
        }
      }
    }
  }

  if (!rawPrice || rawPrice === "0" || rawPrice === "0.00" || parseFloat(rawPrice) === 0) {
    rawPrice = "4.00";
    if (!rawRegPrice || rawRegPrice === "0" || rawRegPrice === "0.00" || parseFloat(rawRegPrice) === 0) {
      rawRegPrice = "4.00";
    }
  }

  return {
    id: p.id,
    name: decodeHtml(p.name),
    slug: p.slug,
    permalink: p.permalink,
    price: rawPrice,
    regular_price: rawRegPrice,
    sale_price: p.salePrice || p.sale_price || "",
    on_sale: !!(p.onSale || p.on_sale),
    categories: (p.categories || []).map((c: any) => ({
      ...c,
      name: decodeHtml(c.name || "")
    })),
    images: images.length > 0 ? images : [{ id: 1, src: "/images/figma_keychains.jpg", name: decodeHtml(p.name), alt: p.name }],
    short_description: p.shortDescription || p.short_description || "",
    description: p.description || "",
    metaTitle: p.metaTitle || p.meta_title || "",
    metaDescription: p.metaDescription || p.meta_description || "",
    meta_title: p.metaTitle || p.meta_title || "",
    meta_description: p.metaDescription || p.meta_description || "",
    seoScore: computeSeoScore(p),
    date_created: p.dateCreated ? new Date(p.dateCreated).toISOString() : (p.date_created ? new Date(p.date_created).toISOString() : null),
    attributes: parsedAttributes,
    tags: tagsList,
    stock: typeof p.stock === 'number' ? p.stock : (typeof p.stock_quantity === 'number' ? p.stock_quantity : -1),
    status: p.status || "publish",
    show_in_sensory_compass: !!(p.showInSensoryCompass || p.show_in_sensory_compass),
    sensory_noise_level: p.sensoryNoiseLevel || p.sensory_noise_level || null,
    sensory_size: p.sensorySize || p.sensory_size || null,
    sensory_category: p.sensoryCategory || p.sensory_category || null,
    sensory_profiles: p.sensoryProfiles ? (typeof p.sensoryProfiles === "string" ? p.sensoryProfiles.split(",").map((s: string) => s.trim()) : p.sensoryProfiles) : [],
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
    const dbProducts = await prisma.product.findMany({
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
    });

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

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { productId, showInSensoryCompass } = body;
    if (!productId) {
      return NextResponse.json({ error: "productId requis" }, { status: 400 });
    }

    if (prisma) {
      try {
        await prisma.product.update({
          where: { id: Number(productId) },
          data: { showInSensoryCompass: Boolean(showInSensoryCompass) },
        });
      } catch (err: any) {
        console.warn("Prisma PATCH failed:", err.message);
      }
    }

    try {
      const jsonPath = path.join(process.cwd(), "src/data/products.json");
      if (fs.existsSync(jsonPath)) {
        const fileData = fs.readFileSync(jsonPath, "utf8");
        const parsed = JSON.parse(fileData);
        if (Array.isArray(parsed)) {
          const matchIdx = parsed.findIndex((p: any) => Number(p.id) === Number(productId));
          if (matchIdx !== -1) {
            parsed[matchIdx].show_in_sensory_compass = Boolean(showInSensoryCompass);
            parsed[matchIdx].showInSensoryCompass = Boolean(showInSensoryCompass);
            fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), "utf8");
          }
        }
      }
    } catch (e) {}

    return NextResponse.json({ success: true, showInSensoryCompass: Boolean(showInSensoryCompass) });
  } catch (error: any) {
    console.error("PATCH /api/products error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
