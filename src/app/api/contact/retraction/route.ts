import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, orderId, message } = await request.json();

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Veuillez remplir les champs obligatoires (Prénom, Nom, E-mail)." },
        { status: 400 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("[Email Warning] Resend key missing. Retraction form submitted successfully without email dispatch.");
      return NextResponse.json({ success: true });
    }

    const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const adminRecipient = "contact@spoolio.fr";
    const customerRecipient = process.env.RESEND_TO_EMAIL || email;

    // Email to customer confirming receipt
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="background-color: #0a0a0f; color: #ffffff; font-family: sans-serif; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0d0d12; border: 1px solid #1f1f23; border-radius: 24px; padding: 40px; text-align: center;">
          <h2 style="color: #ffffff;">Accusé de réception - Demande de rétractation Spoolio</h2>
          <p style="color: #88888b; font-size: 14px; line-height: 1.6; text-align: left;">
            Bonjour ${firstName} ${lastName},<br/><br/>
            Nous accusons réception de votre demande de rétractation pour la commande <strong>${orderId || "Non spécifié"}</strong>.<br/>
            Vous disposez d'un délai de 14 jours pour nous retourner les articles concernés dans leur emballage d'origine.<br/><br/>
            <strong>Détails du message :</strong><br/>
            ${message || "Aucun message complémentaire."}
          </p>
          <p style="color: #88888b; font-size: 12px; margin-top: 30px;">
            Des questions ? Contactez-nous directement à contact@spoolio.fr.
          </p>
        </div>
      </body>
      </html>
    `;

    // Email to admin notifying them of the retraction request
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="background-color: #0a0a0f; color: #ffffff; font-family: sans-serif; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0d0d12; border: 1px solid #1f1f23; border-radius: 24px; padding: 40px; text-align: left;">
          <h2 style="color: #ffffff;">Nouvelle demande de rétractation en ligne</h2>
          <p style="color: #ffffff; font-size: 14px;">
            <strong>Client :</strong> ${firstName} ${lastName} (${email})<br/>
            <strong>Numéro de commande :</strong> ${orderId || "Non spécifié"}<br/><br/>
            <strong>Message / Détails :</strong><br/>
            ${message || "Aucun message complémentaire."}
          </p>
        </div>
      </body>
      </html>
    `;

    // Dispatch customer receipt email
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromAddress,
        to: customerRecipient,
        subject: `Accusé de réception - Demande de rétractation Spoolio`,
        html: customerEmailHtml
      })
    });

    // Dispatch admin notification email (only if using sandbox to avoid validation failure or using custom verified domains)
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromAddress,
          to: fromAddress === "onboarding@resend.dev" ? customerRecipient : adminRecipient,
          subject: `Alerte Admin : Demande de rétractation en ligne [${orderId || "Spoolio"}]`,
          html: adminEmailHtml
        })
      });
    } catch (e) {
      console.error("Failed to notify Spoolio admin via email:", e);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Une erreur est survenue." },
      { status: 500 }
    );
  }
}
