import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendAbandonedCartEmail } from "@/lib/email";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Authorization check for security
    const authHeader = request.headers.get("authorization");
    const isVercelCron = request.headers.get("x-vercel-cron") === "true";
    const cronSecret = process.env.CRON_SECRET;
    const isDev = process.env.NODE_ENV === "development";

    // Only allow if authorized via Vercel Cron headers, Bearer secret, or in local development
    const isAuthorized = 
      isDev || 
      isVercelCron || 
      (cronSecret && authHeader === `Bearer ${cronSecret}`);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim().replace(/[\s\r\n↵\u2195]/g, "");
    if (!stripeKey) {
      return NextResponse.json({ error: "Clé API Stripe manquante." }, { status: 500 });
    }

    // 2. Fetch recent checkout sessions from Stripe
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions?limit=100", {
      headers: { Authorization: `Bearer ${stripeKey}` }
    });

    if (!stripeRes.ok) {
      const err = await stripeRes.json();
      return NextResponse.json({ error: err.error?.message || "Erreur Stripe lors du scan" }, { status: 500 });
    }

    const data = await stripeRes.json();
    const sessions = data.data || [];

    const nowSec = Math.floor(Date.now() / 1000);
    const twoHoursSec = 2 * 60 * 60;
    const thirtyHoursSec = 30 * 60 * 60; // 30h window to cover 24h daily cron interval safely

    // 3. Filter sessions: open, with email, created between 2h and 30h ago, and not yet recovered
    const abandonedSessions = sessions.filter((s: any) => {
      const email = s.customer_details?.email || s.customer_email;
      const isExpired = s.status === "expired";
      const isOpen = s.status === "open";
      
      const elapsed = nowSec - s.created;
      const isWithinWindow = elapsed >= twoHoursSec && elapsed <= thirtyHoursSec;
      const isAlreadyRecovered = s.metadata?.recovery_email_sent === "true";

      return isOpen && email && !isExpired && isWithinWindow && !isAlreadyRecovered;
    });

    if (abandonedSessions.length === 0) {
      return NextResponse.json({ success: true, message: "Aucun panier abandonné à relancer dans cette fenêtre.", count: 0 });
    }

    const sentEmails: string[] = [];

    // 4. Process each abandoned session sequentially to avoid rate-limits
    for (const session of abandonedSessions) {
      const email = session.customer_details?.email || session.customer_email;
      const customerName = session.customer_details?.name || "";

      // A. Verify in Database that the user did not place an order AFTER this session creation
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
        console.error("Database check failed for recovery:", dbErr);
      }

      if (hasPaidLater) {
        // Mark session as recovered anyway to avoid checking it again
        try {
          await fetch(`https://api.stripe.com/v1/checkout/sessions/${session.id}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${stripeKey}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "metadata[recovery_email_sent]=true"
          });
        } catch (e) {
          console.error("Failed to update metadata for converted cart:", e);
        }
        continue;
      }

      // B. Fetch line items for the session
      let items = [];
      try {
        const itemsRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items`, {
          headers: { Authorization: `Bearer ${stripeKey}` }
        });
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          items = (itemsData.data || []).map((li: any) => ({
            name: li.description,
            quantity: li.quantity
          }));
        }
      } catch (e) {
        console.error(`Failed to fetch line items for recovery email: ${session.id}`, e);
      }

      if (items.length === 0) {
        continue; // Skip if cart items cannot be verified
      }

      // C. Send abandoned cart email via Resend
      try {
        const success = await sendAbandonedCartEmail({
          customerEmail: email,
          customerName: customerName,
          items,
          checkoutUrl: session.url
        });

        if (success) {
          // D. Update Stripe Checkout Session metadata to prevent duplicates
          const updateRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session.id}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${stripeKey}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "metadata[recovery_email_sent]=true"
          });

          if (updateRes.ok) {
            sentEmails.push(email);
            console.log(`[Auto Recovery] Successfully sent recovery email to ${email}`);
          } else {
            console.error(`[Auto Recovery] Email sent to ${email} but failed to mark session metadata.`);
          }
        }
      } catch (mailErr) {
        console.error(`[Auto Recovery] Email sending failed for ${email}:`, mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Tâche de relance terminée. ${sentEmails.length} e-mail(s) envoyé(s).`,
      sentTo: sentEmails
    });
  } catch (e: any) {
    console.error("Error during automated recovery task:", e);
    return NextResponse.json({ error: e.message || "Erreur lors du traitement." }, { status: 500 });
  }
}
