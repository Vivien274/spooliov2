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

    // Call real Stripe REST API via native fetch (no stripe npm dependency required)
    const stripeBody = new URLSearchParams();
    stripeBody.append("mode", "payment");
    stripeBody.append("customer_email", buyerEmail);
    stripeBody.append("success_url", `${origin}/carte-cadeau?success=true&code=${pendingCard.code}&amount=${parsedAmount}`);
    stripeBody.append("cancel_url", `${origin}/carte-cadeau?cancelled=true`);

    stripeBody.append("line_items[0][price_data][currency]", "eur");
    stripeBody.append("line_items[0][price_data][product_data][name]", `Carte Cadeau Spoolio 3D - ${parsedAmount.toFixed(2)}€`);
    stripeBody.append(
      "line_items[0][price_data][product_data][description]",
      recipientName
        ? `Offerte à ${recipientName} de la part de ${buyerName || buyerEmail}`
        : `Carte Cadeau Spoolio 3D de ${parsedAmount.toFixed(2)}€`
    );
    stripeBody.append("line_items[0][price_data][unit_amount]", String(Math.round(parsedAmount * 100)));
    stripeBody.append("line_items[0][quantity]", "1");

    stripeBody.append("metadata[type]", "gift_card");
    stripeBody.append("metadata[giftCardId]", pendingCard.id);
    stripeBody.append("metadata[giftCardCode]", pendingCard.code);
    stripeBody.append("metadata[buyerEmail]", buyerEmail);

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: stripeBody.toString(),
    });

    if (!stripeRes.ok) {
      const errorText = await stripeRes.text();
      console.error("[Stripe Error] Gift card checkout session creation failed:", errorText);
      return NextResponse.json({ error: "Erreur lors de la création de la session Stripe." }, { status: 500 });
    }

    const sessionData = await stripeRes.json();
    return NextResponse.json({ url: sessionData.url, session_id: sessionData.id });
  } catch (error: any) {
    console.error("Gift card purchase error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
