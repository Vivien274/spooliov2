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

async function fetchSingleProduct(slug: string, status: string) {
  const wcUrl = process.env.NEXT_PUBLIC_WC_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  try {
    const whereCond = status === 'all'
      ? { slug }
      : { slug, status: { in: ['publish', ''] } };

    const dbProduct = await prisma.product.findFirst({
      where: whereCond,
      include: { images: true, categories: true },
    });

    if (dbProduct) return mapProduct(dbProduct);
  } catch (e: any) {
    console.warn("Prisma query failed:", e.message);
  }

  try {
    const jsonPath = path.join(process.cwd(), 'src/data/products.json');
    if (fs.existsSync(jsonPath)) {
      const fileData = fs.readFileSync(jsonPath, 'utf8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        const match = parsed.find(p => p.slug === slug);
        if (match && (status === 'all' || match.status === 'publish' || !match.status)) {
          const mapped = mapProduct(match);
          try {
            const dbProduct = await prisma.product.findFirst({ where: { slug: match.slug } });
            if (dbProduct) {
              if (dbProduct.price) mapped.price = dbProduct.price;
              if (dbProduct.regularPrice) mapped.regular_price = dbProduct.regularPrice;
            }
          } catch (e) {
            console.warn("Failed to overlay DB data on local JSON product:", e);
          }
          return mapped;
        }
      }
    }
  } catch (e: any) {
    console.warn("Local JSON query failed:", e.message);
  }

  if (wcUrl && consumerKey && consumerSecret) {
    try {
      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
      const response = await fetch(`${wcUrl.replace(/\/$/, '')}/wp-json/wc/v3/products?slug=${slug}`, {
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
        next: { revalidate: 60 }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return mapProduct(data[0]);
      }
    } catch (e: any) {
      console.warn("WooCommerce API fetch failed:", e.message);
    }
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'publish';
    const product = await fetchSingleProduct(slug, status);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 });
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
    
    let attributesObj: any = { attributes: [], variationPrices: [] };
    if (body.attributes) {
      try {
        attributesObj = typeof body.attributes === 'string' ? JSON.parse(body.attributes) : body.attributes;
        if (Array.isArray(attributesObj)) attributesObj = { attributes: attributesObj, variationPrices: [] };
      } catch (e) {
        console.warn("Could not parse incoming body attributes:", e);
      }
    }
    if (body.tags) attributesObj.tags = body.tags;

    let effectivePrice = String(body.price || "").trim();
    if (!effectivePrice || effectivePrice === "0" || effectivePrice === "0.00" || effectivePrice === "0,00" || parseFloat(effectivePrice) === 0) {
      if (attributesObj && Array.isArray(attributesObj.variationPrices)) {
        const validVarPrices = attributesObj.variationPrices
          .map((vp: any) => parseFloat(vp.price))
          .filter((p: number) => !isNaN(p) && p > 0);
        if (validVarPrices.length > 0) effectivePrice = Math.min(...validVarPrices).toString();
      }
    }

    const updateData: any = {
      name: body.name,
      price: effectivePrice || "0.00",
      regularPrice: body.regularPrice || effectivePrice || "0.00",
      salePrice: body.salePrice || null,
      onSale: body.onSale || false,
      shortDescription: body.shortDescription || null,
      description: body.description || null,
      stock: typeof body.stock === 'number' ? body.stock : -1,
      productType: body.productType || 'simple',
      status: body.status || 'publish',
      seoScore: typeof body.seoScore === 'number' ? body.seoScore : 0,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      showInSensoryCompass: typeof body.showInSensoryCompass === 'boolean' ? body.showInSensoryCompass : (body.show_in_sensory_compass || false),
      sensoryNoiseLevel: body.sensoryNoiseLevel || body.sensory_noise_level || null,
      sensorySize: body.sensorySize || body.sensory_size || null,
      sensoryCategory: body.sensoryCategory || body.sensory_category || null,
      sensoryProfiles: Array.isArray(body.sensoryProfiles) ? body.sensoryProfiles.join(',') : (body.sensoryProfiles || null),
      attributes: JSON.stringify(attributesObj)
    };

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
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 15000))
      ]) as any;

      let categoryObj: any = null;
      if (body.category) {
        try {
          categoryObj = await prisma.category.findFirst({
            where: {
              OR: [
                { name: { equals: body.category, mode: "insensitive" } },
                { slug: body.category.toLowerCase().replace(/\s+/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "") }
              ]
            }
          });
        } catch (catErr: any) {
          console.warn("Could not find matching category in DB:", catErr.message);
        }
      }

      const categoryUpdate = categoryObj
        ? { set: [{ id: categoryObj.id }] }
        : { set: [] };

      const categoryCreate = categoryObj
        ? { connect: [{ id: categoryObj.id }] }
        : undefined;

      const imagesPayload = (body.images || []).map((img: any) => ({
        src: img.src,
        alt: img.alt || ""
      }));

      if (exists) {
        updatedProduct = await Promise.race([
          prisma.product.update({
            where: { id: exists.id },
            data: {
              ...updateData,
              categories: categoryUpdate,
              images: {
                deleteMany: {},
                create: imagesPayload
              }
            },
            include: {
              images: true,
              categories: true
            }
          }),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 15000))
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
              regularPrice: updateData.regularPrice || body.regularPrice || body.price || "0.00",
              salePrice: updateData.salePrice,
              onSale: updateData.onSale,
              shortDescription: updateData.shortDescription,
              description: updateData.description,
              stock: updateData.stock,
              productType: updateData.productType,
              status: updateData.status,
              seoScore: updateData.seoScore,
              metaTitle: updateData.metaTitle,
              metaDescription: updateData.metaDescription,
              attributes: updateData.attributes,
              showInSensoryCompass: updateData.showInSensoryCompass,
              sensoryNoiseLevel: updateData.sensoryNoiseLevel,
              sensorySize: updateData.sensorySize,
              sensoryCategory: updateData.sensoryCategory,
              sensoryProfiles: updateData.sensoryProfiles,
              categories: categoryCreate,
              images: {
                create: imagesPayload
              }
            },
            include: {
              images: true,
              categories: true
            }
          }),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 15000))
        ]) as any;
      }
      savedInDb = true;
    } catch (dbErr: any) {
      console.warn("Prisma saving failed or timed out:", dbErr.message);
      if (!updatedProduct) {
        // Fallback error details for caller
        throw dbErr;
      }
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
            categories: body.category ? [{ name: body.category, slug: body.category.toLowerCase().replace(/\s+/g, '-') }] : [],
            short_description: body.shortDescription || body.short_description || "",
            description: body.description || "",
            stock_quantity: body.stock,
            type: body.productType || "simple",
            status: body.status || "publish",
            attributes: attributesObj,
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

          try {
            fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), "utf8");
          } catch (writeErr: any) {
            console.warn("Local products.json write bypassed (serverless read-only environment):", writeErr.message);
          }
          if (!updatedProduct) {
            updatedProduct = mappedForJson;
          }
        }
      }
    } catch (jsonErr: any) {
      console.warn("Local JSON fallback bypassed:", jsonErr.message);
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
