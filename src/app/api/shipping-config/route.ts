import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SHIPPING_CONFIG, ShippingConfig } from "@/types/shipping";

export const dynamic = "force-dynamic";

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
    return NextResponse.json({ success: true, config: DEFAULT_SHIPPING_CONFIG });
  }
}
