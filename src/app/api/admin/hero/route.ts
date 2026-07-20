import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const DEFAULT_HERO = {
  title: "La Capsule été",
  subtitle: "Elle est sortie, elle est tout belle !",
  buttonText: "VOIR LA CAPSULE",
  buttonLink: "/boutique",
  imageUrl: "/images/hero_background.jpg",
  imagePosition: "center center"
};

// GET: Retrieve hero configuration
export async function GET() {
  try {
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Database Query Timeout (6000ms)")), 6000)
    );

    const queryPromise = prisma.page.findUnique({
      where: { slug: "config-hero" }
    });

    let page = await Promise.race([queryPromise, timeoutPromise]);

    if (!page) {
      try {
        // Create default settings row in DB, but with a timeout fallback
        const createPromise = prisma.page.create({
          data: {
            title: "Configuration Hero Accueil",
            slug: "config-hero",
            content: JSON.stringify(DEFAULT_HERO),
            status: "publish"
          }
        });
        page = await Promise.race([createPromise, timeoutPromise]);
      } catch (createErr: any) {
        console.warn("Prisma page creation timed out or failed:", createErr.message);
      }
    }

    let config = DEFAULT_HERO;
    if (page) {
      try {
        config = JSON.parse(page.content);
      } catch {
        config = DEFAULT_HERO;
      }
    }

    return NextResponse.json({ success: true, config });
  } catch (e: any) {
    console.warn("GET hero config query timed out or failed, returning defaults:", e.message || e);
    return NextResponse.json({ success: true, config: DEFAULT_HERO });
  }
}

// POST: Update hero configuration (Admin only)
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

    const { title, subtitle, buttonText, buttonLink, imageUrl, imagePosition } = await request.json();

    if (!title || !buttonText || !buttonLink || !imageUrl) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires (Titre, Texte du bouton, Lien et URL Image)." },
        { status: 400 }
      );
    }

    const configString = JSON.stringify({
      title,
      subtitle: subtitle || "",
      buttonText,
      buttonLink,
      imageUrl,
      imagePosition: imagePosition || "center center"
    });

    await prisma.page.upsert({
      where: { slug: "config-hero" },
      update: {
        content: configString
      },
      create: {
        title: "Configuration Hero Accueil",
        slug: "config-hero",
        content: configString,
        status: "publish"
      }
    });

    console.log("[Admin Update] Configuration Hero mise à jour !");

    return NextResponse.json({ success: true, message: "Configuration Hero enregistrée." });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de l'enregistrement de la configuration Hero." },
      { status: 500 }
    );
  }
}
