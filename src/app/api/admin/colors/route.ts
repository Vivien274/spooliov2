import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_COLORS } from "@/lib/defaultColors";

function getPrismaClient() {
  if (prisma && (prisma as any).color) return prisma;
  const { PrismaClient } = require("@prisma/client");
  return new PrismaClient();
}

export async function GET() {
  try {
    const db = getPrismaClient();
    let colors = await db.color.findMany({
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });

    // Auto-seed default colors if database table is empty
    if (colors.length === 0) {
      console.log("🎨 Seeding default color palette into database...");
      await db.color.createMany({
        data: DEFAULT_COLORS.map((c) => ({
          name: c.name,
          category: c.category,
          className: c.className || null,
          style: c.style || null,
          description: c.description,
          isAvailable: c.isAvailable,
          position: c.position,
        })),
        skipDuplicates: true,
      });

      colors = await db.color.findMany({
        orderBy: [{ position: "asc" }, { id: "asc" }],
      });
    }

    return NextResponse.json({ colors });
  } catch (err: any) {
    console.error("GET Admin Colors Error:", err);
    return NextResponse.json({ error: "Impossible de récupérer les couleurs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = getPrismaClient();
    const body = await req.json();
    const { name, category, className, style, description, isAvailable, position } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Le nom de la couleur est obligatoire" }, { status: 400 });
    }

    const existing = await db.color.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "Une couleur avec ce nom existe déjà" }, { status: 400 });
    }

    const maxPosColor = await db.color.findFirst({
      orderBy: { position: "desc" },
    });
    const nextPos = position !== undefined ? parseInt(position, 10) : (maxPosColor ? maxPosColor.position + 1 : 1);

    const newColor = await db.color.create({
      data: {
        name: name.trim(),
        category: category || "UNIS",
        className: className ? className.trim() : null,
        style: style ? style.trim() : null,
        description: description ? description.trim() : "",
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        position: isNaN(nextPos) ? 1 : nextPos,
      },
    });

    return NextResponse.json({ color: newColor });
  } catch (err: any) {
    console.error("POST Admin Color Error:", err);
    return NextResponse.json({ error: "Impossible de créer la couleur" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const db = getPrismaClient();
    const body = await req.json();
    const { id, name, category, className, style, description, isAvailable, position } = body;

    if (!id) {
      return NextResponse.json({ error: "Identifiant de la couleur manquant" }, { status: 400 });
    }

    const colorId = parseInt(id, 10);
    if (isNaN(colorId)) {
      return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
    }

    // Check duplicate name if name is changing
    if (name && name.trim()) {
      const existing = await db.color.findFirst({
        where: {
          name: name.trim(),
          NOT: { id: colorId },
        },
      });

      if (existing) {
        return NextResponse.json({ error: "Une autre couleur possède déjà ce nom" }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category;
    if (className !== undefined) updateData.className = className ? className.trim() : null;
    if (style !== undefined) updateData.style = style ? style.trim() : null;
    if (description !== undefined) updateData.description = description ? description.trim() : "";
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);
    if (position !== undefined) updateData.position = parseInt(position, 10);

    const updatedColor = await db.color.update({
      where: { id: colorId },
      data: updateData,
    });

    return NextResponse.json({ color: updatedColor });
  } catch (err: any) {
    console.error("PUT Admin Color Error:", err);
    return NextResponse.json({ error: "Impossible de mettre à jour la couleur" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const db = getPrismaClient();
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");

    if (!idStr) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
    }

    await db.color.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE Admin Color Error:", err);
    return NextResponse.json({ error: "Impossible de supprimer la couleur" }, { status: 500 });
  }
}
