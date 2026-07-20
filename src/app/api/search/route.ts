import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";

// Helper to query with timeout
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 800): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Prisma Query Timeout")), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
}

// Resilient search logic
async function searchResilient(q: string) {
  const query = q.trim().toLowerCase();

  // Try DB search first with timeout
  try {
    if (!query) {
      const defaultProducts = await withTimeout(prisma.product.findMany({
        where: { status: "publish" },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: { take: 1, select: { src: true } }
        },
        take: 3
      }));

      const defaultPages = [
        { title: "Nous Contacter", slug: "contact", isStatic: true },
        { title: "Espace Professionnels", slug: "pro", isStatic: true },
        { title: "Boutique d'objets 3D", slug: "boutique", isStatic: true },
      ];

      return {
        products: defaultProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          image: p.images?.[0]?.src || "/images/figma_keychains.jpg"
        })),
        blogPosts: [],
        pages: defaultPages
      };
    }

    const [products, blogPosts, dbPages] = await withTimeout(Promise.all([
      prisma.product.findMany({
        where: {
          status: "publish",
          OR: [
            { name: { contains: q } },
            { shortDescription: { contains: q } }
          ]
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: { take: 1, select: { src: true } }
        },
        take: 5
      }),
      prisma.blogPost.findMany({
        where: {
          status: "publish",
          OR: [
            { title: { contains: q } },
            { content: { contains: q } }
          ]
        },
        select: {
          id: true,
          title: true,
          slug: true
        },
        take: 5
      }),
      prisma.page.findMany({
        where: {
          status: "publish",
          slug: { not: "config-hero" },
          OR: [
            { title: { contains: q } },
            { slug: { contains: q } }
          ]
        },
        select: {
          id: true,
          title: true,
          slug: true
        },
        take: 5
      })
    ]));

    const staticRoutes = [
      { title: "Nous Contacter", slug: "contact", isStatic: true },
      { title: "Espace Professionnels", slug: "pro", isStatic: true },
      { title: "Boutique d'objets 3D", slug: "boutique", isStatic: true },
      { title: "Suivi de Commande", slug: "suivi", isStatic: true }
    ];

    const matchedStatic = staticRoutes.filter(route => 
      route.title.toLowerCase().includes(query) || 
      route.slug.toLowerCase().includes(query)
    );

    const formattedPages = dbPages.map(p => ({
      title: p.title,
      slug: p.slug,
      isStatic: true
    }));

    const allPages = [...formattedPages];
    matchedStatic.forEach(st => {
      if (!allPages.some(ap => ap.slug === st.slug)) {
        allPages.push(st);
      }
    });

    return {
      products: products.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        image: p.images?.[0]?.src || "/images/figma_keychains.jpg"
      })),
      blogPosts,
      pages: allPages.slice(0, 5)
    };

  } catch (e: any) {
    console.warn("Prisma search failed or timed out. Falling back to local JSON files...", e.message);
  }

  // Fallback to local JSON files
  try {
    const dataDir = path.join(process.cwd(), 'src/data');
    
    // Products search
    let productsList: any[] = [];
    const productsPath = path.join(dataDir, 'products.json');
    if (fs.existsSync(productsPath)) {
      const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      if (Array.isArray(data)) {
        const filtered = query
          ? data.filter((p: any) => 
              p.name?.toLowerCase().includes(query) || 
              p.short_description?.toLowerCase().includes(query) || 
              p.description?.toLowerCase().includes(query)
            )
          : data.slice(0, 3);
        
        productsList = filtered.slice(0, 5).map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price || "0.00",
          image: p.images?.[0]?.src || "/images/figma_keychains.jpg"
        }));
      }
    }

    // Blog search
    let blogList: any[] = [];
    const blogPath = path.join(dataDir, 'blog.json');
    if (fs.existsSync(blogPath)) {
      const data = JSON.parse(fs.readFileSync(blogPath, 'utf8'));
      if (Array.isArray(data) && query) {
        blogList = data
          .filter((b: any) => 
            b.title?.rendered?.toLowerCase().includes(query) || 
            b.content?.rendered?.toLowerCase().includes(query)
          )
          .slice(0, 5)
          .map((b: any) => ({
            id: b.id,
            title: b.title?.rendered || b.title || "",
            slug: b.slug
          }));
      }
    }

    // Pages search
    let pagesList: any[] = [];
    const pagesPath = path.join(dataDir, 'pages.json');
    if (fs.existsSync(pagesPath)) {
      const data = JSON.parse(fs.readFileSync(pagesPath, 'utf8'));
      if (Array.isArray(data)) {
        const filtered = query
          ? data.filter((p: any) => 
              p.title?.rendered?.toLowerCase().includes(query) || 
              p.slug?.toLowerCase().includes(query)
            )
          : [];
        pagesList = filtered.map((p: any) => ({
          title: p.title?.rendered || p.title || "",
          slug: p.slug,
          isStatic: true
        }));
      }
    }

    const staticRoutes = [
      { title: "Nous Contacter", slug: "contact", isStatic: true },
      { title: "Espace Professionnels", slug: "pro", isStatic: true },
      { title: "Boutique d'objets 3D", slug: "boutique", isStatic: true },
      { title: "Suivi de Commande", slug: "suivi", isStatic: true }
    ];

    const matchedStatic = staticRoutes.filter(route => 
      route.title.toLowerCase().includes(query) || 
      route.slug.toLowerCase().includes(query)
    );

    const allPages = [...pagesList];
    matchedStatic.forEach(st => {
      if (!allPages.some(ap => ap.slug === st.slug)) {
        allPages.push(st);
      }
    });

    return {
      products: productsList,
      blogPosts: blogList,
      pages: allPages.slice(0, 5)
    };

  } catch (e: any) {
    console.error("Local JSON search fallback failed:", e.message);
  }

  // Backup Mock response
  return {
    products: [],
    blogPosts: [],
    pages: [
      { title: "Boutique d'objets 3D", slug: "boutique", isStatic: true }
    ]
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
