import { NextResponse } from "next/server";
import { sendAbandonedCartEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim().replace(/[\s\r\n↵\u2195]/g, "");
    if (!stripeKey) {
      return NextResponse.json({ error: "Clé API Stripe manquante." }, { status: 500 });
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Identifiant de session manquant." }, { status: 400 });
    }

    // Retrieve checkout session from Stripe
    const sessionRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${stripeKey}` }
    });

    if (!sessionRes.ok) {
      const err = await sessionRes.json();
      return NextResponse.json({ error: err.error?.message || "Session Stripe introuvable." }, { status: 404 });
    }

    const session = await sessionRes.json();
    const email = session.customer_details?.email || session.customer_email;

    if (!email) {
      return NextResponse.json({ error: "Adresse email client introuvable dans cette session." }, { status: 400 });
    }

    // Retrieve line items
    let items = [];
    try {
      const itemsRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}/line_items`, {
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
      console.error("Failed to retrieve items for recovery email:", e);
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "Le panier est vide ou impossible à récupérer." }, { status: 400 });
    }

    // Send abandoned cart recovery email
    const success = await sendAbandonedCartEmail({
      customerEmail: email,
      customerName: session.customer_details?.name || "",
      items,
      checkoutUrl: session.url
    });

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "L'envoi de l'email via Resend a échoué." }, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur lors de la relance." }, { status: 500 });
  }
}
