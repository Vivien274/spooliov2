"use client";

import Image from "next/image";
import { Gamepad2, LayoutGrid, Gift, Sparkles, Check, ArrowRight } from "lucide-react";

export interface UniverseDef {
  id: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string;
  icon: React.ReactNode;
  categoryKeywords: string[];
}

export const BOUTIQUE_UNIVERSES: UniverseDef[] = [
  {
    id: "jouer",
    title: "Pour jouer",
    tagline: "Sensations & ASMR",
    description: "Clickers tactiles, fidgets de focus, jeux & dés",
    imageUrl: "/images/clicker_gallery_2.jpg",
    icon: <Gamepad2 className="w-4 h-4" />,
    categoryKeywords: ["fidget", "jeu", "gaming", "geek", "clicker", "cliqueur", "dés", "cartes"],
  },
  {
    id: "bureau",
    title: "Pour le bureau",
    tagline: "Desk Setup & Rangement",
    description: "Supports smartphone, vide-poches & organisation",
    imageUrl: "/images/imported/Spoolio-crane-dragon-vide-poche-12-scaled.webp",
    icon: <LayoutGrid className="w-4 h-4" />,
    categoryKeywords: ["accessoire", "bureau", "déco", "deco", "support", "boite", "boîte"],
  },
  {
    id: "cadeaux",
    title: "Petits cadeaux",
    tagline: "Plaisir d'Offrir",
    description: "Pochettes surprises kraft, boîtes magiques & porte-clés",
    imageUrl: "/images/pochette-kraft-studio-gen.png",
    icon: <Gift className="w-4 h-4" />,
    categoryKeywords: ["cadeau", "pochette", "surprise", "clé", "cle", "carte", "emballage"],
  },
  {
    id: "curiosites",
    title: "Nos curiosités",
    tagline: "Pièces d'Atelier",
    description: "Dragons articulés flexi, animaux & créations insolites",
    imageUrl: "/images/marcel_octopus.jpg",
    icon: <Sparkles className="w-4 h-4" />,
    categoryKeywords: ["animau", "figurine", "dragon", "sos", "nfc", "bijou", "curiosite", "créature"],
  },
];

interface BoutiqueUniversesProps {
  selectedUniverse: string | null;
  onSelectUniverse: (universeId: string | null) => void;
}

export default function BoutiqueUniverses({
  selectedUniverse,
  onSelectUniverse,
}: BoutiqueUniversesProps) {
  return (
    <section id="nos-univers" className="mb-10 font-sans select-none">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ff4f00] uppercase tracking-wider mb-1">
            <span>// Univers Spoolio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-outfit tracking-tight">
            Explorez la boutique par univers
          </h2>
        </div>
        <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
          Cliquez sur un univers pour filtrer instantanément toutes les créations correspondantes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {BOUTIQUE_UNIVERSES.map((universe) => {
          const isSelected = selectedUniverse === universe.id;

          return (
            <div
              key={universe.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => onSelectUniverse(isSelected ? null : universe.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectUniverse(isSelected ? null : universe.id);
                }
              }}
              className={`group relative aspect-[16/11] sm:aspect-[4/3] rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4f00] ${
                isSelected
                  ? "border-[#ff4f00] ring-2 ring-[#ff4f00]/30 shadow-lg scale-[1.01]"
                  : "border-zinc-200/90 hover:border-zinc-300 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              {/* Product Background Image */}
              <Image
                src={universe.imageUrl}
                alt={universe.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={`object-cover object-center transition-all duration-500 ease-out ${
                  isSelected
                    ? "scale-105 brightness-[0.75]"
                    : "brightness-[0.7] group-hover:brightness-[0.8] group-hover:scale-105"
                }`}
              />

              {/* Gradient Dark Overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/50 to-zinc-950/20 pointer-events-none"
                aria-hidden="true"
              />

              {/* Top Bar: Icon Tag & Active Status */}
              <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/15">
                  <span className="text-[#ff4f00]">{universe.icon}</span>
                  <span>{universe.tagline}</span>
                </span>

                {isSelected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ff4f00] text-white text-[10px] font-black shadow-xs">
                    <Check className="w-3 h-3" />
                    <span>Actif</span>
                  </span>
                )}
              </div>

              {/* Bottom Content Area */}
              <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white font-outfit tracking-tight leading-tight group-hover:text-orange-200 transition-colors">
                  {universe.title}
                </h3>
                <p className="text-[11px] text-zinc-300 line-clamp-1 leading-snug font-sans">
                  {universe.description}
                </p>

                <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-[#ff4f00] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  <span>{isSelected ? "Désactiver le filtre" : "Filtrer cet univers"}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
