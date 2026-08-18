import { NextResponse } from "next/server";
import { syncOrderToManager } from "@/lib/managerSync";
import { validatePromoCodeAction } from "@/app/actions/promoActions";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { items, shippingMethod, selectedRelay, pickupSlot, promoCode } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Le panier est vide." },
        { status: 400 }
      );
    }

    let stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      // Clean any whitespaces, tabs, carriage returns or formatting glyphs from copy-paste
      stripeKey = stripeKey.trim().replace(/[\s\r\n↵\u2195]/g, "");
    }

    const isPureDonation = items.every((item: any) =>
      item.id === -1 ||
      item.id === -2 ||
      item.id === -3 ||
      (typeof item.id === "string" && item.id.startsWith("don-"))
    );

    // Compute normal items total for promo & shipping thresholds
    const normalTotal = items
      .filter((item: any) => item.productId > 0 || (typeof item.id === "number" && item.id > 0))
      .reduce((acc: number, item: any) => acc + parseFloat(item.price) * item.quantity, 0);

    const fullCartTotal = items.reduce(
      (acc: number, item: any) => acc + parseFloat(item.price) * item.quantity,
      0
    );

    // Server-side promo code validation
    let appliedPromo: any = null;
    let discountAmount = 0;

    if (promoCode && typeof promoCode === "string" && promoCode.trim().length > 0) {
      try {
        const promoValidation = await validatePromoCodeAction(promoCode.trim(), normalTotal || fullCartTotal);
        if (promoValidation.valid && promoValidation.promo) {
          appliedPromo = promoValidation.promo;
          discountAmount = promoValidation.discountAmount || 0;
        } else {
          console.warn("[Checkout] Promo code invalid:", promoValidation.error);
        }
      } catch (err) {
        console.error("[Checkout] Error during promo validation:", err);
      }
    }

    const isFreeShippingByPromo = appliedPromo?.discountType === "free_shipping";
    const isFreeShipping = (normalTotal >= 40) || isFreeShippingByPromo;

    // Fallback simulation in dev mode if Stripe keys are missing
    if (!stripeKey) {
      console.log("[Dev Mode] Stripe API keys are missing. Creating simulated order...");

      const orderId = `SP-${Math.floor(10000 + Math.random() * 90000)}`;
      const cost = isPureDonation
        ? 0
        : shippingMethod === "pickup"
        ? 0
        : isFreeShipping
        ? 0
        : shippingMethod === "relay"
        ? 3.90
        : 4.90;

      const finalTotal = Math.max(0, fullCartTotal - discountAmount + cost);

      const purchasedItems = items.map((item: any) => {
        const optionsText = Object.entries(item.selectedOptions || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        const name = optionsText ? `${item.name} (${optionsText})` : item.name;
        return {
          name: name,
          quantity: item.quantity,
          price: item.price,
          slug: item.slug || null,
        };
      });

      const newOrderData = {
        id: orderId,
        stripeSession: `sim_${orderId}`,
        email: "client-demo@spoolio.fr",
        customerName: "Jean Demo",
        items: JSON.stringify(purchasedItems),
        total: finalTotal,
        shippingCost: cost,
        shippingMethod: isPureDonation ? "don_soutien" : shippingMethod || "home",
        status: isPureDonation ? "don_soutien" : "attente_impression",
        relayDetails:
          !isPureDonation && shippingMethod === "relay" && selectedRelay
            ? JSON.stringify(selectedRelay)
            : null,
        pickupSlotRequested: !isPureDonation && shippingMethod === "pickup" ? pickupSlot : null,
        pickupStatus: !isPureDonation && shippingMethod === "pickup" ? "pending" : null,
        createdAt: new Date().toISOString(),
      };

      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.order.create({
          data: {
            id: newOrderData.id,
            stripeSession: newOrderData.stripeSession,
            email: newOrderData.email,
            customerName: newOrderData.customerName,
            items: newOrderData.items,
            total: newOrderData.total,
            shippingCost: newOrderData.shippingCost,
            shippingMethod: newOrderData.shippingMethod,
            status: newOrderData.status,
            relayDetails: newOrderData.relayDetails,
            pickupSlotRequested: newOrderData.pickupSlotRequested,
            pickupStatus: newOrderData.pickupStatus,
          },
        });

        // Sync simulated order into spoolio-manager
        try {
          await syncOrderToManager(newOrderData);
        } catch (syncErr) {
          console.error("Manager sync error in simulated checkout:", syncErr);
        }
      } catch (err) {
        console.error("Failed to create simulated order in Prisma:", err);
      }

      // Synchronize local JSON cache
      try {
        const jsonPath = path.join(process.cwd(), "src/data/orders.json");
        let localOrders = [];
        if (fs.existsSync(jsonPath)) {
          try {
            localOrders = JSON.parse(fs.readFileSync(jsonPath, "utf-8") || "[]");
          } catch (e) {
            localOrders = [];
          }
        }
        localOrders.unshift(newOrderData);
        fs.writeFileSync(jsonPath, JSON.stringify(localOrders, null, 2), "utf-8");
        console.log("Successfully persisted simulated order in local orders.json!");
      } catch (jsonErr: any) {
        console.error("Failed to write local orders.json:", jsonErr.message);
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
      return NextResponse.json({ url: `/success?session_id=sim_${orderId}&simulated=true` });
    }

    // Call real Stripe REST API using native fetch
    const lineItems = items.map((item: any) => {
      const optionsText = Object.entries(item.selectedOptions || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");

      const name = optionsText ? `${item.name} (${optionsText})` : item.name;

      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: name,
            images: item.image && item.image.startsWith("http") ? [item.image] : [],
          },
          unit_amount: Math.round(parseFloat(item.price) * 100), // cents
        },
        quantity: item.quantity,
      };
    });

    // Add shipping cost line item to Stripe Checkout if applicable
    if (!isPureDonation && shippingMethod !== "pickup" && !isFreeShipping) {
      const isRelay = shippingMethod === "relay";
      const shippingLabel = isRelay
        ? "Frais de livraison - Point Relais Mondial Relay (Boxtal)"
        : "Frais de livraison - Colissimo Domicile (Boxtal)";
      const shippingAmount = isRelay ? 3.90 : 4.90;

      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: shippingLabel,
            images: [],
          },
          unit_amount: Math.round(shippingAmount * 100), // cents
        },
        quantity: 1,
      });
    }

    const body = new URLSearchParams();
    body.append("mode", "payment");
    body.append("success_url", new URL("/success?session_id={CHECKOUT_SESSION_ID}", request.url).href);
    body.append("cancel_url", new URL("/boutique", request.url).href);

    // Dynamic Stripe Coupon application if a promo discount applies
    let stripeCouponId: string | null = null;
    if (appliedPromo && discountAmount > 0) {
      try {
        const couponBody = new URLSearchParams();
        couponBody.append("duration", "once");
        couponBody.append("name", `Code ${appliedPromo.code}`);

        if (appliedPromo.discountType === "percentage") {
          couponBody.append("percent_off", String(appliedPromo.discountValue));
        } else {
          // Amount off in cents
          couponBody.append("amount_off", String(Math.round(discountAmount * 100)));
          couponBody.append("currency", "eur");
        }

        const couponRes = await fetch("https://api.stripe.com/v1/coupons", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: couponBody.toString(),
        });

        if (couponRes.ok) {
          const couponData = await couponRes.json();
          stripeCouponId = couponData.id;
        } else {
          console.warn("[Stripe Coupon Creation] Could not create dynamic coupon:", await couponRes.text());
        }
      } catch (couponErr) {
        console.error("[Stripe Coupon Error]:", couponErr);
      }
    }

    if (stripeCouponId) {
      body.append("discounts[0][coupon]", stripeCouponId);
    } else {
      // Allow customers to enter codes on Stripe page only if no Spoolio promo code was applied
      body.append("allow_promotion_codes", "true");
    }

    // Append billing & shipping address collection if delivery is required
    if (!isPureDonation && shippingMethod !== "pickup") {
      body.append("shipping_address_collection[allowed_countries][0]", "FR");
      body.append("shipping_address_collection[allowed_countries][1]", "BE");
      body.append("phone_number_collection[enabled]", "true");
    }

    // Append metadata to track details dynamically in Stripe/Boxtal/Manager
    body.append("metadata[shipping_method]", isPureDonation ? "don_soutien" : shippingMethod || "home");
    if (appliedPromo) {
      body.append("metadata[promo_code]", appliedPromo.code);
      body.append("metadata[discount_amount]", discountAmount.toFixed(2));
    }

    if (!isPureDonation) {
      if (shippingMethod === "relay" && selectedRelay) {
        body.append("metadata[relay_id]", selectedRelay.id || "");
        body.append("metadata[relay_name]", selectedRelay.name || "");
        body.append("metadata[relay_address]", `${selectedRelay.address}, ${selectedRelay.cp} ${selectedRelay.ville}`);
      }
      if (shippingMethod === "pickup" && pickupSlot) {
        body.append("metadata[pickup_slot]", pickupSlot);
      }
    }

    // Append items parameters
    lineItems.forEach((li: any, index: number) => {
      body.append(`line_items[${index}][price_data][currency]`, li.price_data.currency);
      body.append(`line_items[${index}][price_data][product_data][name]`, li.price_data.product_data.name);
      if (li.price_data.product_data.images.length > 0) {
        body.append(`line_items[${index}][price_data][product_data][images][0]`, li.price_data.product_data.images[0]);
      }
      body.append(`line_items[${index}][price_data][unit_amount]`, li.price_data.unit_amount.toString());
      body.append(`line_items[${index}][quantity]`, li.quantity.toString());
    });

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const stripeSession = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error("[Stripe API Error]", stripeSession.error?.message || "Unknown error");
      return NextResponse.json(
        { error: stripeSession.error?.message || "Erreur Stripe lors de l'initialisation du paiement." },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: stripeSession.url });
  } catch (e: any) {
    console.error("Checkout process error:", e.message || e);
    return NextResponse.json(
      { error: e.message || "Erreur de traitement de la commande." },
      { status: 500 }
    );
  }
}
