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
  colorStart: string;
  colorEnd: string;
}

export const GACHAPON_CATEGORIES: Record<GachaponCategoryKey, GachaponCategoryConfig> = {
  figurines: {
    key: "figurines",
    name: "Figurines & Animaux",
    icon: "🐉",
    colorStart: "#00F0FF",
    colorEnd: "#0077FF",
  },
  fidgets: {
    key: "fidgets",
    name: "Fidgets & Stimulation",
    icon: "⌨️",
    colorStart: "#FF5500",
    colorEnd: "#FF8800",
  },
  gadgets: {
    key: "gadgets",
    name: "Porte-clés & Gadgets",
    icon: "🗝️",
    colorStart: "#00FF66",
    colorEnd: "#009933",
  },
  jeux: {
    key: "jeux",
    name: "Mini-jeux & Déco",
    icon: "🎲",
    colorStart: "#B026FF",
    colorEnd: "#6600CC",
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
    label: "3 Objets",
    price: 12.90,
    pricePerUnit: "4,30 € / objet",
  },
  {
    count: 6,
    label: "6 Objets",
    price: 21.90,
    pricePerUnit: "3,65 € / objet",
    badge: "RECOMMANDÉ 🔥",
  },
  {
    count: 10,
    label: "10 Objets",
    price: 34.90,
    pricePerUnit: "3,49 € / objet",
    badge: "MEGA PACK ⚡",
  },
];

// Organic natural heap of surprise balls resting naturally at bottom of glass jar
const ORGANIC_JAR_STOCK = [
  // Layer 1 (Bottom floor base scatter)
  { id: "b1", cat: "figurines", colorStart: "#00F0FF", colorEnd: "#0077FF", icon: "🐉", x: -106, y: 15, rotate: -24 },
  { id: "b2", cat: "fidgets", colorStart: "#FF5500", colorEnd: "#FF8800", icon: "⌨️", x: -62, y: 10, rotate: 14 },
  { id: "b3", cat: "gadgets", colorStart: "#00FF66", colorEnd: "#009933", icon: "🗝️", x: -18, y: 8, rotate: -8 },
  { id: "b4", cat: "jeux", colorStart: "#B026FF", colorEnd: "#6600CC", icon: "🎲", x: 26, y: 9, rotate: 28 },
  { id: "b5", cat: "figurines", colorStart: "#00F0FF", colorEnd: "#0077FF", icon: "🐉", x: 70, y: 13, rotate: -15 },
  { id: "b6", cat: "fidgets", colorStart: "#FF5500", colorEnd: "#FF8800", icon: "⌨️", x: 108, y: 19, rotate: 32 },

  // Layer 2 (Resting in hollows)
  { id: "b7", cat: "gadgets", colorStart: "#00FF66", colorEnd: "#009933", icon: "🗝️", x: -84, y: 46, rotate: -30 },
  { id: "b8", cat: "jeux", colorStart: "#B026FF", colorEnd: "#6600CC", icon: "🎲", x: -40, y: 44, rotate: 10 },
  { id: "b9", cat: "figurines", colorStart: "#00F0FF", colorEnd: "#0077FF", icon: "🦄", x: 4, y: 42, rotate: -18 },
  { id: "b10", cat: "fidgets", colorStart: "#FF5500", colorEnd: "#FF8800", icon: "🌟", x: 48, y: 45, rotate: 22 },
  { id: "b11", cat: "gadgets", colorStart: "#00FF66", colorEnd: "#009933", icon: "🗝️", x: 90, y: 50, rotate: -8 },

  // Layer 3 (Mid heap)
  { id: "b12", cat: "jeux", colorStart: "#B026FF", colorEnd: "#6600CC", icon: "🎲", x: -62, y: 80, rotate: 18 },
  { id: "b13", cat: "figurines", colorStart: "#00F0FF", colorEnd: "#0077FF", icon: "🐉", x: -18, y: 78, rotate: -12 },
  { id: "b14", cat: "fidgets", colorStart: "#FF5500", colorEnd: "#FF8800", icon: "⌨️", x: 26, y: 79, rotate: 35 },
  { id: "b15", cat: "gadgets", colorStart: "#00FF66", colorEnd: "#009933", icon: "✨", x: 68, y: 84, rotate: -25 },

  // Layer 4 (Upper heap)
  { id: "b16", cat: "jeux", colorStart: "#B026FF", colorEnd: "#6600CC", icon: "🎲", x: -38, y: 114, rotate: -5 },
  { id: "b17", cat: "figurines", colorStart: "#00F0FF", colorEnd: "#0077FF", icon: "🐉", x: 6, y: 112, rotate: 20 },
  { id: "b18", cat: "fidgets", colorStart: "#FF5500", colorEnd: "#FF8800", icon: "💖", x: 46, y: 118, rotate: -16 },

  // Layer 5 (Peak top)
  { id: "b19", cat: "gadgets", colorStart: "#00FF66", colorEnd: "#009933", icon: "🗝️", x: -16, y: 148, rotate: 12 },
  { id: "b20", cat: "jeux", colorStart: "#B026FF", colorEnd: "#6600CC", icon: "⭐", x: 24, y: 152, rotate: -28 },
];

/** Modern Premium Dual-Shell Japanese Gachapon Capsule Component */
function ModernGachaponCapsule({
  colorStart,
  colorEnd,
  icon,
  sizeClass = "w-8 h-8 sm:w-9 sm:h-9",
}: {
  colorStart: string;
  colorEnd: string;
  icon: string;
  sizeClass?: string;
}) {
  return (
    <div
      className={`relative ${sizeClass} rounded-full overflow-hidden flex items-center justify-center border border-white/35 select-none shrink-0 shadow-md group`}
      style={{
        boxShadow: `0 4px 10px ${colorStart}40, inset 0 -3px 6px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.7)`,
      }}
    >
      {/* Top Shell: Frosted Translucent Glass Half */}
      <div className="absolute top-0 inset-x-0 h-[48%] bg-white/35 backdrop-blur-[1px] border-b border-black/25 z-0" />
      
      {/* Bottom Shell: Rich Saturated Filament Gradient */}
      <div
        className="absolute bottom-0 inset-x-0 h-[52%] z-0"
        style={{
          background: `linear-gradient(to right, ${colorStart}, ${colorEnd})`,
        }}
      />

      {/* Top Specular Arc Highlight */}
      <div className="absolute top-0.5 left-1.5 w-3 h-1.5 rounded-full bg-white/70 blur-[0.5px] z-10 pointer-events-none" />

      {/* Category Icon */}
      <span className="relative z-20 text-xs sm:text-sm drop-shadow-sm select-none">
        {icon}
      </span>
    </div>
  );
}

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
  const [isShaking, setIsShaking] = useState<boolean>(false);
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

  // User's selected capsules list (dispensed into output tray)
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
    triggerCrankAndShake();
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

  // Trigger 360° crank spin & globe shake animation
  const triggerCrankAndShake = () => {
    setCrankRotation((prev) => prev + 360);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Chaos mode (interactive crank click or chaos button)
  const handleChaosMode = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    triggerCrankAndShake();

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
            "Taille de la pochette": `${selectedSize} objets`,
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
        
        {/* Header Title with Original Antonio & Plus Jakarta Fonts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-neutral-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-antonio)] font-bold uppercase tracking-wide text-white flex items-center gap-3">
              <span>Distributeur Gachapon</span>
              <span className="text-2xl">🎰</span>
            </h2>
            <p className="text-xs sm:text-sm font-[family-name:var(--font-plus-jakarta)] text-neutral-400 font-medium mt-1">
              Configure ta pochette sur-mesure d'objets mystères 3D
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 font-[family-name:var(--font-plus-jakarta)] text-xs text-neutral-300 self-start sm:self-auto">
            <span>Sélection :</span>
            <span className={`font-bold ${isQuotaReached ? "text-[#00FF66]" : "text-[#FF5500]"}`}>
              {totalSelected} / {selectedSize} objets
            </span>
          </div>
        </div>

        {/* ---------------- STRUCTURE EN 3 COLONNES PURS (Grid 12 cols) ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLONNE GAUCHE (3 cols) : ÉTAPE 1 - TAILLE */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <h3 className="text-xs font-[family-name:var(--font-antonio)] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-800 text-white text-[11px] flex items-center justify-center font-bold font-[family-name:var(--font-plus-jakarta)]">1</span>
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
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#FF5500] text-black font-extrabold text-[9px] font-[family-name:var(--font-antonio)] uppercase tracking-wider">
                        {sizeOpt.badge}
                      </span>
                    )}

                    <div className="text-base font-bold font-[family-name:var(--font-antonio)] tracking-wide text-white mb-0.5">
                      {sizeOpt.label}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-extrabold text-[#00FF66] font-[family-name:var(--font-antonio)]">
                        {sizeOpt.price.toFixed(2)} €
                      </span>
                      <span className="text-[11px] font-[family-name:var(--font-plus-jakarta)] text-neutral-400">
                        {sizeOpt.pricePerUnit}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COLONNE CENTRE (5 cols) : LE GACHAPON (Bocal Cylindrique Vitré Glassmorphism) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <h3 className="text-xs font-[family-name:var(--font-antonio)] font-bold uppercase tracking-wider text-neutral-400 text-center mb-3">
              Le Gachapon
            </h3>

            {/* STRUCTURE EN GELULE / BOCAL CYLINDRIQUE VITRÉ MODERNE */}
            <div className="relative flex flex-col items-center w-full max-w-[320px]">
              
              {/* 1. COUVERCLE METALLIQUE SOMBRE DISCRET */}
              <div className="w-36 h-3 rounded-t-xl bg-neutral-800 border-t border-x border-neutral-700 shadow-sm z-20" />

              {/* 2. BOCAL CYLINDRIQUE VITRÉ ELEGANT */}
              <motion.div
                animate={isShaking ? { x: [-2, 2, -2, 2, 0], y: [-1, 1, -1, 1, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="relative w-full h-[320px] rounded-[32px] bg-[#000000]/60 border border-neutral-700 shadow-xl backdrop-blur-md overflow-hidden flex flex-col justify-end p-4 z-10"
              >
                {/* Light glass sheen highlight */}
                <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-20" />
                <div className="absolute top-4 left-4 w-20 h-40 bg-white/5 rounded-full blur-md rotate-[-15deg] pointer-events-none z-20" />

                {/* INNER CONTAINER FOR BALLS (ORGANIC SCATTERED HEAP AT BOTTOM) */}
                <div className="absolute inset-0 flex items-end justify-center pb-5 z-10 pointer-events-none">
                  {ORGANIC_JAR_STOCK.map((item) => (
                    <motion.div
                      key={item.id}
                      animate={isShaking ? { y: [0, -6, 0, -3, 0], x: [0, 2, -2, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      className="absolute"
                      style={{
                        transform: `translate(${item.x}px, ${-item.y}px) rotate(${item.rotate}deg)`,
                      }}
                    >
                      <ModernGachaponCapsule
                        colorStart={item.colorStart}
                        colorEnd={item.colorEnd}
                        icon={item.icon}
                        sizeClass="w-9 h-9 sm:w-10 sm:h-10"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* 3. SOCLE COMPACT ARRONDI AVEC MANIVELLE & BAC DE SORTIE */}
              <div className="w-full rounded-2xl bg-neutral-900/90 border border-neutral-800 p-4 mt-3 shadow-md flex flex-col items-center gap-3 z-20">
                
                {/* MANIVELLE AU CENTRE DU SOCLE BAS */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    <motion.button
                      type="button"
                      onClick={handleChaosMode}
                      disabled={isSpinning}
                      animate={{ rotate: crankRotation }}
                      transition={{ type: "spring", stiffness: 140, damping: 14 }}
                      className="w-12 h-12 rounded-full bg-gradient-to-b from-neutral-700 via-neutral-800 to-neutral-950 border border-neutral-600 shadow-md flex items-center justify-center cursor-pointer hover:border-[#FF5500] transition-colors active:scale-95 group relative shrink-0"
                      title="Tourner la manivelle"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#FF5500] text-black font-extrabold flex items-center justify-center text-xs shadow-inner">
                        🔄
                      </div>
                    </motion.button>

                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={handleChaosMode}
                        disabled={isSpinning}
                        className="text-xs font-[family-name:var(--font-antonio)] font-bold text-white hover:text-[#FF5500] transition-colors text-left uppercase tracking-wider cursor-pointer"
                      >
                        🎲 TOURNER
                      </button>
                      <span className="text-[10px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)]">
                        Mode Chaos
                      </span>
                    </div>
                  </div>

                  {/* Jauge d'état claire */}
                  <div className="px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800 font-[family-name:var(--font-plus-jakarta)] text-[11px] text-neutral-300">
                    <span className={`font-bold ${isQuotaReached ? "text-[#00FF66]" : "text-[#FF5500]"}`}>
                      {totalSelected} / {selectedSize} objets prêts
                    </span>
                  </div>
                </div>

                {/* BAC DE SORTIE RECEPTACLE (ALIGNEMENT DES VRAIES MINI CAPSULES DANS LE BAC) */}
                <div className="w-full min-h-[46px] rounded-xl bg-neutral-950 border border-neutral-800 p-2 flex items-center justify-center gap-2 flex-wrap overflow-hidden">
                  {selectedCapsulesList.length === 0 ? (
                    <span className="text-[10px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)] italic">
                      Bac de sortie vide... Choisis tes objets
                    </span>
                  ) : (
                    <AnimatePresence>
                      {selectedCapsulesList.map((cap, i) => {
                        const catCfg = GACHAPON_CATEGORIES[cap.category];
                        return (
                          <motion.div
                            key={`tray-${cap.id}`}
                            initial={{ y: -25, opacity: 0, scale: 0.3, rotate: -20 }}
                            animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ y: 20, opacity: 0, scale: 0.3 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 18,
                              delay: i * 0.08,
                            }}
                            className="shrink-0"
                          >
                            <ModernGachaponCapsule
                              colorStart={catCfg.colorStart}
                              colorEnd={catCfg.colorEnd}
                              icon={catCfg.icon}
                              sizeClass="w-7 h-7 sm:w-8 sm:h-8"
                            />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* COLONNE DROITE (4 cols) : ÉTAPE 2 - DOSAGE ÉPURÉ & PANIER */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h3 className="text-xs font-[family-name:var(--font-antonio)] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-800 text-white text-[11px] flex items-center justify-center font-bold font-[family-name:var(--font-plus-jakarta)]">2</span>
              Étape 2 : Doser les catégories
            </h3>

            {/* Category Rows (Épurées: Icône + Nom à gauche | +/- à droite) */}
            <div className="flex flex-col gap-2.5">
              {(Object.keys(GACHAPON_CATEGORIES) as GachaponCategoryKey[]).map((catKey) => {
                const cat = GACHAPON_CATEGORIES[catKey];
                const count = distribution[catKey] || 0;
                const isMaxReached = totalSelected >= selectedSize;

                return (
                  <div
                    key={cat.key}
                    className="rounded-xl p-3 bg-neutral-900/40 border border-neutral-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">{cat.icon}</span>
                      <span className="text-sm font-bold font-[family-name:var(--font-plus-jakarta)] text-white truncate">
                        {cat.name}
                      </span>
                    </div>

                    {/* +/- Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveCapsule(catKey)}
                        disabled={count <= 0}
                        className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 disabled:opacity-20 disabled:pointer-events-none text-white font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                      >
                        -
                      </button>

                      <span className="w-5 text-center font-[family-name:var(--font-plus-jakarta)] font-bold text-sm text-white">
                        {count}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAddCapsule(catKey)}
                        disabled={isMaxReached}
                        className="w-7 h-7 rounded-lg border disabled:opacity-20 disabled:pointer-events-none text-black font-bold text-sm flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                        style={{
                          backgroundColor: cat.colorEnd,
                          borderColor: cat.colorEnd,
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
            <div className="p-3 rounded-xl bg-neutral-900/30 border border-neutral-800 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-[family-name:var(--font-plus-jakarta)]">
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
              className={`w-full py-3.5 px-5 rounded-xl font-extrabold font-[family-name:var(--font-antonio)] text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 ${
                isQuotaReached
                  ? "bg-[#FF5500] hover:bg-[#ff661a] text-black shadow-lg shadow-[#FF5500]/20 hover:scale-[1.02]"
                  : "bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed"
              }`}
            >
              {isQuotaReached ? (
                <span>INJECTER AU PANIER ({currentSizeObj.price.toFixed(2)} €) 🛒</span>
              ) : (
                <span>CHOISIS ENCORE {remainingCount} OBJET(S)...</span>
              )}
            </button>

            {/* Success toast */}
            <AnimatePresence>
              {isAddedSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-xl bg-[#00FF66]/15 border border-[#00FF66]/30 text-[#00FF66] text-center font-bold text-xs font-[family-name:var(--font-plus-jakarta)]"
                >
                  🎉 Pochette de {selectedSize} objets ajoutée à ton panier !
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
