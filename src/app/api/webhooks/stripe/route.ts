import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function decodeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&nbsp;/g, " ");
}

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!payload) {
      return NextResponse.json(
        { error: "Payload vide." },
        { status: 400 }
      );
    }

    let event: any;
    try {
      event = JSON.parse(payload);
    } catch (err) {
      return NextResponse.json(
        { error: "Format JSON invalide." },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook] Reçu l'événement de type: ${event.type}`);

    // handle-checkout-completed: Listen for checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data?.object;
      
      if (session) {
        const sessionId = session.id;
        const email = session.customer_details?.email || "";
        const customerName = session.customer_details?.name || "";
        const total = session.amount_total ? session.amount_total / 100 : 0;
        const shippingMethod = session.metadata?.shipping_method || "home";
        const pickupSlot = session.metadata?.pickup_slot || null;
        
        // Extract Point Relais metadata if applicable
        let relayDetails = null;
        if (shippingMethod === "relay" && session.metadata?.relay_id) {
          relayDetails = JSON.stringify({
            id: session.metadata.relay_id,
            name: session.metadata.relay_name,
            address: session.metadata.relay_address
          });
        }

        // Fetch line items from Stripe to store details in DB
        let itemsSummary = "[]";
        try {
          const stripeKey = process.env.STRIPE_SECRET_KEY?.trim().replace(/[\s\r\n↵\u2195]/g, "");
          const lineItemsRes = await fetch(
            `https://api.stripe.com/v1/checkout/sessions/${sessionId}/line_items`,
            {
              headers: { Authorization: `Bearer ${stripeKey}` }
            }
          );
          
          if (lineItemsRes.ok) {
            const lineItemsData = await lineItemsRes.json();
            const purchasedItems = (lineItemsData.data || []).map((li: any) => ({
              name: decodeHtml(li.description),
              quantity: li.quantity,
              price: (li.amount_total / li.quantity / 100).toFixed(2)
            }));
            itemsSummary = JSON.stringify(purchasedItems);
          }
        } catch (e) {
          console.error("[Webhook Error] Échec de la récupération des articles Stripe:", e);
        }

        // Generate clean human-readable short ID for order (e.g. SP-12345)
        const orderId = `SP-${Math.floor(10000 + Math.random() * 90000)}`;

        console.log(`[Stripe Success] Création de la commande réelle en base: ${orderId} (${email})`);

        // Insert order inside MySQL o2switch database
        const shippingCost = shippingMethod === "pickup" ? 0 : (shippingMethod === "relay" ? 3.90 : 4.90);
        const newOrderData = {
          id: orderId,
          stripeSession: sessionId,
          email: email,
          customerName: customerName,
          items: itemsSummary,
          total: total,
          shippingCost: shippingCost,
          shippingMethod: shippingMethod,
          status: "attente_impression",
          relayDetails: relayDetails,
          pickupSlotRequested: shippingMethod === "pickup" ? pickupSlot : null,
          pickupStatus: shippingMethod === "pickup" ? "pending" : null,
          createdAt: new Date().toISOString()
        };

        try {
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
              pickupStatus: newOrderData.pickupStatus
            }
          });
        } catch (dbErr: any) {
          console.error("[Webhook Database Error] Failed to write order to database:", dbErr.message);
        }

        // Cache order in local JSON file
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
        } catch (jsonErr: any) {
          console.error("[Webhook Cache Error] Failed to cache order in local JSON:", jsonErr.message);
        }

        // Send confirmation email via Resend
        try {
          const parsedItems = JSON.parse(itemsSummary || "[]");
          const parsedRelay = relayDetails ? JSON.parse(relayDetails) : null;
          await sendOrderConfirmationEmail({
            orderId: orderId,
            customerName: customerName,
            customerEmail: email,
            items: parsedItems,
            total: total,
            shippingCost: shippingCost,
            shippingMethod: shippingMethod,
            relayDetails: parsedRelay
          });
        } catch (emailErr: any) {
          console.error("[Webhook Email Trigger Error] Failed to trigger email send:", emailErr.message);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`[Stripe Webhook Error] ${err.message}`);
    return NextResponse.json(
      { error: `Erreur interne du serveur: ${err.message}` },
      { status: 500 }
    );
  }
}
