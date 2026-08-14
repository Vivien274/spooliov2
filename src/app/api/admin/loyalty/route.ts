import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, apikey, Prefer",
};

// OPTIONS: Preflight request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// GET all loyalty cards (supports search by name, email, or id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!prisma) {
      return NextResponse.json({ error: "Base de données indisponible." }, { status: 503, headers: corsHeaders });
    }

    let cards: any[];
    if (q) {
      const lowerQ = q.trim().toLowerCase();
      cards = await prisma.loyaltyCard.findMany({
        where: {
          OR: [
            { id: { contains: lowerQ, mode: "insensitive" } },
            { customerName: { contains: lowerQ, mode: "insensitive" } },
            { customerEmail: { contains: lowerQ, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      cards = await prisma.loyaltyCard.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    const formattedCards = (cards || []).map((c) => ({
      ...c,
      history: typeof c.history === "string" ? JSON.parse(c.history) : c.history,
    }));

    return NextResponse.json({ success: true, cards: formattedCards }, { headers: corsHeaders });
  } catch (e: any) {
    console.error("GET /api/admin/loyalty error:", e?.message);
    return NextResponse.json({ error: e.message || "Erreur de chargement." }, { status: 500, headers: corsHeaders });
  }
}

// POST create a new loyalty card
export async function POST(request: Request) {
  try {
    const { id, customerName, customerEmail, points, maxPoints } = await request.json();

    if (!id || typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ error: "L'identifiant de la carte (UID/NFC) est requis." }, { status: 400, headers: corsHeaders });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Base de données indisponible." }, { status: 503, headers: corsHeaders });
    }

    const cleanId = id.trim().toLowerCase();
    const cleanEmail = customerEmail ? customerEmail.trim().toLowerCase() : null;
    const pointsNum = points !== undefined ? parseInt(points, 10) : 0;
    const maxPointsNum = maxPoints !== undefined ? parseInt(maxPoints, 10) : 100;

    // Check if card already exists -> upsert / update
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
          history: JSON.stringify([
            {
              date: new Date().toISOString(),
              points: `+${pointsNum}`,
              reason: "Création de la carte (Spoolio Manager)",
            },
          ]),
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        card: {
          ...card,
          history: typeof card.history === "string" ? JSON.parse(card.history) : card.history,
        },
      },
      { headers: corsHeaders }
    );
  } catch (e: any) {
    console.error("POST /api/admin/loyalty error:", e?.message);
    return NextResponse.json({ error: e.message || "Erreur de création." }, { status: 500, headers: corsHeaders });
  }
}

// PUT modify an existing loyalty card
export async function PUT(request: Request) {
  try {
    const { id, customerName, customerEmail, points, maxPoints, history } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "L'identifiant de la carte est requis." }, { status: 400, headers: corsHeaders });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Base de données indisponible." }, { status: 503, headers: corsHeaders });
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
          ...updatedCard,
          history: typeof updatedCard.history === "string" ? JSON.parse(updatedCard.history) : updatedCard.history,
        },
      },
      { headers: corsHeaders }
    );
  } catch (e: any) {
    console.error("PUT /api/admin/loyalty error:", e?.message);
    return NextResponse.json({ error: e.message || "Erreur de modification." }, { status: 500, headers: corsHeaders });
  }
}

// DELETE a loyalty card
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "L'identifiant de la carte est requis." }, { status: 400, headers: corsHeaders });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Base de données indisponible." }, { status: 503, headers: corsHeaders });
    }

    await prisma.loyaltyCard.delete({
      where: { id: id.trim().toLowerCase() },
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (e: any) {
    console.error("DELETE /api/admin/loyalty error:", e?.message);
    return NextResponse.json({ error: e.message || "Erreur de suppression." }, { status: 500, headers: corsHeaders });
  }
}
