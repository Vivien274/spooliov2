import { NextResponse } from "next/server";
import { getBazarDataAction, decrementBazarStockAction } from "@/app/actions/bazarActions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dataset = await getBazarDataAction();
    return NextResponse.json(dataset);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === "order" && Array.isArray(body.purchases)) {
      const result = await decrementBazarStockAction(body.purchases);
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

