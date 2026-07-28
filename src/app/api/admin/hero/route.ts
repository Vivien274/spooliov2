import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const DEFAULT_HERO = {
  topBadgeText: "🟢 ATELIER EN ACTION (COMINES 🇫🇷) • PLA BIOSOURCÉ",
  title: "L'IMPRESSION 3D QUI A DU PUNCH 🌀",
  subtitle: "Objets funs, fidgets sensoriels TDAH & clickers sur-mesure faits main en France avec du plastique biosourcé 🌱",
  buttonText: "🛠️ CRÉER MON CLICKER 3D",
  buttonLink: "/createur-cliqueur",
  secondaryButtonText: "🛍️ VOIR LA BOUTIQUE",
  secondaryButtonLink: "/boutique",
  cardBadge: "🔥 PRODUIT STAR 3D",
  cardTitle: "⌨️ Fidget Clicker 3D Custom",
  cardPrice: "À partir de 3.00€",
  cardTags: "🎨 12 Couleurs PLA • ⚡ 1 à 9 Touches • 🌱 PLA Biosourcé",
  cardLink: "/createur-cliqueur",
  cardImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
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
        const parsed = JSON.parse(page.content);
        config = { ...DEFAULT_HERO, ...parsed };
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

    const payload = await request.json();

    if (!payload.title || !payload.buttonText || !payload.buttonLink) {
      return NextResponse.json(
        { error: "Veuillez remplir les champs obligatoires (Titre principal, Bouton et Lien)." },
        { status: 400 }
      );
    }

    const configString = JSON.stringify({
      topBadgeText: payload.topBadgeText || DEFAULT_HERO.topBadgeText,
      title: payload.title,
      subtitle: payload.subtitle || "",
      buttonText: payload.buttonText,
      buttonLink: payload.buttonLink,
      secondaryButtonText: payload.secondaryButtonText || DEFAULT_HERO.secondaryButtonText,
      secondaryButtonLink: payload.secondaryButtonLink || DEFAULT_HERO.secondaryButtonLink,
      cardBadge: payload.cardBadge || DEFAULT_HERO.cardBadge,
      cardTitle: payload.cardTitle || DEFAULT_HERO.cardTitle,
      cardPrice: payload.cardPrice || DEFAULT_HERO.cardPrice,
      cardTags: payload.cardTags || DEFAULT_HERO.cardTags,
      cardLink: payload.cardLink || DEFAULT_HERO.cardLink,
      cardImage: payload.cardImage || DEFAULT_HERO.cardImage,
      imageUrl: payload.imageUrl || DEFAULT_HERO.imageUrl,
      imagePosition: payload.imagePosition || "center center"
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
