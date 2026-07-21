import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET a loyalty card details by ID (public access, no-auth)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Veuillez fournir un identifiant de carte valide." },
        { status: 400 }
      );
    }

    const card = await prisma.loyaltyCard.findUnique({
      where: { id: id.trim().toLowerCase() }
    });

    if (!card) {
      return NextResponse.json(
        { error: "Cette carte de fidélité n'existe pas." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      card: {
        id: card.id,
        customerName: card.customerName,
        customerEmail: card.customerEmail,
        points: card.points,
        maxPoints: card.maxPoints,
        createdAt: card.createdAt,
        history: typeof card.history === "string" ? JSON.parse(card.history) : card.history
      }
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur de base de données." },
      { status: 500 }
    );
  }
}
