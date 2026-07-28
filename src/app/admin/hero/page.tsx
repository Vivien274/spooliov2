"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdminTheme } from "../AdminThemeContext";

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

interface HeroConfig {
  topBadgeText?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  slides: HeroSlide[];
}

export default function HeroCustomizerPage() {
  const { cls, theme } = useAdminTheme();
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [loadingHero, setLoadingHero] = useState<boolean>(true);
  const [savingHero, setSavingHero] = useState<boolean>(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
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

  useEffect(() => {
    fetchHeroConfig();
  }, []);

  const handleSlideChange = (index: number, field: keyof HeroSlide, value: string) => {
    setSlides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
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
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-16">
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
                      Image d'Arrière-Plan
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

          <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-[#08080a] text-white p-6 min-h-[380px] flex flex-col justify-between shadow-2xl">
            {/* Slide Background Image Preview */}
            <div className="absolute inset-0 z-0">
              {currentActiveSlide.image && (
                <Image
                  src={currentActiveSlide.image}
                  alt={currentActiveSlide.title || "Slide"}
                  fill
                  className="object-cover opacity-35 filter contrast-125 saturate-125"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/75 to-[#08080a]/40 z-10" />
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
            <div className="relative z-20 my-auto text-center space-y-3 py-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[10px] font-mono font-black text-white">
                {currentActiveSlide.badge}
              </div>

              <h2 className="text-xl font-black uppercase text-white font-antonio leading-tight">
                {currentActiveSlide.title}
              </h2>

              <p className="text-xs text-gray-300 font-sans leading-relaxed max-w-xs mx-auto">
                {currentActiveSlide.subtitle}
              </p>

              <div className="pt-2">
                <span className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff4f00] to-[#FF7700] text-white font-black text-[11px] uppercase tracking-wider rounded-full px-5 py-2.5 shadow-lg">
                  {currentActiveSlide.buttonText} &rarr;
                </span>
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
