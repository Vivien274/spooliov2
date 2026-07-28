import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const blogJsonPath = path.join(process.cwd(), "src/data/blog.json");

function getJsonPosts() {
  if (fs.existsSync(blogJsonPath)) {
    try {
      const content = fs.readFileSync(blogJsonPath, "utf8");
      const parsed = JSON.parse(content);
      return parsed.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: typeof p.title === "object" ? p.title?.rendered || "" : p.title || "",
        content: typeof p.content === "object" ? p.content?.rendered || "" : p.content || "",
        excerpt: typeof p.excerpt === "object" ? p.excerpt?.rendered || "" : p.excerpt || "",
        featuredImageUrl: p.featuredImageUrl || p.jetpack_featured_media_url || p.featured_image_src?.full?.[0] || null,
        status: p.status || "publish",
        date: p.date || new Date().toISOString(),
        metaTitle: p.metaTitle || (typeof p.title === "object" ? p.title?.rendered || "" : p.title || ""),
        metaDescription: p.metaDescription || (typeof p.excerpt === "object" ? p.excerpt?.rendered || "" : p.excerpt || ""),
        keywords: p.keywords || (Array.isArray(p.tags) ? p.tags.join(", ") : ""),
      }));
    } catch (e) {
      console.error("Error reading blog.json:", e);
    }
  }
  return [];
}

function updateJsonFile(newOrUpdatedPost: any, isDelete = false) {
  try {
    let currentJson = [];
    if (fs.existsSync(blogJsonPath)) {
      currentJson = JSON.parse(fs.readFileSync(blogJsonPath, "utf8"));
    }

    if (isDelete) {
      currentJson = currentJson.filter((p: any) => p.id !== newOrUpdatedPost.id && p.slug !== newOrUpdatedPost.slug);
    } else {
      const existingIdx = currentJson.findIndex((p: any) => p.id === newOrUpdatedPost.id || p.slug === newOrUpdatedPost.slug);
      const jsonObject = {
        id: newOrUpdatedPost.id,
        slug: newOrUpdatedPost.slug,
        status: newOrUpdatedPost.status,
        date: newOrUpdatedPost.date || new Date().toISOString(),
        title: { rendered: newOrUpdatedPost.title },
        excerpt: { rendered: newOrUpdatedPost.excerpt },
        content: { rendered: newOrUpdatedPost.content },
        jetpack_featured_media_url: newOrUpdatedPost.featuredImageUrl || "",
        featuredImageUrl: newOrUpdatedPost.featuredImageUrl || "",
        metaTitle: newOrUpdatedPost.metaTitle || newOrUpdatedPost.title,
        metaDescription: newOrUpdatedPost.metaDescription || newOrUpdatedPost.excerpt,
        keywords: newOrUpdatedPost.keywords || "",
      };

      if (existingIdx >= 0) {
        currentJson[existingIdx] = { ...currentJson[existingIdx], ...jsonObject };
      } else {
        currentJson.unshift(jsonObject);
      }
    }

    fs.writeFileSync(blogJsonPath, JSON.stringify(currentJson, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to update blog.json file:", err);
  }
}

// GET: Fetch all blog posts
export async function GET() {
  try {
    const timeoutPromise = new Promise<any[]>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 5000)
    );

    const queryPromise = prisma.blogPost.findMany({
      orderBy: { date: "desc" },
    });

    let dbPosts = await Promise.race([queryPromise, timeoutPromise]);
    const jsonPosts = getJsonPosts();

    let posts = [];
    if (dbPosts && dbPosts.length > 0) {
      posts = dbPosts.map((p: any) => {
        const jsonMatch = jsonPosts.find((jp: any) => jp.id === p.id || jp.slug === p.slug);
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          content: p.content,
          excerpt: p.excerpt || "",
          featuredImageUrl: p.featuredImageUrl || jsonMatch?.featuredImageUrl || null,
          status: p.status,
          date: p.date,
          metaTitle: jsonMatch?.metaTitle || p.title,
          metaDescription: jsonMatch?.metaDescription || p.excerpt || "",
          keywords: jsonMatch?.keywords || "",
        };
      });
    } else {
      posts = jsonPosts;
    }

    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error("API /api/admin/blog GET error, falling back to blog.json:", error.message);
    const posts = getJsonPosts();
    return NextResponse.json({ success: true, posts });
  }
}

// POST: Create a new blog post
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, content, excerpt, featuredImageUrl, status, metaTitle, metaDescription, keywords } = body;

    if (!title) {
      return NextResponse.json({ error: "Le titre est obligatoire" }, { status: 400 });
    }

    const generatedSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const postDate = new Date();

    let newPost: any = null;
    try {
      newPost = await prisma.blogPost.create({
        data: {
          title: title.trim(),
          slug: generatedSlug,
          content: content || "",
          excerpt: excerpt || "",
          featuredImageUrl: featuredImageUrl || null,
          status: status || "publish",
          date: postDate,
        },
      });
    } catch (dbErr: any) {
      console.warn("Prisma blog create error, fallback to JSON only:", dbErr.message);
      newPost = {
        id: Date.now(),
        title: title.trim(),
        slug: generatedSlug,
        content: content || "",
        excerpt: excerpt || "",
        featuredImageUrl: featuredImageUrl || null,
        status: status || "publish",
        date: postDate.toISOString(),
      };
    }

    // Sync to blog.json file
    updateJsonFile({
      id: newPost.id,
      title: newPost.title,
      slug: newPost.slug,
      content: newPost.content,
      excerpt: newPost.excerpt,
      featuredImageUrl: newPost.featuredImageUrl,
      status: newPost.status,
      date: newPost.date,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      keywords: keywords || "",
    });

    return NextResponse.json({ success: true, post: { ...newPost, metaTitle, metaDescription, keywords } });
  } catch (error: any) {
    console.error("API /api/admin/blog POST error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
