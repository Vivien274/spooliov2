"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass, Sparkles, CheckCircle2, PackageCheck, LayoutGrid, Square, Palette } from "lucide-react";

export default function HomeBentoGrid() {
  const [selectedShape, setSelectedShape] = useState<"solo" | "carre" | "textures">("carre");

  const shapeData = {
    solo: {
      name: "1 Touche Solo",
      tag: "Poche & Porte-clés",
      desc: "Ultra-compact avec chaînette ou anneau, pour pianoter discrètement partout.",
      icon: <Square className="w-4 h-4 text-[#FF5500]" />,
    },
    carre: {
      name: "4 Touches Carré",
      tag: "Best-Seller Desk",
      desc: "Format 2x2 iconique, parfait pour le rythme à deux ou quatre doigts au bureau.",
      icon: <LayoutGrid className="w-4 h-4 text-[#FF5500]" />,
    },
    textures: {
      name: "Touches & Textures",
      tag: "Lego, Gruyère...",
      desc: "13 teintes au choix, tenons brique, alvéoles ou lettres gravées à l'unité.",
      icon: <Palette className="w-4 h-4 text-[#FF5500]" />,
    },
  };

  return (
    <section className="w-full max-w-[1200px] px-4 py-6 sm:py-8 md:py-12 relative z-10 font-sans">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#FF5500] mb-1.5 sm:mb-2 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
            <span>PORTES D'ENTRÉE // EXPÉRIENCE ATELIER</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-950 uppercase tracking-tight">
            Trois manières d’entrer dans l’univers.
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md font-mono">
          Diagnostic sensoriel, studio sur mesure ou tirage surprise : choisissez votre point de départ.
        </p>
      </div>

      {/* Bento 3 Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        {/* Block 1: Focus TDAH & Boussole Sensorielle (6 cols) */}
        <div className="md:col-span-6 relative p-5 sm:p-7 md:p-9 rounded-3xl bg-white border border-neutral-200 hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl group">
          {/* Subtle Radar Background SVG Graphic */}
          <div className="absolute top-0 right-0 w-60 h-60 sm:w-80 sm:h-80 opacity-20 pointer-events-none -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 group-hover:scale-105 group-hover:opacity-35 transition-all duration-700 ease-out">
            <svg viewBox="0 0 200 200" className="w-full h-full stroke-neutral-400" fill="none">
              <circle cx="100" cy="100" r="90" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="65" />
              <circle cx="100" cy="100" r="40" strokeDasharray="2 2" />
              <circle cx="100" cy="100" r="15" />
              <line x1="100" y1="5" x2="100" y2="195" strokeWidth="0.8" />
              <line x1="5" y1="100" x2="195" y2="100" strokeWidth="0.8" />
              <line x1="30" y1="30" x2="170" y2="170" strokeWidth="0.5" strokeDasharray="4 4" />
            </svg>
          </div>

          <div className="relative z-10 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200">
              <Compass className="w-3.5 h-3.5 text-[#FF5500] animate-spin-slow" />
              <span className="font-mono text-[10px] font-bold text-neutral-800 uppercase tracking-widest">
                DIAGNOSTIC SENSORIEL // 60 SEC
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-950 leading-tight tracking-tight uppercase">
              Besoin de focus ? Diagnostiquez votre stimulation en 1 min.
            </h3>

            {/* Description masquée sur mobile pour compacter la hauteur */}
            <p className="hidden sm:block text-sm text-neutral-600 leading-relaxed font-normal max-w-lg">
              Stress au bureau, TDAH ou simple besoin d'occupation kinesthésique ? Notre algorithme d'atelier identifie l'interaction tactile précise (clic franc, roulement silencieux, texture rugueuse) adaptée à votre profil.
            </p>

            {/* Micro diagnostic tags */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 sm:pt-2">
              <div className="p-2 sm:p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] font-mono text-neutral-700 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                <span>Audit rapide</span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] font-mono text-neutral-700 flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                <span>Matière & Switch</span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] font-mono text-neutral-700 flex items-center gap-1.5 col-span-2 sm:col-span-1 font-bold">
                <span className="text-[#FF5500]">0€</span>
                <span>Zéro inscription</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-5 sm:pt-8 mt-auto">
            <Link
              href="/boussole-sensorielle"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#e04500] text-white text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-[#FF5500]/25 group-hover:translate-x-1"
            >
              <span>Lancer la Boussole Sensorielle</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Block 2: Studio Clicker Personnalisation (3 cols) */}
        <div className="md:col-span-3 p-5 sm:p-6 md:p-7 rounded-3xl bg-white border border-neutral-200 hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl group">
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200">
              <span className="font-mono text-[9px] font-bold text-neutral-600 uppercase tracking-widest">
                STUDIO CLICKER
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-neutral-950 leading-tight uppercase">
              Personnalisez votre clicker mécanique.
            </h3>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Formes de boîtier, textures 3D et 13 teintes : composez votre modèle sur mesure.
            </p>

            {/* Sur mobile : uniquement titre, description et bouton. Les sélecteurs interactifs sont visibles sur tablette/desktop */}
            <div className="hidden sm:block space-y-2 pt-1">
              {(["solo", "carre", "textures"] as const).map((key) => {
                const item = shapeData[key];
                const active = selectedShape === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedShape(key)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      active
                        ? "bg-orange-50/80 border-[#FF5500] text-neutral-950 shadow-xs"
                        : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="font-bold text-xs">{item.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-500 font-bold">{item.tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic details for the selected option (Desktop only) */}
            <div className="hidden sm:block p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <p className="text-[11px] text-neutral-700 leading-tight font-medium">
                {shapeData[selectedShape].desc}
              </p>
            </div>
          </div>

          <div className="pt-4 sm:pt-6 mt-auto">
            <Link
              href="/createur-cliqueur"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold uppercase tracking-wider transition-colors border border-neutral-200"
            >
              <span>Ouvrir le Studio 3D</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF5500]" />
            </Link>
          </div>
        </div>

        {/* Block 3: Blind Bags d'atelier (3 cols) */}
        <div className="md:col-span-3 p-5 sm:p-6 md:p-7 rounded-3xl bg-white border border-neutral-200 hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl group">
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200">
              <span className="font-mono text-[9px] font-bold text-neutral-600 uppercase tracking-widest">
                TIRAGE MYSTÈRE KRAFT
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-neutral-950 leading-tight uppercase">
              Blind Bags d'atelier.
            </h3>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Des formats 3, 5 ou 10 pièces mystères issues des petites séries de l'atelier.
            </p>

            {/* Photo de pochette masquée sur mobile pour compacter la hauteur */}
            <div className="hidden sm:block relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
              <Image
                src="/images/pochette-kraft-studio-gen.png"
                alt="Blind Bag Kraft Spoolio"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-white/90 backdrop-blur-md border border-neutral-200 text-[9px] font-mono text-[#FF5500] font-bold shadow-xs">
                100% RECYCLABLE
              </div>
            </div>

            {/* Format specs */}
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 border-t border-neutral-200 pt-2 font-bold">
              <span className="flex items-center gap-1">
                <PackageCheck className="w-3.5 h-3.5 text-[#FF5500]" /> 3, 5 ou 10 pièces
              </span>
              <span className="text-neutral-900">Dès 10€</span>
            </div>
          </div>

          <div className="pt-4 sm:pt-6 mt-auto">
            <Link
              href="/pochette-surprise"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold uppercase tracking-wider transition-colors border border-neutral-200"
            >
              <span>Découvrir les Pochettes</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF5500]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
