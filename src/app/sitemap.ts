import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { BUSINESS_CONFIG } from "@/lib/businessConfig";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BUSINESS_CONFIG.siteUrl;

  // 1. Pages statiques indexables
  // RÈGLE SEO : Ne pas inventer de date lastModified arbitraire sans source vérifiable (CMS/BDD)
  const staticRoutes: Array<{ route: string; changeFrequency: "daily" | "weekly" | "monthly"; priority: number }> = [
    { route: "", changeFrequency: "daily", priority: 1.0 },
    { route: "/boutique", changeFrequency: "daily", priority: 0.9 },
    { route: "/boussole-sensorielle", changeFrequency: "weekly", priority: 0.8 },
    { route: "/pochette-surprise", changeFrequency: "weekly", priority: 0.8 },
    { route: "/createur-cliqueur", changeFrequency: "weekly", priority: 0.8 },
    { route: "/jeux-de-societe", changeFrequency: "weekly", priority: 0.8 },
    { route: "/calendrier-avent", changeFrequency: "weekly", priority: 0.8 },
    { route: "/carte-cadeau", changeFrequency: "monthly", priority: 0.7 },
    { route: "/fidelite", changeFrequency: "monthly", priority: 0.7 },
    { route: "/a-propos", changeFrequency: "monthly", priority: 0.7 },
    { route: "/pro", changeFrequency: "monthly", priority: 0.7 },
    { route: "/contact", changeFrequency: "monthly", priority: 0.6 },
    { route: "/faq", changeFrequency: "monthly", priority: 0.6 },
    { route: "/mentions-legales", changeFrequency: "monthly", priority: 0.4 },
    { route: "/cgv", changeFrequency: "monthly", priority: 0.4 },
    { route: "/cookies", changeFrequency: "monthly", priority: 0.4 },
    { route: "/retours", changeFrequency: "monthly", priority: 0.4 },
    { route: "/blog", changeFrequency: "weekly", priority: 0.7 },
    { route: "/tombola", changeFrequency: "weekly", priority: 0.6 },
    { route: "/don", changeFrequency: "monthly", priority: 0.5 },
    { route: "/liens", changeFrequency: "monthly", priority: 0.5 },
    { route: "/medaillon-nfc-chien-chat", changeFrequency: "monthly", priority: 0.7 },
  ];

  const staticPages: MetadataRoute.Sitemap = staticRoutes.map((item) => ({
    url: `${baseUrl}${item.route}`,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  // 2. Catégories commerciales actives et non vides
  const categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          where: { status: "publish" },
          select: { dateCreated: true },
          orderBy: { dateCreated: "desc" },
          take: 1,
        },
      },
    });

    const excludedCategorySlugs = new Set(["action", "non-classe", "planche-bois", "figurines"]);
    const processedSlugs = new Set<string>();

    const activeCategories = categories.filter(
      (c) => c.products.length > 0 && !excludedCategorySlugs.has(c.slug)
    );

    for (const cat of activeCategories) {
      if (processedSlugs.has(cat.slug)) continue;
      processedSlugs.add(cat.slug);

      const entry: MetadataRoute.Sitemap[number] = {
        url: `${baseUrl}/categorie/${cat.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      };
      if (cat.products[0]?.dateCreated) {
        entry.lastModified = new Date(cat.products[0].dateCreated);
      }
      categoryPages.push(entry);
    }
  } catch (e) {
    console.warn("Failed loading categories for sitemap:", e);
  }

  // 3. Produits publiés avec slug valide et prix achetable réel
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const dbProducts = await prisma.product.findMany({
      where: {
        status: "publish",
      },
      select: {
        slug: true,
        price: true,
        dateCreated: true,
      },
    });

    if (dbProducts && Array.isArray(dbProducts)) {
      // Filtrer les slugs invalides et les produits sans prix achetable réel
      const validProducts = dbProducts.filter((p) => {
        if (!/^[a-z0-9-]+$/.test(p.slug)) return false;
        const numPrice = parseFloat(p.price);
        if (isNaN(numPrice) || numPrice <= 0) return false;
        return true;
      });

      productPages = validProducts.map((p) => {
        const entry: MetadataRoute.Sitemap[number] = {
          url: `${baseUrl}/product/${p.slug}`,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        };
        if (p.dateCreated) {
          entry.lastModified = new Date(p.dateCreated);
        }
        return entry;
      });
    }
  } catch (e) {
    console.warn("Failed loading products for sitemap:", e);
  }

  // 4. Articles de blog publiés avec date réelle
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const dbPosts = await prisma.blogPost.findMany({
      where: {
        status: "publish",
      },
      select: {
        slug: true,
        date: true,
      },
    });

    if (dbPosts && Array.isArray(dbPosts)) {
      blogPages = dbPosts.map((p) => {
        const entry: MetadataRoute.Sitemap[number] = {
          url: `${baseUrl}/blog/${p.slug}`,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        };
        if (p.date) {
          entry.lastModified = new Date(p.date);
        }
        return entry;
      });
    }
  } catch (e) {
    console.warn("Failed loading blog posts for sitemap:", e);
  }

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages];
}
