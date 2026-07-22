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
  x: number;
  y: number;
  rotate: number;
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

  // Gravity-stacked positions pooling naturally at bottom of globe
  const visualCapsules = useMemo(() => {
    const list: InternalCapsule[] = [];
    let idx = 0;
    
    // Clean dome gravity stacking presets pooling at floor
    const gravityPresets = [
      // Floor (bottom row)
      { x: -32, y: 30, rotate: -20 },
      { x: -16, y: 34, rotate: 12 },
      { x: 0, y: 36, rotate: -6 },
      { x: 16, y: 34, rotate: 28 },
      { x: 32, y: 30, rotate: -16 },
      // Row 2 (middle floor)
      { x: -24, y: 16, rotate: 10 },
      { x: -8, y: 18, rotate: -28 },
      { x: 8, y: 18, rotate: 20 },
      { x: 24, y: 16, rotate: -12 },
      // Row 3 (top level of pile)
      { x: -14, y: 2, rotate: -4 },
      { x: 0, y: 4, rotate: 35 },
      { x: 14, y: 2, rotate: -18 },
    ];

    (Object.keys(distribution) as GachaponCategoryKey[]).forEach((cat) => {
      const count = distribution[cat] || 0;
      for (let i = 0; i < count; i++) {
        const preset = gravityPresets[idx % gravityPresets.length];
        list.push({
          id: `${cat}-${i}-${idx}`,
          category: cat,
          x: preset.x,
          y: preset.y,
          rotate: preset.rotate + (idx * 6),
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
              <span className="text-2xl">🔮</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-1">
              Configure ta pochette sur-mesure d'objets mystères 3D
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 font-mono text-xs text-neutral-300 self-start sm:self-auto">
            <span>Quota :</span>
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

          {/* COLONNE CENTRE (5 cols) : LE GACHAPON */}
          <div className="lg:col-span-5 flex flex-col items-center gap-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 text-center">
              Le Gachapon
            </h3>

            {/* Enlarged Reservoir Globe */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-[#000000]/60 border border-neutral-800 shadow-xl backdrop-blur-sm overflow-hidden flex items-center justify-center">
              {/* Glass curved highlight */}
              <div className="absolute top-3 left-8 w-28 h-12 rounded-full bg-white/10 blur-sm rotate-[-30deg] pointer-events-none z-10" />

              {/* Empty state prompt */}
              {visualCapsules.length === 0 && (
                <div className="text-center text-neutral-500 text-xs font-mono p-4 z-10">
                  Réservoir vide<br />Ajoute des capsules à droite
                </div>
              )}

              {/* Capsules stacked at bottom (gravity effect) */}
              <AnimatePresence>
                {visualCapsules.map((cap) => {
                  const catCfg = GACHAPON_CATEGORIES[cap.category];
                  return (
                    <motion.div
                      key={cap.id}
                      initial={{ y: -160, opacity: 0, scale: 0.3 }}
                      animate={{
                        x: cap.x * 2.4,
                        y: cap.y * 2.4, // Stacks towards floor
                        rotate: cap.rotate,
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{ y: 160, opacity: 0, scale: 0.3 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 17,
                      }}
                      className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-md border border-white/20 z-10"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, ${catCfg.color}, #09090b 80%)`,
                      }}
                    >
                      {/* Seam line */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/40" />
                      {/* Icon */}
                      <span className="relative z-10 text-base sm:text-lg select-none">
                        {catCfg.icon}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Rotary Crank / Chaos Button Just Below Globe */}
            <div className="flex flex-col items-center gap-2">
              <motion.button
                type="button"
                onClick={handleChaosMode}
                disabled={isSpinning}
                animate={{ rotate: crankRotation }}
                transition={{ type: "spring", stiffness: 150, damping: 14 }}
                className="w-16 h-16 rounded-full bg-neutral-900 border-2 border-neutral-700 hover:border-[#FF5500] flex items-center justify-center cursor-pointer shadow-md transition-all active:scale-95 group"
                title="Tourner la manivelle (Mode Chaos)"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF5500] to-[#FFCC00] flex items-center justify-center text-black font-extrabold text-sm shadow-sm">
                  🎲
                </div>
              </motion.button>
              
              <button
                type="button"
                onClick={handleChaosMode}
                disabled={isSpinning}
                className="text-xs font-mono font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                🎲 MODE CHAOS (Tourner)
              </button>
            </div>

            {/* Minimalist Exit Tray */}
            <div className="w-full rounded-2xl bg-neutral-900/60 border border-neutral-800 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400 font-bold">Bac de sortie</span>
                <span className={`font-bold ${isQuotaReached ? "text-[#00FF66]" : "text-[#FF5500]"}`}>
                  {totalSelected} / {selectedSize} capsules
                </span>
              </div>

              <div className="w-full min-h-[36px] rounded-xl bg-neutral-950 border border-neutral-800/80 p-2 flex items-center justify-center gap-1.5 flex-wrap">
                {visualCapsules.length === 0 ? (
                  <span className="text-[11px] text-neutral-500 font-mono italic">
                    Aucune capsule prête
                  </span>
                ) : (
                  <AnimatePresence>
                    {visualCapsules.map((cap, i) => {
                      const catCfg = GACHAPON_CATEGORIES[cap.category];
                      return (
                        <motion.div
                          key={`tray-${cap.id}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs border border-white/20 shrink-0"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, ${catCfg.color}, #09090b 85%)`,
                          }}
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
