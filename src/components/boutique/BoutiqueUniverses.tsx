"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, Zap, Palette, Dices, Check, ArrowRight } from "lucide-react";

export interface UniverseDef {
  id: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string;
  href: string;
  icon: React.ReactNode;
  categoryKeywords: string[];
}

export const BOUTIQUE_UNIVERSES: UniverseDef[] = [
  {
    id: "art-toys",
    title: "Art Toys & Collectibles",
    tagline: "Personnages & Curiosités",
    description: "Pièces à exposer et garder sous les yeux",
    imageUrl: "/images/marcel_octopus.jpg",
    href: "/art-toys",
    icon: <Sparkles className="w-3.5 h-3.5" />,
    categoryKeywords: [
      "art-toy",
      "art toy",
      "créature",
      "creature",
      "curiosit",
      "figurine",
      "dragon",
      "monstre",
      "animau",
    ],
  },
  {
    id: "tactile",
    title: "Tactile & Focus",
    tagline: "Objets tactiles & mécaniques",
    description: "Clickers nets, fidgets & switchs",
    imageUrl: "/images/clicker_gallery_0.jpg",
    href: "/tactile",
    icon: <Zap className="w-3.5 h-3.5" />,
    categoryKeywords: [
      "clicker",
      "cliqueur",
      "fidget",
      "mecanisme",
      "mécanisme",
      "switch",
      "gyro",
      "tactile",
    ],
  },
  {
    id: "objets-deco",
    title: "Objets & Déco",
    tagline: "Design & Quotidien",
    description: "Supports, bureau & rangements",
    imageUrl: "/images/imported/Spoolio-crane-dragon-vide-poche-12-scaled.webp",
    href: "/objets-deco",
    icon: <Palette className="w-3.5 h-3.5" />,
    categoryKeywords: [
      "déco",
      "deco",
      "support",
      "rangement",
      "bureau",
      "boite",
      "boîte",
      "setup",
      "vase",
    ],
  },
  {
    id: "tabletop",
    title: "Tabletop",
    tagline: "Jeux & Accessoires",
    description: "Tours à dés, cartes & jeux",
    imageUrl: "/images/imported/Spoolio-tour-a-de-pont-levis-1-scaled.webp",
    href: "/tabletop",
    icon: <Dices className="w-3.5 h-3.5" />,
    categoryKeywords: [
      "tabletop",
      "jeu",
      "jeux",
      "dés",
      "des",
      "tour",
      "cartes",
      "carte",
      "plateau",
    ],
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
  const activeUniverseObj = BOUTIQUE_UNIVERSES.find((u) => u.id === selectedUniverse);

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

      {/* Active Universe Shortcut Banner */}
      {activeUniverseObj && (
        <div className="mt-2.5 px-3.5 py-2 rounded-xl bg-[#FFF7F2] border border-[#FF5500]/25 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <span className="text-zinc-800 font-medium">
            Catalogue filtré sur <strong>{activeUniverseObj.title}</strong>
          </span>
          <Link
            href={activeUniverseObj.href}
            className="inline-flex items-center gap-1 font-bold text-[#FF5500] hover:underline shrink-0 ml-2 group"
          >
            <span>Explorer la page Univers</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}
    </section>
  );
}
