"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdminTheme } from "../AdminThemeContext";
import { PageSeoConfig, DEFAULT_PAGES_SEO } from "@/lib/seoPagesTypes";

const PAGES_LIST = [
  { id: "home", label: "🏠 Page d'Accueil", path: "/", defaultUrl: "https://spoolio.fr" },
  { id: "boutique", label: "🛍️ Boutique", path: "/boutique", defaultUrl: "https://spoolio.fr/boutique" },
  { id: "tombola", label: "🎟️ Tombola", path: "/tombola", defaultUrl: "https://spoolio.fr/tombola" },
  { id: "boussole-sensorielle", label: "🧩 Boussole Sensorielle", path: "/boussole-sensorielle", defaultUrl: "https://spoolio.fr/boussole-sensorielle" },
  { id: "pochette-surprise", label: "🎁 Pochette Surprise", path: "/pochette-surprise", defaultUrl: "https://spoolio.fr/pochette-surprise" },
  { id: "createur-cliqueur", label: "🖱️ Créateur de Cliqueur", path: "/createur-cliqueur", defaultUrl: "https://spoolio.fr/createur-cliqueur" },
  { id: "a-propos", label: "ℹ️ À Propos", path: "/a-propos", defaultUrl: "https://spoolio.fr/a-propos" },
  { id: "liens", label: "🔗 Hub de Liens", path: "/liens", defaultUrl: "https://spoolio.fr/liens" },
  { id: "faq", label: "❓ FAQ", path: "/faq", defaultUrl: "https://spoolio.fr/faq" },
];

export default function AdminSeoPagesPage() {
  const { cls, theme } = useAdminTheme();

  const [activeTab, setActiveTab] = useState<string>("home");
  const [seoConfigs, setSeoConfigs] = useState<Record<string, PageSeoConfig>>(DEFAULT_PAGES_SEO);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch SEO configs on mount
  useEffect(() => {
    const fetchSeo = async () => {
      try {
        const res = await fetch("/api/admin/seo-pages");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.seoConfig) {
            setSeoConfigs((prev) => ({ ...prev, ...data.seoConfig }));
          }
        }
      } catch (e) {
        console.error("Failed to load SEO configs:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSeo();
  }, []);

  const currentConfig = seoConfigs[activeTab] || {
    title: "",
    description: "",
    keywords: "",
    ogImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    noIndex: false
  };

  const handleUpdateCurrentField = (field: keyof PageSeoConfig, value: any) => {
    setSeoConfigs((prev) => ({
      ...prev,
      [activeTab]: {
        ...currentConfig,
        [field]: value
      }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seoConfig: seoConfigs })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage("✅ Paramètres SEO enregistrés avec succès !");
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        alert(`⚠️ ${data.error || "Erreur lors de l'enregistrement."}`);
      }
    } catch (err) {
      alert("Erreur réseau lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const activePageInfo = PAGES_LIST.find((p) => p.id === activeTab) || PAGES_LIST[0];
  const titleLength = currentConfig.title.length;
  const descLength = currentConfig.description.length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <h1 className={`text-2xl font-black ${cls.textMain} tracking-tight uppercase`}>
              SEO des Pages Principales
            </h1>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Google & Social
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Personnalise le titre, la méta-description, les mots-clés et les aperçus partagés pour chaque page du site.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={activePageInfo.path}
            target="_blank"
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-white/10"
          >
            <span>👁️ Voir la page publique</span>
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Pages Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-800/60">
        {PAGES_LIST.map((page) => {
          const isActive = activeTab === page.id;
          return (
            <button
              key={page.id}
              onClick={() => setActiveTab(page.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 border ${
                isActive
                  ? "bg-[#ff4f00] text-white border-[#ff4f00] shadow-lg scale-105"
                  : "bg-[#18181b] text-gray-400 border-gray-800 hover:text-white hover:border-gray-700"
              }`}
            >
              <span>{page.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form & Live Google SERP Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-[#18181b] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Édition : {activePageInfo.label}
            </h3>
            <span className="text-xs font-mono text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              URL : {activePageInfo.path}
            </span>
          </div>

          {/* Balise Title */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-300 uppercase">
                Balise Méta Title (Titre Google)
              </label>
              <span className={`text-[10px] font-mono font-bold ${
                titleLength >= 30 && titleLength <= 60 ? "text-emerald-400" : "text-amber-400"
              }`}>
                {titleLength} / 60 car. (Recommandé: 30-60)
              </span>
            </div>
            <input
              type="text"
              value={currentConfig.title}
              onChange={(e) => handleUpdateCurrentField("title", e.target.value)}
              className="w-full bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-[#ff4f00] transition-colors"
              placeholder="ex: Spoolio | Objets Sensoriels 3D"
              required
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-300 uppercase">
                Méta Description (Extrait Google)
              </label>
              <span className={`text-[10px] font-mono font-bold ${
                descLength >= 120 && descLength <= 160 ? "text-emerald-400" : "text-amber-400"
              }`}>
                {descLength} / 160 car. (Recommandé: 120-160)
              </span>
            </div>
            <textarea
              rows={4}
              value={currentConfig.description}
              onChange={(e) => handleUpdateCurrentField("description", e.target.value)}
              className="w-full bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-[#ff4f00] transition-colors leading-relaxed"
              placeholder="Résumé attractif de la page pour inciter au clic sur Google..."
              required
            />
          </div>

          {/* Keywords / Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 uppercase block">
              Mots-clés principaux (séparés par des virgules)
            </label>
            <input
              type="text"
              value={currentConfig.keywords || ""}
              onChange={(e) => handleUpdateCurrentField("keywords", e.target.value)}
              className="w-full bg-black/60 border border-gray-700 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#ff4f00]"
              placeholder="ex: fidget 3d, impression 3d, spoolio, tdah"
            />
          </div>

          {/* OpenGraph Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 uppercase block">
              Image Social Share / OpenGraph (Lien relatif ou URL)
            </label>
            <input
              type="text"
              value={currentConfig.ogImage || ""}
              onChange={(e) => handleUpdateCurrentField("ogImage", e.target.value)}
              className="w-full bg-black/60 border border-gray-700 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#ff4f00]"
              placeholder="/images/... ou https://..."
            />
          </div>

          {/* NoIndex Checkbox */}
          <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-300 uppercase block">
                Indexation Moteurs de Recherche (Google / Bing)
              </span>
              <span className="text-[11px] text-gray-500">
                Masquer cette page des résultats Google (Balise noindex).
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentConfig.noIndex || false}
                onChange={(e) => handleUpdateCurrentField("noIndex", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-[#ff4f00] hover:bg-[#e04500] disabled:bg-gray-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
          >
            {saving ? "Enregistrement..." : "💾 Enregistrer le SEO de cette page"}
          </button>
        </form>

        {/* Right Column: Live SERP Google Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#18181b] border border-gray-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Aperçu Google SERP (Direct)
              </h3>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                Google Search
              </span>
            </div>

            {/* Google Result Snippet Card */}
            <div className="bg-white rounded-2xl p-4 space-y-1.5 shadow-md font-sans text-left">
              {/* Site URL & Favicon */}
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <div className="w-4 h-4 rounded-full bg-[#ff4f00] text-white text-[9px] font-black flex items-center justify-center">
                  S
                </div>
                <div className="truncate">
                  <span className="font-semibold text-gray-900">Spoolio</span>
                  <span className="text-gray-500 text-[11px] block truncate font-mono">
                    {activePageInfo.defaultUrl}
                  </span>
                </div>
              </div>

              {/* Title Link */}
              <h4 className="text-base font-medium text-[#1a0dab] hover:underline cursor-pointer truncate leading-tight">
                {currentConfig.title || "Titre de la page..."}
              </h4>

              {/* Description Snippet */}
              <p className="text-xs text-[#4d5156] line-clamp-2 leading-normal">
                {currentConfig.description || "Description de la page qui apparaîtra dans les résultats de recherche..."}
              </p>
            </div>

            {/* Recommendations Box */}
            <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 space-y-2 text-xs text-gray-300">
              <div className="font-bold text-gray-200 flex items-center gap-1.5">
                <span>💡</span>
                <span>Conseils pour un SEO optimal :</span>
              </div>
              <ul className="space-y-1 text-[11px] text-gray-400 list-disc pl-4">
                <li>Place ton mot-clé principal au **début du titre**.</li>
                <li>Incluis **Spoolio** et un émoticône captivant (ex: 📦, 🎟️, 🎁).</li>
                <li>Rédige une méta description incitative avec un appel à l'action.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
