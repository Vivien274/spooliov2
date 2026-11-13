import { NextResponse } from "next/server";
import { getAllPacks, getPackBySlug } from "@/lib/serverPacks";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const pack = await getPackBySlug(slug);
      if (!pack || pack.status !== "active") {
        return NextResponse.json({ error: "Pack introuvable" }, { status: 404 });
      }
      return NextResponse.json({ success: true, pack });
    }

    const packs = await getAllPacks(false);
    return NextResponse.json({ success: true, packs });
  } catch (e: unknown) {
    const errMessage = e instanceof Error ? e.message : "Erreur serveur";
    console.error("[API Packs GET Error]:", errMessage);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
