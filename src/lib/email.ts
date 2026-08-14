import { NextResponse } from "next/server";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://spoolio.fr').replace(/\/$/, "");
const logoUrl = `${appUrl}/images/logo.png`;

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

    // Determine sender address: look for RESEND_EMAIL_FROM first
    const fromAddress = process.env.RESEND_EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    
    // Recipient address: use actual customerEmail in priority
    const recipient = customerEmail || process.env.RESEND_TO_EMAIL;

    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://v2.spoolio.fr'}/suivi?id=${orderId}&email=${encodeURIComponent(customerEmail)}`;

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
            <img src="${logoUrl}" alt="Spoolio" style="height: 40px; width: auto; display: inline-block;" />
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
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #88888b; margin-bottom: 6px;">
              <tr>
                <td style="text-align: left; padding: 4px 0;">Mode de livraison : ${shippingLabel}</td>
                <td style="text-align: right; padding: 4px 0; font-weight: bold; color: #ffffff;">${shippingCost === 0 ? "Gratuit" : (shippingCost.toFixed(2) + "€")}</td>
              </tr>
            </table>
            <table style="width: 100%; border-collapse: collapse; font-size: 16px; font-weight: bold; color: #ffffff; margin-top: 12px; border-top: 1px dashed #1f1f23; padding-top: 12px;">
              <tr>
                <td style="text-align: left; padding: 8px 0;">Total payé</td>
                <td style="text-align: right; padding: 8px 0; color: #f7eb12; font-size: 18px;">${total.toFixed(2)}€</td>
              </tr>
            </table>
          </div>

          <!-- Relais parcel details -->
          ${relayInfoHtml}

          <!-- Interactive 3D Tracking Callout Banner -->
          <div style="background-color: #131316; border: 1.5px solid #ff4f00; border-radius: 18px; padding: 22px 20px; margin-top: 25px; margin-bottom: 25px; text-align: center;">
            <span style="color: #ff4f00; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 8px;">🤖 Suivi de Fabrication 3D en Temps Réel</span>
            <p style="color: #e4e4e7; font-size: 13px; font-weight: 500; margin: 0 0 16px 0; line-height: 1.5;">
              Suivez l'avancement de votre commande et découvrez quelle imprimante 3D (Berthe, Ursule, Philomène...) fabrique vos objets en temps réel ! 🖨️✨
            </p>
            <a href="${trackingUrl}" style="display: inline-block; background-color: #ff4f00; color: #ffffff; font-weight: 900; text-decoration: none; font-size: 13px; padding: 14px 30px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 20px rgba(255, 79, 0, 0.4);">
              🔍 Suivre l'Impression 3D en Direct ↗
            </a>
          </div>

          <!-- Footer banner -->
          <div style="margin-top: 40px; border-top: 1px solid #1f1f23; padding-top: 20px; text-align: center; font-size: 11px; color: #52525b;">
            <p>Spoolio - Objets éco-responsables imprimés en 3D à Comines, France.</p>
             <p>Des questions sur votre commande ? Contactez-nous à contact@spoolio.fr</p>
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

interface ShippedEmailParams {
  orderId: string;
  customerName: string;
  customerEmail: string;
  shippingMethod: string;
  relayDetails?: { name: string; address: string } | null;
  trackingNumber?: string | null;
}

export async function sendOrderShippedEmail({
  orderId,
  customerName,
  customerEmail,
  shippingMethod,
  relayDetails,
  trackingNumber
}: ShippedEmailParams) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("[Email Notification] Resend API Key is missing in environment variables. Email send skipped.");
      return false;
    }

    const fromAddress = process.env.RESEND_EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const recipient = process.env.RESEND_TO_EMAIL || customerEmail;

    const shippingLabel = 
      shippingMethod === "pickup" 
        ? "Retrait à l'Atelier (Comines)" 
        : (shippingMethod === "relay" ? "Livraison Point Relais (Mondial Relay)" : "Livraison Colissimo Domicile");

    const relayInfoHtml = 
      shippingMethod === "relay" && relayDetails 
        ? `<div style="background-color: #131316; border: 1px solid #1f1f23; border-radius: 12px; padding: 15px; margin-top: 15px; text-align: left;">
             <strong style="color: #ff4f00; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 5px;">Point Relais de destination</strong>
             <span style="color: #ffffff; font-size: 13px; font-weight: bold; display: block;">${relayDetails.name}</span>
             <span style="color: #88888b; font-size: 12px; display: block; margin-top: 2px;">${relayDetails.address}</span>
           </div>`
        : "";

    let carrierTrackingUrl = "";
    if (trackingNumber) {
      if (shippingMethod === "relay") {
        carrierTrackingUrl = `https://www.mondialrelay.fr/suivi-de-colis?numeroColis=${trackingNumber}`;
      } else if (shippingMethod === "home") {
        carrierTrackingUrl = `https://www.laposte.fr/outils/suivre-un-envoi?code=${trackingNumber}`;
      }
    }

    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://spoolio.fr'}/suivi?id=${orderId}&email=${encodeURIComponent(customerEmail)}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Votre commande Spoolio est en route ! 🚚</title>
      </head>
      <body style="background-color: #0a0a0f; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0d0d12; border: 1px solid #1f1f23; border-radius: 24px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center;">
          
          <!-- Logo Row -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${logoUrl}" alt="Spoolio" style="height: 40px; width: auto; display: inline-block;" />
          </div>

          <!-- Title -->
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 900; margin-top: 0; margin-bottom: 10px; text-align: center;">Bonne nouvelle, ${customerName} ! 🎉</h2>
          <p style="color: #88888b; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
            Votre commande <strong>${orderId}</strong> a quitté notre atelier de Comines. Nos imprimantes 3D ont fait un super travail et vos objets sont emballés avec soin.
          </p>

          <!-- Shipping Summary -->
          <div style="background-color: #131316; border: 1px solid #1f1f23; border-radius: 16px; padding: 20px; text-align: left; margin-bottom: 30px;">
            <span style="display: block; font-size: 11px; font-weight: bold; color: #52525b; text-transform: uppercase; tracking-wider: 0.05em; margin-bottom: 10px;">Détails de l'expédition</span>
            <div style="font-size: 14px; color: #ffffff; margin-bottom: 6px;">
              <strong>Mode d'envoi :</strong> ${shippingLabel}
            </div>
            ${trackingNumber ? `
            <div style="font-size: 14px; color: #ffffff; margin-bottom: 6px; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #1f1f23;">
              <strong>Numéro de suivi :</strong> <span style="font-family: monospace; font-weight: bold; color: #ff4f00; background-color: #1a1a24; padding: 2px 6px; border-radius: 4px;">${trackingNumber}</span>
            </div>
            ` : ""}
            ${relayInfoHtml}
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin-bottom: 40px;">
            <a href="${trackingUrl}" style="display: inline-block; background-color: #ff4f00; color: #ffffff; font-weight: bold; text-decoration: none; font-size: 13px; padding: 14px 28px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 15px rgba(255, 79, 0, 0.3); margin-bottom: 15px;">
              Suivre sur Spoolio 📦
            </a>
            ${carrierTrackingUrl ? `
            <br/>
            <a href="${carrierTrackingUrl}" target="_blank" style="display: inline-block; background-color: #1e1e24; color: #ffffff; font-weight: bold; text-decoration: none; font-size: 12px; padding: 10px 20px; border-radius: 50px; border: 1px solid #2f2f37; text-transform: uppercase; letter-spacing: 0.05em;">
              Lien direct transporteur 🚚
            </a>
            ` : ""}
          </div>

          <!-- Footer banner -->
          <div style="margin-top: 40px; border-top: 1px solid #1f1f23; padding-top: 20px; text-align: center; font-size: 11px; color: #52525b;">
            <p>Spoolio - Objets éco-responsables imprimés en 3D à Comines, France.</p>
             <p>Des questions sur votre commande ? Contactez-nous à contact@spoolio.fr</p>
          </div>

        </div>
      </body>
      </html>
    `;

    console.log(`[Resend Email] Sending Shipped email from ${fromAddress} to ${recipient} for Order ${orderId}...`);
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromAddress,
        to: recipient,
        subject: `Commande expédiée ! Spoolio [${orderId}] 🚚`,
        html: emailHtml
      })
    });

    const emailData = await emailRes.json();
    if (emailRes.ok) {
      console.log(`[Resend Email Success] Shipped email sent for order ${orderId} (ID: ${emailData.id})`);
      return true;
    } else {
      console.error("[Resend Email Error] Shipped API error details:", emailData);
      return false;
    }
  } catch (err: any) {
    console.error("[Resend Email Error] Failed to send shipped email via Resend:", err.message || err);
    return false;
  }
}

interface PickupSlotEmailParams {
  orderId: string;
  customerName: string;
  customerEmail: string;
  pickupSlot: string;
}

export async function sendPickupSlotConfirmedEmail({
  orderId,
  customerName,
  customerEmail,
  pickupSlot
}: PickupSlotEmailParams) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return false;

    const fromAddress = process.env.RESEND_EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const recipient = process.env.RESEND_TO_EMAIL || customerEmail;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="background-color: #0a0a0f; color: #ffffff; font-family: sans-serif; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0d0d12; border: 1px solid #1f1f23; border-radius: 24px; padding: 40px; text-align: center;">
          <h2 style="color: #ffffff;">Créneau de retrait confirmé ! 🎉</h2>
          <p style="color: #88888b; font-size: 14px; line-height: 1.6;">
            Bonjour ${customerName},<br/><br/>
            Bonne nouvelle ! Votre créneau de retrait à l'Atelier de Comines pour la commande <strong>${orderId}</strong> a été validé par notre équipe.
          </p>
          <div style="background-color: #131316; border: 1px solid #1f1f23; border-radius: 16px; padding: 20px; text-align: center; margin: 30px 0;">
            <span style="font-size: 11px; text-transform: uppercase; color: #88888b; font-weight: bold;">Date & Heure validées</span>
            <h3 style="color: #ff4f00; font-size: 18px; margin: 10px 0 0 0;">${new Date(pickupSlot).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}</h3>
          </div>
          <p style="color: #88888b; font-size: 12px;">
            Adresse de l'Atelier : Comines, Nord (59560).<br/>
            À bientôt !
          </p>
        </div>
      </body>
      </html>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromAddress,
        to: recipient,
        subject: `Créneau de retrait confirmé ! Spoolio [${orderId}]`,
        html: emailHtml
      })
    });
    return true;
  } catch (e) {
    console.error("Failed to send pickup confirmed email:", e);
    return false;
  }
}

export async function sendPickupSlotProposedEmail({
  orderId,
  customerName,
  customerEmail,
  pickupSlot
}: PickupSlotEmailParams) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return false;

    const fromAddress = process.env.RESEND_EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const recipient = process.env.RESEND_TO_EMAIL || customerEmail;
    
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://spoolio.fr'}/suivi/pickup?id=${orderId}&slot=${encodeURIComponent(pickupSlot)}&email=${encodeURIComponent(customerEmail)}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="background-color: #0a0a0f; color: #ffffff; font-family: sans-serif; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0d0d12; border: 1px solid #1f1f23; border-radius: 24px; padding: 40px; text-align: center;">
          <h2 style="color: #ffffff;">Proposition de nouveau créneau de retrait 📅</h2>
          <p style="color: #88888b; font-size: 14px; line-height: 1.6;">
            Bonjour ${customerName},<br/><br/>
            Le créneau de retrait demandé pour votre commande <strong>${orderId}</strong> n'est pas disponible. Notre équipe vous propose ce créneau alternatif :
          </p>
          <div style="background-color: #131316; border: 1px solid #1f1f23; border-radius: 16px; padding: 20px; text-align: center; margin: 30px 0;">
            <span style="font-size: 11px; text-transform: uppercase; color: #88888b; font-weight: bold;">Nouveau créneau proposé</span>
            <h3 style="color: #ff4f00; font-size: 18px; margin: 10px 0 0 0;">${new Date(pickupSlot).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}</h3>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="display: inline-block; background-color: #ff4f00; color: #ffffff; font-weight: bold; text-decoration: none; font-size: 13px; padding: 14px 28px; border-radius: 50px;">
              Accepter ce nouveau créneau ✓
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromAddress,
        to: recipient,
        subject: `Nouveau créneau de retrait proposé - Spoolio [${orderId}]`,
        html: emailHtml
      })
    });
    return true;
  } catch (e) {
    console.error("Failed to send pickup proposed email:", e);
    return false;
  }
}

interface AdminNotificationEmailParams {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: string }[];
  total: number;
  shippingMethod: string;
}

export async function sendAdminOrderNotificationEmail({
  orderId,
  customerName,
  customerEmail,
  items,
  total,
  shippingMethod
}: AdminNotificationEmailParams) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return false;

    const fromAddress = process.env.RESEND_EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const recipient = process.env.RESEND_TO_EMAIL || process.env.CONTACT_EMAIL_TO || "contact@spoolio.fr";

    const itemsRowsHtml = items
      .map(
        (item) => `
      <tr style="border-b: 1px solid #eee;">
        <td style="padding: 10px 0; text-align: left; font-size: 14px;">
          <strong>${item.name}</strong> <span style="color: #666; font-size: 12px;">x${item.quantity}</span>
        </td>
        <td style="padding: 10px 0; text-align: right; font-weight: bold; font-size: 14px;">
          ${(parseFloat(item.price) * item.quantity).toFixed(2)}€
        </td>
      </tr>`
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="background-color: #f9f9fb; color: #121212; font-family: sans-serif; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eee; border-radius: 20px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #005cff; border-bottom: 2px solid #005cff; padding-bottom: 10px; margin-top: 0;">🎉 Nouvelle Commande Reçue !</h2>
          <p>Une nouvelle commande vient d'être validée et payée sur le site Spoolio V2.</p>
          
          <div style="background-color: #f0f4ff; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px;">
            <strong>Commande ID :</strong> ${orderId}<br/>
            <strong>Client :</strong> ${customerName} (<a href="mailto:${customerEmail}">${customerEmail}</a>)<br/>
            <strong>Mode de livraison :</strong> ${shippingMethod === "pickup" ? "Retrait Atelier" : (shippingMethod === "relay" ? "Mondial Relay" : "Colissimo Domicile")}<br/>
            <strong>Montant total payé :</strong> <span style="font-weight: bold; color: #ff4f00;">${total.toFixed(2)}€</span>
          </div>

          <p><strong>Détail des articles :</strong></p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-b: 1px solid #eee;">
                <th style="text-align: left; padding-bottom: 8px; color: #666; font-size: 12px; text-transform: uppercase;">Article</th>
                <th style="text-align: right; padding-bottom: 8px; color: #666; font-size: 12px; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://v2.spoolio.fr'}/admin" style="display: inline-block; background-color: #005cff; color: #ffffff; font-weight: bold; text-decoration: none; font-size: 13px; padding: 12px 24px; border-radius: 8px;">
              Accéder à l'Espace Admin Spoolio
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: `Spoolio Alertes <${fromAddress}>`,
        to: recipient,
        subject: `🎉 Nouvelle commande ${orderId} - Spoolio [${total.toFixed(2)}€]`,
        html: emailHtml
      })
    });
    return true;
  } catch (e) {
    console.error("Failed to send admin order notification email:", e);
    return false;
  }
}

interface AbandonedCartEmailParams {
  customerEmail: string;
  customerName?: string | null;
  items: { name: string; quantity: number; price?: string }[];
  checkoutUrl: string;
}

export async function sendAbandonedCartEmail({
  customerEmail,
  customerName,
  items,
  checkoutUrl
}: AbandonedCartEmailParams) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("[Email Notification] Resend API Key is missing in environment variables. Email send skipped.");
      return false;
    }

    const fromAddress = process.env.RESEND_EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const recipient = process.env.RESEND_TO_EMAIL || customerEmail;

    const itemsRowsHtml = items
      .map(
        (item) => `
      <tr style="border-bottom: 1px solid #1f1f23;">
        <td style="padding: 12px 0; color: #ffffff; font-size: 14px; text-align: left;">
          <strong>${item.name}</strong> <span style="color: #88888b; font-size: 12px;">x${item.quantity}</span>
        </td>
      </tr>
    `
      )
      .join("");

    const displayName = customerName || "Ami de Spoolio";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Vous avez oublié quelque chose ? 🛒 - Spoolio</title>
      </head>
      <body style="background-color: #0a0a0f; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0d0d12; border: 1px solid #1f1f23; border-radius: 24px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center;">
          
          <!-- Logo Row -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${logoUrl}" alt="Spoolio" style="height: 40px; width: auto; display: inline-block;" />
          </div>

          <!-- Title -->
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 900; margin-top: 0; margin-bottom: 10px; text-align: center;">Vous avez laissé des objets dans votre panier, ${displayName} ! 🛒</h2>
          <p style="color: #88888b; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
            Votre panier a été sauvegardé avec amour. Nos imprimantes 3D (Berthe, Philomène, Ursule, Godelaine et Claudine) trépignent d'impatience à l'idée de fabriquer vos objets éco-responsables !
          </p>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="border-bottom: 1px solid #1f1f23;">
                <th style="text-align: left; padding-bottom: 10px; color: #52525b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Articles dans votre panier</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <!-- Recovery Button -->
          <div style="text-align: center; margin-bottom: 40px;">
            <a href="${checkoutUrl}" style="display: inline-block; background-color: #ff4f00; color: #ffffff; font-weight: bold; text-decoration: none; font-size: 14px; padding: 14px 28px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 15px rgba(255, 79, 0, 0.3);">
              Finaliser ma commande 🛒
            </a>
          </div>

          <!-- Footer banner -->
          <div style="margin-top: 40px; border-top: 1px solid #1f1f23; padding-top: 20px; text-align: center; font-size: 11px; color: #52525b;">
            <p>Spoolio - Objets éco-responsables imprimés en 3D à Comines, France.</p>
            <p>Des questions ou besoin d'aide ? Répondez simplement à cet e-mail ou écrivez-nous à contact@spoolio.fr</p>
          </div>

        </div>
      </body>
      </html>
    `;

    console.log(`[Resend Email] Sending abandoned cart email recovery to ${recipient}...`);
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: `Spoolio <${fromAddress}>`,
        to: recipient,
        subject: "Vous avez oublié quelque chose ? 🛒 - Spoolio",
        html: emailHtml
      })
    });
    return true;
  } catch (e) {
    console.error("Failed to send abandoned cart email:", e);
    return false;
  }
}

interface OrderNoteEmailParams {
  orderId: string;
  customerName: string;
  customerEmail: string;
  note: string;
  items?: { name: string; quantity: number; price?: string | number }[];
}

export async function sendOrderNoteEmail({
  orderId,
  customerName,
  customerEmail,
  note,
  items = []
}: OrderNoteEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("[Email Notification] Resend API Key is missing in environment variables. Email send skipped.");
      return { success: false, error: "Clé API Resend (RESEND_API_KEY) manquante dans les variables d'environnement." };
    }

    const fromAddress = process.env.RESEND_EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const adminEmail = process.env.RESEND_TO_EMAIL || process.env.CONTACT_EMAIL_TO || "contact@spoolio.fr";
    
    // Recipients: client and admin
    let recipients = Array.from(new Set([customerEmail, adminEmail].filter((e): e is string => !!e && e.trim().length > 0)));

    if (process.env.RESEND_TO_EMAIL) {
      recipients = [process.env.RESEND_TO_EMAIL];
    }

    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://spoolio.fr'}/suivi?id=${orderId}&email=${encodeURIComponent(customerEmail)}`;

    // Convert linebreaks in note text to HTML safely
    const formattedNoteHtml = note
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");

    const itemsSummaryHtml = items.length > 0 ? `
      <div style="background-color: #131316; border: 1px solid #1f1f23; border-radius: 16px; padding: 20px; margin-top: 25px; text-align: left;">
        <span style="display: block; font-size: 11px; font-weight: bold; color: #52525b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">Articles de votre commande ${orderId}</span>
        <ul style="margin: 0; padding-left: 20px; color: #88888b; font-size: 13px;">
          ${items.map(item => `<li style="margin-bottom: 4px;"><strong style="color: #ffffff;">${item.name}</strong> <span style="color: #52525b;">(x${item.quantity})</span></li>`).join("")}
        </ul>
      </div>
    ` : "";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Information sur votre commande Spoolio [${orderId}]</title>
      </head>
      <body style="background-color: #0a0a0f; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0d0d12; border: 1px solid #1f1f23; border-radius: 24px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center;">
          
          <!-- Logo Row -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${logoUrl}" alt="Spoolio" style="height: 40px; width: auto; display: inline-block;" />
          </div>

          <!-- Title badge -->
          <div style="display: inline-block; background-color: rgba(255, 79, 0, 0.1); border: 1px solid rgba(255, 79, 0, 0.3); border-radius: 50px; padding: 6px 16px; font-size: 12px; font-weight: bold; color: #ff4f00; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px;">
            Commande ${orderId}
          </div>

          <!-- Greeting -->
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 900; margin-top: 0; margin-bottom: 15px; text-align: center;">Bonjour ${customerName || "Client Spoolio"},</h2>
          <p style="color: #88888b; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 25px;">
            L'équipe Spoolio a ajouté un message concernant votre commande :
          </p>

          <!-- Note Content Box -->
          <div style="background-color: #131316; border: 1px solid #ff4f00; border-radius: 16px; padding: 25px; text-align: left; margin-bottom: 30px; box-shadow: 0 4px 20px rgba(255, 79, 0, 0.08);">
            <div style="font-size: 11px; font-weight: bold; color: #ff4f00; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
              💬 Message de l'équipe Spoolio :
            </div>
            <div style="font-size: 14px; line-height: 1.7; color: #ffffff; font-family: inherit;">
              ${formattedNoteHtml}
            </div>
          </div>

          <!-- Items recap -->
          ${itemsSummaryHtml}

          <!-- Track Button -->
          <div style="text-align: center; margin-top: 35px; margin-bottom: 35px;">
            <a href="${trackingUrl}" style="display: inline-block; background-color: #ff4f00; color: #ffffff; font-weight: bold; text-decoration: none; font-size: 13px; padding: 14px 28px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 15px rgba(255, 79, 0, 0.3);">
              Suivre ma commande 📦
            </a>
          </div>

          <!-- Footer banner -->
          <div style="margin-top: 40px; border-top: 1px solid #1f1f23; padding-top: 20px; text-align: center; font-size: 11px; color: #52525b;">
            <p>Spoolio - Objets éco-responsables imprimés en 3D à Comines, France.</p>
            <p>Des questions ou besoin d'aide ? Répondez simplement à cet e-mail ou écrivez-nous à contact@spoolio.fr</p>
          </div>

        </div>
      </body>
      </html>
    `;

    console.log(`[Resend Email] Sending Order Note email to ${recipients.join(", ")} for Order ${orderId}...`);
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: `Spoolio <${fromAddress}>`,
        to: recipients,
        subject: `Message concernant votre commande Spoolio [${orderId}]`,
        html: emailHtml
      })
    });

    const emailData = await emailRes.json();
    if (emailRes.ok) {
      console.log(`[Resend Email Success] Order Note email sent for order ${orderId} (ID: ${emailData.id})`);
      return { success: true };
    } else {
      console.error("[Resend Email Error] Order Note API error details:", emailData);
      let errorMsg = emailData.message || "Erreur de transmission Resend";
      if (emailRes.status === 403 && fromAddress === "onboarding@resend.dev") {
        errorMsg = `Mode test Resend (onboarding@resend.dev) : Resend autorise uniquement les envois vers le compte propriétaire d'origine. Pour envoyer des e-mails à d'autres clients, configurez votre domaine d'envoi dans le tableau de bord resend.com et ajoutez RESEND_EMAIL_FROM=votre-email@votre-domaine.fr dans .env.local`;
      }
      return { success: false, error: errorMsg };
    }
  } catch (err: any) {
    console.error("[Resend Email Error] Failed to send order note email via Resend:", err.message || err);
    return { success: false, error: err.message || "Erreur inconnue lors de l'envoi." };
  }
}

export interface ReviewRequestEmailParams {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items?: { name: string; quantity: number }[];
  googleReviewUrl?: string;
  siteReviewUrl?: string;
}

export async function sendReviewRequestEmail({
  orderId,
  customerName,
  customerEmail,
  items = [],
  googleReviewUrl = "https://g.page/r/spoolio/review",
  siteReviewUrl = "https://spoolio.fr/avis",
}: ReviewRequestEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("[Email Notification] RESEND_API_KEY is missing. Review request email simulated locally.");
      return { success: true, error: "RESEND_API_KEY missing (simulated locally)" };
    }

    const fromAddress = process.env.RESEND_EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    
    const finalGoogleUrl = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || process.env.GOOGLE_REVIEW_URL || googleReviewUrl;
    const finalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/avis` : siteReviewUrl;

    const itemsListHtml = items && items.length > 0 ? `
      <div style="background-color: #111114; border: 1px solid #222225; border-radius: 14px; padding: 18px; margin-bottom: 25px;">
        <div style="font-size: 11px; font-weight: bold; color: #88888b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
          📦 Articles de votre commande #${orderId} :
        </div>
        ${items.map(i => `
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #e4e4e7; padding: 4px 0; border-bottom: 1px dashed #222225;">
            <span>• ${i.name}</span>
            <span style="font-weight: bold; color: #ff4f00;">x${i.quantity}</span>
          </div>
        `).join("")}
      </div>
    ` : "";

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <title>Votre avis compte pour Spoolio ! ⭐️</title>
      </head>
      <body style="background-color: #09090b; color: #e4e4e7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 10px;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #0e0e12; border: 1px solid #222225; border-radius: 24px; padding: 35px 25px; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
          
          <!-- Logo Header -->
          <div style="text-align: center; margin-bottom: 22px;">
            <span style="font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.03em;">SPOOLIO <span style="color: #ff4f00;">.</span></span>
          </div>

          <!-- Header badge -->
          <div style="text-align: center; margin-bottom: 18px;">
            <span style="display: inline-block; background-color: rgba(255, 79, 0, 0.12); border: 1px solid rgba(255, 79, 0, 0.3); border-radius: 50px; padding: 6px 18px; font-size: 12px; font-weight: 800; color: #ff4f00; text-transform: uppercase; letter-spacing: 0.05em;">
              ⭐ Votre expérience compte
            </span>
          </div>

          <!-- Title -->
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; margin-top: 0; margin-bottom: 12px; text-align: center; font-family: system-ui, sans-serif;">
            Comment s'est passée votre commande ?
          </h1>

          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 25px;">
            Bonjour <strong style="color: #ffffff;">${customerName || "Cher passionné"}</strong>,<br/>
            Voilà quelques jours que votre commande <strong>#${orderId}</strong> a été préparée avec soin dans notre atelier 3D à Comines (59). Nous espérons qu'elle vous apporte entière satisfaction !
          </p>

          ${itemsListHtml}

          <!-- Rating Prompt Card -->
          <div style="background: linear-gradient(135deg, rgba(255, 79, 0, 0.12), rgba(0, 92, 255, 0.12)); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; padding: 25px 20px; text-align: center; margin-bottom: 30px;">
            <div style="font-size: 28px; margin-bottom: 8px;">⭐️⭐️⭐️⭐️⭐️</div>
            <h3 style="color: #ffffff; font-size: 16px; font-weight: 800; margin: 0 0 8px 0;">
              Votre avis aide notre petit atelier indépendant !
            </h3>
            <p style="color: #a1a1aa; font-size: 13px; line-height: 1.5; margin: 0 0 20px 0;">
              1 minute suffit pour partager votre retour d'expérience et soutenir la fabrication locale en France 🇫🇷.
            </p>

            <!-- Dual Action Buttons -->
            <div style="display: flex; flex-direction: column; gap: 12px; align-items: center; justify-content: center;">
              <!-- Google Review Button -->
              <a href="${finalGoogleUrl}" target="_blank" style="display: inline-block; width: 85%; max-width: 320px; background-color: #ff4f00; color: #ffffff; font-weight: 900; text-decoration: none; font-size: 13px; padding: 14px 20px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.04em; text-align: center; box-shadow: 0 6px 20px rgba(255, 79, 0, 0.35);">
                ⭐️ Laisser un avis Google
              </a>

              <!-- Website Review Button -->
              <a href="${finalSiteUrl}" target="_blank" style="display: inline-block; width: 85%; max-width: 320px; background-color: rgba(255, 255, 255, 0.08); color: #ffffff; font-weight: 700; text-decoration: none; font-size: 12px; padding: 12px 20px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.04em; text-align: center; border: 1px solid rgba(255, 255, 255, 0.2); margin-top: 8px;">
                💬 Laisser un avis sur le Site Spoolio
              </a>
            </div>
          </div>

          <!-- Promo Gift Perk -->
          <div style="background-color: #131316; border: 1px dashed rgba(255, 79, 0, 0.4); border-radius: 14px; padding: 14px; text-align: center; margin-bottom: 25px;">
            <span style="font-size: 12px; color: #ff4f00; font-weight: bold;">
              🎁 Un grand MERCI : En laissant votre avis, profitez de <span style="color: #ffffff;">-10%</span> sur votre prochaine commande avec le code <strong style="color: #ff4f00; font-family: monospace;">MERCI10</strong> !
            </span>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #1f1f23; padding-top: 20px; text-align: center; font-size: 11px; color: #52525b; line-height: 1.6;">
            <p style="margin: 0 0 5px 0;">Spoolio • Objets & Fidgets 3D fabriqués à Comines (59), France.</p>
            <p style="margin: 0;">Des questions ? Répondez simplement à cet e-mail ou écrivez-nous à contact@spoolio.fr</p>
          </div>

        </div>
      </body>
      </html>
    `;

    console.log(`[Resend Email] Sending Review Request email to ${customerEmail} for Order ${orderId}...`);
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: `Spoolio <${fromAddress}>`,
        to: [customerEmail],
        subject: `⭐️ Comment s'est passée votre commande Spoolio #${orderId} ?`,
        html: emailHtml
      })
    });

    const emailData = await emailRes.json();
    if (emailRes.ok) {
      console.log(`[Resend Email Success] Review Request email sent for order ${orderId} (ID: ${emailData.id})`);
      return { success: true };
    } else {
      console.error("[Resend Email Error] Review Request API error details:", emailData);
      let errorMsg = emailData.message || "Erreur lors de l'envoi via Resend";
      if (emailRes.status === 403 && fromAddress === "onboarding@resend.dev") {
        errorMsg = `Mode test Resend (onboarding@resend.dev) : Seul l'email du propriétaire du compte peut recevoir les mails en mode test. Pour envoyer des mails aux clients réels, configurez votre domaine dans resend.com et ajoutez RESEND_EMAIL_FROM=votre-email@votre-domaine.fr dans .env.local`;
      }
      return { success: false, error: errorMsg };
    }
  } catch (err: any) {
    console.error("[Resend Email Error] Failed to send review request email:", err.message || err);
    return { success: false, error: err.message || "Erreur inconnue" };
  }
}

export interface LoyaltyEmailParams {
  cardId: string;
  customerName?: string | null;
  customerEmail: string;
  points: number;
  maxPoints?: number;
  isReward?: boolean;
}

export async function sendLoyaltyCardEmail({
  cardId,
  customerName,
  customerEmail,
  points,
  maxPoints = 100,
  isReward = false,
}: LoyaltyEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("[Email Notification] Resend API Key is missing in environment variables. Email send skipped.");
      return { success: false, error: "Clé API Resend manquante." };
    }

    const fromAddress = process.env.RESEND_EMAIL_FROM || "Spoolio <contact@spoolio.fr>";
    const recipient = customerEmail;
    const clientName = customerName ? customerName.trim() : "Cher(e) passionné(e)";
    const cardUrl = `https://spoolio.fr/loyalty/${cardId}`;
    const percentage = Math.min(100, Math.round((points / maxPoints) * 100));

    const subject = isReward
      ? `🎁 Félicitations ${customerName || ""} ! Un cadeau fidélité vous attend chez Spoolio`
      : `✨ Votre carte de fidélité Spoolio (${points} point${points > 1 ? "s" : ""})`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="background-color: #0a0a0f; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 15px;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #0d0d12; border: 1px solid #1f1f26; border-radius: 24px; padding: 36px 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); text-align: center;">
          
          <!-- Brand Logo -->
          <div style="margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 900; letter-spacing: -0.04em; color: #ffffff; text-transform: uppercase;">
              SPOOLIO<span style="color: #ff4f00;">.</span>
            </span>
          </div>

          <!-- Header Icon & Title -->
          <div style="display: inline-block; width: 64px; height: 64px; line-height: 64px; border-radius: 20px; background: linear-gradient(135deg, rgba(255,79,0,0.2), rgba(255,106,34,0.05)); border: 1px solid rgba(255,79,0,0.3); font-size: 30px; margin-bottom: 16px;">
            ${isReward ? "🎁" : "✨"}
          </div>

          <h1 style="font-size: 22px; font-weight: 900; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.02em;">
            ${isReward ? "Palier Débloqué ! Un cadeau vous attend" : "Votre Carte de Fidélité Spoolio"}
          </h1>

          <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6; margin: 0 0 28px 0;">
            Bonjour <strong style="color: #ffffff;">${clientName}</strong>, voici le solde actualisé de votre compte fidélité. Retrouvez vos points, découvrez vos paliers et profitez de vos récompenses exclusives sur nos stands et en ligne !
          </p>

          <!-- Digital Card Box -->
          <div style="background: linear-gradient(145deg, #131318, #181820); border: 1px solid #272732; border-radius: 20px; padding: 24px; text-align: left; margin-bottom: 28px; box-shadow: 0 10px 25px rgba(0,0,0,0.4);">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <span style="display: block; font-size: 10px; font-weight: 800; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em;">Carte Spoolio</span>
                <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; font-weight: bold; color: #ffffff;">${cardId}</span>
              </div>
              <div style="text-align: right;">
                <span style="display: inline-block; background-color: rgba(255,79,0,0.15); border: 1px solid rgba(255,79,0,0.4); color: #ff4f00; font-size: 13px; font-weight: 900; padding: 4px 12px; border-radius: 100px;">
                  ${points} pts
                </span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div style="margin-top: 12px; margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #a1a1aa; margin-bottom: 6px;">
                <span>Progression fidélité</span>
                <strong style="color: #ffffff;">${points} / ${maxPoints} pts</strong>
              </div>
              <div style="height: 10px; background-color: #09090b; border-radius: 100px; overflow: hidden; border: 1px solid #272732;">
                <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #ff4f00, #ff7a22); border-radius: 100px;"></div>
              </div>
            </div>

            <p style="font-size: 11px; color: #71717a; margin: 12px 0 0 0;">
              🏷️ Présentez votre carte ou votre e-mail lors de votre passage sur nos stands de marché ou lors de vos commandes sur <a href="https://spoolio.fr" style="color: #ff4f00; text-decoration: none;">spoolio.fr</a>.
            </p>
          </div>

          <!-- Main CTA Button -->
          <div style="margin-bottom: 32px;">
            <a href="${cardUrl}" style="display: inline-block; background: linear-gradient(135deg, #ff4f00, #ff6a22); color: #000000; font-weight: 900; text-decoration: none; font-size: 14px; padding: 15px 32px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 20px rgba(255, 79, 0, 0.4);">
              Voir ma carte en ligne →
            </a>
          </div>

          <!-- Explanations / Footer -->
          <div style="border-top: 1px solid #1f1f26; padding-top: 20px; font-size: 11px; color: #52525b; line-height: 1.6;">
            <p style="margin: 0 0 6px 0;">Spoolio • Créations 3D éco-responsables • Comines, France</p>
            <p style="margin: 0;">Une question ? Écrivez-nous à <a href="mailto:contact@spoolio.fr" style="color: #71717a; text-decoration: underline;">contact@spoolio.fr</a></p>
          </div>

        </div>
      </body>
      </html>
    `;

    console.log(`[Resend Email] Sending loyalty card email to ${recipient}...`);
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress.includes("<") ? fromAddress : `Spoolio <${fromAddress}>`,
        to: recipient,
        subject: subject,
        html: emailHtml,
      }),
    });

    const emailData = await emailRes.json();
    if (emailRes.ok) {
      console.log(`[Resend Email Success] Loyalty card email sent to ${recipient} (ID: ${emailData.id})`);
      return { success: true };
    } else {
      console.error("[Resend Email Error] Loyalty card API error details:", emailData);
      return { success: false, error: emailData.message || "Erreur Resend" };
    }
  } catch (err: any) {
    console.error("[Resend Email Error] Failed to send loyalty card email:", err.message || err);
    return { success: false, error: err.message || "Erreur réseau inconnue" };
  }
}


