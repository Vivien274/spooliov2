"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import AnimateDigits from "@/components/ui/AnimateDigits";
import ModernBentoGallery, { GalleryItem } from "@/components/ui/ModernBentoGallery";
import ClickerSvgSymbol, { VECTOR_SYMBOLS } from "@/components/ui/ClickerSvgSymbol";
import { Sparkles, Type, FileText, Slash, Check, Layers, Volume2, ArrowRight } from "lucide-react";
import Clicker3DViewer from "@/components/Clicker3DViewer";

// Color Definition Type
export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  textColor: string;
  isGlow?: boolean;
}

// Case Colors Palette (13 official colors)
export const CASE_COLORS: ColorOption[] = [
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

// Keycap Colors Palette (11 official colors)
export const KEYCAP_COLORS: ColorOption[] = [
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

// Switch Types Definition with sensory focus
export interface SwitchOption {
  id: "blue" | "brown" | "red";
  name: string;
  sensationLabel: string;
  feel: string;
  desc: string;
  soundLabel: string;
  volumeLevel: 1 | 2 | 3;
}

export const SWITCHES: SwitchOption[] = [
  {
    id: "blue",
    name: "Clicky",
    sensationLabel: "SEC / FRANC / SONORE",
    feel: "Clic franc & retour tactile net",
    desc: "Switch Bleu de précision. Déclenchement sonore immédiat et addictif.",
    soundLabel: "Sonore",
    volumeLevel: 3,
  },
  {
    id: "brown",
    name: "Tactile",
    sensationLabel: "NET / DOSÉ / ÉQUILIBRÉ",
    feel: "Résistance dosée sans bruit aigu",
    desc: "Switch Marron feutré. Bosse tactile franche et discrétion sonore au bureau.",
    soundLabel: "Modéré",
    volumeLevel: 2,
  },
  {
    id: "red",
    name: "Linéaire",
    sensationLabel: "FLUIDE / DOUX / DISCRET",
    feel: "Enfoncement soyeux sans à-coup",
    desc: "Switch Rouge silencieux. Glisse fluide continue pour les manipulations discrètes.",
    soundLabel: "Feutré",
    volumeLevel: 1,
  },
];

// Shapes / Layouts
export interface LayoutShape {
  id: string;
  code: string;
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

export const SHAPES: LayoutShape[] = [
  { id: "mono", code: "1K", name: "1 Touche", keyCount: 1, price: 4.90, rows: 1, cols: 1, gridTemplate: "grid-cols-1", validIndices: [0] },
  { id: "duo", code: "2K", name: "2 Touches Ligne", keyCount: 2, price: 6.90, rows: 1, cols: 2, gridTemplate: "grid-cols-2", validIndices: [0, 1] },
  { id: "trio", code: "3K", name: "3 Touches Ligne", keyCount: 3, price: 7.90, rows: 1, cols: 3, gridTemplate: "grid-cols-3", validIndices: [0, 1, 2] },
  { id: "square_2x2", code: "4K SQ", name: "4 Touches Carré", keyCount: 4, price: 9.90, rows: 2, cols: 2, gridTemplate: "grid-cols-2", validIndices: [0, 1, 2, 3] },
  { id: "line_4", code: "4K LN", name: "4 Touches Ligne", keyCount: 4, price: 9.90, rows: 1, cols: 4, gridTemplate: "grid-cols-4", validIndices: [0, 1, 2, 3] },
  { id: "shape_t", code: "4K T", name: "4 Touches en T", keyCount: 4, price: 9.90, rows: 2, cols: 3, gridTemplate: "grid-cols-3", validIndices: [1, 3, 4, 5] },
  { id: "line_7", code: "7K LN", name: "7 Touches Ligne", keyCount: 7, price: 14.90, rows: 1, cols: 7, gridTemplate: "grid-cols-7", validIndices: [0, 1, 2, 3, 4, 5, 6] },
  { id: "grid_3x3", code: "9K SQ", name: "9 Touches Carré", keyCount: 9, price: 16.90, rows: 3, cols: 3, gridTemplate: "grid-cols-3", validIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
];

// Attachments
export interface AttachmentOption {
  id: string;
  name: string;
  shortLabel: string;
  price: number;
}

export const ATTACHMENTS: AttachmentOption[] = [
  { id: "chain", name: "Chaînette à Billes Inox", shortLabel: "Inox", price: 0.50 },
  { id: "clip", name: "Câble Métallique", shortLabel: "Câble", price: 0.80 },
  { id: "lanyard", name: "Dragonne de Poignet Souple", shortLabel: "Dragonne", price: 1.50 },
  { id: "ring", name: "Anneau Porte-Clés Renforcé", shortLabel: "Anneau", price: 0.50 },
  { id: "none", name: "Sans attache (Usage Bureau)", shortLabel: "Bureau", price: 0.00 },
];

export type KeyCustomizationType = "blank" | "letter" | "word" | "symbol" | "texture";

export interface TextureOption {
  id: "lego" | "caisse" | "fromage";
  name: string;
  desc: string;
}

export const TEXTURE_OPTIONS: TextureOption[] = [
  { id: "lego", name: "Studs Lego", desc: "4 tenons cylindriques style brique de construction" },
  { id: "caisse", name: "Caisse Atelier", desc: "Rainures croisées et renforts de caisse en bois" },
  { id: "fromage", name: "Alvéoles Gruyère", desc: "Cavités asymétriques sculptées dans la matière" },
];

export interface SingleKeyPerso {
  type: KeyCustomizationType;
  value: string;
  color: ColorOption;
}

export interface ClickerPreset {
  id: string;
  editionName: string;
  subline: string;
  colorsPreview: string[];
  shapeId: string;
  caseColorId: string;
  switchId: "blue" | "brown" | "red";
  attachmentId: string;
  keycapMode: "all" | "custom";
  globalKeycapColorId?: string;
  globalPerso?: { type: KeyCustomizationType; value: string };
  keyConfigs?: Record<number, { type: KeyCustomizationType; value: string; colorId: string }>;
}

export const POPULAR_PRESETS: ClickerPreset[] = [
  {
    id: "spoolio_signature",
    editionName: "SIGNATURE",
    subline: "Noir mat, orange & jaune Spoolio • Clicky",
    colorsPreview: ["#18181b", "#ff4f00", "#facc15"],
    shapeId: "square_2x2",
    caseColorId: "noir",
    switchId: "blue",
    attachmentId: "clip",
    keycapMode: "custom",
    keyConfigs: {
      0: { type: "letter", value: "S", colorId: "orange" },
      1: { type: "letter", value: "P", colorId: "jaune" },
      2: { type: "letter", value: "O", colorId: "jaune" },
      3: { type: "letter", value: "O", colorId: "orange" },
    },
  },
  {
    id: "stealth_bureau",
    editionName: "STEALTH",
    subline: "Monochrome noir & blanc • Linéaire silencieux",
    colorsPreview: ["#18181b", "#ffffff"],
    shapeId: "mono",
    caseColorId: "noir",
    switchId: "red",
    attachmentId: "none",
    keycapMode: "all",
    globalKeycapColorId: "blanc",
    globalPerso: { type: "symbol", value: "star" },
  },
  {
    id: "cyberpunk_neon",
    editionName: "CYBER",
    subline: "Gris carbone, cyan & rose néon • Clicky",
    colorsPreview: ["#3f3f46", "#06b6d4", "#ec4899"],
    shapeId: "duo",
    caseColorId: "gris",
    switchId: "blue",
    attachmentId: "chain",
    keycapMode: "custom",
    keyConfigs: {
      0: { type: "symbol", value: "zap", colorId: "cyan" },
      1: { type: "symbol", value: "gamepad", colorId: "rose" },
    },
  },
  {
    id: "gamer_wasd",
    editionName: "SIGNAL WASD",
    subline: "Format directionnel T, violet & cyan • Tactile",
    colorsPreview: ["#7c3aed", "#06b6d4"],
    shapeId: "shape_t",
    caseColorId: "violet",
    switchId: "brown",
    attachmentId: "ring",
    keycapMode: "custom",
    keyConfigs: {
      1: { type: "letter", value: "W", colorId: "cyan" },
      3: { type: "letter", value: "A", colorId: "cyan" },
      4: { type: "letter", value: "S", colorId: "violet" },
      5: { type: "letter", value: "D", colorId: "cyan" },
    },
  },
  {
    id: "glow_night",
    editionName: "PHOSPHO",
    subline: "Corps & touches phosphorescents dans le noir • Clicky",
    colorsPreview: ["#a3e635", "#a3e635"],
    shapeId: "duo",
    caseColorId: "glow",
    switchId: "blue",
    attachmentId: "clip",
    keycapMode: "all",
    globalKeycapColorId: "glow",
    globalPerso: { type: "symbol", value: "heart" },
  },
];

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
  const [selectedShape, setSelectedShape] = useState<LayoutShape>(SHAPES[3]); // Default: 4K Carré
  const [caseColor, setCaseColor] = useState<ColorOption>(CASE_COLORS[0]); // Noir Mat
  const [switchType, setSwitchType] = useState<SwitchOption>(SWITCHES[0]); // Clicky
  const [attachment, setAttachment] = useState<AttachmentOption>(ATTACHMENTS[1]); // Mousqueton

  // Keycap customization mode: "all" (global) or "custom" (par touche)
  const [keycapMode, setKeycapMode] = useState<"all" | "custom">("custom");

  // Global mode configuration
  const [globalKeycapColor, setGlobalKeycapColor] = useState<ColorOption>(KEYCAP_COLORS[0]);
  const [globalPerso, setGlobalPerso] = useState<{ type: KeyCustomizationType; value: string }>({ type: "blank", value: "" });

  // Per key configuration (indexed by slot position index)
  const [keyConfigs, setKeyConfigs] = useState<Record<number, SingleKeyPerso>>({});

  // Active key index in custom mode
  const [activeKeyIndex, setActiveKeyIndex] = useState<number>(0);
  const [activePresetId, setActivePresetId] = useState<string | null>("spoolio_signature");

  // Visual View Mode: 3d or 2d
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [pressedKey, setPressedKey] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState<boolean>(false);

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

    fetch("/api/admin/clicker-config", { cache: "no-store" })
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

    fetch("/api/admin/clicker-gallery", { cache: "no-store" })
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

  // Render SVG symbol or text inside 2D keycap view
  const renderKeyLegend = (slotIdx: number, color: ColorOption) => {
    const config = getKeyConfig(slotIdx);

    if (config.type === "letter" && config.value) {
      return (
        <span
          className="text-lg sm:text-xl font-mono font-bold tracking-tight select-none uppercase"
          style={{ color: color.textColor }}
        >
          {config.value.substring(0, 1)}
        </span>
      );
    }

    if (config.type === "word" && config.value) {
      const len = config.value.length;
      const fontSizeClass = len <= 3 ? "text-xs font-mono font-bold" : "text-[9px] font-mono font-bold";

      return (
        <span
          className={`${fontSizeClass} tracking-tight select-none uppercase px-1 leading-none text-center`}
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
          size={18}
          className="transition-transform group-hover:scale-105"
        />
      );
    }

    if (config.type === "texture" && config.value) {
      if (config.value === "lego") {
        return (
          <div className="grid grid-cols-2 gap-1.5 p-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-xs" style={{ backgroundColor: color.hex }} />
            ))}
          </div>
        );
      }
      if (config.value === "fromage") {
        return (
          <div className="relative w-full h-full p-1 opacity-60">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full bg-black/40" />
            <span className="absolute bottom-1 right-2 w-3.5 h-3.5 rounded-full bg-black/40" />
          </div>
        );
      }
      return <span className="text-[10px] font-mono opacity-50 uppercase">CAISSE</span>;
    }

    return <span className="w-2 h-2 rounded-full bg-current opacity-25" />;
  };

  // Total price calculation (strict preserve business rules)
  const shapePrice = typeof selectedShape.price === "number" ? selectedShape.price : parseFloat(String(selectedShape.price)) || 0;
  const attachmentPrice = typeof attachment.price === "number" ? attachment.price : parseFloat(String(attachment.price)) || 0;
  const totalPrice = shapePrice + attachmentPrice;

  // Apply a popular preset in 1 click
  const handleApplyPreset = (preset: ClickerPreset) => {
    setActivePresetId(preset.id);
    const foundShape = shapesList.find((s) => s.id === preset.shapeId) || shapesList[0];
    const foundCase = colorsList.find((c) => c.id === preset.caseColorId) || colorsList[0];
    const foundSwitch = switchesList.find((sw) => sw.id === preset.switchId) || switchesList[0];
    const foundAtt = attachmentsList.find((a) => a.id === preset.attachmentId) || attachmentsList[0];

    setSelectedShape(foundShape);
    setCaseColor(foundCase);
    setSwitchType(foundSwitch);
    setAttachment(foundAtt);
    setKeycapMode(preset.keycapMode);

    if (preset.keycapMode === "all") {
      const foundColor = KEYCAP_COLORS.find((c) => c.id === preset.globalKeycapColorId) || KEYCAP_COLORS[0];
      setGlobalKeycapColor(foundColor);
      setGlobalPerso(preset.globalPerso || { type: "blank", value: "" });
    } else if (preset.keyConfigs) {
      const newKeys: Record<number, SingleKeyPerso> = {};
      foundShape.validIndices.forEach((idx) => {
        const item = preset.keyConfigs?.[idx];
        const keyColor = item
          ? KEYCAP_COLORS.find((c) => c.id === item.colorId) || KEYCAP_COLORS[0]
          : KEYCAP_COLORS[0];
        newKeys[idx] = {
          type: item ? item.type : "blank",
          value: item ? item.value : "",
          color: keyColor,
        };
      });
      setKeyConfigs(newKeys);
    }
  };

  // Add custom clicker to cart
  const handleAddToCart = () => {
    const keyDetails = selectedShape.validIndices.map((idx, i) => {
      const cfg = getKeyConfig(idx);
      let label = "Vierge";
      if (cfg.type === "letter") label = `Lettre '${cfg.value}'`;
      else if (cfg.type === "word") label = `Mot '${cfg.value}'`;
      else if (cfg.type === "symbol") label = `Symbole ${cfg.value}`;
      else if (cfg.type === "texture") {
        const foundTex = TEXTURE_OPTIONS.find((t) => t.id === cfg.value);
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

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2400);
  };

  const activeKeyConfig = getKeyConfig(activeKeyIndex);

  // Technical shorthand summary line
  const technicalSummary = `${selectedShape.code} // ${caseColor.name.toUpperCase()} // ${keycapMode === "all" ? globalKeycapColor.name.toUpperCase() : "MIX"} // ${switchType.name.toUpperCase()} // ${attachment.shortLabel.toUpperCase()}`;

  return (
    <div className={`w-full max-w-7xl mx-auto font-sans text-[#18181B] ${className}`}>
      
      {/* =========================================================================
          MAIN PRODUCT DESIGN STUDIO CONSOLE (LIGHT THEME)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* =========================================================================
            LEFT COLUMN (~60%): 3D IMMERSIVE VIEWER & HARDWARE DECK
           ========================================================================= */}
        <div className="lg:col-span-7 lg:sticky lg:top-24 lg:self-start z-20 space-y-4">
          
          {/* Viewer Mode Bar */}
          <div className="flex items-center justify-between bg-white border border-[#E4E4E0] shadow-xs rounded-xl px-3 py-2 text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("3d")}
                className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === "3d"
                    ? "bg-[#FF5500] text-white shadow-2xs"
                    : "text-[#666663] hover:text-[#18181B]"
                }`}
              >
                3D STUDIO
              </button>
              <button
                type="button"
                onClick={() => setViewMode("2d")}
                className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === "2d"
                    ? "bg-[#FF5500] text-white shadow-2xs"
                    : "text-[#666663] hover:text-[#18181B]"
                }`}
              >
                PLAN 2D
              </button>
            </div>

            <button
              type="button"
              onClick={() => playClickSound(switchType.id)}
              className="font-mono text-[11px] text-[#444444] hover:text-[#18181B] bg-[#F4F3EE] hover:bg-[#EAE9E3] border border-[#E0DFD8] px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>TESTER LE SON ({switchType.name.toUpperCase()})</span>
            </button>
          </div>

          {/* Viewer Area */}
          {viewMode === "3d" ? (
            <Clicker3DViewer
              shapeId={selectedShape.id}
              keyCount={selectedShape.keyCount}
              caseColor={caseColor}
              switchType={switchType.id}
              keyconfigs={(() => {
                const map: Record<number, { type: any; value: string; color: string }> = {};
                selectedShape.validIndices.forEach((idx) => {
                  const cfg = getKeyConfig(idx);
                  map[idx] = { type: cfg.type, value: cfg.value, color: cfg.color.id };
                });
                return map;
              })()}
              keycapMode={keycapMode}
              globalKeycapColor={globalKeycapColor}
              keycapColorsList={colorsList}
              onKeyClick={handleKeyClick}
              activeKeyIndex={activeKeyIndex}
            />
          ) : (
            <div className="relative bg-[#F6F5F1] border border-[#E4E3DD] shadow-xs rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center min-h-[400px] sm:min-h-[460px] lg:min-h-[500px]">
              <span className="absolute top-3.5 left-3.5 text-[11px] font-mono text-[#BBBBB5]">+</span>
              <span className="absolute top-3.5 right-3.5 text-[11px] font-mono text-[#BBBBB5]">+</span>
              <span className="absolute bottom-3.5 left-3.5 text-[11px] font-mono text-[#BBBBB5]">+</span>
              <span className="absolute bottom-3.5 right-3.5 text-[11px] font-mono text-[#BBBBB5]">+</span>

              <div className="text-center mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#707070] block">
                  VUE ORTHOGONALE 2D
                </span>
                <span className="text-xs text-[#888888] font-mono">
                  Cliquez sur une touche pour la tester ou la sélectionner
                </span>
              </div>

              {/* 2D Grid Representation */}
              <div
                className="p-3 sm:p-4 rounded-2xl border border-black/10 shadow-lg transition-all"
                style={{ backgroundColor: caseColor.hex }}
              >
                <div
                  className={`grid gap-3 ${selectedShape.gridTemplate}`}
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
                      return <div key={slotIdx} className={`${keySizeClass} opacity-0 pointer-events-none`} />;
                    }

                    const isValid = selectedShape.validIndices.includes(slotIdx);
                    if (!isValid) {
                      return <div key={slotIdx} className={`${keySizeClass} opacity-0 pointer-events-none`} />;
                    }

                    const keyCfg = getKeyConfig(slotIdx);
                    const color = keyCfg.color;
                    const isPressed = pressedKey === slotIdx;
                    const isSelectedInCustom = keycapMode === "custom" && activeKeyIndex === slotIdx;

                    return (
                      <button
                        key={slotIdx}
                        type="button"
                        onClick={() => handleKeyClick(slotIdx)}
                        className={`relative ${keySizeClass} rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                          isSelectedInCustom
                            ? "ring-2 ring-[#FF5500] ring-offset-2 ring-offset-white scale-105 z-20"
                            : "border-black/15 hover:scale-102"
                        }`}
                        style={{
                          backgroundColor: color.hex,
                          transform: isPressed ? "scale(0.94)" : "scale(1)",
                        }}
                      >
                        {renderKeyLegend(slotIdx, color)}
                        <span className="absolute top-1 left-1.5 text-[8px] font-mono opacity-50 font-bold">
                          #{slotIdx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Hardware Status Strip */}
          <div className="bg-white border border-[#E4E4E0] shadow-xs rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#777777] tracking-wider uppercase block">SYNTHÈSE DU MODÈLE</span>
              <span className="text-[#18181B] font-bold tracking-tight text-[11px] sm:text-xs">
                {technicalSummary}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#666663] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span>ATELIER DE COMINES</span>
            </div>
          </div>

        </div>


        {/* =========================================================================
            RIGHT COLUMN (~40%): CUSTOMIZATION CONTROL PANEL (LIGHT THEME)
           ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          



          {/* =========================================================================
              01 / FORMAT & GÉOMÉTRIE
             ========================================================================= */}
          <section className="bg-white border border-[#E4E4E0] shadow-xs rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#F0EFEA] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#FF5500]">01 /</span>
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#18181B]">
                  FORMAT
                </h2>
              </div>
              <span className="font-mono text-xs font-bold text-[#FF5500]">{selectedShape.name}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {shapesList.map((shape) => {
                const isSelected = selectedShape.id === shape.id;
                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => {
                      setSelectedShape(shape);
                      setActivePresetId(null);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-20 ${
                      isSelected
                        ? "bg-[#FFF7F2] border-[#FF5500] ring-1 ring-[#FF5500]/50 shadow-2xs"
                        : "bg-[#FBFBFA] border-[#E8E8E4] hover:border-[#D0D0CA] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-xs font-bold text-[#18181B]">
                        {shape.code}
                      </span>
                      <span className="text-[10px] font-mono text-[#777777]">
                        {shape.keyCount}K
                      </span>
                    </div>

                    <div className="pt-2 flex items-baseline justify-between w-full">
                      <span className="text-[10px] text-[#666663] font-mono truncate max-w-[65px]">
                        {shape.name.replace(/Touches|Touche/i, "").trim()}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#18181B]">
                        {(Number(shape.price) || 0).toFixed(2)}€
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>


          {/* =========================================================================
              02 / COQUE (BOÎTIER PLA)
             ========================================================================= */}
          <section className="bg-white border border-[#E4E4E0] shadow-xs rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#F0EFEA] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#FF5500]">02 /</span>
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#18181B]">
                  COQUE
                </h2>
              </div>
              <span className="font-mono text-xs font-bold text-[#18181B] uppercase">
                {caseColor.name}
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
              {colorsList.map((c, idx) => {
                const isSelected = caseColor.id === c.id;
                return (
                  <button
                    key={`${c.id}-${idx}`}
                    type="button"
                    onClick={() => {
                      setCaseColor(c);
                      setActivePresetId(null);
                    }}
                    className={`relative aspect-square rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                      isSelected
                        ? "border-[#FF5500] ring-2 ring-[#FF5500] ring-offset-2 ring-offset-white scale-105"
                        : "border-black/15 hover:border-[#888888]"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {isSelected && (
                      <span
                        className="w-2 h-2 rounded-full shadow-xs"
                        style={{ backgroundColor: c.textColor || "#ffffff" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </section>


          {/* =========================================================================
              03 / TOUCHES (PERSONNALISATION)
             ========================================================================= */}
          <section className="bg-white border border-[#E4E4E0] shadow-xs rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EFEA] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#FF5500]">03 /</span>
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#18181B]">
                  TOUCHES
                </h2>
              </div>

              {/* Mode Toggle Switch */}
              <div className="flex items-center bg-[#F4F3EE] border border-[#E4E3DD] p-0.5 rounded-lg text-[10px] font-mono font-bold">
                <button
                  type="button"
                  onClick={() => setKeycapMode("all")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    keycapMode === "all" ? "bg-[#FF5500] text-white shadow-2xs" : "text-[#666663] hover:text-[#18181B]"
                  }`}
                >
                  IDENTIQUES
                </button>
                <button
                  type="button"
                  onClick={() => setKeycapMode("custom")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    keycapMode === "custom" ? "bg-[#FF5500] text-white shadow-2xs" : "text-[#666663] hover:text-[#18181B]"
                  }`}
                >
                  SUR-MESURE
                </button>
              </div>
            </div>

            {/* Target key selector if in custom mode */}
            {keycapMode === "custom" && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[#777777] uppercase block">
                  CHOISIR LA TOUCHE CIBLE :
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {selectedShape.validIndices.map((slotIdx, i) => {
                    const isSelected = activeKeyIndex === slotIdx;
                    const cfg = getKeyConfig(slotIdx);
                    return (
                      <button
                        key={slotIdx}
                        type="button"
                        onClick={() => setActiveKeyIndex(slotIdx)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 border ${
                          isSelected
                            ? "bg-[#FFF7F2] text-[#18181B] border-[#FF5500] ring-1 ring-[#FF5500]"
                            : "bg-[#FBFBFA] text-[#666663] border-[#E8E8E4] hover:border-[#D0D0CA] hover:text-[#18181B]"
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/30 shrink-0"
                          style={{ backgroundColor: cfg.color.hex }}
                        />
                        <span>#{i + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Keycap Color Swatches */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#777777]">COULEUR DES TOUCHES :</span>
                <span className="text-[#18181B] font-bold">
                  {keycapMode === "all" ? globalKeycapColor.name : activeKeyConfig.color.name}
                </span>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                {KEYCAP_COLORS.map((color, idx) => {
                  const isSelected =
                    keycapMode === "all"
                      ? globalKeycapColor.id === color.id
                      : activeKeyConfig.color.id === color.id;
                  return (
                    <button
                      key={`${color.id}-${idx}`}
                      type="button"
                      onClick={() => {
                        if (keycapMode === "all") {
                          setGlobalKeycapColor(color);
                        } else {
                          updateActiveKeyPerso({ color });
                        }
                        setActivePresetId(null);
                      }}
                      className={`relative aspect-square rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                        isSelected
                          ? "border-[#FF5500] ring-2 ring-[#FF5500] ring-offset-2 ring-offset-white scale-105"
                          : "border-black/15 hover:border-[#888888]"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isSelected && (
                        <span
                          className="w-1.5 h-1.5 rounded-full shadow-xs"
                          style={{ backgroundColor: color.textColor || "#ffffff" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Keycap Engraving / Relief Type Tabs */}
            <div className="space-y-3 pt-2 border-t border-[#F0EFEA]">
              <span className="text-[10px] font-mono text-[#777777] uppercase block">
                GRAVURE &amp; SURFACE TACTILE :
              </span>

              {/* Type Switcher */}
              <div className="grid grid-cols-5 gap-1 p-1 bg-[#F4F3EE] rounded-xl border border-[#E4E3DD] text-[10px] font-mono font-bold">
                {[
                  { id: "blank", label: "VIERGE", icon: Slash },
                  { id: "letter", label: "LETTRE", icon: Type },
                  { id: "word", label: "MOT", icon: FileText },
                  { id: "symbol", label: "SYMBOLE", icon: Sparkles },
                  { id: "texture", label: "TEXTURE", icon: Layers },
                ].map((item) => {
                  const currentType = keycapMode === "all" ? globalPerso.type : activeKeyConfig.type;
                  const isSelected = currentType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (keycapMode === "all") {
                          setGlobalPerso({
                            type: item.id as KeyCustomizationType,
                            value: item.id === "letter" ? "A" : item.id === "word" ? "WASD" : item.id === "symbol" ? "zap" : item.id === "texture" ? "lego" : "",
                          });
                        } else {
                          updateActiveKeyPerso({
                            type: item.id as KeyCustomizationType,
                            value: item.id === "letter" ? "A" : item.id === "word" ? "WASD" : item.id === "symbol" ? "zap" : item.id === "texture" ? "lego" : "",
                          });
                        }
                        setActivePresetId(null);
                      }}
                      className={`py-1.5 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#FF5500] text-white font-bold shadow-2xs"
                          : "text-[#666663] hover:text-[#18181B]"
                      }`}
                    >
                      <item.icon className="w-3 h-3" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Content Panel: Letter */}
              {((keycapMode === "all" && globalPerso.type === "letter") ||
                (keycapMode === "custom" && activeKeyConfig.type === "letter")) && (
                <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E8E8E4] space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={1}
                      value={keycapMode === "all" ? globalPerso.value : activeKeyConfig.value}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        if (keycapMode === "all") setGlobalPerso({ type: "letter", value: val });
                        else updateActiveKeyPerso({ type: "letter", value: val });
                      }}
                      placeholder="A"
                      className="w-12 h-9 px-2 text-center font-mono font-bold text-sm uppercase rounded-lg border border-[#D5D5CF] bg-white text-[#18181B] focus:outline-none focus:border-[#FF5500]"
                    />
                    <span className="text-[11px] font-mono text-[#777777]">Caractère unique gravé</span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pt-1">
                    {QUICK_LETTERS.map((char) => {
                      const curVal = keycapMode === "all" ? globalPerso.value : activeKeyConfig.value;
                      return (
                        <button
                          key={char}
                          type="button"
                          onClick={() => {
                            if (keycapMode === "all") setGlobalPerso({ type: "letter", value: char });
                            else updateActiveKeyPerso({ type: "letter", value: char });
                          }}
                          className={`w-6 h-6 rounded-md text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                            curVal === char
                              ? "bg-[#FF5500] text-white border-[#FF5500]"
                              : "bg-white border-[#E0DFD8] text-[#555555] hover:text-[#18181B]"
                          }`}
                        >
                          {char}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Content Panel: Word */}
              {((keycapMode === "all" && globalPerso.type === "word") ||
                (keycapMode === "custom" && activeKeyConfig.type === "word")) && (
                <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E8E8E4] space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={keycapMode === "all" ? globalPerso.value : activeKeyConfig.value}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        if (keycapMode === "all") setGlobalPerso({ type: "word", value: val });
                        else updateActiveKeyPerso({ type: "word", value: val });
                      }}
                      placeholder="WASD"
                      className="w-24 h-9 px-2 text-center font-mono font-bold text-xs uppercase rounded-lg border border-[#D5D5CF] bg-white text-[#18181B] focus:outline-none focus:border-[#FF5500]"
                    />
                    <span className="text-[11px] font-mono text-[#777777]">Max 6 lettres</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {WORD_SUGGESTIONS.map((w) => {
                      const curVal = keycapMode === "all" ? globalPerso.value : activeKeyConfig.value;
                      return (
                        <button
                          key={w}
                          type="button"
                          onClick={() => {
                            if (keycapMode === "all") setGlobalPerso({ type: "word", value: w });
                            else updateActiveKeyPerso({ type: "word", value: w });
                          }}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                            curVal === w
                              ? "bg-[#FF5500] text-white border-[#FF5500]"
                              : "bg-white border-[#E0DFD8] text-[#555555] hover:text-[#18181B]"
                          }`}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Content Panel: Symbol */}
              {((keycapMode === "all" && globalPerso.type === "symbol") ||
                (keycapMode === "custom" && activeKeyConfig.type === "symbol")) && (
                <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E8E8E4] space-y-2">
                  <span className="text-[10px] font-mono text-[#777777] block">SYMBOLES VECTORIELS GRAVÉS :</span>
                  <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 max-h-36 overflow-y-auto">
                    {VECTOR_SYMBOLS.map((sym) => {
                      const curVal = keycapMode === "all" ? globalPerso.value : activeKeyConfig.value;
                      const isSelected = curVal === sym.id;
                      return (
                        <button
                          key={sym.id}
                          type="button"
                          onClick={() => {
                            if (keycapMode === "all") setGlobalPerso({ type: "symbol", value: sym.id });
                            else updateActiveKeyPerso({ type: "symbol", value: sym.id });
                          }}
                          className={`h-8 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? "bg-[#FF5500] text-white border-[#FF5500]"
                              : "bg-white border-[#E0DFD8] text-[#666663] hover:text-[#18181B]"
                          }`}
                          title={sym.name}
                        >
                          <ClickerSvgSymbol symbolId={sym.id} size={15} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Content Panel: Texture */}
              {((keycapMode === "all" && globalPerso.type === "texture") ||
                (keycapMode === "custom" && activeKeyConfig.type === "texture")) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {TEXTURE_OPTIONS.map((tex) => {
                    const curVal = keycapMode === "all" ? globalPerso.value : activeKeyConfig.value;
                    const isSelected = curVal === tex.id;
                    return (
                      <button
                        key={tex.id}
                        type="button"
                        onClick={() => {
                          if (keycapMode === "all") setGlobalPerso({ type: "texture", value: tex.id });
                          else updateActiveKeyPerso({ type: "texture", value: tex.id });
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? "bg-[#FFF7F2] border-[#FF5500] ring-1 ring-[#FF5500]"
                            : "bg-[#FBFBFA] border-[#E8E8E4] text-[#666663] hover:text-[#18181B]"
                        }`}
                      >
                        <span className="text-xs font-mono font-bold uppercase text-[#18181B]">{tex.name}</span>
                        <p className="text-[10px] text-[#777777] font-mono leading-tight">{tex.desc}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>


          {/* =========================================================================
              04 / SENSATION (SWITCHES MÉCANIQUES)
             ========================================================================= */}
          <section className="bg-white border border-[#E4E4E0] shadow-xs rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#F0EFEA] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#FF5500]">04 /</span>
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#18181B]">
                  SENSATION
                </h2>
              </div>
              <span className="font-mono text-xs font-bold text-[#FF5500]">
                {switchType.name.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {switchesList.map((sw) => {
                const isSelected = switchType.id === sw.id;
                return (
                  <div
                    key={sw.id}
                    onClick={() => {
                      setSwitchType(sw);
                      playClickSound(sw.id);
                      setActivePresetId(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-28 ${
                      isSelected
                        ? "bg-[#FFF7F2] border-[#FF5500] ring-1 ring-[#FF5500]/50 shadow-2xs"
                        : "bg-[#FBFBFA] border-[#E8E8E4] hover:border-[#D0D0CA] hover:bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold uppercase text-[#18181B]">
                          {sw.name}
                        </span>
                        {/* Audio Preview Icon Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playClickSound(sw.id);
                          }}
                          className="p-1 rounded-md bg-[#EBEAE5] hover:bg-[#FF5500] text-[#555555] hover:text-white transition-colors cursor-pointer"
                          title="Écouter le clic"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-[10px] font-mono text-[#FF5500] block mb-1 font-bold">
                        {sw.sensationLabel}
                      </span>
                      <p className="text-[10px] text-[#666663] font-mono leading-tight">
                        {sw.desc}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-[#888888]">
                      <span>SON {sw.soundLabel.toUpperCase()}</span>
                      <div className="flex gap-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${sw.volumeLevel >= 1 ? "bg-[#FF5500]" : "bg-[#D8D8D2]"}`} />
                        <span className={`w-1.5 h-1.5 rounded-full ${sw.volumeLevel >= 2 ? "bg-[#FF5500]" : "bg-[#D8D8D2]"}`} />
                        <span className={`w-1.5 h-1.5 rounded-full ${sw.volumeLevel >= 3 ? "bg-[#FF5500]" : "bg-[#D8D8D2]"}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>


          {/* =========================================================================
              05 / FINITIONS (ATTACHE & ACCESSOIRES)
             ========================================================================= */}
          <section className="bg-white border border-[#E4E4E0] shadow-xs rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#F0EFEA] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#FF5500]">05 /</span>
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#18181B]">
                  FINITIONS
                </h2>
              </div>
              <span className="font-mono text-xs font-bold text-[#FF5500]">{attachment.shortLabel}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {attachmentsList.map((att) => {
                const isSelected = attachment.id === att.id;
                return (
                  <button
                    key={att.id}
                    type="button"
                    onClick={() => {
                      setAttachment(att);
                      setActivePresetId(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-[#FFF7F2] border-[#FF5500] ring-1 ring-[#FF5500]/50 shadow-2xs"
                        : "bg-[#FBFBFA] border-[#E8E8E4] hover:border-[#D0D0CA] hover:bg-white"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold text-[#18181B]">
                      {att.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#666663]">
                      {(Number(att.price) || 0) > 0 ? `+${(Number(att.price) || 0).toFixed(2)}€` : "INCLUS"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>


          {/* =========================================================================
              HARDWARE ACTION BAR & PURCHASE CTA (DESKTOP PANEL - LIGHT)
             ========================================================================= */}
          <div className="bg-white border border-[#E4E4E0] shadow-md rounded-2xl p-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#777777] uppercase tracking-wider block">
                  PRIX TOTAL CONCEPTION
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <AnimateDigits value={totalPrice} className="text-3xl font-mono font-bold text-[#18181B]" />
                  <span className="text-xs font-mono text-[#888888]">TTC</span>
                </div>
              </div>

              <div className="text-right font-mono text-[11px] text-[#666663]">
                <span>EXPÉDITION RAPIDE 48H</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-4 px-6 rounded-xl text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                justAdded
                  ? "bg-[#10b981] text-white"
                  : "bg-[#FF5500] hover:bg-[#E04B00] text-white hover:scale-[1.01]"
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>AJOUTÉ AU PANIER</span>
                </>
              ) : (
                <>
                  <span>AJOUTER AU PANIER</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>


      {/* =========================================================================
          STICKY MOBILE ACTION BAR (FIXED AT SCREEN BOTTOM - LIGHT)
         ========================================================================= */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E4E4E0] p-3.5 pb-6 safe-area-bottom shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-[#777777] uppercase">PRIX STUDIO</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-bold text-[#18181B]">
                {totalPrice.toFixed(2)}€
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              justAdded
                ? "bg-[#10b981] text-white"
                : "bg-[#FF5500] text-white active:scale-95 shadow-sm"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>AJOUTÉ</span>
              </>
            ) : (
              <>
                <span>AJOUTER AU PANIER</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>


      {/* =========================================================================
          ATELIER BENTO GALLERY (LIGHT THEME)
         ========================================================================= */}
      {galleryList && galleryList.length > 0 && (
        <div className="mt-16 pt-8 border-t border-[#E4E4E0]">
          <ModernBentoGallery items={galleryList} />
        </div>
      )}

    </div>
  );
}
