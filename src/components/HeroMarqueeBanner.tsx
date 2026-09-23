"use client";

import React from "react";

export default function HeroMarqueeBanner() {
  const marqueeItems = [
    { text: "SPOOLIO", highlight: true },
    { text: "🌀 Créations 3D en polymère biosourcé" },
    { text: "🌱 Façonné à la demande à Comines" },
    { text: "🇫🇷 Zéro surstock, zéro bullshit" },
    { text: "🛠️ Objets tactiles & design ⚡" },
  ];

  const renderTrackContent = () => (
    <div className="flex items-center gap-8 shrink-0 pr-8">
      {[1, 2, 3].map((rep) => (
        <React.Fragment key={`rep-${rep}`}>
          <div className="flex items-center gap-4 shrink-0 text-xs sm:text-sm font-extrabold tracking-wide uppercase">
            <span className="text-[#ff4f00] font-black tracking-widest drop-shadow-[0_0_12px_rgba(255,79,0,0.4)]">
              SPOOLIO
            </span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-100">
              🌀 Créations 3D en polymère biosourcé
            </span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-100">
              🌱 Façonné à la demande à Comines
            </span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-100">
              🇫🇷 Zéro surstock, zéro bullshit
            </span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-100">
              🛠️ Objets tactiles &amp; design ⚡
            </span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f00]/70 shrink-0" />
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <section
      aria-label="Engagements Spoolio Atelier"
      className="w-full bg-zinc-950 border-y border-zinc-800/90 py-3 sm:py-3.5 text-zinc-100 select-none overflow-hidden relative shadow-sm group font-sans"
    >
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] items-center">
        {/* Track 1 */}
        {renderTrackContent()}
        {/* Track 2 (seamless infinite loop) */}
        <div aria-hidden="true" className="flex items-center">
          {renderTrackContent()}
        </div>
      </div>
    </section>
  );
}
