import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getDefaultUniquePieceData, UniquePieceData } from "@/lib/uniquePieceDefaults";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("spoolio_admin_session")?.value;
  const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";
  if (!token || !(await verifySession(token, secret))) {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    // Single item fetch
    if (id || slug) {
      let product: any = null;

      if (id && !isNaN(parseInt(id, 10))) {
        product = await prisma.product.findUnique({
          where: { id: parseInt(id, 10) },
          include: { images: true, categories: true }
        });
        // If searching for mock ID 999901, check if saved product exists under the slug in DB
        if (!product && (id === "999901" || parseInt(id, 10) === 999901)) {
          product = await prisma.product.findFirst({
            where: { slug: "monstre-skateur-fait-main" },
            include: { images: true, categories: true }
          });
        }
      } else if (slug) {
        product = await prisma.product.findFirst({
          where: { slug },
          include: { images: true, categories: true }
        });
      }

      // If test product and not in DB, return mock test product
      if (!product && (slug === "monstre-skateur-fait-main" || id === "999901")) {
        const defaultData = getDefaultUniquePieceData("Gribouille le Skateur");
        return NextResponse.json({
          product: {
            id: 999901,
            name: "Gribouille le Skateur – Figurine Peinte à la Main",
            slug: "monstre-skateur-fait-main",
            price: "59.00",
            status: "draft",
            stock: 3,
            images: [{ id: 1, src: "/images/produits/monstre-skateur-fait-main.jpg", alt: "Gribouille le Skateur" }],
            uniquePieceData: defaultData
          }
        });
      }

      if (!product) {
        return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
      }

      let parsedAttrs: any = {};
      try {
        parsedAttrs = typeof product.attributes === "string" ? JSON.parse(product.attributes) : (product.attributes || {});
      } catch {}

      const uniquePieceData: UniquePieceData = parsedAttrs.uniquePieceData || getDefaultUniquePieceData(product.name);

      return NextResponse.json({
        product: {
          ...product,
          uniquePieceData
        }
      });
    }

    // List all unique pieces
    const dbProducts = await prisma.product.findMany({
      where: {
        OR: [
          { slug: "monstre-skateur-fait-main" },
          { attributes: { contains: "uniquePieceData" } },
          { attributes: { contains: "fait-main" } },
          { categories: { some: { name: { contains: "Fait Main", mode: "insensitive" } } } }
        ]
      },
      include: { images: true, categories: true },
      orderBy: { id: "desc" }
    });

    const items: any[] = dbProducts.map((p) => {
      let parsedAttrs: any = {};
      try {
        parsedAttrs = typeof p.attributes === "string" ? JSON.parse(p.attributes) : (p.attributes || {});
      } catch {}

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        status: p.status,
        stock: p.stock,
        image: p.images?.[0]?.src || "/images/figma_keychains.jpg",
        uniquePieceData: parsedAttrs.uniquePieceData || getDefaultUniquePieceData(p.name)
      };
    });

    // Ensure mock demo product is in list if not in DB
    if (!items.some(it => it.slug === "monstre-skateur-fait-main")) {
      items.unshift({
        id: 999901,
        name: "Gribouille le Skateur – Figurine Peinte à la Main",
        slug: "monstre-skateur-fait-main",
        price: "59.00",
        status: "draft",
        stock: 3,
        image: "/images/produits/monstre-skateur-fait-main.jpg",
        uniquePieceData: getDefaultUniquePieceData("Gribouille le Skateur")
      });
    }

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error("GET /api/admin/pieces-uniques error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, slug, price, status, stock, image, uniquePieceData } = body;

    if (!name) {
      return NextResponse.json({ error: "Le nom est obligatoire" }, { status: 400 });
    }

    const effectiveSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const effectivePrice = String(price || "59.00");

    let attributesObj: any = {
      attributes: [],
      variationPrices: [],
      tags: ["fait-main", "piece-unique"],
      uniquePieceData: uniquePieceData || getDefaultUniquePieceData(name)
    };

    let savedProduct: any = null;

    if (id && id !== 999901 && id !== "999901" && id !== "new") {
      // Update existing
      savedProduct = await prisma.product.update({
        where: { id: parseInt(id, 10) },
        data: {
          name,
          slug: effectiveSlug,
          price: effectivePrice,
          regularPrice: effectivePrice,
          status: status || "publish",
          stock: typeof stock === "number" ? stock : 1,
          attributes: JSON.stringify(attributesObj),
        },
        include: { images: true }
      });
      if (image) {
        await prisma.productImage.deleteMany({ where: { productId: savedProduct.id } });
        await prisma.productImage.create({
          data: {
            productId: savedProduct.id,
            src: image,
            name: name,
            alt: name
          }
        });
      }
    } else {
      // Upsert / Create
      const existing = await prisma.product.findFirst({ where: { slug: effectiveSlug } });
      if (existing) {
        savedProduct = await prisma.product.update({
          where: { id: existing.id },
          data: {
            name,
            price: effectivePrice,
            regularPrice: effectivePrice,
            status: status || "publish",
            stock: typeof stock === "number" ? stock : 1,
            attributes: JSON.stringify(attributesObj),
          },
          include: { images: true }
        });
        if (image) {
          await prisma.productImage.deleteMany({ where: { productId: savedProduct.id } });
          await prisma.productImage.create({
            data: {
              productId: savedProduct.id,
              src: image,
              name: name,
              alt: name
            }
          });
        }
      } else {
        savedProduct = await prisma.product.create({
          data: {
            name,
            slug: effectiveSlug,
            price: effectivePrice,
            regularPrice: effectivePrice,
            status: status || "publish",
            stock: typeof stock === "number" ? stock : 1,
            attributes: JSON.stringify(attributesObj),
            images: {
              create: [
                {
                  src: image || "/images/produits/monstre-skateur-fait-main.jpg",
                  name: name,
                  alt: name
                }
              ]
            }
          },
          include: { images: true }
        });
      }
    }

    // Keep products.json fallback in sync if it exists
    try {
      const jsonPath = path.join(process.cwd(), "src/data/products.json");
      if (fs.existsSync(jsonPath)) {
        const fileData = fs.readFileSync(jsonPath, "utf8");
        const parsed = JSON.parse(fileData);
        if (Array.isArray(parsed)) {
          const idx = parsed.findIndex((p: any) => p.slug === effectiveSlug || p.id === savedProduct.id);
          const itemPayload = {
            id: savedProduct.id,
            name: savedProduct.name,
            slug: effectiveSlug,
            price: effectivePrice,
            regular_price: effectivePrice,
            status: status || "publish",
            stock: typeof stock === "number" ? stock : 1,
            attributes: attributesObj,
            images: [{ id: 1, src: image || "/images/produits/monstre-skateur-fait-main.jpg", alt: name, name }]
          };
          if (idx >= 0) {
            parsed[idx] = { ...parsed[idx], ...itemPayload };
          } else {
            parsed.unshift(itemPayload);
          }
          fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), "utf8");
        }
      }
    } catch (e: any) {
      console.warn("Could not sync products.json:", e.message);
    }

    // Revalidate public page
    if (effectiveSlug) {
      try {
        revalidatePath(`/product/${effectiveSlug}`);
        revalidatePath(`/produit/${effectiveSlug}`);
        revalidatePath(`/api/products/${effectiveSlug}`);
        revalidatePath(`/api/products`);
        revalidatePath("/boutique");
        revalidatePath("/");
      } catch {}
    }

    return NextResponse.json({ success: true, product: savedProduct });
  } catch (err: any) {
    console.error("POST /api/admin/pieces-uniques error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
