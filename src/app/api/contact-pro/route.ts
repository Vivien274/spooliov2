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

    // Print to server console for admin review (or could save in MySQL/send mail)
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

    // Simulate sending time lag
    await new Promise(resolve => setTimeout(resolve, 800));

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
