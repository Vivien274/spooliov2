import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!id || !email) {
      return NextResponse.json(
        { error: "Veuillez fournir un numéro de commande et un e-mail valides." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: id.trim(),
        email: {
          equals: email.trim().toLowerCase()
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Aucune commande trouvée avec ce numéro et cet e-mail." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        shippingMethod: order.shippingMethod,
        relayDetails: order.relayDetails ? JSON.parse(order.relayDetails) : null,
        items: JSON.parse(order.items),
        total: order.total,
        shippingCost: order.shippingCost,
        createdAt: order.createdAt
      }
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur de base de données." },
      { status: 500 }
    );
  }
}
