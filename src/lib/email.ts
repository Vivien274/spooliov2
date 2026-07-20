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

    // Determine sender address: look for RESEND_EMAIL_FROM first
    const fromAddress = process.env.RESEND_EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    
    // In Resend sandbox mode (using onboarding@resend.dev), you can only send emails to the account owner
    // We let the developer force a recipient for testing in preview/dev env
    const recipient = process.env.RESEND_TO_EMAIL || customerEmail;

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
            <img src="https://spoolio.fr/wp-content/uploads/2025/04/LogoSpoolio_White-long.png" alt="Spoolio" style="height: 40px; width: auto; display: inline-block;" />
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

          <!-- Track Button -->
          <div style="text-align: center; margin-top: 35px; margin-bottom: 35px;">
            <a href="${trackingUrl}" style="display: inline-block; background-color: #ff4f00; color: #ffffff; font-weight: bold; text-decoration: none; font-size: 13px; padding: 14px 28px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 15px rgba(255, 79, 0, 0.3);">
              Suivre ma commande en direct 📦
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
            <img src="https://spoolio.fr/wp-content/uploads/2025/04/LogoSpoolio_White-long.png" alt="Spoolio" style="height: 40px; width: auto; display: inline-block;" />
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
            <img src="https://spoolio.fr/wp-content/uploads/2025/04/LogoSpoolio_White-long.png" alt="Spoolio" style="height: 40px; width: auto; display: inline-block;" />
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
