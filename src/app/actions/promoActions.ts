"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

export interface PromoCodeItem {
  id: string;
  code: string;
  description?: string | null;
  discountType: "percentage" | "fixed" | "free_shipping";
  discountValue: number;
  minOrderAmount: number;
  maxUses?: number | null;
  usedCount: number;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const JSON_FILE_PATH = path.join(process.cwd(), "src/data/promo_codes.json");

/**
 * Helper to read promo codes from local JSON fallback
 */
function readLocalPromoCodes(): PromoCodeItem[] {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const raw = fs.readFileSync(JSON_FILE_PATH, "utf-8");
      return JSON.parse(raw || "[]");
    }
  } catch (e) {
    console.error("Error reading local promo_codes.json:", e);
  }
  return [];
}

/**
 * Helper to write promo codes to local JSON fallback
 */
function writeLocalPromoCodes(codes: PromoCodeItem[]) {
  try {
    const dir = path.dirname(JSON_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(codes, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing local promo_codes.json:", e);
  }
}

/**
 * Parses discount type and value from lottery/tombola prize title & subtitle
 */
export async function parseLotteryPrizeDiscount(prize: {
  title: string;
  subtitle?: string | null;
  couponCode?: string | null;
  stock?: number | null;
  isActive?: boolean;
}) {
  const fullText = `${prize.title} ${prize.subtitle || ""}`.toLowerCase();
  let discountType: "percentage" | "fixed" | "free_shipping" = "percentage";
  let discountValue = 10;
  let minOrderAmount = 0;

  // Percentage match (e.g. -20%, 15%, -10%)
  const percentMatch = fullText.match(/(\d+)\s*%/);
  if (percentMatch) {
    discountType = "percentage";
    discountValue = parseFloat(percentMatch[1]);
  } else {
    // Fixed amount in € (e.g. -5€, 5€, 10€)
    const fixedMatch = fullText.match(/(\d+(?:[.,]\d+)?)\s*€/);
    if (fixedMatch && !fullText.includes("pour") && !fullText.includes("d'achat")) {
      discountType = "fixed";
      discountValue = parseFloat(fixedMatch[1].replace(",", "."));
    } else if (
      fullText.includes("livraison") ||
      fullText.includes("port offert") ||
      fullText.includes("freeship")
    ) {
      discountType = "free_shipping";
      discountValue = 0;
    } else {
      // Free gift or item bonus
      discountType = "percentage";
      discountValue = 10;
    }
  }

  // Min order match (e.g. "pour 15€ d'achat", "dès 20€")
  const minMatch = fullText.match(/(?:pour|dès|des|min|minimum)\s*(\d+(?:[.,]\d+)?)\s*€/i);
  if (minMatch) {
    minOrderAmount = parseFloat(minMatch[1].replace(",", "."));
  }

  return {
    discountType,
    discountValue,
    minOrderAmount,
  };
}

/**
 * Automatically synchronizes all coupon codes created in the Tombola / Loterie with the Promo Codes system
 */
export async function syncLotteryPromoCodes() {
  try {
    let lotteryPrizes: any[] = [];
    if (prisma) {
      try {
        lotteryPrizes = await prisma.lotteryPrize.findMany();
      } catch (e) {
        console.warn("Could not load lottery prizes from DB:", e);
      }
    }

    if (lotteryPrizes.length === 0) {
      lotteryPrizes = [
        { title: "Spoolie Mini 3D", subtitle: "Produit Spoolio offert", couponCode: "SPOOLIE-MINI-WIN", isActive: true },
        { title: "-15% Boutique", subtitle: "Sur toute la commande", couponCode: "WHEEL15", isActive: true },
        { title: "Sticker Exclusif", subtitle: "Glissé dans ton colis", couponCode: "STICKER-WIN", isActive: true },
        { title: "+50 Points", subtitle: "Crédités sur ta carte", couponCode: "LOYALTY50", isActive: true },
        { title: "-20% Flash", subtitle: "Valable 24h seulement", couponCode: "FLASH20", isActive: true },
        { title: "Fidget Surprise", subtitle: "Pour 15€ d'achat", couponCode: "FREE-FIDGET", isActive: true },
        { title: "-10% Immédiat", subtitle: "Code promo direct", couponCode: "SPIN10", isActive: true },
      ];
    }

    const localList = readLocalPromoCodes();

    for (const prize of lotteryPrizes) {
      if (!prize.couponCode || !prize.couponCode.trim()) continue;
      const cleanCode = prize.couponCode.trim().toUpperCase();
      const parsed = await parseLotteryPrizeDiscount(prize);
      const description = `🎡 Lot Tombola / Loterie : ${prize.title}${
        prize.subtitle ? ` (${prize.subtitle})` : ""
      }`;

      if (prisma) {
        try {
          const existing = await prisma.promoCode.findUnique({
            where: { code: cleanCode },
          });

          if (!existing) {
            await prisma.promoCode.create({
              data: {
                code: cleanCode,
                description,
                discountType: parsed.discountType,
                discountValue: parsed.discountValue,
                minOrderAmount: parsed.minOrderAmount,
                maxUses: prize.stock || null,
                isActive: prize.isActive !== false,
              },
            });
          }
        } catch (dbErr) {
          console.warn(`Error syncing lottery prize code ${cleanCode}:`, dbErr);
        }
      }

      // Also ensure it is present in local JSON cache
      const matchIndex = localList.findIndex((p) => p.code.toUpperCase() === cleanCode);
      if (matchIndex === -1) {
        localList.push({
          id: `promo-lottery-${cleanCode.toLowerCase()}`,
          code: cleanCode,
          description,
          discountType: parsed.discountType,
          discountValue: parsed.discountValue,
          minOrderAmount: parsed.minOrderAmount,
          maxUses: prize.stock || null,
          usedCount: 0,
          startDate: null,
          endDate: null,
          isActive: prize.isActive !== false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    writeLocalPromoCodes(localList);
  } catch (err) {
    console.error("Error in syncLotteryPromoCodes:", err);
  }
}

/**
 * Ensure default starter promo codes exist in database
 */
async function ensureDefaultPromoCodesExist() {
  if (!prisma) return;
  try {
    const count = await prisma.promoCode.count();
    if (count === 0) {
      const localCodes = readLocalPromoCodes();
      for (const p of localCodes) {
        await prisma.promoCode.create({
          data: {
            id: p.id.startsWith("promo-") ? undefined : p.id,
            code: p.code.toUpperCase().trim(),
            description: p.description,
            discountType: p.discountType,
            discountValue: p.discountValue,
            minOrderAmount: p.minOrderAmount || 0,
            maxUses: p.maxUses,
            usedCount: p.usedCount || 0,
            startDate: p.startDate ? new Date(p.startDate) : null,
            endDate: p.endDate ? new Date(p.endDate) : null,
            isActive: p.isActive !== false,
          },
        });
      }
    }
  } catch (e) {
    console.warn("Could not seed default promo codes in DB:", e);
  }
}

/**
 * Validate a promo code against cart subtotal
 */
export async function validatePromoCodeAction(code: string, cartTotal: number) {
  try {
    const cleanCode = (code || "").trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, error: "Veuillez renseigner un code promo." };
    }

    let promo: PromoCodeItem | null = null;

    // 1. Try fetching from DB (and sync lottery codes if needed)
    try {
      if (prisma) {
        await ensureDefaultPromoCodesExist();
        await syncLotteryPromoCodes();
        const dbPromo = await prisma.promoCode.findUnique({
          where: { code: cleanCode },
        });
        if (dbPromo) {
          promo = {
            id: dbPromo.id,
            code: dbPromo.code,
            description: dbPromo.description,
            discountType: dbPromo.discountType as any,
            discountValue: dbPromo.discountValue,
            minOrderAmount: dbPromo.minOrderAmount,
            maxUses: dbPromo.maxUses,
            usedCount: dbPromo.usedCount,
            startDate: dbPromo.startDate ? dbPromo.startDate.toISOString() : null,
            endDate: dbPromo.endDate ? dbPromo.endDate.toISOString() : null,
            isActive: dbPromo.isActive,
            createdAt: dbPromo.createdAt.toISOString(),
            updatedAt: dbPromo.updatedAt.toISOString(),
          };
        }
      }
    } catch (dbErr) {
      console.warn("Database lookup failed, falling back to local JSON:", dbErr);
    }

    // 2. Fallback to local JSON if not found in DB
    if (!promo) {
      const localList = readLocalPromoCodes();
      const match = localList.find((p) => p.code.toUpperCase() === cleanCode);
      if (match) {
        promo = match;
      }
    }

    if (!promo) {
      return { valid: false, error: "Code promo inexistant ou erroné." };
    }

    // 3. Validation rules
    if (!promo.isActive) {
      return { valid: false, error: "Ce code promo n'est plus actif." };
    }

    const now = new Date();
    if (promo.startDate && new Date(promo.startDate) > now) {
      return { valid: false, error: "Ce code promo n'est pas encore disponible." };
    }

    if (promo.endDate && new Date(promo.endDate) < now) {
      return { valid: false, error: "Ce code promo a expiré." };
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return { valid: false, error: "Ce code promo a atteint sa limite maximale d'utilisations." };
    }

    if (promo.minOrderAmount > 0 && cartTotal < promo.minOrderAmount) {
      return {
        valid: false,
        error: `Ce code nécessite un montant minimum de panier de ${promo.minOrderAmount.toFixed(
          2
        )}€ (actuel : ${cartTotal.toFixed(2)}€).`,
      };
    }

    // 4. Calculate discount amount
    let discountAmount = 0;
    if (promo.discountType === "percentage") {
      discountAmount = Math.round(((cartTotal * promo.discountValue) / 100) * 100) / 100;
      discountAmount = Math.min(cartTotal, discountAmount);
    } else if (promo.discountType === "fixed") {
      discountAmount = Math.min(cartTotal, promo.discountValue);
    } else if (promo.discountType === "free_shipping") {
      discountAmount = 0; // Handled as 0€ shipping
    }

    return {
      valid: true,
      promo: {
        id: promo.id,
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minOrderAmount: promo.minOrderAmount,
      },
      discountAmount,
      message:
        promo.discountType === "percentage"
          ? `Code ${promo.code} appliqué (-${promo.discountValue}%) !`
          : promo.discountType === "fixed"
          ? `Code ${promo.code} appliqué (-${promo.discountValue.toFixed(2)}€) !`
          : `Code ${promo.code} appliqué (Livraison offerte) !`,
    };
  } catch (error: any) {
    console.error("Error validating promo code:", error);
    return { valid: false, error: "Erreur lors de la validation du code promo." };
  }
}

/**
 * Get all promo codes for Admin dashboard (including tombola / lottery codes)
 */
export async function getAllPromoCodesAdminAction(): Promise<{
  promos: PromoCodeItem[];
  stats: {
    total: number;
    active: number;
    totalUses: number;
  };
}> {
  let promos: PromoCodeItem[] = [];

  try {
    if (prisma) {
      await ensureDefaultPromoCodesExist();
      await syncLotteryPromoCodes();
      const dbPromos = await prisma.promoCode.findMany({
        orderBy: { createdAt: "desc" },
      });
      promos = dbPromos.map((p) => ({
        id: p.id,
        code: p.code,
        description: p.description,
        discountType: p.discountType as any,
        discountValue: p.discountValue,
        minOrderAmount: p.minOrderAmount,
        maxUses: p.maxUses,
        usedCount: p.usedCount,
        startDate: p.startDate ? p.startDate.toISOString() : null,
        endDate: p.endDate ? p.endDate.toISOString() : null,
        isActive: p.isActive,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));
    }
  } catch (e) {
    console.warn("Database fetch error for promo codes, reading local JSON fallback:", e);
    await syncLotteryPromoCodes();
    promos = readLocalPromoCodes();
  }

  if (promos.length === 0) {
    await syncLotteryPromoCodes();
    promos = readLocalPromoCodes();
  }

  const activeCount = promos.filter((p) => p.isActive).length;
  const totalUsesCount = promos.reduce((sum, p) => sum + (p.usedCount || 0), 0);

  return {
    promos,
    stats: {
      total: promos.length,
      active: activeCount,
      totalUses: totalUsesCount,
    },
  };
}

/**
 * Admin action to manually trigger tombola / lottery code sync
 */
export async function syncLotteryPromoCodesAdminAction() {
  await syncLotteryPromoCodes();
  revalidatePath("/admin/promos");
  revalidatePath("/panier");
  return { success: true };
}

/**
 * Create a new promo code
 */
export async function createPromoCodeAdminAction(data: {
  code: string;
  description?: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
}) {
  const cleanCode = data.code.trim().toUpperCase();
  if (!cleanCode) {
    throw new Error("Le code promo ne peut pas être vide.");
  }

  const newItem: PromoCodeItem = {
    id: `promo-${Date.now()}`,
    code: cleanCode,
    description: data.description?.trim() || null,
    discountType: data.discountType,
    discountValue: Number(data.discountValue) || 0,
    minOrderAmount: Number(data.minOrderAmount) || 0,
    maxUses: data.maxUses ? Number(data.maxUses) : null,
    usedCount: 0,
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    isActive: data.isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    if (prisma) {
      const existing = await prisma.promoCode.findUnique({
        where: { code: cleanCode },
      });
      if (existing) {
        throw new Error(`Le code promo "${cleanCode}" existe déjà.`);
      }

      const created = await prisma.promoCode.create({
        data: {
          code: cleanCode,
          description: newItem.description,
          discountType: newItem.discountType,
          discountValue: newItem.discountValue,
          minOrderAmount: newItem.minOrderAmount,
          maxUses: newItem.maxUses,
          usedCount: 0,
          startDate: newItem.startDate ? new Date(newItem.startDate) : null,
          endDate: newItem.endDate ? new Date(newItem.endDate) : null,
          isActive: newItem.isActive,
        },
      });
      newItem.id = created.id;
    }
  } catch (e: any) {
    if (e.message.includes("existe déjà")) {
      throw e;
    }
    console.warn("DB insert failed, writing to local JSON:", e);
  }

  // Update local JSON cache
  const localList = readLocalPromoCodes().filter((p) => p.code !== cleanCode);
  localList.unshift(newItem);
  writeLocalPromoCodes(localList);

  revalidatePath("/admin/promos");
  revalidatePath("/panier");
  return newItem;
}

/**
 * Update an existing promo code
 */
export async function updatePromoCodeAdminAction(
  id: string,
  data: Partial<{
    code: string;
    description: string | null;
    discountType: "percentage" | "fixed" | "free_shipping";
    discountValue: number;
    minOrderAmount: number;
    maxUses: number | null;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
  }>
) {
  const cleanCode = data.code ? data.code.trim().toUpperCase() : undefined;

  try {
    if (prisma) {
      await prisma.promoCode.update({
        where: { id },
        data: {
          code: cleanCode,
          description: data.description,
          discountType: data.discountType,
          discountValue: data.discountValue !== undefined ? Number(data.discountValue) : undefined,
          minOrderAmount: data.minOrderAmount !== undefined ? Number(data.minOrderAmount) : undefined,
          maxUses: data.maxUses !== undefined ? (data.maxUses ? Number(data.maxUses) : null) : undefined,
          startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined,
          endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
          isActive: data.isActive,
        },
      });
    }
  } catch (e) {
    console.warn("DB update failed, updating local JSON:", e);
  }

  // Update local JSON cache
  const localList = readLocalPromoCodes();
  const updated = localList.map((p) => {
    if (p.id === id || (cleanCode && p.code === cleanCode)) {
      return {
        ...p,
        ...data,
        code: cleanCode || p.code,
        updatedAt: new Date().toISOString(),
      };
    }
    return p;
  });
  writeLocalPromoCodes(updated);

  revalidatePath("/admin/promos");
  revalidatePath("/panier");
  return { success: true };
}

/**
 * Delete a promo code
 */
export async function deletePromoCodeAdminAction(id: string) {
  try {
    if (prisma) {
      await prisma.promoCode.delete({
        where: { id },
      });
    }
  } catch (e) {
    console.warn("DB delete failed, deleting from local JSON:", e);
  }

  // Update local JSON cache
  const localList = readLocalPromoCodes().filter((p) => p.id !== id);
  writeLocalPromoCodes(localList);

  revalidatePath("/admin/promos");
  revalidatePath("/panier");
  return { success: true };
}

/**
 * Toggle promo code active status
 */
export async function togglePromoCodeStatusAdminAction(id: string, isActive: boolean) {
  try {
    if (prisma) {
      await prisma.promoCode.update({
        where: { id },
        data: { isActive },
      });
    }
  } catch (e) {
    console.warn("DB status toggle failed, toggling in local JSON:", e);
  }

  const localList = readLocalPromoCodes().map((p) =>
    p.id === id ? { ...p, isActive, updatedAt: new Date().toISOString() } : p
  );
  writeLocalPromoCodes(localList);

  revalidatePath("/admin/promos");
  revalidatePath("/panier");
  return { success: true };
}

/**
 * Increment promo code used count when an order completes
 */
export async function incrementPromoCodeUsage(code: string) {
  const cleanCode = (code || "").trim().toUpperCase();
  if (!cleanCode) return;

  try {
    if (prisma) {
      await prisma.promoCode.updateMany({
        where: { code: cleanCode },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }
  } catch (e) {
    console.warn("Could not increment promo code in DB:", e);
  }

  try {
    const localList = readLocalPromoCodes().map((p) =>
      p.code.toUpperCase() === cleanCode ? { ...p, usedCount: (p.usedCount || 0) + 1 } : p
    );
    writeLocalPromoCodes(localList);
  } catch (e) {
    console.warn("Could not increment promo code in local JSON:", e);
  }
}
