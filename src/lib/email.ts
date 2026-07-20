import { NextResponse } from "next/server";

interface OrderEmailParams {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: string }[];
  total: number;
  shippingCost: number;
  shippingMethod: string;
  relayDetails?: { name: string; address: string } | null;
}

export async function sendOrderConfirmationEmail({
  orderId,
  customerName,
  customerEmail,
  items,
  total,
  shippingCost,
  shippingMethod,
  relayDetails
}: OrderEmailParams) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("[Email Notification] Resend API Key is missing in environment variables. Email send skipped.");
      return false;
    }

    // Determine sender address: default to onboarding domain if domain is not verified yet
    // Once domain is verified on Resend, user can use 'commandes@spoolio.fr'
    const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    
    // In Resend sandbox mode (using onboarding@resend.dev), you can only send emails to the account owner
    // We let the developer force a recipient for testing in preview/dev env
    const recipient = process.env.RESEND_TO_EMAIL || customerEmail;

    const itemsRowsHtml = items
      .map(
        (item) => `
      <tr style="border-b: 1px solid #1f1f23;">
        <td style="padding: 12px 0; color: #ffffff; font-size: 14px; text-align: left;">
          <strong>${item.name}</strong> <span style="color: #88888b; font-size: 12px;">x${item.quantity}</span>
        </td>
        <td style="padding: 12px 0; text-align: right; color: #ffffff; font-weight: bold; font-size: 14px;">
          ${(parseFloat(item.price) * item.quantity).toFixed(2)}€
        </td>
      </tr>`
      )
      .join("");

    const shippingLabel = 
      shippingMethod === "pickup" 
        ? "Retrait à l'Atelier (Comines)" 
        : (shippingMethod === "relay" ? "Livraison Point Relais (Mondial Relay)" : "Livraison Colissimo Domicile");

    const relayInfoHtml = 
      shippingMethod === "relay" && relayDetails 
        ? `<div style="background-color: #131316; border: 1px solid #1f1f23; border-radius: 12px; padding: 15px; margin-top: 15px; text-align: left;">
             <strong style="color: #ff4f00; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 5px;">Point Relais sélectionné</strong>
             <span style="color: #ffffff; font-size: 13px; font-weight: bold; display: block;">${relayDetails.name}</span>
             <span style="color: #88888b; font-size: 12px; display: block; margin-top: 2px;">${relayDetails.address}</span>
           </div>`
        : "";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de commande Spoolio</title>
      </head>
      <body style="background-color: #0a0a0f; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0d0d12; border: 1px solid #1f1f23; border-radius: 24px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center;">
          
          <!-- Logo Row -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background-color: #ff4f00; color: #ffffff; font-weight: 900; font-size: 20px; width: 40px; height: 40px; line-height: 40px; border-radius: 10px; text-align: center; margin-right: 8px; vertical-align: middle;">S</div>
            <span style="font-size: 22px; font-weight: bold; color: #ffffff; vertical-align: middle; letter-spacing: -0.02em;">Spoolio</span>
          </div>

          <!-- Title -->
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 900; margin-top: 0; margin-bottom: 10px; text-align: center;">Merci pour votre commande, ${customerName} !</h2>
          <p style="color: #88888b; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
            Votre commande <strong>${orderId}</strong> a bien été enregistrée et payée. Nos imprimantes 3D (Berthe, Philomène, Ursule, Godelaine et Claudine) se préparent déjà à fabriquer vos objets couche par couche.
          </p>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-b: 1px solid #1f1f23;">
                <th style="text-align: left; padding-bottom: 10px; color: #52525b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Objet</th>
                <th style="text-align: right; padding-bottom: 10px; color: #52525b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <!-- Pricing summary -->
          <div style="border-top: 1px solid #1f1f23; padding-top: 15px; margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #88888b; margin-bottom: 6px;">
              <span>Mode de livraison : ${shippingLabel}</span>
              <span style="font-weight: bold; color: #ffffff;">${shippingCost === 0 ? "Gratuit" : (shippingCost.toFixed(2) + "€")}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #ffffff; margin-top: 12px; border-top: 1px dashed #1f1f23; padding-top: 12px;">
              <span>Total payé</span>
              <span style="color: #f7eb12; font-size: 18px;">${total.toFixed(2)}€</span>
            </div>
          </div>

          <!-- Relais parcel details -->
          ${relayInfoHtml}

          <!-- Footer banner -->
          <div style="margin-top: 40px; border-top: 1px solid #1f1f23; padding-top: 20px; text-align: center; font-size: 11px; color: #52525b;">
            <p>Spoolio - Objets éco-responsables imprimés en 3D à Comines, France.</p>
            <p>Des questions sur votre commande ? Contactez-nous à hello@spoolio.fr</p>
          </div>

        </div>
      </body>
      </html>
    `;

    console.log(`[Resend Email] Sending email from ${fromAddress} to ${recipient} for Order ${orderId}...`);
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromAddress,
        to: recipient,
        subject: `Commande validée ! Spoolio [${orderId}]`,
        html: emailHtml
      })
    });

    const emailData = await emailRes.json();
    if (emailRes.ok) {
      console.log(`[Resend Email Success] Confirmation email sent for order ${orderId} (ID: ${emailData.id})`);
      return true;
    } else {
      console.error("[Resend Email Error] API error details:", emailData);
      return false;
    }
  } catch (err: any) {
    console.error("[Resend Email Error] Failed to send email via Resend:", err.message || err);
    return false;
  }
}
