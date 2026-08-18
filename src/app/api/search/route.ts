import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

/**
 * Normalizes text: lowercase, removes accents and special diacritics
 */
function normalize(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Clean HTML tags
 */
function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
}

/**
 * Query with timeout safeguard
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 1000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Query Timeout")), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Fast resilient search engine with normalized smart scoring
 */
async function searchResilient(q: string) {
  const cleanQ = q.trim();
  const normQ = normalize(cleanQ);

  if (!normQ) {
    // Default popular products when query is empty
    let defaultProducts: any[] = [];
    try {
      if (prisma) {
        defaultProducts = await withTimeout(
          prisma.product.findMany({
            where: { status: "publish" },
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: { take: 1, select: { src: true } },
            },
            take: 4,
          })
        );
      }
    } catch (e) {}

    if (defaultProducts.length === 0) {
      const dataDir = path.join(process.cwd(), "src/data");
      const productsPath = path.join(dataDir, "products.json");
      if (fs.existsSync(productsPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(productsPath, "utf8"));
          defaultProducts = data.slice(0, 4).map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price || "4.00",
            image: p.images?.[0]?.src || "/images/figma_keychains.jpg",
          }));
        } catch (err) {}
      }
    }

    return {
      products: defaultProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price || "4.00",
        image: p.image || p.images?.[0]?.src || "/images/figma_keychains.jpg",
      })),
      blogPosts: [],
      pages: [
        { title: "Boutique d'objets 3D", slug: "boutique", isStatic: true },
        { title: "Créateur de Clicker 3D", slug: "createur-cliqueur", isStatic: true },
        { title: "Boussole Sensorielle", slug: "boussole-sensorielle", isStatic: true },
        { title: "Nous Contacter", slug: "contact", isStatic: true },
      ],
    };
  }

  // 1. Gather all catalog products for search
  let allProducts: any[] = [];
  try {
    if (prisma) {
      const dbProducts = await withTimeout(
        prisma.product.findMany({
          where: { status: "publish" },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            shortDescription: true,
            description: true,
            images: { take: 1, select: { src: true } },
          },
        })
      );
      allProducts = dbProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        short_description: p.shortDescription || "",
        description: p.description || "",
        image: p.images?.[0]?.src || "/images/figma_keychains.jpg",
      }));
    }
  } catch (e) {}

  if (allProducts.length === 0) {
    try {
      const dataDir = path.join(process.cwd(), "src/data");
      const productsPath = path.join(dataDir, "products.json");
      if (fs.existsSync(productsPath)) {
        const data = JSON.parse(fs.readFileSync(productsPath, "utf8"));
        if (Array.isArray(data)) {
          allProducts = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price || "4.00",
            short_description: p.short_description || "",
            description: p.description || "",
            image: p.images?.[0]?.src || "/images/figma_keychains.jpg",
          }));
        }
      }
    } catch (e) {}
  }

  // Score and rank matched products
  const scoredProducts: { product: any; score: number }[] = [];
  for (const p of allProducts) {
    const normName = normalize(p.name);
    const normSlug = normalize(p.slug);
    const normShort = normalize(stripHtml(p.short_description));
    const normDesc = normalize(stripHtml(p.description));

    let score = 0;

    // Exact word or prefix in title
    if (normName.startsWith(normQ)) {
      score += 120;
    } else if (normName.includes(" " + normQ) || normName.includes("-" + normQ) || normName.includes("– " + normQ)) {
      score += 80;
    } else if (normName.includes(normQ)) {
      score += 50;
    }

    // Slug match
    if (normSlug.startsWith(normQ)) {
      score += 60;
    } else if (normSlug.includes("-" + normQ) || normSlug.includes(normQ)) {
      score += 30;
    }

    // Short description match
    if (normShort.includes(normQ)) {
      score += 15;
    }

    // Full description match
    if (normDesc.includes(normQ)) {
      score += 5;
    }

    if (score > 0) {
      scoredProducts.push({
        product: {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          image: p.image,
        },
        score,
      });
    }
  }

  scoredProducts.sort((a, b) => b.score - a.score);
  const matchedProducts = scoredProducts.slice(0, 6).map((s) => s.product);

  // 2. Blog Posts search
  let matchedBlog: any[] = [];
  try {
    if (prisma) {
      const dbBlog = await withTimeout(
        prisma.blogPost.findMany({
          where: { status: "publish" },
          select: { id: true, title: true, slug: true, content: true },
        })
      );
      matchedBlog = dbBlog
        .filter(
          (b) =>
            normalize(b.title).includes(normQ) ||
            normalize(stripHtml(b.content)).includes(normQ)
        )
        .slice(0, 4)
        .map((b) => ({ id: b.id, title: b.title, slug: b.slug }));
    }
  } catch (e) {}

  if (matchedBlog.length === 0) {
    try {
      const blogPath = path.join(process.cwd(), "src/data/blog.json");
      if (fs.existsSync(blogPath)) {
        const data = JSON.parse(fs.readFileSync(blogPath, "utf8"));
        if (Array.isArray(data)) {
          matchedBlog = data
            .filter(
              (b: any) =>
                normalize(b.title?.rendered || b.title).includes(normQ) ||
                normalize(stripHtml(b.content?.rendered || b.content)).includes(normQ)
            )
            .slice(0, 4)
            .map((b: any) => ({
              id: b.id,
              title: b.title?.rendered || b.title || "",
              slug: b.slug,
            }));
        }
      }
    } catch (e) {}
  }

  // 3. Static Pages search
  const staticRoutes = [
    { title: "Boutique d'objets 3D", slug: "boutique", isStatic: true },
    { title: "Créateur de Clicker 3D", slug: "createur-cliqueur", isStatic: true },
    { title: "Boussole Sensorielle (Guide TDAH)", slug: "boussole-sensorielle", isStatic: true },
    { title: "Pochette Surprise Mystère", slug: "pochette-surprise", isStatic: true },
    { title: "Roue de la Loterie (Codes Promos)", slug: "loterie", isStatic: true },
    { title: "Tombola Solidaire", slug: "tombola", isStatic: true },
    { title: "Programme de Fidélité", slug: "fidelite", isStatic: true },
    { title: "Faire un Don / Soutenir Spoolio", slug: "don", isStatic: true },
    { title: "Suivi de Commande", slug: "suivi", isStatic: true },
    { title: "Espace Professionnels (B2B)", slug: "pro", isStatic: true },
    { title: "Nous Contacter", slug: "contact", isStatic: true },
    { title: "FAQ & Questions Fréquentes", slug: "faq", isStatic: true },
  ];

  const matchedPages = staticRoutes
    .filter(
      (r) =>
        normalize(r.title).includes(normQ) ||
        normalize(r.slug).includes(normQ)
    )
    .slice(0, 4);

  return {
    products: matchedProducts,
    blogPosts: matchedBlog,
    pages: matchedPages,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const results = await searchResilient(q);

    return NextResponse.json(results);
  } catch (e: any) {
    console.error("Fatal search error:", e);
    return NextResponse.json({ products: [], blogPosts: [], pages: [] });
  }
}
