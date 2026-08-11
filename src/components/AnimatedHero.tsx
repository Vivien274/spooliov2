"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import { useTranslation } from "@/context/LanguageContext";

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

const DEFAULT_SLIDES_FR: HeroSlide[] = [
  {
    id: 1,
    badge: "🌀 PACKS SENSORIELS TDAH",
    title: "LA FOLIE DES FIDGETS SENSORIELS ⚡",
    subtitle: "Décompresser, toucher, cliquer : découvrez nos créations 3D originales faites main en France 🌱",
    buttonText: "DÉCOUVRIR LA BOUTIQUE",
    buttonLink: "/boutique",
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
    image: "/images/imported/PochetteM-1.png",
    accentColor: "#10b981"
  }
];

const DEFAULT_SLIDES_EN: HeroSlide[] = [
  {
    id: 1,
    badge: "🌀 ADHD SENSORY PACKS",
    title: "THE SENSORY FIDGET FEVER ⚡",
    subtitle: "Unwind, touch, click: discover our original 3D creations handmade in France 🌱",
    buttonText: "DISCOVER THE SHOP",
    buttonLink: "/boutique",
    image: "/images/hero_background.jpg",
    accentColor: "#ff4f00"
  },
  {
    id: 2,
    badge: "⌨️ 3D CLICKER STUDIO",
    title: "CUSTOM MECHANICAL CLICKERS 🎨",
    subtitle: "Customize keycap colors, switches, and keychain attachments for a unique ASMR feel!",
    buttonText: "DESIGN MY CLICKER",
    buttonLink: "/createur-cliqueur",
    image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    accentColor: "#00f0ff"
  },
  {
    id: 3,
    badge: "🎁 MYSTERY & LIMITED EDITION",
    title: "THE SPOOLIO SURPRISE PACK 📦",
    subtitle: "Treat yourself to a mystery assortment of brand new 3D items and fidgets crafted in Comines.",
    buttonText: "VIEW SURPRISE PACKS",
    buttonLink: "/pochette-surprise",
    image: "/images/imported/PochetteM-1.png",
    accentColor: "#10b981"
  }
];

export interface AnimatedHeroProps {
  slides?: HeroSlide[];
}

export default function AnimatedHero({ slides }: AnimatedHeroProps = {}) {
  const { locale } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const defaultSlides = locale === "en" ? DEFAULT_SLIDES_EN : DEFAULT_SLIDES_FR;
  const heroSlides = slides && slides.length > 0 ? slides : defaultSlides;

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
    <div className="w-full relative z-30 select-none no-invert">
      <Header />

      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="w-full relative rounded-b-[36px] sm:rounded-b-[56px] border-b border-white/20 bg-[#070709] text-white min-h-[600px] sm:min-h-[660px] flex flex-col justify-between group/hero shadow-[0_15px_60px_rgba(255,255,255,0.12)] dark:shadow-[0_20px_70px_rgba(255,255,255,0.15)] overflow-hidden"
      >

        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-b-[36px] sm:rounded-b-[56px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id || activeIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1.02 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={activeSlide.image}
                alt={activeSlide.title}
                fill
                priority
                className="object-cover object-center filter brightness-[0.4] saturate-[1.1]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/50 to-[#070709]/70" />
            </motion.div>
          </AnimatePresence>

          <div
            className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[160px] transition-colors duration-700 pointer-events-none"
            style={{ backgroundColor: `${activeSlide.accentColor || '#ff4f00'}25` }}
          />

          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.4) 1px, transparent 0)`, backgroundSize: '32px 32px' }} 
          />
        </div>

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
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] sm:text-xs font-mono font-extrabold text-neutral-200 tracking-wider shadow-lg uppercase">
                  <span>{activeSlide.badge || "FABRICATION ARTISANALE À COMINES (59) • PLA BIOSOURCÉ 🌱"}</span>
                </div>

                <div className="min-h-[75px] sm:min-h-[115px] flex items-center justify-center w-full">
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-antonio leading-[1.03] drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)] max-w-4xl">
                    {activeSlide.title}
                  </h1>
                </div>

                <div className="min-h-[36px] sm:min-h-[48px] flex items-center justify-center w-full -mt-1 sm:-mt-2">
                  <p className="text-xs sm:text-base text-white font-sans font-extrabold leading-relaxed max-w-2xl mx-auto line-clamp-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                    {activeSlide.subtitle}
                  </p>
                </div>

                {/* Single Centered Action Button */}
                <div className="flex items-center justify-center w-full sm:w-auto pt-4 sm:pt-6">
                  <Link
                    href={activeSlide.buttonLink || "/boutique"}
                    className="w-full sm:w-auto h-13 sm:h-14 px-8 sm:px-9 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#2F3CD9] via-[#3b49f5] to-[#2F3CD9] hover:from-[#2532c7] hover:to-[#2F3CD9] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_30px_rgba(47,60,217,0.65)] hover:shadow-[0_0_45px_rgba(47,60,217,0.9)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer border border-[#6b79ff]/60 group/btn"
                  >
                    <span>{activeSlide.buttonText || "DÉCOUVRIR LA BOUTIQUE"}</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

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
