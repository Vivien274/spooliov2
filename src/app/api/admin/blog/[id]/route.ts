import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const blogJsonPath = path.join(process.cwd(), "src/data/blog.json");

function updateJsonFile(idOrSlug: string | number, updatedData: any, isDelete = false) {
  try {
    if (!fs.existsSync(blogJsonPath)) return;
    let currentJson = JSON.parse(fs.readFileSync(blogJsonPath, "utf8"));

    const numId = Number(idOrSlug);

    if (isDelete) {
      currentJson = currentJson.filter((p: any) => p.id !== numId && p.slug !== String(idOrSlug));
    } else {
      const idx = currentJson.findIndex((p: any) => p.id === numId || p.slug === String(idOrSlug) || p.slug === updatedData.slug);
      if (idx >= 0) {
        currentJson[idx] = {
          ...currentJson[idx],
          title: { rendered: updatedData.title },
          slug: updatedData.slug,
          content: { rendered: updatedData.content },
          excerpt: { rendered: updatedData.excerpt },
          jetpack_featured_media_url: updatedData.featuredImageUrl || "",
          featuredImageUrl: updatedData.featuredImageUrl || "",
          status: updatedData.status,
          metaTitle: updatedData.metaTitle || updatedData.title,
          metaDescription: updatedData.metaDescription || updatedData.excerpt,
          keywords: updatedData.keywords || "",
        };
      }
    }

    fs.writeFileSync(blogJsonPath, JSON.stringify(currentJson, null, 2), "utf8");
  } catch (err) {
    console.error("Error updating blog.json in [id] route:", err);
  }
}

// PUT: Update an existing article
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, slug, content, excerpt, featuredImageUrl, status, metaTitle, metaDescription, keywords } = body;

    const numId = Number(id);
    const isValidNumId = !isNaN(numId);

    const generatedSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      : title ? title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : "";

    let updatedPost: any = null;

    try {
      if (isValidNumId) {
        updatedPost = await prisma.blogPost.update({
          where: { id: numId },
          data: {
            ...(title && { title: title.trim() }),
            ...(generatedSlug && { slug: generatedSlug }),
            ...(content !== undefined && { content }),
            ...(excerpt !== undefined && { excerpt }),
            ...(featuredImageUrl !== undefined && { featuredImageUrl }),
            ...(status && { status }),
          },
        });
      } else {
        updatedPost = await prisma.blogPost.update({
          where: { slug: id },
          data: {
            ...(title && { title: title.trim() }),
            ...(generatedSlug && { slug: generatedSlug }),
            ...(content !== undefined && { content }),
            ...(excerpt !== undefined && { excerpt }),
            ...(featuredImageUrl !== undefined && { featuredImageUrl }),
            ...(status && { status }),
          },
        });
      }
    } catch (dbErr: any) {
      console.warn("Prisma update failed, updated in JSON only:", dbErr.message);
      updatedPost = {
        id: isValidNumId ? numId : id,
        title,
        slug: generatedSlug || id,
        content,
        excerpt,
        featuredImageUrl,
        status,
      };
    }

    updateJsonFile(id, {
      title: updatedPost.title,
      slug: updatedPost.slug,
      content: updatedPost.content,
      excerpt: updatedPost.excerpt,
      featuredImageUrl: updatedPost.featuredImageUrl,
      status: updatedPost.status,
      metaTitle,
      metaDescription,
      keywords,
    });

    return NextResponse.json({
      success: true,
      post: { ...updatedPost, metaTitle, metaDescription, keywords },
    });
  } catch (error: any) {
    console.error("API /api/admin/blog/[id] PUT error:", error);
    return NextResponse.json({ error: error.message || "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// DELETE: Delete an article
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    const isValidNumId = !isNaN(numId);

    try {
      if (isValidNumId) {
        await prisma.blogPost.delete({ where: { id: numId } });
      } else {
        await prisma.blogPost.delete({ where: { slug: id } });
      }
    } catch (dbErr: any) {
      console.warn("Prisma delete failed, deleting from JSON:", dbErr.message);
    }

    updateJsonFile(id, null, true);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API /api/admin/blog/[id] DELETE error:", error);
    return NextResponse.json({ error: error.message || "Erreur de suppression" }, { status: 500 });
  }
}
