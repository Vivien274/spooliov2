import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, apikey, Prefer",
};

// OPTIONS: Preflight requests for cross-origin communication (Spoolio Manager <-> SpoolioV2)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// GET: Fetch loyalty card details by ID or Email
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");
    const query = (id || email || "").trim().toLowerCase();

    if (!query) {
      return NextResponse.json(
        { error: "Veuillez fournir un identifiant de carte ou un e-mail valide." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Base de données indisponible." },
        { status: 503, headers: corsHeaders }
      );
    }

    const card = await prisma.loyaltyCard.findFirst({
      where: {
        OR: [
          { id: query },
          { customerEmail: { equals: query, mode: "insensitive" } },
        ],
      },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Cette carte de fidélité n'existe pas." },
        { status: 404, headers: corsHeaders }
      );
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
  } catch (e: any) {
    console.error("GET /api/loyalty error:", e?.message);
    return NextResponse.json(
      { error: e.message || "Erreur de base de données." },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST: Create or upsert a loyalty card (called by Spoolio Manager or checkout)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, customerName, customerEmail, points = 0, maxPoints = 100, history } = body;

    if (!id || typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        { error: "L'identifiant de la carte (UID/NFC) est requis." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Base de données indisponible." },
        { status: 503, headers: corsHeaders }
      );
    }

    const cleanId = id.trim().toLowerCase();
    const cleanEmail = customerEmail ? customerEmail.trim().toLowerCase() : null;
    const pointsNum = parseInt(points, 10) || 0;
    const maxPointsNum = parseInt(maxPoints, 10) || 100;

    const initialHistory = history
      ? (typeof history === "string" ? history : JSON.stringify(history))
      : JSON.stringify([
          {
            date: new Date().toISOString(),
            points: `+${pointsNum}`,
            reason: "Création de la carte (Spoolio Manager)",
          },
        ]);

    // Check if card already exists -> update it (upsert)
    const existing = await prisma.loyaltyCard.findUnique({
      where: { id: cleanId },
    });

    let card;
    if (existing) {
      card = await prisma.loyaltyCard.update({
        where: { id: cleanId },
        data: {
          customerName: customerName !== undefined ? (customerName ? customerName.trim() : null) : existing.customerName,
          customerEmail: cleanEmail !== null ? cleanEmail : existing.customerEmail,
          points: points !== undefined ? pointsNum : existing.points,
          maxPoints: maxPoints !== undefined ? maxPointsNum : existing.maxPoints,
          ...(history ? { history: typeof history === "string" ? JSON.parse(history) : history } : {}),
        },
      });
    } else {
      card = await prisma.loyaltyCard.create({
        data: {
          id: cleanId,
          customerName: customerName ? customerName.trim() : null,
          customerEmail: cleanEmail,
          points: pointsNum,
          maxPoints: maxPointsNum,
          history: initialHistory,
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
  } catch (e: any) {
    console.error("POST /api/loyalty error:", e?.message);
    return NextResponse.json(
      { error: e.message || "Erreur de création de la carte." },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT: Update an existing loyalty card
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, customerName, customerEmail, points, maxPoints, history } = body;

    if (!id) {
      return NextResponse.json(
        { error: "L'identifiant de la carte est requis." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Base de données indisponible." },
        { status: 503, headers: corsHeaders }
      );
    }

    const cleanId = id.trim().toLowerCase();

    const updatedCard = await prisma.loyaltyCard.update({
      where: { id: cleanId },
      data: {
        customerName: customerName !== undefined ? (customerName ? customerName.trim() : null) : undefined,
        customerEmail: customerEmail !== undefined ? (customerEmail ? customerEmail.trim().toLowerCase() : null) : undefined,
        points: points !== undefined ? parseInt(points, 10) : undefined,
        maxPoints: maxPoints !== undefined ? parseInt(maxPoints, 10) : undefined,
        history: history ? (typeof history === "string" ? JSON.parse(history) : history) : undefined,
      },
    });

    return NextResponse.json(
      {
        success: true,
        card: {
          id: updatedCard.id,
          customerName: updatedCard.customerName,
          customerEmail: updatedCard.customerEmail,
          points: updatedCard.points,
          maxPoints: updatedCard.maxPoints,
          createdAt: updatedCard.createdAt,
          history: typeof updatedCard.history === "string" ? JSON.parse(updatedCard.history) : updatedCard.history,
        },
      },
      { headers: corsHeaders }
    );
  } catch (e: any) {
    console.error("PUT /api/loyalty error:", e?.message);
    return NextResponse.json(
      { error: e.message || "Erreur de modification." },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE: Delete a loyalty card
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "L'identifiant de la carte est requis." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Base de données indisponible." },
        { status: 503, headers: corsHeaders }
      );
    }

    await prisma.loyaltyCard.delete({
      where: { id: id.trim().toLowerCase() },
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (e: any) {
    console.error("DELETE /api/loyalty error:", e?.message);
    return NextResponse.json(
      { error: e.message || "Erreur de suppression." },
      { status: 500, headers: corsHeaders }
    );
  }
}
