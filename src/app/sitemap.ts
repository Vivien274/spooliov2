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

  // 2. Fetch Products slugs from DB (with 3s Promise.race timeout to guarantee build success)
  let productPages: any[] = [];
  try {
    const dbProducts = (await Promise.race([
      prisma.product.findMany({
        select: {
          slug: true,
          dateCreated: true
        }
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Sitemap Products Timeout 3s")), 3000))
    ])) as any[];

    if (dbProducts && Array.isArray(dbProducts)) {
      productPages = dbProducts.map((p) => ({
        url: `${baseUrl}/product/${p.slug}`,
        lastModified: p.dateCreated ? new Date(p.dateCreated) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7
      }));
    }
  } catch (e) {
    console.warn("Failed or timed out loading products for sitemap:", e);
  }

  // 3. Fetch Blog posts slugs from DB (with 3s Promise.race timeout)
  let blogPages: any[] = [];
  try {
    const dbPosts = (await Promise.race([
      prisma.blogPost.findMany({
        where: {
          status: "publish"
        },
        select: {
          slug: true,
          date: true
        }
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Sitemap Blog Timeout 3s")), 3000))
    ])) as any[];

    if (dbPosts && Array.isArray(dbPosts)) {
      blogPages = dbPosts.map((p) => ({
        url: `${baseUrl}/blog/${p.slug}`,
        lastModified: p.date ? new Date(p.date) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6
      }));
    }
  } catch (e) {
    console.warn("Failed or timed out loading blog posts for sitemap:", e);
  }

  return [...staticPages, ...productPages, ...blogPages];
}
