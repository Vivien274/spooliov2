import { NextResponse } from "next/server";
import { getBadgeByToken, saveBadgeToDatabase } from "@/lib/badgesData";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token requis." }, { status: 400 });
    }

    const fiche = await getBadgeByToken(token);
    if (!fiche) {
      return NextResponse.json({ error: "Badge introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true, fiche });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, type, data } = body;

    if (!token) {
      return NextResponse.json({ error: "Token manquant." }, { status: 400 });
    }

    const savedFiche = await saveBadgeToDatabase({
      token,
      type: type || "festivalier",
      data: data || {},
      is_claimed: true,
    });

    return NextResponse.json({
      success: true,
      message: "Fiche SOS enregistrée avec succès !",
      fiche: savedFiche,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
