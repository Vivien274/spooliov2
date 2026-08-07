import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import { sendReviewRequestEmail } from "@/lib/email";
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
        { error: "Accès refusé. Veuillez vous connecter à l'administration." },
        { status: 401 }
      );
    }

    const { orderId, targetEmail, googleReviewUrl, siteReviewUrl } = await request.json();

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
    try {
      parsedItems = typeof order.items === 'string' ? JSON.parse(order.items || "[]") : (order.items || []);
    } catch (e) {
      parsedItems = [];
    }

    const recipientEmail = (targetEmail && targetEmail.trim()) || order.email;
    const customerName = order.customerName || "Client Spoolio";

    const result = await sendReviewRequestEmail({
      orderId: order.id,
      customerName,
      customerEmail: recipientEmail,
      items: parsedItems,
      googleReviewUrl,
      siteReviewUrl
    });

    if (result.success) {
      const nowIso = new Date().toISOString();

      // Record reviewRequestedAt in orders.json or DB if available
      const jsonPath = path.join(process.cwd(), 'src/data/orders.json');
      if (fs.existsSync(jsonPath)) {
        try {
          const fileData = fs.readFileSync(jsonPath, 'utf-8');
          const ordersList = JSON.parse(fileData || "[]");
          const idx = ordersList.findIndex((o: any) => o.id === orderId);
          if (idx !== -1) {
            ordersList[idx].reviewRequestedAt = nowIso;
            ordersList[idx].reviewRequestedCount = (ordersList[idx].reviewRequestedCount || 0) + 1;
            fs.writeFileSync(jsonPath, JSON.stringify(ordersList, null, 2), 'utf-8');
          }
        } catch (err) {}
      }

      return NextResponse.json({
        success: true,
        message: `Email de relance d'avis envoyé avec succès à ${recipientEmail} !`,
        reviewRequestedAt: nowIso
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Échec d'envoi de l'email de relance d'avis." },
        { status: 500 }
      );
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de la relance pour avis." },
      { status: 500 }
    );
  }
}
