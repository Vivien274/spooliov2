"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Star, ShieldCheck, Zap, Layers, RefreshCw, ChevronRight } from "lucide-react";
import Header from "@/components/Header";

export interface HeroSlide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  accentColor: string;
  tag?: string;
  price?: string;
}

const SHOWCASE_ITEMS: HeroSlide[] = [
  {
    id: 1,
    badge: "⌨️ STUDIO CLICKER 3D",
    title: "Clicker Mécanique Sur-Mesure",
    subtitle: "Personnalise les couleurs de touches, le switch et l'attache porte-clés pour un rendu ASMR unique.",
    buttonText: "CONCEVOIR MON CLICKER",
    buttonLink: "/createur-cliqueur",
    image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    accentColor: "#ff4f00",
    tag: "🔥 Star de TikTok",
    price: "dès 5.00€"
  },
  {
    id: 2,
    badge: "🌀 PACKS SENSORIELS TDAH",
    title: "Fidgets & Objets Tactiles",
    subtitle: "Conçus pour canaliser l'anxiété et stimuler les sens. PLA biodégradable d'amidon de maïs 🌱",
    buttonText: "DÉCOUVRIR LA BOUTIQUE",
    buttonLink: "/boutique",
    image: "/images/hero_background.jpg",
    accentColor: "#00f0ff",
    tag: "🌱 PLA Biosourcé",
    price: "dès 4.50€"
  },
  {
    id: 3,
    badge: "🎁 MYSTÈRE & CADEAU",
    title: "La Pochette Surprise Spoolio",
    subtitle: "Craquez pour un assortiment mystère d'objets 3D et fidgets inédits fabriqués à Comines.",
    buttonText: "VOIR LES POCHETTES",
    buttonLink: "/pochette-surprise",
    image: "/images/imported/PochetteM-1.png",
    accentColor: "#10b981",
    tag: "🎁 Best Seller",
    price: "dès 10.00€"
  }
];

export interface AnimatedHeroProps {
  slides?: HeroSlide[];
  topBadgeText?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function AnimatedHero({
  slides,
  topBadgeText,
  title,
  subtitle,
  buttonText,
  buttonLink
}: AnimatedHeroProps = {}) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const showcaseItems = slides && slides.length > 0 ? slides : SHOWCASE_ITEMS;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % showcaseItems.length);
    }, 4800);
    return () => clearInterval(interval);
  }, [isPaused, showcaseItems.length]);

  const activeItem = showcaseItems[activeIndex] || showcaseItems[0];

  return (
    <div className="w-full relative z-10 select-none no-invert">
      {/* =========================================================================
          NEXT-GEN HERO CONTAINER
         ========================================================================= */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="w-full relative overflow-hidden rounded-b-[36px] sm:rounded-b-[56px] border-b border-neutral-800/80 bg-[#070709] text-white min-h-[640px] lg:min-h-[680px] flex flex-col justify-between"
      >
        {/* Header Navigation Overlay */}
        <Header className="absolute top-0 left-0 right-0 h-20 sm:h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full no-invert" />

        {/* Dynamic Background Mesh Gradients & Hero Image */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Fidgets Background Photo */}
          <Image
            src="/images/hero_background.jpg"
            alt="Spoolio Fidgets Hero Background"
            fill
            priority
            className="object-cover opacity-30 dark:opacity-25 scale-105 filter blur-[1px] no-invert"
          />
          {/* Dark Vignette Overlay for Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070709]/85 via-[#070709]/75 to-[#070709]" />

          {/* Main Orange Aura Glow */}
          <div className="absolute top-[-10%] right-[-5%] w-[650px] h-[650px] rounded-full bg-[#ff4f00]/20 blur-[150px] animate-pulse" />
          {/* Cyan Secondary Glow */}
          <div className="absolute bottom-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full bg-cyan-500/15 blur-[150px]" />
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.4) 1px, transparent 0)`, backgroundSize: '32px 32px' }} 
          />
        </div>

        {/* Hero Content Grid (Left Copywriting + Right 3D Interactive Card) */}
        <div className="relative z-20 w-full max-w-[1220px] mx-auto px-5 sm:px-8 pt-28 sm:pt-32 pb-14 sm:pb-16 flex-1 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Left Column: Headlines & Action CTA */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 max-w-2xl">
            
            {/* Top Eco Status Pill (Hidden on mobile for clean hero) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] font-mono font-extrabold text-neutral-200 tracking-wide shadow-lg"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>{topBadgeText || "FABRICATION ARTISANALE À COMINES (59) • PLA BIOSOURCÉ 🌱"}</span>
            </motion.div>

            {/* Main Punchy Title */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-antonio leading-[1.03] drop-shadow-2xl"
            >
              {title ? (
                title
              ) : (
                <>
                  Objets Funs & Fidgets <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-[#ff4f00] via-[#ff7700] to-amber-300 bg-clip-text text-transparent">
                    Imprimés en 3D ⚡
                  </span>
                </>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xs sm:text-sm md:text-base text-neutral-300 font-sans font-medium leading-relaxed max-w-xl"
            >
              {subtitle || "Créations uniques conçues à partir d'amidon de maïs biosourcé. Pour canaliser l'anxiété, décompresser au bureau ou surprendre la commu !"}
            </motion.p>

            {/* Dual Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto pt-2"
            >
              <Link
                href={buttonLink || "/boutique"}
                className="w-full sm:w-auto h-13 px-8 inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#2F3CD9] via-[#3b49f5] to-[#2F3CD9] hover:from-[#2532c7] hover:to-[#2F3CD9] text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_25px_rgba(47,60,217,0.65),0_0_50px_rgba(47,60,217,0.35)] hover:shadow-[0_0_40px_rgba(47,60,217,0.9),0_0_75px_rgba(47,60,217,0.6)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer border border-[#6b79ff]/60 group relative overflow-hidden"
              >
                <span>{buttonText || "🛍️ EXPLORER LA BOUTIQUE"}</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/createur-cliqueur"
                className="w-full sm:w-auto h-13 px-7 inline-flex items-center justify-center gap-2 bg-neutral-900/90 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-neutral-700 hover:border-neutral-500 shadow-md hover:scale-[1.02] cursor-pointer"
              >
                <span>⌨️ CRÉER MON CLICKER</span>
              </Link>
            </motion.div>

            {/* Social Proof Avatar Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-3 pt-3 mb-8 sm:mb-0 text-xs text-neutral-400 font-sans"
            >
              <div className="flex -space-x-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-neutral-900 bg-orange-500 text-white font-black text-[11px] leading-none shrink-0">C</div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-neutral-900 bg-blue-500 text-white font-black text-[11px] leading-none shrink-0">J</div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-neutral-900 bg-emerald-500 text-white font-black text-[11px] leading-none shrink-0">S</div>
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                  <span>★★★★★</span>
                  <span className="text-white font-black">4.9 / 5.0</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">Recommandé par +500 passionnés</span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Interactive 3D Showcase Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full lg:w-[480px] shrink-0 space-y-4 hidden lg:block"
          >
            {/* Interactive Showcase Card */}
            <div className="relative rounded-3xl bg-neutral-900/90 border border-neutral-700/80 p-5 shadow-2xl backdrop-blur-xl overflow-hidden group">
              
              {/* Card Image Display with Animated Transition */}
              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-neutral-950 mb-4 border border-white/10 group-hover:border-[#ff4f00]/40 transition-colors">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeItem.id || activeIndex}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={activeItem.image || "/images/hero_background.jpg"}
                      alt={activeItem.title}
                      fill
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
                    
                    {/* Badge Tag */}
                    {activeItem.tag && (
                      <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/15 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow">
                        {activeItem.tag}
                      </span>
                    )}

                    {/* Price Tag */}
                    {activeItem.price && (
                      <span className="absolute top-3 right-3 bg-[#ff4f00] text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg">
                        {activeItem.price}
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Card Info Details */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {activeItem.title}
                  </h3>
                </div>
                <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                  {activeItem.subtitle}
                </p>

                <div className="pt-3">
                  <Link
                    href={activeItem.buttonLink || "/boutique"}
                    className="w-full py-2.5 bg-white/10 hover:bg-[#ff4f00] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-[#ff4f00]"
                  >
                    <span>{activeItem.buttonText || "DÉCOUVRIR"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

            </div>

            {/* Slider Dots */}
            <div className="flex items-center justify-center gap-2">
              {showcaseItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeIndex
                      ? "w-6 bg-[#ff4f00]"
                      : "w-2 bg-neutral-700 hover:bg-neutral-500"
                  }`}
                />
              ))}
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
