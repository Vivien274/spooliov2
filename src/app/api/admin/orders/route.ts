import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

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

    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    // Parse the items summary before sending
    const parsedOrders = orders.map((o) => ({
      ...o,
      items: JSON.parse(o.items || "[]"),
      relayDetails: o.relayDetails ? JSON.parse(o.relayDetails) : null
    }));

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

    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: { status: status }
    });

    console.log(`[Admin Update] Commande ${id} mise à jour avec statut: ${status}`);

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de la mise à jour du statut." },
      { status: 500 }
    );
  }
}
