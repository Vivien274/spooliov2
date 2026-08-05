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
    let results = await searchResilient(q);

    if (q.trim()) {
      results = await searchWithAi(q, results);
    }

    return NextResponse.json(results);
  } catch (e: any) {
    console.error("Fatal search error:", e);
    return NextResponse.json({ products: [], blogPosts: [], pages: [] });
  }
}

async function searchWithAi(query: string, existingResults: any) {
  const isPhrase = query.trim().split(/\s+/).length >= 2;
  const noProducts = !existingResults.products || existingResults.products.length === 0;

  if (!isPhrase && !noProducts) {
    return existingResults;
  }

  let allProducts: any[] = [];
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: "publish" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        shortDescription: true,
        description: true,
        images: { take: 1, select: { src: true } }
      }
    });
    allProducts = dbProducts.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: p.images?.[0]?.src || "/images/figma_keychains.jpg",
      description: (p.shortDescription || p.description || "").replace(/<[^>]*>/g, "").substring(0, 100)
    }));
  } catch (e) {
    try {
      const productsPath = path.join(process.cwd(), "src/data/products.json");
      if (fs.existsSync(productsPath)) {
        const data = JSON.parse(fs.readFileSync(productsPath, "utf8"));
        allProducts = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price || "0.00",
          image: p.images?.[0]?.src || "/images/figma_keychains.jpg",
          description: (p.short_description || p.description || "").replace(/<[^>]*>/g, "").substring(0, 100)
        }));
      }
    } catch (err) {}
  }

  if (allProducts.length === 0) return existingResults;

  const apiKey = process.env.GEMINI_API_KEY;
  let aiSummary = "";
  let aiMatchedSlugs: string[] = [];

  if (apiKey) {
    try {
      const systemPrompt = `Tu es l'assistant de recherche intelligent de Spoolio (impression 3D & fidgets).
Recherche utilisateur : "${query}"

Catalogue :
${JSON.stringify(allProducts.map(p => ({ id: p.id, name: p.name, slug: p.slug, desc: p.description })), null, 2)}

Formate ta réponse STRICTEMENT au format JSON :
{
  "summary": "Courte réponse chaleureuse (1 phrase) expliquant ce qui correspond.",
  "matchedSlugs": ["slug1", "slug2"]
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.5 }
        })
      });

      if (res.ok) {
        const json = await res.json();
        const raw = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (raw) {
          const cleaned = JSON.parse(raw.replace(/```json/g, "").replace(/```/g, "").trim());
          aiSummary = cleaned.summary || "";
          aiMatchedSlugs = cleaned.matchedSlugs || [];
        }
      }
    } catch (e) {}
  }

  if (!aiSummary || aiMatchedSlugs.length === 0) {
    const qLower = query.toLowerCase();

    const getFlagshipProducts = (keywords: string[]) => {
      return allProducts.filter((p: any) => {
        const text = `${p.name} ${p.slug} ${p.description}`.toLowerCase();
        return keywords.some(kw => text.includes(kw));
      });
    };

    if (qLower.includes("clique") || qLower.includes("bruit") || qLower.includes("bouton") || qLower.includes("switch") || qLower.includes("pression")) {
      aiSummary = "Pour un besoin tactile intense et le plaisir unique du clic mécanique, voici nos créations avec switchs :";
      // Exclude Nintendo Switch console accessories when matching keyboard switches
      const matches = getFlagshipProducts(["clicker", "clavier", "clique", "mecanique"]).filter(
        (p: any) => !p.name.toLowerCase().includes("nintendo") && !p.name.toLowerCase().includes("décoration")
      );

      // Sort so flagship keychains & clickers come first
      matches.sort((a: any, b: any) => {
        const aScore = a.name.toLowerCase().includes("clavier") ? 2 : (a.name.toLowerCase().includes("clicker") ? 1 : 0);
        const bScore = b.name.toLowerCase().includes("clavier") ? 2 : (b.name.toLowerCase().includes("clicker") ? 1 : 0);
        return bScore - aScore;
      });

      aiMatchedSlugs = matches.map((p: any) => p.slug);
      if (aiMatchedSlugs.length === 0) {
        aiMatchedSlugs = ["porte-cle-clavier-mecanique", "clicker-cactus", "clicker-mug-chocolat-chaud"];
      }
    } else if (qLower.includes("silencieux") || qLower.includes("bureau") || qLower.includes("cours") || qLower.includes("discret") || qLower.includes("fac")) {
      aiSummary = "Pour une utilisation en cours ou au bureau sans déranger, voici nos objets 100% silencieux et discrets :";
      const matches = getFlagshipProducts(["twist", "tissu", "chaton", "alien", "ours"]);
      aiMatchedSlugs = matches.map((p: any) => p.slug);
      if (aiMatchedSlugs.length === 0) {
        aiMatchedSlugs = ["fidget-twist", "chaton-articule"];
      }
    } else if (qLower.includes("cadeau") || qLower.includes("offrir") || qLower.includes("idée") || qLower.includes("idee") || qLower.includes("proche") || qLower.includes("anniversaire")) {
      aiSummary = "Voici nos meilleurs coffrets et créations 3D les plus appréciés à offrir en cadeau :";
      const matches = getFlagshipProducts(["twist", "clavier", "pochette", "sur-mesure", "articul"]);
      aiMatchedSlugs = matches.map((p: any) => p.slug);
      if (aiMatchedSlugs.length === 0) {
        aiMatchedSlugs = ["fidget-twist", "porte-cle-clavier-mecanique", "chaton-articule"];
      }
    } else if (qLower.includes("stress") || qLower.includes("anxi") || qLower.includes("tdah") || qLower.includes("apais") || qLower.includes("sensoriel") || qLower.includes("fidget")) {
      aiSummary = "Pour apaiser le stress et stimuler la concentration au quotidien, voici nos fidgets sensoriels phares :";
      const matches = getFlagshipProducts(["twist", "clavier", "clicker", "fidget", "articul", "poulpe"]);
      aiMatchedSlugs = matches.map((p: any) => p.slug);
      if (aiMatchedSlugs.length === 0) {
        aiMatchedSlugs = ["fidget-twist", "porte-cle-clavier-mecanique", "chaton-articule"];
      }
    } else {
      aiSummary = "Voici nos meilleures suggestions de créations 3D Spoolio pour votre recherche :";
      const cleanFlagships = allProducts.filter((p: any) => !p.name.toLowerCase().includes("movember") && !p.slug.toLowerCase().includes("movember"));
      aiMatchedSlugs = (cleanFlagships.length > 0 ? cleanFlagships : allProducts).slice(0, 4).map((p: any) => p.slug);
    }
  }

  // Preserve ordering of aiMatchedSlugs
  const matchedProductMap = new Map(allProducts.map(p => [p.slug, p]));
  const aiProducts = aiMatchedSlugs
    .map(slug => matchedProductMap.get(slug))
    .filter(Boolean);

  return {
    ...existingResults,
    aiAnswer: aiSummary,
    products: aiProducts.length > 0 ? aiProducts : (existingResults.products || [])
  };
}
