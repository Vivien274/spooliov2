"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

export interface CategoryPortal {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  count: string;
  href: string;
}

export const CATEGORY_PORTALS: CategoryPortal[] = [
  {
    id: "art-toys",
    code: "01 //",
    title: "POCHETTES SURPRISES",
    subtitle: "Silhouettes urbaines, monstres de bitume et Blind Bags kraft.",
    imageUrl: "/images/pochette-kraft-studio-gen.png",
    count: "12 PIÈCES",
    href: "/pochette-surprise",
  },
  {
    id: "hardware",
    code: "02 //",
    title: "HARDWARE TACTILE & FOCUS",
    subtitle: "Clickers mécaniques ASMR, sliders magnétiques et switchs d'atelier.",
    imageUrl: "/images/clicker_gallery_0.jpg",
    count: "18 PIÈCES",
    href: "/categorie/fidgets",
  },
  {
    id: "desk-setup",
    code: "03 //",
    title: "DESK SETUP & ATELIER",
    subtitle: "Vides-poches brutaux, supports industriels et boîtes secrètes.",
    imageUrl: "/images/imported/Spoolio-crane-dragon-vide-poche-12-scaled.webp",
    count: "15 PIÈCES",
    href: "/categorie/accessoires",
  },
  {
    id: "play",
    code: "04 //",
    title: "TABLETOP & PLAY",
    subtitle: "Accessoires de plateau épurés, tours à dés et matériel de jeu.",
    imageUrl: "/images/imported/Spoolio-tour-a-de-pont-levis-1-scaled.webp",
    count: "14 PIÈCES",
    href: "/jeux-de-societe",
  },
];

export default function HomeCategoryPortals() {
  return (
    <section className="w-full max-w-[1200px] px-4 py-4 sm:py-8 md:py-12 relative z-10 font-sans">
      {/* Grille de 4 cartes : format bandeau compact sur mobile (hauteur divisée par plus de 2), vertical ratio 4:5 sur tablette/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {CATEGORY_PORTALS.map((portal) => (
          <Link
            key={portal.id}
            href={portal.href}
            className="group relative aspect-[2.2/1] sm:aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden border border-neutral-200 bg-white cursor-pointer transition-all duration-300 hover:border-neutral-400 hover:shadow-xl shadow-xs block"
          >
            {/* Image d'ambiance avec zoom fluide au survol */}
            <Image
              src={portal.imageUrl}
              alt={portal.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center filter brightness-[0.85] group-hover:brightness-[0.95] group-hover:scale-105 transition-all duration-500 ease-out"
            />

            {/* Filtre sombre en dégradé pour garantir une lisibilité absolue des textes */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/45 to-neutral-950/15 pointer-events-none" />

            {/* Indexation claire en typographie monospace orange */}
            <div className="absolute top-2.5 left-3 sm:top-4 sm:left-4 z-10 flex items-center justify-between w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)]">
              <span className="font-mono text-xs sm:text-sm tracking-wider text-[#FF5500] font-bold">
                {portal.code}
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] text-white bg-neutral-900/80 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded border border-neutral-700/80 font-semibold">
                {portal.count}
              </span>
            </div>

            {/* Contenu textuel bas de tuile */}
            <div className="absolute bottom-2.5 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 z-10 flex flex-col justify-end space-y-1 sm:space-y-2">
              <h3 className="font-bold text-sm sm:text-lg text-white leading-tight font-sans">
                {portal.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-300 font-light line-clamp-1 sm:line-clamp-2 leading-relaxed font-sans">
                {portal.subtitle}
              </p>

              <div className="pt-0.5 sm:pt-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-[#FF5500] uppercase tracking-wider group-hover:translate-x-1 transition-transform font-bold">
                <span>Explorer l&apos;univers</span>
                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
