import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NoelClient from "./NoelClient";
import { getAllPacks } from "@/lib/serverPacks";
import { getPublishedProducts } from "@/lib/serverProducts";
import { buildPageMetadata } from "@/lib/seoMetadata";
import JsonLdScript from "@/components/JsonLdScript";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Noël 2026, mais pas comme les autres — Coffrets & Curiosités | Spoolio",
    description:
      "Des cadeaux avec du caractère. Découvrez nos 3 coffrets exclusifs de Noël et nos curiosités tactiles fabriquées dans notre atelier à Comines.",
    path: "/noel",
    ogImage: "/images/clicker_gallery_2.jpg",
  });
}

export default async function NoelPage() {
  const packs = await getAllPacks(false);
  const allProducts = await getPublishedProducts();

  // Filter budget tiers from real catalogue products
  const productsUnder10 = allProducts
    .filter((p) => {
      const price = parseFloat(p.price);
      return !isNaN(price) && price > 0 && price < 10;
    })
    .slice(0, 8);

  const products10To20 = allProducts
    .filter((p) => {
      const price = parseFloat(p.price);
      return !isNaN(price) && price >= 10 && price <= 20;
    })
    .slice(0, 8);

  const productsAbove20 = allProducts
    .filter((p) => {
      const price = parseFloat(p.price);
      return !isNaN(price) && price > 20;
    })
    .slice(0, 8);

  // Schema.org Structured Data for Christmas Campaign & Packs
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Campagne Noël 2026 Spoolio — Coffrets & Curiosités",
    description:
      "Des cadeaux avec du caractère. Des curiosités fabriquées dans notre atelier à Comines.",
    url: "https://spoolio.fr/noel",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: packs.map((pack, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Product",
          name: pack.name,
          description: pack.shortDescription || pack.tagline,
          image: pack.image,
          offers: {
            "@type": "Offer",
            price: pack.price,
            priceCurrency: "EUR",
            availability: pack.isAvailable
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        },
      })),
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#121212] font-[family-name:var(--font-plus-jakarta)] selection:bg-[#FF5500] selection:text-white flex flex-col justify-between">
      <JsonLdScript data={jsonLd} />
      <Header />
      <main className="flex-1 w-full overflow-hidden">
        <NoelClient
          packs={packs}
          productsUnder10={productsUnder10}
          products10To20={products10To20}
          productsAbove20={productsAbove20}
        />
      </main>
      <Footer />
    </div>
  );
}

