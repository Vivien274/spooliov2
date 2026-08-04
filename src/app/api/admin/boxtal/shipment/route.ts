import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import { createBoxtalShipment } from "@/lib/boxtal";
import { sendOrderShippedEmail } from "@/lib/email";
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

    const body = await request.json();
    const { orderId, weightKg } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Identifiant de commande requis." },
        { status: 400 }
      );
    }

    // Fetch order from DB or local JSON
    let order: any = null;
    try {
      if (prisma) {
        order = await prisma.order.findUnique({ where: { id: orderId } });
      }
    } catch (e) {
      console.warn("Database lookup failed for Boxtal shipment:", e);
    }

    const jsonPath = path.join(process.cwd(), 'src/data/orders.json');
    if (!order && fs.existsSync(jsonPath)) {
      try {
        const localOrders = JSON.parse(fs.readFileSync(jsonPath, 'utf-8') || "[]");
        order = localOrders.find((o: any) => o.id === orderId);
      } catch (e) {}
    }

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable." },
        { status: 404 }
      );
    }

    // Parse relay details if any
    let parsedRelay = null;
    try {
      parsedRelay = order.relayDetails
        ? (typeof order.relayDetails === 'string' ? JSON.parse(order.relayDetails) : order.relayDetails)
        : null;
    } catch (e) {}

    // Call Boxtal API helper
    const result = await createBoxtalShipment({
      orderId: order.id,
      recipientName: order.customerName || "Client Spoolio",
      recipientEmail: order.email,
      recipientPhone: order.customerPhone,
      shippingAddress: order.shippingAddress || "",
      shippingMethod: order.shippingMethod,
      relayCode: parsedRelay?.code || parsedRelay?.id,
      relayZip: parsedRelay?.zip,
      weightKg: parseFloat(weightKg) || 0.3
    });

    if (!result.success || !result.trackingNumber) {
      return NextResponse.json(
        { error: result.error || "Impossible de générer l'expédition avec Boxtal." },
        { status: 500 }
      );
    }

    // Update order status & tracking number in DB & JSON
    const updateData = {
      trackingNumber: result.trackingNumber,
      status: "expedie",
      archived: true // Auto-archive order once shipped via Boxtal
    };

    try {
      if (prisma) {
        await prisma.order.update({
          where: { id: order.id },
          data: updateData
        });
      }
    } catch (dbErr: any) {
      console.warn("DB update warning for Boxtal shipment:", dbErr.message);
    }

    if (fs.existsSync(jsonPath)) {
      try {
        const localOrders = JSON.parse(fs.readFileSync(jsonPath, 'utf-8') || "[]");
        const idx = localOrders.findIndex((o: any) => o.id === order.id);
        if (idx !== -1) {
          localOrders[idx].trackingNumber = result.trackingNumber;
          localOrders[idx].status = "expedie";
          localOrders[idx].archived = true;
          fs.writeFileSync(jsonPath, JSON.stringify(localOrders, null, 2), 'utf-8');
        }
      } catch (jsonErr: any) {
        console.error("Local JSON update error for Boxtal shipment:", jsonErr.message);
      }
    }

    // Send shipment confirmation email to customer
    let emailSent = false;
    try {
      emailSent = await sendOrderShippedEmail({
        orderId: order.id,
        customerName: order.customerName || "Client Spoolio",
        customerEmail: order.email,
        shippingMethod: order.shippingMethod,
        relayDetails: parsedRelay,
        trackingNumber: result.trackingNumber
      });
    } catch (emailErr: any) {
      console.error("Failed to send shipment email:", emailErr.message);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      trackingNumber: result.trackingNumber,
      labelUrl: result.labelUrl,
      carrierName: result.carrierName,
      emailSent,
      message: `Expédition Boxtal créée avec succès ! N° Suivi: ${result.trackingNumber}${emailSent ? " (Email envoyé au client)" : ""}`
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur serveur lors de la création de l'expédition Boxtal." },
      { status: 500 }
    );
  }
}
