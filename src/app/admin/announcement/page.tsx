"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Palmtree, Sparkles, Save, CheckCircle2, AlertCircle, ArrowRight, Eye, RefreshCw, X } from "lucide-react";
import { AnnouncementBannerConfig, DEFAULT_BANNER_CONFIG } from "@/app/api/announcement-banner/route";

const GRADIENT_OPTIONS = [
  {
    id: "dark-sleek",
    name: "Sombre Chic (Signature Information)",
    value: "from-[#12131c] via-[#1c1e2d] to-[#12131c]",
    previewBg: "bg-gradient-to-r from-[#12131c] via-[#1c1e2d] to-[#12131c]",
  },
  {
    id: "cyber",
    name: "Cyber Neon (Violet & Rose)",
    value: "from-indigo-600 via-purple-600 to-pink-600",
    previewBg: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600",
  },
  {
    id: "emerald",
    name: "Émeraude Bio (Vert & Cyan)",
    value: "from-emerald-600 via-teal-600 to-cyan-600",
    previewBg: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600",
  },
  {
    id: "ocean",
    name: "Ocean Blue (Bleu & Turquoise)",
    value: "from-blue-600 via-cyan-600 to-teal-500",
    previewBg: "bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500",
  },
  {
    id: "dark-luxe",
    name: "Dark Luxe (Noir Sleek & Mat)",
    value: "from-slate-900 via-zinc-900 to-black",
    previewBg: "bg-gradient-to-r from-slate-900 via-zinc-900 to-black",
  },
];

export default function AdminAnnouncementPage() {
  const [config, setConfig] = useState<AnnouncementBannerConfig>(DEFAULT_BANNER_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcement-banner");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (e) {
      console.error("Error fetching banner config:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/announcement-banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: "Configuration enregistrée et appliquée sur l'ensemble du site !" });
      } else {
        setStatusMessage({ type: "error", text: data.error || "Une erreur s'est produite lors de l'enregistrement." });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Erreur réseau lors de la sauvegarde." });
    } finally {
      setSaving(false);
    }
  };

  const applyPresetVacation = () => {
    setConfig({
      enabled: true,
      badgeText: "Vacances",
      message: "Spoolio prend quelques jours de vacances, les imprimantes reprennent du service à partir du 29 Août !",
      buttonText: "",
      buttonLink: "",
      bgGradient: "from-[#12131c] via-[#1c1e2d] to-[#12131c]",
      dismissible: true,
    });
  };

  const applyPresetPromo = () => {
    setConfig({
      enabled: true,
      badgeText: "Offre Spéciale",
      message: "Profitez de 15% de réduction sur tous les fidgets avec le code SPOOLIO15 !",
      buttonText: "Profiter de l'offre",
      buttonLink: "/boutique",
      bgGradient: "from-indigo-600 via-purple-600 to-pink-600",
      dismissible: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-[#ff4f00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#ff4f00]">
            <Sparkles className="w-4 h-4" />
            <span>Contenu &amp; Apparence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-antonio uppercase tracking-wide text-white mt-1">
            Bandeau Haut de Page
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gérez le bandeau d'information affiché tout en haut du site (vacances, promotions, annonces).
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={applyPresetVacation}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Palmtree className="w-3.5 h-3.5 text-amber-300" />
            <span>Preset Vacances</span>
          </button>
          <button
            type="button"
            onClick={applyPresetPromo}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Preset Promo</span>
          </button>
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-gray-400 tracking-wider">
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Prévisualisation en direct</span>
          </span>
          <span className={config.enabled ? "text-emerald-400" : "text-amber-400"}>
            ● {config.enabled ? "Actif sur le site" : "Masqué sur le site"}
          </span>
        </div>

        <div className="rounded-2xl border border-white/15 p-4 bg-[#0a0a0d] shadow-xl overflow-hidden">
          {config.enabled ? (
            <div className={`w-full rounded-xl bg-gradient-to-r ${config.bgGradient || "from-[#ff4f00] via-[#ff6800] to-[#ff4f00]"} text-white py-1.5 px-4 flex items-center justify-between gap-2 text-xs font-medium shadow-md transition-all`}>
              <div className="mx-auto flex items-center justify-center gap-2 text-center flex-1 min-w-0">
                {config.badgeText && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                    <Palmtree className="w-3 h-3 text-amber-200" />
                    <span>{config.badgeText}</span>
                  </span>
                )}

                <p className="truncate leading-tight font-sans">
                  {config.message || "Votre message d'annonce ici..."}
                </p>

                {config.buttonText && config.buttonLink && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-gray-900 font-bold text-[10px] shadow-xs shrink-0 ml-1">
                    <span>{config.buttonText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>

              {config.dismissible && (
                <div className="p-0.5 rounded-full hover:bg-white/20 text-white/80 shrink-0">
                  <X className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ) : (
            <div className="py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest border border-dashed border-white/10 rounded-xl">
              [ Le bandeau est actuellement désactivé ]
            </div>
          )}
        </div>
      </div>

      {/* Form Settings */}
      <form onSubmit={handleSave} className="space-y-6 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
        {statusMessage && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${statusMessage.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border-rose-500/30 text-rose-300"}`}>
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Global Activation Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">Afficher le bandeau sur le site</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Active ou désactive l'affichage du bandeau tout en haut du site.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${config.enabled ? "bg-[#ff4f00]" : "bg-gray-700"}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${config.enabled ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Badge Text */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
              Texte du Badge (optionnel)
            </label>
            <input
              type="text"
              value={config.badgeText}
              onChange={(e) => setConfig({ ...config, badgeText: e.target.value })}
              placeholder="ex. Vacances, Info, Promo"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#ff4f00] transition-colors"
            />
          </div>

          {/* Theme Gradient Selector */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
              Couleur &amp; Style du Dégradé
            </label>
            <select
              value={config.bgGradient || "from-[#ff4f00] via-[#ff6800] to-[#ff4f00]"}
              onChange={(e) => setConfig({ ...config, bgGradient: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#ff4f00] transition-colors"
            >
              {GRADIENT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.value} className="bg-gray-900 text-white">
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message Content */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
            Message d'Information
          </label>
          <textarea
            rows={3}
            value={config.message}
            onChange={(e) => setConfig({ ...config, message: e.target.value })}
            placeholder="Entrez le texte qui sera affiché dans le bandeau..."
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#ff4f00] transition-colors leading-relaxed"
          />
        </div>

        {/* CTA Button & Link */}
        <div className="border-t border-white/10 pt-6 space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#ff4f00] flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Bouton d'action (CTA) Optionnel</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Texte du bouton
              </label>
              <input
                type="text"
                value={config.buttonText || ""}
                onChange={(e) => setConfig({ ...config, buttonText: e.target.value })}
                placeholder="ex. Voir la boutique, En savoir plus"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#ff4f00] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Lien cible du bouton
              </label>
              <input
                type="text"
                value={config.buttonLink || ""}
                onChange={(e) => setConfig({ ...config, buttonLink: e.target.value })}
                placeholder="ex. /boutique ou https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#ff4f00] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="border-t border-white/10 pt-6 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Bouton de fermeture (X)</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Permet aux visiteurs de masquer le bandeau durant leur session.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfig({ ...config, dismissible: !config.dismissible })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${config.dismissible ? "bg-[#ff4f00]" : "bg-gray-700"}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${config.dismissible ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-[#ff4f00] hover:bg-[#e04500] text-white font-bold text-sm transition-all shadow-lg shadow-[#ff4f00]/30 hover:scale-[1.02] flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer la configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
