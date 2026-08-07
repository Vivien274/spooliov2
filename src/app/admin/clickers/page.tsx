"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";

interface ShapeConfig {
  id: string;
  name: string;
  keyCount: number;
  price: number;
  active: boolean;
  badge?: string;
}

interface ColorConfig {
  id: string;
  name: string;
  hex: string;
  inStock: boolean;
}

interface SwitchConfig {
  id: string;
  name: string;
  badge: string;
  soundLabel: string;
  desc: string;
  inStock: boolean;
}

interface IconConfig {
  id: string;
  name: string;
  symbol: string;
  active: boolean;
}

interface AttachmentConfig {
  id: string;
  name: string;
  price: number;
  icon: string;
  inStock: boolean;
}

interface GalleryItem {
  id: number;
  src: string;
  title: string;
  caption: string;
}

const INITIAL_SHAPES: ShapeConfig[] = [
  { id: "square_2x2", name: "4 Touches Carré", keyCount: 4, price: 9.90, active: true, badge: "🔥 Best-Seller" },
  { id: "line_4", name: "4 Touches en Ligne", keyCount: 4, price: 9.90, active: true },
  { id: "shape_t", name: "4 Touches en T", keyCount: 4, price: 9.90, active: true, badge: "Original" },
  { id: "line_7", name: "7 Touches en Ligne", keyCount: 7, price: 14.90, active: true, badge: "⚡ Fidget Extra" },
  { id: "trio", name: "3 Touches en Ligne", keyCount: 3, price: 7.90, active: true },
  { id: "duo", name: "2 Touches en Ligne", keyCount: 2, price: 6.90, active: true },
  { id: "mono", name: "1 Touche", keyCount: 1, price: 4.90, active: true },
  { id: "grid_3x3", name: "9 Touches Carré", keyCount: 9, price: 16.90, active: true, badge: "⚡ Max Fidget" },
];

const INITIAL_COLORS: ColorConfig[] = [
  { id: "noir", name: "Noir Mat", hex: "#18181b", inStock: true },
  { id: "blanc", name: "Blanc Pur", hex: "#f4f4f5", inStock: true },
  { id: "gris", name: "Gris Carbone", hex: "#3f3f46", inStock: true },
  { id: "orange", name: "Orange Spoolio", hex: "#ff4f00", inStock: true },
  { id: "bleu", name: "Bleu Nuit", hex: "#1e3a8a", inStock: true },
  { id: "violet", name: "Violet Pailleté", hex: "#7c3aed", inStock: true },
  { id: "vert", name: "Vert Menthe", hex: "#10b981", inStock: true },
  { id: "jaune", name: "Jaune Soleil", hex: "#eab308", inStock: true },
  { id: "glow", name: "Phosphorescent", hex: "#a3e635", inStock: true },
];

const INITIAL_SWITCHES: SwitchConfig[] = [
  { id: "blue", name: "Clicky Bleu", badge: "Populaire", soundLabel: "🔊 Clic Aigu", desc: "Clic aigu, franc et très satisfaisant", inStock: true },
  { id: "brown", name: "Tactile Marron", badge: "Bureau", soundLabel: "🔉 Clic Net", desc: "Bosse tactile nette sans bruit aigu fort", inStock: true },
  { id: "red", name: "Linéaire Rouge", badge: "Discrétion", soundLabel: "🤫 Discret", desc: "Enfoncement ultra fluide et très silencieux", inStock: true },
];

const INITIAL_ICONS: IconConfig[] = [
  { id: "blank", name: "Vierge", symbol: "", active: true },
  { id: "spiral", name: "Spirale", symbol: "🌀", active: true },
  { id: "heart", name: "Cœur", symbol: "❤️", active: true },
  { id: "star", name: "Étoile", symbol: "⭐", active: true },
  { id: "flash", name: "Éclair", symbol: "⚡", active: true },
  { id: "smile", name: "Smiley", symbol: "😊", active: true },
  { id: "fire", name: "Flamme", symbol: "🔥", active: true },
  { id: "controller", name: "Manette", symbol: "🎛️", active: true },
  { id: "gamepad", name: "Arcade", symbol: "🎮", active: true },
  { id: "music", name: "Note de Musique", symbol: "🎵", active: true },
];

const INITIAL_ATTACHMENTS: AttachmentConfig[] = [
  { id: "chain", name: "Chaînette à Billes Inox", price: 0.50, icon: "⛓️", inStock: true },
  { id: "clip", name: "Mousqueton Métal Premium", price: 0.80, icon: "🪝", inStock: true },
  { id: "lanyard", name: "Dragonne de Poignet Souple", price: 1.50, icon: "🎗️", inStock: true },
  { id: "ring", name: "Anneau Porte-Clés Renforcé", price: 0.50, icon: "🔑", inStock: true },
  { id: "none", name: "Sans attache (Usage Bureau)", price: 0.00, icon: "🚫", inStock: true },
];

export default function AdminClickersPage() {
  const { theme } = useAdminTheme();

  const [shapes, setShapes] = useState<ShapeConfig[]>(INITIAL_SHAPES);
  const [colors, setColors] = useState<ColorConfig[]>(INITIAL_COLORS);
  const [switches, setSwitches] = useState<SwitchConfig[]>(INITIAL_SWITCHES);
  const [icons, setIcons] = useState<IconConfig[]>(INITIAL_ICONS);
  const [attachments, setAttachments] = useState<AttachmentConfig[]>(INITIAL_ATTACHMENTS);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  // New Icon Form
  const [newIconName, setNewIconName] = useState<string>("");
  const [newIconSymbol, setNewIconSymbol] = useState<string>("");

  // New Color Form
  const [newColorName, setNewColorName] = useState<string>("");
  const [newColorHex, setNewColorHex] = useState<string>("#ff4f00");

  // New Photo Form
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>("");
  const [newPhotoTitle, setNewPhotoTitle] = useState<string>("");
  const [newPhotoCaption, setNewPhotoCaption] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"shapes" | "colors" | "switches" | "icons" | "attachments" | "gallery" | "orders">("shapes");
  const [savedMessage, setSavedMessage] = useState<boolean>(false);

  const saveFullConfig = async (overrides?: {
    shapes?: ShapeConfig[];
    colors?: ColorConfig[];
    switches?: SwitchConfig[];
    icons?: IconConfig[];
    attachments?: AttachmentConfig[];
  }) => {
    const cfgToSave = {
      shapes: overrides?.shapes ?? shapes,
      colors: overrides?.colors ?? colors,
      switches: overrides?.switches ?? switches,
      icons: overrides?.icons ?? icons,
      attachments: overrides?.attachments ?? attachments,
    };
    try {
      await fetch("/api/admin/clicker-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfgToSave),
      });
    } catch (e) {
      console.error("Failed to save clicker config:", e);
    }
  };

  useEffect(() => {
    fetch("/api/admin/clicker-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.shapes && Array.isArray(data.shapes)) {
          const merged = INITIAL_SHAPES.map((base) => {
            const saved = data.shapes.find((s: any) => s.id === base.id);
            if (saved) {
              return {
                ...base,
                price: typeof saved.price === "number" ? saved.price : parseFloat(saved.price) || base.price,
                name: saved.name || base.name,
                active: saved.active !== false,
              };
            }
            return base;
          });
          setShapes(merged);
        }
        if (data.colors && Array.isArray(data.colors)) setColors(data.colors);

        if (data.switches && Array.isArray(data.switches)) {
          const mergedSwitches = INITIAL_SWITCHES.map((base) => {
            const saved = data.switches.find((s: any) => s.id === base.id);
            if (saved) {
              return {
                ...base,
                inStock: saved.inStock !== false,
                name: saved.name || base.name,
                badge: saved.badge || base.badge,
                soundLabel: saved.soundLabel || base.soundLabel,
                desc: saved.desc || base.desc,
              };
            }
            return base;
          });
          setSwitches(mergedSwitches);
        }

        if (data.icons && Array.isArray(data.icons)) {
          const mergedIcons = INITIAL_ICONS.map((base) => {
            const saved = data.icons.find((i: any) => i.id === base.id);
            if (saved) {
              return {
                ...base,
                active: saved.active !== false,
                name: saved.name || base.name,
                symbol: saved.symbol !== undefined ? saved.symbol : base.symbol,
              };
            }
            return base;
          });
          const customIcons = data.icons.filter((saved: any) => !INITIAL_ICONS.some((base) => base.id === saved.id));
          setIcons([...mergedIcons, ...customIcons]);
        }

        if (data.attachments && Array.isArray(data.attachments)) {
          const mergedAtts = INITIAL_ATTACHMENTS.map((base) => {
            const saved = data.attachments.find((a: any) => a.id === base.id);
            if (saved) {
              return {
                ...base,
                price: typeof saved.price === "number" ? saved.price : (parseFloat(saved.price) ?? base.price),
                name: saved.name || base.name,
                inStock: saved.inStock !== false,
              };
            }
            return base;
          });
          setAttachments(mergedAtts);
        }
      })
      .catch((e) => console.error("Error loading clicker config:", e));

    fetch("/api/admin/clicker-gallery")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setGalleryItems(data);
      })
      .catch((e) => console.error("Error loading gallery:", e));
  }, []);

  // Dynamic Theme Classes
  const cls = {
    cardBg: theme === "dark" ? "bg-spoolio-card" : "bg-white",
    inputBg: theme === "dark" ? "bg-spoolio-card border-spoolio-border text-white" : "bg-gray-50 border-gray-200 text-gray-900",
    border: theme === "dark" ? "border-spoolio-border" : "border-gray-200",
    textMain: theme === "dark" ? "text-white" : "text-gray-900",
    textMuted: theme === "dark" ? "text-gray-400" : "text-gray-500",
    textFaint: theme === "dark" ? "text-gray-500" : "text-gray-400",
  };

  const handleSaveConfigs = async () => {
    try {
      const fullConfig = {
        shapes,
        colors,
        switches,
        icons,
        attachments,
      };

      await fetch("/api/admin/clicker-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullConfig),
      });

      await fetch("/api/admin/clicker-gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(galleryItems),
      });

      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2500);
    } catch (e) {
      console.error("Failed to save gallery or clicker config:", e);
    }
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const baseSlug = newColorName.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
    const uniqueId = `${baseSlug}_${Date.now()}`;

    const newColor: ColorConfig = {
      id: uniqueId,
      name: newColorName.trim(),
      hex: newColorHex || "#ffffff",
      inStock: true,
    };
    const updated = [...colors, newColor];
    setColors(updated);
    setNewColorName("");
    saveFullConfig({ colors: updated });
  };

  const handleDeleteColor = (id: string) => {
    const updated = colors.filter(c => c.id !== id);
    setColors(updated);
    saveFullConfig({ colors: updated });
  };

  const uploadImageFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const responseText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (e) {}

      if (res.ok && (data?.url || data?.imageUrl || data?.src)) {
        return data.url || data.imageUrl || data.src;
      } else {
        const errorMsg = data?.error || (res.status === 413 ? "Fichier trop volumineux (max 4.5 Mo)." : "Erreur lors du téléversement de l'image.");
        alert(`⚠️ Échec de l'upload : ${errorMsg}`);
        return null;
      }
    } catch (err: any) {
      console.error("Image upload failed:", err);
      alert("⚠️ Erreur réseau lors de l'envoi de l'image.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    const newItems: GalleryItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = await uploadImageFile(file);
      if (url) {
        successCount++;
        const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        const title = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        newItems.push({
          id: Date.now() + i + Math.floor(Math.random() * 1000),
          src: url,
          title: title || "Création Clicker Spoolio 3D",
          caption: "Réalisation personnalisée sur-mesure imprimée en 3D",
        });
      }
    }

    if (newItems.length > 0) {
      setGalleryItems((prev) => {
        const updated = [...newItems, ...prev];
        fetch("/api/admin/clicker-gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        return updated;
      });
      alert(`🎉 ${successCount} photo${successCount > 1 ? "s" : ""} téléversée${successCount > 1 ? "s" : ""} et ajoutée${successCount > 1 ? "s" : ""} à la galerie !`);
    }

    setIsUploading(false);
    e.target.value = "";
  };

  const handleAddIcon = () => {
    if (!newIconName.trim()) return;
    const newIcon: IconConfig = {
      id: newIconName.toLowerCase().replace(/\s+/g, "_"),
      name: newIconName.trim(),
      symbol: newIconSymbol.trim(),
      active: true,
    };
    const updated = [...icons, newIcon];
    setIcons(updated);
    setNewIconName("");
    setNewIconSymbol("");
    saveFullConfig({ icons: updated });
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim() || !newPhotoTitle.trim()) return;
    const newItem: GalleryItem = {
      id: Date.now(),
      src: newPhotoUrl.trim(),
      title: newPhotoTitle.trim(),
      caption: newPhotoCaption.trim() || "Création personnalisée sur-mesure Spoolio 3D",
    };
    const updated = [newItem, ...galleryItems];
    setGalleryItems(updated);
    setNewPhotoUrl("");
    setNewPhotoTitle("");
    setNewPhotoCaption("");

    fetch("/api/admin/clicker-gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  };

  const handleDeletePhoto = (id: number) => {
    const updated = galleryItems.filter((item) => item.id !== id);
    setGalleryItems(updated);
    fetch("/api/admin/clicker-gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin/products" className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>
              Studio Clickers Sur-Mesure ⌨️
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              Actif
            </span>
          </div>
          <p className={`text-sm ${cls.textMuted}`}>
            Gérez les tarifs des formes, les switchs, les symboles gravés, les attaches et les stocks de filaments PLA pour le configurateur client.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/createur-cliqueur"
            target="_blank"
            className="text-xs font-bold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>👁️ Voir le Configurateur Client</span>
          </Link>
          <button
            type="button"
            onClick={handleSaveConfigs}
            className={`text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
              savedMessage ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-white/90 shadow-md"
            }`}
          >
            {savedMessage ? "Sauvegardé !" : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className={`flex items-center gap-2 p-1.5 rounded-2xl ${cls.cardBg} border ${cls.border} w-fit flex-wrap`}>
        <button
          type="button"
          onClick={() => setActiveTab("shapes")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "shapes" ? "bg-[#2F3CD9] text-white shadow-sm" : `${cls.textMuted} hover:${cls.textMain}`
          }`}
        >
          📐 Formes &amp; Tarifs ({shapes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("switches")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "switches" ? "bg-[#2F3CD9] text-white shadow-sm" : `${cls.textMuted} hover:${cls.textMain}`
          }`}
        >
          🎹 Switchs ({switches.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("icons")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "icons" ? "bg-[#2F3CD9] text-white shadow-sm" : `${cls.textMuted} hover:${cls.textMain}`
          }`}
        >
          ⭐ Symboles &amp; Gravures ({icons.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("attachments")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "attachments" ? "bg-[#2F3CD9] text-white shadow-sm" : `${cls.textMuted} hover:${cls.textMain}`
          }`}
        >
          ⛓️ Attaches &amp; Prix ({attachments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("colors")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "colors" ? "bg-[#2F3CD9] text-white shadow-sm" : `${cls.textMuted} hover:${cls.textMain}`
          }`}
        >
          🎨 Filaments PLA ({colors.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "gallery" ? "bg-[#2F3CD9] text-white shadow-sm" : `${cls.textMuted} hover:${cls.textMain}`
          }`}
        >
          📷 Galerie Photos ({galleryItems.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "orders" ? "bg-[#2F3CD9] text-white shadow-sm" : `${cls.textMuted} hover:${cls.textMain}`
          }`}
        >
          📦 Commandes Sur-Mesure
        </button>
      </div>

      {/* TAB 1 : SHAPES & PRICES */}
      {activeTab === "shapes" && (
        <div className={`p-6 rounded-3xl ${cls.cardBg} border ${cls.border} space-y-6 shadow-sm`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-wider`}>
              Catalogue des Formes &amp; Tarification
            </h3>
            <span className={`text-xs ${cls.textMuted}`}>
              Ajustez les prix en euros TTC de chaque modèle.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shapes.map((shape, idx) => (
              <div
                key={shape.id}
                className={`p-4 rounded-2xl border ${cls.border} ${cls.inputBg} space-y-3 flex flex-col justify-between`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`text-sm font-bold ${cls.textMain}`}>{shape.name}</h4>
                    <span className={`text-xs ${cls.textMuted}`}>{shape.keyCount} switch(s) mécanique(s)</span>
                  </div>
                  {shape.badge && (
                    <span className="text-[10px] font-extrabold bg-neutral-800 text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded-md">
                      {shape.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${cls.textMuted}`}>Prix (€) :</span>
                    <input
                      type="number"
                      step="0.10"
                      value={shape.price}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const val = raw === "" ? 0 : parseFloat(raw);
                        const updated = shapes.map((s, i) => i === idx ? { ...s, price: isNaN(val) ? 0 : val } : s);
                        setShapes(updated);
                        saveFullConfig({ shapes: updated });
                      }}
                      className={`w-24 px-3 py-1.5 text-xs font-bold rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#2F3CD9]`}
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={shape.active}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const updated = shapes.map((s, i) => i === idx ? { ...s, active: checked } : s);
                        setShapes(updated);
                        saveFullConfig({ shapes: updated });
                      }}
                      className="w-4 h-4 accent-[#2F3CD9] rounded"
                    />
                    <span className={cls.textMain}>Actif</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2 : SWITCHES MANAGEMENT */}
      {activeTab === "switches" && (
        <div className={`p-6 rounded-3xl ${cls.cardBg} border ${cls.border} space-y-6 shadow-sm`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-wider`}>
              Gestion des Switchs Mécaniques
            </h3>
            <span className={`text-xs ${cls.textMuted}`}>
              Marquez les switchs comme "En Stock" ou "Hors Stock".
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {switches.map((sw, idx) => (
              <div
                key={sw.id}
                className={`p-4 rounded-2xl border ${cls.border} ${cls.inputBg} space-y-3 flex flex-col justify-between`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-bold ${cls.textMain}`}>{sw.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                      {sw.badge}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-neutral-400">{sw.soundLabel}</div>
                  <p className="text-[11px] text-neutral-500 leading-snug">{sw.desc}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className={`text-xs font-mono ${sw.inStock ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}`}>
                    {sw.inStock ? "● En Stock" : "○ Hors Stock"}
                  </span>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sw.inStock}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const updated = switches.map((s, i) => i === idx ? { ...s, inStock: checked } : s);
                        setSwitches(updated);
                        saveFullConfig({ switches: updated });
                      }}
                      className="w-4 h-4 accent-[#2F3CD9] rounded"
                    />
                    <span className={cls.textMain}>Disponible</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3 : ICONS & GRAVURES MANAGEMENT */}
      {activeTab === "icons" && (
        <div className={`p-6 rounded-3xl ${cls.cardBg} border ${cls.border} space-y-6 shadow-sm`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-wider`}>
                Gestion des Symboles &amp; Gravures
              </h3>
              <p className={`text-xs ${cls.textMuted}`}>
                Activer ou désactiver les motifs gravés proposés sur les touches des clickers.
              </p>
            </div>
          </div>

          {/* Add Icon Form */}
          <div className={`p-4 rounded-2xl border ${cls.border} ${cls.inputBg} space-y-3`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${cls.textMain}`}>
              ➕ Proposer un nouveau symbole gravé
            </h4>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Nom du motif (ex: Éclair)"
                value={newIconName}
                onChange={(e) => setNewIconName(e.target.value)}
                className={`px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#2F3CD9]`}
              />
              <input
                type="text"
                placeholder="Émoji / Symbole (ex: ⚡)"
                value={newIconSymbol}
                onChange={(e) => setNewIconSymbol(e.target.value)}
                className={`w-28 px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#2F3CD9] text-center`}
              />
              <button
                type="button"
                onClick={handleAddIcon}
                disabled={!newIconName.trim()}
                className="px-4 py-2 rounded-xl bg-[#2F3CD9] hover:bg-[#202bb8] disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Ajouter le symbole
              </button>
            </div>
          </div>

          {/* Icons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {icons.map((ic, idx) => (
              <div
                key={ic.id}
                className={`p-3 rounded-2xl border ${cls.border} ${cls.inputBg} flex items-center justify-between gap-2`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl w-7 text-center">{ic.symbol || "⬜"}</span>
                  <span className={`text-xs font-bold ${cls.textMain}`}>{ic.name}</span>
                </div>

                <label className="flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ic.active}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIcons(prev => prev.map((item, i) => i === idx ? { ...item, active: checked } : item));
                    }}
                    className="w-4 h-4 accent-[#2F3CD9] rounded"
                  />
                  <span className={cls.textMain}>Actif</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4 : ATTACHMENTS & PRICES */}
      {activeTab === "attachments" && (
        <div className={`p-6 rounded-3xl ${cls.cardBg} border ${cls.border} space-y-6 shadow-sm`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-wider`}>
              Attaches, Porte-Clés &amp; Tarification Associée
            </h3>
            <span className={`text-xs ${cls.textMuted}`}>
              Définissez le prix en supplément pour chaque attache.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {attachments.map((att, idx) => (
              <div
                key={att.id}
                className={`p-4 rounded-2xl border ${cls.border} ${cls.inputBg} space-y-3 flex flex-col justify-between`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{att.icon || "🚫"}</span>
                  <div>
                    <h4 className={`text-sm font-bold ${cls.textMain}`}>{att.name}</h4>
                    <span className={`text-[10px] ${cls.textMuted}`}>Attache sur-mesure</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${cls.textMuted}`}>Prix (€) :</span>
                    <input
                      type="number"
                      step="0.10"
                      value={att.price}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const val = raw === "" ? 0 : parseFloat(raw);
                        const updated = attachments.map((a, i) => i === idx ? { ...a, price: isNaN(val) ? 0 : val } : a);
                        setAttachments(updated);
                        saveFullConfig({ attachments: updated });
                      }}
                      className={`w-24 px-3 py-1.5 text-xs font-bold rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#2F3CD9]`}
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={att.inStock}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const updated = attachments.map((a, i) => i === idx ? { ...a, inStock: checked } : a);
                        setAttachments(updated);
                        saveFullConfig({ attachments: updated });
                      }}
                      className="w-4 h-4 accent-[#2F3CD9] rounded"
                    />
                    <span className={cls.textMain}>Disponible</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5 : PLA FILAMENT COLORS */}
      {activeTab === "colors" && (
        <div className={`p-6 rounded-3xl ${cls.cardBg} border ${cls.border} space-y-6 shadow-sm`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-wider`}>
              Palette des Filaments PLA en Stock
            </h3>
            <span className={`text-xs ${cls.textMuted}`}>
              Gérez, ajoutez et supprimez les couleurs de boîtiers et touches.
            </span>
          </div>

          {/* Add Color Form */}
          <div className={`p-4 rounded-2xl border ${cls.border} ${cls.inputBg} space-y-3`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${cls.textMain}`}>
              ➕ Ajouter un nouveau filament PLA
            </h4>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Nom du filament (ex: Rose Néon)"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className={`px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#2F3CD9]`}
              />
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-9 h-9 p-0.5 rounded-xl border border-white/20 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  placeholder="#ff007f"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className={`w-24 px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#2F3CD9] font-mono`}
                />
              </div>
              <button
                type="button"
                onClick={handleAddColor}
                disabled={!newColorName.trim()}
                className="px-4 py-2 rounded-xl bg-[#2F3CD9] hover:bg-[#202bb8] disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Ajouter la couleur
              </button>
            </div>
          </div>

          {/* Colors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {colors.map((color, idx) => (
              <div
                key={color.id}
                className={`p-3.5 rounded-2xl border ${cls.border} ${cls.inputBg} flex items-center justify-between gap-3`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl border border-white/20 shadow-inner shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <input
                      type="text"
                      value={color.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        const updated = colors.map((c, i) => i === idx ? { ...c, name: newName } : c);
                        setColors(updated);
                        saveFullConfig({ colors: updated });
                      }}
                      className={`w-full px-2 py-1 text-xs font-bold rounded-lg border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#2F3CD9]`}
                    />
                    <span className={`text-[10px] font-mono ${cls.textFaint} block px-1`}>{color.hex}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={color.inStock}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const updated = colors.map((c, i) => i === idx ? { ...c, inStock: checked } : c);
                        setColors(updated);
                        saveFullConfig({ colors: updated });
                      }}
                      className="w-4 h-4 accent-[#2F3CD9] rounded"
                    />
                    <span className={cls.textMain}>Stock</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteColor(color.id)}
                    className="text-xs text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    title="Supprimer la couleur"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6 : GALLERY MANAGEMENT */}
      {activeTab === "gallery" && (
        <div className={`p-6 rounded-3xl ${cls.cardBg} border ${cls.border} space-y-6 shadow-sm`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-wider`}>
                Gestion de la Galerie Photos Client
              </h3>
              <p className={`text-xs ${cls.textMuted}`}>
                Téléversez ou renseignez des photos de réalisations pour les afficher sur la vue publique.
              </p>
            </div>
          </div>

          {/* Add Photo Form Box */}
          <div className={`p-4 rounded-2xl border ${cls.border} ${cls.inputBg} space-y-4`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${cls.textMain}`}>
              ➕ Téléverser ou ajouter une photo d'exemple
            </h4>

            {/* File Upload Zone */}
            <div className="flex items-center gap-4 flex-wrap pb-2 border-b border-white/5">
              <label className="px-4 py-2.5 rounded-xl bg-[#2F3CD9] hover:bg-[#202bb8] text-white text-xs font-bold border border-indigo-500/30 cursor-pointer transition-all flex items-center gap-2 shadow-md hover:scale-105">
                <span>📁 Sélectionner des photos (choix multiple)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {isUploading && (
                <span className="text-xs text-amber-400 font-mono animate-pulse">
                  ⏳ Téléversement des photos en cours...
                </span>
              )}
            </div>

            {/* Thumbnail Preview Box */}
            {newPhotoUrl && (
              <div className="flex items-center gap-4 p-3 bg-black/40 border border-emerald-500/30 rounded-2xl animate-fade-in">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-emerald-500/50 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={newPhotoUrl} alt="Aperçu" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-emerald-400 block truncate">
                    ✅ Image téléversée et prête !
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono block truncate">
                    {newPhotoUrl}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setNewPhotoUrl("")}
                  className="px-2.5 py-1 text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 cursor-pointer"
                >
                  Effacer
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="URL de l'image (https://... ou /uploads/...)"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className={`px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#2F3CD9]`}
              />
              <input
                type="text"
                placeholder="Titre (ex: Clicker Forme T)"
                value={newPhotoTitle}
                onChange={(e) => setNewPhotoTitle(e.target.value)}
                className={`px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#2F3CD9]`}
              />
              <input
                type="text"
                placeholder="Description courte..."
                value={newPhotoCaption}
                onChange={(e) => setNewPhotoCaption(e.target.value)}
                className={`px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#2F3CD9]`}
              />
            </div>

            <button
              type="button"
              onClick={handleAddPhoto}
              disabled={!newPhotoUrl.trim() || !newPhotoTitle.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#2F3CD9] hover:bg-[#202bb8] disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Ajouter à la Galerie
            </button>
          </div>

          {/* Photos List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border ${cls.border} ${cls.inputBg} space-y-2 flex flex-col justify-between relative group`}
              >
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/50">
                  <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(item.id)}
                    className="absolute top-2 right-2 text-xs font-bold text-white bg-red-600/80 hover:bg-red-600 px-2 py-1 rounded-lg transition-colors cursor-pointer shadow"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
                <div>
                  <h5 className={`text-xs font-bold ${cls.textMain}`}>{item.title}</h5>
                  <p className={`text-[11px] ${cls.textMuted} line-clamp-2`}>{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7 : CUSTOM ORDERS VIEW */}
      {activeTab === "orders" && (
        <div className={`p-6 rounded-3xl ${cls.cardBg} border ${cls.border} space-y-4 shadow-sm`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-wider`}>
              Dernières Configurations Commandées
            </h3>
            <span className={`text-xs ${cls.textMuted}`}>
              Recapitulatif précis pour le lancement des impressions 3D en atelier.
            </span>
          </div>

          <div className={`p-8 rounded-2xl border border-dashed ${cls.border} text-center space-y-2`}>
            <span className="text-3xl">⌨️</span>
            <p className={`text-xs ${cls.textMuted}`}>
              Les commandes de clickers sur-mesure s'afficheront automatiquement ici avec le détail des boîtiers, switchs et touches sélectionnées.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
