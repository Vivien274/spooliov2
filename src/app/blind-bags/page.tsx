import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BUSINESS_CONFIG } from "@/lib/businessConfig";
import { Sparkles, Leaf, MapPin, HelpCircle } from "lucide-react";

// Dynamic import for interactive configurator component
const MysteryPackConfigurator = dynamic(
  () => import("@/components/MysteryPackConfigurator"),
  {
    loading: () => (
      <div className="w-full max-w-6xl mx-auto h-[540px] rounded-3xl bg-white border border-[#E4E4E0] animate-pulse flex items-center justify-center text-zinc-400 font-mono text-sm">
        Chargement du configurateur Spoolio...
      </div>
    ),
  }
);

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS_CONFIG.siteUrl),
  title: "Blind Bags & Pochettes Mystères 3D — Spoolio",
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
      {/* Background Subtle Warm Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full"
          style={{ backgroundColor: "rgba(255, 85, 0, 0.03)", filter: "blur(120px)" }}
        />
        <div
          className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ backgroundColor: "rgba(255, 85, 0, 0.02)", filter: "blur(120px)" }}
        />
      </div>

      <Header />

      <main className="w-full max-w-[1200px] px-4 pt-28 lg:pt-32 pb-16 relative z-10 flex flex-col items-center">
        {/* Hero Title & Presentation */}
        <div className="text-center max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF5500] text-xs font-mono font-bold uppercase tracking-wider mb-3.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SÉLECTION ATELIER • SCELLÉE À LA COMMANDE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] mb-4">
            BLIND BAGS 3D
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 font-[family-name:var(--font-plus-jakarta)] leading-relaxed max-w-xl mx-auto">
            Composez votre pochette surprise kraft d&apos;objets tactiles, créatures et curiosités d&apos;atelier 3D.
            Sélectionnez votre format, dosez vos univers préférés ou tentez le tirage aléatoire !
          </p>
        </div>

        {/* Dedicated Mystery Pack Configurator */}
        <MysteryPackConfigurator className="w-full mb-16" />

        {/* Reassurance Cards Row */}
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-[#E4E4E0] text-center font-[family-name:var(--font-plus-jakarta)] mb-12">
          <div className="p-6 rounded-2xl bg-white border border-[#E4E4E0] shadow-sm flex flex-col items-center gap-2.5 transition-transform hover:-translate-y-0.5">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#FF5500] border border-orange-200 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-zinc-950 uppercase tracking-wide">
              Matière Biosourcée
            </span>
            <span className="text-xs text-zinc-600 leading-relaxed">
              Imprimé à partir de PLA d&apos;origine végétale issu d&apos;amidon de maïs, 100% sans pétrole.
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E4E4E0] shadow-sm flex flex-col items-center gap-2.5 transition-transform hover:-translate-y-0.5">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#FF5500] border border-orange-200 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-zinc-950 uppercase tracking-wide">
              Sélection Sur-Mesure
            </span>
            <span className="text-xs text-zinc-600 leading-relaxed">
              Dosez librement vos créatures, mécanismes tactiles et accessoires selon vos envies.
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E4E4E0] shadow-sm flex flex-col items-center gap-2.5 transition-transform hover:-translate-y-0.5">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#FF5500] border border-orange-200 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-zinc-950 uppercase tracking-wide">
              Atelier Français (59560)
            </span>
            <span className="text-xs text-zinc-600 leading-relaxed">
              Fabrication artisanale &amp; conditionnement soigné dans notre atelier à Comines.
            </span>
          </div>
        </div>

        {/* How it works info box */}
        <div className="w-full max-w-4xl bg-white border border-[#E4E4E0] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-[#FF5500]" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-950 uppercase tracking-wide font-[family-name:var(--font-antonio)]">
              Comment fonctionnent les Blind Bags Spoolio ?
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Chaque sachet est scellé individuellement à la main dans du papier kraft opaque recyclable. Les objets à l&apos;intérieur sont sélectionnés avec soin parmi nos collections permanentes et nos séries limitées d&apos;atelier selon les proportions que vous avez choisies (ou au hasard complet). Couleurs, variantes et finitions restent une surprise totale jusqu&apos;à l&apos;ouverture !
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
