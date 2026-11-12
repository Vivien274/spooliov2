"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { Drop, isTeaserDrop } from "@/lib/drops";

interface BoutiqueDropBannerProps {
  drop?: Drop | null;
}

export default function BoutiqueDropBanner({ drop }: BoutiqueDropBannerProps) {
  const [isLive, setIsLive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!drop) return;

    const checkLiveState = () => {
      if (isTeaserDrop(drop)) {
        setIsLive(false);
        return;
      }
      if (drop.status === "live") {
        setIsLive(true);
        return;
      }
      if (drop.status === "ended") {
        setIsLive(false);
        return;
      }
      if (drop.startDate) {
        const now = Date.now();
        const start = new Date(drop.startDate).getTime();
        setIsLive(now >= start);
      }
    };

    checkLiveState();
    const timer = setInterval(checkLiveState, 1000);
    return () => clearInterval(timer);
  }, [drop]);

  // Si aucun drop ou drop clos, masquer complètement le composant
  if (!drop || drop.status === "ended") {
    return null;
  }

  // Formatage de la date en français
  const formattedDate = (() => {
    try {
      const d = new Date(drop.startDate);
      const str = new Intl.DateTimeFormat("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
      return str.toUpperCase();
    } catch {
      return drop.startDate;
    }
  })();

  const cleanDescription = drop.description
    ? drop.description.split("\n\n")[0]
    : drop.quote || drop.tagline;

  const dropNumberLabel = drop.dropNumber || "DROP 01";
  const dropNameLabel = drop.dropName || drop.title;
  const imageSrc = drop.bannerImage || "/images/marcel_octopus.jpg";

  return (
    <section className="mb-8 font-sans select-none" aria-label="Encart Spoolio Drop">
      <div className="relative rounded-2xl sm:rounded-3xl bg-[#0D0D0D] border border-white/10 text-white overflow-hidden shadow-md">
        
        {/* Subtle orange accent glow behind content */}
        <div 
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#FF5500]/15 blur-3xl pointer-events-none" 
          aria-hidden="true" 
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* Left Column (7 cols): Asymmetric editorial content */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-5 order-2 lg:order-1">
            
            <div className="space-y-3.5">
              {/* Header meta badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                {isLive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] font-mono text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    <span>DROP ACTIF • EN LIGNE</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FF5500]/20 border border-[#FF5500]/40 text-[#FF5500] font-mono text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
                    <span>DROP ANNONCÉ</span>
                  </span>
                )}

                <span className="font-mono text-[10px] sm:text-[11px] text-[#A1A1AA] uppercase tracking-widest">
                  {dropNumberLabel} // SÉRIE ATELIER
                </span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                  {dropNameLabel}
                </h2>
                {drop.tagline && (
                  <p className="text-xs sm:text-sm font-mono text-[#FF5500] mt-1 tracking-wide uppercase">
                    {drop.tagline}
                  </p>
                )}
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed line-clamp-2 max-w-xl font-sans">
                {cleanDescription}
              </p>
            </div>

            {/* Technical Specs & Price row */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs">
                {drop.editionSize && (
                  <div className="flex items-center gap-1.5 text-[#D4D4D8]">
                    <span className="text-[#FF5500] font-bold">●</span>
                    <span className="text-[11px] sm:text-xs">
                      {drop.editionSize} PIÈCES UNIQUES
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-white">
                  <span className="text-[#A1A1AA] text-[10px] sm:text-[11px]">PRIX //</span>
                  <span className="font-bold text-xs sm:text-sm text-white">55,00 €</span>
                </div>

                {isTeaserDrop(drop) ? (
                  <div className="flex items-center gap-1.5 text-amber-300 text-[11px] sm:text-xs font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>LANCEMENT : DATE À VENIR</span>
                  </div>
                ) : !isLive && drop.startDate ? (
                  <div className="flex items-center gap-1.5 text-[#A1A1AA] text-[11px] sm:text-xs">
                    <Clock className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>LANCEMENT : {formattedDate}</span>
                  </div>
                ) : null}
              </div>

              {/* Action CTA Button */}
              <Link
                href={isTeaserDrop(drop) ? "/drops" : `/drops/${drop.slug}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#E04500] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>{isTeaserDrop(drop) ? "VOIR LE PROGRAMME DES DROPS" : isLive ? "ACCÉDER AU DROP" : "VOIR LE TEASER"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* Right Column (5 cols): Generous Product Visual */}
          <div className="lg:col-span-5 relative min-h-[220px] sm:min-h-[260px] lg:min-h-full overflow-hidden bg-zinc-950 order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-white/10">
            <Image
              src={imageSrc}
              alt={drop.title}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className={`object-cover object-center hover:scale-105 transition-transform duration-700 ease-out ${
                isTeaserDrop(drop) ? "filter blur-md scale-105" : ""
              }`}
            />

            {/* Subtle Gradient overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0D0D0D] via-transparent to-transparent pointer-events-none" 
              aria-hidden="true" 
            />

            {isTeaserDrop(drop) && (
              <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-10 pointer-events-none">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl shadow-lg mb-2">
                  🔮
                </div>
                <span className="text-[10px] font-mono font-black text-white uppercase tracking-wider bg-black/60 px-2.5 py-0.5 rounded-full border border-white/20">
                  Projet secret en préparation
                </span>
              </div>
            )}

            {/* Atelier Calibration Annotation */}
            <div className="absolute bottom-3 right-3 font-mono text-[9px] text-white/90 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-white/15 uppercase z-20">
              COMINES // ÉDITION LIMITÉE
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
