import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MysteryPackConfigurator from "@/components/MysteryPackConfigurator";

export const metadata: Metadata = {
  title: "Pochette Surprise Spoolio 3D | Configurateur Sur-Mesure",
  description: "Configure ta pochette surprise d'objets mystères imprimés en 3D PLA biosourcé à Comines !",
};

export default function PochetteSurprisePage() {
  return (
    <div className="relative min-h-screen bg-[#09090b] text-white font-sans flex flex-col items-center selection:bg-[#FF5500] selection:text-black overflow-x-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full"
          style={{ backgroundColor: "rgba(255, 85, 0, 0.08)", filter: "blur(120px)" }}
        />
        <div
          className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ backgroundColor: "rgba(0, 240, 255, 0.08)", filter: "blur(120px)" }}
        />
      </div>

      {/* Header */}
      <Header className="relative h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full no-invert" />

      {/* Main Content Area */}
      <main className="w-full max-w-[1200px] px-4 py-8 relative z-10 flex flex-col items-center">
        {/* Breadcrumb Navigation */}
        <div className="w-full flex items-center gap-2 text-xs font-mono text-neutral-400 mb-6 self-start">
          <Link href="/" className="hover:text-white transition-colors">
            Accueil
          </Link>
          <span>/</span>
          <Link href="/boutique" className="hover:text-white transition-colors">
            Boutique
          </Link>
          <span>/</span>
          <span className="text-[#FF5500] font-bold">Pochette Surprise Spoolio</span>
        </div>

        {/* Hero Title & Presentation Banner */}
        <div className="text-center max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <span>🎁 CONCEPT SPOOLIO V2</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white font-[family-name:var(--font-antonio)] mb-3">
            POCHETTE SURPRISE 3D ⚡
          </h1>
          <p className="text-sm sm:text-base text-neutral-300 font-[family-name:var(--font-plus-jakarta)] leading-relaxed">
            Compose ton pack sur-mesure d'objets mystères sensoriels et ludiques 3D. Sélectionne le nombre d'objets, dose tes univers préférés ou tente le <strong className="text-[#FF5500]">Remplissage Aléatoire</strong> !
          </p>
        </div>

        {/* Dedicated Bento Mystery Pack Configurator Component */}
        <MysteryPackConfigurator className="w-full mb-12" />

        {/* Reassurance Badges Row */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-neutral-800 text-center font-[family-name:var(--font-plus-jakarta)]">
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              Matière Biosourcée
            </span>
            <span className="text-[11px] text-neutral-400">
              Imprimé en PLA à base d'amidon de maïs sans pétrole.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              Sélection Sur-Mesure
            </span>
            <span className="text-[11px] text-neutral-400">
              Dose librement tes figurines, fidgets et gadgets préférés.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col items-center gap-2">
            <span className="text-2xl">📍</span>
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              Atelier Français (59560)
            </span>
            <span className="text-[11px] text-neutral-400">
              Fabrication artisanale & expédition soignée depuis Comines.
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
