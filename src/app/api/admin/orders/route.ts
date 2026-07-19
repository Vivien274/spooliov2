import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// GET: Retrieve all orders (Admin only)
export async function GET() {
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

    const jsonPath = path.join(process.cwd(), 'src/data/orders.json');
    let orders: any[] = [];

    // Timeout Promise at 800ms
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Prisma Query Timeout (800ms)")), 800)
    );

    try {
      console.log("Fetching orders from Prisma Database...");
      orders = await Promise.race([
        prisma.order.findMany({
          orderBy: {
            createdAt: "desc"
          }
        }),
        timeoutPromise
      ]);

      // Cache to local JSON async
      try {
        fs.writeFileSync(jsonPath, JSON.stringify(orders, null, 2), 'utf-8');
      } catch (err) {
        console.warn("Could not cache orders to local JSON:", err);
      }
    } catch (dbErr: any) {
      console.warn("Database failed or timed out. Falling back to local orders.json:", dbErr.message);
      
      if (fs.existsSync(jsonPath)) {
        try {
          const fileData = fs.readFileSync(jsonPath, 'utf-8');
          orders = JSON.parse(fileData || "[]");
        } catch (jsonErr: any) {
          console.error("Failed to parse local orders.json:", jsonErr.message);
          orders = [];
        }
      } else {
        orders = [];
      }
    }

    // Parse the items summary before sending
    const parsedOrders = orders.map((o) => {
      let parsedItems = [];
      let parsedRelay = null;
      try {
        parsedItems = typeof o.items === 'string' ? JSON.parse(o.items || "[]") : (o.items || []);
      } catch (e) {
        parsedItems = [];
      }
      try {
        parsedRelay = o.relayDetails ? (typeof o.relayDetails === 'string' ? JSON.parse(o.relayDetails) : o.relayDetails) : null;
      } catch (e) {
        parsedRelay = null;
      }

      return {
        ...o,
        items: parsedItems,
        relayDetails: parsedRelay
      };
    });

    return NextResponse.json({ success: true, orders: parsedOrders });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur de chargement des commandes." },
      { status: 500 }
    );
  }
}

// POST: Update order status (Admin only)
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

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Identifiant ou statut de commande manquant." },
        { status: 400 }
      );
    }

    const allowedStatuses = ["attente_impression", "impression", "emballe", "expedie"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Statut de commande invalide." },
        { status: 400 }
      );
    }

    let updatedOrder: any = null;

    try {
      updatedOrder = await prisma.order.update({
        where: { id: id },
        data: { status: status }
      });
    } catch (dbErr: any) {
      console.warn("Database failed to update status. Synchronizing locally in orders.json...", dbErr.message);
    }

    // Synchronize local JSON file
    const jsonPath = path.join(process.cwd(), 'src/data/orders.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const fileData = fs.readFileSync(jsonPath, 'utf-8');
        const orders = JSON.parse(fileData || "[]");
        const idx = orders.findIndex((o: any) => o.id === id);
        if (idx !== -1) {
          orders[idx].status = status;
          fs.writeFileSync(jsonPath, JSON.stringify(orders, null, 2), 'utf-8');
          if (!updatedOrder) {
            updatedOrder = orders[idx];
          }
        }
      } catch (jsonErr) {
        console.error("Failed to update status in local orders.json:", jsonErr);
      }
    }

    if (!updatedOrder) {
      updatedOrder = { id, status };
    }

    console.log(`[Admin Update] Commande ${id} mise à jour avec statut: ${status}`);

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de la mise à jour du statut." },
      { status: 500 }
    );
  }
}
