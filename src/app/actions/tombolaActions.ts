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

export interface TombolaConfigItem {
  id: string;
  title: string;
  description: string;
  image: string;
  estimatedValue: number;
  endDate: string;
  totalCases: number;
  ticketPrice: number;
  status: "active" | "inactive" | "ended" | "drawn";
  winnerTicket?: number | null;
  winnerDrawnAt?: string | null;
}

const DEFAULT_TOMBOLA_CONFIG: TombolaConfigItem = {
  id: "tombola-default",
  title: "TOMBOLA SPOOLIO 🎁",
  description:
    "Gagne ton Pack Fidgets exclusif (valeur 20€) ! Choisis ta case parmi les 50 numéros disponibles.",
  image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
  estimatedValue: 20.0,
  endDate: "15 Août à 17h30",
  totalCases: 50,
  ticketPrice: 2.0,
  status: "active",
  winnerTicket: null,
  winnerDrawnAt: null,
};

/**
 * Fetch tombola configuration (active/inactive status, prize details, etc.).
 */
export async function getTombolaConfigAction(): Promise<TombolaConfigItem> {
  try {
    if (!prisma) return DEFAULT_TOMBOLA_CONFIG;

    let tombola = await prisma.tombola.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!tombola) {
      tombola = await prisma.tombola.create({
        data: {
          title: DEFAULT_TOMBOLA_CONFIG.title,
          description: DEFAULT_TOMBOLA_CONFIG.description,
          image: DEFAULT_TOMBOLA_CONFIG.image,
          estimatedValue: DEFAULT_TOMBOLA_CONFIG.estimatedValue,
          endDate: DEFAULT_TOMBOLA_CONFIG.endDate,
          totalCases: DEFAULT_TOMBOLA_CONFIG.totalCases,
          ticketPrice: DEFAULT_TOMBOLA_CONFIG.ticketPrice,
          status: "active",
        },
      });
    }

    return {
      id: tombola.id,
      title: tombola.title || DEFAULT_TOMBOLA_CONFIG.title,
      description: tombola.description || DEFAULT_TOMBOLA_CONFIG.description,
      image: tombola.image || DEFAULT_TOMBOLA_CONFIG.image,
      estimatedValue: tombola.estimatedValue ?? DEFAULT_TOMBOLA_CONFIG.estimatedValue,
      endDate: tombola.endDate || DEFAULT_TOMBOLA_CONFIG.endDate,
      totalCases: tombola.totalCases ?? DEFAULT_TOMBOLA_CONFIG.totalCases,
      ticketPrice: tombola.ticketPrice ?? DEFAULT_TOMBOLA_CONFIG.ticketPrice,
      status: (tombola.status as "active" | "inactive" | "ended" | "drawn") || "active",
      winnerTicket: tombola.winnerTicket,
      winnerDrawnAt: tombola.winnerDrawnAt,
    };
  } catch (error: any) {
    console.error("Error in getTombolaConfigAction:", error?.message);
    return DEFAULT_TOMBOLA_CONFIG;
  }
}

/**
 * Admin action: Update full Tombola configuration (title, description, image, estimatedValue, endDate, ticketPrice, totalCases, status).
 */
export async function updateTombolaConfigAction(
  payload: Partial<TombolaConfigItem>
): Promise<{ success: boolean; config?: TombolaConfigItem; error?: string }> {
  try {
    if (!prisma) {
      return { success: true };
    }

    let tombola = await prisma.tombola.findFirst({
      orderBy: { createdAt: "desc" },
    });

    const updateData: any = {
      updatedAt: new Date(),
    };
    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.image !== undefined) updateData.image = payload.image;
    if (payload.estimatedValue !== undefined) updateData.estimatedValue = payload.estimatedValue;
    if (payload.endDate !== undefined) updateData.endDate = payload.endDate;
    if (payload.ticketPrice !== undefined) updateData.ticketPrice = payload.ticketPrice;
    if (payload.totalCases !== undefined) updateData.totalCases = payload.totalCases;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.winnerTicket !== undefined) updateData.winnerTicket = payload.winnerTicket;
    if (payload.winnerDrawnAt !== undefined) updateData.winnerDrawnAt = payload.winnerDrawnAt;

    let saved;
    if (tombola) {
      saved = await prisma.tombola.update({
        where: { id: tombola.id },
        data: updateData,
      });
    } else {
      saved = await prisma.tombola.create({
        data: {
          title: payload.title || DEFAULT_TOMBOLA_CONFIG.title,
          description: payload.description || DEFAULT_TOMBOLA_CONFIG.description,
          image: payload.image || DEFAULT_TOMBOLA_CONFIG.image,
          estimatedValue: payload.estimatedValue ?? DEFAULT_TOMBOLA_CONFIG.estimatedValue,
          endDate: payload.endDate || DEFAULT_TOMBOLA_CONFIG.endDate,
          totalCases: payload.totalCases ?? DEFAULT_TOMBOLA_CONFIG.totalCases,
          ticketPrice: payload.ticketPrice ?? DEFAULT_TOMBOLA_CONFIG.ticketPrice,
          status: payload.status || "active",
        },
      });
    }

    revalidatePath("/tombola");
    revalidatePath("/admin/tombola");
    revalidatePath("/");

    return {
      success: true,
      config: {
        id: saved.id,
        title: saved.title,
        description: saved.description,
        image: saved.image,
        estimatedValue: saved.estimatedValue,
        endDate: saved.endDate,
        totalCases: saved.totalCases,
        ticketPrice: saved.ticketPrice,
        status: (saved.status as any) || "active",
        winnerTicket: saved.winnerTicket,
        winnerDrawnAt: saved.winnerDrawnAt,
      },
    };
  } catch (error: any) {
    console.error("Error in updateTombolaConfigAction:", error?.message);
    return { success: false, error: error?.message };
  }
}

/**
 * Admin action: Update Tombola status (active vs inactive).
 */
export async function updateTombolaStatusAction(
  status: "active" | "inactive"
): Promise<{ success: boolean; status?: string; error?: string }> {
  try {
    if (!prisma) {
      return { success: true, status };
    }

    let tombola = await prisma.tombola.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (tombola) {
      await prisma.tombola.update({
        where: { id: tombola.id },
        data: {
          status,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.tombola.create({
        data: {
          title: DEFAULT_TOMBOLA_CONFIG.title,
          description: DEFAULT_TOMBOLA_CONFIG.description,
          image: DEFAULT_TOMBOLA_CONFIG.image,
          estimatedValue: DEFAULT_TOMBOLA_CONFIG.estimatedValue,
          endDate: DEFAULT_TOMBOLA_CONFIG.endDate,
          totalCases: DEFAULT_TOMBOLA_CONFIG.totalCases,
          ticketPrice: DEFAULT_TOMBOLA_CONFIG.ticketPrice,
          status,
        },
      });
    }

    revalidatePath("/tombola");
    revalidatePath("/admin/tombola");
    revalidatePath("/");

    return { success: true, status };
  } catch (error: any) {
    console.error("Error in updateTombolaStatusAction:", error?.message);
    return { success: false, error: error?.message };
  }
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

  // Check if tombola is active
  const config = await getTombolaConfigAction();
  if (config.status !== "active") {
    return { success: false, error: "La tombola est actuellement fermée ou désactivée." };
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
