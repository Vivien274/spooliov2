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
    badge: "ATELIER • COMINES",
    title: "Fidgets, objets sensoriels et curiosités imprimés en 3D",
    subtitle: "Conçus et fabriqués à la demande dans notre atelier à Comines.",
    buttonText: "Découvrir le catalogue",
    buttonLink: "/boutique",
    image: "/images/clicker_gallery_2.webp",
    accentColor: "#ff4f00",
    cardTitle: "Créations Spoolio",
    cardDescription: "Objets tactiles et curiosités façonnés à Comines.",
    cardPrice: "À partir de 3.00€",
    cardImage: "/images/clicker_gallery_2.webp",
    cardLink: "/boutique"
  },
  {
    id: 2,
    badge: "ART TOYS & DÉCO",
    title: "Des pièces pop qui réveillent votre bureau.",
    subtitle: "Créatures articulées, vide-poches et curiosités en petites séries.",
    buttonText: "Explorer les créations",
    buttonLink: "/art-toys",
    image: "/images/kurb-art-toy.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Art Toys & Curiosités",
    cardDescription: "Créatures articulées et pièces de collection d'atelier.",
    cardPrice: "À partir de 6.00€",
    cardImage: "/images/kurb-art-toy.jpg",
    cardLink: "/art-toys"
  },
  {
    id: 3,
    badge: "COFFRETS NOËL 2026",
    title: "Noël, avec du caractère.",
    subtitle: "Coffrets prêts à offrir et idées Secret Santa dès 12 €.",
    buttonText: "Voir les coffrets",
    buttonLink: "/noel",
    image: "/images/clicker_gallery_0.webp",
    accentColor: "#ff4f00",
    cardTitle: "Coffrets de Noël",
    cardDescription: "Packs exclusifs d'atelier dès 12 €.",
    cardPrice: "Dès 12.00€",
    cardImage: "/images/clicker_gallery_0.webp",
    cardLink: "/noel"
  },
  {
    id: 4,
    badge: "BLIND BAGS",
    title: "L'effet surprise en pochette scellée.",
    subtitle: "Composez votre Blind Bag selon vos envies : tactile, pop ou curiosité.",
    buttonText: "Composer mon Blind Bag",
    buttonLink: "/blind-bags",
    image: "/images/blind-bag-home.webp",
    accentColor: "#005cff",
    cardTitle: "Blind Bags Spoolio",
    cardDescription: "Assortiments surprises préparés à l'atelier.",
    cardPrice: "À partir de 10.00€",
    cardImage: "/images/blind-bag-home.webp",
    cardLink: "/blind-bags"
  }
];

const DEFAULT_HERO = {
  topBadgeText: "ATELIER D'IMPRESSION 3D • COMINES (59)",
  title: "Fidgets sensoriels et objets imprimés en 3D fabriqués en France",
  subtitle: "Conçus et imprimés à la demande dans notre atelier avec un polymère végétal biosourcé. Zéro surstock, du caractère et des finitions soignées.",
  buttonText: "DÉCOUVRIR LE CATALOGUE",
  buttonLink: "/boutique",
  secondaryButtonText: "BOUSSOLE SENSORIELLE",
  secondaryButtonLink: "/boussole-sensorielle",
  cardBadge: "Made in France",
  cardTitle: "Créations Spoolio 3D",
  cardPrice: "À partir de 3.00€",
  cardTags: "Objets tactiles et accessoires façonnés sur mesure à Comines.",
  cardLink: "/boutique",
  cardImage: "/images/clicker_gallery_2.jpg",
  imageUrl: "/images/clicker_gallery_2.jpg",
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
