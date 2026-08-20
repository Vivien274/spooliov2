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

  // Floating Product Card
  cardProductId?: number | string;
  cardTitle?: string;
  cardDescription?: string;
  cardPrice?: string;
  cardImage?: string;
  cardLink?: string;
}

function stripEmojis(text: string) {
  if (!text) return "";
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]/gu, "").trim();
}

function renderFormattedText(text: string) {
  if (!text) return null;
  const parts = text.split(/<br\s*\/?>|\n/gi);
  return parts.map((part, index) => (
    <React.Fragment key={index}>
      {part}
      {index < parts.length - 1 && <br />}
    </React.Fragment>
  ));
}

const DEFAULT_SLIDES_FR: HeroSlide[] = [
  {
    id: 1,
    badge: "PACKS SENSORIELS TDAH",
    title: "LA FOLIE DES FIDGETS SENSORIELS ⚡",
    subtitle: "Décompresser, toucher, cliquer : découvrez nos créations 3D originales faites main en France 🌱",
    buttonText: "DÉCOUVRIR LA BOUTIQUE",
    buttonLink: "/boutique",
    image: "/images/hero_background.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Pack Fidget Sensory TDAH",
    cardDescription: "Assortiment anti-stress fabriqué en PLA biosourcé.",
    cardPrice: "14.90€",
    cardImage: "/images/hero_background.jpg",
    cardLink: "/boutique"
  },
  {
    id: 2,
    badge: "STUDIO CLICKER 3D",
    title: "CLICKERS MÉCANIQUES SUR-MESURE 🎨",
    subtitle: "Personnalisez les couleurs de touches, le switch et l'attache porte-clés pour un rendu ASMR unique !",
    buttonText: "CONCEVOIR MON CLICKER",
    buttonLink: "/createur-cliqueur",
    image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    accentColor: "#00f0ff",
    cardTitle: "Fidget Clicker 3D Custom",
    cardDescription: "Sensations ASMR avec switchs interchangeables.",
    cardPrice: "À partir de 3.00€",
    cardImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    cardLink: "/createur-cliqueur"
  },
  {
    id: 3,
    badge: "MYSTÈRE & ÉDITION LIMITÉE",
    title: "LA POCHETTE SURPRISE SPOOLIO 📦",
    subtitle: "Craquez pour un assortiment mystère d'objets 3D et fidgets inédits fabriqués à Comines.",
    buttonText: "VOIR LES POCHETTES",
    buttonLink: "/pochette-surprise",
    image: "/images/imported/PochetteM-1.png",
    accentColor: "#10b981",
    cardTitle: "Pochette Surprise Spoolio",
    cardDescription: "3 à 5 créations 3D et fidgets mystères inédits.",
    cardPrice: "10.00€",
    cardImage: "/images/imported/PochetteM-1.png",
    cardLink: "/pochette-surprise"
  }
];

const DEFAULT_SLIDES_EN: HeroSlide[] = [
  {
    id: 1,
    badge: "ADHD SENSORY PACKS",
    title: "THE SENSORY FIDGET FEVER ⚡",
    subtitle: "Unwind, touch, click: discover our original 3D creations handmade in France 🌱",
    buttonText: "DISCOVER THE SHOP",
    buttonLink: "/boutique",
    image: "/images/hero_background.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Sensory Fidget ADHD Pack",
    cardDescription: "Stress-relieving assortment 3D printed with bio-sourced PLA.",
    cardPrice: "€14.90",
    cardImage: "/images/hero_background.jpg",
    cardLink: "/boutique"
  },
  {
    id: 2,
    badge: "3D CLICKER STUDIO",
    title: "CUSTOM MECHANICAL CLICKERS 🎨",
    subtitle: "Customize keycap colors, switches, and keychain attachments for a unique ASMR feel!",
    buttonText: "DESIGN MY CLICKER",
    buttonLink: "/createur-cliqueur",
    image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    accentColor: "#00f0ff",
    cardTitle: "Custom 3D Fidget Clicker",
    cardDescription: "Unique ASMR sensation with hot-swappable switches.",
    cardPrice: "From €3.00",
    cardImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    cardLink: "/createur-cliqueur"
  },
  {
    id: 3,
    badge: "MYSTERY & LIMITED EDITION",
    title: "THE SPOOLIO SURPRISE PACK 📦",
    subtitle: "Treat yourself to a mystery assortment of brand new 3D items and fidgets crafted in Comines.",
    buttonText: "VIEW SURPRISE PACKS",
    buttonLink: "/pochette-surprise",
    image: "/images/imported/PochetteM-1.png",
    accentColor: "#10b981",
    cardTitle: "Spoolio Mystery Surprise Pack",
    cardDescription: "3 to 5 mystery 3D items and exclusive fidgets.",
    cardPrice: "€10.00",
    cardImage: "/images/imported/PochetteM-1.png",
    cardLink: "/pochette-surprise"
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
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const activeSlide = heroSlides[activeIndex] || heroSlides[0];

  // Fallback card details if missing
  const cardTitle = activeSlide.cardTitle || activeSlide.title || "Produit Spoolio 3D";
  const cardDescription = activeSlide.cardDescription || activeSlide.subtitle || "Fabrication artisanale en France";
  const cardPrice = activeSlide.cardPrice || "À partir de 3.00€";
  const cardImage = activeSlide.cardImage || activeSlide.image || "/images/hero_background.jpg";
  const cardLink = activeSlide.cardLink || activeSlide.buttonLink || "/boutique";

  const rawBadge = activeSlide.badge || "FABRICATION ARTISANALE À COMINES (59)";
  const cleanBadge = stripEmojis(rawBadge);

  return (
    <div className="w-full relative z-30 select-none no-invert">
      <Header />

      {/* Hero Container positioned BELOW fixed header with 30px side margins & expanded full width */}
      <div className="w-full px-4 sm:px-[30px] pt-24 sm:pt-28 md:pt-32 mb-10 sm:mb-16 lg:mb-20 max-w-[1760px] mx-auto">
        <section
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative w-full rounded-[28px] sm:rounded-[36px] overflow-hidden bg-[#070709] text-white min-h-[620px] sm:min-h-[680px] lg:min-h-[720px] border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.65)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.85)] group/hero flex flex-col justify-between"
        >
          {/* Background Image & Ambient Effects */}
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
                  className="object-cover object-center filter brightness-[0.82] contrast-[1.05] saturate-[1.1]"
                />
                {/* Softened Directional Gradient Overlays for Clear Background Visibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#070709]/80 via-[#070709]/45 to-transparent lg:w-2/3" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070709]/75 via-transparent to-[#070709]/20" />
              </motion.div>
            </AnimatePresence>

            {/* Accent Radial Glow */}
            <div
              className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] rounded-full blur-[150px] transition-colors duration-700 pointer-events-none"
              style={{ backgroundColor: `${activeSlide.accentColor || '#ff4f00'}25` }}
            />

            {/* Subtle Dot Grid Texture */}
            <div 
              className="absolute inset-0 opacity-[0.04]" 
              style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.4) 1px, transparent 0)`, backgroundSize: '32px 32px' }} 
            />
          </div>

          {/* Hotspot Visual Pin on Background Image (Desktop) */}
          <div className="hidden lg:flex absolute right-[28%] top-[45%] z-20 items-center justify-center pointer-events-none">
            <span className="absolute w-8 h-8 rounded-full bg-white/40 animate-ping" />
            <span className="relative w-4 h-4 rounded-full bg-white border-2 border-black/60 shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Slide précédente"
            className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 hover:border-white/40 text-white items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover/hero:opacity-100 cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Slide suivante"
            className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 hover:border-white/40 text-white items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover/hero:opacity-100 cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Hero Main Body: Grid with Text on Left & Floating Card on Right */}
          <div className="relative z-20 w-full h-full min-h-[620px] sm:min-h-[680px] lg:min-h-[720px] p-6 sm:p-10 lg:p-14 flex flex-col justify-between">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 my-auto">
              
              {/* LEFT COLUMN: Main Title, Subtitle, CTA Button */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-5 sm:space-y-6 text-left">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide.id || activeIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* Clean Badge without Emoji */}
                    <div>
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-extrabold text-[#ff4f00] tracking-widest uppercase backdrop-blur-md shadow-md">
                        {cleanBadge}
                      </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-antonio leading-[1.02] drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)] max-w-2xl">
                      {renderFormattedText(activeSlide.title)}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xs sm:text-base text-white/90 font-sans font-medium leading-relaxed max-w-xl line-clamp-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                      {renderFormattedText(activeSlide.subtitle)}
                    </p>

                    {/* Subtle Glass CTA Button without heavy background */}
                    <div className="pt-2">
                      <Link
                        href={activeSlide.buttonLink || "/boutique"}
                        className="group/btn inline-flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-300"
                      >
                        <div className="h-12 sm:h-13 px-6 sm:px-8 inline-flex items-center justify-center gap-2.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/60 backdrop-blur-md transition-all duration-300 shadow-md hover:shadow-lg group-hover/btn:scale-[1.02]">
                          <span className="font-black tracking-widest text-white drop-shadow-sm">
                            {activeSlide.buttonText || "DÉCOUVRIR LA BOUTIQUE"}
                          </span>
                          <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* RIGHT COLUMN: Floating Glassmorphism Product Card */}
              <div className="lg:col-span-5 xl:col-span-5 flex justify-end">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide.id || activeIndex}
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{ duration: 0.45 }}
                    className="w-full max-w-sm"
                  >
                    <Link
                      href={cardLink}
                      className="group/card block w-full backdrop-blur-xl bg-black/60 hover:bg-black/75 border border-white/20 hover:border-white/40 rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-4">
                        {/* Thumbnail Image */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-white/15 bg-white/10 shadow-inner">
                          <Image
                            src={cardImage}
                            alt={cardTitle}
                            fill
                            className="object-cover object-center group-hover/card:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* Product Meta */}
                        <div className="flex flex-col justify-between min-w-0 flex-1 space-y-1">
                          <h3 className="text-sm sm:text-base font-extrabold text-white font-antonio group-hover/card:text-[#ff4f00] transition-colors leading-tight truncate">
                            {renderFormattedText(cardTitle)}
                          </h3>

                          <p className="text-xs text-gray-300 font-sans line-clamp-2 leading-tight font-medium">
                            {renderFormattedText(cardDescription)}
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs sm:text-sm font-black font-mono text-white bg-white/15 px-2.5 py-0.5 rounded-lg border border-white/20">
                              {cardPrice}
                            </span>
                            <span className="text-xs font-bold text-white/80 group-hover/card:text-white group-hover/card:translate-x-1 transition-all flex items-center gap-1">
                              Voir <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>

            {/* Slider Pagination Dots */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Aller à la slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeIndex
                      ? "w-8 bg-[#ff4f00]"
                      : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
