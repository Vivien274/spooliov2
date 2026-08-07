import { NextResponse } from "next/server";
import { getBadges, saveBadges, getBadgeByToken } from "@/lib/badgesData";
import { Fiche } from "@/lib/badgeTypes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token requis." }, { status: 400 });
    }

    const fiche = getBadgeByToken(token);
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
    const { token, type, claimCode, password, data } = body;

    if (!token) {
      return NextResponse.json({ error: "Token manquant." }, { status: 400 });
    }

    const badges = getBadges();
    let ficheIndex = badges.findIndex((b) => b.token.toLowerCase() === token.toLowerCase());

    if (ficheIndex === -1) {
      // Create new badge record on the fly if user is activating a newly purchased badge token!
      const newFiche: Fiche = {
        id: `badge-${Date.now()}`,
        token,
        claim_code: null,
        nfc_encoded_at: new Date().toISOString(),
        password_hash: null,
        type: type || "festivalier",
        is_claimed: true,
        data: data || {},
        failed_attempts: 0,
        locked_until: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      badges.push(newFiche);
      saveBadges(badges);
      return NextResponse.json({
        success: true,
        message: "Badge activé et enregistré avec succès !",
        fiche: newFiche,
      });
    }

    const existingFiche = badges[ficheIndex];

    // If not claimed yet, verify claim_code if existingFiche has one
    if (!existingFiche.is_claimed && existingFiche.claim_code && claimCode !== existingFiche.claim_code) {
      return NextResponse.json(
        { error: "Code d'activation incorrect." },
        { status: 400 }
      );
    }

    // Update existing badge
    const updatedFiche: Fiche = {
      ...existingFiche,
      type: type || existingFiche.type,
      is_claimed: true,
      data: {
        ...(existingFiche.data || {}),
        ...(data || {}),
      },
      updated_at: new Date().toISOString(),
    };

    badges[ficheIndex] = updatedFiche;
    saveBadges(badges);

    return NextResponse.json({
      success: true,
      message: "Fiche SOS mise à jour avec succès !",
      fiche: updatedFiche,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
