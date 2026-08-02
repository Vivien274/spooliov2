"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import AnimateDigits from "@/components/ui/AnimateDigits";
import ModernBentoGallery, { GalleryItem } from "@/components/ui/ModernBentoGallery";
import ClickerSvgSymbol, { VECTOR_SYMBOLS } from "@/components/ui/ClickerSvgSymbol";
import { Sparkles, Type, FileText, Slash, Check, Layers } from "lucide-react";

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
  { id: "rose", name: "Rose Néon", hex: "#ec4899", textColor: "#ffffff" },
  { id: "cyan", name: "Bleu Néon", hex: "#06b6d4", textColor: "#ffffff" },
  { id: "rouge", name: "Rouge Feu", hex: "#ef4444", textColor: "#ffffff" },
  { id: "bleu_marine", name: "Bleu Marine", hex: "#1e40af", textColor: "#ffffff" },
  { id: "glow", name: "Phosphorescent", hex: "#a3e635", textColor: "#000000", isGlow: true },
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
  { id: "violet", name: "Violet Pailleté", hex: "#7c3aed", textColor: "#ffffff" },
  { id: "rose", name: "Rose Néon", hex: "#ec4899", textColor: "#ffffff" },
  { id: "bleu_marine", name: "Bleu Marine", hex: "#1e40af", textColor: "#ffffff" },
  { id: "glow", name: "Phosphorescent", hex: "#a3e635", textColor: "#000000", isGlow: true },
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
  validIndices: number[];
  badge?: string;
  active?: boolean;
}

const SHAPES: LayoutShape[] = [
  { id: "mono", name: "1 Touche", keyCount: 1, price: 4.90, rows: 1, cols: 1, gridTemplate: "grid-cols-1", validIndices: [0] },
  { id: "duo", name: "2 Touches en Ligne", keyCount: 2, price: 6.90, rows: 1, cols: 2, gridTemplate: "grid-cols-2", validIndices: [0, 1] },
  { id: "trio", name: "3 Touches en Ligne", keyCount: 3, price: 7.90, rows: 1, cols: 3, gridTemplate: "grid-cols-3", validIndices: [0, 1, 2] },
  { id: "square_2x2", name: "4 Touches Carré", keyCount: 4, price: 9.90, rows: 2, cols: 2, gridTemplate: "grid-cols-2", validIndices: [0, 1, 2, 3], badge: "🔥 Best-Seller" },
  { id: "line_4", name: "4 Touches en Ligne", keyCount: 4, price: 9.90, rows: 1, cols: 4, gridTemplate: "grid-cols-4", validIndices: [0, 1, 2, 3] },
  { id: "shape_t", name: "4 Touches en T", keyCount: 4, price: 9.90, rows: 2, cols: 3, gridTemplate: "grid-cols-3", validIndices: [1, 3, 4, 5], badge: "Original" },
  { id: "line_7", name: "7 Touches en Ligne", keyCount: 7, price: 14.90, rows: 1, cols: 7, gridTemplate: "grid-cols-7", validIndices: [0, 1, 2, 3, 4, 5, 6], badge: "⚡ Fidget Extra" },
  { id: "grid_3x3", name: "9 Touches Carré", keyCount: 9, price: 16.90, rows: 3, cols: 3, gridTemplate: "grid-cols-3", validIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8], badge: "⚡ Max Fidget" }
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

export type KeyCustomizationType = "blank" | "letter" | "word" | "symbol" | "texture";

export interface TextureOption {
  id: "lego" | "caisse" | "fromage";
  name: string;
  icon: string;
  desc: string;
}

export const TEXTURE_OPTIONS: TextureOption[] = [
  { id: "lego", name: "Lego", icon: "🧱", desc: "Ergots / tenons style brique de construction" },
  { id: "caisse", name: "Caisse en bois", icon: "🪵", desc: "Motif lattes & renforts croisés de caisse de transport" },
  { id: "fromage", name: "Fromage", icon: "🧀", desc: "Alvéoles & trous style gruyère / fromage suisse" },
];

export interface SingleKeyPerso {
  type: KeyCustomizationType;
  value: string;
  color: ColorOption;
}

const WORD_SUGGESTIONS = ["WASD", "ESC", "CTRL", "ALT", "PLAY", "BOSS", "SHIFT", "LOL", "LVL", "WIN", "GAME", "OK"];
const QUICK_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export default function ClickerConfiguratorClient({ className = "" }: { className?: string }) {
  const { addToCart } = useCart();

  // Dynamic Lists with fallback to defaults
  const [shapesList, setShapesList] = useState<LayoutShape[]>(SHAPES);
  const [attachmentsList, setAttachmentsList] = useState<AttachmentOption[]>(ATTACHMENTS);
  const [switchesList, setSwitchesList] = useState<SwitchOption[]>(SWITCHES);
  const [colorsList, setColorsList] = useState<ColorOption[]>(CASE_COLORS);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);

  // Config State
  const [selectedShape, setSelectedShape] = useState<LayoutShape>(SHAPES[0]);
  const [caseColor, setCaseColor] = useState<ColorOption>(CASE_COLORS[0]);
  const [switchType, setSwitchType] = useState<SwitchOption>(SWITCHES[0]);
  const [attachment, setAttachment] = useState<AttachmentOption>(ATTACHMENTS[0]);

  // Keycap customization mode: "all" (global) or "custom" (par touche)
  const [keycapMode, setKeycapMode] = useState<"all" | "custom">("all");

  // Global mode configuration
  const [globalKeycapColor, setGlobalKeycapColor] = useState<ColorOption>(KEYCAP_COLORS[0]);
  const [globalPerso, setGlobalPerso] = useState<{ type: KeyCustomizationType; value: string }>({ type: "blank", value: "" });

  // Per key configuration (indexed by slot position index)
  const [keyConfigs, setKeyConfigs] = useState<Record<number, SingleKeyPerso>>({});

  // Active key index in custom mode
  const [activeKeyIndex, setActiveKeyIndex] = useState<number>(0);

  // Pressed keys visual feedback state
  const [pressedKey, setPressedKey] = useState<number | null>(null);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synchronize keyConfigs when shape changes
  useEffect(() => {
    const initial: Record<number, SingleKeyPerso> = {};
    selectedShape.validIndices.forEach((idx, i) => {
      const defaultColor = i % 2 === 0 ? KEYCAP_COLORS[0] : KEYCAP_COLORS[1];
      initial[idx] = { type: "blank", value: "", color: defaultColor };
    });
    setKeyConfigs(initial);
    setActiveKeyIndex(selectedShape.validIndices[0] || 0);
  }, [selectedShape]);

  // Fetch Admin Config & URL Preset on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cfgRaw = params.get("cfg");
      if (cfgRaw) {
        try {
          const jsonStr = atob(decodeURIComponent(cfgRaw));
          const parsed = JSON.parse(jsonStr);

          if (parsed.shape) {
            const foundShape = SHAPES.find((s) => s.id === parsed.shape);
            if (foundShape) setSelectedShape(foundShape);
          }
          if (parsed.caseColor) {
            const foundColor = CASE_COLORS.find((c) => c.id === parsed.caseColor);
            if (foundColor) setCaseColor(foundColor);
          }
          if (parsed.switchType) {
            const foundSwitch = SWITCHES.find((s) => s.id === parsed.switchType);
            if (foundSwitch) setSwitchType(foundSwitch);
          }
          if (parsed.attachment) {
            const foundAtt = ATTACHMENTS.find((a) => a.id === parsed.attachment);
            if (foundAtt) setAttachment(foundAtt);
          }
          if (parsed.keycapMode) {
            setKeycapMode(parsed.keycapMode);
          }
          if (parsed.globalKeycapColor) {
            const foundColor = KEYCAP_COLORS.find((c) => c.id === parsed.globalKeycapColor);
            if (foundColor) setGlobalKeycapColor(foundColor);
          }
          if (parsed.globalPerso) {
            setGlobalPerso(parsed.globalPerso);
          }
          if (parsed.keyConfigs && typeof parsed.keyConfigs === "object") {
            const restored: Record<number, SingleKeyPerso> = {};
            Object.entries(parsed.keyConfigs).forEach(([k, v]: [string, any]) => {
              const slotIdx = parseInt(k, 10);
              const col = KEYCAP_COLORS.find((c) => c.id === v.color) || KEYCAP_COLORS[0];
              restored[slotIdx] = {
                type: v.type || "blank",
                value: v.value || "",
                color: col,
              };
            });
            setKeyConfigs(restored);
          }
        } catch (err) {
          console.error("Error restoring clicker config from URL parameter:", err);
        }
      }
    }

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
        }

        if (data.switches && Array.isArray(data.switches)) {
          const available = SWITCHES.filter((sw) => {
            const adminCfg = data.switches.find((s: any) => s.id === sw.id);
            return !adminCfg || adminCfg.inStock !== false;
          });
          if (available.length > 0) setSwitchesList(available);
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

  // Play mechanical switch sound using Web Audio API
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
        osc.type = "sine";
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.02);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.start(now);
        osc.stop(now + 0.02);
      } else if (type === "brown") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.03);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else {
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

  // Get current key configuration
  const getKeyConfig = (index: number): SingleKeyPerso => {
    if (keycapMode === "all") {
      return {
        type: globalPerso.type,
        value: globalPerso.value,
        color: globalKeycapColor,
      };
    }
    return keyConfigs[index] || { type: "blank", value: "", color: globalKeycapColor };
  };

  // Update active key configuration in custom mode
  const updateActiveKeyPerso = (updates: Partial<SingleKeyPerso>) => {
    setKeyConfigs((prev) => {
      const current = prev[activeKeyIndex] || { type: "blank", value: "", color: globalKeycapColor };
      return {
        ...prev,
        [activeKeyIndex]: { ...current, ...updates },
      };
    });
  };

  // Render SVG symbol or text inside keycap
  const renderKeyLegend = (slotIdx: number, color: ColorOption) => {
    const config = getKeyConfig(slotIdx);

    if (config.type === "letter" && config.value) {
      return (
        <span
          className="text-lg sm:text-2xl font-black tracking-tight select-none uppercase drop-shadow-sm"
          style={{ color: color.textColor }}
        >
          {config.value.substring(0, 1)}
        </span>
      );
    }

    if (config.type === "word" && config.value) {
      const len = config.value.length;
      const fontSizeClass = len <= 3 ? "text-xs sm:text-sm font-extrabold" : "text-[9px] sm:text-[11px] font-bold";

      return (
        <span
          className={`${fontSizeClass} font-mono tracking-tighter select-none uppercase px-1 leading-none drop-shadow-sm text-center`}
          style={{ color: color.textColor }}
        >
          {config.value.substring(0, 6)}
        </span>
      );
    }

    if (config.type === "symbol" && config.value) {
      return (
        <ClickerSvgSymbol
          symbolId={config.value}
          size={20}
          className="drop-shadow-sm transition-transform group-hover:scale-110"
        />
      );
    }

    if (config.type === "texture" && config.value) {
      if (config.value === "lego") {
        return (
          <div className="w-full h-full flex items-center justify-center p-1 select-none pointer-events-none">
            <div className="grid grid-cols-2 gap-1.5 w-full h-full items-center justify-center">
              {[0, 1, 2, 3].map((studIdx) => (
                <div
                  key={studIdx}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-white/40 shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.6)] flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5) 0%, rgba(0,0,0,0.2) 100%), ${color.hex}`
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full border border-black/20 opacity-40" />
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (config.value === "caisse") {
        return (
          <div className="w-full h-full relative rounded-lg border border-black/40 overflow-hidden flex flex-col justify-between p-1 bg-black/20 select-none pointer-events-none">
            <div className="w-full h-full border-b border-black/30 bg-white/5 flex items-center justify-between px-1">
              <span className="w-1 h-1 rounded-full bg-black/40" />
              <span className="w-1 h-1 rounded-full bg-black/40" />
            </div>
            <div className="w-full h-full border-b border-black/30 bg-black/10 flex items-center justify-between px-1 relative">
              <div className="absolute inset-0 border-t border-b border-black/40 transform -rotate-12 scale-110 opacity-30 bg-black/20" />
              <span className="w-1 h-1 rounded-full bg-black/40" />
              <span className="w-1 h-1 rounded-full bg-black/40" />
            </div>
            <div className="w-full h-full bg-white/5 flex items-center justify-between px-1">
              <span className="w-1 h-1 rounded-full bg-black/40" />
              <span className="w-1 h-1 rounded-full bg-black/40" />
            </div>
          </div>
        );
      }

      if (config.value === "fromage") {
        return (
          <div className="w-full h-full relative p-1.5 select-none pointer-events-none overflow-hidden rounded-lg">
            <div className="absolute top-1 left-2 w-3.5 h-3.5 rounded-full bg-black/35 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-black/30" />
            <div className="absolute top-3.5 right-1.5 w-4 h-4 rounded-full bg-black/35 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-black/30" />
            <div className="absolute bottom-1 left-3.5 w-3 h-3 rounded-full bg-black/35 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-black/30" />
            <div className="absolute bottom-3 right-5 w-2.5 h-2.5 rounded-full bg-black/35 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-black/30" />
          </div>
        );
      }
    }

    // Blank keycap surface default
    return <span className="w-2.5 h-2.5 rounded-full bg-white/25 border border-white/10" />;
  };

  // Total price calculation
  const shapePrice = typeof selectedShape.price === "number" ? selectedShape.price : parseFloat(selectedShape.price) || 0;
  const attachmentPrice = typeof attachment.price === "number" ? attachment.price : parseFloat(attachment.price) || 0;
  const totalPrice = shapePrice + attachmentPrice;

  // Add custom clicker to cart
  const handleAddToCart = () => {
    const keyDetails = selectedShape.validIndices.map((idx, i) => {
      const cfg = getKeyConfig(idx);
      let label = "Vierge";
      if (cfg.type === "letter") label = `Lettre '${cfg.value}'`;
      else if (cfg.type === "word") label = `Mot '${cfg.value}'`;
      else if (cfg.type === "symbol") label = `Symbole ${cfg.value}`;
      else if (cfg.type === "texture") {
        const foundTex = TEXTURE_OPTIONS.find(t => t.id === cfg.value);
        label = `Texture '${foundTex ? foundTex.name : cfg.value}'`;
      }
      return `Touche #${i + 1} (${cfg.color.name} - ${label})`;
    }).join(", ");

    const configObj = {
      shape: selectedShape.id,
      caseColor: caseColor.id,
      switchType: switchType.id,
      attachment: attachment.id,
      keycapMode,
      globalKeycapColor: globalKeycapColor.id,
      globalPerso,
      keyConfigs: Object.fromEntries(
        Object.entries(keyConfigs).map(([k, v]) => [
          k,
          { type: v.type, value: v.value, color: v.color.id }
        ])
      )
    };
    const encodedConfig = encodeURIComponent(btoa(JSON.stringify(configObj)));
    const configUrl = `/createur-cliqueur?cfg=${encodedConfig}`;

    const selectedOptions: Record<string, string> = {
      "Forme": selectedShape.name,
      "Couleur Boîtier": caseColor.name,
      "Switchs": switchType.name,
      "Touches": keycapMode === "all" ? `${globalKeycapColor.name} (${globalPerso.type !== 'blank' ? globalPerso.value : 'Vierge'})` : keyDetails,
      "Attache": attachment.name,
      "_configUrl": configUrl,
    };

    const cartImage = (galleryList && galleryList.length > 0 && galleryList[0]?.src)
      ? galleryList[0].src
      : "";

    addToCart({
      productId: 99881,
      name: `Clicker Mécanique Sur-Mesure (${selectedShape.name})`,
      slug: "clicker-mecanique-sur-mesure",
      price: totalPrice.toFixed(2),
      selectedOptions,
      image: cartImage,
    }, 1, true);
  };

  const activeKeyConfig = getKeyConfig(activeKeyIndex);

  return (
    <div className={`w-full max-w-6xl mx-auto font-sans ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* =========================================================================
            LEFT COLUMN : INTERACTIVE 3D/2D VISUALIZER & SOUND SANDBOX
           ========================================================================= */}
        <div className="lg:col-span-6 sticky top-24 space-y-6 select-none">
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
            <div className="relative my-10 py-4 flex items-center justify-center">
              
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

                    if (selectedShape.id === "shape_t" && (slotIdx === 0 || slotIdx === 2)) {
                      return <div key={slotIdx} className={`${keySizeClass} opacity-0 pointer-events-none p-1.5`} />;
                    }

                    const isValid = selectedShape.validIndices.includes(slotIdx);
                    if (!isValid) {
                      return <div key={slotIdx} className={`${keySizeClass} opacity-0 pointer-events-none p-1.5`} />;
                    }

                    const keyCfg = getKeyConfig(slotIdx);
                    const color = keyCfg.color;
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
                          {/* Keycap Top Bevel Dish */}
                          <div
                            className="absolute inset-1.5 rounded-xl border border-white/20 pointer-events-none flex items-center justify-center overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.15) 100%)`
                            }}
                          >
                            {renderKeyLegend(slotIdx, color)}
                          </div>

                          {color.isGlow && (
                            <div className="absolute inset-0 rounded-2xl bg-lime-400/20 animate-pulse pointer-events-none" />
                          )}

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
                <span>Cliquez sur les touches pour tester le son et sélectionner une touche !</span>
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
              <div>Mode Touches: <strong className="text-white">{keycapMode === "all" ? "Identiques" : "Sur-mesure"}</strong></div>
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
                    {isSelected && <span className="w-2 h-2 rounded-full bg-white shadow" />}
                  </button>
                );
              })}
            </div>
          </div>


          {/* STEP 3 : Personnalisation des Touches (Global vs Par Touche) */}
          <div className="space-y-5 p-5 rounded-3xl bg-neutral-900/50 border border-neutral-800">
            
            {/* Step Header & Mode Switch */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-black text-xs flex items-center justify-center shadow-sm">3</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Personnalisation des Touches</h3>
                </div>
              </div>

              {/* Mode Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setKeycapMode("all")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    keycapMode === "all"
                      ? "bg-white/10 border-white text-white ring-1 ring-white/30 shadow-md"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">📦 Global</span>
                    {keycapMode === "all" && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    Toutes les touches ont la même couleur et la même gravure.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setKeycapMode("custom")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    keycapMode === "custom"
                      ? "bg-white/10 border-white text-white ring-1 ring-white/30 shadow-md"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">🎨 Sur-Mesure</span>
                    {keycapMode === "custom" && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    Une perso unique pour chaque touche (couleur, lettre, mot, symbole).
                  </p>
                </button>
              </div>
            </div>

            {/* =========================================================================
                MODE A : GLOBAL (TOUTES LES TOUCHES IDENTIQUES)
               ========================================================================= */}
            {keycapMode === "all" && (
              <div className="space-y-4 pt-2 border-t border-neutral-800">
                
                {/* Global Color */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-neutral-300 font-mono font-bold">Couleur unique des touches :</label>
                    <span className="text-xs font-bold text-white">{globalKeycapColor.name}</span>
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                    {KEYCAP_COLORS.map((color, idx) => {
                      const isSelected = globalKeycapColor.id === color.id;
                      return (
                        <button
                          key={`${color.id}-${idx}`}
                          type="button"
                          onClick={() => setGlobalKeycapColor(color)}
                          className={`relative aspect-square rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                            isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-105 border-white shadow-md" : "border-white/10 hover:scale-102"
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

                {/* Global Perso Selection */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs text-neutral-300 font-mono font-bold">Motif ou gravure sur toutes les touches :</label>
                  
                  {/* Perso Type Tabs */}
                  <div className="grid grid-cols-5 gap-1.5 p-1 bg-black/60 rounded-xl border border-neutral-800 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setGlobalPerso({ type: "blank", value: "" })}
                      className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        globalPerso.type === "blank" ? "bg-white text-black font-extrabold shadow-sm" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <Slash className="w-3 h-3" />
                      <span>Vierge</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGlobalPerso({ type: "letter", value: globalPerso.value || "A" })}
                      className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        globalPerso.type === "letter" ? "bg-white text-black font-extrabold shadow-sm" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <Type className="w-3 h-3" />
                      <span>Lettre</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGlobalPerso({ type: "word", value: globalPerso.value || "WASD" })}
                      className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        globalPerso.type === "word" ? "bg-white text-black font-extrabold shadow-sm" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>Mot</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGlobalPerso({ type: "symbol", value: globalPerso.value || "zap" })}
                      className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        globalPerso.type === "symbol" ? "bg-white text-black font-extrabold shadow-sm" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Symbole</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGlobalPerso({ type: "texture", value: globalPerso.value || "lego" })}
                      className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        globalPerso.type === "texture" ? "bg-white text-black font-extrabold shadow-sm" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>Texture</span>
                    </button>
                  </div>

                  {/* Global Content Options */}
                  {globalPerso.type === "letter" && (
                    <div className="space-y-2 p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={1}
                          value={globalPerso.value}
                          onChange={(e) => setGlobalPerso({ type: "letter", value: e.target.value.toUpperCase() })}
                          placeholder="Ex: A"
                          className="w-16 h-10 px-3 py-2 text-center text-sm font-black uppercase rounded-xl border border-neutral-700 bg-neutral-900 text-white focus:outline-none focus:border-white"
                        />
                        <span className="text-xs text-neutral-400 font-medium">Choisissez ou saisissez une lettre (A-Z, 0-9)</span>
                      </div>

                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-1">
                        {QUICK_LETTERS.map((char) => (
                          <button
                            key={char}
                            type="button"
                            onClick={() => setGlobalPerso({ type: "letter", value: char })}
                            className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              globalPerso.value === char ? "bg-white text-black border-white" : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                            }`}
                          >
                            {char}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {globalPerso.type === "word" && (
                    <div className="space-y-2 p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={globalPerso.value}
                          onChange={(e) => setGlobalPerso({ type: "word", value: e.target.value.toUpperCase() })}
                          placeholder="Ex: WASD"
                          className="w-28 h-10 px-3 py-2 text-center text-xs font-black uppercase rounded-xl border border-neutral-700 bg-neutral-900 text-white focus:outline-none focus:border-white font-mono"
                        />
                        <span className="text-xs text-neutral-400 font-medium">Mot court (max 6 lettres)</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {WORD_SUGGESTIONS.map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setGlobalPerso({ type: "word", value: w })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                              globalPerso.value === w ? "bg-white text-black border-white" : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {globalPerso.type === "symbol" && (
                    <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                      <span className="text-[11px] text-neutral-400 font-mono block">Symboles Vectoriels SVG (Style Noun Project) :</span>
                      <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                        {VECTOR_SYMBOLS.map((sym) => {
                          const isSelected = globalPerso.value === sym.id;
                          return (
                            <button
                              key={sym.id}
                              type="button"
                              onClick={() => setGlobalPerso({ type: "symbol", value: sym.id })}
                              className={`h-9 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                                isSelected
                                  ? "bg-white text-black border-white shadow-md scale-105"
                                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                              }`}
                              title={sym.name}
                            >
                              <ClickerSvgSymbol symbolId={sym.id} size={16} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {globalPerso.type === "texture" && (
                    <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                      <span className="text-[11px] text-neutral-400 font-mono block">Textures &amp; Reliefs 3D Spoolio :</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {TEXTURE_OPTIONS.map((tex) => {
                          const isSelected = globalPerso.value === tex.id;
                          return (
                            <button
                              key={tex.id}
                              type="button"
                              onClick={() => setGlobalPerso({ type: "texture", value: tex.id })}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                                isSelected
                                  ? "bg-white text-black border-white shadow-md scale-102"
                                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{tex.icon}</span>
                                <span className="text-xs font-bold uppercase">{tex.name}</span>
                              </div>
                              <p className={`text-[10px] leading-tight ${isSelected ? "text-neutral-700 font-medium" : "text-neutral-400"}`}>
                                {tex.desc}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}


            {/* =========================================================================
                MODE B : SUR-MESURE (PAR TOUCHE)
               ========================================================================= */}
            {keycapMode === "custom" && (
              <div className="space-y-4 pt-2 border-t border-neutral-800">
                
                {/* Visual Target Key Selector Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-neutral-300 font-mono font-bold">Sélectionner la touche à configurer :</label>
                    <span className="text-xs font-bold text-[#ff4f00]">Touche #{selectedShape.validIndices.indexOf(activeKeyIndex) + 1}</span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {selectedShape.validIndices.map((slotIdx, i) => {
                      const isSelected = activeKeyIndex === slotIdx;
                      const cfg = getKeyConfig(slotIdx);
                      return (
                        <button
                          key={slotIdx}
                          type="button"
                          onClick={() => setActiveKeyIndex(slotIdx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 border ${
                            isSelected
                              ? "bg-white text-black border-white shadow-md font-black scale-102"
                              : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full border border-white/30 shrink-0" style={{ backgroundColor: cfg.color.hex }} />
                          <span>Touche #{i + 1}</span>
                          {cfg.type !== "blank" && (
                            <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-black/20 text-neutral-700">
                              {cfg.type === "symbol" ? "SVG" : cfg.value}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Configuration Panel for Active Key */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                  
                  {/* Active Key Color */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-neutral-300 font-mono">Couleur Touche #{selectedShape.validIndices.indexOf(activeKeyIndex) + 1} :</label>
                      <span className="text-xs font-bold text-white">{activeKeyConfig.color.name}</span>
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                      {KEYCAP_COLORS.map((color, idx) => {
                        const isSelected = activeKeyConfig.color.id === color.id;
                        return (
                          <button
                            key={`${color.id}-${idx}`}
                            type="button"
                            onClick={() => updateActiveKeyPerso({ color })}
                            className={`relative aspect-square rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                              isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-105 border-white shadow-md" : "border-white/10 hover:scale-102"
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

                  {/* Active Key Content Type Tabs */}
                  <div className="space-y-2 pt-1 border-t border-neutral-900">
                    <label className="text-xs text-neutral-300 font-mono">Contenu Touche #{selectedShape.validIndices.indexOf(activeKeyIndex) + 1} :</label>

                    <div className="grid grid-cols-5 gap-1.5 p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => updateActiveKeyPerso({ type: "blank", value: "" })}
                        className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          activeKeyConfig.type === "blank" ? "bg-white text-black font-extrabold shadow-sm" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        <Slash className="w-3 h-3" />
                        <span>Vierge</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateActiveKeyPerso({ type: "letter", value: activeKeyConfig.value || "A" })}
                        className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          activeKeyConfig.type === "letter" ? "bg-white text-black font-extrabold shadow-sm" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        <Type className="w-3 h-3" />
                        <span>Lettre</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateActiveKeyPerso({ type: "word", value: activeKeyConfig.value || "WASD" })}
                        className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          activeKeyConfig.type === "word" ? "bg-white text-black font-extrabold shadow-sm" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        <FileText className="w-3 h-3" />
                        <span>Mot</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateActiveKeyPerso({ type: "symbol", value: activeKeyConfig.value || "zap" })}
                        className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          activeKeyConfig.type === "symbol" ? "bg-white text-black font-extrabold shadow-sm" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Symbole</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateActiveKeyPerso({ type: "texture", value: activeKeyConfig.value || "lego" })}
                        className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          activeKeyConfig.type === "texture" ? "bg-white text-black font-extrabold shadow-sm" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        <Layers className="w-3 h-3" />
                        <span>Texture</span>
                      </button>
                    </div>

                    {/* Active Key Content Inputs */}
                    {activeKeyConfig.type === "letter" && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={1}
                            value={activeKeyConfig.value}
                            onChange={(e) => updateActiveKeyPerso({ type: "letter", value: e.target.value.toUpperCase() })}
                            placeholder="Ex: K"
                            className="w-16 h-10 px-3 py-2 text-center text-sm font-black uppercase rounded-xl border border-neutral-700 bg-neutral-900 text-white focus:outline-none focus:border-white"
                          />
                          <span className="text-xs text-neutral-400 font-medium">Une seule lettre (A-Z, 0-9)</span>
                        </div>

                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-1">
                          {QUICK_LETTERS.map((char) => (
                            <button
                              key={char}
                              type="button"
                              onClick={() => updateActiveKeyPerso({ type: "letter", value: char })}
                              className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                activeKeyConfig.value === char ? "bg-white text-black border-white" : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                              }`}
                            >
                              {char}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeKeyConfig.type === "word" && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={activeKeyConfig.value}
                            onChange={(e) => updateActiveKeyPerso({ type: "word", value: e.target.value.toUpperCase() })}
                            placeholder="Ex: WASD"
                            className="w-28 h-10 px-3 py-2 text-center text-xs font-black uppercase rounded-xl border border-neutral-700 bg-neutral-900 text-white focus:outline-none focus:border-white font-mono"
                          />
                          <span className="text-xs text-neutral-400 font-medium">Mot court (max 6 lettres)</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {WORD_SUGGESTIONS.map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => updateActiveKeyPerso({ type: "word", value: w })}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                                activeKeyConfig.value === w ? "bg-white text-black border-white" : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                              }`}
                            >
                              {w}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeKeyConfig.type === "symbol" && (
                      <div className="pt-2 space-y-2">
                        <span className="text-[11px] text-neutral-400 font-mono block">Symboles Vectoriels SVG (Style Noun Project) :</span>
                        <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                          {VECTOR_SYMBOLS.map((sym) => {
                            const isSelected = activeKeyConfig.value === sym.id;
                            return (
                              <button
                                key={sym.id}
                                type="button"
                                onClick={() => updateActiveKeyPerso({ type: "symbol", value: sym.id })}
                                className={`h-9 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                                  isSelected
                                    ? "bg-white text-black border-white shadow-md scale-105"
                                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                                }`}
                                title={sym.name}
                              >
                                <ClickerSvgSymbol symbolId={sym.id} size={16} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {activeKeyConfig.type === "texture" && (
                      <div className="pt-2 space-y-2">
                        <span className="text-[11px] text-neutral-400 font-mono block">Textures &amp; Reliefs 3D Spoolio :</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {TEXTURE_OPTIONS.map((tex) => {
                            const isSelected = activeKeyConfig.value === tex.id;
                            return (
                              <button
                                key={tex.id}
                                type="button"
                                onClick={() => updateActiveKeyPerso({ type: "texture", value: tex.id })}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                                  isSelected
                                    ? "bg-white text-black border-white shadow-md scale-102"
                                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{tex.icon}</span>
                                  <span className="text-xs font-bold uppercase">{tex.name}</span>
                                </div>
                                <p className={`text-[10px] leading-tight ${isSelected ? "text-neutral-700 font-medium" : "text-neutral-400"}`}>
                                  {tex.desc}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            )}

          </div>


          {/* STEP 4 : Switchs Mécaniques */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white text-black font-black text-xs flex items-center justify-center shadow-sm">4</span>
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
