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
  cardBadge?: string;
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
    badge: "ATELIER • COMINES",
    title: "Fidgets, objets sensoriels et curiosités imprimés en 3D",
    subtitle: "Conçus et fabriqués à la demande dans notre atelier à Comines.",
    buttonText: "Découvrir le catalogue",
    buttonLink: "/boutique",
    image: "/images/clicker_gallery_2.webp",
    accentColor: "#ff4f00",
    cardTitle: "Créations Spoolio",
    cardDescription: "Objets tactiles et curiosités façonnés à Comines.",
    cardPrice: "À partir de 3.00€",
    cardImage: "/images/clicker_gallery_2.webp",
    cardLink: "/boutique",
  },
  {
    id: 2,
    badge: "ART TOYS & DÉCO",
    title: "Des pièces pop qui réveillent votre bureau.",
    subtitle: "Créatures articulées, vide-poches et curiosités en petites séries.",
    buttonText: "Explorer les créations",
    buttonLink: "/art-toys",
    image: "/images/kurb-art-toy.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Art Toys & Curiosités",
    cardDescription: "Créatures articulées et pièces de collection d'atelier.",
    cardPrice: "À partir de 6.00€",
    cardImage: "/images/kurb-art-toy.jpg",
    cardLink: "/art-toys",
  },
  {
    id: 3,
    badge: "COFFRETS NOËL 2026",
    title: "Noël, avec du caractère.",
    subtitle: "Coffrets prêts à offrir et idées Secret Santa dès 12 €.",
    buttonText: "Voir les coffrets",
    buttonLink: "/noel",
    image: "/images/clicker_gallery_0.webp",
    accentColor: "#ff4f00",
    cardTitle: "Coffrets de Noël",
    cardDescription: "Packs exclusifs d'atelier dès 12 €.",
    cardPrice: "Dès 12.00€",
    cardImage: "/images/clicker_gallery_0.webp",
    cardLink: "/noel",
  },
  {
    id: 4,
    badge: "BLIND BAGS",
    title: "L'effet surprise en pochette scellée.",
    subtitle: "Composez votre Blind Bag selon vos envies : tactile, pop ou curiosité.",
    buttonText: "Composer mon Blind Bag",
    buttonLink: "/blind-bags",
    image: "/images/blind-bag-home.webp",
    accentColor: "#005cff",
    cardTitle: "Blind Bags Spoolio",
    cardDescription: "Assortiments surprises préparés à l'atelier.",
    cardPrice: "À partir de 10.00€",
    cardImage: "/images/blind-bag-home.webp",
    cardLink: "/blind-bags",
  },
];

const DEFAULT_SLIDES_EN: HeroSlide[] = [
  {
    id: 1,
    badge: "PRE-ORDERS OPEN • LIMITED EDITION",
    title: "The Spoolio 3D Advent Calendar",
    subtitle:
      "24 exclusive 3D creations crafted in our workshop. Limited edition of 50 pieces, available now at €50!",
    buttonText: "PRE-ORDER NOW (€50)",
    buttonLink: "/calendrier-avent",
    secondaryButtonText: "DISCOVER THE CALENDAR",
    secondaryButtonLink: "/calendrier-avent",
    image: "/images/calendrier-avent-hero.webp",
    accentColor: "#ff4f00",
    cardTitle: "3D Advent Calendar",
    cardDescription: "24 daily tactile workshop surprises to discover.",
    cardPrice: "€50 • Limited Edition (50 pcs)",
    cardImage: "/images/calendrier-avent-hero.webp",
    cardLink: "/calendrier-avent",
    cardBadge: "Pre-order 2026",
  },
  {
    id: 2,
    badge: "WORKSHOP • COMINES (FRANCE)",
    title: "OBJECTS YOU ACTUALLY WANT TO TOUCH.",
    subtitle: "Art toys, tactile objects and curiosities crafted in small series in our workshop in Northern France.",
    buttonText: "DISCOVER THE CATALOG",
    buttonLink: "/boutique",
    image: "/images/clicker_gallery_2.webp",
    accentColor: "#ff4f00",
    cardTitle: "Spoolio Workshop Creations",
    cardDescription: "Art toys, tactile objects and curiosities.",
    cardPrice: "From €3.00",
    cardImage: "/images/clicker_gallery_2.webp",
    cardLink: "/boutique"
  },
  {
    id: 3,
    badge: "BOARD GAMES & TABLETOP",
    title: "Upgrade your game nights",
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
    id: 4,
    badge: "DESK SETUP & GEEK CULTURE",
    title: "Mechanical clickers & ASMR",
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

  const defaultSlides = locale === "en" ? DEFAULT_SLIDES_EN : DEFAULT_SLIDES_FR;

  // Harmoniser préprod et prod : utiliser les slides configurées en BDD si fournies, sinon les slides d'atelier par défaut
  const heroSlides = slides && slides.length > 0 ? slides : defaultSlides;

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
  const touchStartX = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || heroSlides.length <= 1) return;
    const endX = e.changedTouches[0]?.clientX ?? null;
    if (endX === null) return;
    const deltaX = endX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <div className="w-full relative z-30 select-none">
      <Header variant="home" />

      {/* Hero Container spanning full width, sitting cleanly below the centered Home Header */}
      <div className="w-full mb-0">
        <section
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full overflow-hidden bg-zinc-950 text-white min-h-[540px] sm:min-h-[640px] lg:min-h-[720px] border-b border-zinc-800/80 group/hero flex flex-col justify-between touch-pan-y"
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
                  priority={activeIndex === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px"
                  className="object-cover object-center filter brightness-[0.95] contrast-[1.02] saturate-[1.05]"
                />
                {/* Top scrim for transparent header + electric logo legibility */}
                <div className="absolute inset-x-0 top-0 h-56 sm:h-64 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
                {/* Mobile: bottom-up scrim; Desktop: left-to-right scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 via-50% to-transparent sm:bg-gradient-to-r sm:from-black/80 sm:via-black/40 sm:via-45% sm:to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Accent Radial Glow */}
            <div
              className="hidden sm:block absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] rounded-full blur-[150px] transition-colors duration-700 pointer-events-none opacity-30"
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

          {/* Hero Main Body: Clear top clearance for overlaid logo + menu */}
          <div className="relative z-20 w-full max-w-[1360px] mx-auto flex-1 min-h-[540px] sm:min-h-[640px] lg:min-h-[720px] px-5 sm:px-10 lg:px-14 pt-32 pb-6 sm:pt-48 sm:pb-12 lg:pt-52 lg:pb-16 flex flex-col justify-end sm:justify-between">
            
            <div className="flex items-end sm:items-center flex-1 sm:my-auto">
              
              <div className="w-full max-w-2xl lg:max-w-3xl text-left">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide.id || activeIndex}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col items-start"
                  >
                    {/* Titre principal : mobile 34-38px max 3 lignes, desktop inchangé */}
                    {activeIndex === 0 ? (
                      <h1 className="text-[34px] sm:text-5xl md:text-6xl lg:text-[70px] xl:text-[76px] font-bold text-white max-w-3xl font-be-vietnam leading-[0.95] sm:leading-[0.78] tracking-[-0.04em] sm:tracking-[-0.107em] line-clamp-3 py-0.5">
                        {renderFormattedText(activeSlide.title)}
                      </h1>
                    ) : (
                      <h2 className="text-[34px] sm:text-5xl md:text-6xl lg:text-[70px] xl:text-[76px] font-bold text-white max-w-3xl font-be-vietnam leading-[0.95] sm:leading-[0.78] tracking-[-0.04em] sm:tracking-[-0.107em] line-clamp-3 py-0.5">
                        {renderFormattedText(activeSlide.title)}
                      </h2>
                    )}

                    {/* Description courte : secondaire (~15-16px, max 2 lignes sur mobile) */}
                    <p className="mt-3 sm:mt-5 text-white/80 sm:text-zinc-200 text-[15px] sm:text-lg lg:text-xl font-normal leading-snug sm:leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-3">
                      {renderFormattedText(activeSlide.subtitle)}
                    </p>

                    {/* CTA principal unique avec espace généreux */}
                    <div className="pt-6 sm:pt-7 flex items-center w-full sm:w-auto">
                      <Link
                        href={activeSlide.buttonLink || "/boutique"}
                        className="inline-flex items-center justify-center gap-3 bg-[#FF5500] hover:bg-[#e04b00] text-white font-mono text-xs tracking-[0.16em] uppercase px-7 py-4 rounded-none transition-all duration-200 shadow-[0_4px_20px_rgba(255,85,0,0.28)] hover:shadow-[0_6px_28px_rgba(255,85,0,0.38)] font-bold cursor-pointer w-full sm:w-auto"
                      >
                        <span>{activeSlide.buttonText || "Découvrir le catalogue"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>

            {/* Slider Pagination Dots (discrets, actif orange) */}
            {heroSlides.length > 1 && (
              <div className="flex items-center justify-center gap-1 pt-5 sm:pt-4">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Aller à la slide ${idx + 1}`}
                    className="p-2 flex items-center justify-center cursor-pointer -m-1"
                  >
                    <span
                      className={`h-1.5 rounded-full transition-all duration-300 block ${
                        idx === activeIndex
                          ? "w-6 bg-[#FF5500]"
                          : "w-1.5 bg-white/35 hover:bg-white/65"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}

          </div>
        </section>
      </div>
    </div>
  );
}

