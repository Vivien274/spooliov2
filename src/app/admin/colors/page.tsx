"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";

interface ColorItem {
  id: number;
  name: string;
  category: string;
  className?: string | null;
  style?: string | null;
  description?: string | null;
  isAvailable: boolean;
  position: number;
}

const CATEGORIES_LABELS: Record<string, string> = {
  BICOLORS_DEGRADES: "Bicolores & Dégradés 🌈",
  SPECIALS_TEXTURES: "Matières & Effets Spéciaux ✨",
  UNIS: "Couleurs Unies Classiques 🎨",
};

const PRESET_CLASSES = [
  { value: "", label: "Aucune (Style CSS personnalisé)" },
  { value: "swatch-rainbow", label: "Arc-en-ciel (swatch-rainbow)" },
  { value: "swatch-paillette", label: "Paillettes / Micro-reflets (swatch-paillette)" },
  { value: "swatch-bois", label: "Effet Bois (swatch-bois)" },
  { value: "swatch-roche", label: "Effet Roche (swatch-roche)" },
  { value: "swatch-marbre", label: "Effet Marbre (swatch-marbre)" },
  { value: "swatch-phospho", label: "Phosphorescent Fluorescent (swatch-phospho)" },
  { value: "swatch-transparent", label: "Effet Translucide (swatch-transparent)" },
];

export default function AdminColorsPage() {
  const { cls } = useAdminTheme();
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("ALL");

  // Edit / Form states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("UNIS");
  const [className, setClassName] = useState<string>("");
  const [style, setStyle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [position, setPosition] = useState<number>(0);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchColors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/colors");
      if (res.ok) {
        const data = await res.json();
        setColors(data.colors || []);
      } else {
        setErrorMsg("Impossible de charger la palette de couleurs.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const handleToggleAvailability = async (color: ColorItem) => {
    const updatedStatus = !color.isAvailable;
    // Optimistic UI update
    setColors((prev) =>
      prev.map((c) => (c.id === color.id ? { ...c, isAvailable: updatedStatus } : c))
    );

    try {
      const res = await fetch("/api/admin/colors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: color.id, isAvailable: updatedStatus }),
      });
      if (!res.ok) {
        // Rollback if error
        setColors((prev) =>
          prev.map((c) => (c.id === color.id ? { ...c, isAvailable: color.isAvailable } : c))
        );
        setErrorMsg("Erreur lors de la mise à jour de la disponibilité.");
      }
    } catch (err) {
      setColors((prev) =>
        prev.map((c) => (c.id === color.id ? { ...c, isAvailable: color.isAvailable } : c))
      );
      setErrorMsg("Erreur réseau lors de la bascule de disponibilité.");
    }
  };

  const handleStartEdit = (color: ColorItem) => {
    setEditingId(color.id);
    setName(color.name);
    setCategory(color.category);
    setClassName(color.className || "");
    setStyle(color.style || "");
    setDescription(color.description || "");
    setIsAvailable(color.isAvailable);
    setPosition(color.position || 0);
    setErrorMsg(null);
    setSuccessMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setCategory("UNIS");
    setClassName("");
    setStyle("");
    setDescription("");
    setIsAvailable(true);
    setPosition(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const isEdit = editingId !== null;
    const url = "/api/admin/colors";
    const method = isEdit ? "PUT" : "POST";
    const bodyPayload = isEdit
      ? { id: editingId, name: name.trim(), category, className, style, description, isAvailable, position }
      : { name: name.trim(), category, className, style, description, isAvailable, position };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(isEdit ? "Couleur mise à jour avec succès !" : "Nouvelle couleur ajoutée avec succès !");
        handleCancelEdit();
        fetchColors();
      } else {
        setErrorMsg(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setErrorMsg("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteColor = async (id: number, colorName: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer la couleur "${colorName}" de la palette ?`)) {
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/colors?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSuccessMsg(`Couleur "${colorName}" supprimée avec succès !`);
        if (editingId === id) handleCancelEdit();
        fetchColors();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "La suppression a échoué.");
      }
    } catch (err) {
      setErrorMsg("Erreur réseau.");
    }
  };

  // Helper to parse CSS inline style or fallback
  const getStyleObject = (styleString?: string | null): React.CSSProperties => {
    if (!styleString) return {};
    try {
      const stylesObj: React.CSSProperties = {};
      const pairs = styleString.split(";");
      for (const pair of pairs) {
        const [key, value] = pair.split(":");
        if (key && value) {
          const camelKey = key.trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          (stylesObj as any)[camelKey] = value.trim();
        }
      }
      return stylesObj;
    } catch (e) {
      return {};
    }
  };

  // Filter colors
  const filteredColors = colors.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || (c.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || c.category === selectedCategory;
    const matchesAvailability = availabilityFilter === "ALL" || (availabilityFilter === "AVAILABLE" && c.isAvailable) || (availabilityFilter === "UNAVAILABLE" && !c.isAvailable);
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const totalColors = colors.length;
  const availableCount = colors.filter((c) => c.isAvailable).length;
  const unavailableCount = totalColors - availableCount;

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-12">
      
      {/* Page Swatch Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .swatch-spool-admin {
          position: relative;
          width: 54px;
          height: 54px;
          border-radius: 9999px;
          border: 2px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          overflow: hidden;
          flex-shrink: 0;
        }
        .swatch-spool-admin::before {
          content: '';
          position: absolute;
          inset: 28%;
          border-radius: 9999px;
          background: #121214;
          border: 2px solid rgba(0, 0, 0, 0.5);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.8);
          z-index: 10;
        }
        .swatch-spool-admin::after {
          content: '';
          position: absolute;
          inset: 38%;
          border-radius: 9999px;
          background: #000;
          z-index: 11;
        }
        .swatch-rainbow {
          background: conic-gradient(#ff0000 0deg, #ff7f00 45deg, #ffff00 90deg, #00ff00 135deg, #0000ff 180deg, #4b0082 225deg, #8b00ff 270deg, #ff0000 360deg);
        }
        .swatch-phospho {
          background: #e0ffe0;
          box-shadow: 0 0 12px rgba(160, 255, 160, 0.6);
        }
        .swatch-bois {
          background: #a0785a;
          background-image: repeating-linear-gradient(45deg, #8e6749 0px, #8e6749 2px, #a0785a 2px, #a0785a 10px);
        }
        .swatch-roche {
          background: #8c8c82;
          background-image: radial-gradient(circle at 20% 30%, #5a5a50 1px, transparent 1px), radial-gradient(circle at 75% 60%, #b3b3a3 2px, transparent 2px);
          background-size: 10px 10px;
        }
        .swatch-marbre {
          background: #f5f6f8;
          background-image: linear-gradient(35deg, transparent 45%, rgba(0,0,0,0.15) 48%, rgba(0,0,0,0.15) 52%, transparent 55%);
        }
        .swatch-transparent {
          background-color: rgba(255, 255, 255, 0.2);
          background-image: linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.1) 75%);
          background-size: 8px 8px;
        }
      ` }} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/admin/products" className={`text-xs ${cls.textMuted} hover:text-white transition-colors`}>
              &larr; Retour Catalogue Produits
            </Link>
          </div>
          <h1 className={`text-3xl md:text-4xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>
            Palette de Couleurs 🎨
          </h1>
          <p className={`text-sm ${cls.textMuted} mt-1 max-w-2xl`}>
            Gérez les filaments disponibles sur la boutique. Marquez une couleur comme indisponible en 1 clic pour qu'elle ne soit plus proposée sur les produits.
          </p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border ${cls.border} ${cls.cardBg} flex items-center justify-between`}>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${cls.textMuted}`}>Total Couleurs</p>
            <p className={`text-3xl font-black font-antonio ${cls.textMain} mt-1`}>{totalColors}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl">
            🎨
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${cls.border} ${cls.cardBg} flex items-center justify-between`}>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${cls.textMuted}`}>En Stock / Disponibles</p>
            <p className="text-3xl font-black font-antonio text-emerald-400 mt-1">{availableCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
            🟢
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${cls.border} ${cls.cardBg} flex items-center justify-between`}>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${cls.textMuted}`}>Indisponibles</p>
            <p className="text-3xl font-black font-antonio text-amber-500 mt-1">{unavailableCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-xl">
            🔴
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between">
          <span>✅ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="hover:opacity-75">✕</button>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="hover:opacity-75">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left Column: Form Panel */}
        <div className={`lg:col-span-1 p-6 rounded-3xl border ${cls.border} ${cls.cardBg} space-y-5 transition-colors duration-300 sticky top-6`}>
          <div className="flex items-center justify-between border-b pb-4 border-white/10">
            <div>
              <h3 className={`text-sm font-bold ${cls.textMain} uppercase tracking-widest font-antonio`}>
                {editingId !== null ? "Éditer la Couleur" : "Ajouter une Couleur"}
              </h3>
              <p className={`text-xs ${cls.textMuted} mt-0.5`}>
                {editingId !== null ? "Modifiez les détails de cette teinte." : "Complétez la palette avec une nouvelle couleur."}
              </p>
            </div>
            {editingId !== null && (
              <button
                onClick={handleCancelEdit}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
              >
                Annuler
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                Nom de la couleur *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Bleu Néon Pailleté, Orange Pastel"
                className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#ff4f00]`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                Catégorie de couleur
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#ff4f00] cursor-pointer`}
              >
                <option value="BICOLORS_DEGRADES">🌈 Bicolores & Dégradés</option>
                <option value="SPECIALS_TEXTURES">✨ Matières & Effets Spéciaux</option>
                <option value="UNIS">🎨 Couleurs Unies Classiques</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                Effet / Classe CSS Prédéfinie
              </label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#ff4f00] cursor-pointer`}
              >
                {PRESET_CLASSES.map((pc) => (
                  <option key={pc.value} value={pc.value}>
                    {pc.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                Style CSS Inline (Background / Dégradé)
              </label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="Ex: background: #ff4f00 ou background: linear-gradient(...)"
                className={`h-10 border rounded-xl px-3 outline-none transition-colors font-mono text-[11px] ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#ff4f00]`}
              />
              <span className={`text-[9px] ${cls.textFaint}`}>
                Permet de définir une couleur uni (hex), un dégradé CSS ou une texture spécifique.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                Description courte
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Un bleu intense et lumineux parfait pour faire ressortir les contours..."
                className={`border rounded-xl p-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#ff4f00] resize-none leading-relaxed`}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl border bg-black/20 border-white/10">
              <div className="flex flex-col">
                <span className="font-bold text-xs text-white">Disponible</span>
                <span className="text-[10px] text-gray-400">Proposer ce filament aux clients</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isAvailable}
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    isAvailable ? "bg-emerald-500" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAvailable ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className={`text-[10px] font-black uppercase ${isAvailable ? "text-emerald-400" : "text-gray-400"}`}>
                  {isAvailable ? "ON" : "OFF"}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-black bg-[#ff4f00] hover:bg-[#ff4f00]/90 transition-all shadow-lg shadow-[#ff4f00]/20 disabled:opacity-50"
              >
                {submitting
                  ? "Enregistrement..."
                  : editingId !== null
                  ? "Mettre à jour la couleur"
                  : "+ Ajouter à la palette"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Colors List */}
        <div className="lg:col-span-2 space-y-6">

          {/* Search & Filters Toolbar */}
          <div className={`p-4 rounded-2xl border ${cls.border} ${cls.cardBg} flex flex-col md:flex-row gap-4 items-center justify-between`}>
            <div className="w-full md:w-auto flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Rechercher une couleur..."
                className={`w-full h-10 border rounded-xl px-3.5 text-xs outline-none ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#ff4f00]`}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`h-10 border rounded-xl px-3 text-xs outline-none ${cls.inputBg} ${cls.border} ${cls.textMain} cursor-pointer`}
              >
                <option value="ALL">Toutes les catégories</option>
                <option value="BICOLORS_DEGRADES">🌈 Bicolores & Dégradés</option>
                <option value="SPECIALS_TEXTURES">✨ Effets Spéciaux</option>
                <option value="UNIS">🎨 Unis Classiques</option>
              </select>

              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className={`h-10 border rounded-xl px-3 text-xs outline-none ${cls.inputBg} ${cls.border} ${cls.textMain} cursor-pointer`}
              >
                <option value="ALL">Tous les statuts</option>
                <option value="AVAILABLE">🟢 En Stock (Disponibles)</option>
                <option value="UNAVAILABLE">🔴 Indisponibles</option>
              </select>
            </div>
          </div>

          {/* Colors List Grid */}
          {loading ? (
            <div className="p-12 text-center text-gray-400 font-sans">Chargement de la palette...</div>
          ) : filteredColors.length === 0 ? (
            <div className="p-12 rounded-3xl border border-white/10 bg-black/20 text-center space-y-2">
              <p className="text-2xl">🎨</p>
              <p className="text-sm font-bold text-gray-300">Aucune couleur ne correspond à votre recherche.</p>
              <p className="text-xs text-gray-500">Essayez de modifier vos filtres ou ajoutez une nouvelle couleur.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredColors.map((color) => {
                const styleObj = getStyleObject(color.style);

                return (
                  <div
                    key={color.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      color.isAvailable
                        ? `border-white/10 ${cls.cardBg} hover:border-[#ff4f00]/30`
                        : "border-amber-500/20 bg-amber-500/5 opacity-80"
                    } flex flex-col justify-between gap-3 font-sans relative group`}
                  >
                    <div className="flex gap-3.5 items-start">
                      {/* Color Swatch Circle */}
                      <div
                        className={`swatch-spool-admin ${color.className || ""}`}
                        style={styleObj}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-sm truncate">{color.name}</h4>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              color.isAvailable
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            }`}
                          >
                            {color.isAvailable ? "Disponible" : "Indisponible"}
                          </span>
                        </div>

                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">
                          {color.description || "Aucune description"}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[9px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                            {CATEGORIES_LABELS[color.category] || color.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                      {/* Availability Switch [ON / OFF] */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-300">
                          Disponible
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={color.isAvailable}
                          onClick={() => handleToggleAvailability(color)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                            color.isAvailable ? "bg-emerald-500" : "bg-gray-700"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              color.isAvailable ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                        <span className={`text-[10px] font-black uppercase ${color.isAvailable ? "text-emerald-400" : "text-gray-400"}`}>
                          {color.isAvailable ? "ON" : "OFF"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(color)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-[11px] border border-white/10 transition-all"
                        >
                          ✏️ Éditer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteColor(color.id, color.name)}
                          className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-[11px] border border-red-500/20 transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
