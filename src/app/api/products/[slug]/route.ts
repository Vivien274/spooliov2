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
  const rawImages = p.images || [];
  const images = rawImages.map((img: any, idx: number) => ({
    id: img.id || idx,
    src: img.src || img.sourceUrl || img.source_url || "/images/figma_keychains.jpg",
    name: decodeHtml(img.name || p.name),
    alt: img.alt || p.name
  }));

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
    attributes: p.attributes ? (typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes) : [],
    stock: typeof p.stock === 'number' ? p.stock : (typeof p.stock_quantity === 'number' ? p.stock_quantity : -1),
  };
}

async function fetchSingleProduct(slug: string) {
  const wcUrl = process.env.NEXT_PUBLIC_WC_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  // 1. Try Prisma Database client first (with a timeout race)
  try {
    console.log(`Attempting Prisma Database fetch for slug: ${slug}...`);
    const dbProduct = await Promise.race([
      prisma.product.findUnique({
        where: { slug },
        include: {
          images: true,
          categories: true,
        },
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 800))
    ]) as any;

    if (dbProduct) {
      console.log("Successfully fetched product from Prisma Database.");
      return mapProduct(dbProduct);
    }
  } catch (e: any) {
    console.warn("Prisma query failed or timed out for single product:", e.message);
  }

  // 2. Try Local JSON file fallback next (to support local admin modifications)
  try {
    const jsonPath = path.join(process.cwd(), 'src/data/products.json');
    if (fs.existsSync(jsonPath)) {
      console.log("Attempting Local products.json fetch...");
      const fileData = fs.readFileSync(jsonPath, 'utf8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        const match = parsed.find(p => p.slug === slug);
        if (match) {
          console.log("Successfully fetched product from Local products.json.");
          const mapped = mapProduct(match);
          try {
            const localProduct = await Promise.race([
              prisma.product.findUnique({
                where: { slug },
                select: { id: true }
              }),
              new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 800))
            ]) as any;

            if (localProduct) {
              console.log(`Overwriting JSON product ID ${mapped.id} with local database ID ${localProduct.id}`);
              mapped.id = localProduct.id;
            }
          } catch (dbErr: any) {
            console.warn("Failed checking local product ID for JSON mapped product:", dbErr.message);
          }
          return mapped;
        }
      }
    }
  } catch (e: any) {
    console.warn("Failed to load local products.json:", e.message);
  }

  // 3. Fallback to WooCommerce REST API (if not found locally)
  if (wcUrl && consumerKey && consumerSecret) {
    try {
      console.log(`Attempting WooCommerce API fetch for slug: ${slug}...`);
      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
      const response = await fetch(`${wcUrl.replace(/\/$/, '')}/wp-json/wc/v3/products?slug=${slug}`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 60 }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          console.log("Successfully fetched product from WooCommerce API.");
          const mapped = mapProduct(data[0]);
          try {
            const localProduct = await prisma.product.findUnique({
              where: { slug },
              select: { id: true }
            });
            if (localProduct) {
              console.log(`Overwriting WooCommerce product ID ${mapped.id} with local database ID ${localProduct.id}`);
              mapped.id = localProduct.id;
            }
          } catch (dbErr: any) {
            console.warn("Failed checking local product ID for WooCommerce mapped product:", dbErr.message);
          }
          return mapped;
        }
      }
    } catch (e: any) {
      console.warn("Failed fetching single product from WooCommerce API:", e.message);
    }
  }

  // 4. Fallback Mockup Data
  console.log("Using Mockup Data fallback for slug...");
  const mockProducts = Array.from({ length: 8 }).map((_, i) => ({
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

  return mockProducts.find(p => p.slug === slug) || null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const product = await fetchSingleProduct(slug);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error: any) {
    console.error(`Fatal error in single product API route for slug ${slug}:`, error);
    return NextResponse.json(
      { error: 'Failed to load product details', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const body = await request.json();
    const numericId = parseInt(slug);
    
    const updateData: any = {
      name: body.name,
      price: body.price,
      salePrice: body.salePrice || null,
      onSale: body.onSale || false,
      shortDescription: body.shortDescription || null,
      description: body.description || null,
      stock: typeof body.stock === 'number' ? body.stock : -1,
      productType: body.productType || 'simple',
      status: body.status || 'publish',
    };

    if (body.attributes) {
      updateData.attributes = typeof body.attributes === 'string' 
        ? body.attributes 
        : JSON.stringify(body.attributes);
    }

    let updatedProduct = null;
    let savedInDb = false;
    let exists = null;

    try {
      const searchId = !isNaN(numericId) ? numericId : undefined;
      exists = await Promise.race([
        prisma.product.findFirst({
          where: {
            OR: [
              searchId ? { id: searchId } : null,
              { slug: body.slug || slug }
            ].filter(Boolean) as any
          }
        }),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 800))
      ]) as any;

      if (exists) {
        updatedProduct = await Promise.race([
          prisma.product.update({
            where: { id: exists.id },
            data: updateData
          }),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 800))
        ]) as any;
      } else {
        const newId = searchId || body.id;
        updatedProduct = await Promise.race([
          prisma.product.create({
            data: {
              ...(newId ? { id: newId } : {}),
              name: updateData.name || "Produit sans nom",
              slug: body.slug || slug,
              price: updateData.price || "0.00",
              regularPrice: updateData.regularPrice || body.regularPrice || body.price,
              salePrice: updateData.salePrice,
              onSale: updateData.onSale,
              shortDescription: updateData.shortDescription,
              description: updateData.description,
              stock: updateData.stock,
              productType: updateData.productType,
              status: updateData.status,
              attributes: updateData.attributes,
            }
          }),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 800))
        ]) as any;
      }
      savedInDb = true;
    } catch (dbErr: any) {
      console.warn("Prisma saving failed or timed out, using fallback writing to products.json:", dbErr.message);
    }

    try {
      const jsonPath = path.join(process.cwd(), "src/data/products.json");
      if (fs.existsSync(jsonPath)) {
        const fileData = fs.readFileSync(jsonPath, "utf8");
        const parsed = JSON.parse(fileData);
        if (Array.isArray(parsed)) {
          const matchIdx = parsed.findIndex(p => p.slug === slug || String(p.id) === String(numericId) || String(p.id) === String(body.id));
          
          const mappedForJson: any = {
            id: numericId || body.id || (exists ? exists.id : Math.floor(Math.random() * 100000)),
            name: body.name,
            slug: body.slug || slug,
            price: body.price,
            regular_price: body.regularPrice || body.regular_price || body.price,
            sale_price: body.salePrice || body.sale_price || "",
            on_sale: body.onSale || body.on_sale || false,
            short_description: body.shortDescription || body.short_description || "",
            description: body.description || "",
            stock_quantity: body.stock,
            type: body.productType || "simple",
            status: body.status || "publish",
            attributes: typeof updateData.attributes === 'string' ? JSON.parse(updateData.attributes) : updateData.attributes,
            images: body.images || []
          };

          if (matchIdx !== -1) {
            parsed[matchIdx] = {
              ...parsed[matchIdx],
              ...mappedForJson
            };
          } else {
            parsed.push(mappedForJson);
          }

          fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), "utf8");
          console.log("Successfully wrote product to products.json fallback!");
          if (!updatedProduct) {
            updatedProduct = mappedForJson;
          }
        }
      }
    } catch (jsonErr: any) {
      console.error("Failed to write fallback to products.json:", jsonErr.message);
      if (!savedInDb) {
        throw new Error("Impossible d'enregistrer le produit en base de données ni dans products.json.");
      }
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error(`Error updating product ${slug}:`, error.message);
    return NextResponse.json(
      { error: 'Failed to update product', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const numericId = parseInt(slug);
    if (!isNaN(numericId)) {
      await prisma.product.delete({
        where: { id: numericId }
      });
    } else {
      await prisma.product.delete({
        where: { slug }
      });
    }
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting product ${slug}:`, error.message);
    return NextResponse.json(
      { error: 'Failed to delete product', details: error.message },
      { status: 500 }
    );
  }
}
