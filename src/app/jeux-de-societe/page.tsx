import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JeuxDeSocieteClient from "./JeuxDeSocieteClient";
import { getPageSeoMetadata } from "@/lib/seoPages";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("jeux-de-societe");
}

export default async function JeuxDeSocietePage() {
  // Fetch STRICTLY products with the "jeuxsociete" tag or category
  let gameProducts: any[] = [];
  try {
    gameProducts = await prisma.product.findMany({
      where: {
        status: "publish",
        OR: [
          {
            categories: {
              some: {
                name: {
                  contains: "jeuxsociete",
                  mode: "insensitive",
                },
              },
            },
          },
          {
            attributes: {
              contains: "jeuxsociete",
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        images: true,
        categories: true,
      },
      orderBy: {
        id: "desc",
      },
    });
  } catch (e) {
    console.error("Error fetching board game accessories:", e);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://spoolio.fr/jeux-de-societe#webpage",
        "url": "https://spoolio.fr/jeux-de-societe",
        "name": "Jeux de Société & App Enjeu 🎲 | Accessoires 3D & Soirées Jeux Spoolio",
        "description": "Boostez vos soirées jeux de société avec nos accessoires 3D (tours à dés, pinces à cartes, compteurs) et découvrez Enjeu, l'application compagnon gratuite de calcul de score et paris amicaux.",
        "publisher": {
          "@type": "Organization",
          "name": "Spoolio",
          "url": "https://spoolio.fr"
        }
      },
      {
        "@type": "SoftwareApplication",
        "name": "Enjeu",
        "operatingSystem": "Android",
        "applicationCategory": "GameApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "EUR"
        },
        "description": "L'application compagnon 100% gratuite et sans pub pour les jeux de société : calculs de scores simplifiés, statistiques individuelles et paris amicaux."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col selection:bg-[#ff4f00] selection:text-white font-sans overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1 w-full pt-28 sm:pt-36 lg:pt-40 pb-16">
        <JeuxDeSocieteClient initialProducts={gameProducts} />
      </main>
      <Footer />
    </div>
  );
}
