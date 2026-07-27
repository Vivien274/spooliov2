import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClickerGalleryClient from "@/components/ClickerGalleryClient";

// Dynamic import for heavy interactive configurator component
const ClickerConfiguratorClient = dynamic(
  () => import("@/components/ClickerConfiguratorClient"),
  {
    loading: () => (
      <div className="w-full max-w-6xl mx-auto h-[520px] rounded-3xl bg-neutral-900/40 border border-neutral-800 animate-pulse flex items-center justify-center text-neutral-400 font-mono text-sm">
        Chargement du Studio Clicker Spoolio 3D...
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "Créateur de Clicker Sur-Mesure | Spoolio 3D",
  description:
    "Créez et personnalisez votre clicker mécanique 3D sur-mesure : forme, switchs, couleurs des touches et attache porte-clés. Fabriqué en PLA biosourcé à Comines !",
  openGraph: {
    title: "Créateur de Clicker Sur-Mesure | Spoolio 3D",
    description:
      "Créez et personnalisez votre clicker mécanique 3D sur-mesure : forme, switchs, couleurs des touches et attache porte-clés. Fabriqué en PLA biosourcé à Comines !",
    url: "https://spoolio.fr/createur-cliqueur",
    siteName: "Spoolio",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Créateur de Clicker Sur-Mesure | Spoolio 3D",
    description:
      "Créez et personnalisez votre clicker mécanique 3D sur-mesure : forme, switchs, couleurs des touches et attache porte-clés. Fabriqué en PLA biosourcé à Comines !",
  },
};

export default function CreateurCliqueurPage() {
  return (
    <div className="relative min-h-screen bg-spoolio-bg text-white font-sans flex flex-col items-center selection:bg-[#FF5500] selection:text-black overflow-x-hidden">
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
      <Header className="relative h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full" />

      {/* Main Content Area */}
      <main className="w-full max-w-[1200px] px-4 py-8 relative z-10 flex flex-col items-center">
        {/* Hero Title & Presentation Banner */}
        <div className="text-center max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700 text-neutral-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <span>⌨️ STUDIO Fidget Mécanique</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white font-[family-name:var(--font-antonio)] mb-3">
            CRÉATEUR DE CLICKER ⚡
          </h1>
          <p className="text-sm sm:text-base text-gray-300 font-[family-name:var(--font-plus-jakarta)] leading-relaxed">
            Composez votre fidget mécanique unique : choisissez la forme, le nombre de touches, le type de switch, la couleur du boîtier et personnalisez chaque touche à l'unité.
          </p>
        </div>

        {/* Dedicated Clicker Configurator Client */}
        <ClickerConfiguratorClient className="w-full mb-12" />

        {/* Dynamic Photo Gallery of Real Creations */}
        <ClickerGalleryClient />

        {/* Reassurance Badges Row */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-neutral-800 text-center font-[family-name:var(--font-plus-jakarta)]">
          <div className="p-4 rounded-2xl reassurance-card bg-neutral-900/60 border border-neutral-800 shadow-sm flex flex-col items-center gap-2">
            <span className="text-2xl">🎹</span>
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              Vrais Switchs Mécaniques
            </span>
            <span className="text-[11px] text-gray-400">
              Chaque touche intègre un switch mécanique haute précision au clic satisfaisant.
            </span>
          </div>

          <div className="p-4 rounded-2xl reassurance-card bg-neutral-900/60 border border-neutral-800 shadow-sm flex flex-col items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              Boîtier PLA Biosourcé
            </span>
            <span className="text-[11px] text-gray-400">
              Imprimé en 3D à Comines dans du plastique écologique sans pétrole.
            </span>
          </div>

          <div className="p-4 rounded-2xl reassurance-card bg-neutral-900/60 border border-neutral-800 shadow-sm flex flex-col items-center gap-2">
            <span className="text-2xl">🔗</span>
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              Porte-Clés ou Bureau
            </span>
            <span className="text-[11px] text-gray-400">
              Livré avec ou sans attache inox pour l'emporter partout avec vous.
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
