"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface LotteryPrizeItem {
  id: string;
  title: string;
  subtitle?: string | null;
  icon: string;
  color: string;
  textColor: string;
  probability: number;
  stock?: number | null;
  couponCode?: string | null;
  isActive: boolean;
  position: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LotterySpinItem {
  id: string;
  prizeId: string;
  prizeTitle: string;
  userEmail?: string | null;
  userName?: string | null;
  createdAt: string;
}

const DEFAULT_FALLBACK_PRIZES: Omit<LotteryPrizeItem, "id">[] = [
  {
    title: "Spoolie Mini 3D",
    subtitle: "Produit Spoolio offert",
    icon: "🧸",
    color: "#FF5500",
    textColor: "#FFFFFF",
    probability: 1,
    stock: 5,
    couponCode: "SPOOLIE-MINI-WIN",
    isActive: true,
    position: 1,
  },
  {
    title: "-15% Boutique",
    subtitle: "Sur toute la commande",
    icon: "🎟️",
    color: "#3B82F6",
    textColor: "#FFFFFF",
    probability: 3,
    stock: null,
    couponCode: "WHEEL15",
    isActive: true,
    position: 2,
  },
  {
    title: "Pas de chance !",
    subtitle: "Tente à nouveau demain",
    icon: "😅",
    color: "#1F2937",
    textColor: "#9CA3AF",
    probability: 2,
    stock: null,
    couponCode: null,
    isActive: true,
    position: 3,
  },
  {
    title: "Sticker Exclusif",
    subtitle: "Glissé dans ton colis",
    icon: "✨",
    color: "#EC4899",
    textColor: "#FFFFFF",
    probability: 2,
    stock: 20,
    couponCode: "STICKER-WIN",
    isActive: true,
    position: 4,
  },
  {
    title: "+50 Points",
    subtitle: "Crédités sur ta carte",
    icon: "🌟",
    color: "#EAB308",
    textColor: "#000000",
    probability: 3,
    stock: null,
    couponCode: "LOYALTY50",
    isActive: true,
    position: 5,
  },
  {
    title: "-20% Flash",
    subtitle: "Valable 24h seulement",
    icon: "⚡",
    color: "#8B5CF6",
    textColor: "#FFFFFF",
    probability: 1,
    stock: 10,
    couponCode: "FLASH20",
    isActive: true,
    position: 6,
  },
  {
    title: "Fidget Surprise",
    subtitle: "Pour 15€ d'achat",
    icon: "🎁",
    color: "#10B981",
    textColor: "#FFFFFF",
    probability: 2,
    stock: 8,
    couponCode: "FREE-FIDGET",
    isActive: true,
    position: 7,
  },
  {
    title: "-10% Immédiat",
    subtitle: "Code promo direct",
    icon: "🔥",
    color: "#F97316",
    textColor: "#FFFFFF",
    probability: 4,
    stock: null,
    couponCode: "SPIN10",
    isActive: true,
    position: 8,
  },
];

/**
 * Ensure default prizes exist in DB if table is empty.
 */
async function ensureDefaultPrizesExist() {
  if (!prisma) return;
  const count = await prisma.lotteryPrize.count();
  if (count === 0) {
    for (const p of DEFAULT_FALLBACK_PRIZES) {
      await prisma.lotteryPrize.create({
        data: p,
      });
    }
  }
}

/**
 * Fetch all active prizes sorted by position for the public wheel.
 */
export async function getLotteryPrizesAction(): Promise<LotteryPrizeItem[]> {
  try {
    if (!prisma) return generateFallbackPrizes();

    await ensureDefaultPrizesExist();

    const prizes = await prisma.lotteryPrize.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    });

    if (prizes.length === 0) return generateFallbackPrizes();

    return prizes.map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      icon: p.icon || "🎁",
      color: p.color || "#FF5500",
      textColor: p.textColor || "#FFFFFF",
      probability: p.probability ?? 1,
      stock: p.stock,
      couponCode: p.couponCode,
      isActive: p.isActive,
      position: p.position,
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
    }));
  } catch (error: any) {
    console.error("Error in getLotteryPrizesAction:", error?.message);
    return generateFallbackPrizes();
  }
}

/**
 * Fetch all prizes (active & inactive) + full spin history for admin.
 */
export async function getAllLotteryPrizesAdminAction(): Promise<{
  prizes: LotteryPrizeItem[];
  spins: LotterySpinItem[];
}> {
  try {
    if (!prisma) {
      return { prizes: generateFallbackPrizes(), spins: [] };
    }

    await ensureDefaultPrizesExist();

    const [prizes, spins] = await Promise.all([
      prisma.lotteryPrize.findMany({
        orderBy: { position: "asc" },
      }),
      prisma.lotterySpin.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      prizes: prizes.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        icon: p.icon || "🎁",
        color: p.color || "#FF5500",
        textColor: p.textColor || "#FFFFFF",
        probability: p.probability ?? 1,
        stock: p.stock,
        couponCode: p.couponCode,
        isActive: p.isActive,
        position: p.position,
        createdAt: p.createdAt?.toISOString(),
        updatedAt: p.updatedAt?.toISOString(),
      })),
      spins: spins.map((s) => ({
        id: s.id,
        prizeId: s.prizeId,
        prizeTitle: s.prizeTitle,
        userEmail: s.userEmail,
        userName: s.userName,
        createdAt: s.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    console.error("Error in getAllLotteryPrizesAdminAction:", error?.message);
    return { prizes: generateFallbackPrizes(), spins: [] };
  }
}

/**
 * Admin action: Create a new prize.
 */
export async function createLotteryPrizeAdminAction(payload: {
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  textColor?: string;
  probability?: number;
  stock?: number | null;
  couponCode?: string;
  isActive?: boolean;
}) {
  if (!payload.title || payload.title.trim() === "") {
    return { success: false, error: "Le titre du lot est obligatoire." };
  }

  try {
    if (!prisma) return { success: true };

    const highest = await prisma.lotteryPrize.findFirst({
      orderBy: { position: "desc" },
    });
    const position = (highest?.position || 0) + 1;

    const created = await prisma.lotteryPrize.create({
      data: {
        title: payload.title.trim(),
        subtitle: payload.subtitle?.trim() || null,
        icon: payload.icon?.trim() || "🎁",
        color: payload.color || "#FF5500",
        textColor: payload.textColor || "#FFFFFF",
        probability: Number(payload.probability) || 1.0,
        stock: payload.stock !== undefined && payload.stock !== null ? Number(payload.stock) : null,
        couponCode: payload.couponCode?.trim() || null,
        isActive: payload.isActive ?? true,
        position,
      },
    });

    revalidatePath("/loterie");
    revalidatePath("/admin/loterie");

    return { success: true, prize: created };
  } catch (error: any) {
    console.error("Error in createLotteryPrizeAdminAction:", error?.message);
    return { success: false, error: error?.message };
  }
}

/**
 * Admin action: Update an existing prize.
 */
export async function updateLotteryPrizeAdminAction(
  id: string,
  payload: {
    title?: string;
    subtitle?: string | null;
    icon?: string;
    color?: string;
    textColor?: string;
    probability?: number;
    stock?: number | null;
    couponCode?: string | null;
    isActive?: boolean;
    position?: number;
  }
) {
  try {
    if (!prisma) return { success: true };

    const dataToUpdate: any = {};
    if (payload.title !== undefined) dataToUpdate.title = payload.title.trim();
    if (payload.subtitle !== undefined) dataToUpdate.subtitle = payload.subtitle?.trim() || null;
    if (payload.icon !== undefined) dataToUpdate.icon = payload.icon.trim() || "🎁";
    if (payload.color !== undefined) dataToUpdate.color = payload.color;
    if (payload.textColor !== undefined) dataToUpdate.textColor = payload.textColor;
    if (payload.probability !== undefined) dataToUpdate.probability = Number(payload.probability);
    if (payload.stock !== undefined) dataToUpdate.stock = payload.stock !== null ? Number(payload.stock) : null;
    if (payload.couponCode !== undefined) dataToUpdate.couponCode = payload.couponCode?.trim() || null;
    if (payload.isActive !== undefined) dataToUpdate.isActive = payload.isActive;
    if (payload.position !== undefined) dataToUpdate.position = Number(payload.position);

    const updated = await prisma.lotteryPrize.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/loterie");
    revalidatePath("/admin/loterie");

    return { success: true, prize: updated };
  } catch (error: any) {
    console.error("Error in updateLotteryPrizeAdminAction:", error?.message);
    return { success: false, error: error?.message };
  }
}

/**
 * Admin action: Delete a prize.
 */
export async function deleteLotteryPrizeAdminAction(id: string) {
  try {
    if (!prisma) return { success: true };

    await prisma.lotteryPrize.delete({
      where: { id },
    });

    revalidatePath("/loterie");
    revalidatePath("/admin/loterie");

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteLotteryPrizeAdminAction:", error?.message);
    return { success: false, error: error?.message };
  }
}

/**
 * Public action: Spin wheel and capture user lead (email & optional name).
 */
export async function spinWheelAction(userEmail?: string, userName?: string) {
  try {
    let prizes = await getLotteryPrizesAction();

    // Filter out prizes with stock === 0
    const availablePrizes = prizes.filter((p) => p.stock === null || p.stock === undefined || p.stock > 0);

    if (availablePrizes.length === 0) {
      return { success: false, error: "Aucun lot disponible pour le moment." };
    }

    // Weighted random selection
    const totalWeight = availablePrizes.reduce((sum, p) => sum + (p.probability > 0 ? p.probability : 1), 0);
    let randomNum = Math.random() * totalWeight;

    let winningPrize = availablePrizes[0];
    for (const prize of availablePrizes) {
      const weight = prize.probability > 0 ? prize.probability : 1;
      if (randomNum <= weight) {
        winningPrize = prize;
        break;
      }
      randomNum -= weight;
    }

    // Find the winning prize index in the full active prizes array
    const winningIndex = prizes.findIndex((p) => p.id === winningPrize.id);

    // Record the spin in DB & decrement stock if limited
    if (prisma && winningPrize.id && !winningPrize.id.startsWith("fallback-")) {
      await prisma.lotterySpin.create({
        data: {
          prizeId: winningPrize.id,
          prizeTitle: winningPrize.title,
          userEmail: userEmail?.trim() || null,
          userName: userName?.trim() || null,
        },
      });

      if (winningPrize.stock !== null && winningPrize.stock !== undefined && winningPrize.stock > 0) {
        await prisma.lotteryPrize.update({
          where: { id: winningPrize.id },
          data: { stock: { decrement: 1 } },
        });
      }
    }

    return {
      success: true,
      winningIndex: winningIndex >= 0 ? winningIndex : 0,
      winningPrize,
    };
  } catch (error: any) {
    console.error("Error in spinWheelAction:", error?.message);
    return { success: false, error: "Impossible d'effectuer le tirage." };
  }
}

function generateFallbackPrizes(): LotteryPrizeItem[] {
  return DEFAULT_FALLBACK_PRIZES.map((p, idx) => ({
    ...p,
    id: `fallback-${idx + 1}`,
  }));
}
