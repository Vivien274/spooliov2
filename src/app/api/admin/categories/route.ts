import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to slugify string
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export async function GET() {
  try {
    const categories = (await Promise.race([
      prisma.category.findMany({
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: { name: "asc" }
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Category DB Timeout 2.5s")), 2500))
    ])) as any[];

    return NextResponse.json({ categories: categories || [] });
  } catch (err: any) {
    console.warn("GET Categories Error / Timeout, returning fallback list:", err.message);
    const fallbackCategories = [
      { id: 21, name: "Accessoires" },
      { id: 22, name: "Accessoires & Petits Objets" },
      { id: 23, name: "Animaux & Figurines" },
      { id: 24, name: "Décoration" },
      { id: 25, name: "Fidgets" },
      { id: 26, name: "Geek / Gaming" },
      { id: 27, name: "Geek & Gaming" },
      { id: 28, name: "Jeux & activités" },
      { id: 29, name: "Jeux & Activités" },
      { id: 30, name: "Les Fidgets" },
      { id: 31, name: "Les Gadgetoïds" },
      { id: 33, name: "Porte clés" }
    ];
    return NextResponse.json({ categories: fallbackCategories });
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

    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: name.trim(), mode: "insensitive" } },
          { slug: slug }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Une catégorie avec ce nom existe déjà" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (err: any) {
    console.error("POST Category Error:", err);
    return NextResponse.json({ error: "Impossible de créer la catégorie" }, { status: 500 });
  }
}
