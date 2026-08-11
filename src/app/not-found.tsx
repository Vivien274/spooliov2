"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/boutique?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-spoolio-bg text-white font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-black">
      {/* Sticky Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-[800px] w-full mx-auto px-6 pt-28 lg:pt-32 pb-16 flex flex-col items-center justify-center text-center gap-8 relative z-10">
        
        {/* Background Glowing Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#ff4f00]/10 filter blur-[80px] pointer-events-none z-0" />

        {/* 3D Spaghetti Failure Animation Frame */}
        <div className="relative w-64 h-48 border border-white/10 rounded-[24px] overflow-hidden bg-black/40 flex flex-col justify-end p-4 z-10 no-invert shadow-2xl select-none">
          {/* Printer rails */}
          <div className="absolute top-3 left-6 right-6 h-0.5 bg-white/20" />
          <div className="absolute top-3 left-8 bottom-3 w-0.5 bg-white/10" />
          <div className="absolute top-3 right-8 bottom-3 w-0.5 bg-white/10" />
          
          {/* Spaghetti strings generated dynamically with SVGs */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 256 192">
            {/* Base plate */}
            <rect x="32" y="160" width="192" height="6" rx="3" fill="#ff4f00" fillOpacity="0.2" stroke="#ff4f00" strokeWidth="1" />
            
            {/* Chaotic Spaghettis with orange glows */}
            <path
              d="M 60,160 C 70,120 90,130 110,140 C 130,150 150,110 170,130 C 190,150 200,120 180,160"
              fill="none"
              stroke="#ff4f00"
              strokeWidth="2.5"
              className="animate-pulse"
              style={{ filter: "drop-shadow(0 0 4px #ff4f00)" }}
            />
            <path
              d="M 80,160 C 90,90 120,80 130,120 C 140,160 180,100 190,140 C 200,180 150,150 120,160"
              fill="none"
              stroke="#ff4f00"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 3px #ff4f00)", animationDelay: "0.2s" }}
            />
            <path
              d="M 50,160 C 100,60 140,110 160,80 C 180,50 210,120 150,155"
              fill="none"
              stroke="#ff4f00"
              strokeWidth="1.5"
              style={{ filter: "drop-shadow(0 0 2px #ff4f00)", animationDelay: "0.4s" }}
            />

            {/* Printing head nozzle moving wildly */}
            <g className="animate-printer-nozzle" style={{ transformOrigin: "128px 96px" }}>
              <path d="M 112,40 L 144,40 L 128,64 Z" fill="#222" stroke="#444" strokeWidth="1" />
              <circle cx="128" cy="62" r="3" fill="#f59e0b" className="animate-ping" />
              <path d="M 128,24 L 128,40" stroke="#ff4f00" strokeWidth="1.5" />
            </g>
          </svg>

          <span className="absolute top-4 right-8 text-[9px] font-black text-[#ff4f00]/30 uppercase tracking-widest">
            ERROR 404
          </span>
        </div>

        {/* Text Section */}
        <div className="space-y-3 max-w-md relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight font-antonio text-white">
            Impression Échouée ! 🍝
          </h1>
          <p className="text-xs md:text-sm text-gray-400 font-sans leading-relaxed">
            Le filament a fait un nœud et s'est transformé en spaghettis 3D au lieu d'imprimer cette page. Pas de panique, on peut relancer le plateau !
          </p>
        </div>

        {/* Search & Navigation Action Box */}
        <div className="w-full max-w-md bg-spoolio-card border border-spoolio-border rounded-3xl p-6 shadow-xl relative z-10 flex flex-col gap-4 font-sans">
          
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Que cherchiez-vous ? (ex: octopus, dragon...)"
              className="flex-1 h-11 bg-black border border-[#222225] rounded-xl px-4 text-xs text-white focus:outline-none focus:border-[#ff4f00] transition-colors"
            />
            <button
              type="submit"
              className="h-11 px-5 bg-white text-black hover:bg-gray-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Rechercher
            </button>
          </form>

          {/* Home Button */}
          <Link
            href="/"
            className="w-full h-11 bg-[#ff4f00] hover:bg-[#e04500] text-white font-bold text-xs tracking-wider rounded-xl uppercase transition-all duration-300 shadow-lg shadow-[#ff4f00]/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Retour à l'accueil
          </Link>
        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
