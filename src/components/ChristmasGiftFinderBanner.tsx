"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export default function ChristmasGiftFinderBanner() {
  return (
    <section className="w-full max-w-[1200px] px-4 py-6 sm:py-10 relative z-10 font-[family-name:var(--font-plus-jakarta)]">
      <div className="rounded-2xl sm:rounded-3xl bg-[#FAF9F6] border border-[#E4E4E0] p-6 sm:p-10 lg:p-12 relative overflow-hidden transition-all duration-300 hover:border-zinc-300 hover:shadow-sm">
        
        {/* Blobs discrets orange en arrière-plan */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div
            className="absolute top-[-25%] right-[-10%] w-[380px] h-[380px] rounded-full"
            style={{
              backgroundColor: "rgba(255, 85, 0, 0.06)",
              filter: "blur(85px)",
            }}
          />
          <div
            className="absolute bottom-[-30%] left-[-10%] w-[320px] h-[320px] rounded-full"
            style={{
              backgroundColor: "rgba(255, 85, 0, 0.04)",
              filter: "blur(90px)",
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* COLONNE GAUCHE : ÉDITORIAL & DÉMARCHE D'ATELIER */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            
            {/* Indexation Spoolio */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5500]">
                05 // SÉLECTION NOËL
              </span>
              <span className="w-8 h-[1px] bg-zinc-300" />
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                GUIDE INTERACTIF
              </span>
            </div>

            {/* Titre Principal Editorial */}
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] leading-[1.02]">
                Trouver le bon cadeau, sans tourner en rond.
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 mt-3 max-w-xl leading-relaxed">
                Secret Santa à moins de 10 €, créature articulée pour un passionné ou curiosité
                tactile pour le bureau : répondez à 4 questions simples pour obtenir une sélection
                sur-mesure parmi nos pièces fabriquées à Comines.
              </p>
            </div>

            {/* Déroulé visuel épuré (3 étapes claires) */}
            <div className="grid grid-cols-3 gap-3 pt-1 border-t border-zinc-200/80">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-mono font-bold text-zinc-400">01</span>
                <span className="text-xs font-bold text-zinc-900 leading-tight">Le profil</span>
                <span className="text-[11px] text-zinc-500">Pour qui vous offrez</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-zinc-200 pl-3">
                <span className="text-[11px] font-mono font-bold text-zinc-400">02</span>
                <span className="text-xs font-bold text-zinc-900 leading-tight">Le budget</span>
                <span className="text-[11px] text-zinc-500">De 5 € à 50 €+</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-zinc-200 pl-3">
                <span className="text-[11px] font-mono font-bold text-[#FF5500]">03</span>
                <span className="text-xs font-bold text-zinc-900 leading-tight">La sélection</span>
                <span className="text-[11px] text-zinc-500">Immédiate &amp; locale</span>
              </div>
            </div>

            {/* Bouton d'Action & Mention */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
              <Link
                href="/trouveur-de-cadeau"
                className="py-3.5 px-6 rounded-xl bg-zinc-950 hover:bg-[#FF5500] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer shadow-xs"
              >
                <span>Démarrer le guide cadeaux</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <span className="text-xs text-zinc-500">
                Moins d&apos;une minute • 100% gratuit
              </span>
            </div>

          </div>

          {/* COLONNE DROITE : VISUEL D'ATELIER NATUREL */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[360px] aspect-square rounded-2xl bg-white border border-[#E4E4E0] p-4 flex items-center justify-center shadow-xs">
              <Image
                src="/images/blind-bag-home.webp"
                alt="Sélection d'objets 3D Spoolio pour Noël"
                width={400}
                height={400}
                className="max-h-full w-auto object-contain select-none"
                priority
              />

              {/* Étiquette d'Atelier discrète */}
              <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-sm border border-zinc-200/80 shadow-2xs flex items-center justify-between text-zinc-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span className="text-xs font-medium text-zinc-900">
                    Idées d&apos;atelier dès 3,00 €
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  Comines (59)
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
