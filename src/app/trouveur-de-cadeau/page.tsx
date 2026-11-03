import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BUSINESS_CONFIG } from "@/lib/businessConfig";
import { getPublishedProducts } from "@/lib/serverProducts";
import TrouveurDeCadeauClient from "./TrouveurDeCadeauClient";

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS_CONFIG.siteUrl),
  title: "Trouveur de Cadeau de Noël 3D — Spoolio",
  description:
    "Trouvez le cadeau 3D idéal pour Noël en quelques clics : Secret Santa, passionnés, enfants ou déco selon votre budget. Sélection locale imprimée à Comines en PLA biosourcé.",
  alternates: {
    canonical: `${BUSINESS_CONFIG.siteUrl}/trouveur-de-cadeau`,
  },
  openGraph: {
    title: "Trouveur de Cadeau de Noël 3D — Spoolio",
    description: "Le moteur interactif de Noël pour dénicher le cadeau idéal façonné à l'atelier.",
    url: `${BUSINESS_CONFIG.siteUrl}/trouveur-de-cadeau`,
    siteName: BUSINESS_CONFIG.name,
    locale: "fr_FR",
    type: "website",
  },
};

export default async function TrouveurDeCadeauPage() {
  const products = await getPublishedProducts();

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-zinc-900 font-sans flex flex-col items-center selection:bg-[#FF5500] selection:text-white overflow-x-hidden">
      {/* Background Subtle Warm Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full"
          style={{ backgroundColor: "rgba(255, 85, 0, 0.03)", filter: "blur(120px)" }}
        />
        <div
          className="absolute top-[35%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ backgroundColor: "rgba(16, 185, 129, 0.02)", filter: "blur(120px)" }}
        />
      </div>

      <Header />

      <main className="w-full max-w-[1200px] px-4 pt-28 lg:pt-32 pb-20 relative z-10 flex flex-col items-center">
        <TrouveurDeCadeauClient products={products} />
      </main>

      <Footer />
    </div>
  );
}

