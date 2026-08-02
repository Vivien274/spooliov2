import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { syncOrderToManager } from "@/lib/managerSync";
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
    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      total,
      shippingMethod,
      sendEmail
    } = body;

    if (!customerEmail || !customerEmail.trim()) {
      return NextResponse.json(
        { error: "L'adresse email du client est obligatoire." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Au moins un article est requis." },
        { status: 400 }
      );
    }

    // Generate short clean Order ID e.g. SP-M1234
    const orderId = `SP-M${Math.floor(10000 + Math.random() * 90000)}`;
    const itemsSummary = JSON.stringify(items);
    const orderTotal = parseFloat(total) || 0;
    const method = shippingMethod || "tombola";

    const newOrderData = {
      id: orderId,
      stripeSession: `manual_${orderId}`,
      email: customerEmail.trim(),
      customerName: customerName ? customerName.trim() : "Client Spoolio",
      customerPhone: customerPhone ? customerPhone.trim() : null,
      shippingAddress: method === "pickup" ? "Retrait Atelier Comines" : (method === "tombola" ? "Achat Tombola" : null),
      items: itemsSummary,
      total: orderTotal,
      shippingCost: 0,
      shippingMethod: method,
      status: "expedie",
      createdAt: new Date().toISOString()
    };

    // 1. Insert in Postgres via Prisma
    let createdOrder: any = null;
    try {
      if (prisma) {
        createdOrder = await prisma.order.create({
          data: {
            id: newOrderData.id,
            stripeSession: newOrderData.stripeSession,
            email: newOrderData.email,
            customerName: newOrderData.customerName,
            customerPhone: newOrderData.customerPhone,
            shippingAddress: newOrderData.shippingAddress,
            items: newOrderData.items,
            total: newOrderData.total,
            shippingCost: newOrderData.shippingCost,
            shippingMethod: newOrderData.shippingMethod,
            status: newOrderData.status,
          }
        });

        // Sync manual order to spoolio-manager Supabase database
        try {
          await syncOrderToManager(newOrderData);
        } catch (syncErr) {
          console.error("Manager sync error in manual order creation:", syncErr);
        }
      }
    } catch (dbErr: any) {
      console.warn("Failed to create manual order in DB:", dbErr.message);
    }

    // 2. Cache in local orders.json
    try {
      const jsonPath = path.join(process.cwd(), 'src/data/orders.json');
      let localOrders = [];
      if (fs.existsSync(jsonPath)) {
        try {
          localOrders = JSON.parse(fs.readFileSync(jsonPath, 'utf-8') || "[]");
        } catch (e) {
          localOrders = [];
        }
      }
      localOrders.unshift(newOrderData);
      fs.writeFileSync(jsonPath, JSON.stringify(localOrders, null, 2), 'utf-8');
    } catch (jsonErr: any) {
      console.error("Failed to update local orders.json:", jsonErr.message);
    }

    // 3. Detect and reserve Tombola tickets if included in item names
    try {
      const tombolaTicketNumbers: number[] = [];
      for (const item of items) {
        const nameStr = (item.name || "").toLowerCase();
        const matches = nameStr.matchAll(/(?:case|ticket|tombola|\b)?\s*#?(\d{1,3})/gi);
        for (const match of matches) {
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > 0 && num <= 200) tombolaTicketNumbers.push(num);
          }
        }
      }

      if (tombolaTicketNumbers.length > 0 && prisma) {
        let activeTombola = await prisma.tombola.findFirst({ orderBy: { createdAt: "desc" } });
        if (!activeTombola) {
          activeTombola = await prisma.tombola.create({
            data: {
              title: "Mega Pack Fidget & Impression 3D Spoolio",
              description: "Tente ta chance de remporter un lot exclusif !",
              image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
              estimatedValue: 85.00,
              endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
              totalCases: 40,
              ticketPrice: 2.00,
              status: "active",
              reservedTickets: JSON.stringify([]),
            },
          });
        }
        if (activeTombola) {
          let currentReserved: number[] = [];
          try {
            currentReserved = typeof activeTombola.reservedTickets === "string"
              ? JSON.parse(activeTombola.reservedTickets)
              : (Array.isArray(activeTombola.reservedTickets) ? (activeTombola.reservedTickets as any) : []);
          } catch (e) {}
          const updatedReserved = Array.from(new Set([...currentReserved, ...tombolaTicketNumbers])).sort((a, b) => a - b);
          await prisma.tombola.update({
            where: { id: activeTombola.id },
            data: { reservedTickets: JSON.stringify(updatedReserved) }
          });
        }
      }
    } catch (tombolaErr: any) {
      console.error("Failed to auto-reserve tombola tickets for manual order:", tombolaErr.message);
    }

    // 4. Send Confirmation Email if requested
    let emailSent = false;
    if (sendEmail) {
      try {
        emailSent = await sendOrderConfirmationEmail({
          orderId: orderId,
          customerName: newOrderData.customerName,
          customerEmail: newOrderData.email,
          items: items,
          total: orderTotal,
          shippingCost: 0,
          shippingMethod: method,
        });
      } catch (emailErr: any) {
        console.error("Failed to send manual order email:", emailErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      order: createdOrder || newOrderData,
      emailSent,
      message: `Commande ${orderId} créée avec succès !${emailSent ? " Email de confirmation envoyé au client." : ""}`
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur de création de la commande manuelle." },
      { status: 500 }
    );
  }
}
