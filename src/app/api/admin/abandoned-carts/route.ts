import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim().replace(/[\s\r\n↵\u2195]/g, "");
    if (!stripeKey) {
      return NextResponse.json({ error: "Clé API Stripe manquante." }, { status: 500 });
    }

    // Fetch checkout sessions from Stripe
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions?limit=50", {
      headers: { Authorization: `Bearer ${stripeKey}` }
    });

    if (!stripeRes.ok) {
      const err = await stripeRes.json();
      return NextResponse.json({ error: err.error?.message || "Erreur Stripe" }, { status: 500 });
    }

    const data = await stripeRes.json();
    const sessions = data.data || [];

    // Filter to get only:
    // 1. Open checkout sessions (not paid, not expired)
    // 2. Having customer email (customer completed the email input field)
    // 3. Created more than 30 minutes ago (to avoid intercepting active payments)
    const nowSec = Math.floor(Date.now() / 1000);
    const thirtyMinSec = 30 * 60;

    const openSessions = sessions.filter((s: any) => {
      const email = s.customer_details?.email || s.customer_email;
      const isExpired = s.status === "expired";
      const isOpen = s.status === "open";
      const isRecent = (nowSec - s.created) < thirtyMinSec;
      return isOpen && email && !isExpired && !isRecent;
    });

    if (openSessions.length === 0) {
      return NextResponse.json({ success: true, carts: [] });
    }

    // Fetch line items for each open session in parallel to display cart contents
    const cartsWithItems = await Promise.all(
      openSessions.map(async (session: any) => {
        const email = session.customer_details?.email || session.customer_email;
        const customerName = session.customer_details?.name || "";
        
        // Fetch line items for this session
        let items = [];
        try {
          const itemsRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items`, {
            headers: { Authorization: `Bearer ${stripeKey}` }
          });
          if (itemsRes.ok) {
            const itemsData = await itemsRes.json();
            items = (itemsData.data || []).map((li: any) => ({
              name: li.description,
              quantity: li.quantity,
              price: (li.amount_total / 100).toFixed(2)
            }));
          }
        } catch (e) {
          console.error(`Failed to fetch line items for Stripe session ${session.id}:`, e);
        }

        // Check if the customer has made a successful purchase later (database search by email)
        let hasPaidLater = false;
        try {
          const orderCount = await prisma.order.count({
            where: {
              email: email,
              createdAt: {
                gte: new Date(session.created * 1000)
              }
            }
          });
          hasPaidLater = orderCount > 0;
        } catch (dbErr) {
          console.error("Failed to check database for post-session successful purchase:", dbErr);
        }

        return {
          id: session.id,
          email,
          customerName,
          total: session.amount_total ? session.amount_total / 100 : 0,
          url: session.url,
          created: new Date(session.created * 1000).toISOString(),
          items,
          hasPaidLater
        };
      })
    );

    // Filter out carts where the customer completed a purchase later
    const filteredCarts = cartsWithItems.filter(c => !c.hasPaidLater);

    return NextResponse.json({ success: true, carts: filteredCarts });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur de traitement." }, { status: 500 });
  }
}
