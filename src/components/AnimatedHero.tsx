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
  cardBadge?: string;
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

// Hero Slides for Preproduction V2
const PREPROD_SLIDES_FR: HeroSlide[] = [
  {
    id: 1,
    badge: "PRÉCOMMANDES • ÉDITION LIMITÉE",
    title: "LE CALENDRIER DE L'AVENT 3D SPOOLIO",
    subtitle:
      "24 créations exclusives imprimées en 3D dans notre atelier. Édition limitée à 50 exemplaires, disponible au tarif de 50€ !",
    buttonText: "RÉSERVER (50€)",
    buttonLink: "/calendrier-avent",
    secondaryButtonText: "DÉCOUVRIR LE CALENDRIER",
    secondaryButtonLink: "/calendrier-avent",
    image: "/images/calendrier-avent-hero.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Calendrier de l'Avent 3D",
    cardDescription: "24 surprises inédites d'atelier à découvrir chaque jour.",
    cardPrice: "50€ • Édition Limitée (50 ex.)",
    cardImage: "/images/calendrier-avent-hero.jpg",
    cardLink: "/calendrier-avent",
    cardBadge: "Précommandes 2026",
  },
  {
    id: 2,
    badge: "ATELIER D'IMPRESSION 3D • COMINES (59)",
    title: "Objets tactiles, accessoires de bureau et créations d'atelier.",
    subtitle:
      "Conçus et imprimés à la demande dans notre atelier avec un polymère végétal biosourcé. Zéro surstock, du caractère et des finitions soignées.",
    buttonText: "DÉCOUVRIR LE CATALOGUE",
    buttonLink: "/boutique",
    secondaryButtonText: "CONCEVOIR MON CLICKER",
    secondaryButtonLink: "/createur-cliqueur",
    image: "/images/clicker_gallery_2.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Créations Spoolio 3D",
    cardDescription: "Objets tactiles et accessoires façonnés sur mesure à Comines.",
    cardPrice: "À partir de 3.00€",
    cardImage: "/images/clicker_gallery_2.jpg",
    cardLink: "/boutique",
  },
];

const PREPROD_SLIDES_EN: HeroSlide[] = [
  {
    id: 1,
    badge: "PRE-ORDERS OPEN • LIMITED EDITION",
    title: "THE SPOOLIO 3D ADVENT CALENDAR",
    subtitle:
      "24 exclusive 3D creations crafted in our workshop. Limited edition of 50 pieces, available now at €50!",
    buttonText: "PRE-ORDER NOW (€50)",
    buttonLink: "/calendrier-avent",
    secondaryButtonText: "DISCOVER THE CALENDAR",
    secondaryButtonLink: "/calendrier-avent",
    image: "/images/calendrier-avent-hero.jpg",
    accentColor: "#ff4f00",
    cardTitle: "3D Advent Calendar",
    cardDescription: "24 daily tactile workshop surprises to discover.",
    cardPrice: "€50 • Limited Edition (50 pcs)",
    cardImage: "/images/calendrier-avent-hero.jpg",
    cardLink: "/calendrier-avent",
    cardBadge: "Pre-order 2026",
  },
  {
    id: 2,
    badge: "3D PRINTING WORKSHOP • COMINES (59)",
    title: "Tactile objects, desk accessories and studio creations.",
    subtitle:
      "Designed and 3D printed on demand in our workshop with bio-sourced plant polymer. Zero overstock, character and meticulous finishes.",
    buttonText: "DISCOVER THE CATALOG",
    buttonLink: "/boutique",
    secondaryButtonText: "DESIGN MY CLICKER",
    secondaryButtonLink: "/createur-cliqueur",
    image: "/images/clicker_gallery_2.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Spoolio 3D Studio",
    cardDescription: "Tactile objects and 3D creations crafted in Comines.",
    cardPrice: "From €3.00",
    cardImage: "/images/clicker_gallery_2.jpg",
    cardLink: "/boutique",
  },
];

const DEFAULT_SLIDES_FR: HeroSlide[] = [
  {
    id: 1,
    badge: "PRÉCOMMANDES • ÉDITION LIMITÉE",
    title: "LE CALENDRIER DE L'AVENT 3D SPOOLIO",
    subtitle:
      "24 créations exclusives imprimées en 3D dans notre atelier. Édition limitée à 50 exemplaires, disponible au tarif de 50€ !",
    buttonText: "RÉSERVER (50€)",
    buttonLink: "/calendrier-avent",
    secondaryButtonText: "DÉCOUVRIR LE CALENDRIER",
    secondaryButtonLink: "/calendrier-avent",
    image: "/images/calendrier-avent-hero.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Calendrier de l'Avent 3D",
    cardDescription: "24 surprises inédites d'atelier à découvrir chaque jour.",
    cardPrice: "50€ • Édition Limitée (50 ex.)",
    cardImage: "/images/calendrier-avent-hero.jpg",
    cardLink: "/calendrier-avent",
    cardBadge: "Précommandes 2026",
  },
  {
    id: 2,
    badge: "ATELIER D'IMPRESSION 3D • COMINES (59)",
    title: "Objets tactiles, accessoires de bureau et créations d'atelier.",
    subtitle:
      "Conçus et imprimés à la demande dans notre atelier avec un polymère végétal biosourcé. Zéro surstock, du caractère et des finitions soignées.",
    buttonText: "DÉCOUVRIR LE CATALOGUE",
    buttonLink: "/boutique",
    secondaryButtonText: "CONCEVOIR MON CLICKER",
    secondaryButtonLink: "/createur-cliqueur",
    image: "/images/clicker_gallery_2.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Créations Spoolio 3D",
    cardDescription: "Objets tactiles et accessoires façonnés sur mesure à Comines.",
    cardPrice: "À partir de 3.00€",
    cardImage: "/images/clicker_gallery_2.jpg",
    cardLink: "/boutique"
  },
  {
    id: 3,
    badge: "JEUX DE SOCIÉTÉ & TABLETOP",
    title: "UPGRADEZ VOS SESSIONS DE JEU",
    subtitle: "Tours de dés sculptées, inserts précis et accessoires pensés par et pour les passionnés de jeu de société.",
    buttonText: "VOIR LES ACCESSOIRES JEUX",
    buttonLink: "/boutique",
    secondaryButtonText: "APPLICATION ENJEU",
    secondaryButtonLink: "/jeux-de-societe#enjeu-app",
    image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    accentColor: "#09090b",
    cardTitle: "Tour de Dés Haute Définition",
    cardDescription: "L'accessoire indispensable pour vos parties de JdR et jeux de plateau.",
    cardPrice: "14.90€",
    cardImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    cardLink: "/boutique"
  },
  {
    id: 4,
    badge: "DESK SETUP & ACCESSOIRES",
    title: "CLICKERS MÉCANIQUES & ASMR",
    subtitle: "Concevez votre clicker mécanique sur-mesure : switchs réels, touches custom et sensations tactiles uniques.",
    buttonText: "CONCEVOIR MON CLICKER",
    buttonLink: "/createur-cliqueur",
    secondaryButtonText: "VOIR LE CATALOGUE",
    secondaryButtonLink: "/boutique",
    image: "/images/imported/PochetteM-1.png",
    accentColor: "#ff4f00",
    cardTitle: "Clicker Mécanique Studio",
    cardDescription: "Touches interchangeables et switchs tactiles de précision.",
    cardPrice: "À partir de 3.00€",
    cardImage: "/images/imported/PochetteM-1.png",
    cardLink: "/createur-cliqueur"
  }
];

const DEFAULT_SLIDES_EN: HeroSlide[] = [
  {
    id: 1,
    badge: "PRE-ORDERS OPEN • LIMITED EDITION",
    title: "THE SPOOLIO 3D ADVENT CALENDAR",
    subtitle:
      "24 exclusive 3D creations crafted in our workshop. Limited edition of 50 pieces, available now at €50!",
    buttonText: "PRE-ORDER NOW (€50)",
    buttonLink: "/calendrier-avent",
    secondaryButtonText: "DISCOVER THE CALENDAR",
    secondaryButtonLink: "/calendrier-avent",
    image: "/images/calendrier-avent-hero.jpg",
    accentColor: "#ff4f00",
    cardTitle: "3D Advent Calendar",
    cardDescription: "24 daily tactile workshop surprises to discover.",
    cardPrice: "€50 • Limited Edition (50 pcs)",
    cardImage: "/images/calendrier-avent-hero.jpg",
    cardLink: "/calendrier-avent",
    cardBadge: "Pre-order 2026",
  },
  {
    id: 2,
    badge: "3D PRINTING WORKSHOP • COMINES (59)",
    title: "Tactile objects, desk accessories and workshop creations.",
    subtitle: "Designed and 3D printed on demand in our workshop with bio-sourced plant-based polymer. Zero overstock, strong character, and refined craftsmanship.",
    buttonText: "DISCOVER THE CATALOG",
    buttonLink: "/boutique",
    image: "/images/clicker_gallery_2.jpg",
    accentColor: "#ff4f00",
    cardTitle: "Spoolio Workshop Creations",
    cardDescription: "Tactile objects, desk accessories and workshop creations.",
    cardPrice: "€19.90",
    cardImage: "/images/clicker_gallery_2.jpg",
    cardLink: "/boutique"
  },
  {
    id: 3,
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
    id: 4,
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

  const rawBadge = activeSlide.badge || "FABRICATION ARTISANALE À COMINES (59)";
  const cleanBadge = stripEmojis(rawBadge);

  return (
    <div className="w-full relative z-30 select-none">
      <Header />

      {/* Hero Container spanning full width, glued to marquee below */}
      <div className="w-full pt-20 sm:pt-24 mb-0">
        <section
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative w-full overflow-hidden bg-zinc-950 text-white min-h-[600px] sm:min-h-[660px] lg:min-h-[700px] border-b border-zinc-800/80 group/hero flex flex-col justify-between"
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
                  className="object-cover object-center filter brightness-[0.98] contrast-[1.02] saturate-[1.05]"
                />
                {/* Gradient for text legibility on the left, clear and transparent on the right */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 via-40% to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-black/20" />
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

          {/* Hero Main Body: Left Typography with wide breathing space */}
          <div className="relative z-20 w-full max-w-[1360px] mx-auto h-full min-h-[580px] sm:min-h-[640px] lg:min-h-[680px] px-6 sm:px-10 lg:px-14 py-12 sm:py-16 lg:py-20 flex flex-col justify-between">
            
            <div className="flex items-center flex-1 my-auto">
              
              {/* LEFT COLUMN: Mise en forme Atelier Curiosités (Surtitre liseré, H1 dense, Pitch aéré, CTAs sobres, Specs atelier) */}
              <div className="max-w-2xl lg:max-w-3xl text-left">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide.id || activeIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-start space-y-6"
                  >
                    {/* Surtitre technique avec liseré orange */}
                    <div className="inline-flex items-center gap-3 border-l-2 border-[#FF5500] pl-3 py-0.5">
                      <span className="font-mono text-xs tracking-[0.25em] text-[#FF5500] uppercase font-bold">
                        {cleanBadge || "CABINET DE CURIOSITÉS CONTEMPORAIN"}
                      </span>
                    </div>

                    {/* Titre H1 percutant avec interlignage dense */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white max-w-2xl font-sans uppercase">
                      {renderFormattedText(activeSlide.title)}
                    </h1>

                    {/* Pitch sobre & spacieux */}
                    <p className="text-zinc-200 text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-xl">
                      {renderFormattedText(activeSlide.subtitle)}
                    </p>

                    {/* Deux CTAs sobres */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                      <Link
                        href={activeSlide.buttonLink || "/boutique"}
                        className="inline-flex items-center justify-center gap-3 bg-[#FF5500] hover:bg-[#e04b00] text-white font-mono text-xs tracking-[0.16em] uppercase px-7 py-4 rounded-none transition-all duration-200 shadow-[0_4px_20px_rgba(255,85,0,0.25)] hover:shadow-[0_6px_28px_rgba(255,85,0,0.35)] font-bold cursor-pointer"
                      >
                        <span>{activeSlide.buttonText || "DÉCOUVRIR LE CATALOGUE"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      {activeSlide.secondaryButtonLink && (
                        <Link
                          href={activeSlide.secondaryButtonLink}
                          className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white bg-black/40 hover:bg-white/10 text-white font-mono text-xs tracking-[0.16em] uppercase px-7 py-4 rounded-none transition-all duration-200 shadow-xs font-bold backdrop-blur-md cursor-pointer"
                        >
                          <span>{activeSlide.secondaryButtonText}</span>
                        </Link>
                      )}
                    </div>

                    {/* Données d'atelier en cartouche discret */}
                    <div className="pt-6 border-t border-white/15 w-full grid grid-cols-3 gap-4 text-left max-w-xl">
                      <div>
                        <div className="font-mono text-[10px] uppercase text-zinc-400 tracking-wider">
                          Origine
                        </div>
                        <div className="font-mono text-xs text-white font-semibold mt-0.5">
                          Comines, 59
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] uppercase text-zinc-400 tracking-wider">
                          Matière
                        </div>
                        <div className="font-mono text-xs text-white font-semibold mt-0.5">
                          100% Végétal
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] uppercase text-zinc-400 tracking-wider">
                          Tirages
                        </div>
                        <div className="font-mono text-xs text-white font-semibold mt-0.5">
                          Atelier Raisonné
                        </div>
                      </div>
                    </div>
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

