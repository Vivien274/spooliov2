import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_CONFIG = {
  id: "tombola-default",
  title: "Mega Pack Fidget & Impression 3D Spoolio",
  description:
    "Tente ta chance de remporter un lot exclusif composé d'objets fidgets sensoriels TDAH, de figurines 3D et d'un porte-clés NFC Spoolio !",
  image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
  estimatedValue: 85.00,
  endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  totalCases: 40,
  ticketPrice: 2.00,
  status: "active",
  reservedTickets: [],
  winnerTicket: null,
  winnerDrawnAt: null,
};

// GET: Fetch current active tombola & reserved tickets
export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ success: true, tombola: DEFAULT_CONFIG, reservedTickets: [] });
    }

    let tombola = await prisma.tombola.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!tombola) {
      tombola = await prisma.tombola.create({
        data: {
          title: DEFAULT_CONFIG.title,
          description: DEFAULT_CONFIG.description,
          image: DEFAULT_CONFIG.image,
          estimatedValue: DEFAULT_CONFIG.estimatedValue,
          endDate: DEFAULT_CONFIG.endDate,
          totalCases: DEFAULT_CONFIG.totalCases,
          ticketPrice: DEFAULT_CONFIG.ticketPrice,
          status: "active",
          reservedTickets: JSON.stringify([]),
        },
      });
    }

    let parsedReserved: number[] = [];
    try {
      if (typeof tombola.reservedTickets === "string") {
        parsedReserved = JSON.parse(tombola.reservedTickets);
      } else if (Array.isArray(tombola.reservedTickets)) {
        parsedReserved = tombola.reservedTickets as any;
      }
    } catch (e) {
      parsedReserved = [];
    }

    return NextResponse.json({
      success: true,
      tombola: {
        id: tombola.id,
        title: tombola.title,
        description: tombola.description,
        image: tombola.image,
        estimatedValue: tombola.estimatedValue,
        endDate: tombola.endDate,
        totalCases: tombola.totalCases,
        ticketPrice: tombola.ticketPrice,
        status: tombola.status,
        winnerTicket: tombola.winnerTicket,
        winnerDrawnAt: tombola.winnerDrawnAt,
      },
      reservedTickets: parsedReserved,
    });
  } catch (error: any) {
    console.error("GET /api/tombola error:", error?.message);
    return NextResponse.json({
      success: true,
      tombola: DEFAULT_CONFIG,
      reservedTickets: [],
      error: error?.message,
    });
  }
}

// POST: Manage tombola configuration, ticket reservations, and draws
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!prisma) {
      return NextResponse.json({ success: true, message: "Action simulée (pas de BDD)" });
    }

    let activeTombola = await prisma.tombola.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!activeTombola) {
      activeTombola = await prisma.tombola.create({
        data: {
          title: DEFAULT_CONFIG.title,
          description: DEFAULT_CONFIG.description,
          image: DEFAULT_CONFIG.image,
          estimatedValue: DEFAULT_CONFIG.estimatedValue,
          endDate: DEFAULT_CONFIG.endDate,
          totalCases: DEFAULT_CONFIG.totalCases,
          ticketPrice: DEFAULT_CONFIG.ticketPrice,
          status: "active",
          reservedTickets: JSON.stringify([]),
        },
      });
    }

    // ACTION: Reserve tickets (Client or Admin)
    if (action === "reserve") {
      const { newTickets } = body; // Array of ticket numbers e.g. [5, 14, 12]
      if (!Array.isArray(newTickets) || newTickets.length === 0) {
        return NextResponse.json({ success: false, error: "Aucun ticket fourni" }, { status: 400 });
      }

      let currentReserved: number[] = [];
      try {
        if (typeof activeTombola.reservedTickets === "string") {
          currentReserved = JSON.parse(activeTombola.reservedTickets);
        } else if (Array.isArray(activeTombola.reservedTickets)) {
          currentReserved = activeTombola.reservedTickets as any;
        }
      } catch (e) {}

      const updatedReserved = Array.from(new Set([...currentReserved, ...newTickets])).sort(
        (a, b) => a - b
      );

      const updated = await prisma.tombola.update({
        where: { id: activeTombola.id },
        data: {
          reservedTickets: JSON.stringify(updatedReserved),
        },
      });

      return NextResponse.json({
        success: true,
        reservedTickets: updatedReserved,
      });
    }

    // ACTION: Toggle ticket reserved status (Admin direct click)
    if (action === "toggle_ticket") {
      const { ticketNumber } = body;
      const num = parseInt(ticketNumber, 10);
      if (isNaN(num)) {
        return NextResponse.json({ success: false, error: "Numéro de ticket invalide" }, { status: 400 });
      }

      let currentReserved: number[] = [];
      try {
        if (typeof activeTombola.reservedTickets === "string") {
          currentReserved = JSON.parse(activeTombola.reservedTickets);
        } else if (Array.isArray(activeTombola.reservedTickets)) {
          currentReserved = activeTombola.reservedTickets as any;
        }
      } catch (e) {}

      let updatedReserved: number[];
      if (currentReserved.includes(num)) {
        updatedReserved = currentReserved.filter((t) => t !== num);
      } else {
        updatedReserved = [...currentReserved, num].sort((a, b) => a - b);
      }

      const updated = await prisma.tombola.update({
        where: { id: activeTombola.id },
        data: {
          reservedTickets: JSON.stringify(updatedReserved),
        },
      });

      return NextResponse.json({
        success: true,
        reservedTickets: updatedReserved,
      });
    }

    // ACTION: Release tickets (Admin)
    if (action === "release") {
      const { ticketsToRelease } = body;
      if (!Array.isArray(ticketsToRelease)) {
        return NextResponse.json({ success: false, error: "Liste de tickets invalide" }, { status: 400 });
      }

      let currentReserved: number[] = [];
      try {
        if (typeof activeTombola.reservedTickets === "string") {
          currentReserved = JSON.parse(activeTombola.reservedTickets);
        } else if (Array.isArray(activeTombola.reservedTickets)) {
          currentReserved = activeTombola.reservedTickets as any;
        }
      } catch (e) {}

      const updatedReserved = currentReserved.filter((t) => !ticketsToRelease.includes(t));

      const updated = await prisma.tombola.update({
        where: { id: activeTombola.id },
        data: {
          reservedTickets: JSON.stringify(updatedReserved),
        },
      });

      return NextResponse.json({
        success: true,
        reservedTickets: updatedReserved,
      });
    }

    // ACTION: Update Config (Admin)
    if (action === "updateConfig") {
      const { config } = body;
      if (!config) {
        return NextResponse.json({ success: false, error: "Données de configuration absentes" }, { status: 400 });
      }

      const updated = await prisma.tombola.update({
        where: { id: activeTombola.id },
        data: {
          title: config.title ?? activeTombola.title,
          description: config.description ?? activeTombola.description,
          image: config.image ?? activeTombola.image,
          estimatedValue: config.estimatedValue ?? activeTombola.estimatedValue,
          endDate: config.endDate ?? activeTombola.endDate,
          totalCases: config.totalCases ?? activeTombola.totalCases,
          ticketPrice: config.ticketPrice ?? activeTombola.ticketPrice,
        },
      });

      return NextResponse.json({ success: true, tombola: updated });
    }

    // ACTION: Trigger Raffle Draw (Admin)
    if (action === "draw") {
      const { winnerTicket, winnerDrawnAt } = body;
      const updated = await prisma.tombola.update({
        where: { id: activeTombola.id },
        data: {
          status: "drawn",
          winnerTicket,
          winnerDrawnAt,
        },
      });

      return NextResponse.json({ success: true, tombola: updated });
    }

    // ACTION: Reset Reserved Tickets (Admin or Clean Start)
    if (action === "reset_reserved" || action === "clear_reserved") {
      const updated = await prisma.tombola.update({
        where: { id: activeTombola.id },
        data: {
          reservedTickets: JSON.stringify([]),
        },
      });

      return NextResponse.json({ success: true, tombola: updated, reservedTickets: [] });
    }

    // ACTION: Reset / Start New Tombola (Admin)
    if (action === "reset") {
      const newTombola = await prisma.tombola.create({
        data: {
          title: body.config?.title || DEFAULT_CONFIG.title,
          description: body.config?.description || DEFAULT_CONFIG.description,
          image: body.config?.image || DEFAULT_CONFIG.image,
          estimatedValue: body.config?.estimatedValue || DEFAULT_CONFIG.estimatedValue,
          endDate: body.config?.endDate || DEFAULT_CONFIG.endDate,
          totalCases: body.config?.totalCases || DEFAULT_CONFIG.totalCases,
          ticketPrice: body.config?.ticketPrice || DEFAULT_CONFIG.ticketPrice,
          status: "active",
          reservedTickets: JSON.stringify([]),
        },
      });

      return NextResponse.json({ success: true, tombola: newTombola, reservedTickets: [] });
    }

    return NextResponse.json({ success: false, error: "Action inconnue" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/tombola error:", error?.message);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
