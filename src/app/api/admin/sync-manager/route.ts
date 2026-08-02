import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncOrderToManager } from "@/lib/managerSync";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    let orders: any[] = [];

    try {
      orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" }
      });
    } catch (e) {
      const jsonPath = path.join(process.cwd(), "src/data/orders.json");
      if (fs.existsSync(jsonPath)) {
        try {
          const fileData = fs.readFileSync(jsonPath, "utf-8");
          orders = JSON.parse(fileData || "[]");
        } catch (jsonErr) {
          orders = [];
        }
      }
    }

    let syncedCount = 0;
    for (const order of orders) {
      const success = await syncOrderToManager({
        id: order.id,
        email: order.email,
        customerName: order.customerName,
        items: order.items,
        total: order.total,
        shippingMethod: order.shippingMethod,
        createdAt: order.createdAt
      });
      if (success) syncedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Synchronisation terminée : ${syncedCount} commande(s) synchronisée(s) vers spoolio-manager.`,
      totalOrders: orders.length
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur de synchronisation." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
