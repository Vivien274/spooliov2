import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET all loyalty cards (supports search by name, email, or id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    let cards: any[];
    if (q) {
      const lowerQ = q.trim().toLowerCase();
      cards = (await Promise.race([
        prisma.loyaltyCard.findMany({
          where: {
            OR: [
              { id: { contains: lowerQ, mode: "insensitive" } },
              { customerName: { contains: lowerQ, mode: "insensitive" } },
              { customerEmail: { contains: lowerQ, mode: "insensitive" } }
            ]
          },
          orderBy: { createdAt: "desc" }
        }),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Admin Loyalty Timeout")), 2500))
      ])) as any[];
    } else {
      cards = (await Promise.race([
        prisma.loyaltyCard.findMany({
          orderBy: { createdAt: "desc" }
        }),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Admin Loyalty Timeout")), 2500))
      ])) as any[];
    }

    const formattedCards = (cards || []).map((c) => ({
      ...c,
      history: typeof c.history === "string" ? JSON.parse(c.history) : c.history
    }));

    return NextResponse.json({ success: true, cards: formattedCards });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur de chargement." }, { status: 500 });
  }
}

// POST create a new loyalty card
export async function POST(request: Request) {
  try {
    const { id, customerName, customerEmail, points, maxPoints } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "L'identifiant de la carte (UID/NFC) est requis." }, { status: 400 });
    }

    const cleanId = id.trim().toLowerCase();

    // Check if card already exists
    const existing = (await Promise.race([
      prisma.loyaltyCard.findUnique({
        where: { id: cleanId }
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Admin Loyalty Check Timeout")), 2500))
    ])) as any;

    if (existing) {
      return NextResponse.json({ error: "Cette carte de fidélité existe déjà." }, { status: 400 });
    }

    const newCard = (await Promise.race([
      prisma.loyaltyCard.create({
        data: {
          id: cleanId,
          customerName: customerName || null,
          customerEmail: customerEmail?.trim().toLowerCase() || null,
          points: points !== undefined ? parseInt(points, 10) : 0,
          maxPoints: maxPoints !== undefined ? parseInt(maxPoints, 10) : 100,
          history: JSON.stringify([{
            date: new Date().toISOString(),
            points: `+${points || 0}`,
            reason: "Création de la carte (Admin)"
          }])
        }
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Admin Loyalty Create Timeout")), 2500))
    ])) as any;

    return NextResponse.json({
      success: true,
      card: {
        ...newCard,
        history: JSON.parse(newCard.history as string)
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur de création." }, { status: 500 });
  }
}

// PUT modify an existing loyalty card
export async function PUT(request: Request) {
  try {
    const { id, customerName, customerEmail, points, maxPoints, history } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "L'identifiant de la carte est requis." }, { status: 400 });
    }

    const updatedCard = (await Promise.race([
      prisma.loyaltyCard.update({
        where: { id },
        data: {
          customerName,
          customerEmail: customerEmail ? customerEmail.trim().toLowerCase() : null,
          points: points !== undefined ? parseInt(points, 10) : undefined,
          maxPoints: maxPoints !== undefined ? parseInt(maxPoints, 10) : undefined,
          history: history ? JSON.stringify(history) : undefined
        }
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Admin Loyalty Update Timeout")), 2500))
    ])) as any;

    return NextResponse.json({
      success: true,
      card: {
        ...updatedCard,
        history: typeof updatedCard.history === "string" ? JSON.parse(updatedCard.history) : updatedCard.history
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur de modification." }, { status: 500 });
  }
}

// DELETE a loyalty card
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "L'identifiant de la carte est requis." }, { status: 400 });
    }

    await Promise.race([
      prisma.loyaltyCard.delete({
        where: { id }
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Admin Loyalty Delete Timeout")), 2500))
    ]);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur de suppression." }, { status: 500 });
  }
}
