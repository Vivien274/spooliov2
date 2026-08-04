import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_COLORS } from "@/lib/defaultColors";

function getPrismaClient() {
  if (prisma && (prisma as any).color) return prisma;
  const { PrismaClient } = require("@prisma/client");
  return new PrismaClient();
}

export async function GET(req: Request) {
  try {
    const db = getPrismaClient();
    const { searchParams } = new URL(req.url);
    const availableOnly = searchParams.get("availableOnly") === "true";

    let colors = await db.color.findMany({
      where: availableOnly ? { isAvailable: true } : undefined,
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });

    // Auto-seed default colors if database table is empty
    if (colors.length === 0 && !availableOnly) {
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
    console.error("GET Public Colors Error:", err);
    return NextResponse.json({ error: "Impossible de récupérer les couleurs" }, { status: 500 });
  }
}
