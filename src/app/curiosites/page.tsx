"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  heroData,
  activeDrop,
  fourPortals,
  curatedSelection,
  manifestoData,
  CuratedItem,
} from "@/data/mockCuriositesData";
import {
  ArrowRight,
  ShoppingBag,
  Plus,
  MapPin,
  ShieldCheck,
  X,
  ChevronRight,
  Eye,
} from "lucide-react";

export default function CuriositesPage() {
  // Local state for active drop gallery inspection
  const [activeDropImageIndex, setActiveDropImageIndex] = useState(0);

  // Local state for curated collection category filter
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Local state for isolated mock cart
  const [cartItems, setCartItems] = useState<{ item: CuratedItem; qty: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick view modal for atelier items
  const [quickViewItem, setQuickViewItem] = useState<CuratedItem | null>(null);

  // Filter items
  const filteredItems =
    selectedCategory === "all"
      ? curatedSelection
      : curatedSelection.filter((item) => item.category === selectedCategory);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Ensure body background is warm museum white while on /curiosites
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#FAFAFA";
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.qty, 0);
  const totalCartPrice = cartItems.reduce((acc, curr) => {
    const num = parseFloat(curr.item.price.replace("€", "").replace(",", ".").trim()) || 0;
    return acc + num * curr.qty;
  }, 0);

  const handleAddToCart = (item: CuratedItem) => {
    setCartItems((prev) => {
      const existing = prev.find((entry) => entry.item.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.item.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry
        );
      }
      return [...prev, { item, qty: 1 }];
    });
    setToastMessage(`"${item.title}" ajouté à la sélection`);
  };

  const handleAddDropToCart = () => {
    const dropAsItem: CuratedItem = {
      id: "active-drop-kurb-monster",
      title: activeDrop.title,
      collectionTag: "DROP 01 // ATELIER",
      materialTag: "100 % POLYMÈRE VÉGÉTAL (PLA MAÏS)",
      price: activeDrop.price,
      imageUrl: activeDrop.imageUrl,
      category: "art-toys",
      badge: "SÉRIE LIMITÉE",
    };
    handleAddToCart(dropAsItem);
  };

  const handlePortalClick = (cat: string) => {
    setSelectedCategory(cat);
    const element = document.getElementById("selection");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] text-neutral-900 font-sans selection:bg-[#FF5500] selection:text-white antialiased overflow-x-hidden">
      {/* Scoped CSS to maintain aesthetic calm & silence visuel */}
      <style jsx global>{`
        /* Silence visual distractions on this preview page */
        .tombola-card,
        [data-newsletter-popup],
        .newsletter-overlay {
          display: none !important;
        }
      `}</style>

      {/* =========================================================================
          1. HEADER MINIMALISTE SPÉCIFIQUE (THÈME CLAIR)
         ========================================================================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#FAFAFA]/90 border-b border-neutral-200/90 transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo authentique Spoolio */}
          <div className="flex items-center gap-4">
            <Link
              href="/curiosites"
              className="flex items-center cursor-pointer"
            >
              <Image
                src="/images/logo-spoolio-eyes.png"
                alt="Spoolio Logo"
                width={130}
                height={38}
                priority
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Navigation textuelle sobre (police de la home, sans les chiffres) */}
          <nav className="hidden md:flex items-center gap-7">
            {fourPortals.map((portal) => (
              <button
                key={portal.id}
                onClick={() => handlePortalClick(portal.categoryFilter)}
                className="font-sans text-xs font-extrabold uppercase tracking-wider text-neutral-800 hover:text-black transition-colors cursor-pointer"
              >
                <span>{portal.title.split("&")[0].trim()}</span>
              </button>
            ))}
            <Link
              href="#manifeste"
              className="font-sans text-xs font-extrabold uppercase tracking-wider text-neutral-600 hover:text-black transition-colors"
            >
              Manifeste
            </Link>
          </nav>

          {/* Action panier minimaliste */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2 border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 rounded-full transition-all duration-200 cursor-pointer text-xs font-mono uppercase tracking-wider shadow-xs"
              aria-label="Ouvrir le panier"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-neutral-700" />
              <span className="text-neutral-800 hidden sm:inline font-medium">PANIER</span>
              <span className="w-5 h-5 rounded-full bg-[#FF5500] text-white flex items-center justify-center text-[10px] font-bold">
                {totalCartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Micro Status Bar */}
      <div className="w-full bg-white/95 border-b border-neutral-200/90 py-2 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono tracking-wider text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5500] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5500]"></span>
            </span>
            <span className="uppercase text-neutral-700">
              DROP EN COURS :{" "}
              <span className="text-neutral-950 font-bold">{activeDrop.title}</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-neutral-500 text-[10px]">
            <span>FABRICATION ARTISANALE COMINES (59)</span>
            <span>•</span>
            <span className="text-neutral-700 font-medium">ZÉRO SURSTOCK</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. HERO IMMERSIF (THÈME CLAIR AVEC IMAGE EN FOND)
         ========================================================================= */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-neutral-200/80 overflow-hidden bg-[#FAFAFA]">
        {/* Image dans le fond comme sur la page d'accueil avec dégradé soigné */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <Image
            src="/images/hero_background.jpg"
            alt="Ambiance Atelier Spoolio"
            fill
            priority
            className="object-cover object-center filter brightness-[0.94] contrast-[1.02]"
          />
          {/* Dégradés garantissant une lisibilité optimale en thème clair */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAFA]/95 via-[#FAFAFA]/88 via-45% to-[#FAFAFA]/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA]/30 via-transparent to-[#FAFAFA]" />
        </div>

        {/* Subtle radial ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-[#FF5500]/[0.035] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Colonne gauche : Typographie & Manifeste introductif */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-6">
              {/* Surtitre technique avec liseré orange */}
              <div className="inline-flex items-center gap-3 border-l-2 border-[#FF5500] pl-3 py-0.5">
                <span className="font-mono text-xs tracking-[0.25em] text-[#FF5500] uppercase font-bold">
                  {heroData.surtitre}
                </span>
              </div>

              {/* Titre H1 percutant avec interlignage dense */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-neutral-950 max-w-2xl">
                {heroData.h1}
              </h1>

              {/* Pitch sobre & spacieux */}
              <p className="text-neutral-700 text-lg sm:text-xl font-normal leading-relaxed max-w-xl">
                {heroData.pitch}
              </p>

              {/* Deux CTAs sobres */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <Link
                  href={heroData.ctaPrimary.href}
                  className="inline-flex items-center justify-center gap-3 bg-[#FF5500] hover:bg-[#e04b00] text-white font-mono text-xs tracking-[0.16em] uppercase px-7 py-4 rounded-none transition-all duration-200 shadow-[0_4px_20px_rgba(255,85,0,0.25)] hover:shadow-[0_6px_28px_rgba(255,85,0,0.35)]"
                >
                  <span>{heroData.ctaPrimary.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={heroData.ctaSecondary.href}
                  className="inline-flex items-center justify-center gap-2 border border-neutral-300 hover:border-neutral-950 bg-white hover:bg-neutral-50 text-neutral-800 hover:text-neutral-950 font-mono text-xs tracking-[0.16em] uppercase px-7 py-4 rounded-none transition-all duration-200 shadow-xs"
                >
                  <span>{heroData.ctaSecondary.label}</span>
                </Link>
              </div>

              {/* Données d'atelier en cartouche discret */}
              <div className="pt-6 border-t border-neutral-200/90 w-full grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="font-mono text-[10px] uppercase text-neutral-500 tracking-wider">
                    Origine
                  </div>
                  <div className="font-mono text-xs text-neutral-900 font-semibold mt-0.5">
                    Comines, 59
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase text-neutral-500 tracking-wider">
                    Matière
                  </div>
                  <div className="font-mono text-xs text-neutral-900 font-semibold mt-0.5">
                    100% Végétal
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase text-neutral-500 tracking-wider">
                    Tirages
                  </div>
                  <div className="font-mono text-xs text-neutral-900 font-semibold mt-0.5">
                    Numérotés
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite : Cadrage photo net et solennel */}
            <div className="lg:col-span-5 relative">
              <div className="relative border border-neutral-200 bg-white p-2.5 sm:p-3.5 rounded-2xl group shadow-xl">
                {/* Cadre chirurgical technique (repères en coin) */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-neutral-400 pointer-events-none z-20" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-neutral-400 pointer-events-none z-20" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-neutral-400 pointer-events-none z-20" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-neutral-400 pointer-events-none z-20" />

                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-neutral-100">
                  <Image
                    src={heroData.imageUrl}
                    alt={heroData.imageAlt}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="object-cover object-center group-hover:scale-105 transition-all duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent pointer-events-none" />

                  {/* Cartouche d'angle bas */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-lg flex items-center justify-between text-left shadow-md">
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-[#FF5500] font-bold">
                        PIÈCE MAÎTRESSE
                      </div>
                      <div className="text-xs font-bold text-neutral-900 mt-0.5">
                        Kurb Monster #01 (Atelier Edition)
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-700 bg-neutral-100 px-2 py-1 rounded border border-neutral-200 font-semibold">
                      DROP 01
                    </span>
                  </div>
                </div>
              </div>

              {/* Filigrane technique discret */}
              <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-neutral-500 tracking-wider">
                <span>{heroData.atelierNote}</span>
                <span className="text-[#FF5500] font-semibold">● EN COURS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SECTION "DERNIER DROP" (#dernier-drop) (ACCENT COULEUR BLEU #2F3CD9)
         ========================================================================= */}
      <section id="dernier-drop" className="py-20 md:py-28 max-w-7xl mx-auto px-6">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#2F3CD9] font-bold">
              <span>SÉRIE LIMITÉE D&apos;AUTOMNE</span>
              <span>—</span>
              <span>COMINES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 mt-2">
              Le Dernier Drop d&apos;Atelier
            </h2>
          </div>
          <div className="font-mono text-xs text-neutral-500 tracking-wider font-medium">
            ÉDITION COLLECTOR RESTREINTE • TIRAGE UNIQUE
          </div>
        </div>

        {/* Bento Box Drop pleine largeur */}
        <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 lg:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
          {/* Filet d'accent Bleu Spoolio */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#2F3CD9]/60 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Visuel Studio & Switcher multi-angle */}
            <div className="lg:col-span-6 space-y-4">
              <Link
                href="/drops/drop-kurb-monsters"
                className="relative aspect-[4/4] sm:aspect-[5/4] w-full rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm block group/dropimg cursor-pointer"
                title="Découvrir le Drop Kurb Monsters"
              >
                <Image
                  src={activeDrop.galleryImages[activeDropImageIndex]?.url || activeDrop.imageUrl}
                  alt={activeDrop.galleryImages[activeDropImageIndex]?.alt || activeDrop.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center group-hover/dropimg:scale-105 transition-all duration-500"
                />

                {/* Badge flottant "DROP 01 // SÉRIE LIMITÉE" en Bleu */}
                <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-[#2F3CD9]/30 text-[#2F3CD9] font-mono text-[10px] tracking-[0.18em] px-3.5 py-1.5 rounded-full uppercase font-bold shadow-xs">
                  {activeDrop.badge}
                </div>

                {/* Point vert pulsant pour les exemplaires restants */}
                <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md border border-neutral-200 text-neutral-800 font-mono text-[10px] tracking-wider px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-xs font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                  </span>
                  <span>{activeDrop.stockRemaining} PIÈCES DISPONIBLES</span>
                </div>

                {/* Légende vue active */}
                <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono text-neutral-700 border border-neutral-200 shadow-xs font-medium">
                  {activeDrop.galleryImages[activeDropImageIndex]?.label}
                </div>
              </Link>

              {/* Miniatures d'angles d'atelier interactives */}
              <div className="grid grid-cols-3 gap-3">
                {activeDrop.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDropImageIndex(idx)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer text-left shadow-xs ${
                      activeDropImageIndex === idx
                        ? "border-[#2F3CD9] ring-2 ring-[#2F3CD9]"
                        : "border-neutral-200 opacity-70 hover:opacity-100 hover:border-neutral-300"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      sizes="15vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Colonne d'informations & Cartouche technique */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                <div className="font-mono text-xs tracking-[0.2em] text-[#2F3CD9] uppercase font-bold mb-2">
                  TIRAGE D&apos;ATELIER #{activeDrop.editionNumber}
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-950 leading-tight">
                  {activeDrop.title}
                </h3>
                <p className="text-neutral-600 text-base sm:text-lg font-normal leading-relaxed mt-4">
                  {activeDrop.subtitle}
                </p>
              </div>

              {/* Cartouche technique en typographie monospace */}
              <div className="bg-neutral-50 border border-neutral-200/90 rounded-xl p-5 space-y-3 font-mono text-xs">
                <div className="text-[10px] tracking-widest uppercase text-neutral-500 border-b border-neutral-200 pb-2 flex justify-between font-medium">
                  <span>FICHE TECHNIQUE D&apos;ATELIER</span>
                  <span className="text-[#2F3CD9] font-bold">CONTRÔLE UNITAIRE OK</span>
                </div>
                <div className="space-y-2.5">
                  {activeDrop.specs.map((spec, i) => (
                    <div key={i} className="flex justify-between items-baseline gap-4">
                      <span className="text-neutral-500 uppercase tracking-wider text-[11px]">
                        {spec.label}
                      </span>
                      <span className="text-neutral-900 font-semibold text-right text-[11px]">
                        {spec.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bloc Prix & Accès direct à la page du Drop */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 border-t border-neutral-200">
                <div>
                  <div className="font-mono text-[10px] uppercase text-neutral-500 tracking-wider">
                    Tarif d&apos;Atelier unitaire
                  </div>
                  <div className="text-3xl font-mono font-bold text-neutral-950 mt-0.5">
                    {activeDrop.price}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    TVA non applicable, art. 293 B du CGI
                  </div>
                </div>

                <Link
                  href="/drops/drop-kurb-monsters"
                  className="inline-flex items-center justify-center gap-3 bg-[#2F3CD9] hover:bg-[#2430b8] text-white font-mono text-xs tracking-[0.16em] uppercase px-8 py-4 rounded-none transition-all duration-200 shadow-[0_4px_20px_rgba(47,60,217,0.25)] hover:shadow-[0_6px_28px_rgba(47,60,217,0.35)] cursor-pointer font-semibold group/btn"
                >
                  <span>DÉCOUVRIR LE DROP // VOIR LA COLLECTION</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-600">
                <ShieldCheck className="w-4 h-4 text-[#2F3CD9]" />
                <span>Conditionné sous pochette kraft scellée • Expédition sous 48h</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. UNIVERS D'ATELIER (CARTES DIRECTES SANS TITRE SUPÉRIEUR)
         ========================================================================= */}
      <section className="py-8 sm:py-14 md:py-20 border-t border-b border-neutral-200/80 bg-neutral-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Grille de 4 cartes : format bandeau compact sur mobile, vertical 4:5 sur desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {fourPortals.map((portal) => (
              <div
                key={portal.id}
                onClick={() => handlePortalClick(portal.categoryFilter)}
                className="group relative aspect-[2.2/1] sm:aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden border border-neutral-200 bg-white cursor-pointer transition-all duration-300 hover:border-neutral-400 hover:shadow-xl shadow-xs"
              >
                {/* Image d'ambiance avec zoom fluide au survol */}
                <Image
                  src={portal.imageUrl}
                  alt={portal.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center filter brightness-[0.85] group-hover:brightness-[0.95] group-hover:scale-105 transition-all duration-500 ease-out"
                />

                {/* Filtre sombre en dégradé pour garantir une lisibilité absolue des textes */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/45 to-neutral-950/15 pointer-events-none" />

                {/* Indexation claire en typographie monospace orange */}
                <div className="absolute top-2.5 left-3 sm:top-4 sm:left-4 z-10 flex items-center justify-between w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)]">
                  <span className="font-mono text-xs sm:text-sm tracking-wider text-[#FF5500] font-bold">
                    {portal.code}
                  </span>
                  <span className="font-mono text-[9px] sm:text-[10px] text-white bg-neutral-900/80 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded border border-neutral-700/80 font-semibold">
                    {portal.count}
                  </span>
                </div>

                {/* Contenu textuel bas de tuile */}
                <div className="absolute bottom-2.5 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 z-10 flex flex-col justify-end space-y-1 sm:space-y-2">
                  <h3 className="font-bold text-sm sm:text-lg text-white leading-tight">
                    {portal.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-300 font-light line-clamp-1 sm:line-clamp-2 leading-relaxed">
                    {portal.subtitle}
                  </p>

                  <div className="pt-0.5 sm:pt-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-[#FF5500] uppercase tracking-wider group-hover:translate-x-1 transition-transform font-bold">
                    <span>Explorer l&apos;univers</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SÉLECTION D'ATELIER (GRILLE CALME) (#selection) (THÈME CLAIR)
         ========================================================================= */}
      <section id="selection" className="py-20 md:py-28 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="font-mono text-xs tracking-[0.22em] text-[#FF5500] uppercase font-bold">
              SÉLECTION COURANTE // COMINES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 mt-2">
              Objets d&apos;Atelier Disponibles
            </h2>
          </div>

          {/* Onglets de filtrage sobres */}
          <div className="flex flex-wrap items-center gap-2 border border-neutral-200 p-1.5 rounded-xl bg-white shadow-xs">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#FF5500] text-white font-bold shadow-xs"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
              }`}
            >
              TOUT ({curatedSelection.length})
            </button>
            <button
              onClick={() => setSelectedCategory("art-toys")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === "art-toys"
                  ? "bg-[#FF5500] text-white font-bold shadow-xs"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
              }`}
            >
              01 POCHETTES SURPRISES
            </button>
            <button
              onClick={() => setSelectedCategory("hardware")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === "hardware"
                  ? "bg-[#FF5500] text-white font-bold shadow-xs"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
              }`}
            >
              02 HARDWARE
            </button>
            <button
              onClick={() => setSelectedCategory("desk-setup")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === "desk-setup"
                  ? "bg-[#FF5500] text-white font-bold shadow-xs"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
              }`}
            >
              03 DESK SETUP
            </button>
            <button
              onClick={() => setSelectedCategory("play")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === "play"
                  ? "bg-[#FF5500] text-white font-bold shadow-xs"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
              }`}
            >
              04 PLAY
            </button>
          </div>
        </div>

        {/* Grille 4 colonnes épurée */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between bg-white border border-neutral-200/90 hover:border-neutral-400 rounded-2xl overflow-hidden transition-all duration-300 shadow-xs hover:shadow-lg"
            >
              {/* Photo carrée nette sur fond neutre */}
              <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-105 transition-all duration-500"
                />

                {/* Badge contextuel optionnel */}
                {item.badge && (
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-neutral-200 text-[#FF5500] font-mono text-[9px] tracking-wider px-2.5 py-1 rounded uppercase font-bold shadow-xs">
                    {item.badge}
                  </div>
                )}

              </div>

              {/* Détails de la carte */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Titre uppercase */}
                  <h4 className="font-bold text-sm text-neutral-900 group-hover:text-black uppercase tracking-tight leading-snug line-clamp-2">
                    {item.title}
                  </h4>

                  {item.statusNote && (
                    <div className="text-[11px] text-neutral-500 font-mono mt-1">
                      {item.statusNote}
                    </div>
                  )}
                </div>

                {/* Prix monospace aligné en bas et bouton discret [ + ] */}
                <div className="pt-4 mt-3 border-t border-neutral-200 flex items-center justify-between">
                  <div className="font-mono text-base font-bold text-neutral-950">
                    {item.price}
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-neutral-800 hover:text-white bg-neutral-100 hover:bg-[#FF5500] border border-neutral-200 hover:border-[#FF5500] px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-semibold shadow-xs"
                    title="Ajouter au panier d'atelier"
                  >
                    <span>[ + ]</span>
                    <span className="text-[10px] uppercase hidden sm:inline">Ajouter</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          6. LE MANIFESTE D'ATELIER (#manifeste) (THÈME CLAIR)
         ========================================================================= */}
      <section id="manifeste" className="py-20 md:py-28 border-t border-b border-neutral-200/80 bg-neutral-100/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono text-xs tracking-[0.25em] text-[#FF5500] uppercase font-bold">
              NOTRE ENGAGEMENT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 mt-3">
              {manifestoData.title}
            </h2>
            <p className="text-neutral-600 text-base sm:text-lg font-normal mt-3">
              {manifestoData.subtitle}
            </p>
          </div>

          {/* Bandeau typographique à 3 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {manifestoData.points.map((point) => (
              <div
                key={point.index}
                className="relative bg-white border border-neutral-200/90 rounded-2xl p-8 flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-colors shadow-xs"
              >
                <div>
                  <div className="font-mono text-3xl font-extrabold text-[#FF5500] mb-4">
                    {point.index}
                  </div>
                  <h3 className="text-xl font-bold text-neutral-950 tracking-tight mb-2">
                    {point.title}
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed font-normal">
                    {point.desc}
                  </p>
                </div>

                {point.highlight && (
                  <div className="pt-4 border-t border-neutral-200 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                    PILIERS : <span className="text-neutral-900 font-semibold">{point.highlight}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Charte adulte / atelier */}
          <div className="mt-12 text-center p-6 bg-white border border-neutral-200 rounded-xl max-w-4xl mx-auto shadow-xs">
            <div className="font-mono text-xs text-neutral-600 leading-relaxed">
              <span className="text-[#FF5500] font-bold">AVERTISSEMENT D&apos;ATELIER :</span>{" "}
              {manifestoData.charterPledge}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FOOTER TECHNIQUE SPOOLIO (THÈME CLAIR)
         ========================================================================= */}
      <footer className="py-16 border-t border-neutral-200 bg-[#F4F4F3]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-neutral-200">
            {/* Identity & Mission */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 border border-neutral-300 bg-white flex items-center justify-center font-mono text-xs text-[#FF5500] font-bold shadow-xs">
                  SP
                </div>
                <span className="font-mono text-xs tracking-[0.2em] uppercase font-bold text-neutral-950">
                  SPOOLIO ATELIER V2
                </span>
              </div>
              <p className="text-neutral-600 text-xs leading-relaxed max-w-sm font-normal">
                Laboratoire de création d&apos;art toys, fidgets mécaniques et pièces d&apos;atelier
                imprimées en 3D en polymère végétal bio-sourcé.
              </p>
              <div className="font-mono text-[11px] text-neutral-500 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Atelier Spoolio • 59560 Comines, France</span>
              </div>
            </div>

            {/* Univers */}
            <div className="md:col-span-3 space-y-3 font-mono text-xs">
              <div className="text-neutral-950 font-bold uppercase tracking-wider text-[11px]">
                Univers
              </div>
              <ul className="space-y-2 text-neutral-600">
                {fourPortals.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => handlePortalClick(p.categoryFilter)}
                      className="hover:text-neutral-950 transition-colors cursor-pointer text-left"
                    >
                      {p.code} {p.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Informations & Navigation atelier */}
            <div className="md:col-span-4 space-y-3 font-mono text-xs">
              <div className="text-neutral-950 font-bold uppercase tracking-wider text-[11px]">
                Navigation & Démo
              </div>
              <ul className="space-y-2 text-neutral-600">
                <li>
                  <Link
                    href="/"
                    className="hover:text-neutral-950 transition-colors flex items-center gap-1.5"
                  >
                    <span>← Retour au site Spoolio v1 classique</span>
                  </Link>
                </li>
                <li>
                  <Link href="/cgv" className="hover:text-neutral-950 transition-colors">
                    Conditions Générales de Vente
                  </Link>
                </li>
                <li>
                  <Link href="/mentions-legales" className="hover:text-neutral-950 transition-colors">
                    Mentions Légales & Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-neutral-950 transition-colors">
                    Contact Atelier (support@spoolio.fr)
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-neutral-500 tracking-wider">
            <div>
              © 2026 SPOOLIO ATELIER — TOUS DROITS RÉSERVÉS // COMINES (59)
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>SYSTÈME EN LIGNE // MOCK 100% LOCAL ISOLÉ</span>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          LOCAL CART DRAWER (MOCK ISOLÉ - AUCUNE MUTATION SUPABASE - THÈME CLAIR)
         ========================================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer */}
          <div className="relative z-10 w-full max-w-md bg-white border-l border-neutral-200 p-6 flex flex-col justify-between shadow-2xl h-full">
            <div>
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#FF5500]" />
                  <span className="font-mono text-sm tracking-wider uppercase font-bold text-neutral-950">
                    PANIER ({totalCartCount})
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-neutral-500 hover:text-neutral-950 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items list */}
              <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 font-mono text-xs">
                    Votre sélection d&apos;atelier est vide.
                  </div>
                ) : (
                  cartItems.map((entry) => (
                    <div
                      key={entry.item.id}
                      className="flex items-center gap-4 bg-neutral-50 border border-neutral-200 p-3 rounded-xl"
                    >
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0">
                        <Image
                          src={entry.item.imageUrl}
                          alt={entry.item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[9px] text-[#FF5500] uppercase truncate font-bold">
                          {entry.item.collectionTag}
                        </div>
                        <div className="font-bold text-xs text-neutral-950 truncate">
                          {entry.item.title}
                        </div>
                        <div className="font-mono text-xs text-neutral-600 mt-0.5">
                          {entry.item.price} × {entry.qty}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setCartItems((prev) =>
                            prev.filter((i) => i.item.id !== entry.item.id)
                          )
                        }
                        className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Retirer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Drawer footer */}
            <div className="border-t border-neutral-200 pt-5 space-y-4">
              <div className="flex justify-between items-baseline font-mono">
                <span className="text-xs uppercase text-neutral-500">Total estimé</span>
                <span className="text-xl font-bold text-neutral-950">
                  {totalCartPrice.toFixed(2).replace(".", ",")} €
                </span>
              </div>
              <div className="text-[10px] font-mono text-neutral-500">
                Mock local actif : aucune transaction bancaire réelle, aucune écriture base de
                données.
              </div>
              <button
                onClick={() => {
                  alert(
                    "Démonstration Spoolio V2 : Panier local validé avec succès (mode bac à sable, aucune mutation Supabase)."
                  );
                  setIsCartOpen(false);
                }}
                disabled={cartItems.length === 0}
                className="w-full py-4 bg-[#FF5500] hover:bg-[#e04b00] disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-mono text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer shadow-xs"
              >
                VALIDER LA SÉLECTION D&apos;ATELIER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          QUICK VIEW MODAL (THÈME CLAIR)
         ========================================================================= */}
      {quickViewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setQuickViewItem(null)}
            className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl">
            <button
              onClick={() => setQuickViewItem(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-900 p-1 cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                <Image
                  src={quickViewItem.imageUrl}
                  alt={quickViewItem.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-4">
                <div className="font-mono text-xs text-[#FF5500] uppercase tracking-wider font-bold">
                  {quickViewItem.collectionTag}
                </div>
                <h3 className="text-xl font-bold text-neutral-950">
                  {quickViewItem.title}
                </h3>
                <div className="font-mono text-xs text-neutral-700 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                  MATIÈRE : {quickViewItem.materialTag}
                  <br />
                  ORIGINE : ATELIER COMINES (59)
                </div>
                <div className="text-2xl font-mono font-bold text-neutral-950">
                  {quickViewItem.price}
                </div>
                <button
                  onClick={() => {
                    handleAddToCart(quickViewItem);
                    setQuickViewItem(null);
                  }}
                  className="w-full py-3 bg-[#FF5500] hover:bg-[#e04b00] text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer shadow-xs"
                >
                  AJOUTER À MA SÉLECTION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TOAST NOTIFICATION DISCRÈTE (THÈME CLAIR)
         ========================================================================= */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-white border border-neutral-200 text-neutral-900 font-mono text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-[#FF5500]" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
