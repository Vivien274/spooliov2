"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";

export interface HeroSlide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  image: string;
  accentColor: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 1,
    badge: "🌀 PACKS SENSORIELS TDAH",
    title: "LA FOLIE DES FIDGETS SENSORIELS ⚡",
    subtitle: "Décompresser, toucher, cliquer : découvrez nos créations 3D originales faites main en France 🌱",
    buttonText: "DÉCOUVRIR LA BOUTIQUE",
    buttonLink: "/boutique",
    secondaryButtonText: "⌨️ CRÉER MON CLICKER",
    secondaryButtonLink: "/createur-cliqueur",
    image: "/images/hero_background.jpg",
    accentColor: "#ff4f00"
  },
  {
    id: 2,
    badge: "⌨️ STUDIO CLICKER 3D",
    title: "CLICKERS MÉCANIQUES SUR-MESURE 🎨",
    subtitle: "Personnalisez les couleurs de touches, le switch et l'attache porte-clés pour un rendu ASMR unique !",
    buttonText: "CONCEVOIR MON CLICKER",
    buttonLink: "/createur-cliqueur",
    secondaryButtonText: "🛍️ VOIR LA BOUTIQUE",
    secondaryButtonLink: "/boutique",
    image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    accentColor: "#00f0ff"
  },
  {
    id: 3,
    badge: "🎁 MYSTÈRE & ÉDITION LIMITÉE",
    title: "LA POCHETTE SURPRISE SPOOLIO 📦",
    subtitle: "Craquez pour un assortiment mystère d'objets 3D et fidgets inédits fabriqués à Comines.",
    buttonText: "VOIR LES POCHETTES",
    buttonLink: "/pochette-surprise",
    secondaryButtonText: "🛍️ EXPLORER LA BOUTIQUE",
    secondaryButtonLink: "/boutique",
    image: "/images/imported/PochetteM-1.png",
    accentColor: "#10b981"
  }
];

export interface AnimatedHeroProps {
  slides?: HeroSlide[];
}

export default function AnimatedHero({ slides }: AnimatedHeroProps = {}) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const heroSlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const activeSlide = heroSlides[activeIndex] || heroSlides[0];

  return (
    <div className="w-full relative z-10 select-none no-invert">
      {/* =========================================================================
          CENTERED MULTI-SLIDE HERO CONTAINER
         ========================================================================= */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="w-full relative overflow-hidden rounded-b-[36px] sm:rounded-b-[56px] border-b border-white/20 bg-[#070709] text-white min-h-[600px] sm:min-h-[660px] flex flex-col justify-between group/hero shadow-[0_15px_60px_rgba(255,255,255,0.12)] dark:shadow-[0_20px_70px_rgba(255,255,255,0.15)]"
      >
        {/* Header Navigation Overlay */}
        <Header className="absolute top-0 left-0 right-0 h-20 sm:h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full no-invert" />

        {/* Dynamic Background Image & Mesh Gradients with Crossfade */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Subtle Dynamic Floating Blue Halos */}
          <motion.div
            animate={{
              x: [0, 45, -35, 0],
              y: [0, -35, 25, 0],
              scale: [1, 1.12, 0.95, 1],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-24 -top-24 w-[420px] h-[420px] rounded-full bg-[#005cff]/08 blur-3xl pointer-events-none hidden dark:block z-10"
          />
          <motion.div
            animate={{
              x: [0, -40, 30, 0],
              y: [0, 30, -20, 0],
              scale: [1, 0.92, 1.1, 1],
            }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-[#2F3CD9]/08 blur-3xl pointer-events-none hidden dark:block z-10"
          />
          <motion.div
            animate={{
              x: [0, 25, -25, 0],
              scale: [1, 1.08, 0.96, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[750px] h-72 rounded-full bg-[#005cff]/07 blur-3xl pointer-events-none hidden dark:block z-10"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id || activeIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1.02 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <Image
                src={activeSlide.image || "/images/hero_background.jpg"}
                alt={activeSlide.title}
                fill
                priority
                className="object-cover opacity-35 dark:opacity-30 filter blur-[1px] no-invert"
              />
            </motion.div>
          </AnimatePresence>

          {/* Dark Vignette Overlay for Crisp Legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070709]/85 via-[#070709]/75 to-[#070709]" />

          {/* Dynamic Aura Glow Color */}
          <div
            className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[160px] transition-colors duration-700 pointer-events-none"
            style={{ backgroundColor: `${activeSlide.accentColor || '#ff4f00'}25` }}
          />

          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.4) 1px, transparent 0)`, backgroundSize: '32px 32px' }} 
          />
        </div>

        {/* Desktop Navigation Arrow Controls */}
        <button
          onClick={prevSlide}
          aria-label="Slide précédente"
          className="hidden sm:flex absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-white/30 text-white items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover/hero:opacity-100 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Slide suivante"
          className="hidden sm:flex absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-white/30 text-white items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover/hero:opacity-100 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Centered Hero Content Block with Fixed Heights */}
        <div className="relative z-20 w-full max-w-[920px] mx-auto px-5 sm:px-8 pt-24 sm:pt-32 pb-12 sm:pb-16 flex-1 flex flex-col items-center justify-center text-center">
          
          <div className="w-full min-h-[350px] sm:min-h-[380px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id || activeIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="w-full flex flex-col items-center text-center space-y-4 sm:space-y-6"
              >
                {/* Top Eco Status Pill Badge (Centered, no green dot) */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] sm:text-xs font-mono font-extrabold text-neutral-200 tracking-wider shadow-lg uppercase">
                  <span>{activeSlide.badge || "FABRICATION ARTISANALE À COMINES (59) • PLA BIOSOURCÉ 🌱"}</span>
                </div>

                {/* Main Punchy Centered Title (Fixed height container slot) */}
                <div className="min-h-[75px] sm:min-h-[115px] flex items-center justify-center w-full">
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-antonio leading-[1.03] drop-shadow-2xl max-w-4xl">
                    {activeSlide.title}
                  </h1>
                </div>

                {/* Subtitle Centered (Closer to title) */}
                <div className="min-h-[36px] sm:min-h-[48px] flex items-center justify-center w-full -mt-1 sm:-mt-2">
                  <p className="text-xs sm:text-base text-neutral-300 font-sans font-medium leading-relaxed max-w-2xl mx-auto line-clamp-2">
                    {activeSlide.subtitle}
                  </p>
                </div>

                {/* Dual Centered Action Buttons (More space above buttons) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto pt-4 sm:pt-6">
                  <Link
                    href={activeSlide.buttonLink || "/boutique"}
                    className="w-full sm:w-auto h-13 sm:h-14 px-8 sm:px-9 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#2F3CD9] via-[#3b49f5] to-[#2F3CD9] hover:from-[#2532c7] hover:to-[#2F3CD9] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_30px_rgba(47,60,217,0.65)] hover:shadow-[0_0_45px_rgba(47,60,217,0.9)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer border border-[#6b79ff]/60 group/btn"
                  >
                    <span>{activeSlide.buttonText || "DÉCOUVRIR LA BOUTIQUE"}</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href={activeSlide.secondaryButtonLink || "/createur-cliqueur"}
                    className="w-full sm:w-auto h-13 sm:h-14 px-7 sm:px-8 inline-flex items-center justify-center gap-2.5 bg-neutral-900/90 hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition-all border border-neutral-700 hover:border-neutral-500 shadow-md hover:scale-[1.02] cursor-pointer"
                  >
                    <span>{activeSlide.secondaryButtonText || "⌨️ CRÉER MON CLICKER"}</span>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Social Proof Avatar Bar Centered */}
          <div className="flex items-center justify-center gap-3 pt-2 text-xs text-neutral-400 font-sans">
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
          </div>

          {/* Slider Pagination Dots Centered */}
          <div className="flex items-center justify-center gap-2 pt-2 z-30">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Aller à la slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeIndex
                    ? "w-8 bg-[#ff4f00]"
                    : "w-2 bg-neutral-700 hover:bg-neutral-500"
                }`}
              />
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
