import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Veuillez fournir un session_id valide." },
        { status: 400 }
      );
    }

    // 1. If it's a simulated order, the orderId is embedded inside the session_id
    if (sessionId.startsWith("sim_")) {
      const orderId = sessionId.replace("sim_", "");
      // Check if it exists in the database
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      let loyaltyCard = null;
      if (order && order.email) {
        const card = await prisma.loyaltyCard.findFirst({
          where: {
            customerEmail: {
              equals: order.email.trim().toLowerCase(),
              mode: "insensitive"
            }
          }
        });
        if (card) {
          loyaltyCard = {
            id: card.id,
            customerName: card.customerName,
            points: card.points,
            maxPoints: card.maxPoints,
            history: typeof card.history === "string" ? JSON.parse(card.history) : card.history
          };
        }
      }

      return NextResponse.json({ 
        success: true, 
        orderId: order ? order.id : orderId,
        loyaltyCard
      });
    }

    // 2. Otherwise, look up the order in the Prisma database by its stripeSession token
    const order = await prisma.order.findFirst({
      where: { stripeSession: sessionId }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Aucune commande trouvée pour cette session de paiement." },
        { status: 404 }
      );
    }

    // Look up loyalty card associated with this order's customer email
    let loyaltyCard = null;
    if (order.email) {
      const card = await prisma.loyaltyCard.findFirst({
        where: {
          customerEmail: {
            equals: order.email.trim().toLowerCase(),
            mode: "insensitive"
          }
        }
      });
      if (card) {
        loyaltyCard = {
          id: card.id,
          customerName: card.customerName,
          points: card.points,
          maxPoints: card.maxPoints,
          history: typeof card.history === "string" ? JSON.parse(card.history) : card.history
        };
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      loyaltyCard
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur de base de données." },
      { status: 500 }
    );
  }
}
