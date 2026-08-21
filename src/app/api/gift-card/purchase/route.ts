import { NextResponse } from "next/server";
import { createGiftCardRecord } from "@/app/actions/giftCardActions";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, buyerName, buyerEmail, recipientName, recipientEmail, customMessage } = body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 5 || parsedAmount > 500) {
      return NextResponse.json(
        { error: "Le montant doit être compris entre 5€ et 500€." },
        { status: 400 }
      );
    }

    if (!buyerEmail || !buyerEmail.includes("@")) {
      return NextResponse.json(
        { error: "Veuillez renseigner une adresse email valide." },
        { status: 400 }
      );
    }

    let stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      stripeKey = stripeKey.trim().replace(/[\s\r\n↵\u2195]/g, "");
    }

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const origin = `${protocol}://${host}`;

    // Dev Simulation mode if Stripe key is not configured
    if (!stripeKey) {
      console.log("[Dev Mode] Stripe key absent, simulating Gift Card purchase...");
      const giftCard = await createGiftCardRecord(
        {
          amount: parsedAmount,
          buyerName,
          buyerEmail,
          recipientName,
          recipientEmail,
          customMessage,
        },
        true, // Paid in dev simulation
        `sim_gift_${Date.now()}`
      );

      return NextResponse.json({
        simulated: true,
        code: giftCard.code,
        amount: giftCard.initialAmount,
        url: `${origin}/carte-cadeau?success=true&code=${giftCard.code}&amount=${giftCard.initialAmount}`,
      });
    }

    // Stripe Live / Test Mode
    const Stripe = require("stripe");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Pending gift card record created in DB
    const pendingCard = await createGiftCardRecord(
      {
        amount: parsedAmount,
        buyerName,
        buyerEmail,
        recipientName,
        recipientEmail,
        customMessage,
      },
      false, // Unpaid until Stripe webhook
      undefined
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: buyerEmail,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Carte Cadeau Spoolio 3D - ${parsedAmount.toFixed(2)}€`,
              description: recipientName
                ? `Offerte à ${recipientName} de la part de ${buyerName || buyerEmail}`
                : `Carte Cadeau Spoolio 3D de ${parsedAmount.toFixed(2)}€`,
              images: [`${origin}/images/hero_background.jpg`],
            },
            unit_amount: Math.round(parsedAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        type: "gift_card",
        giftCardId: pendingCard.id,
        giftCardCode: pendingCard.code,
        buyerEmail,
        recipientEmail: recipientEmail || "",
      },
      success_url: `${origin}/carte-cadeau?success=true&code=${pendingCard.code}&amount=${parsedAmount}`,
      cancel_url: `${origin}/carte-cadeau?cancelled=true`,
    });

    return NextResponse.json({ url: session.url, session_id: session.id });
  } catch (error: any) {
    console.error("Gift card purchase error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
