"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface TombolaTicketItem {
  id: string;
  ticket_number: number;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  status: "available" | "reserved" | "paid";
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all 50 tombola tickets. Ensures tickets 1 to 50 exist in DB.
 */
export async function getTombolaTicketsAction(): Promise<TombolaTicketItem[]> {
  try {
    if (!prisma) return generateFallbackTickets();

    let tickets = await prisma.tombolaTicket.findMany({
      orderBy: { ticketNumber: "asc" },
    });

    // Ensure tickets 1..50 are all created
    if (tickets.length < 50) {
      const existingNums = new Set(tickets.map((t) => t.ticketNumber));
      const missing: number[] = [];
      for (let i = 1; i <= 50; i++) {
        if (!existingNums.has(i)) missing.push(i);
      }

      if (missing.length > 0) {
        await prisma.tombolaTicket.createMany({
          data: missing.map((n) => ({
            ticketNumber: n,
            status: "available",
          })),
          skipDuplicates: true,
        });

        tickets = await prisma.tombolaTicket.findMany({
          orderBy: { ticketNumber: "asc" },
        });
      }
    }

    return tickets.map((t) => ({
      id: t.id,
      ticket_number: t.ticketNumber,
      buyer_name: t.buyerName,
      buyer_email: t.buyerEmail,
      buyer_phone: t.buyerPhone,
      status: (t.status as "available" | "reserved" | "paid") || "available",
      created_at: t.createdAt ? t.createdAt.toISOString() : new Date().toISOString(),
      updated_at: t.updatedAt ? t.updatedAt.toISOString() : new Date().toISOString(),
    }));
  } catch (error: any) {
    console.error("Error in getTombolaTicketsAction:", error?.message);
    return generateFallbackTickets();
  }
}

/**
 * Reserve a ticket publicly by a user.
 */
export async function reserveTicketAction(payload: {
  ticketNumber: number;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
}) {
  const { ticketNumber, buyerName, buyerEmail, buyerPhone } = payload;

  if (!ticketNumber || ticketNumber < 1 || ticketNumber > 50) {
    return { success: false, error: "Numéro de ticket invalide (1 à 50)." };
  }
  if (!buyerName || buyerName.trim() === "") {
    return { success: false, error: "Le nom est obligatoire." };
  }

  try {
    if (!prisma) {
      return { success: true, message: "Réservation enregistrée (mode démo)" };
    }

    const existing = await prisma.tombolaTicket.findUnique({
      where: { ticketNumber },
    });

    if (existing && existing.status !== "available") {
      return {
        success: false,
        error: `La case N°${ticketNumber} n'est plus disponible.`,
      };
    }

    const updated = await prisma.tombolaTicket.upsert({
      where: { ticketNumber },
      update: {
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail?.trim() || null,
        buyerPhone: buyerPhone?.trim() || null,
        status: "reserved",
        updatedAt: new Date(),
      },
      create: {
        ticketNumber,
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail?.trim() || null,
        buyerPhone: buyerPhone?.trim() || null,
        status: "reserved",
      },
    });

    revalidatePath("/tombola");
    revalidatePath("/admin/tombola");

    return {
      success: true,
      ticket: {
        id: updated.id,
        ticket_number: updated.ticketNumber,
        buyer_name: updated.buyerName,
        buyer_email: updated.buyerEmail,
        buyer_phone: updated.buyerPhone,
        status: updated.status,
      },
    };
  } catch (error: any) {
    console.error("Error in reserveTicketAction:", error?.message);
    return { success: false, error: "Impossible de réserver ce ticket." };
  }
}

/**
 * Admin action: Update status or buyer details of a ticket.
 */
export async function updateTicketAdminAction(payload: {
  ticketNumber: number;
  status: "available" | "reserved" | "paid";
  buyerName?: string | null;
  buyerEmail?: string | null;
  buyerPhone?: string | null;
}) {
  const { ticketNumber, status, buyerName, buyerEmail, buyerPhone } = payload;

  if (!ticketNumber || ticketNumber < 1 || ticketNumber > 50) {
    return { success: false, error: "Numéro de ticket invalide." };
  }

  try {
    if (!prisma) return { success: true };

    const isReleasing = status === "available";

    const updated = await prisma.tombolaTicket.upsert({
      where: { ticketNumber },
      update: {
        status,
        buyerName: isReleasing ? null : buyerName?.trim() || null,
        buyerEmail: isReleasing ? null : buyerEmail?.trim() || null,
        buyerPhone: isReleasing ? null : buyerPhone?.trim() || null,
        updatedAt: new Date(),
      },
      create: {
        ticketNumber,
        status,
        buyerName: isReleasing ? null : buyerName?.trim() || null,
        buyerEmail: isReleasing ? null : buyerEmail?.trim() || null,
        buyerPhone: isReleasing ? null : buyerPhone?.trim() || null,
      },
    });

    revalidatePath("/tombola");
    revalidatePath("/admin/tombola");

    return { success: true, ticket: updated };
  } catch (error: any) {
    console.error("Error in updateTicketAdminAction:", error?.message);
    return { success: false, error: error?.message };
  }
}

/**
 * Admin action: Quick physical sale on stand (Direct 'paid' status).
 */
export async function quickPhysicalSaleAction(payload: {
  ticketNumber: number;
  buyerName: string;
  buyerPhone?: string;
  buyerEmail?: string;
}) {
  return updateTicketAdminAction({
    ticketNumber: payload.ticketNumber,
    status: "paid",
    buyerName: payload.buyerName || "Acheteur Stand",
    buyerPhone: payload.buyerPhone || null,
    buyerEmail: payload.buyerEmail || null,
  });
}

/**
 * Admin action: Perform raffle draw among 'paid' tickets.
 */
export async function drawWinnerAction() {
  try {
    if (!prisma) {
      return {
        success: false,
        error: "Base de données non disponible.",
      };
    }

    const paidTickets = await prisma.tombolaTicket.findMany({
      where: { status: "paid" },
      orderBy: { ticketNumber: "asc" },
    });

    if (paidTickets.length === 0) {
      return {
        success: false,
        error: "Aucune case au statut 'Payé' disponible pour le tirage au sort !",
      };
    }

    const randomIndex = Math.floor(Math.random() * paidTickets.length);
    const winner = paidTickets[randomIndex];

    return {
      success: true,
      paidTicketsCount: paidTickets.length,
      paidTicketNumbers: paidTickets.map((t) => t.ticketNumber),
      winner: {
        id: winner.id,
        ticket_number: winner.ticketNumber,
        buyer_name: winner.buyerName || "Anonyme",
        buyer_email: winner.buyerEmail || null,
        buyer_phone: winner.buyerPhone || null,
        status: winner.status,
      },
    };
  } catch (error: any) {
    console.error("Error in drawWinnerAction:", error?.message);
    return { success: false, error: error?.message };
  }
}

/**
 * Admin action: Reset all 50 tickets to 'available'.
 */
export async function resetTombolaTicketsAction() {
  try {
    if (!prisma) return { success: true };

    await prisma.tombolaTicket.updateMany({
      data: {
        status: "available",
        buyerName: null,
        buyerEmail: null,
        buyerPhone: null,
      },
    });

    revalidatePath("/tombola");
    revalidatePath("/admin/tombola");

    return { success: true };
  } catch (error: any) {
    console.error("Error in resetTombolaTicketsAction:", error?.message);
    return { success: false, error: error?.message };
  }
}

function generateFallbackTickets(): TombolaTicketItem[] {
  return Array.from({ length: 50 }, (_, i) => ({
    id: `ticket-${i + 1}`,
    ticket_number: i + 1,
    buyer_name: null,
    buyer_email: null,
    buyer_phone: null,
    status: "available",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}
