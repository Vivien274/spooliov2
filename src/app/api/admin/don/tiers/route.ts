import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all tiers (active & inactive)
export async function GET() {
  try {
    const tiers = await prisma.donationTier.findMany({
      orderBy: { amount: "asc" }
    });
    return NextResponse.json({ success: true, tiers });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur de chargement." }, { status: 500 });
  }
}

// POST create a new tier
export async function POST(request: Request) {
  try {
    const { amount, title, subtitle, description, emoji, color, isActive } = await request.json();

    if (!amount || !title || !subtitle || !description || !emoji) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    const newTier = await prisma.donationTier.create({
      data: {
        amount: parseInt(amount, 10),
        title,
        subtitle,
        description,
        emoji,
        color: color || "orange",
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({ success: true, tier: newTier });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur de création." }, { status: 500 });
  }
}

// PUT modify an existing tier
export async function PUT(request: Request) {
  try {
    const { id, amount, title, subtitle, description, emoji, color, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID du palier manquant." }, { status: 400 });
    }

    const updatedTier = await prisma.donationTier.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseInt(amount, 10) : undefined,
        title,
        subtitle,
        description,
        emoji,
        color,
        isActive
      }
    });

    return NextResponse.json({ success: true, tier: updatedTier });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur de modification." }, { status: 500 });
  }
}

// DELETE a tier
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID du palier manquant." }, { status: 400 });
    }

    await prisma.donationTier.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur de suppression." }, { status: 500 });
  }
}
