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

    // Print to server console for admin review (or could save in MySQL/send mail)
    console.log("=========================================");
    console.log("[NOUVEAU MESSAGE CONTACT CLIENT SPOOLIO]");
    console.log(`Nom: ${name}`);
    console.log(`E-mail: ${email}`);
    console.log(`Sujet: ${subject || "Général"}`);
    console.log(`Message:\n${message}`);
    console.log("=========================================");

    // Simulate sending time lag
    await new Promise(resolve => setTimeout(resolve, 800));

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
