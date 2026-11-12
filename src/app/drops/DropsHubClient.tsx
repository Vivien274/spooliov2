"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DropCountdown from "@/components/drops/DropCountdown";
import DropAlertForm from "@/components/drops/DropAlertForm";
import { Drop, getDropTitleScale, isTeaserDrop } from "@/lib/drops";
import { Sparkles, Calendar, PackageCheck, Flame, ArrowRight, Clock, ShieldCheck, Box, Lock } from "lucide-react";

interface DropsHubClientProps {
  drops: Drop[];
}

export default function DropsHubClient({ drops }: DropsHubClientProps) {
  useEffect(() => {
    document.title = "Drops | Spoolio";
  }, []);

  // Top featured block: active (live) drop in priority, or upcoming drop, or teaser drop, otherwise first drop
  const featuredDrop =
    drops.find((d) => d.status === "live") ||
    drops.find((d) => d.status === "upcoming") ||
    drops.find((d) => isTeaserDrop(d)) ||
    drops[0];

  // Other drops (excluding the top featured one)
  const otherDrops = drops.filter((d) => d.id !== featuredDrop?.id);
  const teaserDrops = otherDrops.filter((d) => isTeaserDrop(d));
  const pastDrops = otherDrops.filter((d) => !isTeaserDrop(d));

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
        {featuredDrop && (() => {
          const isTeaser = isTeaserDrop(featuredDrop);
          const fTheme = featuredDrop.theme;
          const fBg = fTheme?.bgColor || "#ffffff";
          const fText = fTheme?.textColor || "#09090b";
          const fSubtitle = fTheme?.subtitleColor || "#52525b";
          const fAccent = fTheme?.accentColor || "#ff4f00";
          const fBorder = fTheme?.borderColor || "rgba(228, 228, 231, 0.9)";
          const fCardBg = fTheme?.cardBgColor || "rgba(255, 255, 255, 0.08)";
          const fTitleFont = fTheme?.titleFont || "var(--font-antonio)";
          const fBtnBg = fTheme?.buttonBgColor || fAccent;
          const fBtnText = fTheme?.buttonTextColor || "#ffffff";
          const fBadgeBg = fTheme?.badgeBgColor || "rgba(255, 79, 0, 0.15)";
          const fBadgeText = fTheme?.badgeTextColor || fAccent;

          return (
            <div className="w-full mb-16">
              <div
                className="relative rounded-3xl border shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 group transition-all"
                style={{ background: fBg, borderColor: fBorder }}
              >
                
                {/* Left Column: Info, Story & Countdown (inversé : contenu à gauche) */}
                <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 order-2 lg:order-1">
                  <div className="space-y-3">
                    <div
                      className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-full w-fit backdrop-blur-xs"
                      style={{ backgroundColor: fBadgeBg, color: fBadgeText }}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{featuredDrop.badge}</span>
                    </div>

                    <div className="space-y-1">
                      {featuredDrop.dropNumber && (
                        <span className="block text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-[#ff4f00]">
                          {featuredDrop.dropNumber}
                        </span>
                      )}
                      <h2
                        className="font-extrabold uppercase leading-tight"
                        style={{
                          fontFamily: fTitleFont,
                          color: fText,
                          fontSize: `calc(clamp(1.5rem, 3.5vw, 2.5rem) * ${getDropTitleScale(fTheme?.titleSize)})`,
                        }}
                      >
                        {featuredDrop.dropName || featuredDrop.title}
                      </h2>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: fSubtitle }}>
                      {featuredDrop.tagline}
                    </p>
                  </div>

                  {/* Countdown or Teaser Box */}
                  {isTeaser ? (
                    <div className="pt-1">
                      <DropAlertForm
                        dropSlug={featuredDrop.slug}
                        dropTitle={featuredDrop.title}
                      />
                    </div>
                  ) : featuredDrop.status === "upcoming" ? (
                    <div
                      className="p-4 sm:p-5 rounded-2xl border space-y-3 backdrop-blur-xs"
                      style={{ backgroundColor: fCardBg, borderColor: fBorder }}
                    >
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide">
                        <span className="flex items-center gap-1.5" style={{ color: fSubtitle }}>
                          <Calendar className="w-3.5 h-3.5" style={{ color: fAccent }} />
                          Lancement officiel :
                        </span>
                        <span className="font-mono" style={{ color: fText }}>
                          {new Date(featuredDrop.startDate).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <DropCountdown targetDate={featuredDrop.startDate} theme={fTheme} />
                    </div>
                  ) : null}

                  {/* CTA Action */}
                  <div className="pt-2 flex items-center gap-4">
                    {isTeaser ? (
                      <div
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-zinc-200/80 text-zinc-600 border border-zinc-300/80 select-none cursor-not-allowed shadow-xs"
                      >
                        <Lock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Date non dévoilée</span>
                      </div>
                    ) : (
                      <Link
                        href={`/drops/${featuredDrop.slug}`}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          backgroundColor: fBtnBg,
                          color: fBtnText,
                          boxShadow: `0 10px 25px -5px ${fAccent}50`,
                        }}
                      >
                        <span>Découvrir les Produits du Drop</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}

                    <span className="text-xs font-mono hidden sm:inline" style={{ color: fSubtitle }}>
                      {isTeaser ? "Projet en fabrication à l'atelier" : `${featuredDrop.productIds.length} création(s) exclusive(s)`}
                    </span>
                  </div>

                </div>

                {/* Right Column: Image or Video with Teaser / Status Overlay */}
                <div className="lg:col-span-5 relative aspect-16/10 lg:aspect-auto min-h-[280px] lg:min-h-[420px] bg-neutral-950 overflow-hidden order-1 lg:order-2">
                  {featuredDrop.bannerVideo && !isTeaser ? (
                    <video
                      src={featuredDrop.bannerVideo}
                      poster={featuredDrop.bannerImage}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={featuredDrop.bannerImage}
                      alt={featuredDrop.title}
                      className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                        isTeaser ? "filter blur-md scale-105" : ""
                      }`}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Teaser Mysterious Lock Overlay */}
                  {isTeaser && (
                    <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[3px] flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl shadow-xl mb-3">
                        🔮
                      </div>
                      <span className="text-xs font-mono font-black text-white uppercase tracking-widest bg-black/60 px-3.5 py-1.5 rounded-full border border-white/20 shadow-sm">
                        Projet en cours de fabrication
                      </span>
                      <p className="text-[11px] text-zinc-300 font-sans mt-2 max-w-xs">
                        Secrets d'atelier · Pièces exclusives révélées prochainement
                      </p>
                    </div>
                  )}
                  
                  {/* Status Pill on Image */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                    {isTeaser ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/85 backdrop-blur-md text-white text-xs font-mono font-bold uppercase tracking-wider border border-white/20 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        À VENIR
                      </span>
                    ) : featuredDrop.status === "live" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        EN DIRECT
                      </span>
                    ) : featuredDrop.status === "upcoming" ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-black uppercase tracking-wider shadow-lg"
                        style={{ backgroundColor: fAccent }}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        PROCHAIN DROP
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur text-zinc-300 text-xs font-mono font-bold uppercase tracking-wider border border-white/10 shadow-lg">
                        SOLD OUT
                      </span>
                    )}
                  </div>

                  {featuredDrop.editionSize && (
                    <div className="absolute bottom-4 right-4 text-xs font-mono font-bold text-white bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 z-20">
                      Tirage limité : {featuredDrop.editionSize} exemplaires
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })()}

        {/* Section: Projets à Venir (Teasers Flous) */}
        {teaserDrops.length > 0 && (
          <div className="w-full mb-14">
            <div className="w-full mb-6 pb-3 border-b border-zinc-200/90 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>En Préparation</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 uppercase tracking-tight font-[family-name:var(--font-antonio)]">
                  Projets à Venir 🔮 ({teaserDrops.length})
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  Aperçus des prochaines séries de l'atelier Spoolio. Les créations et dates seront révélées prochainement.
                </p>
              </div>

              <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
                Séries non dévoilées
              </span>
            </div>

            <div className="w-full flex flex-col gap-6 sm:gap-8">
              {teaserDrops.map((drop) => {
                const dTheme = drop.theme;
                const dBg = dTheme?.bgColor || "#ffffff";
                const dText = dTheme?.textColor || "#09090b";
                const dSubtitle = dTheme?.subtitleColor || "#71717a";
                const dAccent = dTheme?.accentColor || "#ff4f00";
                const dBorder = dTheme?.borderColor || "rgba(228, 228, 231, 0.9)";
                const dTitleFont = dTheme?.titleFont || "var(--font-antonio)";
                const dBadgeBg = dTheme?.badgeBgColor || "rgba(255, 79, 0, 0.15)";
                const dBadgeText = dTheme?.badgeTextColor || dAccent;

                return (
                  <div
                    key={drop.id}
                    className="relative rounded-3xl border shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 cursor-default select-none group transition-all"
                    style={{ background: dBg, borderColor: dBorder }}
                  >
                    {/* Left Column: Contenus à gauche (lg:col-span-7) */}
                    <div className="lg:col-span-7 p-6 sm:p-8 lg:p-9 flex flex-col justify-between space-y-6 order-2 lg:order-1">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full w-fit backdrop-blur-xs"
                            style={{ backgroundColor: dBadgeBg, color: dBadgeText }}
                          >
                            <span>{drop.badge}</span>
                          </span>

                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-900/80 backdrop-blur text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-white/10">
                            🔮 Projet Secret
                          </span>
                        </div>

                        <div className="space-y-1">
                          {drop.dropNumber && (
                            <span className="block text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-[#ff4f00]">
                              {drop.dropNumber}
                            </span>
                          )}
                          <h3
                            className="font-extrabold uppercase leading-tight"
                            style={{
                              fontFamily: dTitleFont,
                              color: dText,
                              fontSize: `calc(clamp(1.25rem, 2.5vw, 1.875rem) * ${getDropTitleScale(dTheme?.titleSize)})`,
                            }}
                          >
                            {drop.dropName || drop.title}
                          </h3>
                        </div>

                        <p
                          className="text-xs sm:text-sm leading-relaxed font-medium line-clamp-2"
                          style={{ color: dSubtitle }}
                        >
                          {drop.tagline || drop.description}
                        </p>
                      </div>

                      {/* Inscription alerte pour ce drop à venir */}
                      <DropAlertForm
                        dropSlug={drop.slug}
                        dropTitle={drop.title}
                        className="my-1"
                      />

                      {/* Metadata & Teaser Pill Row */}
                      <div
                        className="pt-4 border-t flex flex-wrap items-center justify-between gap-4"
                        style={{ borderColor: dBorder }}
                      >
                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono" style={{ color: dSubtitle }}>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" style={{ color: dAccent }} />
                            <span>Lancement : À venir</span>
                          </span>

                          {drop.editionSize && (
                            <>
                              <span>•</span>
                              <span>Tirage limité : {drop.editionSize} pcs</span>
                            </>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-zinc-200/80 text-zinc-600 border border-zinc-300/80 shadow-xs">
                          <Lock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>À Venir</span>
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Image floue à droite (lg:col-span-5) */}
                    <div className="lg:col-span-5 relative aspect-16/10 lg:aspect-auto min-h-[220px] lg:min-h-[280px] bg-neutral-950 overflow-hidden order-1 lg:order-2">
                      <img
                        src={drop.bannerImage}
                        alt={drop.title}
                        className="w-full h-full object-cover filter blur-md scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-neutral-950/45 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-10 pointer-events-none">
                        <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl shadow-lg mb-2">
                          🔮
                        </div>
                        <span className="text-[11px] font-mono font-black text-white uppercase tracking-wider bg-black/60 px-3 py-1 rounded-full border border-white/20">
                          Projet en préparation
                        </span>
                      </div>

                      <div className="absolute top-4 right-4 z-20">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/85 backdrop-blur-md text-white text-[11px] font-mono font-bold uppercase tracking-wider border border-white/20 shadow-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          À VENIR
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section Header: Archives des Drops Passés */}
        {pastDrops.length > 0 && (
          <div className="w-full mb-8 pb-4 border-b border-zinc-200/90 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                <span>Collections Antérieures</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 uppercase tracking-tight font-[family-name:var(--font-antonio)]">
                Archives des Drops Passés 📦 ({pastDrops.length})
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Tirages d'atelier limités et collections écoulées. Cliquez sur une archive pour explorer ses créations.
              </p>
            </div>

            <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
              Liste chronologique
            </span>
          </div>
        )}

        {/* Vertical List of Past Drops */}
        {pastDrops.length > 0 ? (
          <div className="w-full flex flex-col gap-6 sm:gap-8 mb-16">
            {pastDrops.map((drop) => {
              const dTheme = drop.theme;
              const dBg = dTheme?.bgColor || "#ffffff";
              const dText = dTheme?.textColor || "#09090b";
              const dSubtitle = dTheme?.subtitleColor || "#71717a";
              const dAccent = dTheme?.accentColor || "#ff4f00";
              const dBorder = dTheme?.borderColor || "rgba(228, 228, 231, 0.9)";
              const dTitleFont = dTheme?.titleFont || "var(--font-antonio)";
              const dBadgeBg = dTheme?.badgeBgColor || "rgba(255, 79, 0, 0.15)";
              const dBadgeText = dTheme?.badgeTextColor || dAccent;

              return (
                <Link
                  key={drop.id}
                  href={`/drops/${drop.slug}`}
                  className="group relative rounded-3xl border shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 cursor-pointer"
                  style={{ background: dBg, borderColor: dBorder }}
                >
                  {/* Left Column: Contenus à gauche (lg:col-span-7) */}
                  <div className="lg:col-span-7 p-6 sm:p-8 lg:p-9 flex flex-col justify-between space-y-6 order-2 lg:order-1">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full w-fit backdrop-blur-xs"
                          style={{ backgroundColor: dBadgeBg, color: dBadgeText }}
                        >
                          <span>{drop.badge}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur text-zinc-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-white/10">
                          Édition Archivée
                        </span>
                      </div>

                      <div className="space-y-1">
                        {drop.dropNumber && (
                          <span className="block text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-[#ff4f00]">
                            {drop.dropNumber}
                          </span>
                        )}
                        <h3
                          className="font-extrabold uppercase leading-tight group-hover:opacity-90 transition-opacity"
                          style={{
                            fontFamily: dTitleFont,
                            color: dText,
                            fontSize: `calc(clamp(1.25rem, 2.5vw, 1.875rem) * ${getDropTitleScale(dTheme?.titleSize)})`,
                          }}
                        >
                          {drop.dropName || drop.title}
                        </h3>
                      </div>

                      <p
                        className="text-xs sm:text-sm leading-relaxed font-medium line-clamp-2"
                        style={{ color: dSubtitle }}
                      >
                        {drop.tagline || drop.description}
                      </p>
                    </div>

                    {/* Metadata & CTA Row */}
                    <div
                      className="pt-4 border-t flex flex-wrap items-center justify-between gap-4"
                      style={{ borderColor: dBorder }}
                    >
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono" style={{ color: dSubtitle }}>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" style={{ color: dAccent }} />
                          <span>
                            {new Date(drop.startDate).toLocaleDateString("fr-FR", {
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </span>

                        {drop.editionSize && (
                          <>
                            <span>•</span>
                            <span>{drop.editionSize} exemplaires</span>
                          </>
                        )}

                        <span>•</span>
                        <span>{drop.productIds.length} article(s)</span>
                      </div>

                      <span
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider group-hover:translate-x-1.5 transition-transform"
                        style={{ color: dAccent }}
                      >
                        <span>Voir les Produits</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Image or Video à droite (lg:col-span-5) */}
                  <div className="lg:col-span-5 relative aspect-16/10 lg:aspect-auto min-h-[220px] lg:min-h-[280px] bg-neutral-950 overflow-hidden order-1 lg:order-2">
                    {drop.bannerVideo ? (
                      <video
                        src={drop.bannerVideo}
                        poster={drop.bannerImage}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <img
                        src={drop.bannerImage}
                        alt={drop.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />

                    {drop.editionSize && (
                      <div className="absolute bottom-4 right-4 text-xs font-mono font-bold text-white bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                        Tirage atelier : {drop.editionSize} pcs
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}

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
