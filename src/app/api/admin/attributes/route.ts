import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const attributes = await prisma.attribute.findMany({
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ attributes });
  } catch (err: any) {
    console.error("GET Attributes Error:", err);
    return NextResponse.json({ error: "Impossible de récupérer les attributs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, values } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Le nom de l'attribut est obligatoire" }, { status: 400 });
    }

    // Check if attribute with same name already exists
    const existing = await prisma.attribute.findUnique({
      where: { name: name.trim() }
    });

    if (existing) {
      return NextResponse.json({ error: "Un attribut avec ce nom existe déjà" }, { status: 400 });
    }

    const attribute = await prisma.attribute.create({
      data: {
        name: name.trim(),
        values: values ? values.trim() : ""
      }
    });

    return NextResponse.json({ attribute });
  } catch (err: any) {
    console.error("POST Attribute Error:", err);
    return NextResponse.json({ error: "Impossible de créer l'attribut" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, values } = body;

    if (!id) {
      return NextResponse.json({ error: "Identifiant de l'attribut manquant" }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Le nom de l'attribut est obligatoire" }, { status: 400 });
    }

    const attrId = parseInt(id, 10);
    if (isNaN(attrId)) {
      return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
    }

    // Check duplicate name excluding current attribute
    const existing = await prisma.attribute.findFirst({
      where: {
        name: name.trim(),
        NOT: { id: attrId }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Un autre attribut possède déjà ce nom" }, { status: 400 });
    }

    const attribute = await prisma.attribute.update({
      where: { id: attrId },
      data: {
        name: name.trim(),
        values: values ? values.trim() : ""
      }
    });

    return NextResponse.json({ attribute });
  } catch (err: any) {
    console.error("PUT Attribute Error:", err);
    return NextResponse.json({ error: "Impossible de mettre à jour l'attribut" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");

    if (!idStr) {
      return NextResponse.json({ error: "L'identifiant de l'attribut est manquant" }, { status: 400 });
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
    }

    // Check if attribute exists
    const attribute = await prisma.attribute.findUnique({
      where: { id }
    });

    if (!attribute) {
      return NextResponse.json({ error: "Attribut introuvable" }, { status: 404 });
    }

    await prisma.attribute.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE Attribute Error:", err);
    return NextResponse.json({ error: "Impossible de supprimer l'attribut" }, { status: 500 });
  }
}
