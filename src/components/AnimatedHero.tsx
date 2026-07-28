"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    badge: "🌀 COLLECTION FIDGETS",
    title: "LA FOLIE DES FIDGETS SENSORIELS ⚡",
    subtitle: "Décompresser, toucher, cliquer : découvrez nos créations 3D originales faites main en France 🌱",
    buttonText: "DÉCOUVRIR LA BOUTIQUE",
    buttonLink: "/boutique",
    image: "/images/hero_background.jpg",
    accentColor: "#ff4f00",
  },
  {
    id: 2,
    badge: "⌨️ SUR-MESURE & ASMR",
    title: "CRÉE TON CLICKER 3D SUR-MESURE 🎨",
    subtitle: "Choisis tes couleurs de switch, le nombre de touches et la finition de ton fidget clicker",
    buttonText: "CRÉER MON CLICKER",
    buttonLink: "/createur-cliqueur",
    image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    accentColor: "#2F3CD9",
  },
  {
    id: 3,
    badge: "🎁 ÉDITIONS LIMITÉES",
    title: "LA POCHETTE SURPRISE SPOOLIO 📦",
    subtitle: "Un assortiment mystère d'objets funs & fidgets 3D inédits dès 10.00€",
    buttonText: "VOIR LES POCHETTES",
    buttonLink: "/pochette-surprise",
    image: "/images/imported/PochetteM-1.png",
    accentColor: "#FF7700",
  },
];

export interface AnimatedHeroProps {
  slides?: HeroSlide[];
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

export default function AnimatedHero({ slides }: AnimatedHeroProps) {
  const activeSlides = slides && slides.length > 0 ? slides : HERO_SLIDES;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Reset index if slides list length changes
  useEffect(() => {
    if (currentIndex >= activeSlides.length) {
      setCurrentIndex(0);
    }
  }, [activeSlides.length, currentIndex]);

  // Auto-advance slides every 5 seconds unless paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5200);

    return () => clearInterval(timer);
  }, [isPaused, activeSlides.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const currentSlide = activeSlides[currentIndex] || activeSlides[0] || HERO_SLIDES[0];

  return (
    <div className="w-full relative z-10 select-none no-invert">
      
      {/* =========================================================================
          HERO CAROUSEL CONTAINER (FULL BLEED SLIDER BANNER)
         ========================================================================= */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="w-full relative overflow-hidden rounded-b-[36px] sm:rounded-b-[56px] border-b border-neutral-800 bg-[#08080a] text-white h-[calc(80dvh-44px)] min-h-[460px] md:h-[580px] lg:h-[620px] flex flex-col justify-between"
      >
        {/* Header Overlay */}
        <Header className="absolute top-0 left-0 right-0 h-20 sm:h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full no-invert" />

        {/* Dynamic Background Image Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={currentSlide.image}
              alt={currentSlide.title}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-35 filter contrast-125 saturate-125"
            />
            {/* Radial Dark Overlay Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/75 to-[#08080a]/40 z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#08080a_85%)] z-10" />
            
            {/* Dynamic Accent Color Glow */}
            <div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full filter blur-[140px] pointer-events-none z-10 opacity-30 transition-colors duration-700"
              style={{ backgroundColor: currentSlide.accentColor }}
            />
          </motion.div>
        </AnimatePresence>

        {/* HERO CENTERED SLIDE CONTENT */}
        <div className="relative z-20 w-full flex-1 flex flex-col items-center justify-center pt-20 sm:pt-24 pb-20 sm:pb-24 px-5 sm:px-12 max-w-[850px] mx-auto text-center">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, { offset, velocity }) => {
                const swipeThreshold = 50;
                if (offset.x < -swipeThreshold || velocity.x < -200) {
                  handleNext();
                } else if (offset.x > swipeThreshold || velocity.x > 200) {
                  handlePrev();
                }
              }}
              className="flex flex-col items-center text-center space-y-3.5 sm:space-y-5 w-full cursor-grab active:cursor-grabbing touch-pan-y"
            >
              {/* Slide Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[9px] sm:text-xs font-mono font-black text-white tracking-wider shadow-lg">
                <span>{currentSlide.badge}</span>
              </div>

              {/* Slide Title */}
              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-[family-name:var(--font-antonio)] leading-[1.05] sm:leading-[1.02] drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] px-2">
                {currentSlide.title}
              </h1>

              {/* Slide Subtitle */}
              <p className="text-xs sm:text-base md:text-lg text-neutral-200 font-sans font-medium tracking-wide leading-relaxed max-w-xl px-2">
                {currentSlide.subtitle}
              </p>

              {/* Slide CTA Button */}
              <div className="pt-2 sm:pt-3 w-full sm:w-auto flex justify-center">
                <Link
                  href={currentSlide.buttonLink}
                  className="no-invert w-full sm:w-auto h-11 sm:h-15 px-7 sm:px-10 inline-flex items-center justify-center gap-2 sm:gap-2.5 bg-gradient-to-r from-[#ff4f00] to-[#FF7700] hover:from-[#e04500] hover:to-[#ff4f00] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-full transition-all shadow-[0_10px_35px_rgba(255,79,0,0.45)] hover:shadow-[0_15px_45px_rgba(255,79,0,0.65)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer border border-white/20 group"
                >
                  <span className="text-white font-black tracking-wider">{currentSlide.buttonText}</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Dots Indicator inside Motion Container */}
              <div className="pt-3 sm:pt-5 flex items-center justify-center gap-2 z-30">
                {activeSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentIndex
                        ? "w-8 bg-[#ff4f00] shadow-[0_0_10px_rgba(255,79,0,0.8)]"
                        : "w-2.5 bg-white/20 hover:bg-white/40"
                    }`}
                    title={`Aller à la slide ${idx + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

        </div>

      </section>

    </div>
  );
}
