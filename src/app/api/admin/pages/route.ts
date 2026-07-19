import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// GET: List all pages OR retrieve detailed page content by slug
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const page = await prisma.page.findUnique({
        where: { slug }
      });
      
      if (!page) {
        return NextResponse.json({ error: "Page non trouvée." }, { status: 404 });
      }

      return NextResponse.json({ success: true, page });
    }

    const pages = await prisma.page.findMany({
      orderBy: {
        date: "desc"
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        date: true
      }
    });

    return NextResponse.json({ success: true, pages });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de la récupération des pages." },
      { status: 500 }
    );
  }
}

// POST: Update or create a page (Admin only)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spoolio_admin_session")?.value;
    const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";
    
    if (!token || !(await verifySession(token, secret))) {
      return NextResponse.json(
        { error: "Accès refusé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { id, title, slug, content, status } = await request.json();

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires (Titre, Slug et Contenu)." },
        { status: 400 }
      );
    }

    let page;
    if (id) {
      // Update existing page
      page = await prisma.page.update({
        where: { id: Number(id) },
        data: {
          title,
          slug,
          content,
          status: status || "publish"
        }
      });
      console.log(`[Admin Update] Page "${title}" mise à jour.`);
    } else {
      // Create new page
      page = await prisma.page.create({
        data: {
          title,
          slug,
          content,
          status: status || "publish"
        }
      });
      console.log(`[Admin Create] Page "${title}" créée.`);
    }

    return NextResponse.json({ success: true, page, message: "Page enregistrée avec succès." });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de l'enregistrement de la page." },
      { status: 500 }
    );
  }
}
