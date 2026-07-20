import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://spoolio.fr";

  // 1. Static Pages
  const staticPages = [
    "",
    "/boutique",
    "/pro",
    "/contact",
    "/suivi",
    "/mentions-legales",
    "/cgv",
    "/cookies",
    "/faq",
    "/retours",
    "/blog"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8
  }));

  // 2. Fetch Products slugs from DB
  let productPages: any[] = [];
  try {
    const dbProducts = await prisma.product.findMany({
      select: {
        slug: true,
        dateCreated: true
      }
    });
    productPages = dbProducts.map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: new Date(p.dateCreated),
      changeFrequency: "weekly" as const,
      priority: 0.7
    }));
  } catch (e) {
    console.error("Failed to load products for sitemap:", e);
  }

  // 3. Fetch Blog posts slugs from DB
  let blogPages: any[] = [];
  try {
    const dbPosts = await prisma.blogPost.findMany({
      where: {
        status: "publish"
      },
      select: {
        slug: true,
        date: true
      }
    });
    blogPages = dbPosts.map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "weekly" as const,
      priority: 0.6
    }));
  } catch (e) {
    console.error("Failed to load blog posts for sitemap:", e);
  }

  return [...staticPages, ...productPages, ...blogPages];
}
