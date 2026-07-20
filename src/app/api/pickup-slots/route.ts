import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const DEFAULT_SLOTS = [
  "Lundi - 10h00 à 12h00",
  "Lundi - 14h00 à 16h00",
  "Mercredi - 10h00 à 12h00",
  "Vendredi - 14h00 à 16h00",
  "Samedi - 10h00 à 12h00"
];

// GET: Retrieve all available slots
export async function GET() {
  try {
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Database Query Timeout (1000ms)")), 1000)
    );

    const queryPromise = prisma.page.findUnique({
      where: { slug: "config-pickup-slots" }
    });

    const page = await Promise.race([queryPromise, timeoutPromise]);

    let slots = DEFAULT_SLOTS;
    if (page) {
      try {
        slots = JSON.parse(page.content);
      } catch (err) {
        slots = DEFAULT_SLOTS;
      }
    }

    return NextResponse.json({ success: true, slots });
  } catch (e: any) {
    console.warn("GET available slots query timed out or failed, returning default slots:", e.message || e);
    return NextResponse.json({ success: true, slots: DEFAULT_SLOTS });
  }
}

// POST: Save available slots list (Admin only)
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

    const { slots } = await request.json();
    if (!slots || !Array.isArray(slots)) {
      return NextResponse.json(
        { error: "Format des créneaux invalide." },
        { status: 400 }
      );
    }

    const contentString = JSON.stringify(slots);

    await prisma.page.upsert({
      where: { slug: "config-pickup-slots" },
      update: { content: contentString },
      create: {
        title: "Configuration Créneaux Retrait",
        slug: "config-pickup-slots",
        content: contentString,
        status: "publish"
      }
    });

    return NextResponse.json({ success: true, slots });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur de mise à jour des créneaux." },
      { status: 500 }
    );
  }
}
