import { NextResponse } from "next/server";
import { validatePromoCodeAction } from "@/app/actions/promoActions";

export async function POST(request: Request) {
  try {
    const { code, cartTotal } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Veuillez spécifier un code promo." },
        { status: 400 }
      );
    }

    const total = typeof cartTotal === "number" ? cartTotal : parseFloat(cartTotal) || 0;
    const result = await validatePromoCodeAction(code, total);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API error /api/promo/validate:", error);
    return NextResponse.json(
      { valid: false, error: "Erreur serveur lors de la validation du code promo." },
      { status: 500 }
    );
  }
}
