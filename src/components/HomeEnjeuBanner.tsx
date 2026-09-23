"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Dices, Smartphone, ArrowRight } from "lucide-react";

interface HomeEnjeuBannerProps {
  className?: string;
}

export default function HomeEnjeuBanner({ className = "my-8" }: HomeEnjeuBannerProps) {
  const games = [
    { name: "Skull King", icon: "🏴‍☠️" },
    { name: "Skyjo", icon: "🔢" },
    { name: "Yams", icon: "🎲" },
    { name: "Belote & Tarot", icon: "🃏" },
    { name: "Qwixx", icon: "🔴" },
  ];

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-zinc-50 border border-zinc-200 p-6 sm:p-8 shadow-sm text-zinc-900 font-sans flex flex-col justify-between gap-6 group hover:border-zinc-400 transition-all duration-300 ${className}`}>
      {/* Subtle Accent Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#ff4f00]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-start gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 shadow-xs select-none">
            <span className="text-xl">🎲</span>
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-zinc-900/5 text-zinc-900 border border-zinc-200 font-mono font-bold no-invert">
            App Enjeu • 100% Gratuite
          </span>
        </div>

        <div className="space-y-2">
          <h4 className="text-2xl sm:text-3xl font-extrabold uppercase text-zinc-900 font-outfit tracking-tight leading-tight">
            Des soirées jeux <span className="text-[#ff4f00]">100% fun</span>, zéro prise de tête.
          </h4>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
            Tours à dés, supports de cartes &amp; accessoires 3D artisanaux conçus en France + <strong className="text-zinc-900 font-semibold">l'application compagnon gratuite Enjeu</strong> pour calculer vos scores automatiques (Skull King, Skyjo, Yams...) et pimenter vos parties avec des paris amicaux !
          </p>
        </div>

        {/* Supported Games Chips */}
        <div className="flex flex-wrap items-center justify-start gap-1.5 pt-1">
          <span className="text-[11px] font-bold uppercase text-zinc-500 mr-1 font-mono">
            Feuilles de score incluses :
          </span>
          {games.map((g, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white border border-zinc-200 text-zinc-800 shadow-xs"
            >
              <span>{g.icon}</span>
              <span>{g.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Action CTAs */}
      <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/jeux-de-societe"
          className="w-full sm:flex-1 h-12 px-4 rounded-xl bg-zinc-950 hover:bg-[#ff4f00] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
        >
          <Dices className="w-4 h-4" />
          <span>Collection Jeux 🎲</span>
        </Link>

        <Link
          href="/jeux-de-societe#enjeu-app"
          className="w-full sm:w-auto h-12 px-5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-zinc-200 shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
        >
          <Smartphone className="w-4 h-4" />
          <span>Découvrir l'App 📱</span>
        </Link>
      </div>
    </div>
  );
}
