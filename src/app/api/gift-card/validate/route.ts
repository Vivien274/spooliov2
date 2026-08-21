import { NextResponse } from "next/server";
import { validateGiftCardAction } from "@/app/actions/giftCardActions";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    const result = await validateGiftCardAction(code);
    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
