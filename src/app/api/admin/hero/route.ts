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
    badge: "ATELIER D'IMPRESSION 3D • COMINES (59)",
    title: "Fidgets sensoriels et objets imprimés en 3D fabriqués en France",
    subtitle: "Conçus et imprimés à la demande dans notre atelier avec un polymère végétal biosourcé. Zéro surstock, du caractère et des finitions soignées.",
    buttonText: "DÉCOUVRIR LE CATALOGUE",
    buttonLink: "/boutique",
    image: "/images/clicker_gallery_2.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Créations Spoolio 3D",
    cardDescription: "Objets tactiles et accessoires façonnés sur mesure à Comines.",
    cardPrice: "À partir de 3.00€",
    cardImage: "/images/clicker_gallery_2.jpg",
    cardLink: "/boutique"
  },
  {
    id: 2,
    badge: "PRÉCOMMANDES • ÉDITION LIMITÉE",
    title: "Le calendrier de l'Avent 3D Spoolio",
    subtitle: "24 créations exclusives imprimées en 3D dans notre atelier. Édition limitée à 50 exemplaires, disponible au tarif de 50€ !",
    buttonText: "RÉSERVER (50€)",
    buttonLink: "/calendrier-avent",
    image: "/images/calendrier-avent-hero.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Calendrier de l'Avent 3D",
    cardDescription: "24 surprises inédites d'atelier à découvrir chaque jour.",
    cardPrice: "50€ • Édition Limitée (50 ex.)",
    cardImage: "/images/calendrier-avent-hero.jpg",
    cardLink: "/calendrier-avent"
  },
  {
    id: 3,
    badge: "JEUX DE SOCIÉTÉ & DE PLATEAU",
    title: "Accessoires et créations pour jeux de société",
    subtitle: "Tours de dés sculptées, inserts précis et accessoires pensés par et pour les passionnés de jeu de plateau.",
    buttonText: "VOIR LES ACCESSOIRES JEUX",
    buttonLink: "/jeux-de-societe",
    image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    accentColor: "#09090b",
    cardTitle: "Tour de dés sculptée haute définition",
    cardDescription: "L'accessoire de table indispensable pour jeux de rôle et jeux de société.",
    cardPrice: "14.90€",
    cardImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    cardLink: "/boutique"
  },
  {
    id: 4,
    badge: "BUREAU & ACCESSOIRES SENSORIELS",
    title: "Cliqueurs mécaniques & desk toys",
    subtitle: "Concevez votre cliqueur mécanique sur-mesure : switches authentiques, touches personnalisées et sensations tactiles uniques.",
    buttonText: "CONCEVOIR MON CLIQUEUR",
    buttonLink: "/createur-cliqueur",
    image: "/images/imported/PochetteM-1.png",
    accentColor: "#ff4f00",
    cardTitle: "Atelier Cliqueur Mécanique",
    cardDescription: "Touches interchangeables et switches tactiles premiums.",
    cardPrice: "À partir de 3.00€",
    cardImage: "/images/imported/PochetteM-1.png",
    cardLink: "/createur-cliqueur"
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
