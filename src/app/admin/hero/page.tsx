"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useAdminTheme } from "../AdminThemeContext";

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

const ADMIN_BLUE = "#2F3CD9";

export interface HeroSlide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  accentColor: string;

  // Floating product card
  cardProductId?: number | string;
  cardTitle?: string;
  cardDescription?: string;
  cardPrice?: string;
  cardImage?: string;
  cardLink?: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 1,
    badge: "🌀 COLLECTION FIDGETS",
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
    badge: "⌨️ SUR-MESURE & ASMR",
    title: "CRÉE TON CLICKER 3D SUR-MESURE 🎨",
    subtitle: "Choisis tes couleurs de switch, le nombre de touches et la finition de ton fidget clicker",
    buttonText: "CRÉER MON CLICKER",
    buttonLink: "/createur-cliqueur",
    image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    accentColor: "#2F3CD9",
    cardTitle: "Fidget Clicker 3D Custom",
    cardDescription: "Sensations ASMR avec switchs interchangeables.",
    cardPrice: "À partir de 3.00€",
    cardImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    cardLink: "/createur-cliqueur"
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
    cardTitle: "Pochette Surprise Spoolio",
    cardDescription: "3 à 5 créations 3D et fidgets mystères inédits.",
    cardPrice: "10.00€",
    cardImage: "/images/imported/PochetteM-1.png",
    cardLink: "/pochette-surprise"
  },
];

interface HeroConfig {
  topBadgeText?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  slides: HeroSlide[];
}

interface CatalogProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  images?: Array<{ src: string }>;
  short_description?: string;
  description?: string;
}

export default function HeroCustomizerPage() {
  const { cls, theme } = useAdminTheme();
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [loadingHero, setLoadingHero] = useState<boolean>(true);
  const [savingHero, setSavingHero] = useState<boolean>(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [uploadingCardIndex, setUploadingCardIndex] = useState<number | null>(null);
  const [heroSuccess, setHeroSuccess] = useState<string | null>(null);
  const [heroError, setHeroError] = useState<string | null>(null);

  const fetchHeroConfig = async () => {
    setLoadingHero(true);
    try {
      const res = await fetch("/api/admin/hero");
      if (res.ok) {
        const data = await res.json();
        if (data.config && Array.isArray(data.config.slides) && data.config.slides.length > 0) {
          setSlides(data.config.slides);
        }
      }
    } catch (e) {
      console.error("Failed to load hero configuration:", e);
    } finally {
      setLoadingHero(false);
    }
  };

  const fetchCatalogProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products?status=publish");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCatalogProducts(data);
        }
      }
    } catch (err) {
      console.error("Failed to load catalog products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchHeroConfig();
    fetchCatalogProducts();
  }, []);

  const handleSlideChange = (index: number, field: keyof HeroSlide, value: any) => {
    setSlides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSelectProductForSlide = (slideIndex: number, selectedProductIdStr: string) => {
    const prodId = Number(selectedProductIdStr);
    const selectedProd = catalogProducts.find((p) => Number(p.id) === prodId);

    setSlides((prev) => {
      const updated = [...prev];
      const slide = { ...updated[slideIndex] };

      if (selectedProd) {
        const rawDesc = selectedProd.short_description || selectedProd.description || "";
        const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, "").trim();

        const prodImage = selectedProd.images && selectedProd.images[0]?.src
          ? selectedProd.images[0].src
          : slide.image;

        const formattedPrice = selectedProd.price
          ? (selectedProd.price.includes("€") ? selectedProd.price : `${selectedProd.price}€`)
          : "14.90€";

        slide.cardProductId = selectedProd.id;
        slide.cardTitle = selectedProd.name;
        slide.cardPrice = formattedPrice;
        slide.cardDescription = cleanDesc || "Fabriqué à Comines en PLA biosourcé.";
        slide.cardImage = prodImage;
        slide.cardLink = `/product/${selectedProd.slug}`;
      } else {
        slide.cardProductId = undefined;
      }

      updated[slideIndex] = slide;
      return updated;
    });
  };

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCardIndex(slideIndex);
    setHeroError(null);
    setHeroSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        handleSlideChange(slideIndex, "cardImage", data.imageUrl);
        setHeroSuccess(`Image miniature produit pour la slide #${slideIndex + 1} téléversée !`);
      } else {
        setHeroError(data.error || "Erreur de téléversement.");
      }
    } catch (err) {
      setHeroError("Impossible d'uploader l'image.");
    } finally {
      setUploadingCardIndex(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(slideIndex);
    setHeroError(null);
    setHeroSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        handleSlideChange(slideIndex, "image", data.imageUrl);
        setHeroSuccess(`Image de la slide #${slideIndex + 1} téléversée !`);
      } else {
        setHeroError(data.error || "Erreur de téléversement.");
      }
    } catch (err) {
      setHeroError("Impossible d'uploader l'image.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleAddSlide = () => {
    const newId = Date.now();
    const newSlide: HeroSlide = {
      id: newId,
      badge: "✨ NOUVEAUTÉ 3D",
      title: "NOUVELLE COLLECTION SPOOLIO 🚀",
      subtitle: "Description de la nouvelle collection disponible dès maintenant.",
      buttonText: "DÉCOUVRIR LE PRODUIT",
      buttonLink: "/boutique",
      image: "/images/hero_background.jpg",
      accentColor: "#ff4f00",
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const handleDeleteSlide = (indexToDelete: number) => {
    if (slides.length <= 1) {
      alert("Vous devez conserver au moins 1 slide dans le carrousel.");
      return;
    }
    if (!confirm(`Supprimer la Slide #${indexToDelete + 1} ?`)) return;

    setSlides((prev) => prev.filter((_, idx) => idx !== indexToDelete));
    if (activeSlideIndex >= slides.length - 1) {
      setActiveSlideIndex(Math.max(0, slides.length - 2));
    }
  };

  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    setSlides((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
    setActiveSlideIndex(targetIndex);
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHero(true);
    setHeroError(null);
    setHeroSuccess(null);

    try {
      const res = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });
      if (res.ok) {
        setHeroSuccess("Carrousel Hero enregistré avec succès !");
      } else {
        const data = await res.json();
        setHeroError(data.error || "Erreur lors de la sauvegarde.");
      }
    } catch (err) {
      setHeroError("Erreur réseau lors de la sauvegarde.");
    } finally {
      setSavingHero(false);
    }
  };

  const currentActiveSlide = slides[activeSlideIndex] || slides[0] || DEFAULT_SLIDES[0];

  return (
    <div className="max-w-[1720px] mx-auto w-full px-2 sm:px-4 lg:px-6 space-y-8 font-sans pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/admin" className={`text-xs ${cls.textMuted} hover:text-white transition-colors`}>
              &larr; Retour Dashboard
            </Link>
          </div>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>
            Gestion du Carrousel Slider Hero 🎬
          </h1>
          <p className={`text-sm ${cls.textMuted} mt-1`}>
            Gérez les slides de la bannière d'accueil : ajoutez, modifiez, réordonnez et changez les visuels.
          </p>
        </div>

        <button
          onClick={handleAddSlide}
          className="h-11 px-5 bg-gradient-to-r from-[#ff4f00] to-[#FF7700] hover:from-[#e04500] hover:to-[#ff4f00] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <span>+ Ajouter une Slide</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: SLIDE TABS & EDIT FORM (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Slide Tabs Navigation */}
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-black/40 border border-white/10">
            {slides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                type="button"
                onClick={() => setActiveSlideIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  activeSlideIndex === idx
                    ? "bg-[#ff4f00] text-white shadow-md"
                    : "bg-white/5 hover:bg-white/10 text-gray-300"
                }`}
              >
                <span>Slide #{idx + 1}</span>
                <span className="text-[10px] opacity-75 truncate max-w-[120px]">{slide.badge}</span>
              </button>
            ))}
          </div>

          {/* Current Active Slide Form */}
          <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 md:p-8 space-y-6 transition-colors duration-300`}>
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-widest font-antonio`}>
                  Édition de la Slide #{activeSlideIndex + 1}
                </h3>
                <p className={`text-xs ${cls.textMuted} mt-0.5`}>Personnalisez les textes et le visuel de cette slide.</p>
              </div>

              {/* Reorder & Delete Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMoveSlide(activeSlideIndex, "up")}
                  disabled={activeSlideIndex === 0}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold text-xs flex items-center justify-center transition-colors"
                  title="Déplacer vers le haut"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveSlide(activeSlideIndex, "down")}
                  disabled={activeSlideIndex === slides.length - 1}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold text-xs flex items-center justify-center transition-colors"
                  title="Déplacer vers le bas"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSlide(activeSlideIndex)}
                  className="h-8 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold flex items-center justify-center transition-colors"
                  title="Supprimer la slide"
                >
                  🗑️
                </button>
              </div>
            </div>

            {loadingHero ? (
              <div className="py-12 text-center text-xs text-gray-500 uppercase tracking-widest font-bold font-sans">
                Chargement de la configuration...
              </div>
            ) : (
              <form onSubmit={handleSaveHero} className="space-y-4 text-xs font-sans">
                
                {/* Pastille / Badge */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    Pastille / Badge du Haut
                  </label>
                  <input
                    type="text"
                    required
                    value={currentActiveSlide.badge}
                    onChange={(e) => handleSlideChange(activeSlideIndex, "badge", e.target.value)}
                    placeholder="Ex: 🌀 COLLECTION FIDGETS"
                    className={`h-11 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                  />
                </div>

                {/* Titre Principal */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    Titre Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentActiveSlide.title}
                    onChange={(e) => handleSlideChange(activeSlideIndex, "title", e.target.value)}
                    placeholder="Ex: LA FOLIE DES FIDGETS SENSORIELS ⚡"
                    className={`h-11 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9] font-bold`}
                  />
                </div>

                {/* Sous-titre */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    Description / Sous-titre
                  </label>
                  <textarea
                    rows={2}
                    value={currentActiveSlide.subtitle}
                    onChange={(e) => handleSlideChange(activeSlideIndex, "subtitle", e.target.value)}
                    placeholder="Ex: Décompresser, toucher, cliquer..."
                    className={`p-3 border rounded-xl outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                  />
                </div>

                {/* Bouton CTA Text & Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                      Texte du Bouton CTA *
                    </label>
                    <input
                      type="text"
                      required
                      value={currentActiveSlide.buttonText}
                      onChange={(e) => handleSlideChange(activeSlideIndex, "buttonText", e.target.value)}
                      placeholder="Ex: DÉCOUVRIR LA BOUTIQUE"
                      className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                      Lien du Bouton *
                    </label>
                    <input
                      type="text"
                      required
                      value={currentActiveSlide.buttonLink}
                      onChange={(e) => handleSlideChange(activeSlideIndex, "buttonLink", e.target.value)}
                      placeholder="Ex: /boutique"
                      className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                    />
                  </div>
                </div>

                {/* Image & Accent Color */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                      Image d'Arrière-Plan (Photo Hero)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentActiveSlide.image}
                        onChange={(e) => handleSlideChange(activeSlideIndex, "image", e.target.value)}
                        placeholder="Ex: /images/hero_background.jpg"
                        className={`flex-1 h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                      />
                      <label className="h-10 px-4 bg-white hover:bg-white/90 disabled:bg-white/40 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, activeSlideIndex)}
                          disabled={uploadingIndex === activeSlideIndex}
                        />
                        {uploadingIndex === activeSlideIndex ? "..." : "Uploader"}
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                      Couleur d'Accent Glow
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={currentActiveSlide.accentColor || "#ff4f00"}
                        onChange={(e) => handleSlideChange(activeSlideIndex, "accentColor", e.target.value)}
                        className="w-10 h-10 rounded-xl border border-white/20 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={currentActiveSlide.accentColor || "#ff4f00"}
                        onChange={(e) => handleSlideChange(activeSlideIndex, "accentColor", e.target.value)}
                        className={`flex-1 h-10 border rounded-xl px-2 outline-none text-xs ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Section : Carte Produit Flottante (La Bulle à Droite) */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#ff4f00] uppercase tracking-wider">
                      🛍️ Produit de la Bulle Flottante (Sur l'image à droite)
                    </span>
                  </div>

                  {/* Dynamic Product Search Field from Catalog */}
                  <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 relative">
                    <div className="flex items-center justify-between">
                      <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                        🔎 Rechercher le Produit du Catalogue pour la Bulle
                      </label>
                      {currentActiveSlide.cardTitle && (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          ✓ Produit associé
                        </span>
                      )}
                    </div>

                    {/* Active Selected Product Badge */}
                    {currentActiveSlide.cardTitle && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 border border-white/20 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-black/40 border border-white/20">
                            <Image
                              src={currentActiveSlide.cardImage || "/images/hero_background.jpg"}
                              alt={currentActiveSlide.cardTitle}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-white truncate text-xs">{currentActiveSlide.cardTitle}</div>
                            <div className="text-[10px] text-gray-300 font-mono">{currentActiveSlide.cardPrice || "14.90€"}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProductSearchQuery("");
                            setIsSearchFocused(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] text-gray-300 font-bold transition-colors shrink-0"
                        >
                          Changer de produit
                        </button>
                      </div>
                    )}

                    {/* Search Bar Input */}
                    <div className="relative">
                      <input
                        type="text"
                        value={productSearchQuery}
                        onChange={(e) => {
                          setProductSearchQuery(e.target.value);
                          setIsSearchFocused(true);
                        }}
                        onFocus={() => setIsSearchFocused(true)}
                        placeholder="Tapez le nom d'un produit (ex: Clicker, Dragon, Pochette...)"
                        className={`w-full h-11 border rounded-xl px-3 text-xs font-bold outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#ff4f00]`}
                      />

                      {/* Dropdown Popup with filtered results */}
                      {isSearchFocused && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsSearchFocused(false)}
                          />
                          <div className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-2xl bg-[#111116] border border-white/20 shadow-2xl z-50 divide-y divide-white/10">
                            {loadingProducts ? (
                              <div className="p-3 text-xs text-gray-400 font-mono italic text-center">
                                Chargement du catalogue...
                              </div>
                            ) : catalogProducts.filter((p) => p.name.toLowerCase().includes(productSearchQuery.toLowerCase())).length === 0 ? (
                              <div className="p-3.5 text-xs text-neutral-400 italic text-center">
                                Aucun produit ne correspond à "{productSearchQuery}"
                              </div>
                            ) : (
                              catalogProducts
                                .filter((p) => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()))
                                .slice(0, 8)
                                .map((prod) => (
                                  <button
                                    key={prod.id}
                                    type="button"
                                    onClick={() => {
                                      handleSelectProductForSlide(activeSlideIndex, String(prod.id));
                                      setProductSearchQuery("");
                                      setIsSearchFocused(false);
                                    }}
                                    className="w-full p-2.5 flex items-center gap-3 text-left hover:bg-white/10 transition-colors cursor-pointer"
                                  >
                                    <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-white/10 border border-white/15">
                                      <Image
                                        src={prod.images && prod.images[0]?.src ? prod.images[0].src : "/images/hero_background.jpg"}
                                        alt={prod.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-bold text-white truncate">{prod.name}</div>
                                      <div className="text-[10px] text-gray-400 font-mono">
                                        {prod.price ? (prod.price.includes("€") ? prod.price : `${prod.price}€`) : "3.00€"}
                                      </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#ff4f00] bg-[#ff4f00]/10 border border-[#ff4f00]/30 px-2 py-0.5 rounded-full shrink-0">
                                      Associer
                                    </span>
                                  </button>
                                ))
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <p className="text-[10px] text-gray-400 leading-normal">
                      Rechercher et associer un produit remplit automatiquement l'image miniature, le prix, la description et le lien vers la fiche produit.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                        Titre du Produit dans la Bulle
                      </label>
                      <input
                        type="text"
                        value={currentActiveSlide.cardTitle || ""}
                        onChange={(e) => handleSlideChange(activeSlideIndex, "cardTitle", e.target.value)}
                        placeholder="Ex: Pack Fidget Sensory TDAH"
                        className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                        Prix du Produit
                      </label>
                      <input
                        type="text"
                        value={currentActiveSlide.cardPrice || ""}
                        onChange={(e) => handleSlideChange(activeSlideIndex, "cardPrice", e.target.value)}
                        placeholder="Ex: 14.90€"
                        className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                      Description Courte
                    </label>
                    <input
                      type="text"
                      value={currentActiveSlide.cardDescription || ""}
                      onChange={(e) => handleSlideChange(activeSlideIndex, "cardDescription", e.target.value)}
                      placeholder="Ex: Assortiment anti-stress fabriqué en PLA biosourcé."
                      className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                        Image Miniature de la Bulle
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={currentActiveSlide.cardImage || ""}
                          onChange={(e) => handleSlideChange(activeSlideIndex, "cardImage", e.target.value)}
                          placeholder="Ex: /images/hero_background.jpg"
                          className={`flex-1 h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                        />
                        <label className="h-10 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0 border border-white/20">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleCardImageUpload(e, activeSlideIndex)}
                            disabled={uploadingCardIndex === activeSlideIndex}
                          />
                          {uploadingCardIndex === activeSlideIndex ? "..." : "Miniature"}
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                        Lien du Produit (Fiche produit)
                      </label>
                      <input
                        type="text"
                        value={currentActiveSlide.cardLink || ""}
                        onChange={(e) => handleSlideChange(activeSlideIndex, "cardLink", e.target.value)}
                        placeholder="Ex: /product/pack-fidget-tdah"
                        className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                      />
                    </div>
                  </div>
                </div>

                {heroSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs leading-normal">
                    ✓ {heroSuccess}
                  </div>
                )}

                {heroError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs leading-normal">
                    ⚠️ {heroError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingHero}
                  className="w-full h-12 flex items-center justify-center text-white bg-[#ff4f00] hover:bg-[#e04500] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#ff4f00]/20 disabled:opacity-50 mt-4"
                >
                  {savingHero ? "Enregistrement..." : "Enregistrer les Slides du Carrousel"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: REAL-TIME SLIDE PREVIEW (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-widest font-antonio`}>
              Aperçu en Direct de la Slide #{activeSlideIndex + 1}
            </h3>
            <p className={`text-xs ${cls.textMuted} mt-0.5`}>Visualisez exactement l'aspect final sur la page d'accueil.</p>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-neutral-800 bg-[#08080a] text-white p-5 min-h-[420px] flex flex-col justify-between shadow-2xl">
            {/* Slide Background Image Preview */}
            <div className="absolute inset-0 z-0">
              {currentActiveSlide.image && (
                <Image
                  src={currentActiveSlide.image}
                  alt={currentActiveSlide.title || "Slide"}
                  fill
                  className="object-cover opacity-50 filter contrast-125 saturate-125"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/80 to-transparent z-10" />
              <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full filter blur-[80px] pointer-events-none z-10 opacity-30"
                style={{ backgroundColor: currentActiveSlide.accentColor || "#ff4f00" }}
              />
            </div>

            {/* Simulated Header Bar */}
            <div className="relative z-20 flex items-center justify-between text-xs font-bold font-mono opacity-60 border-b border-white/10 pb-3">
              <span>SPOOLIO DEMO</span>
              <span>SLIDE {activeSlideIndex + 1}/{slides.length}</span>
            </div>

            {/* Slide Content Preview */}
            <div className="relative z-20 my-auto space-y-4 py-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[10px] font-mono font-black text-[#ff4f00]">
                {currentActiveSlide.badge}
              </div>

              <h2 className="text-xl font-black uppercase text-white font-antonio leading-tight max-w-xs">
                {renderFormattedText(currentActiveSlide.title)}
              </h2>

              <p className="text-xs text-gray-300 font-sans leading-relaxed max-w-xs line-clamp-2">
                {renderFormattedText(currentActiveSlide.subtitle)}
              </p>

              <div>
                <span className="inline-flex items-center justify-center gap-2 bg-[#1b2bd8] border border-blue-400/50 text-white font-black text-[10px] uppercase tracking-wider rounded-xl px-4 py-2 shadow-lg">
                  {currentActiveSlide.buttonText} &rarr;
                </span>
              </div>

              {/* Floating Product Card Preview */}
              <div className="pt-2">
                <div className="backdrop-blur-md bg-black/70 border border-white/20 rounded-2xl p-3 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-white/10">
                    <Image
                      src={currentActiveSlide.cardImage || currentActiveSlide.image || "/images/hero_background.jpg"}
                      alt={currentActiveSlide.cardTitle || "Produit"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{currentActiveSlide.cardTitle || "Produit Spoolio"}</h4>
                    <span className="text-[10px] font-mono text-gray-300 font-bold">{currentActiveSlide.cardPrice || "14.90€"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dots Preview */}
            <div className="relative z-20 flex items-center justify-center gap-2 pt-2">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === activeSlideIndex ? "w-6 bg-[#ff4f00]" : "w-2 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

