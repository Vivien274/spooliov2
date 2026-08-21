"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface GiftCardInput {
  amount: number;
  buyerName?: string;
  buyerEmail: string;
  recipientName?: string;
  recipientEmail?: string;
  customMessage?: string;
}

const JSON_FILE_PATH = path.join(process.cwd(), "src/data/gift_cards.json");

function readLocalGiftCards(): any[] {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const raw = fs.readFileSync(JSON_FILE_PATH, "utf-8");
      return JSON.parse(raw || "[]");
    }
  } catch (e) {
    console.error("Error reading local gift_cards.json:", e);
  }
  return [];
}

function writeLocalGiftCards(cards: any[]) {
  try {
    const dir = path.dirname(JSON_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(cards, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing local gift_cards.json:", e);
  }
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
    let giftCard: any = null;

    if (prisma && (prisma as any).giftCard) {
      try {
        giftCard = await (prisma as any).giftCard.findUnique({
          where: { code: cleanCode },
        });
      } catch (dbErr) {
        console.warn("Prisma giftCard findUnique warning:", dbErr);
      }
    }

    if (!giftCard) {
      const localCards = readLocalGiftCards();
      giftCard = localCards.find((c) => c.code === cleanCode) || null;
    }

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
    let existing = null;
    if (prisma && (prisma as any).giftCard) {
      try {
        existing = await (prisma as any).giftCard.findUnique({ where: { code } });
      } catch (e) {}
    }
    if (!existing) {
      const local = readLocalGiftCards();
      existing = local.find((c) => c.code === code) || null;
    }

    if (!existing) break;
    code = generateGiftCardCode();
    attempts++;
  }

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const newCardData = {
    id: `gc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
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
    history: [],
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let card = null;

  if (prisma && (prisma as any).giftCard) {
    try {
      card = await (prisma as any).giftCard.create({
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
    } catch (e) {
      console.warn("Could not insert gift card in Prisma, saving to local JSON fallback:", e);
    }
  }

  // Also sync to local JSON
  const localCards = readLocalGiftCards();
  localCards.unshift(card || newCardData);
  writeLocalGiftCards(localCards);

  return card || newCardData;
}

export async function getGiftCardsAdminAction() {
  try {
    let giftCards: any[] = [];
    if (prisma && (prisma as any).giftCard) {
      try {
        giftCards = await (prisma as any).giftCard.findMany({
          orderBy: { createdAt: "desc" },
        });
      } catch (e) {}
    }

    if (giftCards.length === 0) {
      giftCards = readLocalGiftCards();
    }

    return { success: true, giftCards };
  } catch (error: any) {
    console.error("Error fetching gift cards for admin:", error);
    return { success: false, error: error.message, giftCards: [] };
  }
}

export async function toggleGiftCardStatusAdminAction(id: string, isActive: boolean) {
  try {
    let updated = null;
    if (prisma && (prisma as any).giftCard) {
      try {
        updated = await (prisma as any).giftCard.update({
          where: { id },
          data: { isActive },
        });
      } catch (e) {}
    }

    const localCards = readLocalGiftCards();
    const updatedLocal = localCards.map((c) => (c.id === id ? { ...c, isActive } : c));
    writeLocalGiftCards(updatedLocal);

    return { success: true, giftCard: updated || updatedLocal.find((c) => c.id === id) };
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
