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
        className="w-full relative border-b border-white/20 bg-[#070709] text-white min-h-[600px] sm:min-h-[660px] flex flex-col justify-between group/hero shadow-[0_15px_60px_rgba(255,255,255,0.12)] dark:shadow-[0_20px_70px_rgba(255,255,255,0.15)] overflow-hidden"
      >

        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
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
                <span className="text-xs sm:text-sm font-mono font-extrabold text-[#ff4f00] tracking-widest uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] -mb-2 sm:-mb-3">
                  {activeSlide.badge || "FABRICATION ARTISANALE À COMINES (59) • PLA BIOSOURCÉ 🌱"}
                </span>

                <div className="min-h-[75px] sm:min-h-[115px] flex items-center justify-center w-full">
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-antonio leading-[1.03] drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)] max-w-4xl">
                    {activeSlide.title}
                  </h1>
                </div>

                <div className="min-h-[36px] sm:min-h-[48px] flex items-center justify-center w-full -mt-2 sm:-mt-3">
                  <p className="text-xs sm:text-base text-white font-sans font-extrabold leading-relaxed max-w-2xl mx-auto line-clamp-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                    {activeSlide.subtitle}
                  </p>
                </div>

                {/* Single Centered Action Button - Full Neon Blue Style */}
                <div className="flex items-center justify-center w-full sm:w-auto pt-3 sm:pt-4">
                  <Link
                    href={activeSlide.buttonLink || "/boutique"}
                    className="relative group/btn w-full sm:w-auto inline-flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-300"
                  >
                    {/* Pulsing Neon Blue Ambient Halo */}
                    <div
                      className="absolute -inset-1.5 rounded-2xl blur-lg opacity-80 group-hover/btn:opacity-100 group-hover/btn:blur-xl transition-all duration-300 animate-pulse pointer-events-none"
                      style={{
                        background: "linear-gradient(90deg, #1b2bd8, #3b50ff, #2546ff, #1b2bd8)",
                      }}
                    />

                    {/* Outer Neon Blue Body Wrap */}
                    <div
                      className="relative w-full sm:w-auto h-13 sm:h-14 px-8 sm:px-10 inline-flex items-center justify-center gap-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider text-white overflow-hidden transition-all duration-300 border border-[#8fa0ff]/60 group-hover/btn:border-white shadow-[0_0_30px_rgba(47,68,255,0.75),0_0_60px_rgba(37,70,255,0.4),inset_0_1.5px_2px_rgba(255,255,255,0.7)] group-hover/btn:scale-[1.03]"
                      style={{
                        background: "linear-gradient(135deg, #1e2ce0 0%, #3448ff 50%, #1a28d4 100%)",
                        boxShadow: "0 0 28px rgba(47, 68, 255, 0.8), 0 0 55px rgba(37, 70, 255, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.7), inset 0 -2px 6px rgba(0, 0, 0, 0.35)"
                      }}
                    >
                      {/* Neon Shimmer Beam (Balayage lumineux) */}
                      <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out pointer-events-none" />

                      {/* Button Label & Icon with Drop Shadow */}
                      <span className="relative z-10 font-black tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-white">
                        {activeSlide.buttonText || "DÉCOUVRIR LA BOUTIQUE"}
                      </span>
                      <ArrowRight className="relative z-10 w-4 h-4 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
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
