"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdminTheme } from "../AdminThemeContext";

const ADMIN_BLUE = "#2F3CD9";

interface HeroConfig {
  topBadgeText?: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  cardBadge?: string;
  cardTitle?: string;
  cardPrice?: string;
  cardTags?: string;
  cardLink?: string;
  cardImage?: string;
  imageUrl: string;
  imagePosition?: string;
}

export default function HeroCustomizerPage() {
  const { cls, theme } = useAdminTheme();
  const [heroConfig, setHeroConfig] = useState<HeroConfig>({
    topBadgeText: "🟢 ATELIER EN ACTION (COMINES 🇫🇷) • PLA BIOSOURCÉ",
    title: "L'IMPRESSION 3D QUI A DU PUNCH 🌀",
    subtitle: "Objets funs, fidgets sensoriels TDAH & clickers sur-mesure faits main en France avec du plastique biosourcé 🌱",
    buttonText: "🛠️ CRÉER MON CLICKER 3D",
    buttonLink: "/createur-cliqueur",
    secondaryButtonText: "🛍️ VOIR LA BOUTIQUE",
    secondaryButtonLink: "/boutique",
    cardBadge: "🔥 PRODUIT STAR 3D",
    cardTitle: "⌨️ Fidget Clicker 3D Custom",
    cardPrice: "À partir de 3.00€",
    cardTags: "🎨 12 Couleurs PLA • ⚡ 1 à 9 Touches • 🌱 PLA Biosourcé",
    cardLink: "/createur-cliqueur",
    cardImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    imageUrl: "/images/hero_background.jpg",
    imagePosition: "center center",
  });

  const [loadingHero, setLoadingHero] = useState<boolean>(true);
  const [savingHero, setSavingHero] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadingCard, setUploadingCard] = useState<boolean>(false);
  const [heroSuccess, setHeroSuccess] = useState<string | null>(null);
  const [heroError, setHeroError] = useState<string | null>(null);

  const fetchHeroConfig = async () => {
    setLoadingHero(true);
    try {
      const res = await fetch("/api/admin/hero");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setHeroConfig((prev) => ({ ...prev, ...data.config }));
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: "imageUrl" | "cardImage") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (targetField === "imageUrl") setUploading(true);
    else setUploadingCard(true);

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
        setHeroConfig(prev => ({ ...prev, [targetField]: data.imageUrl }));
        setHeroSuccess("Image téléversée avec succès !");
      } else {
        setHeroError(data.error || "Erreur de téléversement.");
      }
    } catch (err) {
      setHeroError("Impossible d'uploader l'image.");
    } finally {
      setUploading(false);
      setUploadingCard(false);
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
        body: JSON.stringify(heroConfig),
      });
      if (res.ok) {
        setHeroSuccess("Configuration du Hero enregistrée avec succès !");
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
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/admin" className={`text-xs ${cls.textMuted} hover:text-white transition-colors`}>
              &larr; Retour Dashboard
            </Link>
          </div>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Personnalisation Hero Accueil 🎨</h1>
          <p className={`text-sm ${cls.textMuted} mt-1`}>
            Personnalisez tous les textes, boutons, badges et images de la section Hero principale.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Form */}
        <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 md:p-8 space-y-6 transition-colors duration-300`}>
          <div>
            <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-widest font-antonio`}>Éditeur du Hero</h3>
            <p className={`text-xs ${cls.textMuted} mt-0.5`}>Modifiez le texte principal, les boutons et la carte produit star.</p>
          </div>

          {loadingHero ? (
            <div className="py-12 text-center text-xs text-gray-500 uppercase tracking-widest font-bold font-sans">
              Chargement des réglages...
            </div>
          ) : (
            <form onSubmit={handleSaveHero} className="space-y-4 text-xs font-sans">
              
              {/* SECTION 1: EN-TÊTE PRINCIPAL */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-[#ff4f00] uppercase tracking-wider">1. En-tête Principal (Gauche)</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    Pastille Statut Atelier (Haut)
                  </label>
                  <input
                    type="text"
                    value={heroConfig.topBadgeText || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, topBadgeText: e.target.value })}
                    placeholder="Ex: 🟢 ATELIER EN ACTION (COMINES 🇫🇷) • PLA BIOSOURCÉ"
                    className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    Titre Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={heroConfig.title}
                    onChange={(e) => setHeroConfig({ ...heroConfig, title: e.target.value })}
                    placeholder="Ex: L'IMPRESSION 3D QUI A DU PUNCH 🌀"
                    className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    Sous-titre / Description
                  </label>
                  <textarea
                    rows={2}
                    value={heroConfig.subtitle}
                    onChange={(e) => setHeroConfig({ ...heroConfig, subtitle: e.target.value })}
                    placeholder="Ex: Objets funs, fidgets sensoriels TDAH..."
                    className={`p-3 border rounded-xl outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                  />
                </div>
              </div>

              {/* SECTION 2: BOUTONS CTA */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-[#ff4f00] uppercase tracking-wider">2. Boutons d'Action (CTA)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                      Bouton Principal *
                    </label>
                    <input
                      type="text"
                      required
                      value={heroConfig.buttonText}
                      onChange={(e) => setHeroConfig({ ...heroConfig, buttonText: e.target.value })}
                      placeholder="Ex: 🛠️ CRÉER MON CLICKER 3D"
                      className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                      Lien Bouton Principal *
                    </label>
                    <input
                      type="text"
                      required
                      value={heroConfig.buttonLink}
                      onChange={(e) => setHeroConfig({ ...heroConfig, buttonLink: e.target.value })}
                      placeholder="Ex: /createur-cliqueur"
                      className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                      Bouton Secondaire
                    </label>
                    <input
                      type="text"
                      value={heroConfig.secondaryButtonText || ""}
                      onChange={(e) => setHeroConfig({ ...heroConfig, secondaryButtonText: e.target.value })}
                      placeholder="Ex: 🛍️ VOIR LA BOUTIQUE"
                      className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                      Lien Bouton Secondaire
                    </label>
                    <input
                      type="text"
                      value={heroConfig.secondaryButtonLink || ""}
                      onChange={(e) => setHeroConfig({ ...heroConfig, secondaryButtonLink: e.target.value })}
                      placeholder="Ex: /boutique"
                      className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: CARTE PRODUIT STAR (DROITE) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-[#ff4f00] uppercase tracking-wider">3. Carte Produit Star (Droite)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                      Badge Carte
                    </label>
                    <input
                      type="text"
                      value={heroConfig.cardBadge || ""}
                      onChange={(e) => setHeroConfig({ ...heroConfig, cardBadge: e.target.value })}
                      placeholder="Ex: 🔥 PRODUIT STAR 3D"
                      className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                      Prix de la Carte
                    </label>
                    <input
                      type="text"
                      value={heroConfig.cardPrice || ""}
                      onChange={(e) => setHeroConfig({ ...heroConfig, cardPrice: e.target.value })}
                      placeholder="Ex: À partir de 3.00€"
                      className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    Titre Produit Carte
                  </label>
                  <input
                    type="text"
                    value={heroConfig.cardTitle || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, cardTitle: e.target.value })}
                    placeholder="Ex: ⌨️ Fidget Clicker 3D Custom"
                    className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    Puces Produit (Séparées par des puces •)
                  </label>
                  <input
                    type="text"
                    value={heroConfig.cardTags || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, cardTags: e.target.value })}
                    placeholder="Ex: 🎨 12 Couleurs PLA • ⚡ 1 à 9 Touches • 🌱 PLA Biosourcé"
                    className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    Lien de la Carte
                  </label>
                  <input
                    type="text"
                    value={heroConfig.cardLink || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, cardLink: e.target.value })}
                    placeholder="Ex: /createur-cliqueur"
                    className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    Image du Produit Carte
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={heroConfig.cardImage || ""}
                      onChange={(e) => setHeroConfig({ ...heroConfig, cardImage: e.target.value })}
                      placeholder="Ex: /images/imported/Spoolio_Kit-Festival-16-scaled.webp"
                      className={`flex-1 h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain}`}
                    />
                    <label className="h-10 px-4 bg-white hover:bg-white/90 disabled:bg-white/40 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "cardImage")}
                        disabled={uploadingCard}
                      />
                      {uploadingCard ? "..." : "Uploader"}
                    </label>
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
                className="w-full h-12 flex items-center justify-center text-white bg-[#ff4f00] hover:bg-[#e04500] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#ff4f00]/20 disabled:opacity-50"
              >
                {savingHero ? "Sauvegarde..." : "Enregistrer Toute la Configuration Hero"}
              </button>
            </form>
          )}
        </div>

        {/* Right Live Preview Info Box */}
        <div className="space-y-4">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${cls.textFaint}`}>Récapitulatif de la Configuration</h4>
          
          <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 space-y-4 text-xs font-mono`}>
            <div>
              <span className="text-[#ff4f00] font-bold">Pastille : </span>
              <span className="text-gray-300">{heroConfig.topBadgeText}</span>
            </div>
            <div>
              <span className="text-[#ff4f00] font-bold">Titre : </span>
              <span className="text-white font-extrabold">{heroConfig.title}</span>
            </div>
            <div>
              <span className="text-[#ff4f00] font-bold">Sous-titre : </span>
              <span className="text-gray-400">{heroConfig.subtitle}</span>
            </div>
            <div>
              <span className="text-[#ff4f00] font-bold">Bouton Principal : </span>
              <span className="text-emerald-400">{heroConfig.buttonText} ({heroConfig.buttonLink})</span>
            </div>
            <div>
              <span className="text-[#ff4f00] font-bold">Bouton Secondaire : </span>
              <span className="text-cyan-400">{heroConfig.secondaryButtonText} ({heroConfig.secondaryButtonLink})</span>
            </div>
            <div>
              <span className="text-[#ff4f00] font-bold">Produit Star Carte : </span>
              <span className="text-purple-300">{heroConfig.cardTitle} — {heroConfig.cardPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
