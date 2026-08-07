import { NextResponse } from "next/server";
import { getBadges, saveBadges } from "@/lib/badgesData";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import { Fiche } from "@/lib/badgeTypes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spoolio_admin_session")?.value;
    const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";

    if (!token || !(await verifySession(token, secret))) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 });
    }

    const badges = getBadges();
    return NextResponse.json({ success: true, badges });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spoolio_admin_session")?.value;
    const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";

    if (!token || !(await verifySession(token, secret))) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { action, badgeId, count, type } = body;

    const badges = getBadges();

    if (action === "encode_nfc" && badgeId) {
      const idx = badges.findIndex(b => b.id === badgeId);
      if (idx !== -1) {
        badges[idx].nfc_encoded_at = new Date().toISOString();
        saveBadges(badges);
        return NextResponse.json({ success: true, message: "Puce NFC marquée comme encodée !", badge: badges[idx] });
      }
    }

    if (action === "generate_batch") {
      const numToGenerate = Math.min(Math.max(1, count || 5), 50);
      const generated: Fiche[] = [];

      for (let i = 0; i < numToGenerate; i++) {
        const randToken = Math.random().toString(36).substring(2, 10).toUpperCase();
        const claimCode = Math.floor(100000 + Math.random() * 900000).toString();
        const newBadge: Fiche = {
          id: `badge-${Date.now()}-${i}`,
          token: randToken,
          claim_code: claimCode,
          nfc_encoded_at: null,
          password_hash: null,
          type: type || "festivalier",
          is_claimed: false,
          data: {},
          failed_attempts: 0,
          locked_until: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        badges.push(newBadge);
        generated.push(newBadge);
      }

      saveBadges(badges);
      return NextResponse.json({
        success: true,
        message: `${generated.length} nouveaux badges générés avec succès !`,
        generatedCount: generated.length,
      });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
