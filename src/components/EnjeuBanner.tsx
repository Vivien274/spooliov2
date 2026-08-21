"use client";

import React from "react";

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
            <a
              href="https://play.google.com/apps/internaltest/4700908194255410878"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] rounded-lg shadow transition-all flex items-center gap-1.5 border border-indigo-400/30"
              title="Tester sur Google Play (Test Interne)"
            >
              <span>Android</span>
              <span className="text-[10px]">📥</span>
            </a>
            <div
              className="px-2.5 py-1.5 bg-white/10 text-gray-300 font-bold text-[10px] rounded-lg border border-white/15 hidden sm:flex items-center gap-1"
              title="iOS bientôt disponible"
            >
              <span>iOS</span>
              <span className="text-[9px] text-amber-300 font-black">⏳ Bientôt</span>
            </div>
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

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-white/10">
            {/* Google Play Direct Button */}
            <a
              href="https://play.google.com/apps/internaltest/4700908194255410878"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow transition-all border border-indigo-400/30"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 512 512">
                <path d="M325.3 234.3L104.6 13l280.8 161.2-59.8 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 59.2-34.1c17-9.8 17-46 0-56.1zM104.6 499l280.8-161.2-59.8-60.1L104.6 499z" />
              </svg>
              <span>Disponible sur Google Play</span>
            </a>

            {/* Apple App Store (Coming Soon) */}
            <div className="flex-1 flex items-center justify-between gap-2 px-3.5 py-2 bg-white/95 text-slate-950 font-extrabold text-xs rounded-xl shadow border border-white/20 select-none">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 384 512">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-91.9-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.5 26.4 2.1 52.1-14.3 69.5-33.9z" />
                </svg>
                <span className="text-xs font-black">App Store</span>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                ⏳ Bientôt
              </span>
            </div>
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
            🔥 Nouveau • Application Compagnon Gratuite
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

          {/* Features bullet points */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2 pt-3 border-t border-white/10 text-xs text-gray-300 font-sans">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-base">⚡</span>
              <span>Calculs automatiques</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-base">🎲</span>
              <span>Paris &amp; Défis fun</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 text-base">☁️</span>
              <span>Synchro multi-joueurs</span>
            </div>
          </div>
        </div>

        {/* Right Side: QR Code / Download CTA Box */}
        <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
          {/* QR Code representation */}
          <div className="hidden sm:flex flex-col items-center justify-center bg-white p-3 rounded-xl text-slate-900 shadow-md">
            <div className="w-28 h-28 relative flex items-center justify-center bg-slate-950 rounded-lg p-2">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                <rect x="0" y="0" width="30" height="30" />
                <rect x="5" y="5" width="20" height="20" className="fill-slate-950" />
                <rect x="10" y="10" width="10" height="10" />

                <rect x="70" y="0" width="30" height="30" />
                <rect x="75" y="5" width="20" height="20" className="fill-slate-950" />
                <rect x="80" y="10" width="10" height="10" />

                <rect x="0" y="70" width="30" height="30" />
                <rect x="5" y="75" width="20" height="20" className="fill-slate-950" />
                <rect x="10" y="80" width="10" height="10" />

                <rect x="40" y="10" width="15" height="15" />
                <rect x="40" y="40" width="20" height="20" />
                <rect x="70" y="45" width="15" height="15" />
                <rect x="15" y="40" width="15" height="15" />
                <rect x="40" y="70" width="25" height="25" />
                <rect x="75" y="75" width="15" height="15" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-indigo-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                  ENJEU
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-700 mt-2 uppercase tracking-wide font-sans">
              Scannez pour installer
            </span>
          </div>

          {/* Direct Mobile/Desktop Badges */}
          <div className="flex flex-col gap-2.5 w-full sm:w-auto font-sans">
            {/* Apple App Store (Coming Soon) */}
            <div className="flex items-center justify-between gap-2.5 px-4 py-2.5 bg-white/95 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg border border-white/20 select-none">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 384 512">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-91.9-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.5 26.4 2.1 52.1-14.3 69.5-33.9z" />
                </svg>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[9px] uppercase font-bold text-amber-700">Bientôt sur</span>
                  <span className="text-xs font-black">App Store</span>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                ⏳ Bientôt
              </span>
            </div>

            <a
              href="https://play.google.com/apps/internaltest/4700908194255410878"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-500 font-extrabold text-xs rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 border border-indigo-400/30"
            >
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 512 512">
                <path d="M325.3 234.3L104.6 13l280.8 161.2-59.8 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 59.2-34.1c17-9.8 17-46 0-56.1zM104.6 499l280.8-161.2-59.8-60.1L104.6 499z" />
              </svg>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[9px] uppercase font-medium text-indigo-200">Disponible sur</span>
                <span className="text-xs font-black">Google Play</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
