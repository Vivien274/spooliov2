"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TombolaFloatingBanner() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Do not render on /tombola page or in /admin area
  if (!isClient || !isVisible || pathname.startsWith("/tombola") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed right-3 sm:right-6 bottom-6 z-40 flex flex-col items-end select-none animate-slide-in">
      {isMinimized ? (
        /* Minimized floating button */
        <button
          onClick={() => setIsMinimized(false)}
          className="group relative flex items-center gap-2 bg-[#131316]/95 hover:bg-[#18181b] border border-[#ff4f00]/40 text-white px-4 py-3 rounded-full shadow-[0_0_20px_rgba(255,79,0,0.3)] transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-md"
          title="Ouvrir la Tombola Spoolio"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff4f00] animate-ping" />
          <span className="text-xl">🎟️</span>
          <span className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#ff4f00] transition-colors">
            Tombola du moment
          </span>
        </button>
      ) : (
        /* Expanded side banner card */
        <div className="relative w-[280px] sm:w-[310px] tombola-card bg-[#131316]/95 backdrop-blur-xl border border-white/10 hover:border-[#ff4f00]/40 rounded-3xl p-5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] transition-all duration-300 group overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4f00]/15 rounded-full filter blur-2xl pointer-events-none group-hover:bg-[#ff4f00]/25 transition-colors" />

          {/* Close & Minimize buttons */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 bg-[#ff4f00]/20 border border-[#ff4f00]/40 px-2.5 py-0.5 rounded-full text-[9px] font-black text-[#ff4f00] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f00] animate-ping" />
              <span>JEU CONCOURS 🎁</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                title="Réduire"
              >
                _
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                title="Fermer"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Content & Call to action */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎟️</span>
              <h4 className="text-sm font-black text-white uppercase tracking-tight">
                Grande Tombola Spoolio !
              </h4>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Réserve ta case de 1 à 40 et tente de remporter le <strong className="text-white">Mega Pack Fidget 3D (85€)</strong> !
            </p>

            <div className="pt-2">
              <Link
                href="/tombola"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#ff4f00] to-[#FF7700] hover:from-[#e04500] hover:to-[#ff4f00] text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#ff4f00]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer no-invert"
              >
                <span>Tenter ma chance</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
