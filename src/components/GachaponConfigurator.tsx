"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useCart } from "@/context/CartContext";

export type GachaponCategoryKey = "figurines" | "fidgets" | "gadgets" | "jeux";

export interface GachaponCategoryConfig {
  key: GachaponCategoryKey;
  name: string;
  icon: string;
  color: string;
}

export const GACHAPON_CATEGORIES: Record<GachaponCategoryKey, GachaponCategoryConfig> = {
  figurines: {
    key: "figurines",
    name: "Figurines & Animaux",
    icon: "🐉",
    color: "#00F0FF",
  },
  fidgets: {
    key: "fidgets",
    name: "Fidgets & Stimulation",
    icon: "⌨️",
    color: "#FF5500",
  },
  gadgets: {
    key: "gadgets",
    name: "Porte-clés & Gadgets",
    icon: "🗝️",
    color: "#00FF66",
  },
  jeux: {
    key: "jeux",
    name: "Mini-jeux & Déco",
    icon: "🎲",
    color: "#B026FF",
  },
};

export interface GachaponSizeOption {
  count: number;
  label: string;
  price: number;
  pricePerUnit: string;
  badge?: string;
}

export const GACHAPON_SIZES: GachaponSizeOption[] = [
  {
    count: 3,
    label: "3 Capsules",
    price: 12.90,
    pricePerUnit: "4,30 € / u",
  },
  {
    count: 6,
    label: "6 Capsules",
    price: 21.90,
    pricePerUnit: "3,65 € / u",
    badge: "RECOMMANDÉ 🔥",
  },
  {
    count: 10,
    label: "10 Capsules",
    price: 34.90,
    pricePerUnit: "3,49 € / u",
    badge: "MEGA PACK ⚡",
  },
];

// Rich colorful stock inside the glass dome (representing full machine stock)
const GLOBE_BACKGROUND_STOCK = [
  // Layer 1 (Bottom floor)
  { id: "s1", x: -38, y: 34, color: "#00F0FF", icon: "🐉", rotate: -15 },
  { id: "s2", x: -24, y: 36, color: "#FF5500", icon: "⌨️", rotate: 22 },
  { id: "s3", x: -10, y: 38, color: "#00FF66", icon: "🗝️", rotate: -8 },
  { id: "s4", x: 5, y: 38, color: "#B026FF", icon: "🎲", rotate: 30 },
  { id: "s5", x: 20, y: 36, color: "#FFD700", icon: "🌟", rotate: -25 },
  { id: "s6", x: 35, y: 33, color: "#FF69B4", icon: "🦄", rotate: 18 },
  
  // Layer 2 (Lower mid)
  { id: "s7", x: -32, y: 20, color: "#B026FF", icon: "🎲", rotate: 10 },
  { id: "s8", x: -18, y: 22, color: "#00FF66", icon: "🗝️", rotate: -30 },
  { id: "s9", x: -4, y: 24, color: "#FF5500", icon: "⌨️", rotate: 14 },
  { id: "s10", x: 10, y: 23, color: "#00F0FF", icon: "🐉", rotate: -12 },
  { id: "s11", x: 25, y: 21, color: "#FF69B4", icon: "💖", rotate: 35 },
  { id: "s12", x: 36, y: 17, color: "#FFD700", icon: "✨", rotate: -5 },

  // Layer 3 (Center)
  { id: "s13", x: -26, y: 6, color: "#FF5500", icon: "⌨️", rotate: -18 },
  { id: "s14", x: -12, y: 8, color: "#00F0FF", icon: "🐉", rotate: 25 },
  { id: "s15", x: 2, y: 9, color: "#FFD700", icon: "⭐", rotate: -10 },
  { id: "s16", x: 16, y: 8, color: "#B026FF", icon: "🎲", rotate: 40 },
  { id: "s17", x: 30, y: 5, color: "#00FF66", icon: "🗝️", rotate: -22 },

  // Layer 4 (Upper mid)
  { id: "s18", x: -20, y: -7, color: "#00FF66", icon: "🗝️", rotate: 8 },
  { id: "s19", x: -6, y: -6, color: "#B026FF", icon: "🎲", rotate: -35 },
  { id: "s20", x: 8, y: -5, color: "#FF5500", icon: "⌨️", rotate: 15 },
  { id: "s21", x: 22, y: -8, color: "#00F0FF", icon: "🐉", rotate: -14 },

  // Layer 5 (Top dome layer)
  { id: "s22", x: -12, y: -20, color: "#FF69B4", icon: "🔮", rotate: 12 },
  { id: "s23", x: 0, y: -19, color: "#FFD700", icon: "⚡", rotate: -20 },
  { id: "s24", x: 12, y: -21, color: "#00F0FF", icon: "🐉", rotate: 28 },
];

export interface GachaponConfiguratorProps {
  onAddToCart?: (config: {
    size: number;
    distribution: Record<GachaponCategoryKey, number>;
    totalPrice: number;
  }) => void;
  className?: string;
}

interface InternalCapsule {
  id: string;
  category: GachaponCategoryKey;
}

export default function GachaponConfigurator({
  onAddToCart,
  className = "",
}: GachaponConfiguratorProps) {
  // Try using cart context safely
  let cartContext: ReturnType<typeof useCart> | null = null;
  try {
    cartContext = useCart();
  } catch (e) {
    // Fallback if rendered outside CartProvider
  }

  const [selectedSize, setSelectedSize] = useState<number>(6);
  const [distribution, setDistribution] = useState<Record<GachaponCategoryKey, number>>({
    figurines: 2,
    fidgets: 2,
    gadgets: 1,
    jeux: 1,
  });

  const [crankRotation, setCrankRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isAddedSuccess, setIsAddedSuccess] = useState<boolean>(false);

  // Compute total selected count
  const totalSelected = useMemo(() => {
    return (Object.keys(distribution) as GachaponCategoryKey[]).reduce(
      (sum, cat) => sum + (distribution[cat] || 0),
      0
    );
  }, [distribution]);

  // Current selected size object
  const currentSizeObj = useMemo(() => {
    return GACHAPON_SIZES.find((s) => s.count === selectedSize) || GACHAPON_SIZES[1];
  }, [selectedSize]);

  // User's selected capsules list (dispensed out into tray)
  const selectedCapsulesList = useMemo(() => {
    const list: InternalCapsule[] = [];
    let idx = 0;

    (Object.keys(distribution) as GachaponCategoryKey[]).forEach((cat) => {
      const count = distribution[cat] || 0;
      for (let i = 0; i < count; i++) {
        list.push({
          id: `${cat}-${i}-${idx}`,
          category: cat,
        });
        idx++;
      }
    });

    return list;
  }, [distribution]);

  // Handle changing size
  const handleSelectSize = (newSize: number) => {
    setSelectedSize(newSize);
    setIsAddedSuccess(false);

    if (totalSelected > newSize) {
      let excess = totalSelected - newSize;
      const newDist = { ...distribution };
      const categories = Object.keys(newDist) as GachaponCategoryKey[];
      
      for (const cat of categories) {
        while (newDist[cat] > 0 && excess > 0) {
          newDist[cat]--;
          excess--;
        }
        if (excess <= 0) break;
      }
      setDistribution(newDist);
    }
  };

  // Add category capsule
  const handleAddCapsule = (catKey: GachaponCategoryKey) => {
    if (totalSelected >= selectedSize) return;
    setDistribution((prev) => ({
      ...prev,
      [catKey]: (prev[catKey] || 0) + 1,
    }));
    setCrankRotation((prev) => prev + 60);
    setIsAddedSuccess(false);
  };

  // Remove category capsule
  const handleRemoveCapsule = (catKey: GachaponCategoryKey) => {
    if ((distribution[catKey] || 0) <= 0) return;
    setDistribution((prev) => ({
      ...prev,
      [catKey]: Math.max(0, (prev[catKey] || 0) - 1),
    }));
    setIsAddedSuccess(false);
  };

  // Chaos mode (interactive crank click or chaos button)
  const handleChaosMode = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setCrankRotation((prev) => prev + 720);

    setTimeout(() => {
      const categories: GachaponCategoryKey[] = ["figurines", "fidgets", "gadgets", "jeux"];
      const newDist: Record<GachaponCategoryKey, number> = {
        figurines: 0,
        fidgets: 0,
        gadgets: 0,
        jeux: 0,
      };

      for (let i = 0; i < selectedSize; i++) {
        const randCat = categories[Math.floor(Math.random() * categories.length)];
        newDist[randCat]++;
      }

      setDistribution(newDist);
      setIsSpinning(false);
      setIsAddedSuccess(false);
    }, 550);
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (totalSelected < selectedSize) return;

    try {
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.65 },
        colors: ["#FF5500", "#00F0FF", "#00FF66", "#B026FF", "#FFFFFF"],
      });
    } catch (e) {
      // Fallback
    }

    const payload = {
      size: selectedSize,
      distribution: { ...distribution },
      totalPrice: currentSizeObj.price,
    };

    if (onAddToCart) {
      onAddToCart(payload);
    }

    if (cartContext && cartContext.addToCart) {
      const summaryText = (Object.keys(distribution) as GachaponCategoryKey[])
        .filter((cat) => distribution[cat] > 0)
        .map((cat) => `${distribution[cat]}x ${GACHAPON_CATEGORIES[cat].name.split(" ")[0]}`)
        .join(", ");

      cartContext.addToCart(
        {
          productId: 8888 + selectedSize,
          name: `Pochette Surprise Gachapon (${selectedSize} objets)`,
          slug: "pochette-surprise-gachapon",
          price: currentSizeObj.price.toFixed(2),
          selectedOptions: {
            "Taille de la pochette": `${selectedSize} surprises`,
            "Composition": summaryText,
          },
          image: "/images/hero_background.jpg",
        },
        1,
        true
      );
    }

    setIsAddedSuccess(true);
  };

  const isQuotaReached = totalSelected === selectedSize;
  const remainingCount = selectedSize - totalSelected;

  return (
    <div className={`no-invert w-full max-w-6xl mx-auto font-sans text-white ${className}`}>
      {/* Outer Bento Card - Clean Dark Aesthetic */}
      <div className="rounded-3xl bg-[#09090b] border border-neutral-800 p-6 md:p-8 shadow-2xl">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-neutral-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white flex items-center gap-3">
              <span>Distributeur Gachapon</span>
              <span className="text-2xl">🎰</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-1">
              Configure ta pochette sur-mesure d'objets mystères 3D
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 font-mono text-xs text-neutral-300 self-start sm:self-auto">
            <span>Sélection :</span>
            <span className={`font-bold ${isQuotaReached ? "text-[#00FF66]" : "text-[#FF5500]"}`}>
              {totalSelected} / {selectedSize} capsules
            </span>
          </div>
        </div>

        {/* ---------------- STRUCTURE EN 3 COLONNES PURS (Grid 12 cols) ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLONNE GAUCHE (3 cols) : ÉTAPE 1 - TAILLE */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-800 text-white text-[11px] flex items-center justify-center font-bold">1</span>
              Étape 1 : Choisir la taille
            </h3>

            <div className="flex flex-col gap-3">
              {GACHAPON_SIZES.map((sizeOpt) => {
                const isSelected = selectedSize === sizeOpt.count;
                return (
                  <button
                    key={sizeOpt.count}
                    type="button"
                    onClick={() => handleSelectSize(sizeOpt.count)}
                    className={`relative text-left rounded-2xl p-4 transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-neutral-900 border-[#FF5500] shadow-sm"
                        : "bg-neutral-900/30 hover:bg-neutral-900/60 border-neutral-800 opacity-75 hover:opacity-100"
                    }`}
                  >
                    {sizeOpt.badge && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#FF5500] text-black font-extrabold text-[9px] uppercase tracking-wider">
                        {sizeOpt.badge}
                      </span>
                    )}

                    <div className="text-sm font-bold text-white mb-0.5">
                      {sizeOpt.label}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base font-extrabold text-[#00FF66] font-mono">
                        {sizeOpt.price.toFixed(2)} €
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        {sizeOpt.pricePerUnit}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COLONNE CENTRE (5 cols) : LE GACHAPON AVEC RESERVOIR GÉANT ET BASE COMPACTE */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 text-center mb-3">
              Le Gachapon
            </h3>

            {/* RETRO RED GACHAPON MACHINE STRUCTURE WITH ENLARGED GLOBE & COMPACT BASE */}
            <div className="relative flex flex-col items-center w-full max-w-[340px]">
              
              {/* 1. RED TOP CAP / LID DOME */}
              <div className="w-48 h-10 rounded-t-full bg-gradient-to-b from-[#ff3b3b] via-[#d91e1e] to-[#aa0d0d] border-t-2 border-x-2 border-white/30 shadow-md relative z-20 flex items-center justify-center">
                {/* Top Knob Handle */}
                <div className="w-8 h-3 -mt-4 rounded-t-full bg-gradient-to-b from-[#ff5c5c] to-[#990a0a] border-t border-white/40 shadow-inner" />
                {/* Lid Highlight */}
                <div className="absolute top-1 left-4 w-12 h-2 rounded-full bg-white/25 blur-[1px]" />
              </div>

              {/* 2. ENLARGED SPHERICAL CLEAR GLASS GLOBE FULL OF SURPRISE BALLS */}
              <div className="relative w-80 h-80 sm:w-88 sm:h-88 rounded-full bg-gradient-to-b from-white/25 via-white/5 to-black/75 border-4 border-white/30 shadow-[inset_0_0_35px_rgba(255,255,255,0.2)] backdrop-blur-sm overflow-hidden flex items-center justify-center -mt-2 z-10">
                {/* Glass curved highlights */}
                <div className="absolute top-5 left-8 w-32 h-16 rounded-full bg-white/35 blur-sm rotate-[-30deg] pointer-events-none z-30" />
                <div className="absolute bottom-6 right-8 w-20 h-10 rounded-full bg-white/10 blur-md pointer-events-none z-30" />

                {/* FULL RESERVOIR OF COLORFUL GACHAPON STOCK BALLS */}
                {GLOBE_BACKGROUND_STOCK.map((item) => (
                  <div
                    key={item.id}
                    className="absolute w-11 h-11 rounded-full flex items-center justify-center shadow-md border border-white/25 z-10 opacity-95"
                    style={{
                      transform: `translate(${item.x * 2.8}px, ${item.y * 2.8}px) rotate(${item.rotate}deg)`,
                      background: `radial-gradient(circle at 35% 35%, ${item.color}, #09090b 80%)`,
                    }}
                  >
                    {/* Seam line */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/40" />
                    {/* Top shine */}
                    <div className="absolute top-1 left-2 w-3 h-1.5 rounded-full bg-white/40 blur-[1px]" />
                    {/* Icon */}
                    <span className="relative z-10 text-sm select-none opacity-90">{item.icon}</span>
                  </div>
                ))}
              </div>

              {/* 3. COMPACT RETRO RED MACHINE BODY BASE */}
              <div className="w-[85%] bg-gradient-to-b from-[#e62222] via-[#c91818] to-[#990c0c] border-2 border-[#b31414] rounded-b-3xl shadow-xl p-3 sm:p-4 -mt-5 z-20 flex flex-col items-center relative">
                {/* Decorative Collar Trim */}
                <div className="w-[105%] h-2.5 bg-gradient-to-r from-[#ab0e0e] via-[#e62222] to-[#ab0e0e] rounded-full border-t border-white/20 shadow-md -mt-4 mb-3" />

                {/* 4. COMPACT EMBOSSED SILVER METALLIC FRONT PANEL */}
                <div className="w-40 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 border-2 border-slate-400/80 rounded-xl p-2 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_8px_rgba(0,0,0,0.5)] flex flex-col items-center relative mb-3">
                  
                  {/* Coin Slot Accent */}
                  <div className="w-12 h-2 rounded-full bg-slate-700 border border-slate-500 mb-1 flex items-center justify-center">
                    <div className="w-6 h-0.5 rounded-full bg-slate-900" />
                  </div>

                  {/* METALLIC ROTARY CRANK LEVER */}
                  <motion.button
                    type="button"
                    onClick={handleChaosMode}
                    disabled={isSpinning}
                    animate={{ rotate: crankRotation }}
                    transition={{ type: "spring", stiffness: 150, damping: 14 }}
                    className="w-14 h-14 rounded-full bg-gradient-to-b from-slate-300 via-slate-400 to-slate-600 border-3 border-slate-400 shadow-md flex items-center justify-center cursor-pointer hover:border-slate-100 transition-all active:scale-95 group relative my-0.5"
                    title="Clique la manivelle (Mode Chaos)"
                  >
                    {/* Central Shaft */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-b from-slate-600 to-slate-800 border border-slate-400 shadow-inner flex items-center justify-center">
                      {/* Metallic Crank Lever Bar */}
                      <div className="w-10 h-3 rounded-full bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 border border-slate-500 shadow-sm transform rotate-45 group-hover:scale-105 transition-transform flex items-center justify-between px-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      </div>
                    </div>
                  </motion.button>

                  {/* Action Label */}
                  <button
                    type="button"
                    onClick={handleChaosMode}
                    disabled={isSpinning}
                    className="text-[9px] font-mono font-bold text-slate-800 hover:text-black uppercase tracking-wider cursor-pointer"
                  >
                    🎲 MODE CHAOS
                  </button>
                </div>

                {/* 5. RED TRAY CHUTE AT BOTTOM (DISPENSED OUTSIDE OUTPUT AREA) */}
                <div className="w-full bg-[#7a0909] border-2 border-[#5c0505] rounded-xl p-2 flex flex-col gap-1.5 shadow-inner">
                  <div className="flex items-center justify-between text-[11px] font-mono text-white/90 px-1">
                    <span className="font-bold uppercase tracking-wide">Bac de sortie</span>
                    <span className={`font-bold ${isQuotaReached ? "text-[#00FF66]" : "text-[#FFCC00]"}`}>
                      {totalSelected} / {selectedSize} capsules
                    </span>
                  </div>

                  {/* Output Tray Slots (Showing user's selected capsules dispensed out) */}
                  <div className="w-full min-h-[42px] rounded-lg bg-black/80 border border-black/50 p-2 flex items-center justify-center gap-1.5 flex-wrap">
                    {selectedCapsulesList.length === 0 ? (
                      <span className="text-[10px] text-neutral-400 font-mono italic">
                        Bac de sortie vide... Choisis tes capsules
                      </span>
                    ) : (
                      <AnimatePresence>
                        {selectedCapsulesList.map((cap, i) => {
                          const catCfg = GACHAPON_CATEGORIES[cap.category];
                          return (
                            <motion.div
                              key={`tray-${cap.id}`}
                              initial={{ scale: 0, y: -15, rotate: -30 }}
                              animate={{ scale: 1, y: 0, rotate: 0 }}
                              exit={{ scale: 0, y: 15 }}
                              transition={{ type: "spring", stiffness: 300, damping: 18, delay: i * 0.03 }}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs border border-white/30 shadow-md shrink-0"
                              style={{
                                background: `radial-gradient(circle at 35% 35%, ${catCfg.color}, #09090b 85%)`,
                              }}
                              title={`${catCfg.name}`}
                            >
                              <span>{catCfg.icon}</span>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* COLONNE DROITE (4 cols) : ÉTAPE 2 - DOSAGE & PANIER */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-800 text-white text-[11px] flex items-center justify-center font-bold">2</span>
              Étape 2 : Doser les catégories
            </h3>

            {/* Category Rows */}
            <div className="flex flex-col gap-3">
              {(Object.keys(GACHAPON_CATEGORIES) as GachaponCategoryKey[]).map((catKey) => {
                const cat = GACHAPON_CATEGORIES[catKey];
                const count = distribution[catKey] || 0;
                const isMaxReached = totalSelected >= selectedSize;

                return (
                  <div
                    key={cat.key}
                    className="rounded-2xl p-3.5 bg-neutral-900/40 border border-neutral-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{cat.icon}</span>
                      <span className="text-sm font-bold text-white truncate">
                        {cat.name}
                      </span>
                    </div>

                    {/* +/- Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveCapsule(catKey)}
                        disabled={count <= 0}
                        className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 disabled:opacity-25 disabled:pointer-events-none text-white font-bold text-base flex items-center justify-center cursor-pointer transition-colors"
                      >
                        -
                      </button>

                      <span className="w-6 text-center font-mono font-bold text-sm text-white">
                        {count}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAddCapsule(catKey)}
                        disabled={isMaxReached}
                        className="w-8 h-8 rounded-lg border disabled:opacity-25 disabled:pointer-events-none text-black font-bold text-base flex items-center justify-center cursor-pointer transition-colors"
                        style={{
                          backgroundColor: cat.color,
                          borderColor: cat.color,
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quota Progress Bar */}
            <div className="p-3 rounded-2xl bg-neutral-900/30 border border-neutral-800 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-neutral-400">Progression</span>
                <span className={isQuotaReached ? "text-[#00FF66] font-bold" : "text-[#FF5500]"}>
                  {totalSelected} / {selectedSize}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#00F0FF] via-[#00FF66] to-[#FF5500]"
                  style={{ width: `${(totalSelected / selectedSize) * 100}%` }}
                />
              </div>
            </div>

            {/* Main Submit Button at bottom of right column */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isQuotaReached}
              className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 ${
                isQuotaReached
                  ? "bg-[#FF5500] hover:bg-[#ff661a] text-black shadow-lg shadow-[#FF5500]/20 hover:scale-[1.02]"
                  : "bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed"
              }`}
            >
              {isQuotaReached ? (
                <span>INJECTER AU PANIER ({currentSizeObj.price.toFixed(2)} €) 🛒</span>
              ) : (
                <span>CHOISIS ENCORE {remainingCount} CAPSULE(S)...</span>
              )}
            </button>

            {/* Success toast */}
            <AnimatePresence>
              {isAddedSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-xl bg-[#00FF66]/15 border border-[#00FF66]/30 text-[#00FF66] text-center font-bold text-xs"
                >
                  🎉 Pochette ajoutée à ton panier !
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
