import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, apikey, Prefer",
};

// OPTIONS: Preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// GET /api/loyalty/credit: Quick check
export async function GET() {
  return NextResponse.json(
    { status: "online", message: "Spoolio Loyalty Credit API ready" },
    { headers: corsHeaders }
  );
}

/**
 * POST /api/loyalty/credit
 * Endpoint centralisé de gestion de fidélité pour Spoolio Manager (Caisse / Stand / Web)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, pointsDelta = 0, reason = "Mouvement de fidélité", customerName, customerEmail } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Veuillez fournir un identifiant de carte ou email (query)." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Base de données indisponible." },
        { status: 503, headers: corsHeaders }
      );
    }

    const cleanQuery = query.trim().toLowerCase();
    const deltaNum = typeof pointsDelta === "number" ? pointsDelta : parseInt(pointsDelta, 10) || 0;

    // Search for existing card by ID or Email
    let card = await prisma.loyaltyCard.findFirst({
      where: {
        OR: [
          { id: cleanQuery },
          { customerEmail: { equals: cleanQuery, mode: "insensitive" } },
        ],
      },
    });

    // Auto-create card if non-existent
    if (!card) {
      const cardId = cleanQuery.includes("@")
        ? `spoolio-${Math.random().toString(36).substring(2, 10)}`
        : cleanQuery;

      const emailToUse = cleanQuery.includes("@") ? cleanQuery : (customerEmail?.trim().toLowerCase() || null);

      card = await prisma.loyaltyCard.create({
        data: {
          id: cardId,
          customerName: customerName ? customerName.trim() : null,
          customerEmail: emailToUse,
          points: Math.max(0, deltaNum),
          history: JSON.stringify([
            {
              date: new Date().toISOString(),
              points: deltaNum >= 0 ? `+${deltaNum}` : `${deltaNum}`,
              reason: reason || "Création de la carte (Spoolio Manager)",
            },
          ]),
        },
      });
    } else if (deltaNum !== 0 || customerName || customerEmail) {
      // Update existing card points and history
      const currentHistory = typeof card.history === "string"
        ? JSON.parse(card.history)
        : (Array.isArray(card.history) ? card.history : []);

      const newPoints = Math.max(0, card.points + deltaNum);
      const nextHistory = deltaNum !== 0
        ? [
            {
              date: new Date().toISOString(),
              points: deltaNum >= 0 ? `+${deltaNum}` : `${deltaNum}`,
              reason: reason,
            },
            ...currentHistory,
          ]
        : currentHistory;

      card = await prisma.loyaltyCard.update({
        where: { id: card.id },
        data: {
          points: newPoints,
          customerName: customerName ? customerName.trim() : card.customerName,
          customerEmail: customerEmail?.trim().toLowerCase() || card.customerEmail,
          history: JSON.stringify(nextHistory),
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        card: {
          id: card.id,
          customerName: card.customerName,
          customerEmail: card.customerEmail,
          points: card.points,
          maxPoints: card.maxPoints,
          createdAt: card.createdAt,
          history: typeof card.history === "string" ? JSON.parse(card.history) : card.history,
        },
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("POST /api/loyalty/credit Error:", err?.message);
    return NextResponse.json(
      { error: err.message || "Impossible de mettre à jour la carte de fidélité." },
      { status: 500, headers: corsHeaders }
    );
  }
}
