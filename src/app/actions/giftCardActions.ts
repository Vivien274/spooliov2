"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface GiftCardInput {
  amount: number;
  buyerName?: string;
  buyerEmail: string;
  recipientName?: string;
  recipientEmail?: string;
  customMessage?: string;
}

function generateGiftCardCode(): string {
  const part1 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const part2 = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `SPOOLIO-${part1}-${part2}`;
}

export async function validateGiftCardAction(rawCode: string) {
  try {
    if (!rawCode || typeof rawCode !== "string") {
      return { valid: false, error: "Code de carte cadeau invalide." };
    }

    const cleanCode = rawCode.trim().toUpperCase();

    if (!prisma) {
      return { valid: false, error: "Base de données indisponible." };
    }

    const giftCard = await prisma.giftCard.findUnique({
      where: { code: cleanCode },
    });

    if (!giftCard) {
      return { valid: false, error: "Code de carte cadeau introuvable." };
    }

    if (!giftCard.isPaid) {
      return { valid: false, error: "Cette carte cadeau n'a pas encore été activée par le paiement." };
    }

    if (!giftCard.isActive) {
      return { valid: false, error: "Cette carte cadeau a été désactivée." };
    }

    if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) {
      return { valid: false, error: "Cette carte cadeau est expirée." };
    }

    if (giftCard.remainingAmount <= 0) {
      return { valid: false, error: "Le solde de cette carte cadeau est de 0,00€." };
    }

    return {
      valid: true,
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        initialAmount: giftCard.initialAmount,
        remainingAmount: giftCard.remainingAmount,
        buyerName: giftCard.buyerName,
        recipientName: giftCard.recipientName,
        customMessage: giftCard.customMessage,
      },
    };
  } catch (error: any) {
    console.error("Error validating gift card:", error);
    return { valid: false, error: "Erreur lors de la vérification de la carte cadeau." };
  }
}

export async function createGiftCardRecord(input: GiftCardInput, isPaid: boolean = false, stripeSessionId?: string) {
  let attempts = 0;
  let code = generateGiftCardCode();

  while (attempts < 5) {
    const existing = await prisma.giftCard.findUnique({ where: { code } });
    if (!existing) break;
    code = generateGiftCardCode();
    attempts++;
  }

  // Expires 1 year from purchase
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const card = await prisma.giftCard.create({
    data: {
      code,
      initialAmount: input.amount,
      remainingAmount: input.amount,
      buyerName: input.buyerName || null,
      buyerEmail: input.buyerEmail,
      recipientName: input.recipientName || null,
      recipientEmail: input.recipientEmail || null,
      customMessage: input.customMessage || null,
      isActive: true,
      isPaid,
      stripeSession: stripeSessionId || null,
      expiresAt,
    },
  });

  return card;
}

export async function getGiftCardsAdminAction() {
  try {
    if (!prisma) return { success: false, giftCards: [] };
    const giftCards = await prisma.giftCard.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, giftCards };
  } catch (error: any) {
    console.error("Error fetching gift cards for admin:", error);
    return { success: false, error: error.message, giftCards: [] };
  }
}

export async function toggleGiftCardStatusAdminAction(id: string, isActive: boolean) {
  try {
    const updated = await prisma.giftCard.update({
      where: { id },
      data: { isActive },
    });
    return { success: true, giftCard: updated };
  } catch (error: any) {
    console.error("Error toggling gift card status:", error);
    return { success: false, error: error.message };
  }
}

export async function createManualGiftCardAdminAction(input: GiftCardInput) {
  try {
    const card = await createGiftCardRecord(input, true, "manual_admin");
    return { success: true, giftCard: card };
  } catch (error: any) {
    console.error("Error creating manual gift card:", error);
    return { success: false, error: error.message };
  }
}
