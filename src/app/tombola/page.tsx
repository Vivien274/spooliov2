import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Dynamic import for client interactive component
const TombolaConfigurator = dynamic(
  () => import("@/components/TombolaConfigurator"),
  {
    loading: () => (
      <div className="w-full max-w-6xl mx-auto h-[520px] rounded-3xl bg-neutral-900/40 border border-neutral-800 animate-pulse flex items-center justify-center text-neutral-400 font-mono text-sm">
        Chargement de la Tombola Spoolio...
      </div>
    ),
  }
);

import { getPageSeoMetadata } from "@/lib/seoPages";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("tombola");
}

export default function TombolaPage() {
  return (
    <div className="relative min-h-screen bg-spoolio-bg text-white font-sans flex flex-col items-center selection:bg-[#ff4f00] selection:text-black overflow-x-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ backgroundColor: "#ff4f00", filter: "blur(140px)" }}
        />
        <div
          className="absolute top-[40%] right-[-10%] w-[550px] h-[550px] rounded-full opacity-15"
          style={{ backgroundColor: "#00F0FF", filter: "blur(140px)" }}
        />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="w-full max-w-[1200px] px-4 pt-28 lg:pt-32 pb-8 relative z-10 flex flex-col items-center">
        {/* Page Hero Banner */}
        <div className="text-center max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-[#ff4f00] uppercase tracking-wider mb-4 shadow-lg backdrop-blur-md">
            <span>🎉</span>
            <span>Jeu Concours Spoolio</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-none mb-4">
            La Tombola <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f00] via-[#FF8800] to-[#00F0FF]">Spoolio</span> 🎟️
          </h1>

          <p className="text-base sm:text-lg text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Choisis tes numéros fétiches dans la grille de 1 à 40. Chaque ticket acheté s&apos;ajoute directement à ton panier et augmente tes chances de décrocher le grand lot !
          </p>
        </div>

        {/* Tombola Configurator Interactive Component */}
        <TombolaConfigurator />
      </main>

      {/* Footer */}
      <Footer className="w-full relative z-10 border-t border-white/10 mt-20" />
    </div>
  );
}
