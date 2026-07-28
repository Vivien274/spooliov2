"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Flame,
  ArrowRight,
  Star,
  Leaf,
  Award,
  Zap,
  ChevronRight
} from "lucide-react";
import Header from "@/components/Header";

export interface AnimatedHeroProps {
  topBadgeText?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  cardBadge?: string;
  cardTitle?: string;
  cardPrice?: string;
  cardTags?: string;
  cardLink?: string;
  cardImage?: string;
  imageUrl?: string;
  imagePosition?: string;
}

export default function AnimatedHero({
  topBadgeText = "🟢 ATELIER EN ACTION (COMINES 🇫🇷) • PLA BIOSOURCÉ",
  title = "L'IMPRESSION 3D QUI A DU PUNCH 🌀",
  subtitle = "Objets funs, fidgets sensoriels TDAH & clickers sur-mesure faits main en France avec du plastique biosourcé 🌱",
  buttonText = "🛠️ CRÉER MON CLICKER 3D",
  buttonLink = "/createur-cliqueur",
  secondaryButtonText = "🛍️ VOIR LA BOUTIQUE",
  secondaryButtonLink = "/boutique",
  cardBadge = "🔥 PRODUIT STAR 3D",
  cardTitle = "⌨️ Fidget Clicker 3D Custom",
  cardPrice = "À partir de 3.00€",
  cardTags = "🎨 12 Couleurs PLA • ⚡ 1 à 9 Touches • 🌱 PLA Biosourcé",
  cardLink = "/createur-cliqueur",
  cardImage = "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
  imageUrl = "/images/hero_background.jpg",
  imagePosition = "center center",
}: AnimatedHeroProps) {
  return (
    <div className="w-full relative z-10 select-none">
      
      {/* =========================================================================
          HERO MAIN CONTAINER (SPLIT SCREEN LAYOUT)
         ========================================================================= */}
      <section className="w-full relative overflow-hidden rounded-b-[40px] sm:rounded-b-[56px] border-b border-[#1f1f23] bg-[#08080a] text-white">
        
        {/* Header Overlay */}
        <Header className="absolute top-0 left-0 right-0 h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full no-invert" />

        {/* Background Ambient Glows & Mesh Grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-[#ff4f00]/25 via-purple-600/15 to-transparent rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-[-100px] right-[-50px] w-[500px] h-[500px] bg-gradient-to-tl from-cyan-500/15 via-blue-600/10 to-transparent rounded-full blur-[140px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:28px_28px]" />
        </div>

        {/* SPLIT SCREEN GRID CONTENT */}
        <div className="relative w-full pt-20 sm:pt-28 pb-8 sm:pb-16 px-4 sm:px-8 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12 items-center z-10 no-invert">
          
          {/* =========================================================================
              LEFT COLUMN: VALUE PROPOSITION & DUAL CTAs (SPAN 7)
             ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3.5 sm:space-y-5"
          >
            
            {/* Live Workshop Status Badge */}
            {topBadgeText && (
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] sm:text-xs font-mono font-bold text-neutral-300 shadow-xl max-w-full">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="truncate">{topBadgeText}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-white font-[family-name:var(--font-antonio)] leading-[0.95] drop-shadow-2xl">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-xs sm:text-base text-neutral-300 font-sans tracking-wide leading-relaxed max-w-xl">
                {subtitle}
              </p>
            )}

            {/* Dual Action Buttons */}
            <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
              {buttonText && buttonLink && (
                <Link
                  href={buttonLink}
                  className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#ff4f00] to-[#e04500] hover:from-[#e04500] hover:to-[#ff4f00] text-white font-black text-xs uppercase tracking-wider rounded-full transition-all shadow-[0_10px_30px_rgba(255,79,0,0.35)] hover:shadow-[0_15px_40px_rgba(255,79,0,0.5)] active:scale-[0.98] cursor-pointer border border-white/20 group"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}

              {secondaryButtonText && secondaryButtonLink && (
                <Link
                  href={secondaryButtonLink}
                  className="w-full sm:w-auto h-11 sm:h-14 px-6 sm:px-8 inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all border border-white/10 backdrop-blur-md active:scale-[0.98] cursor-pointer"
                >
                  <span>{secondaryButtonText}</span>
                </Link>
              )}
            </div>

            {/* Google Rating Pill */}
            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-[11px] sm:text-xs text-neutral-400 font-sans">
              <div className="flex items-center text-amber-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-white">4.9 / 5.0</span>
              <span className="text-neutral-500">•</span>
              <span>+1500 clients ravis</span>
            </div>

          </motion.div>


          {/* =========================================================================
              RIGHT COLUMN: INTERACTIVE AURORA CARD SHOWCASE (SPAN 5)
             ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, x: 25, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 w-full flex justify-center"
          >
            <div className="relative group w-full max-w-md">
              
              {/* 1. OUTER AURORA AMBIENT GLOW (Soft Blur 3D Aura) */}
              <div className="absolute -inset-3 rounded-[36px] opacity-70 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none overflow-hidden">
                <div
                  className="w-[200%] h-[200%] absolute -top-1/2 -left-1/2 bg-[conic-gradient(from_0deg_at_50%_50%,#ff4f00_0deg,#8b5cf6_90deg,#06b6d4_180deg,#ec4899_270deg,#ff4f00_360deg)]"
                  style={{ animation: "spin 9s linear infinite" }}
                />
              </div>

              {/* 2. AURORA BORDER FRAME */}
              <div className="relative p-[1.5px] rounded-3xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.015]">
                
                {/* Rotating Conic Border Line */}
                <div
                  className="w-[250%] h-[250%] absolute -top-[75%] -left-[75%] bg-[conic-gradient(from_0deg_at_50%_50%,#ff4f00_0deg,#8b5cf6_90deg,#06b6d4_180deg,#ec4899_270deg,#ff4f00_360deg)] opacity-85 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ animation: "spin 9s linear infinite" }}
                />

                {/* 3. INNER GLASSMORPHIC CARD CONTENT */}
                <div className="relative rounded-[calc(1.5rem-1.5px)] bg-[#0b0b0f] p-5 backdrop-blur-3xl space-y-4 overflow-hidden z-10 border border-white/10">
                  
                  {/* Clean Ambient Glass Sheen Overlay on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20 bg-gradient-to-tr from-[#ff4f00]/10 via-transparent to-cyan-400/10" />

                  {/* Top Badge Overlay */}
                  <div className="flex items-center justify-between z-10 relative">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r from-[#ff4f00] to-[#e04500] text-white shadow-lg border border-white/20 flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-white" />
                      <span>{cardBadge || "PRODUIT STAR 3D"}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      En stock
                    </span>
                  </div>

                  {/* Main Product Image Visual / Video */}
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-inner group/img cursor-pointer">
                    {cardImage && (cardImage.endsWith(".mp4") || cardImage.endsWith(".webm") || cardImage.includes("video")) ? (
                      <video
                        src={cardImage}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                      />
                    ) : (
                      <Image
                        src={cardImage || "/images/imported/Spoolio_Kit-Festival-16-scaled.webp"}
                        alt={cardTitle || "Fidget Clicker 3D Spoolio"}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover/img:scale-105"
                      />
                    )}
                    
                    {/* Floating Price Tag */}
                    {cardPrice && (
                      <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 shadow-xl text-xs font-mono font-bold text-white z-10">
                        {cardPrice}
                      </div>
                    )}
                  </div>

                  {/* Product Info & Quick Spec Chips */}
                  <div className="space-y-2.5 z-10 relative">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-white font-[family-name:var(--font-antonio)] uppercase tracking-wide">
                        {cardTitle}
                      </h3>
                    </div>

                    {/* Feature Tags */}
                    {cardTags && (
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-neutral-300">
                        {cardTags.split("•").map((tag, idx) => (
                          <span key={idx} className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Direct Link Button */}
                    {cardLink && (
                      <Link
                        href={cardLink}
                        className="w-full py-3 rounded-xl bg-white/10 hover:bg-[#ff4f00] text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-white/15 hover:border-[#ff4f00] shadow-md active:scale-98"
                      >
                        <span>Découvrir l'objet 3D</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>

                </div>

              </div>

            </div>
          </motion.div>

        </div>

      </section>


      {/* =========================================================================
          PROPOSITION 5: SOCIAL PROOF & REASSURANCE RIBBON (4 PILLARS)
         ========================================================================= */}
      <section className="w-full bg-[#0d0d10] border-y border-[#1f1f23] py-6 px-4 sm:px-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Pillar 1: Artisanat Français */}
          <div className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-[#ff4f00]/10 border border-[#ff4f00]/30 flex items-center justify-center text-[#ff4f00] shrink-0 group-hover:border-[#ff4f00] group-hover:scale-105 transition-all shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Artisanat Français</h4>
              <p className="text-[11px] text-neutral-400 font-sans mt-0.5">Fabriqué à Comines (Nord) 🇫🇷</p>
            </div>
          </div>

          {/* Pillar 2: PLA Biosourcé */}
          <div className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:border-emerald-400 group-hover:scale-105 transition-all shadow-inner">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">PLA Biosourcé</h4>
              <p className="text-[11px] text-neutral-400 font-sans mt-0.5">Plastique d'origine végétale</p>
            </div>
          </div>

          {/* Pillar 3: Avis Clients Google */}
          <div className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:border-amber-400 group-hover:scale-105 transition-all shadow-inner">
              <Star className="w-5 h-5 fill-amber-400/20" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Note 4.9 / 5.0</h4>
              <p className="text-[11px] text-neutral-400 font-sans mt-0.5">Recommandé par nos clients</p>
            </div>
          </div>

          {/* Pillar 4: Expédition Rapide */}
          <div className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:border-cyan-400 group-hover:scale-105 transition-all shadow-inner">
              <Zap className="w-5 h-5 fill-cyan-400/20" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Expédition 24/48h</h4>
              <p className="text-[11px] text-neutral-400 font-sans mt-0.5">Atelier réactif &amp; zéro surstock</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
