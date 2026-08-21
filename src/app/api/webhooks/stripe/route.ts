import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from "@/lib/email";
import { syncOrderToManager } from "@/lib/managerSync";
import { extractAddressFromStripeSession } from "@/lib/stripeAddress";
import { incrementPromoCodeUsage } from "@/app/actions/promoActions";
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
        // Gift card purchase checkout completion
        if (session.metadata?.type === "gift_card") {
          const giftCardId = session.metadata.giftCardId;
          if (giftCardId && prisma) {
            try {
              await prisma.giftCard.update({
                where: { id: giftCardId },
                data: { isPaid: true, stripeSession: session.id }
              });
              console.log(`[Stripe Webhook] Gift card ${session.metadata.giftCardCode} activated successfully.`);
            } catch (err) {
              console.error("[Stripe Webhook Error] Failed to activate gift card:", err);
            }
          }
          return NextResponse.json({ received: true });
        }
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
            const purchasedItems = (lineItemsData.data || []).map((li: any) => {
              const unitAmount = li.amount_subtotal ?? li.amount_total;
              return {
                name: decodeHtml(li.description),
                quantity: li.quantity,
                price: (unitAmount / li.quantity / 100).toFixed(2)
              };
            });
            itemsSummary = JSON.stringify(purchasedItems);
          }
        } catch (e) {
          console.error("[Webhook Error] Échec de la récupération des articles Stripe:", e);
        }

        // Generate clean human-readable short ID for order (e.g. SP-12345)
        const orderId = `SP-${Math.floor(10000 + Math.random() * 90000)}`;

        // Extract shipping address and telephone from Stripe checkout session
        const shippingAddress = extractAddressFromStripeSession(session, customerName, shippingMethod);

        const customerPhone = session.customer_details?.phone || null;

        console.log(`[Stripe Success] Création de la commande réelle en base: ${orderId} (${email})`);

        // Insert order inside MySQL o2switch database
        const isDonation = shippingMethod === "don_soutien";
        const shippingCost = isDonation ? 0 : (shippingMethod === "pickup" ? 0 : (shippingMethod === "relay" ? 3.90 : 4.90));
        const newOrderData = {
          id: orderId,
          stripeSession: sessionId,
          email: email,
          customerName: customerName,
          customerPhone: customerPhone,
          shippingAddress: shippingAddress,
          items: itemsSummary,
          total: total,
          shippingCost: shippingCost,
          shippingMethod: shippingMethod,
          status: isDonation ? "don_soutien" : "attente_impression",
          relayDetails: relayDetails,
          pickupSlotRequested: !isDonation && shippingMethod === "pickup" ? pickupSlot : null,
          pickupStatus: !isDonation && shippingMethod === "pickup" ? "pending" : null,
          createdAt: new Date().toISOString()
        };

        try {
          await prisma.order.create({
            data: {
              id: newOrderData.id,
              stripeSession: newOrderData.stripeSession,
              email: newOrderData.email,
              customerName: newOrderData.customerName,
              customerPhone: newOrderData.customerPhone,
              shippingAddress: newOrderData.shippingAddress,
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

          // Sync order in real-time to spoolio-manager Supabase database
          try {
            await syncOrderToManager(newOrderData);
          } catch (syncErr) {
            console.error("Manager sync error in Stripe Webhook:", syncErr);
          }

          // Track promo code usage if order used a promo code
          if (session.metadata?.promo_code) {
            try {
              await incrementPromoCodeUsage(session.metadata.promo_code);
            } catch (promoErr) {
              console.error("Promo code increment error in Stripe Webhook:", promoErr);
            }
          }

          // Loyalty Cards Point Credits (Option 1: Link automatically by email)
          let pointsGagnes = 0;
          try {
            const parsedItems = JSON.parse(itemsSummary || "[]");
            // Calculate eligible total (exclude shipping fees and items with "Don de soutien" or similar)
            const eligibleTotal = parsedItems
              .filter((item: any) => !item.name.toLowerCase().includes("don de soutien"))
              .reduce((acc: number, item: any) => acc + (parseFloat(item.price) * item.quantity), 0);
            
            pointsGagnes = Math.floor(eligibleTotal / 2);
          } catch (e) {
            pointsGagnes = Math.floor((total - shippingCost) / 2);
          }

          if (pointsGagnes > 0 && email) {
            try {
              const cleanEmail = email.trim().toLowerCase();
              const card = await prisma.loyaltyCard.findFirst({
                where: {
                  customerEmail: {
                    equals: cleanEmail,
                    mode: "insensitive"
                  }
                }
              });

              if (card) {
                const currentHistory = typeof card.history === "string" 
                  ? JSON.parse(card.history)
                  : (Array.isArray(card.history) ? card.history : []);
                  
                const nextHistory = [
                  {
                    date: new Date().toISOString(),
                    points: `+${pointsGagnes}`,
                    reason: `Achat Commande ${orderId}`
                  },
                  ...currentHistory
                ];

                await prisma.loyaltyCard.update({
                  where: { id: card.id },
                  data: {
                    points: card.points + pointsGagnes,
                    history: JSON.stringify(nextHistory)
                  }
                });
                console.log(`[Loyalty Webhook] Credited +${pointsGagnes} points to card ${card.id} (${cleanEmail})`);
              } else {
                const autoCardId = `spoolio-${Math.random().toString(36).substring(2, 10)}`;
                await prisma.loyaltyCard.create({
                  data: {
                    id: autoCardId,
                    customerName: customerName || null,
                    customerEmail: cleanEmail,
                    points: pointsGagnes,
                    history: JSON.stringify([{
                      date: new Date().toISOString(),
                      points: `+${pointsGagnes}`,
                      reason: `Achat Commande ${orderId}`
                    }])
                  }
                });
                console.log(`[Loyalty Webhook] Auto-created new card ${autoCardId} with +${pointsGagnes} points for ${cleanEmail}`);
              }
            } catch (loyaltyErr: any) {
              console.error("[Loyalty Webhook Error] Failed to credit points:", loyaltyErr.message);
            }
          }

          // Deduct loyalty points if order contains loyalty reward items
          try {
            const parsedItems = JSON.parse(itemsSummary || "[]");
            const rewardItems = parsedItems.filter((item: any) => item.isLoyaltyReward || item.rewardPointsCost || item.productId < -9000);
            
            for (const rewardItem of rewardItems) {
              const pointsToDeduct = rewardItem.rewardPointsCost || 0;
              const cardIdTarget = rewardItem.loyaltyCardId;
              
              if (pointsToDeduct > 0) {
                const targetCard = await prisma.loyaltyCard.findFirst({
                  where: {
                    OR: [
                      ...(cardIdTarget ? [{ id: cardIdTarget }] : []),
                      ...(email ? [{ customerEmail: { equals: email.trim().toLowerCase(), mode: "insensitive" as const } }] : [])
                    ]
                  }
                });

                if (targetCard) {
                  const currentHist = typeof targetCard.history === "string" 
                    ? JSON.parse(targetCard.history) 
                    : (Array.isArray(targetCard.history) ? targetCard.history : []);
                  
                  const nextHist = [
                    {
                      date: new Date().toISOString(),
                      points: `-${pointsToDeduct}`,
                      reason: `Cadeau réclamé: ${rewardItem.name} (Commande ${orderId})`
                    },
                    ...currentHist
                  ];

                  await prisma.loyaltyCard.update({
                    where: { id: targetCard.id },
                    data: {
                      points: Math.max(0, targetCard.points - pointsToDeduct),
                      history: JSON.stringify(nextHist)
                    }
                  });

                  console.log(`[Loyalty Webhook] Deducted -${pointsToDeduct} points for reward ${rewardItem.name} on card ${targetCard.id}`);
                }
              }
            }
          } catch (rewardErr: any) {
            console.error("[Loyalty Webhook Reward Error]:", rewardErr.message);
          }
        } catch (dbErr: any) {
          console.error("[Webhook Database Error] Failed to write order to database:", dbErr.message);
        }

        // Auto-reserve purchased Tombola tickets in database grid
        try {
          const parsedItems = JSON.parse(itemsSummary || "[]");
          const tombolaTicketNumbers: number[] = [];
          for (const item of parsedItems) {
            const nameStr = (item.name || "").toLowerCase();
            // ONLY match if item is explicitly a Tombola ticket or case
            if (nameStr.includes("tombola") || nameStr.includes("ticket") || nameStr.includes("case")) {
              const matches = nameStr.matchAll(/(?:case|ticket|tombola)\s*#?\s*(\d{1,3})/gi);
              for (const match of matches) {
                if (match && match[1]) {
                  const num = parseInt(match[1], 10);
                  if (!isNaN(num) && num > 0 && num <= 200) tombolaTicketNumbers.push(num);
                }
              }
            }
          }
          if (tombolaTicketNumbers.length > 0) {
            let activeTombola = await prisma.tombola.findFirst({ orderBy: { createdAt: "desc" } });
            if (!activeTombola) {
              activeTombola = await prisma.tombola.create({
                data: {
                  title: "Mega Pack Fidget & Impression 3D Spoolio",
                  description: "Tente ta chance de remporter un lot exclusif !",
                  image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
                  estimatedValue: 85.00,
                  endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                  totalCases: 40,
                  ticketPrice: 2.00,
                  status: "active",
                  reservedTickets: JSON.stringify([]),
                },
              });
            }
            if (activeTombola) {
              let currentReserved: number[] = [];
              try {
                currentReserved = typeof activeTombola.reservedTickets === "string"
                  ? JSON.parse(activeTombola.reservedTickets)
                  : (Array.isArray(activeTombola.reservedTickets) ? (activeTombola.reservedTickets as any) : []);
              } catch (e) {}
              const updatedReserved = Array.from(new Set([...currentReserved, ...tombolaTicketNumbers])).sort((a, b) => a - b);
              await prisma.tombola.update({
                where: { id: activeTombola.id },
                data: { reservedTickets: JSON.stringify(updatedReserved) }
              });
              console.log(`[Stripe Webhook] Tombola tickets reserved automatically:`, tombolaTicketNumbers);
            }
          }
        } catch (tombolaErr: any) {
          console.error("[Tombola Webhook Sync Error]:", tombolaErr.message);
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
          
          // 1. Client confirmation
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

          // 2. Admin notification alert
          await sendAdminOrderNotificationEmail({
            orderId: orderId,
            customerName: customerName,
            customerEmail: email,
            items: parsedItems,
            total: total,
            shippingMethod: shippingMethod
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
