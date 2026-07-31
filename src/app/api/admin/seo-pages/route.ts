import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { getAllPagesSeoConfig, DEFAULT_PAGES_SEO, PageSeoConfig } from "@/lib/seoPages";

export const dynamic = "force-dynamic";

// GET: Retrieve all main pages' SEO config
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spoolio_admin_session")?.value;
    const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";

    if (!token || !(await verifySession(token, secret))) {
      return NextResponse.json(
        { error: "Accès refusé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const seoConfig = getAllPagesSeoConfig();
    return NextResponse.json({ success: true, seoConfig });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur de chargement des paramètres SEO." },
      { status: 500 }
    );
  }
}

// POST: Save updated SEO config for pages
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spoolio_admin_session")?.value;
    const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";

    if (!token || !(await verifySession(token, secret))) {
      return NextResponse.json(
        { error: "Accès refusé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { seoConfig } = body;

    if (!seoConfig || typeof seoConfig !== "object") {
      return NextResponse.json(
        { error: "Données de configuration SEO invalides." },
        { status: 400 }
      );
    }

    const current = getAllPagesSeoConfig();
    const updated = { ...current, ...seoConfig };

    const filePath = path.join(process.cwd(), "src/data/pages-seo.json");
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: "Configuration SEO enregistrée avec succès !",
      seoConfig: updated
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de la sauvegarde des paramètres SEO." },
      { status: 500 }
    );
  }
}
