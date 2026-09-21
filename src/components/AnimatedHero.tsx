"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import { useTranslation } from "@/context/LanguageContext";
import { isPreprodEnv } from "@/lib/env";

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

// Single Hero Slide for Preproduction V2
const PREPROD_SLIDES_FR: HeroSlide[] = [
  {
    id: 1,
    badge: "DESK SETUP & ART TOYS",
    title: "Objets tactiles, art toys et déco de caractère.",
    subtitle:
      "Des pièces pensées pour le quotidien et le bureau. Façonnées sur mesure à l'atelier à Comines en polymère biosourcé.",
    buttonText: "CONCEVOIR MON CLICKER",
    buttonLink: "/createur-cliqueur",
    image: "/images/hero_background.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Studio Clicker Spoolio",
    cardDescription: "Objets tactiles et créations 3D façonnées sur mesure à Comines.",
    cardPrice: "À partir de 3.00€",
    cardImage: "/images/hero_background.jpg",
    cardLink: "/createur-cliqueur",
  },
];

const PREPROD_SLIDES_EN: HeroSlide[] = [
  {
    id: 1,
    badge: "DESK SETUP & ART TOYS",
    title: "Tactile objects, art toys and distinctive decor.",
    subtitle:
      "Pieces designed for everyday life and desk setups. Made to order at the workshop in Comines using bio-sourced polymer.",
    buttonText: "DESIGN MY CLICKER",
    buttonLink: "/createur-cliqueur",
    image: "/images/hero_background.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Studio Clicker Spoolio",
    cardDescription: "Tactile objects and 3D creations custom made in Comines.",
    cardPrice: "From €3.00",
    cardImage: "/images/hero_background.jpg",
    cardLink: "/createur-cliqueur",
  },
];

const DEFAULT_SLIDES_FR: HeroSlide[] = [
  {
    id: 1,
    badge: "ART TOYS & OBJETS DE COLLECTION",
    title: "L'ART TOY RÉINVENTÉ EN 3D",
    subtitle: "Des créations graphiques, qualitatives et audacieuses pensées pour sublimer votre intérieur ou votre étagère.",
    buttonText: "DÉCOUVRIR LES ART TOYS",
    buttonLink: "/boutique",
    image: "/images/hero_background.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Art Toy Collection Spoolio",
    cardDescription: "Sculptures géométriques et pièces de collection.",
    cardPrice: "19.90€",
    cardImage: "/images/hero_background.jpg",
    cardLink: "/boutique"
  },
  {
    id: 2,
    badge: "JEUX DE SOCIÉTÉ & TABLETOP",
    title: "UPGRADEZ VOS SESSIONS DE JEU",
    subtitle: "Tours de dés sculptées, inserts précis et accessoires pensés par et pour les passionnés de jeu de société.",
    buttonText: "VOIR LES ACCESSOIRES JEUX",
    buttonLink: "/boutique",
    image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    accentColor: "#09090b",
    cardTitle: "Tour de Dés Haute Définition",
    cardDescription: "L'accessoire indispensable pour vos parties de JdR et jeux de plateau.",
    cardPrice: "14.90€",
    cardImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    cardLink: "/boutique"
  },
  {
    id: 3,
    badge: "DESK SETUP & CULTURE GEEK",
    title: "CLICKERS MÉCANIQUES & ASMR",
    subtitle: "Concevez votre clicker mécanique sur-mesure : switchs réels, touches custom et sensations tactiles uniques.",
    buttonText: "CONCEVOIR MON CLICKER",
    buttonLink: "/createur-cliqueur",
    image: "/images/imported/PochetteM-1.png",
    accentColor: "#ff4f00",
    cardTitle: "Clicker Mécanique Studio",
    cardDescription: "Touches interchangeables et switchs tactiles haut de gamme.",
    cardPrice: "À partir de 3.00€",
    cardImage: "/images/imported/PochetteM-1.png",
    cardLink: "/createur-cliqueur"
  }
];

const DEFAULT_SLIDES_EN: HeroSlide[] = [
  {
    id: 1,
    badge: "ART TOYS & COLLECTIBLES",
    title: "THE ART TOY REINVENTED IN 3D",
    subtitle: "Graphic, qualitative and bold creations designed to elevate your interior and desk setup.",
    buttonText: "DISCOVER ART TOYS",
    buttonLink: "/boutique",
    image: "/images/hero_background.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Spoolio Art Toy Collection",
    cardDescription: "Geometric sculptures and collectible pieces.",
    cardPrice: "€19.90",
    cardImage: "/images/hero_background.jpg",
    cardLink: "/boutique"
  },
  {
    id: 2,
    badge: "BOARD GAMES & TABLETOP",
    title: "UPGRADE YOUR GAME NIGHTS",
    subtitle: "Sculpted dice towers, precise inserts, and tabletop accessories crafted for enthusiasts.",
    buttonText: "VIEW GAMING ACCESSORIES",
    buttonLink: "/boutique",
    image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    accentColor: "#09090b",
    cardTitle: "High-Definition Dice Tower",
    cardDescription: "The essential tabletop accessory for RPGs and board games.",
    cardPrice: "€14.90",
    cardImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    cardLink: "/boutique"
  },
  {
    id: 3,
    badge: "DESK SETUP & GEEK CULTURE",
    title: "MECHANICAL CLICKERS & ASMR",
    subtitle: "Design your custom mechanical clicker: authentic switches, custom keycaps, and satisfying tactile feedback.",
    buttonText: "DESIGN MY CLICKER",
    buttonLink: "/createur-cliqueur",
    image: "/images/imported/PochetteM-1.png",
    accentColor: "#ff4f00",
    cardTitle: "Mechanical Clicker Studio",
    cardDescription: "Interchangeable keycaps and premium tactile switches.",
    cardPrice: "From €3.00",
    cardImage: "/images/imported/PochetteM-1.png",
    cardLink: "/createur-cliqueur"
  }
];

export interface AnimatedHeroProps {
  slides?: HeroSlide[];
}

export default function AnimatedHero({ slides }: AnimatedHeroProps = {}) {
  const { locale } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const isPreprod = isPreprodEnv();
  const defaultSlides = locale === "en" ? DEFAULT_SLIDES_EN : DEFAULT_SLIDES_FR;
  const preprodSlides = locale === "en" ? PREPROD_SLIDES_EN : PREPROD_SLIDES_FR;

  // In preprod, strictly isolate to the single editorial slide. In production, keep existing slides.
  const heroSlides = isPreprod
    ? preprodSlides
    : (slides && slides.length > 0 ? slides : defaultSlides);

  useEffect(() => {
    if (isPaused || heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const nextSlide = () => {
    if (heroSlides.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    if (heroSlides.length <= 1) return;
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
    <div className="w-full relative z-30 select-none">
      <Header />

      {/* Hero Container spanning full width, no rounded corners and no drop shadow */}
      <div className="w-full pt-20 sm:pt-24 mb-10 sm:mb-16">
        <section
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative w-full overflow-hidden bg-zinc-950 text-white min-h-[600px] sm:min-h-[660px] lg:min-h-[700px] border-b border-zinc-200 group/hero flex flex-col justify-between"
        >
          {/* Background Image & Ambient Effects (Without white overlay) */}
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
                  className="object-cover object-center filter brightness-[0.85] contrast-[1.05] saturate-[1.1]"
                />
                {/* Subtle soft vignette for text legibility without washing out the photo */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent lg:w-3/5" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/60" />
              </motion.div>
            </AnimatePresence>

            {/* Accent Radial Glow */}
            <div
              className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] rounded-full blur-[150px] transition-colors duration-700 pointer-events-none opacity-30"
              style={{ backgroundColor: `${activeSlide.accentColor || '#ff4f00'}25` }}
            />
          </div>

          {/* Navigation Arrows (Rendered only when multiple slides exist) */}
          {heroSlides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                aria-label="Slide précédente"
                className="hidden sm:flex absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover/hero:opacity-100 cursor-pointer shadow-lg hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={nextSlide}
                aria-label="Slide suivante"
                className="hidden sm:flex absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover/hero:opacity-100 cursor-pointer shadow-lg hover:scale-105"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Hero Main Body: Split-Screen Grid with Left Typography & Right Clean Media Container */}
          <div className="relative z-20 w-full max-w-[1360px] mx-auto h-full min-h-[600px] sm:min-h-[660px] lg:min-h-[700px] px-6 sm:px-10 lg:px-14 py-12 sm:py-16 lg:py-20 flex flex-col justify-between">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center flex-1 my-auto">
              
              {/* LEFT COLUMN: Main Title, Subtitle, CTA Button with generous breathing room */}
              <div className="lg:col-span-6 xl:col-span-6 space-y-6 sm:space-y-8 text-left">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide.id || activeIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-5 sm:space-y-7"
                  >
                    {/* Clean Badge without Emoji */}
                    <div>
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-black/50 border border-white/20 text-xs font-mono font-extrabold text-[#ff4f00] tracking-widest uppercase backdrop-blur-md shadow-sm">
                        {cleanBadge}
                      </span>
                    </div>

                    {/* Main Title (Righteous font with tight leading) */}
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal uppercase tracking-tight text-white font-righteous leading-tight sm:leading-[1.02] drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)] max-w-2xl">
                      {renderFormattedText(activeSlide.title)}
                    </h1>

                    {/* Subtitle with high-contrast legibility */}
                    <p className="text-sm sm:text-base lg:text-lg text-white/85 font-sans font-medium leading-relaxed max-w-xl line-clamp-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                      {renderFormattedText(activeSlide.subtitle)}
                    </p>

                    {/* Minimalist Black Pill CTA Button with white border towards configurator */}
                    <div className="pt-3 sm:pt-4">
                      <Link
                        href={activeSlide.buttonLink || "/createur-cliqueur"}
                        className="group/btn inline-flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-300 no-invert keep-white"
                      >
                        <div className="h-12 sm:h-14 px-7 sm:px-9 inline-flex items-center justify-center gap-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider text-white bg-zinc-950 hover:bg-[#ff4f00] border border-white/25 hover:border-[#ff4f00] transition-all duration-300 shadow-xl group-hover/btn:scale-[1.02] keep-white no-invert">
                          <span className="font-black tracking-widest text-white !text-white keep-white">
                            {activeSlide.buttonText || "CONCEVOIR MON CLICKER"}
                          </span>
                          <ArrowRight className="w-4 h-4 text-white !text-white keep-white group-hover/btn:translate-x-1.5 transition-transform" />
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* RIGHT COLUMN: Clean Unified Media Container (1:1 Ratio, technical border, rounded-3xl) */}
              <div className="lg:col-span-6 xl:col-span-6 flex justify-center lg:justify-end">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide.id || activeIndex}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1 }}
                    transition={{ duration: 0.45 }}
                    className="w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[500px]"
                  >
                    <Link
                      href={activeSlide.buttonLink || cardLink}
                      className="group/media relative block w-full aspect-square rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] transition-all duration-500 hover:border-neutral-700"
                    >
                      <Image
                        src={activeSlide.image || cardImage}
                        alt={activeSlide.title}
                        fill
                        priority
                        className="object-cover object-center group-hover/media:scale-105 transition-transform duration-700 ease-out filter brightness-[0.95] contrast-[1.02]"
                      />
                      {/* Technical Inner Specular Ring */}
                      <div className="absolute inset-0 pointer-events-none rounded-[inherit] ring-1 ring-inset ring-white/10" />
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>

            {/* Slider Pagination Dots (Rendered only when multiple slides exist) */}
            {heroSlides.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Aller à la slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeIndex
                        ? "w-8 bg-[#ff4f00]"
                        : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}

          </div>
        </section>
      </div>
    </div>
  );
}

