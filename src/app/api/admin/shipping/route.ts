import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import { DEFAULT_SHIPPING_CONFIG, ShippingConfig } from "@/types/shipping";

export const dynamic = "force-dynamic";

// GET: Retrieve financial & shipping settings
export async function GET() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: "config-shipping" },
    });

    let config: ShippingConfig = DEFAULT_SHIPPING_CONFIG;
    if (page && page.content) {
      try {
        const parsed = JSON.parse(page.content);
        config = {
          freeShippingThreshold: typeof parsed.freeShippingThreshold === "number" ? parsed.freeShippingThreshold : DEFAULT_SHIPPING_CONFIG.freeShippingThreshold,
          relayShippingCost: typeof parsed.relayShippingCost === "number" ? parsed.relayShippingCost : DEFAULT_SHIPPING_CONFIG.relayShippingCost,
          homeShippingCost: typeof parsed.homeShippingCost === "number" ? parsed.homeShippingCost : DEFAULT_SHIPPING_CONFIG.homeShippingCost,
          pickupShippingCost: typeof parsed.pickupShippingCost === "number" ? parsed.pickupShippingCost : DEFAULT_SHIPPING_CONFIG.pickupShippingCost,
          enablePromoFreeShipping: typeof parsed.enablePromoFreeShipping === "boolean" ? parsed.enablePromoFreeShipping : DEFAULT_SHIPPING_CONFIG.enablePromoFreeShipping,
          shippingNotice: parsed.shippingNotice || DEFAULT_SHIPPING_CONFIG.shippingNotice,
        };
      } catch {
        config = DEFAULT_SHIPPING_CONFIG;
      }
    }

    return NextResponse.json({ success: true, config });
  } catch (e: any) {
    console.warn("GET shipping config error, returning defaults:", e.message || e);
    return NextResponse.json({ success: true, config: DEFAULT_SHIPPING_CONFIG });
  }
}

// POST: Save financial & shipping settings (Admin only)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spoolio_admin_session")?.value;
    const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";

    if (!token || !(await verifySession(token, secret))) {
      return NextResponse.json(
        { error: "Accès refusé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const payload = await request.json();

    const configToSave: ShippingConfig = {
      freeShippingThreshold: Math.max(0, parseFloat(payload.freeShippingThreshold) || DEFAULT_SHIPPING_CONFIG.freeShippingThreshold),
      relayShippingCost: Math.max(0, parseFloat(payload.relayShippingCost) || DEFAULT_SHIPPING_CONFIG.relayShippingCost),
      homeShippingCost: Math.max(0, parseFloat(payload.homeShippingCost) || DEFAULT_SHIPPING_CONFIG.homeShippingCost),
      pickupShippingCost: Math.max(0, parseFloat(payload.pickupShippingCost) ?? DEFAULT_SHIPPING_CONFIG.pickupShippingCost),
      enablePromoFreeShipping: Boolean(payload.enablePromoFreeShipping),
      shippingNotice: (payload.shippingNotice || DEFAULT_SHIPPING_CONFIG.shippingNotice).trim(),
    };

    const configString = JSON.stringify(configToSave);

    await prisma.page.upsert({
      where: { slug: "config-shipping" },
      update: {
        content: configString,
      },
      create: {
        title: "Configuration Financière et Livraison",
        slug: "config-shipping",
        content: configString,
        status: "publish",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Paramètres financiers et tarifs de livraison enregistrés avec succès.",
      config: configToSave,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de la sauvegarde de la configuration." },
      { status: 500 }
    );
  }
}
