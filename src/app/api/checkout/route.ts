import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { items, shippingMethod, selectedRelay } = await request.json();
    
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
    
    // Fallback simulation in dev mode if Stripe keys are missing
    if (!stripeKey) {
      console.log("[Dev Mode] Stripe API keys are missing. Creating simulated order...");
      
      const orderId = `SP-${Math.floor(10000 + Math.random() * 90000)}`;
      const cartTotal = items.reduce((acc: number, item: any) => acc + parseFloat(item.price) * item.quantity, 0);
      const isFreeShipping = cartTotal >= 40;
      const cost = shippingMethod === "pickup" ? 0 : (isFreeShipping ? 0 : (shippingMethod === "relay" ? 3.90 : 4.90));

      const purchasedItems = items.map((item: any) => {
        const optionsText = Object.entries(item.selectedOptions || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        const name = optionsText ? `${item.name} (${optionsText})` : item.name;
        return {
          name: name,
          quantity: item.quantity,
          price: item.price
        };
      });

      const newOrderData = {
        id: orderId,
        stripeSession: `sim_${orderId}`,
        email: "client-demo@spoolio.fr",
        customerName: "Jean Demo",
        items: JSON.stringify(purchasedItems),
        total: cartTotal + cost,
        shippingCost: cost,
        shippingMethod: shippingMethod || "home",
        status: "attente_impression",
        relayDetails: shippingMethod === "relay" && selectedRelay ? JSON.stringify(selectedRelay) : null,
        createdAt: new Date().toISOString()
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
            relayDetails: newOrderData.relayDetails
          }
        });
      } catch (err) {
        console.error("Failed to create simulated order in Prisma:", err);
      }

      // Synchronize local JSON cache
      try {
        const jsonPath = path.join(process.cwd(), 'src/data/orders.json');
        let localOrders = [];
        if (fs.existsSync(jsonPath)) {
          try {
            localOrders = JSON.parse(fs.readFileSync(jsonPath, 'utf-8') || "[]");
          } catch (e) {
            localOrders = [];
          }
        }
        localOrders.unshift(newOrderData);
        fs.writeFileSync(jsonPath, JSON.stringify(localOrders, null, 2), 'utf-8');
        console.log("Successfully persisted simulated order in local orders.json!");
      } catch (jsonErr: any) {
        console.error("Failed to write local orders.json:", jsonErr.message);
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      return NextResponse.json({ url: `/success?session_id=sim_${orderId}&simulated=true` });
    }

    // Call real Stripe REST API using native fetch (no npm install stripe needed)
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
            // Fallback default image link if item.image is a local path
            images: item.image && item.image.startsWith("http") ? [item.image] : [],
          },
          unit_amount: Math.round(parseFloat(item.price) * 100), // Stripe expects amounts in cents
        },
        quantity: item.quantity,
      };
    });

    // Compute total of items to check for free shipping (offered over 40€)
    const cartTotal = items.reduce(
      (acc: number, item: any) => acc + parseFloat(item.price) * item.quantity,
      0
    );
    const isFreeShipping = cartTotal >= 40;

    // Add shipping cost line item to Stripe Checkout if applicable
    if (shippingMethod !== "pickup" && !isFreeShipping) {
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
    
    // Append billing & shipping address collection if delivery is required
    if (shippingMethod !== "pickup") {
      body.append("shipping_address_collection[allowed_countries][0]", "FR");
      body.append("shipping_address_collection[allowed_countries][1]", "BE");
    }

    // Append metadata to track shipping details dynamically in Stripe/Boxtal
    body.append("metadata[shipping_method]", shippingMethod || "home");
    if (shippingMethod === "relay" && selectedRelay) {
      body.append("metadata[relay_id]", selectedRelay.id || "");
      body.append("metadata[relay_name]", selectedRelay.name || "");
      body.append("metadata[relay_address]", `${selectedRelay.address}, ${selectedRelay.cp} ${selectedRelay.ville}`);
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
