import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HolographicTiltCard from "@/components/HolographicTiltCard";
import { BUSINESS_CONFIG } from "@/lib/businessConfig";

// Dynamic import for heavy interactive configurator component
const MysteryPackConfigurator = dynamic(
  () => import("@/components/MysteryPackConfigurator"),
  {
    loading: () => (
      <div className="w-full max-w-6xl mx-auto h-[520px] rounded-3xl bg-neutral-100 border border-neutral-200 animate-pulse flex items-center justify-center text-neutral-400 font-mono text-sm">
        Chargement du configurateur Spoolio...
      </div>
    ),
  }
);

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS_CONFIG.siteUrl),
  title: "Blind Bags & Pochettes Mystères 3D — Spoolio V2",
  description:
    "Composez votre Blind Bag ou pochette mystère sur-mesure d'objets tactiles, créatures et curiosités 3D imprimées à Comines en PLA végétal biosourcé.",
  alternates: {
    canonical: `${BUSINESS_CONFIG.siteUrl}/blind-bags`,
  },
  openGraph: {
    title: "Blind Bags 3D & Pochettes Mystères — Spoolio",
    description:
      "Dosez vos objets préférés ou tentez le tirage aléatoire dans un packaging kraft soigné.",
    url: `${BUSINESS_CONFIG.siteUrl}/blind-bags`,
    siteName: BUSINESS_CONFIG.name,
    locale: "fr_FR",
    type: "website",
  },
};

export default function BlindBagsPage() {
  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-zinc-900 font-sans flex flex-col items-center selection:bg-[#FF5500] selection:text-white overflow-x-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full"
          style={{ backgroundColor: "rgba(255, 85, 0, 0.04)", filter: "blur(120px)" }}
        />
        <div
          className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ backgroundColor: "rgba(0, 240, 255, 0.04)", filter: "blur(120px)" }}
        />
      </div>

      <Header />

      <main className="w-full max-w-[1200px] px-4 pt-28 lg:pt-32 pb-12 relative z-10 flex flex-col items-center">
        {/* Hero Title & Presentation */}
        <div className="text-center max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF5500] text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <span>🎁 BLIND BAGS & POCHETTES MYSTÈRES SPOOLIO</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] mb-3">
            BLIND BAGS 3D ⚡
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 font-[family-name:var(--font-plus-jakarta)] leading-relaxed">
            Composez votre pochette surprise kraft d&apos;objets tactiles, créatures et curiosités d&apos;atelier 3D. Sélectionnez le nombre de pièces, dosez vos univers préférés ou tentez le Remplissage Aléatoire !
          </p>
        </div>

        {/* Dedicated Bento Mystery Pack Configurator Component */}
        <MysteryPackConfigurator className="w-full mb-12" />

        {/* Reassurance Badges Row */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-[#E4E4E0] text-center font-[family-name:var(--font-plus-jakarta)]">
          <HolographicTiltCard className="rounded-2xl">
            <div className="p-5 h-full rounded-2xl reassurance-card bg-white border border-[#E4E4E0] shadow-2xs flex flex-col items-center gap-2">
              <span className="text-3xl">🌱</span>
              <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
                Matière Biosourcée
              </span>
              <span className="text-[11px] text-zinc-500 leading-relaxed">
                Imprimé en PLA d&apos;origine végétale sans pétrole.
              </span>
            </div>
          </HolographicTiltCard>

          <HolographicTiltCard className="rounded-2xl">
            <div className="p-5 h-full rounded-2xl reassurance-card bg-white border border-[#E4E4E0] shadow-2xs flex flex-col items-center gap-2">
              <span className="text-3xl">⚡</span>
              <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
                Sélection Sur-Mesure
              </span>
              <span className="text-[11px] text-zinc-500 leading-relaxed">
                Dosez librement vos créatures, objets tactiles et desk setup préférés.
              </span>
            </div>
          </HolographicTiltCard>

          <HolographicTiltCard className="rounded-2xl">
            <div className="p-5 h-full rounded-2xl reassurance-card bg-white border border-[#E4E4E0] shadow-2xs flex flex-col items-center gap-2">
              <span className="text-3xl">📍</span>
              <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
                Atelier Français (59560)
              </span>
              <span className="text-[11px] text-zinc-500 leading-relaxed">
                Fabrication artisanale &amp; emballage soigné à Comines.
              </span>
            </div>
          </HolographicTiltCard>
        </div>
      </main>

      <Footer />
    </div>
  );
}
