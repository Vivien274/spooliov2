import { NextResponse } from "next/server";
import { sendLoyaltyCardEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, apikey",
};

// OPTIONS: Preflight request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// POST: Send loyalty card details or reward notification by email
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cardId, email, name, points, maxPoints, isReward } = body;

    if (!cardId || !email) {
      return NextResponse.json(
        { error: "Identifiant de carte et adresse e-mail requis." },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const pointsNum = typeof points === "number" ? points : parseInt(points, 10) || 0;
    const maxPointsNum = typeof maxPoints === "number" ? maxPoints : parseInt(maxPoints, 10) || 100;

    const result = await sendLoyaltyCardEmail({
      cardId: cardId.trim(),
      customerName: name || null,
      customerEmail: cleanEmail,
      points: pointsNum,
      maxPoints: maxPointsNum,
      isReward: !!isReward,
    });

    if (result.success) {
      return NextResponse.json(
        { success: true, message: "E-mail de fidélité envoyé avec succès !" },
        { headers: corsHeaders }
      );
    } else {
      return NextResponse.json(
        { error: result.error || "Impossible d'envoyer l'e-mail." },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (err: any) {
    console.error("POST /api/loyalty/send-email Error:", err?.message);
    return NextResponse.json(
      { error: err.message || "Erreur lors de l'envoi de l'e-mail." },
      { status: 500, headers: corsHeaders }
    );
  }
}
