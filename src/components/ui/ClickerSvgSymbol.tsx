"use client";

import React from "react";
import {
  Zap,
  Heart,
  Star,
  Gamepad2,
  Music,
  Flame,
  Target,
  Compass,
  Rocket,
  Crown,
  Smile,
  Power,
  Shield,
  Ghost,
  Skull,
  Sun,
  Moon,
  Terminal,
  Cpu,
  Lock,
  Atom,
  Sparkles,
  CircleDot,
  Volume2,
  Activity,
  Crosshair,
  Award
} from "lucide-react";

export interface SvgSymbolDefinition {
  id: string;
  name: string;
  category: "gaming" | "fidget" | "geek" | "shapes";
}

export const VECTOR_SYMBOLS: SvgSymbolDefinition[] = [
  { id: "zap", name: "Éclair", category: "fidget" },
  { id: "heart", name: "Cœur", category: "fidget" },
  { id: "star", name: "Étoile", category: "fidget" },
  { id: "gamepad", name: "Manette", category: "gaming" },
  { id: "flame", name: "Flamme", category: "fidget" },
  { id: "target", name: "Cible", category: "gaming" },
  { id: "rocket", name: "Fusée", category: "geek" },
  { id: "crown", name: "Couronne", category: "gaming" },
  { id: "music", name: "Musique", category: "fidget" },
  { id: "power", name: "Power", category: "geek" },
  { id: "shield", name: "Bouclier", category: "gaming" },
  { id: "ghost", name: "Fantôme", category: "gaming" },
  { id: "skull", name: "Crâne", category: "gaming" },
  { id: "smile", name: "Smile", category: "fidget" },
  { id: "compass", name: "Boussole", category: "geek" },
  { id: "terminal", name: "Terminal", category: "geek" },
  { id: "cpu", name: "Puce CPU", category: "geek" },
  { id: "atom", name: "Atome", category: "geek" },
  { id: "lock", name: "Cadenas", category: "geek" },
  { id: "sparkles", name: "Étincelles", category: "fidget" },
  { id: "sun", name: "Soleil", category: "fidget" },
  { id: "moon", name: "Lune", category: "fidget" },
];

interface ClickerSvgSymbolProps {
  symbolId: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export default function ClickerSvgSymbol({
  symbolId,
  className = "",
  size = 18,
  strokeWidth = 2.2
}: ClickerSvgSymbolProps) {
  switch (symbolId) {
    case "zap":
    case "lightning":
    case "⚡":
      return <Zap size={size} strokeWidth={strokeWidth} className={className} />;
    case "heart":
    case "❤️":
      return <Heart size={size} strokeWidth={strokeWidth} className={className} />;
    case "star":
    case "⭐":
      return <Star size={size} strokeWidth={strokeWidth} className={className} />;
    case "gamepad":
    case "gaming":
    case "🎮":
      return <Gamepad2 size={size} strokeWidth={strokeWidth} className={className} />;
    case "music":
    case "🎵":
      return <Music size={size} strokeWidth={strokeWidth} className={className} />;
    case "flame":
    case "fire":
    case "🔥":
      return <Flame size={size} strokeWidth={strokeWidth} className={className} />;
    case "target":
    case "crosshair":
      return <Target size={size} strokeWidth={strokeWidth} className={className} />;
    case "compass":
      return <Compass size={size} strokeWidth={strokeWidth} className={className} />;
    case "rocket":
      return <Rocket size={size} strokeWidth={strokeWidth} className={className} />;
    case "crown":
      return <Crown size={size} strokeWidth={strokeWidth} className={className} />;
    case "smile":
    case "😊":
      return <Smile size={size} strokeWidth={strokeWidth} className={className} />;
    case "power":
      return <Power size={size} strokeWidth={strokeWidth} className={className} />;
    case "shield":
      return <Shield size={size} strokeWidth={strokeWidth} className={className} />;
    case "ghost":
      return <Ghost size={size} strokeWidth={strokeWidth} className={className} />;
    case "skull":
      return <Skull size={size} strokeWidth={strokeWidth} className={className} />;
    case "sun":
      return <Sun size={size} strokeWidth={strokeWidth} className={className} />;
    case "moon":
      return <Moon size={size} strokeWidth={strokeWidth} className={className} />;
    case "terminal":
    case "code":
      return <Terminal size={size} strokeWidth={strokeWidth} className={className} />;
    case "cpu":
      return <Cpu size={size} strokeWidth={strokeWidth} className={className} />;
    case "lock":
      return <Lock size={size} strokeWidth={strokeWidth} className={className} />;
    case "atom":
      return <Atom size={size} strokeWidth={strokeWidth} className={className} />;
    case "sparkles":
      return <Sparkles size={size} strokeWidth={strokeWidth} className={className} />;
    case "spoolio":
    case "🌀":
      return <CircleDot size={size} strokeWidth={strokeWidth} className={className} />;
    default:
      return <Sparkles size={size} strokeWidth={strokeWidth} className={className} />;
  }
}
