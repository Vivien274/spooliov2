import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET a loyalty card details by ID or Email (public access)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");
    const query = (id || email || "").trim().toLowerCase();

    if (!query) {
      return NextResponse.json(
        { error: "Veuillez fournir un identifiant de carte ou un e-mail valide." },
        { status: 400 }
      );
    }

    const card = (await Promise.race([
      prisma.loyaltyCard.findFirst({
        where: {
          OR: [
            { id: query },
            { customerEmail: { equals: query, mode: "insensitive" } }
          ]
        }
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Loyalty GET Timeout")), 2500))
    ])) as any;

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
