import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import { sendOrderNoteEmail } from "@/lib/email";
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

    const { orderId, note, targetEmail } = await request.json();

    if (!orderId || !note || !note.trim()) {
      return NextResponse.json(
        { error: "L'identifiant de commande et le message de la note sont requis." },
        { status: 400 }
      );
    }

    // Retrieve order from Prisma DB or local orders.json fallback
    let order: any = null;

    try {
      if (prisma) {
        order = await prisma.order.findUnique({
          where: { id: orderId }
        });
      }
    } catch (e) {
      console.warn("[Send Note Route] Prisma query failed, trying local JSON fallback:", e);
    }

    if (!order) {
      const jsonPath = path.join(process.cwd(), 'src/data/orders.json');
      if (fs.existsSync(jsonPath)) {
        try {
          const fileData = fs.readFileSync(jsonPath, 'utf-8');
          const orders = JSON.parse(fileData || "[]");
          order = orders.find((o: any) => o.id === orderId);
        } catch (jsonErr) {
          console.error("[Send Note Route] Failed to parse local orders.json:", jsonErr);
        }
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

    const result = await sendOrderNoteEmail({
      orderId: order.id,
      customerName: order.customerName || "Client Spoolio",
      customerEmail: recipientEmail,
      note: note.trim(),
      items: parsedItems
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Note envoyée avec succès par e-mail à ${recipientEmail} et en copie à l'administrateur !`
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Échec d'envoi de l'e-mail via Resend. Vérifiez votre clé API Resend." },
        { status: 500 }
      );
    }
  } catch (e: any) {
    console.error("[Send Note API Error]:", e);
    return NextResponse.json(
      { error: e.message || "Erreur lors de l'envoi de la note." },
      { status: 500 }
    );
  }
}
