import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/loyalty/credit
 * Endpoint centralisé de gestion de fidélité pour Spoolio Manager (Caisse / Stand / Web)
 * 
 * Body parameters:
 * - query: ID de carte, QR Code, NFC UID ou Email client (Requis)
 * - pointsDelta: Nombre de points à ajouter (ex: +5) ou retirer (ex: -10) (Par défaut: 0)
 * - reason: Motif du mouvement (ex: "Achat Caisse Marché", "Utilisation Réduction 10€")
 * - customerName: Nom du client (optionnel lors de la création auto)
 * - customerEmail: Email du client (optionnel lors de la création auto)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, pointsDelta = 0, reason = "Mouvement de fidélité", customerName, customerEmail } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Veuillez fournir un identifiant de carte ou email (query)." },
        { status: 400 }
      );
    }

    const cleanQuery = query.trim().toLowerCase();
    const deltaNum = typeof pointsDelta === "number" ? pointsDelta : parseInt(pointsDelta, 10) || 0;

    // Search for existing card by ID or Email with 2.5s Promise.race timeout
    let card = (await Promise.race([
      prisma.loyaltyCard.findFirst({
        where: {
          OR: [
            { id: cleanQuery },
            { customerEmail: { equals: cleanQuery, mode: "insensitive" } }
          ]
        }
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Loyalty DB Timeout")), 2500))
    ])) as any;

    // Auto-create card if non-existent
    if (!card) {
      const cardId = cleanQuery.includes("@")
        ? `spoolio-${Math.random().toString(36).substring(2, 10)}`
        : cleanQuery;

      const emailToUse = cleanQuery.includes("@") ? cleanQuery : (customerEmail?.trim().toLowerCase() || null);

      card = (await Promise.race([
        prisma.loyaltyCard.create({
          data: {
            id: cardId,
            customerName: customerName || null,
            customerEmail: emailToUse,
            points: Math.max(0, deltaNum),
            history: JSON.stringify([
              {
                date: new Date().toISOString(),
                points: deltaNum >= 0 ? `+${deltaNum}` : `${deltaNum}`,
                reason: reason || "Création de la carte (Spoolio Manager)"
              }
            ])
          }
        }),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Loyalty Create Timeout")), 2500))
      ])) as any;
    } else if (deltaNum !== 0) {
      // Update existing card points and history
      const currentHistory = typeof card.history === "string"
        ? JSON.parse(card.history)
        : (Array.isArray(card.history) ? card.history : []);

      const newPoints = Math.max(0, card.points + deltaNum);
      const nextHistory = [
        {
          date: new Date().toISOString(),
          points: deltaNum >= 0 ? `+${deltaNum}` : `${deltaNum}`,
          reason: reason
        },
        ...currentHistory
      ];

      card = (await Promise.race([
        prisma.loyaltyCard.update({
          where: { id: card.id },
          data: {
            points: newPoints,
            customerName: customerName || card.customerName,
            customerEmail: customerEmail?.trim().toLowerCase() || card.customerEmail,
            history: JSON.stringify(nextHistory)
          }
        }),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Loyalty Update Timeout")), 2500))
      ])) as any;
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
  } catch (err: any) {
    console.error("POST /api/loyalty/credit Error:", err.message);
    return NextResponse.json(
      { error: err.message || "Impossible de mettre à jour la carte de fidélité." },
      { status: 500 }
    );
  }
}
