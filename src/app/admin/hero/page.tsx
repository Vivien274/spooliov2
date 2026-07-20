"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdminTheme } from "../AdminThemeContext";

const ADMIN_BLUE = "#2F3CD9";

interface HeroConfig {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  imagePosition?: string;
}

export default function HeroCustomizerPage() {
  const { cls, theme } = useAdminTheme();
  const [heroConfig, setHeroConfig] = useState<HeroConfig>({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
    imageUrl: "",
    imagePosition: "center center",
  });
  const [loadingHero, setLoadingHero] = useState<boolean>(true);
  const [savingHero, setSavingHero] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [heroSuccess, setHeroSuccess] = useState<string | null>(null);
  const [heroError, setHeroError] = useState<string | null>(null);

  const fetchHeroConfig = async () => {
    setLoadingHero(true);
    try {
      const res = await fetch("/api/admin/hero");
      if (res.ok) {
        const data = await res.json();
        setHeroConfig(data.hero || {
          title: "",
          subtitle: "",
          buttonText: "",
          buttonLink: "",
          imageUrl: "",
          imagePosition: "center center"
        });
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setHeroError(null);
    setHeroSuccess(null);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setHeroConfig(prev => ({ ...prev, imageUrl: data.imageUrl }));
        setHeroSuccess("Image téléversée avec succès !");
      } else {
        setHeroError(data.error || "Erreur de téléversement.");
      }
    } catch (err) {
      setHeroError("Impossible d'uploader l'image.");
    } finally {
      setUploading(false);
    }
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
        body: JSON.stringify({ hero: heroConfig }),
      });
      if (res.ok) {
        setHeroSuccess("Configuration enregistrée avec succès !");
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/admin" className={`text-xs ${cls.textMuted} hover:text-white transition-colors`}>
              &larr; Retour Dashboard
            </Link>
          </div>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Personnalisation Accueil 🎨</h1>
          <p className={`text-sm ${cls.textMuted} mt-1`}>
            Personnalisez la bannière principale (Hero) affichée en haut de votre page d'accueil.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Form */}
        <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 md:p-8 space-y-6 transition-colors duration-300`}>
          <div>
            <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-widest font-antonio`}>Réglages Hero</h3>
            <p className={`text-xs ${cls.textMuted} mt-0.5`}>Modifiez le texte, le bouton et l'image de fond du Hero.</p>
          </div>

          {loadingHero ? (
            <div className="py-12 text-center text-xs text-gray-500 uppercase tracking-widest font-bold font-sans">
              Chargement des réglages...
            </div>
          ) : (
            <form onSubmit={handleSaveHero} className="space-y-4 text-xs font-sans">
              <div className="flex flex-col gap-1.5">
                <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                  Titre Principal *
                </label>
                <input
                  type="text"
                  required
                  value={heroConfig.title}
                  onChange={(e) => setHeroConfig({ ...heroConfig, title: e.target.value })}
                  placeholder="Ex: La Capsule été"
                  className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                  Sous-titre / Description
                </label>
                <input
                  type="text"
                  value={heroConfig.subtitle}
                  onChange={(e) => setHeroConfig({ ...heroConfig, subtitle: e.target.value })}
                  placeholder="Ex: Elle est sortie, elle est tout belle !"
                  className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    Texte du Bouton *
                  </label>
                  <input
                    type="text"
                    required
                    value={heroConfig.buttonText}
                    onChange={(e) => setHeroConfig({ ...heroConfig, buttonText: e.target.value })}
                    placeholder="Ex: VOIR LA CAPSULE"
                    className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    Lien du Bouton *
                  </label>
                  <input
                    type="text"
                    required
                    value={heroConfig.buttonLink}
                    onChange={(e) => setHeroConfig({ ...heroConfig, buttonLink: e.target.value })}
                    placeholder="Ex: /boutique"
                    className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                  Image de Fond *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={heroConfig.imageUrl}
                    onChange={(e) => setHeroConfig({ ...heroConfig, imageUrl: e.target.value })}
                    placeholder="Ex: /images/hero_background.jpg"
                    className={`flex-1 h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                  />
                  <label className="h-10 px-4 bg-[#2F3CD9] hover:bg-[#202db0] disabled:bg-[#2F3CD9]/40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {uploading ? "..." : "Uploader"}
                  </label>
                </div>
                <span className={`text-[10px] ${cls.textFaint} mt-0.5 leading-normal`}>
                  Sélectionnez une image sur votre ordinateur ou indiquez une URL absolue.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                  Positionnement de l'image *
                </label>
                <select
                  value={heroConfig.imagePosition || "center center"}
                  onChange={(e) => setHeroConfig({ ...heroConfig, imagePosition: e.target.value })}
                  className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9] cursor-pointer`}
                >
                  <option value="center center">Centré (Milieu)</option>
                  <option value="top center">Haut Centré</option>
                  <option value="bottom center">Bas Centré</option>
                  <option value="center left">Milieu Gauche</option>
                  <option value="center right">Milieu Droite</option>
                  <option value="top left">Haut Gauche</option>
                  <option value="top right">Haut Droite</option>
                  <option value="bottom left">Bas Gauche</option>
                  <option value="bottom right">Bas Droite</option>
                </select>
                <span className={`text-[10px] ${cls.textFaint} mt-0.5 leading-normal`}>
                  Définit la zone d'ancrage de l'image de fond (utile si l'image est recadrée).
                </span>
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
                className="w-full h-11 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50"
                style={{ background: ADMIN_BLUE, boxShadow: "0 8px 24px rgba(47, 60, 217, 0.25)" }}
              >
                {savingHero ? "Sauvegarde..." : "Enregistrer la configuration"}
              </button>
            </form>
          )}
        </div>

        {/* Right Live Preview Box */}
        <div className="space-y-4">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${cls.textFaint}`}>Prévisualisation en direct (Mode Sombre)</h4>
          <div className="relative overflow-hidden rounded-3xl border border-spoolio-border bg-[#0d0d11] aspect-[1.8/1] w-full p-6 flex flex-col items-center justify-center text-center shadow-2xl">
            {/* Dynamic Background Image */}
            <div 
              className="absolute inset-0 bg-cover transition-all duration-300 no-invert"
              style={{ 
                backgroundImage: `url('${heroConfig.imageUrl || "/images/hero_background.jpg"}')`,
                backgroundPosition: heroConfig.imagePosition || "center center"
              }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 z-0" />

            {/* Banner content */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 md:gap-3 max-w-sm">
              <h1 className="text-xl md:text-3xl font-extrabold uppercase tracking-tight text-white font-antonio leading-none">
                {heroConfig.title || "Titre du Hero"}
              </h1>
              <p className="text-[10px] md:text-xs text-gray-200 leading-normal">
                {heroConfig.subtitle || "Description du hero"}
              </p>
              <button className="mt-2 px-5 py-2 bg-[#ff4f00] text-white font-bold text-[8px] md:text-[10px] tracking-wider rounded-full uppercase cursor-default select-none shadow-md">
                {heroConfig.buttonText || "Bouton"}
              </button>
            </div>
          </div>
          
          {/* Note */}
          <div className="p-4 rounded-2xl bg-black/10 border border-white/5 text-[10px] text-gray-400 leading-relaxed font-sans flex gap-2">
            <span className="text-yellow-500 text-sm">💡</span>
            <p>
              <strong>Conseil de design :</strong> Utilisez une image de fond sombre ou peu saturée pour que vos titres blancs restent parfaitement lisibles sans dénaturer l'esthétique du site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
