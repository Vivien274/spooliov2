import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { id, slot, email } = await request.json();

    if (!id || !slot || !email) {
      return NextResponse.json(
        { error: "Paramètres manquants pour la confirmation." },
        { status: 400 }
      );
    }

    // Try finding the order in database
    let order = null;
    try {
      order = await prisma.order.findFirst({
        where: {
          id: id,
          email: email
        }
      });
    } catch (e: any) {
      console.warn("Prisma search failed, looking up orders.json...");
    }

    // Fallback to orders.json local cache if DB is not reachable
    const jsonPath = path.join(process.cwd(), 'src/data/orders.json');
    if (!order && fs.existsSync(jsonPath)) {
      try {
        const fileData = fs.readFileSync(jsonPath, 'utf-8');
        const orders = JSON.parse(fileData || "[]");
        order = orders.find((o: any) => o.id === id && o.email === email);
      } catch (jsonErr) {
        console.error("Failed to parse local orders.json:", jsonErr);
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable. Veuillez vérifier vos informations." },
        { status: 404 }
      );
    }

    // Update in database
    let updatedOrder = null;
    try {
      updatedOrder = await prisma.order.update({
        where: { id: id },
        data: {
          pickupSlotConfirmed: slot,
          pickupStatus: "confirmed"
        }
      });
    } catch (dbErr) {
      console.warn("Failed to update in Prisma database, updating locally in orders.json...");
    }

    // Update local cache orders.json
    if (fs.existsSync(jsonPath)) {
      try {
        const fileData = fs.readFileSync(jsonPath, 'utf-8');
        const orders = JSON.parse(fileData || "[]");
        const idx = orders.findIndex((o: any) => o.id === id);
        if (idx !== -1) {
          orders[idx].pickupSlotConfirmed = slot;
          orders[idx].pickupStatus = "confirmed";
          fs.writeFileSync(jsonPath, JSON.stringify(orders, null, 2), 'utf-8');
          if (!updatedOrder) {
            updatedOrder = orders[idx];
          }
        }
      } catch (jsonErr) {
        console.error("Failed to sync status update in local orders.json:", jsonErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur de traitement." },
      { status: 500 }
    );
  }
}
