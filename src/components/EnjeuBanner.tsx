"use client";

import React from "react";
import Link from "next/link";
import { Smartphone, ArrowRight } from "lucide-react";

interface EnjeuBannerProps {
  productName?: string;
  className?: string;
  isGameProduct?: boolean;
  variant?: "full" | "compact" | "link-hub";
}

export default function EnjeuBanner({
  productName,
  className = "",
  variant = "full",
}: EnjeuBannerProps) {
  const games = [
    "Skull King",
    "Skyjo",
    "Yams / Yahtzee",
    "Qwixx",
    "Belote & Coinche",
    "Tarot FFT",
    "6 qui prend !",
    "Faraway",
    "Sea Salt & Paper",
    "Papier & Crayon",
  ];

  /* -------------------------------------------------------------------------- */
  /* VARIANT 1: LINK-HUB (Compact Bento Card for Instagram / Links page)       */
  /* -------------------------------------------------------------------------- */
  if (variant === "link-hub") {
    return (
      <div
        className={`group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0D1117] via-[#161B22] to-[#1E1B4B] border border-indigo-500/30 hover:border-indigo-400/60 transition-all duration-300 shadow-lg text-white font-sans ${className}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center text-xl shrink-0">
              📱
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white truncate">
                  Appli Enjeu (Scores &amp; Paris)
                </span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  Gratuit
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate leading-snug font-medium mt-0.5">
                Skull King, Skyjo, Yams, Qwixx, Belote, Tarot...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/jeux-de-societe#enjeu-app"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 border border-indigo-400/30"
            >
              <span>Voir la fiche de l'appli 📱</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* VARIANT 2: COMPACT (For narrow containers like Order Confirmation Page)    */
  /* -------------------------------------------------------------------------- */
  if (variant === "compact") {
    return (
      <section
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#1E1B4B] border border-indigo-500/30 p-5 shadow-xl text-white font-sans ${className}`}
      >
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-[11px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              📱 App Compagnon • 100% Gratuite
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Spoolio x Enjeu</span>
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-white leading-snug">
              Préparez votre prochaine soirée jeux avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">Enjeu</span> !
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Feuilles de score intelligentes pour <strong>Skull King, Skyjo, Yams, Qwixx, Belote, Tarot</strong> &amp; paris amicaux (<em>"Le perdant fait la vaisselle !"</em>).
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-2 border-t border-white/10">
            <Link
              href="/jeux-de-societe#enjeu-app"
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow transition-all border border-indigo-400/30"
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span>Voir la fiche de l'appli 📱</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* VARIANT 3: FULL (Default for Product Detail pages)                        */
  /* -------------------------------------------------------------------------- */
  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#1E1B4B] border border-indigo-500/30 p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 text-white ${className}`}
    >
      {/* Background Glowing Orbs */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Side: Content & Game Tags */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            🔥 Application Compagnon Gratuite
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight font-sans">
            {productName ? (
              <>
                Complétez votre expérience avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Enjeu</span>
              </>
            ) : (
              <>
                Simplifiez vos soirées jeux avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Enjeu</span>
              </>
            )}
          </h3>

          <p className="text-sm text-gray-300 leading-relaxed max-w-2xl font-sans">
            Fini les feuilles volantes et les litiges de calcul ! <strong className="text-white">Enjeu</strong> est l'application compagnon idéale pour calculer automatiquement vos scores, enregistrer vos paris amicaux (<em>"Le perdant fait la vaisselle !"</em>) et conserver l'historique de toutes vos parties.
          </p>

          {/* Games tags carousel / grid */}
          <div className="mt-1 flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300/80 font-sans">
              🎮 10 Feuilles de score intelligentes incluses :
            </span>
            <div className="flex flex-wrap gap-1.5 font-sans">
              {games.map((game, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-gray-200 hover:border-indigo-400/40 hover:bg-indigo-500/10 transition-all select-none"
                >
                  {game}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: CTA Button Link */}
        <div className="w-full lg:w-auto shrink-0 flex items-center justify-center font-sans">
          <Link
            href="/jeux-de-societe#enjeu-app"
            className="w-full lg:w-auto flex items-center justify-center gap-3 px-7 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-indigo-950/60 transition-all hover:scale-[1.03] active:scale-95 border border-indigo-400/40"
          >
            <Smartphone className="w-4 h-4 text-emerald-300" />
            <span>Voir la fiche de l'appli 📱</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
