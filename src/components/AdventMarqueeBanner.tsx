"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function AdventMarqueeBanner() {
  const messages = [
    {
      icon: "🎄",
      highlight: "PRÉCOMMANDES OUVERTES",
      text: "Le Calendrier de l'Avent 3D Spoolio est disponible !",
    },
    {
      icon: "🎁",
      highlight: "SÉRIE LIMITÉE (50 EX.)",
      text: "24 créations exclusives 100% fabriquées à Comines (59)",
    },
    {
      icon: "⭐",
      highlight: "BONUS LANCEMENT",
      text: "Un 25ème cadeau offert pour toute commande avant le 30 Septembre !",
    },
    {
      icon: "⚡",
      highlight: "TARIF REMISÉ (45€)",
      text: "Économisez 5€ avant le passage au tarif normal le 16 Octobre",
    },
    {
      icon: "✨",
      highlight: "RÉSERVEZ LE VÔTRE",
      text: "Cliquez ici pour accéder aux précommandes du Calendrier",
    },
  ];

  return (
    <Link
      href="/calendrier-avent"
      className="group relative w-full h-8 sm:h-9 bg-gradient-to-r from-[#7f111e] via-[#b91c1c] to-[#6b0f1a] text-white flex items-center overflow-hidden select-none border-b border-amber-400/40 shadow-sm z-50 transition-colors cursor-pointer"
      title="Accéder aux précommandes du Calendrier de l'Avent 3D Spoolio"
    >
      {/* Subtle glossy shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none opacity-50" />

      {/* Left fixed pill for contextual hook */}
      <div className="relative z-20 h-full px-3 bg-black/40 backdrop-blur-md border-r border-white/15 hidden sm:flex items-center gap-1.5 shrink-0 text-[10px] font-mono font-black uppercase tracking-wider text-amber-300">
        <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
        <span>Avent 2026</span>
      </div>

      {/* Scrolling Marquee Track (seamless loop with 2 identical copies) */}
      <div className="relative z-10 flex-1 overflow-hidden h-full flex items-center">
        <div className="flex w-max animate-marquee-banner group-hover:[animation-play-state:paused] items-center">
          {/* Copy 1 */}
          <div className="flex items-center gap-8 shrink-0 pr-8">
            {messages.map((m, idx) => (
              <span
                key={`m1-${idx}`}
                className="inline-flex items-center gap-2 text-[11px] sm:text-xs text-white/95 whitespace-nowrap font-medium"
              >
                <span>{m.icon}</span>
                <strong className="font-extrabold text-amber-300 uppercase tracking-wide font-mono text-[10px] sm:text-[11px] bg-black/30 px-1.5 py-0.5 rounded border border-amber-400/30">
                  {m.highlight}
                </strong>
                <span>{m.text}</span>
                <span className="text-white/40 ml-4 font-bold">•</span>
              </span>
            ))}
          </div>

          {/* Copy 2 (duplicate for seamless infinite loop) */}
          <div className="flex items-center gap-8 shrink-0 pr-8" aria-hidden="true">
            {messages.map((m, idx) => (
              <span
                key={`m2-${idx}`}
                className="inline-flex items-center gap-2 text-[11px] sm:text-xs text-white/95 whitespace-nowrap font-medium"
              >
                <span>{m.icon}</span>
                <strong className="font-extrabold text-amber-300 uppercase tracking-wide font-mono text-[10px] sm:text-[11px] bg-black/30 px-1.5 py-0.5 rounded border border-amber-400/30">
                  {m.highlight}
                </strong>
                <span>{m.text}</span>
                <span className="text-white/40 ml-4 font-bold">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right fixed CTA button */}
      <div className="relative z-20 h-full px-3 bg-black/40 backdrop-blur-md border-l border-white/15 hidden md:flex items-center gap-1.5 shrink-0">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-mono font-black text-[10px] uppercase tracking-wider shadow-sm transition-transform group-hover:scale-105">
          <span>Précommander</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </span>
      </div>
    </Link>
  );
}
