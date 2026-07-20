import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Veuillez remplir les champs obligatoires (Nom, E-mail et Message)." },
        { status: 400 }
      );
    }

    console.log("=========================================");
    console.log("[NOUVEAU MESSAGE CONTACT CLIENT SPOOLIO]");
    console.log(`Nom: ${name}`);
    console.log(`E-mail: ${email}`);
    console.log(`Sujet: ${subject || "Général"}`);
    console.log(`Message:\n${message}`);
    console.log("=========================================");

    const apiKey = process.env.RESEND_API_KEY;
    const emailTo = process.env.CONTACT_EMAIL_TO || "contact@spoolio.fr";
    const emailFrom = process.env.RESEND_EMAIL_FROM || "onboarding@resend.dev";

    if (apiKey) {
      // Send real email via Resend API
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from: `Spoolio Atelier <${emailFrom}>`,
          to: emailTo,
          reply_to: email,
          subject: `[Spoolio Contact] ${subject || "Nouveau message de " + name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #ff4f00; border-bottom: 2px solid #ff4f00; padding-bottom: 10px; margin-top: 0;">Nouveau Message Client 🛠️</h2>
              <p><strong>Nom :</strong> ${name}</p>
              <p><strong>E-mail :</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Sujet :</strong> ${subject || "Général"}</p>
              <div style="background-color: #f9f9fb; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #ff4f00;">
                <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${message}</p>
              </div>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 10px; color: #888; text-align: center;">Envoyé depuis Spoolio V2 via Resend</p>
            </div>
          `
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Resend API error:", errorData);
        throw new Error(errorData.message || "Erreur de transmission Resend");
      }
    } else {
      console.warn("RESEND_API_KEY non configurée. Message loggé dans la console uniquement.");
    }

    return NextResponse.json({
      success: true,
      message: "Votre message a bien été envoyé. Notre atelier de Comines vous répondra très rapidement (sous 24h ouvrées)."
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de l'envoi du message." },
      { status: 500 }
    );
  }
}
