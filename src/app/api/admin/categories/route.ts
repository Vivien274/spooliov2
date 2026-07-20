import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to slugify string
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove diacritical marks
    .replace(/\s+/g, "-") // replace spaces with -
    .replace(/[^\w\-]+/g, "") // remove all non-word chars
    .replace(/\-\-+/g, "-") // replace multiple - with single -
    .replace(/^-+/, "") // trim - from start of text
    .replace(/-+$/, ""); // trim - from end of text
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ categories });
  } catch (err: any) {
    console.error("GET Categories Error:", err);
    return NextResponse.json({ error: "Impossible de récupérer les catégories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Le nom de la catégorie est obligatoire" }, { status: 400 });
    }

    const slug = slugify(name);

    // Check if category name or slug already exists
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: name.trim() },
          { slug }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Cette catégorie existe déjà (nom ou slug similaire)" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug
      }
    });

    return NextResponse.json({ category });
  } catch (err: any) {
    console.error("POST Category Error:", err);
    return NextResponse.json({ error: "Impossible de créer la catégorie" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");

    if (!idStr) {
      return NextResponse.json({ error: "L'identifiant de la catégorie est manquant" }, { status: 400 });
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
    }

    // Check if there are products associated with this category
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json({
        error: `Impossible de supprimer cette catégorie car ${category._count.products} produit(s) y sont rattaché(s).`
      }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE Category Error:", err);
    return NextResponse.json({ error: "Impossible de supprimer la catégorie" }, { status: 500 });
  }
}
