"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Eye, ShieldCheck, Compass, Info } from "lucide-react";

interface ExhibitItem {
  id: string;
  catalogNumber: string;
  title: string;
  subtitle: string;
  technique: string;
  dimensions: string;
  edition: string;
  price: string;
  image: string;
  link: string;
  accent: string;
  tactileTag: string;
}

const EXHIBIT_ITEMS: ExhibitItem[] = [
  {
    id: "monstre-brut",
    catalogNumber: "FIG. 01 // EX-01",
    title: "Le Monstre Brut",
    subtitle: "Art Toy d'Atelier",
    technique: "Impression 3D FDM • PLA Végétal",
    dimensions: "H : 75 mm • Texturé",
    edition: "Série Atelier 2026",
    price: "3.00 €",
    image: "/images/imported/Spoolio_Monstre-A-Peindre-1-scaled.jpeg",
    link: "/product/petit-monstre-a-peindre",
    accent: "#ff4f00",
    tactileTag: "Texture Granitée",
  },
  {
    id: "alien-capsule",
    catalogNumber: "FIG. 02 // EX-02",
    title: "Cryo-Alien & Capsule",
    subtitle: "Spécimen de Laboratoire",
    technique: "Bio-polymère & Cuve Cryo Transparente",
    dimensions: "H : 95 mm • Extractible",
    edition: "Édition Limitée",
    price: "4.00 €",
    image: "/images/alien_capsule.jpg",
    link: "/product/pack-alien-capsule",
    accent: "#00f0ff",
    tactileTag: "Corps Articulé",
  },
  {
    id: "dummy-bot",
    catalogNumber: "FIG. 03 // EX-03",
    title: "Dummy Street-Bot",
    subtitle: "Art Toy Multi-poses",
    technique: "Rotules à friction mécanique",
    dimensions: "H : 130 mm • 12 articulations",
    edition: "Tirage Numéroté",
    price: "5.00 €",
    image: "/images/imported/Spoolio_Robot-articule-dummy_15.jpg",
    link: "/product/robot-articule-dummy",
    accent: "#a855f7",
    tactileTag: "Rotules Crantées",
  },
  {
    id: "marcel-octo",
    catalogNumber: "FIG. 04 // EX-04",
    title: "Marcel l'Octo-Street",
    subtitle: "Sculpture Haptique",
    technique: "Polymère biosourcé souple",
    dimensions: "Ø : 110 mm • Finition Satinée",
    edition: "Série Signature",
    price: "5.00 €",
    image: "/images/marcel_octopus.jpg",
    link: "/boutique",
    accent: "#f59e0b",
    tactileTag: "Clic ASMR & Flex",
  },
];

export default function LatestDropBanner() {
  const [activeExhibit, setActiveExhibit] = useState<ExhibitItem>(EXHIBIT_ITEMS[0]);

  return (
    <section className="w-full relative overflow-hidden bg-[#0a0a0e] text-white border-y border-neutral-800 my-6 sm:my-10 shadow-2xl">
      {/* Museum Ambient Glows & Gallery Spotlight Shadows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-32 left-1/3 w-[600px] h-[400px] rounded-full blur-[160px] opacity-20"
          style={{ backgroundColor: activeExhibit.accent }}
        />
        <div
          className="absolute -bottom-32 right-1/4 w-[500px] h-[400px] rounded-full blur-[170px] opacity-15"
          style={{ backgroundColor: "#ff4f00" }}
        />
        {/* Gallery Fine Mesh / Noise Texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.9) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Top Curatorial Bar: Museum Catalog Header */}
      <div className="relative z-10 w-full bg-black/70 border-b border-white/10 px-4 sm:px-8 py-2.5 backdrop-blur-md">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between text-[11px] sm:text-xs font-mono tracking-wider text-neutral-400">
          <div className="flex items-center gap-2 text-white">
            <span className="inline-block w-2 h-2 rounded-full bg-[#ff4f00] shadow-[0_0_8px_#ff4f00]" />
            <span className="font-bold tracking-widest uppercase">
              SPOOLIO GALLERY // EXPOSITION PERMANENTE
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-neutral-400">
            <span>CURATEUR : ATELIER SPOOLIO</span>
            <span>LIEU : COMINES (59)</span>
            <span>MATIÈRE : 100% POLYMÈRE VÉGÉTAL</span>
          </div>

          <div className="flex items-center gap-2 text-neutral-300">
            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold">
              DROP 01
            </span>
            <span className="hidden sm:inline">TIRAGE LIMITÉ</span>
          </div>
        </div>
      </div>

      {/* Main Banner Interior */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16">
        
        {/* Exhibition Title & Curatorial Statement */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 sm:pb-12 border-b border-white/10">
          <div className="space-y-4 max-w-2xl">
            {/* Tag Badge */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-sm -rotate-1 hover:rotate-0 transition-transform">
                <Sparkles className="w-3.5 h-3.5 text-[#ff4f00]" />
                <span className="text-xs font-mono font-bold text-neutral-200 tracking-wider uppercase">
                  Collection Art Toys d'Atelier
                </span>
              </div>
            </div>

            {/* Authentic Street Tag Title (Marqueur Posca) */}
            <div>
              <h3
                className="text-4xl sm:text-6xl lg:text-7xl font-normal text-white font-permanent-marker leading-[1.1] drop-shadow-[0_4px_0px_#ff4f00] sm:drop-shadow-[0_6px_0px_#ff4f00] select-none -rotate-1 hover:rotate-0 transition-all duration-300 inline-block"
                style={{
                  fontFamily: "var(--font-permanent-marker), cursive, sans-serif",
                }}
              >
                Curb Monsters
              </h3>
            </div>

            {/* Curatorial Note */}
            <p className="text-base sm:text-lg text-neutral-200 font-sans font-medium leading-relaxed max-w-xl">
              Monstres de bitume façonnés à l'atelier.
            </p>

            {/* Gallery Spec Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-neutral-400">
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                ✦ Pièces d'Exposition
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                ✦ 100% Végétal (PLA)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                ✦ Fini à la main
              </span>
            </div>
          </div>

          {/* Exhibition Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/boutique"
              className="h-12 sm:h-14 px-8 inline-flex items-center justify-center gap-2.5 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider text-black bg-white hover:bg-[#ff4f00] hover:text-white transition-all duration-300 shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer no-invert"
            >
              <span>Voir toute la galerie</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* The 4 Gallery Exhibition Podiums (Piédestaux d'art contemporain) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 pt-10 sm:pt-12">
          {EXHIBIT_ITEMS.map((item, idx) => {
            const isSelected = activeExhibit.id === item.id;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setActiveExhibit(item)}
                className="group relative flex flex-col justify-between rounded-2xl transition-all duration-500"
              >
                {/* Museum Overhead Spotlight Effect */}
                <div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-20 rounded-full blur-2xl pointer-events-none transition-opacity duration-500"
                  style={{
                    backgroundColor: item.accent,
                    opacity: isSelected ? 0.35 : 0.12,
                  }}
                />

                {/* THE GALLERY PEDESTAL (Piédestal Sculptural) */}
                <div className="relative w-full rounded-2xl bg-neutral-900/90 border border-white/10 group-hover:border-white/25 transition-all duration-500 p-4 sm:p-5 flex flex-col items-center overflow-hidden shadow-2xl">
                  
                  {/* Top Museum Plaque Info */}
                  <div className="w-full flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-3 select-none">
                    <span className="font-bold text-neutral-300 tracking-wider">
                      {item.catalogNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-sans text-[10px] font-semibold">
                      {item.tactileTag}
                    </span>
                  </div>

                  {/* Artwork Showcase (Framed on its glowing plinth) */}
                  <Link
                    href={item.link}
                    className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#060608] border border-white/10 group-hover:border-[#ff4f00]/50 transition-all duration-500 block mb-4 group/art"
                  >
                    {/* Spotlight Cone on the sculpture */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-500 z-10"
                      style={{
                        background: `radial-gradient(circle at 50% 25%, ${item.accent}30 0%, transparent 70%)`,
                      }}
                    />

                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                      className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out filter brightness-[0.96] contrast-[1.04]"
                    />

                    {/* Pedestal Specular Edge */}
                    <div className="absolute inset-0 pointer-events-none rounded-[inherit] ring-1 ring-inset ring-white/10" />

                    {/* Floating Zoom / Inspect Pill */}
                    <div className="absolute bottom-2.5 right-2.5 z-20 opacity-0 group-hover/art:opacity-100 transition-opacity duration-300">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 text-white text-[10px] font-mono font-bold backdrop-blur-md border border-white/20 shadow-md">
                        <Eye className="w-3 h-3 text-[#ff4f00]" />
                        <span>Inspecter</span>
                      </span>
                    </div>
                  </Link>

                  {/* Architectural Pedestal Step / Plinth Base */}
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent mb-3" />

                  {/* MUSEUM EXHIBITION CARTEL (Cartel de Galerie) */}
                  <div className="w-full space-y-2.5 text-left">
                    <div className="space-y-0.5">
                      <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-[#ff4f00] transition-colors leading-tight font-outfit">
                        {item.title}
                      </h4>
                      <p className="text-xs text-neutral-400 font-sans">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Technical Specifications (Museum Plaque Style) */}
                    <div className="text-[11px] font-mono text-neutral-400 space-y-0.5 pt-1.5 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Médium :</span>
                        <span className="text-neutral-300 truncate max-w-[150px]">{item.technique}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Format :</span>
                        <span className="text-neutral-300">{item.dimensions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Tirage :</span>
                        <span className="text-neutral-300">{item.edition}</span>
                      </div>
                    </div>

                    {/* Price & Direct Acquire Action */}
                    <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/10">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-500 block uppercase leading-none">
                          Tarif d'adoption
                        </span>
                        <span className="text-base font-mono font-black text-[#ff4f00]">
                          {item.price}
                        </span>
                      </div>

                      <Link
                        href={item.link}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#ff4f00] text-white text-xs font-bold transition-all duration-300 group/btn border border-white/10 hover:border-[#ff4f00] cursor-pointer no-invert"
                      >
                        <span>Adopter</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
