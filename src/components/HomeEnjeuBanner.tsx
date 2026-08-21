"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Dices, Smartphone, ArrowRight } from "lucide-react";

export default function HomeEnjeuBanner() {
  const games = [
    { name: "Skull King", icon: "🏴‍☠️" },
    { name: "Skyjo", icon: "🔢" },
    { name: "Yams", icon: "🎲" },
    { name: "Belote & Tarot", icon: "🃏" },
    { name: "Qwixx", icon: "🔴" },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c0d1b] via-[#12132a] to-[#18112e] border border-indigo-500/30 p-6 sm:p-8 lg:p-10 shadow-2xl shadow-indigo-950/50 text-white font-sans my-8">
      {/* Ambient Glowing Orbs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#ff4f00]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Side Info */}
        <div className="flex-1 space-y-4 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>🎲 Univers Jeux de Société &amp; App Enjeu</span>
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white font-antonio tracking-tight leading-tight">
            Des soirées jeux <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f00] via-amber-300 to-indigo-400">100% fun</span>, zéro prise de tête.
          </h3>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl font-sans">
            Tours à dés, supports de cartes &amp; accessoires 3D artisanaux conçus en France + <strong className="text-white">l'application compagnon gratuite Enjeu</strong> pour calculer vos scores automatiques (Skull King, Skyjo, Yams...) et pimenter vos parties avec des paris amicaux !
          </p>

          {/* Supported Games Chips */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
            <span className="text-[11px] font-bold uppercase text-indigo-300/80 mr-1 font-mono">
              Feuilles de score incluses :
            </span>
            {games.map((g, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-gray-200"
              >
                <span>{g.icon}</span>
                <span>{g.name}</span>
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-3">
            <Link
              href="/jeux-de-societe"
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-gradient-to-r from-[#ff4f00] to-[#e04500] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#ff4f00]/25 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Dices className="w-4 h-4" />
              <span>Voir la Collection Jeux 🎲</span>
            </Link>

            <Link
              href="/jeux-de-societe#enjeu-app"
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg border border-indigo-400/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Découvrir l'App Enjeu 🤖</span>
            </Link>
          </div>
        </div>

        {/* Right Side Visual Smartphone Screenshot Mockup */}
        <div className="w-full sm:w-auto shrink-0 flex items-center justify-center">
          <Link
            href="/jeux-de-societe#enjeu-app"
            className="group relative block w-[190px] sm:w-[210px] aspect-[9/18] rounded-[32px] bg-[#07070a] border-[4px] border-slate-700/80 p-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_30px_rgba(99,102,241,0.2)] overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:border-indigo-400/60"
            title="Découvrir l'App Enjeu en détail"
          >
            {/* Dynamic Island / Notch */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-30 flex items-center justify-center border border-white/10">
              <div className="w-2 h-2 rounded-full bg-indigo-900/80 border border-indigo-400/50" />
            </div>

            {/* Smartphone Screenshot Display */}
            <div className="relative w-full h-full rounded-[26px] overflow-hidden bg-black">
              <Image
                src="/images/enjeu/1.png"
                alt="Capture d'écran Application Enjeu"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 no-invert"
                sizes="210px"
                priority
              />

              {/* Hover Badge Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-white bg-indigo-600 px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  Voir l'App <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
