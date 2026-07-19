import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    // If query is empty, return quick default suggestions
    if (!q.trim()) {
      const defaultProducts = await prisma.product.findMany({
        where: { status: "publish" },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: { take: 1, select: { src: true } }
        },
        take: 3
      });

      const defaultPages = [
        { title: "Nous Contacter", slug: "contact", isStatic: true },
        { title: "Espace Professionnels", slug: "pro", isStatic: true },
        { title: "Boutique d'objets 3D", slug: "boutique", isStatic: true },
      ];

      return NextResponse.json({
        products: defaultProducts,
        blogPosts: [],
        pages: defaultPages
      });
    }

    // Parallel searches in database
    const [products, blogPosts, dbPages] = await Promise.all([
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
            { title: { contains: q }, },
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
    ]);

    // Format native route pages or match static hardcoded pages if searched
    const formattedPages = dbPages.map(p => ({
      title: p.title,
      slug: p.slug,
      isStatic: true
    }));

    // Add general hardcoded routes if they match query
    const staticRoutes = [
      { title: "Nous Contacter", slug: "contact", isStatic: true },
      { title: "Espace Professionnels", slug: "pro", isStatic: true },
      { title: "Boutique d'objets 3D", slug: "boutique", isStatic: true },
      { title: "Suivi de Commande", slug: "suivi", isStatic: true }
    ];

    const matchedStatic = staticRoutes.filter(route => 
      route.title.toLowerCase().includes(q.toLowerCase()) || 
      route.slug.toLowerCase().includes(q.toLowerCase())
    );

    // Merge static pages and filter out duplicates by slug
    const allPages = [...formattedPages];
    matchedStatic.forEach(st => {
      if (!allPages.some(ap => ap.slug === st.slug)) {
        allPages.push(st);
      }
    });

    return NextResponse.json({
      products,
      blogPosts,
      pages: allPages.slice(0, 5)
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de la recherche." },
      { status: 500 }
    );
  }
}
