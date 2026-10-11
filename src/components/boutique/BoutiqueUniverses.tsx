"use client";

import Image from "next/image";
import { Gamepad2, LayoutGrid, Gift, Sparkles, Check } from "lucide-react";

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
    description: "Clickers & fidgets de focus",
    imageUrl: "/images/clicker_gallery_2.jpg",
    icon: <Gamepad2 className="w-3.5 h-3.5" />,
    categoryKeywords: ["fidget", "jeu", "gaming", "geek", "clicker", "cliqueur", "dés", "cartes"],
  },
  {
    id: "bureau",
    title: "Pour le bureau",
    tagline: "Deskware & Setup",
    description: "Supports & vide-poches",
    imageUrl: "/images/keyboard_support.jpg",
    icon: <LayoutGrid className="w-3.5 h-3.5" />,
    categoryKeywords: ["accessoire", "bureau", "déco", "deco", "support", "boite", "boîte"],
  },
  {
    id: "cadeaux",
    title: "Petits cadeaux",
    tagline: "Plaisir d'Offrir",
    description: "Pochettes surprises & coffrets",
    imageUrl: "/images/pochette-kraft-studio-gen.png",
    icon: <Gift className="w-3.5 h-3.5" />,
    categoryKeywords: ["cadeau", "pochette", "surprise", "clé", "cle", "carte", "emballage"],
  },
  {
    id: "curiosites",
    title: "Nos curiosités",
    tagline: "Pièces d'Atelier",
    description: "Dragons, Marcel & créatures",
    imageUrl: "/images/marcel_octopus.jpg",
    icon: <Sparkles className="w-3.5 h-3.5" />,
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
    <section id="nos-univers" className="mb-6 font-sans select-none" aria-label="Filtrer par univers">
      {/* Desktop: single compact row. Mobile: smooth horizontal snap scroll */}
      <div className="flex lg:grid lg:grid-cols-4 gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-none snap-x">
        {BOUTIQUE_UNIVERSES.map((universe) => {
          const isSelected = selectedUniverse === universe.id;

          return (
            <button
              key={universe.id}
              type="button"
              onClick={() => onSelectUniverse(isSelected ? null : universe.id)}
              className={`min-w-[210px] sm:min-w-0 flex-1 snap-start p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                isSelected
                  ? "bg-[#FFF7F2] border-[#FF5500] ring-1 ring-[#FF5500]/50 shadow-2xs"
                  : "bg-white border-[#E4E4E0] hover:border-[#18181B]/40 hover:bg-[#FAFAFA]"
              }`}
            >
              {/* Product Thumbnail */}
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden bg-[#F4F4F0] shrink-0 border border-black/5">
                <Image
                  src={universe.imageUrl}
                  alt={universe.title}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>

              {/* Title & Short Tagline */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs font-bold leading-tight truncate ${
                    isSelected ? "text-[#FF5500]" : "text-[#18181B]"
                  }`}>
                    {universe.title}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-[#FF5500] text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#71717A] font-mono leading-none block truncate mt-0.5">
                  {universe.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
