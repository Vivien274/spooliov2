import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, company, email, phone, clientType, projectDesc, quantity } = await request.json();

    if (!name || !email || !projectDesc) {
      return NextResponse.json(
        { error: "Veuillez remplir les champs obligatoires (Nom, E-mail et Description)." },
        { status: 400 }
      );
    }

    console.log("=========================================");
    console.log("[NOUVELLE DEMANDE PRO SPOOLIO V2]");
    console.log(`Nom: ${name}`);
    console.log(`Entreprise: ${company || "—"}`);
    console.log(`E-mail: ${email}`);
    console.log(`Téléphone: ${phone || "—"}`);
    console.log(`Type de Client: ${clientType || "—"}`);
    console.log(`Quantité estimée: ${quantity || "—"}`);
    console.log(`Projet:\n${projectDesc}`);
    console.log("=========================================");

    const apiKey = process.env.RESEND_API_KEY;
    const emailTo = process.env.RESEND_TO_EMAIL || process.env.CONTACT_EMAIL_TO || "contact@spoolio.fr";
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
          from: `Spoolio Pro <${emailFrom}>`,
          to: emailTo,
          reply_to: email,
          subject: `[Spoolio Pro] Demande projet de ${name} (${company || "Indépendant"})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #005cff; border-bottom: 2px solid #005cff; padding-bottom: 10px; margin-top: 0;">Nouvelle Demande Projet Pro 💼</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; width: 150px;">Nom :</td>
                  <td style="padding: 6px 0;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Entreprise :</td>
                  <td style="padding: 6px 0;">${company || "—"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">E-mail :</td>
                  <td style="padding: 6px 0;"><a href="mailto:${email}">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Téléphone :</td>
                  <td style="padding: 6px 0;">${phone || "—"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Type de Client :</td>
                  <td style="padding: 6px 0;">${clientType || "—"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Quantité estimée :</td>
                  <td style="padding: 6px 0;">${quantity || "—"}</td>
                </tr>
              </table>
              
              <p><strong>Description du Projet :</strong></p>
              <div style="background-color: #f9f9fb; padding: 15px; border-radius: 8px; border-left: 4px solid #005cff;">
                <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${projectDesc}</p>
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
      message: "Votre demande de projet pro a bien été envoyée. L'équipe de l'atelier Spoolio vous recontactera sous 24-48h."
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de l'envoi de la demande." },
      { status: 500 }
    );
  }
}
