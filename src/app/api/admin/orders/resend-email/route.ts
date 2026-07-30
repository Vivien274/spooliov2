import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import { sendOrderConfirmationEmail } from "@/lib/email";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spoolio_admin_session")?.value;
    const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";

    if (!token || !(await verifySession(token, secret))) {
      return NextResponse.json(
        { error: "Accès refusé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { orderId, targetEmail } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Identifiant de commande manquant." },
        { status: 400 }
      );
    }

    // Retrieve order from Prisma DB or local orders.json
    let order: any = null;

    try {
      if (prisma) {
        order = await prisma.order.findUnique({
          where: { id: orderId }
        });
      }
    } catch (e) {}

    if (!order) {
      const jsonPath = path.join(process.cwd(), 'src/data/orders.json');
      if (fs.existsSync(jsonPath)) {
        try {
          const fileData = fs.readFileSync(jsonPath, 'utf-8');
          const orders = JSON.parse(fileData || "[]");
          order = orders.find((o: any) => o.id === orderId);
        } catch (jsonErr) {}
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable." },
        { status: 404 }
      );
    }

    let parsedItems = [];
    let parsedRelay = null;
    try {
      parsedItems = typeof order.items === 'string' ? JSON.parse(order.items || "[]") : (order.items || []);
    } catch (e) {
      parsedItems = [];
    }
    try {
      parsedRelay = order.relayDetails ? (typeof order.relayDetails === 'string' ? JSON.parse(order.relayDetails) : order.relayDetails) : null;
    } catch (e) {
      parsedRelay = null;
    }

    const recipientEmail = (targetEmail && targetEmail.trim()) || order.email;

    const sent = await sendOrderConfirmationEmail({
      orderId: order.id,
      customerName: order.customerName || "Client Spoolio",
      customerEmail: recipientEmail,
      items: parsedItems,
      total: order.total,
      shippingCost: order.shippingCost,
      shippingMethod: order.shippingMethod,
      relayDetails: parsedRelay
    });

    if (sent) {
      return NextResponse.json({
        success: true,
        message: `Email de confirmation renvoyé avec succès à ${recipientEmail}`
      });
    } else {
      return NextResponse.json(
        { error: "Échec d'envoi de l'email via Resend. Vérifiez vos variables d'environnement Resend." },
        { status: 500 }
      );
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors du renvoi de l'email." },
      { status: 500 }
    );
  }
}
