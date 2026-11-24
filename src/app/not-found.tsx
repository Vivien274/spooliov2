"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TechText from "@/components/TechText";
import { Search, Home, Sparkles, Gift, Compass, HelpCircle } from "lucide-react";

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
    <div className="min-h-screen bg-[#FAF9F6] text-[#121212] font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-white">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 pt-28 lg:pt-36 pb-20 flex flex-col items-center justify-center text-center gap-8 relative z-10">
        {/* Subtle blueprint grid backdrop */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#121212 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Eyebrow */}
        <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E4E4E0] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-600">
            Erreur 404 // Objet non répertorié
          </span>
        </div>

        {/* Interactive Tech Text 404 */}
        <div className="relative z-10">
          <TechText text="404" />
        </div>

        {/* Funny Brand-Aligned Copy */}
        <div className="space-y-3 max-w-lg relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-antonio text-[#121212] leading-tight">
            Cette page s&apos;est fait la malle.
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 font-sans leading-relaxed">
            Soit elle n&apos;a jamais existé, soit quelqu&apos;un l&apos;a glissée dans un Blind Bag.
            Dans le doute, on vous ramène à l&apos;accueil !
          </p>
        </div>

        {/* Search & Navigation Action Box */}
        <div className="w-full max-w-lg bg-white border border-[#E4E4E0] rounded-3xl p-6 sm:p-7 shadow-xs relative z-10 flex flex-col gap-4 font-sans">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Que cherchiez-vous ? (ex: clicker, vase, goofy...)"
                className="w-full h-11 pl-10 pr-4 bg-[#FAF9F6] border border-[#E4E4E0] rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#ff4f00] focus:bg-white focus:ring-2 focus:ring-[#ff4f00]/15 transition-all"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-5 bg-[#121212] hover:bg-[#ff4f00] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
            >
              Rechercher
            </button>
          </form>

          <Link
            href="/"
            className="w-full h-11 bg-[#ff4f00] hover:bg-[#e04500] text-white font-bold text-xs tracking-wider rounded-xl uppercase transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Retour à l&apos;accueil</span>
          </Link>

          <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[11px] text-zinc-400 font-medium mr-1">Raccourcis :</span>
            <Link
              href="/boutique"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 text-[11px] font-semibold transition-colors"
            >
              <Sparkles className="w-3 h-3 text-[#ff4f00]" />
              <span>Boutique</span>
            </Link>
            <Link
              href="/noel"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 text-[11px] font-semibold transition-colors"
            >
              <Gift className="w-3 h-3 text-[#ff4f00]" />
              <span>Coffrets Noël</span>
            </Link>
            <Link
              href="/trouveur-de-cadeau"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 text-[11px] font-semibold transition-colors"
            >
              <Compass className="w-3 h-3 text-[#005CFF]" />
              <span>Trouveur de Cadeau</span>
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 text-[11px] font-semibold transition-colors"
            >
              <HelpCircle className="w-3 h-3 text-zinc-400" />
              <span>Aide</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
