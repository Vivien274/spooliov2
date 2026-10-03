"use client";

import Image from "next/image";
import { Sparkles, ArrowDown, Compass } from "lucide-react";

interface BoutiqueEditorialHeroProps {
  onExploreClick: () => void;
  onUniversesClick: () => void;
}

export default function BoutiqueEditorialHero({
  onExploreClick,
  onUniversesClick,
}: BoutiqueEditorialHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 border border-orange-100/80 shadow-sm p-6 sm:p-8 lg:p-10 mb-8 font-sans">
      {/* Subtle 3D print layer texture background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #000, #000 1px, transparent 1px, transparent 6px)",
        }}
        aria-hidden="true"
      />

      {/* Decorative ambient color spots */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-300/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Editorial message & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-4 text-left">
          {/* Atelier badge */}
          <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-orange-200/90 shadow-2xs text-[11px] font-bold text-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span>Atelier Spoolio • Fabrication 3D à Comines (59)</span>
            <span className="text-zinc-300 hidden sm:inline" aria-hidden="true">•</span>
            <span className="text-[#ff4f00] font-black hidden sm:inline">100% PLA Végétal</span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-black tracking-tight text-zinc-950 font-outfit leading-[1.15]">
            Des objets imprimés pour{" "}
            <span className="text-[#ff4f00]">jouer</span>,{" "}
            <span className="text-zinc-900">décorer</span> et{" "}
            <span className="relative inline-block text-[#ff4f00]">
              <span>tripoter</span>
              <svg
                className="absolute -bottom-1.5 left-0 w-full h-2 text-[#ff4f00]/40 -z-10"
                viewBox="0 0 100 12"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M1 9C20 3 40 11 60 5C80 -1 95 8 99 6"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h1>

          {/* Subtitle / Atelier Story */}
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans max-w-xl">
            Chaque pièce est imaginée, prototypée et imprimée couche par couche dans notre atelier du Nord
            en polymère biosourcé (issu d'amidon de maïs). Zéro surstock, que du plaisir sensoriel,
            des finitions soignées et une bonne dose de bonne humeur pour votre quotidien.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-950 hover:bg-[#ff4f00] text-white text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer no-invert keep-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ff4f00]"
            >
              <span>Explorer le catalogue</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onUniversesClick}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/90 hover:bg-white text-zinc-800 hover:text-zinc-950 text-xs font-bold border border-zinc-200 hover:border-zinc-300 transition-all duration-200 shadow-2xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400"
            >
              <Compass className="w-3.5 h-3.5 text-[#ff4f00]" />
              <span>Voir les 4 univers</span>
            </button>
          </div>
        </div>

        {/* Right Column: Compact visual composition */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[360px] aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden border border-orange-200/80 bg-white shadow-md group">
            {/* Real photo from catalog */}
            <Image
              src="/images/clicker_gallery_2.jpg"
              alt="Créations tactiles imprimées en 3D dans l'atelier Spoolio"
              fill
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 360px"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            />

            {/* Subtle gradient overlay to ensure badge legibility */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-zinc-950/20 pointer-events-none"
              aria-hidden="true"
            />

            {/* Top-right floating 3D print layer badge */}
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-white shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f00]" aria-hidden="true" />
                <span>Layer 0.2mm • Fini satiné</span>
              </span>
            </div>

            {/* Bottom-left floating caption */}
            <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-[#ff4f00] font-bold uppercase tracking-wider">
                  Tactile & Décompression
                </span>
                <span className="text-xs font-extrabold text-white font-outfit drop-shadow-xs">
                  Clickers & Objets Sensoriels
                </span>
              </div>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-bold shadow-xs">
                <Sparkles className="w-3 h-3" />
                <span>Fait main</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
