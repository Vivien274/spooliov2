"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import AnimateDigits from "@/components/ui/AnimateDigits";
import ModernBentoGallery, { GalleryItem } from "@/components/ui/ModernBentoGallery";

// Color Definition Type
interface ColorOption {
  id: string;
  name: string;
  hex: string;
  textColor: string;
  isGlow?: boolean;
}

// Case Colors Palette
const CASE_COLORS: ColorOption[] = [
  { id: "noir", name: "Noir Mat", hex: "#18181b", textColor: "#ffffff" },
  { id: "blanc", name: "Blanc Pur", hex: "#f4f4f5", textColor: "#000000" },
  { id: "gris", name: "Gris Carbone", hex: "#3f3f46", textColor: "#ffffff" },
  { id: "orange", name: "Orange Spoolio", hex: "#ff4f00", textColor: "#ffffff" },
  { id: "bleu", name: "Bleu Nuit", hex: "#1e3a8a", textColor: "#ffffff" },
  { id: "violet", name: "Violet Pailleté", hex: "#7c3aed", textColor: "#ffffff" },
  { id: "vert", name: "Vert Menthe", hex: "#10b981", textColor: "#ffffff" },
  { id: "jaune", name: "Jaune Soleil", hex: "#eab308", textColor: "#000000" },
];

// Keycap Colors Palette
const KEYCAP_COLORS: ColorOption[] = [
  { id: "orange", name: "Orange Spoolio", hex: "#ff4f00", textColor: "#ffffff" },
  { id: "jaune", name: "Jaune Soleil", hex: "#facc15", textColor: "#000000" },
  { id: "noir", name: "Noir Mat", hex: "#18181b", textColor: "#ffffff" },
  { id: "blanc", name: "Blanc Pur", hex: "#ffffff", textColor: "#000000" },
  { id: "cyan", name: "Bleu Néon", hex: "#06b6d4", textColor: "#ffffff" },
  { id: "rouge", name: "Rouge Feu", hex: "#ef4444", textColor: "#ffffff" },
  { id: "vert", name: "Vert Menthe", hex: "#10b981", textColor: "#ffffff" },
  { id: "violet", name: "Violet Pailleté", hex: "#8b5cf6", textColor: "#ffffff" },
  { id: "rose", name: "Rose Bonbon", hex: "#ec4899", textColor: "#ffffff" },
  { id: "bleu_marine", name: "Bleu Marine", hex: "#1e40af", textColor: "#ffffff" },
  { id: "glow", name: "Phosphorescent", hex: "#a3e635", textColor: "#000000", isGlow: true },
];

// Icons & Engravings
interface IconOption {
  id: string;
  name: string;
  symbol: string;
}

const ICONS: IconOption[] = [
  { id: "none", name: "Vierge", symbol: "" },
  { id: "spoolio", name: "Spoolio", symbol: "🌀" },
  { id: "heart", name: "Cœur", symbol: "❤️" },
  { id: "star", name: "Étoile", symbol: "⭐" },
  { id: "lightning", name: "Éclair", symbol: "⚡" },
  { id: "smile", name: "Smile", symbol: "😊" },
  { id: "fire", name: "Feu", symbol: "🔥" },
  { id: "arrow", name: "Flèche", symbol: "⬆️" },
  { id: "gamepad", name: "Gaming", symbol: "🎮" },
  { id: "music", name: "Musique", symbol: "🎵" },
];

// Switch Types Definition
interface SwitchOption {
  id: "blue" | "brown" | "red";
  name: string;
  desc: string;
  soundLabel: string;
  badge: string;
}

const SWITCHES: SwitchOption[] = [
  {
    id: "blue",
    name: "Clicky Bleu",
    desc: "Clic aigu, franc et très satisfaisant",
    soundLabel: "🔊 Fort & Clic",
    badge: "Populaire"
  },
  {
    id: "brown",
    name: "Tactile Marron",
    desc: "Bosse tactile nette sans bruit aigu fort",
    soundLabel: "🔉 Discret",
    badge: "Bureau"
  },
  {
    id: "red",
    name: "Linéaire Rouge",
    desc: "Enfoncement ultra fluide et très silencieux",
    soundLabel: "🤫 Silencieux",
    badge: "Discrétion"
  }
];

// Shapes / Layouts
interface LayoutShape {
  id: string;
  name: string;
  keyCount: number;
  price: number;
  rows: number;
  cols: number;
  gridTemplate: string;
  validIndices: number[]; // Indices of active keys in grid
  badge?: string;
  active?: boolean;
}

const SHAPES: LayoutShape[] = [
  {
    id: "mono",
    name: "1 Touche",
    keyCount: 1,
    price: 4.90,
    rows: 1,
    cols: 1,
    gridTemplate: "grid-cols-1",
    validIndices: [0]
  },
  {
    id: "duo",
    name: "2 Touches en Ligne",
    keyCount: 2,
    price: 6.90,
    rows: 1,
    cols: 2,
    gridTemplate: "grid-cols-2",
    validIndices: [0, 1]
  },
  {
    id: "trio",
    name: "3 Touches en Ligne",
    keyCount: 3,
    price: 7.90,
    rows: 1,
    cols: 3,
    gridTemplate: "grid-cols-3",
    validIndices: [0, 1, 2]
  },
  {
    id: "square_2x2",
    name: "4 Touches Carré",
    keyCount: 4,
    price: 9.90,
    rows: 2,
    cols: 2,
    gridTemplate: "grid-cols-2",
    validIndices: [0, 1, 2, 3],
    badge: "🔥 Best-Seller"
  },
  {
    id: "line_4",
    name: "4 Touches en Ligne",
    keyCount: 4,
    price: 9.90,
    rows: 1,
    cols: 4,
    gridTemplate: "grid-cols-4",
    validIndices: [0, 1, 2, 3]
  },
  {
    id: "shape_t",
    name: "4 Touches en T",
    keyCount: 4,
    price: 9.90,
    rows: 2,
    cols: 3,
    gridTemplate: "grid-cols-3",
    validIndices: [1, 3, 4, 5], // T layout: top-center (1), bottom-left (3), bottom-center (4), bottom-right (5)
    badge: "Original"
  },
  {
    id: "line_7",
    name: "7 Touches en Ligne",
    keyCount: 7,
    price: 14.90,
    rows: 1,
    cols: 7,
    gridTemplate: "grid-cols-7",
    validIndices: [0, 1, 2, 3, 4, 5, 6],
    badge: "⚡ Fidget Extra"
  },
  {
    id: "grid_3x3",
    name: "9 Touches Carré",
    keyCount: 9,
    price: 16.90,
    rows: 3,
    cols: 3,
    gridTemplate: "grid-cols-3",
    validIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    badge: "⚡ Max Fidget"
  }
];

// Attachments
interface AttachmentOption {
  id: string;
  name: string;
  price: number;
  icon: string;
}

const ATTACHMENTS: AttachmentOption[] = [
  { id: "chain", name: "Chaînette à Billes Inox", price: 0.50, icon: "⛓️" },
  { id: "clip", name: "Mousqueton Métal Premium", price: 1.00, icon: "🪝" },
  { id: "lanyard", name: "Dragonne de Poignet Souple", price: 1.50, icon: "🎗️" },
  { id: "ring", name: "Anneau Porte-Clés Renforcé", price: 0.50, icon: "🔑" },
  { id: "none", name: "Sans attache (Usage Bureau)", price: 0.00, icon: "🚫" },
];

export default function ClickerConfiguratorClient({ className = "" }: { className?: string }) {
  const { addToCart } = useCart();

  // Dynamic Lists with fallback to defaults
  const [shapesList, setShapesList] = useState<LayoutShape[]>(SHAPES);
  const [attachmentsList, setAttachmentsList] = useState<AttachmentOption[]>(ATTACHMENTS);
  const [switchesList, setSwitchesList] = useState<SwitchOption[]>(SWITCHES);
  const [iconsList, setIconsList] = useState<IconOption[]>(ICONS);
  const [colorsList, setColorsList] = useState<ColorOption[]>(CASE_COLORS);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);

  // State
  const [selectedShape, setSelectedShape] = useState<LayoutShape>(SHAPES[0]); // 1 Touche par défaut
  const [caseColor, setCaseColor] = useState<ColorOption>(CASE_COLORS[0]); // Noir Mat
  const [switchType, setSwitchType] = useState<SwitchOption>(SWITCHES[0]); // Clicky Bleu
  const [attachment, setAttachment] = useState<AttachmentOption>(ATTACHMENTS[0]); // Chain by default

  // Fetch Admin Config on mount
  useEffect(() => {
    fetch("/api/admin/clicker-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.shapes && Array.isArray(data.shapes)) {
          const updatedShapes = SHAPES.map((baseShape) => {
            const adminCfg = data.shapes.find((s: any) => s.id === baseShape.id);
            if (adminCfg) {
              const numPrice = typeof adminCfg.price === "number" ? adminCfg.price : parseFloat(adminCfg.price);
              return {
                ...baseShape,
                price: !isNaN(numPrice) && numPrice >= 0 ? numPrice : baseShape.price,
                name: adminCfg.name || baseShape.name,
                active: adminCfg.active !== false,
              };
            }
            return baseShape;
          })
          .filter((s) => s.active !== false)
          .sort((a, b) => a.keyCount - b.keyCount);

          setShapesList(updatedShapes);
          const currentUpdated = updatedShapes.find(s => s.id === selectedShape.id);
          if (currentUpdated) setSelectedShape(currentUpdated);
        }

        if (data.attachments && Array.isArray(data.attachments)) {
          const updatedAtts = ATTACHMENTS.map((baseAtt) => {
            const adminCfg = data.attachments.find((a: any) => a.id === baseAtt.id);
            if (adminCfg) {
              const numPrice = typeof adminCfg.price === "number" ? adminCfg.price : parseFloat(adminCfg.price);
              return {
                ...baseAtt,
                price: !isNaN(numPrice) && numPrice >= 0 ? numPrice : baseAtt.price,
                name: adminCfg.name || baseAtt.name,
                inStock: adminCfg.inStock !== false,
              };
            }
            return baseAtt;
          }).filter((a: any) => a.inStock !== false);

          setAttachmentsList(updatedAtts);
          const currentAtt = updatedAtts.find(a => a.id === attachment.id);
          if (currentAtt) setAttachment(currentAtt);
        }

        if (data.switches && Array.isArray(data.switches)) {
          const available = SWITCHES.filter((sw) => {
            const adminCfg = data.switches.find((s: any) => s.id === sw.id);
            return !adminCfg || adminCfg.inStock !== false;
          });
          if (available.length > 0) setSwitchesList(available);
        }

        if (data.icons && Array.isArray(data.icons)) {
          const available = data.icons.filter((i: any) => i.active !== false);
          if (available.length > 0) setIconsList(available);
        }

        if (data.colors && Array.isArray(data.colors)) {
          const availableColors = data.colors.filter((c: any) => c.inStock !== false);
          if (availableColors.length > 0) setColorsList(availableColors);
        }
      })
      .catch((e) => console.error("Error loading clicker dynamic config:", e));

    fetch("/api/admin/clicker-gallery")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setGalleryList(data);
        }
      })
      .catch((e) => console.error("Error loading gallery:", e));
  }, []);

  // Keycap customization mode: "all" or "custom"
  const [keycapMode, setKeycapMode] = useState<"all" | "custom">("all");
  const [globalKeycapColor, setGlobalKeycapColor] = useState<ColorOption>(KEYCAP_COLORS[0]); // Orange
  const [globalIcon, setGlobalIcon] = useState<IconOption>(ICONS[0]);

  // Per key configuration (indexed by slot position index)
  const [keyConfigs, setKeyConfigs] = useState<Record<number, { color: ColorOption; icon: IconOption }>>({});

  // Active key selection in custom mode
  const [activeKeyIndex, setActiveKeyIndex] = useState<number>(0);

  // Pressed keys visual feedback state
  const [pressedKey, setPressedKey] = useState<number | null>(null);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synchronize keyConfigs when shape changes
  useEffect(() => {
    const initial: Record<number, { color: ColorOption; icon: IconOption }> = {};
    selectedShape.validIndices.forEach((idx, i) => {
      // Alternate default colors for stylish preview (e.g., Orange & Yellow like photo)
      const defaultColor = i % 2 === 0 ? KEYCAP_COLORS[0] : KEYCAP_COLORS[1];
      initial[idx] = { color: defaultColor, icon: ICONS[0] };
    });
    setKeyConfigs(initial);
    setActiveKeyIndex(selectedShape.validIndices[0] || 0);
  }, [selectedShape]);

  // Play mechanical switch click sound using Web Audio API
  const playClickSound = (type: "blue" | "brown" | "red") => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }

      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "blue") {
        // Sharp high-pitched mechanical click
        osc.type = "sine";
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.02);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.start(now);
        osc.stop(now + 0.02);
      } else if (type === "brown") {
        // Tactile medium bump
        osc.type = "triangle";
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.03);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else {
        // Soft linear damp
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.035);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.start(now);
        osc.stop(now + 0.035);
      }
    } catch (e) {
      console.warn("Audio Context playback error:", e);
    }
  };

  const handleKeyClick = (index: number) => {
    setPressedKey(index);
    playClickSound(switchType.id);
    if (keycapMode === "custom") {
      setActiveKeyIndex(index);
    }
    setTimeout(() => setPressedKey(null), 150);
  };

  // Get current key configuration for a specific index
  const getKeyColor = (index: number): ColorOption => {
    if (keycapMode === "all") return globalKeycapColor;
    return keyConfigs[index]?.color || globalKeycapColor;
  };

  const getKeyIcon = (index: number): IconOption => {
    if (keycapMode === "all") return globalIcon;
    return keyConfigs[index]?.icon || globalIcon;
  };

  // Total price calculation
  const shapePrice = typeof selectedShape.price === "number" ? selectedShape.price : parseFloat(selectedShape.price) || 0;
  const attachmentPrice = typeof attachment.price === "number" ? attachment.price : parseFloat(attachment.price) || 0;
  const totalPrice = shapePrice + attachmentPrice;

  // Add custom clicker to cart
  const handleAddToCart = () => {
    const keyDetails = selectedShape.validIndices.map((idx, i) => {
      const color = getKeyColor(idx).name;
      const icon = getKeyIcon(idx).symbol || "Vierge";
      return `Touche #${i + 1} (${color} - ${icon})`;
    }).join(", ");

    const selectedOptions: Record<string, string> = {
      "Forme": selectedShape.name,
      "Couleur Boîtier": caseColor.name,
      "Switchs": switchType.name,
      "Touches": keycapMode === "all" ? `${globalKeycapColor.name} (${globalIcon.symbol || 'Vierge'})` : keyDetails,
      "Attache": attachment.name,
    };

    addToCart({
      productId: 99881, // Dedicated Virtual Product ID for Custom Clicker
      name: `Clicker Mécanique Sur-Mesure (${selectedShape.name})`,
      slug: "clicker-mecanique-sur-mesure",
      price: totalPrice.toFixed(2),
      selectedOptions,
      image: "https://spoolio.fr/images/products/clicker-sur-mesure-thumb.jpg",
    }, 1, true);
  };

  return (
    <div className={`w-full max-w-6xl mx-auto font-sans ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* =========================================================================
            LEFT COLUMN : INTERACTIVE 3D/2D VISUALIZER & SOUND SANDBOX
           ========================================================================= */}
        <div className="lg:col-span-6 sticky top-24 space-y-6">
          <div className="relative bg-gradient-to-b from-neutral-900/90 via-neutral-900/60 to-black/90 border border-neutral-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden backdrop-blur-md flex flex-col items-center justify-center min-h-[420px]">
            
            {/* Ambient Background Glows */}
            <div
              className="absolute w-72 h-72 rounded-full pointer-events-none transition-all duration-700 blur-[90px] opacity-20"
              style={{ backgroundColor: caseColor.hex }}
            />
            
            {/* Top Bar Status */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
              <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 bg-black/50 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Aperçu 3D Interactif
              </span>

              <button
                type="button"
                onClick={() => playClickSound(switchType.id)}
                className="text-xs font-bold text-neutral-200 bg-neutral-800/90 hover:bg-neutral-700 border border-neutral-700 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 shadow"
              >
                🔊 Tester le son ({switchType.name.split(' ')[0]})
              </button>
            </div>

            {/* Main Interactive Clicker Preview Box */}
            <div className="relative my-10 py-4 flex items-center justify-center select-none">
              
              {/* 3D Printed Case Container */}
              <div className="relative p-2 flex items-center justify-center transition-all duration-500">
                
                {/* Keycaps Grid Layout */}
                <div
                  className={`grid gap-3.5 ${selectedShape.gridTemplate} relative z-10 p-2`}
                  style={{
                    gridTemplateRows: `repeat(${selectedShape.rows}, minmax(0, 1fr))`,
                    gridTemplateColumns: `repeat(${selectedShape.cols}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: selectedShape.rows * selectedShape.cols }).map((_, slotIdx) => {
                    const isLargeLine = selectedShape.cols >= 5;
                    const keySizeClass = isLargeLine
                      ? "w-10 h-10 sm:w-14 sm:h-14"
                      : "w-16 h-16 sm:w-20 sm:h-20";

                    // Empty slots (0 and 2) for shape_t: Completely transparent
                    if (selectedShape.id === "shape_t" && (slotIdx === 0 || slotIdx === 2)) {
                      return <div key={slotIdx} className={`${keySizeClass} opacity-0 pointer-events-none p-1.5`} />;
                    }

                    const isValid = selectedShape.validIndices.includes(slotIdx);
                    if (!isValid) {
                      return <div key={slotIdx} className={`${keySizeClass} opacity-0 pointer-events-none p-1.5`} />;
                    }

                    const color = getKeyColor(slotIdx);
                    const icon = getKeyIcon(slotIdx);
                    const isPressed = pressedKey === slotIdx;
                    const isSelectedInCustom = keycapMode === "custom" && activeKeyIndex === slotIdx;

                    return (
                      <div
                        key={slotIdx}
                        className="p-1.5 rounded-2xl border border-white/15 shadow-lg transition-all"
                        style={{ backgroundColor: caseColor.hex }}
                      >
                        <button
                          type="button"
                          onClick={() => handleKeyClick(slotIdx)}
                          className={`relative ${keySizeClass} rounded-2xl transition-all duration-100 cursor-pointer flex items-center justify-center select-none group border ${
                            isSelectedInCustom
                              ? "ring-4 ring-white ring-offset-2 ring-offset-black z-30 scale-105"
                              : "border-white/20 hover:scale-102"
                          }`}
                          style={{
                            backgroundColor: color.hex,
                            transform: isPressed ? "translateY(5px) scale(0.95)" : "translateY(0px)",
                            boxShadow: isPressed
                              ? "0 2px 4px rgba(0,0,0,0.6), inset 0 3px 6px rgba(0,0,0,0.5)"
                              : `0 8px 0 ${color.hex}88, 0 12px 16px rgba(0,0,0,0.6), inset 0 2px 2px rgba(255,255,255,0.4)`
                          }}
                        >
                          {/* Keycap Top Dish Bevel */}
                          <div
                            className="absolute inset-1.5 rounded-xl border border-white/20 pointer-events-none flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.15) 100%)`
                            }}
                          >
                            {/* Symbol / Legend */}
                            {icon.symbol ? (
                              <span className="text-xl sm:text-2xl drop-shadow-md select-none">
                                {icon.symbol}
                              </span>
                            ) : (
                              <span className="w-2.5 h-2.5 rounded-full bg-white/30 border border-white/20" />
                            )}
                          </div>

                          {/* Glow indicator if phosphorescent */}
                          {color.isGlow && (
                            <div className="absolute inset-0 rounded-2xl bg-lime-400/20 animate-pulse pointer-events-none" />
                          )}

                          {/* Click feedback wave */}
                          {isPressed && (
                            <div className="absolute inset-0 rounded-2xl bg-white/40 animate-ping pointer-events-none" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Interactive Instruction Banner */}
            <div className="text-center">
              <p className="text-xs text-neutral-400 flex items-center justify-center gap-1.5 font-medium">
                <span>👇</span>
                <span>Cliquez sur les touches pour tester le son résonnant du switch !</span>
              </p>
            </div>
          </div>

          {/* Quick Recap Card */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 space-y-2 font-mono">
            <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-800 pb-2">
              <span>RÉSUMÉ CONFIGURATION</span>
              <span className="text-white font-bold">{selectedShape.keyCount} Touche(s)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>Boîtier: <strong className="text-white">{caseColor.name}</strong></div>
              <div>Switchs: <strong className="text-white">{switchType.name}</strong></div>
              <div>Style Touches: <strong className="text-white">{keycapMode === "all" ? "Identiques" : "Sur-mesure"}</strong></div>
              <div>Attache: <strong className="text-white">{attachment.name.split(' ')[0]}</strong></div>
            </div>
          </div>
        </div>


        {/* =========================================================================
            RIGHT COLUMN : CONFIGURATION STEPS & OPTIONS
           ========================================================================= */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* STEP 1 : Forme & Nombre de Touches */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white text-black font-black text-xs flex items-center justify-center shadow-sm">1</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Forme &amp; Nombre de Touches</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {shapesList.map((shape) => {
                const isSelected = selectedShape.id === shape.id;
                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => setSelectedShape(shape)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-26 ${
                      isSelected
                        ? "bg-white/10 border-white text-white ring-1 ring-white/30 shadow-md"
                        : "bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <div className="text-xs font-bold leading-snug">
                          {shape.name.split(" (")[0]}
                        </div>
                        {shape.badge && (
                          <span className="shrink-0 text-[9px] font-extrabold bg-neutral-800 text-neutral-300 border border-neutral-700 px-1.5 py-0.5 rounded-md">
                            {shape.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-medium">
                        {shape.keyCount} {shape.keyCount > 1 ? "Touches" : "Touche"}
                      </div>
                    </div>
                    <div className="text-xs font-black text-white pt-2">
                      {(Number(shape.price) || 0).toFixed(2)} €
                    </div>
                  </button>
                );
              })}
            </div>
          </div>


          {/* STEP 2 : Couleur du Boîtier 3D */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white text-black font-black text-xs flex items-center justify-center shadow-sm">2</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Couleur du Boîtier 3D</h3>
              </div>
              <span className="text-xs font-bold text-neutral-300">{caseColor.name}</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {colorsList.map((c, idx) => {
                const isSelected = caseColor.id === c.id || (caseColor.hex.toLowerCase() === c.hex.toLowerCase() && caseColor.name === c.name);
                return (
                  <button
                    key={`${c.id}-${idx}`}
                    type="button"
                    onClick={() => setCaseColor(c)}
                    className={`relative aspect-square rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                      isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-105 border-white shadow-md" : "border-white/10 hover:scale-102"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-white shadow" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>


          {/* STEP 3 : Type de Switches Mécaniques */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white text-black font-black text-xs flex items-center justify-center shadow-sm">3</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Switchs Mécaniques</h3>
              </div>
              <span className="text-xs text-neutral-400">{switchType.soundLabel}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {switchesList.map((sw) => {
                const isSelected = switchType.id === sw.id;
                return (
                  <button
                    key={sw.id}
                    type="button"
                    onClick={() => {
                      setSwitchType(sw);
                      playClickSound(sw.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-white/10 border-white text-white ring-1 ring-white/30 shadow-md"
                        : "bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold">{sw.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">
                          {sw.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 leading-tight">
                        {sw.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>


          {/* STEP 4 : Personnalisation des Touches (Keycaps) */}
          <div className="space-y-4 p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white text-black font-black text-xs flex items-center justify-center shadow-sm">4</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Couleurs &amp; Gravures des Touches</h3>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-neutral-800 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setKeycapMode("all")}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    keycapMode === "all" ? "bg-white text-black font-bold shadow-sm" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Toutes identiques
                </button>
                <button
                  type="button"
                  onClick={() => setKeycapMode("custom")}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    keycapMode === "custom" ? "bg-white text-black font-bold shadow-sm" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Touche par touche 🎨
                </button>
              </div>
            </div>

            {/* Custom Mode Target Selector Bar */}
            {keycapMode === "custom" && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-neutral-800">
                <span className="text-xs text-neutral-400 shrink-0 font-mono">Touche à modifier:</span>
                {selectedShape.validIndices.map((slotIdx, i) => {
                  const isSelected = activeKeyIndex === slotIdx;
                  const keyColor = getKeyColor(slotIdx);
                  return (
                    <button
                      key={slotIdx}
                      type="button"
                      onClick={() => setActiveKeyIndex(slotIdx)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                        isSelected
                          ? "bg-white text-black border-white shadow-md font-extrabold"
                          : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-600"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: keyColor.hex }} />
                      <span>Touche #{i + 1}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Color Swatches Grid */}
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-400 font-mono">Couleur de touche :</label>
              <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                {colorsList.map((color, idx) => {
                  const activeColor = keycapMode === "all" ? globalKeycapColor : getKeyColor(activeKeyIndex);
                  const isSelected = activeColor.id === color.id || (activeColor.hex.toLowerCase() === color.hex.toLowerCase() && activeColor.name === color.name);

                  return (
                    <button
                      key={`${color.id}-${idx}`}
                      type="button"
                      onClick={() => {
                        if (keycapMode === "all") {
                          setGlobalKeycapColor(color);
                        } else {
                          setKeyConfigs(prev => ({
                            ...prev,
                            [activeKeyIndex]: { ...prev[activeKeyIndex], color }
                          }));
                        }
                      }}
                      className={`relative aspect-square rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                        isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-105 border-white z-10 shadow-md" : "border-white/10 hover:scale-102"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white shadow" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Icons / Gravures Grid */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs text-neutral-400 font-mono">Motif / Symbole gravé :</label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {iconsList.map((icon) => {
                  const activeIcon = keycapMode === "all" ? globalIcon : getKeyIcon(activeKeyIndex);
                  const isSelected = activeIcon.id === icon.id;

                  return (
                    <button
                      key={icon.id}
                      type="button"
                      onClick={() => {
                        if (keycapMode === "all") {
                          setGlobalIcon(icon);
                        } else {
                          setKeyConfigs(prev => ({
                            ...prev,
                            [activeKeyIndex]: { ...prev[activeKeyIndex], icon }
                          }));
                        }
                      }}
                      className={`h-9 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? "bg-white/15 border-white text-white ring-1 ring-white/40 shadow-md font-bold"
                          : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                      }`}
                      title={icon.name}
                    >
                      {icon.symbol || <span className="text-[10px] text-neutral-500 font-mono">Vierge</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>


          {/* STEP 5 : Option Porte-Clés / Dragonne */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white text-black font-black text-xs flex items-center justify-center shadow-sm">5</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Attache &amp; Porte-Clés</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {attachmentsList.map((att) => {
                const isSelected = attachment.id === att.id;
                return (
                  <button
                    key={att.id}
                    type="button"
                    onClick={() => setAttachment(att)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-white/10 border-white text-white ring-1 ring-white/30 shadow-md"
                        : "bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{att.icon}</span>
                      <span className="text-xs font-bold">{att.name}</span>
                    </div>
                    <span className="text-xs font-mono text-neutral-300">
                      {(Number(att.price) || 0) > 0 ? `+${(Number(att.price) || 0).toFixed(2)}€` : "Gratuit"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>


          {/* =========================================================================
              PRICE & ADD TO CART BAR
             ========================================================================= */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs text-neutral-400 uppercase font-mono mb-1">Prix Total Personnalisé</div>
              <AnimateDigits value={totalPrice} className="text-3xl sm:text-4xl text-white font-[family-name:var(--font-antonio)]" />
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 sm:flex-initial px-8 py-4 rounded-2xl bg-[#ff4f00] hover:bg-[#e04500] text-white text-sm font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-[#ff4f00]/25 cursor-pointer flex items-center justify-center gap-2 hover:scale-102"
            >
              <span>Ajouter au Panier 🛒</span>
            </button>
          </div>

        </div>

      </div>

      {/* MODERN BENTO IMAGE GALLERY */}
      <div className="mt-16 pt-12 border-t border-neutral-800/80">
        <ModernBentoGallery items={galleryList} />
      </div>

    </div>
  );
}
