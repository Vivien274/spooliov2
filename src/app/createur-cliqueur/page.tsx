import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import fs from "fs";
import path from "path";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPageSeoMetadata } from "@/lib/seoPages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Dynamic import for heavy interactive configurator component
const ClickerConfiguratorClient = nextDynamic(
  () => import("@/components/ClickerConfiguratorClient"),
  {
    loading: () => (
      <div className="w-full max-w-7xl mx-auto h-[560px] rounded-2xl bg-white border border-[#E4E4E0] shadow-xs animate-pulse flex flex-col items-center justify-center text-[#707070] font-mono text-xs gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] animate-ping" />
        <span>INITIALISATION DU STUDIO CLICKER 3D...</span>
      </div>
    ),
  }
);

export async function generateMetadata(): Promise<Metadata> {
  const base = getPageSeoMetadata("createur-cliqueur");
  return {
    ...base,
    title: "Clicker Studio — Compose ton clicker 3D | Spoolio",
    description: "Composez votre fidget mécanique sur-mesure dans le Clicker Studio Spoolio : formats, couleurs de boîtier, switches et gravures personnalisées.",
  };
}

export default function CreateurCliqueurPage() {
  let galleryItems: any[] = [];
  try {
    const galleryFile = path.join(process.cwd(), "src/data/clicker_gallery.json");
    if (fs.existsSync(galleryFile)) {
      galleryItems = JSON.parse(fs.readFileSync(galleryFile, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading clicker_gallery.json on server:", e);
  }

  return (
    <div className="clicker-studio-page relative min-h-screen bg-[#FAF9F6] text-[#121212] font-sans flex flex-col items-center selection:bg-[#FF5500] selection:text-white overflow-x-hidden">
      {/* Subtle Warm Studio Background Glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ backgroundColor: "rgba(255, 85, 0, 0.04)", filter: "blur(140px)" }}
        />
        <div
          className="absolute top-[40%] left-[-10%] w-[450px] h-[450px] rounded-full"
          style={{ backgroundColor: "rgba(0, 160, 255, 0.02)", filter: "blur(140px)" }}
        />
      </div>

      {/* Light Header */}
      <Header isDark={false} />

      {/* Main Studio Area */}
      <main className="w-full max-w-7xl px-4 sm:px-6 pt-24 lg:pt-28 pb-16 relative z-10 flex flex-col items-center">
        
        {/* Editorial Studio Header */}
        <div className="w-full text-center max-w-3xl mb-8 sm:mb-10 space-y-2.5">
          {/* Over-title / Studio Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E4E4E0] text-[#555555] text-[11px] font-mono tracking-widest uppercase shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
            <span>SPOOLIO / CLICKER STUDIO</span>
          </div>

          {/* Monumental Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#121212]">
            Compose ton clicker.
          </h1>

          {/* Editorial Subtitle */}
          <p className="text-xs sm:text-sm font-mono text-[#666666] tracking-tight max-w-xl mx-auto">
            Une forme. Des couleurs. Une sensation. À toi de jouer.
          </p>
        </div>

        {/* Dedicated Clicker Configurator Client in Light Theme */}
        <ClickerConfiguratorClient className="w-full mb-16" />

        {/* Technical Reassurance Specs in Light Theme */}
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-3 pt-10 border-t border-[#E4E4E0] text-left font-mono">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4E4E0] shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#FF5500]">01 // SENSATION</span>
              <span className="text-[10px] text-[#888888]">50M CLICS</span>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase text-[#121212] mb-1">
                SWITCHES MÉCANIQUES RÉELS
              </h2>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Switches clicky, tactiles ou linéaires certifiés haute longévité. Chaque touche offre un retour physique franc et dosé.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4E4E0] shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#FF5500]">02 // ATELIER</span>
              <span className="text-[10px] text-[#888888]">COMINES • NORD</span>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase text-[#121212] mb-1">
                FABRICATION ARTISANALE 3D
              </h2>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Boîtier imprimé en 3D en PLA biosourcé végétal dans notre atelier français. Finitions manuelles et inspection unitaire.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4E4E0] shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#FF5500]">03 // USAGE</span>
              <span className="text-[10px] text-[#888888]">1K → 9K</span>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase text-[#121212] mb-1">
                NOMADE OU BUREAU
              </h2>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Du mono-touche discret au pad 9 touches. Livré avec chaînette inox, mousqueton, dragonne ou patins pour usage bureau.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Light Footer */}
      <Footer isDark={false} />
    </div>
  );
}
