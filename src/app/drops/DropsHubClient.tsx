"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DropCountdown from "@/components/drops/DropCountdown";
import { Drop } from "@/lib/drops";
import { Sparkles, Calendar, PackageCheck, Flame, ArrowRight, Clock, ShieldCheck, Box } from "lucide-react";

interface DropsHubClientProps {
  drops: Drop[];
}

export default function DropsHubClient({ drops }: DropsHubClientProps) {
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all");

  const featuredDrop = drops.find((d) => d.status === "live") || drops.find((d) => d.status === "upcoming") || drops[0];

  const filteredDrops = drops.filter((d) => {
    if (filter === "active") return d.status === "live" || d.status === "upcoming";
    if (filter === "ended") return d.status === "ended";
    return true;
  });

  return (
    <div className="relative min-h-screen bg-[#fafaf9] text-zinc-900 font-sans flex flex-col items-center selection:bg-[#ff4f00] selection:text-white">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full"
          style={{ backgroundColor: "rgba(255, 79, 0, 0.05)", filter: "blur(120px)" }}
        />
        <div
          className="absolute top-[35%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ backgroundColor: "rgba(124, 58, 237, 0.04)", filter: "blur(120px)" }}
        />
      </div>

      <Header />

      <main className="w-full max-w-[1200px] px-4 pt-28 lg:pt-32 pb-16 relative z-10 flex flex-col items-center">
        
        {/* Hero Header */}
        <div className="text-center max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Flame className="w-3.5 h-3.5 text-[#ff4f00]" />
            <span>DROP ROOM SPOOLIO ATELIER</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] mb-4">
            LES DROPS EXCLUSIFS ⚡
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 font-[family-name:var(--font-plus-jakarta)] leading-relaxed">
            Séries limitées, pièces d'atelier numérotées et créations éphémères. Chaque drop est produit en quantité restreinte et ne sera jamais réédité à l'identique.
          </p>
        </div>

        {/* Featured Drop Highlight Card */}
        {featuredDrop && (
          <div className="w-full mb-16">
            <div className="relative rounded-3xl bg-white border border-zinc-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 group transition-all">
              
              {/* Left Column: Image with Badge Overlay */}
              <div className="lg:col-span-6 relative aspect-16/10 lg:aspect-auto min-h-[280px] lg:min-h-[420px] bg-neutral-950 overflow-hidden">
                <img
                  src={featuredDrop.bannerImage}
                  alt={featuredDrop.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Status Pill on Image */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  {featuredDrop.status === "live" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      EN DIRECT MAINTENANT
                    </span>
                  ) : featuredDrop.status === "upcoming" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff4f00] text-white text-xs font-black uppercase tracking-wider shadow-lg">
                      <Clock className="w-3.5 h-3.5" />
                      PROCHAIN DROP À VENIR
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-200 text-xs font-black uppercase tracking-wider shadow-lg">
                      SOLD OUT
                    </span>
                  )}
                </div>

                {featuredDrop.editionSize && (
                  <div className="absolute bottom-4 left-4 text-xs font-mono font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                    Tirage limité : {featuredDrop.editionSize} exemplaires
                  </div>
                )}
              </div>

              {/* Right Column: Info & Countdown */}
              <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ff4f00] uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>{featuredDrop.badge}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 uppercase font-[family-name:var(--font-antonio)] leading-tight">
                    {featuredDrop.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                    {featuredDrop.tagline}
                  </p>
                </div>

                {/* Countdown Box (for upcoming drops) */}
                {featuredDrop.status === "upcoming" && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-700 uppercase tracking-wide">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#ff4f00]" />
                        Lancement officiel :
                      </span>
                      <span className="font-mono text-zinc-950">
                        {new Date(featuredDrop.startDate).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <DropCountdown targetDate={featuredDrop.startDate} />
                  </div>
                )}

                {/* CTA Link to Drop Page */}
                <div className="pt-2 flex items-center gap-4">
                  <Link
                    href={`/drops/${featuredDrop.slug}`}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#ff4f00] hover:bg-[#e04500] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#ff4f00]/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Découvrir les Produits du Drop</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
                    {featuredDrop.productIds.length} création(s) exclusive(s)
                  </span>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Section Header & Filter Tabs */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-200/90">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-950 uppercase tracking-tight font-[family-name:var(--font-antonio)]">
              Toutes les Éditions &amp; Archives 📦
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Consultez les détails des drops passés et préparez les prochains lancements.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === "all" ? "bg-white text-zinc-950 shadow-2xs font-extrabold" : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Tous ({drops.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("active")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === "active" ? "bg-white text-zinc-950 shadow-2xs font-extrabold" : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              À Venir / En cours
            </button>
            <button
              type="button"
              onClick={() => setFilter("ended")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === "ended" ? "bg-white text-zinc-950 shadow-2xs font-extrabold" : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Archives Passées
            </button>
          </div>
        </div>

        {/* Drops Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredDrops.map((drop) => {
            const isUpcoming = drop.status === "upcoming";
            const isLive = drop.status === "live";

            return (
              <Link
                key={drop.id}
                href={`/drops/${drop.slug}`}
                className="group relative rounded-3xl bg-white border border-zinc-200/90 overflow-hidden shadow-2xs hover:shadow-xl hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Top Image Preview */}
                <div className="relative aspect-16/10 w-full bg-neutral-950 overflow-hidden">
                  <img
                    src={drop.bannerImage}
                    alt={drop.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        En Direct
                      </span>
                    ) : isUpcoming ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ff4f00] text-white text-[10px] font-black uppercase tracking-wider shadow">
                        <Clock className="w-3 h-3" />
                        À Venir
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur text-zinc-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-white/10">
                        Édition Archivée
                      </span>
                    )}
                  </div>

                  {drop.editionSize && (
                    <div className="absolute bottom-3 right-3 text-[10px] font-mono font-bold text-white bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg border border-white/10">
                      {drop.editionSize} pcs
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#ff4f00] uppercase tracking-wider">
                      {drop.badge}
                    </span>
                    <h4 className="text-lg font-bold text-zinc-950 group-hover:text-[#ff4f00] transition-colors leading-snug">
                      {drop.title}
                    </h4>
                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                      {drop.tagline}
                    </p>
                  </div>

                  {/* Date & Action Row */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-mono text-[11px]">
                      {new Date(drop.startDate).toLocaleDateString("fr-FR", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    
                    <span className="font-bold text-[#ff4f00] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Voir le drop</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Reassurance Row */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-zinc-200/90 text-center">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex flex-col items-center gap-2">
            <span className="text-2xl">⏳</span>
            <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
              Quantités Limitées
            </span>
            <span className="text-[11px] text-zinc-500">
              Chaque drop est fabriqué en une seule salve. Pas de surproduction.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex flex-col items-center gap-2">
            <span className="text-2xl">🇫🇷</span>
            <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
              Atelier de Comines
            </span>
            <span className="text-[11px] text-zinc-500">
              Imprimé en 3D, assemblé et inspecté à la main dans le Nord.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex flex-col items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
              Expédition Express
            </span>
            <span className="text-[11px] text-zinc-500">
              Les créations du drop sont prêtes en stock et expédiées sous 24-48h.
            </span>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
