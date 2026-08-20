import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export interface HeroSlide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  accentColor: string;

  // Floating product card
  cardProductId?: number | string;
  cardTitle?: string;
  cardDescription?: string;
  cardPrice?: string;
  cardImage?: string;
  cardLink?: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 1,
    badge: "PACKS SENSORIELS TDAH",
    title: "LA FOLIE DES FIDGETS SENSORIELS ⚡",
    subtitle: "Décompresser, toucher, cliquer : découvrez nos créations 3D originales faites main en France 🌱",
    buttonText: "DÉCOUVRIR LA BOUTIQUE",
    buttonLink: "/boutique",
    image: "/images/hero_background.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Pack Fidget Sensory TDAH",
    cardDescription: "Assortiment anti-stress fabriqué en PLA biosourcé.",
    cardPrice: "14.90€",
    cardImage: "/images/hero_background.jpg",
    cardLink: "/boutique"
  },
  {
    id: 2,
    badge: "STUDIO CLICKER 3D",
    title: "CRÉE TON CLICKER 3D SUR-MESURE 🎨",
    subtitle: "Choisis tes couleurs de switch, le nombre de touches et la finition de ton fidget clicker",
    buttonText: "CRÉER MON CLICKER",
    buttonLink: "/createur-cliqueur",
    image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    accentColor: "#2F3CD9",
    cardTitle: "Fidget Clicker 3D Custom",
    cardDescription: "Sensations ASMR avec switchs interchangeables.",
    cardPrice: "À partir de 3.00€",
    cardImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    cardLink: "/createur-cliqueur"
  },
  {
    id: 3,
    badge: "ÉDITIONS LIMITÉES",
    title: "LA POCHETTE SURPRISE SPOOLIO 📦",
    subtitle: "Un assortiment mystère d'objets funs & fidgets 3D inédits dès 10.00€",
    buttonText: "VOIR LES POCHETTES",
    buttonLink: "/pochette-surprise",
    image: "/images/imported/PochetteM-1.png",
    accentColor: "#FF7700",
    cardTitle: "Pochette Surprise Spoolio",
    cardDescription: "3 à 5 créations 3D et fidgets mystères inédits.",
    cardPrice: "10.00€",
    cardImage: "/images/imported/PochetteM-1.png",
    cardLink: "/pochette-surprise"
  },
];

const DEFAULT_HERO = {
  topBadgeText: "ATELIER EN ACTION (COMINES 🇫🇷) • PLA BIOSOURCÉ",
  title: "LA FOLIE DES FIDGETS SENSORIELS ⚡",
  subtitle: "Décompresser, toucher, cliquer : découvrez nos créations 3D originales faites main en France 🌱",
  buttonText: "DÉCOUVRIR LA BOUTIQUE",
  buttonLink: "/boutique",
  secondaryButtonText: "🛍️ VOIR LA BOUTIQUE",
  secondaryButtonLink: "/boutique",
  cardBadge: "🔥 PRODUIT STAR 3D",
  cardTitle: "Pack Fidget Sensory TDAH",
  cardPrice: "14.90€",
  cardTags: "Assortiment anti-stress fabriqué en PLA biosourcé.",
  cardLink: "/boutique",
  cardImage: "/images/hero_background.jpg",
  imageUrl: "/images/hero_background.jpg",
  imagePosition: "center center",
  slides: DEFAULT_SLIDES,
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
        if (!config.slides || !Array.isArray(config.slides) || config.slides.length === 0) {
          config.slides = DEFAULT_SLIDES;
        }
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

    const slidesToSave = Array.isArray(payload.slides) && payload.slides.length > 0
      ? payload.slides
      : DEFAULT_SLIDES;

    const firstSlide = slidesToSave[0] || DEFAULT_SLIDES[0];

    const configString = JSON.stringify({
      topBadgeText: payload.topBadgeText || DEFAULT_HERO.topBadgeText,
      title: firstSlide.title || payload.title || DEFAULT_HERO.title,
      subtitle: firstSlide.subtitle || payload.subtitle || "",
      buttonText: firstSlide.buttonText || payload.buttonText || DEFAULT_HERO.buttonText,
      buttonLink: firstSlide.buttonLink || payload.buttonLink || DEFAULT_HERO.buttonLink,
      secondaryButtonText: payload.secondaryButtonText || DEFAULT_HERO.secondaryButtonText,
      secondaryButtonLink: payload.secondaryButtonLink || DEFAULT_HERO.secondaryButtonLink,
      cardBadge: payload.cardBadge || DEFAULT_HERO.cardBadge,
      cardTitle: payload.cardTitle || DEFAULT_HERO.cardTitle,
      cardPrice: payload.cardPrice || DEFAULT_HERO.cardPrice,
      cardTags: payload.cardTags || DEFAULT_HERO.cardTags,
      cardLink: payload.cardLink || DEFAULT_HERO.cardLink,
      cardImage: payload.cardImage || DEFAULT_HERO.cardImage,
      imageUrl: firstSlide.image || payload.imageUrl || DEFAULT_HERO.imageUrl,
      imagePosition: payload.imagePosition || "center center",
      slides: slidesToSave
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

    console.log("[Admin Update] Configuration Hero Slider mise à jour !");

    return NextResponse.json({ success: true, message: "Configuration du Slider Hero enregistrée." });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de l'enregistrement de la configuration Hero." },
      { status: 500 }
    );
  }
}
