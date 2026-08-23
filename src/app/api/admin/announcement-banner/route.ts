import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import { DEFAULT_BANNER_CONFIG } from "@/app/api/announcement-banner/route";

export const dynamic = "force-dynamic";

// GET: Retrieve current banner config for Admin
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

    const page = await prisma.page.findUnique({
      where: { slug: "config-announcement-banner" },
    });

    let config = DEFAULT_BANNER_CONFIG;
    if (page) {
      try {
        const parsed = JSON.parse(page.content);
        config = { ...DEFAULT_BANNER_CONFIG, ...parsed };
      } catch {
        config = DEFAULT_BANNER_CONFIG;
      }
    }

    return NextResponse.json({ success: true, config });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de la récupération de la configuration du bandeau." },
      { status: 500 }
    );
  }
}

// POST: Save updated banner config (Admin)
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

    const payload = await request.json();

    const configToSave = {
      enabled: typeof payload.enabled === "boolean" ? payload.enabled : true,
      badgeText: payload.badgeText ?? DEFAULT_BANNER_CONFIG.badgeText,
      message: payload.message ?? DEFAULT_BANNER_CONFIG.message,
      buttonText: payload.buttonText ?? "",
      buttonLink: payload.buttonLink ?? "",
      bgGradient: payload.bgGradient || DEFAULT_BANNER_CONFIG.bgGradient,
      dismissible: typeof payload.dismissible === "boolean" ? payload.dismissible : true,
    };

    const configString = JSON.stringify(configToSave);

    await prisma.page.upsert({
      where: { slug: "config-announcement-banner" },
      update: {
        content: configString,
      },
      create: {
        title: "Configuration Bandeau Haut de Page",
        slug: "config-announcement-banner",
        content: configString,
        status: "publish",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Configuration du bandeau enregistrée avec succès !",
      config: configToSave,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de l'enregistrement du bandeau." },
      { status: 500 }
    );
  }
}
