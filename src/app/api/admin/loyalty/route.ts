import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all loyalty cards (supports search by name, email, or id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    let cards;
    if (q) {
      const lowerQ = q.trim().toLowerCase();
      cards = await prisma.loyaltyCard.findMany({
        where: {
          OR: [
            { id: { contains: lowerQ, mode: "insensitive" } },
            { customerName: { contains: lowerQ, mode: "insensitive" } },
            { customerEmail: { contains: lowerQ, mode: "insensitive" } }
          ]
        },
        orderBy: { createdAt: "desc" }
      });
    } else {
      cards = await prisma.loyaltyCard.findMany({
        orderBy: { createdAt: "desc" }
      });
    }

    return NextResponse.json({ success: true, cards });
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

    // Check if card already exists
    const existing = await prisma.loyaltyCard.findUnique({
      where: { id }
    });
    if (existing) {
      return NextResponse.json({ error: "Cette carte de fidélité existe déjà." }, { status: 400 });
    }

    const newCard = await prisma.loyaltyCard.create({
      data: {
        id: id.trim().toLowerCase(),
        customerName: customerName || null,
        customerEmail: customerEmail?.trim().toLowerCase() || null,
        points: points !== undefined ? parseInt(points, 10) : 0,
        maxPoints: maxPoints !== undefined ? parseInt(maxPoints, 10) : 100,
        history: JSON.stringify([{
          date: new Date().toISOString(),
          points: `+${points || 0}`,
          reason: "Création de la carte"
        }])
      }
    });

    return NextResponse.json({ success: true, card: {
      ...newCard,
      history: JSON.parse(newCard.history as string)
    } });
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

    const updatedCard = await prisma.loyaltyCard.update({
      where: { id },
      data: {
        customerName,
        customerEmail: customerEmail ? customerEmail.trim().toLowerCase() : null,
        points: points !== undefined ? parseInt(points, 10) : undefined,
        maxPoints: maxPoints !== undefined ? parseInt(maxPoints, 10) : undefined,
        history: history ? JSON.stringify(history) : undefined
      }
    });

    return NextResponse.json({ success: true, card: {
      ...updatedCard,
      history: JSON.parse(updatedCard.history as string)
    } });
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

    await prisma.loyaltyCard.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur de suppression." }, { status: 500 });
  }
}
