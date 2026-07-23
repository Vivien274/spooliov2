"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useCart } from "@/context/CartContext";

export type MysteryCategoryKey = "figurines" | "fidgets" | "gadgets" | "jeux";

export interface MysteryCategoryConfig {
  key: MysteryCategoryKey;
  name: string;
  icon: string;
  colorStart: string;
  colorEnd: string;
  accentClass: string;
}

export const MYSTERY_CATEGORIES: Record<MysteryCategoryKey, MysteryCategoryConfig> = {
  figurines: {
    key: "figurines",
    name: "Figurines & Animaux Articulés",
    icon: "🐉",
    colorStart: "#00F0FF",
    colorEnd: "#0077FF",
    accentClass: "border-[#00F0FF]/40 text-[#00F0FF]",
  },
  fidgets: {
    key: "fidgets",
    name: "Fidgets & Stimulation",
    icon: "⌨️",
    colorStart: "#FF5500",
    colorEnd: "#FF8800",
    accentClass: "border-[#FF5500]/40 text-[#FF5500]",
  },
  gadgets: {
    key: "gadgets",
    name: "Porte-clés & Gadgets",
    icon: "🗝️",
    colorStart: "#00FF66",
    colorEnd: "#009933",
    accentClass: "border-[#00FF66]/40 text-[#00FF66]",
  },
  jeux: {
    key: "jeux",
    name: "Mini-jeux & Décoration",
    icon: "🎲",
    colorStart: "#10B981",
    colorEnd: "#059669",
    accentClass: "border-[#10B981]/40 text-[#10B981]",
  },
};

export interface MysterySizeOption {
  count: number;
  label: string;
  price: number;
  badge?: string;
}

export const MYSTERY_SIZES: MysterySizeOption[] = [
  {
    count: 3,
    label: "3 Objets",
    price: 12.90,
  },
  {
    count: 6,
    label: "6 Objets",
    price: 21.90,
    badge: "RECOMMANDÉ 🔥",
  },
  {
    count: 10,
    label: "10 Objets",
    price: 34.90,
    badge: "MEGA PACK ⚡",
  },
];

export interface MysteryPackConfiguratorProps {
  onAddToCart?: (config: {
    size: number;
    distribution: Record<MysteryCategoryKey, number>;
    totalPrice: number;
  }) => void;
  className?: string;
}

interface LoadedSlotItem {
  id: string;
  category: MysteryCategoryKey;
  slotIndex: number;
}

export default function MysteryPackConfigurator({
  onAddToCart,
  className = "",
}: MysteryPackConfiguratorProps) {
  // Safe cart context
  let cartContext: ReturnType<typeof useCart> | null = null;
  try {
    cartContext = useCart();
  } catch (e) {
    // Fallback if rendered outside CartProvider
  }

  const [selectedSize, setSelectedSize] = useState<number>(6);
  const [distribution, setDistribution] = useState<Record<MysteryCategoryKey, number>>({
    figurines: 2,
    fidgets: 2,
    gadgets: 1,
    jeux: 1,
  });

  const [isAddedSuccess, setIsAddedSuccess] = useState<boolean>(false);

  // Compute total selected items
  const totalSelected = useMemo(() => {
    return (Object.keys(distribution) as MysteryCategoryKey[]).reduce(
      (sum, cat) => sum + (distribution[cat] || 0),
      0
    );
  }, [distribution]);

  // Current size config
  const currentSizeObj = useMemo(() => {
    return MYSTERY_SIZES.find((s) => s.count === selectedSize) || MYSTERY_SIZES[1];
  }, [selectedSize]);

  // Array of loaded slot items to display in the rack
  const loadedSlots = useMemo(() => {
    const list: LoadedSlotItem[] = [];
    let idx = 0;

    (Object.keys(distribution) as MysteryCategoryKey[]).forEach((cat) => {
      const count = distribution[cat] || 0;
      for (let i = 0; i < count; i++) {
        list.push({
          id: `${cat}-${i}-${idx}`,
          category: cat,
          slotIndex: idx,
        });
        idx++;
      }
    });

    return list;
  }, [distribution]);

  // Handle changing size tabs
  const handleSelectSize = (newSize: number) => {
    setSelectedSize(newSize);
    setIsAddedSuccess(false);

    if (totalSelected > newSize) {
      let excess = totalSelected - newSize;
      const newDist = { ...distribution };
      const categories = Object.keys(newDist) as MysteryCategoryKey[];

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

  // Increment category item
  const handleAddCategory = (catKey: MysteryCategoryKey) => {
    if (totalSelected >= selectedSize) return;
    setDistribution((prev) => ({
      ...prev,
      [catKey]: (prev[catKey] || 0) + 1,
    }));
    setIsAddedSuccess(false);
  };

  // Decrement category item
  const handleRemoveCategory = (catKey: MysteryCategoryKey) => {
    if ((distribution[catKey] || 0) <= 0) return;
    setDistribution((prev) => ({
      ...prev,
      [catKey]: Math.max(0, (prev[catKey] || 0) - 1),
    }));
    setIsAddedSuccess(false);
  };

  // Random fill (Mode Chaos)
  const handleRandomFill = () => {
    const categories: MysteryCategoryKey[] = ["figurines", "fidgets", "gadgets", "jeux"];
    const newDist: Record<MysteryCategoryKey, number> = {
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
    setIsAddedSuccess(false);
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (totalSelected < selectedSize) return;

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FF5500", "#00F0FF", "#00FF66", "#10B981", "#FFFFFF"],
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
      const summaryText = (Object.keys(distribution) as MysteryCategoryKey[])
        .filter((cat) => distribution[cat] > 0)
        .map((cat) => `${distribution[cat]}x ${MYSTERY_CATEGORIES[cat].name.split(" ")[0]}`)
        .join(", ");

      cartContext.addToCart(
        {
          productId: 8888 + selectedSize,
          name: `Pochette Surprise Spoolio (${selectedSize} objets)`,
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
    <div className={`no-invert w-full max-w-5xl mx-auto font-[family-name:var(--font-plus-jakarta)] text-white ${className}`}>
      {/* Container Principal Bento Dark Mode */}
      <div className="rounded-3xl bg-[#09090b] border border-neutral-800 p-6 md:p-8 shadow-2xl flex flex-col gap-8">
        
        {/* 1. EN-TÊTE & RACK DE CHARGEMENT BENTO */}
        <div className="flex flex-col gap-6 p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          
          {/* Header Title & Selector Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-neutral-800">
            <div>
              <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-antonio)] font-bold uppercase tracking-wide text-white flex items-center gap-3">
                <span>Baie de Chargement Pochette</span>
                <span className="text-xl px-2 py-0.5 rounded-lg bg-neutral-800 border border-neutral-700 text-[#FF5500] font-mono text-xs font-bold">
                  SPOOLIO-3D
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-1">
                Sélectionne la taille et dose tes univers préférés
              </p>
            </div>

            {/* Onglets de sélection de Taille */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-neutral-950 border border-neutral-800 self-start lg:self-auto overflow-x-auto max-w-full">
              {MYSTERY_SIZES.map((sizeOpt) => {
                const isSelected = selectedSize === sizeOpt.count;
                return (
                  <button
                    key={sizeOpt.count}
                    type="button"
                    onClick={() => handleSelectSize(sizeOpt.count)}
                    className={`relative px-4 py-2.5 rounded-lg text-xs sm:text-sm font-[family-name:var(--font-antonio)] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                      isSelected
                        ? "bg-[#FF5500] text-black font-extrabold shadow-md"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    }`}
                  >
                    <span>{sizeOpt.label}</span>
                    <span className={`font-mono text-xs ${isSelected ? "text-black/80 font-bold" : "text-neutral-500"}`}>
                      • {sizeOpt.price.toFixed(2)} €
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jauge LED & Display Visual Rack */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-neutral-400 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${isQuotaReached ? "bg-[#00FF66]" : "bg-[#FF5500]"}`} />
                STATUT DU RACK :
              </span>
              <span className={`font-bold text-sm ${isQuotaReached ? "text-[#00FF66]" : "text-[#FF5500]"}`}>
                {totalSelected} / {selectedSize} SLOTS CHARGÉS
              </span>
            </div>

            {/* Ligne des Y Slots / Cases Vides qui se remplissent avec des cartouches animées */}
            <div className="grid gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-neutral-950 border border-neutral-850" style={{
              gridTemplateColumns: `repeat(${selectedSize}, minmax(0, 1fr))`
            }}>
              {Array.from({ length: selectedSize }).map((_, slotIdx) => {
                const loadedItem = loadedSlots[slotIdx];
                const catCfg = loadedItem ? MYSTERY_CATEGORIES[loadedItem.category] : null;

                return (
                  <div
                    key={`slot-${slotIdx}`}
                    className="relative aspect-square rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30 flex items-center justify-center overflow-hidden transition-all"
                  >
                    {/* Numéro de slot en filigrane si vide */}
                    {!loadedItem && (
                      <span className="text-[10px] sm:text-xs font-mono text-neutral-700 font-bold select-none">
                        #{slotIdx + 1}
                      </span>
                    )}

                    {/* Cartouche / Pod de couleur remplie si objet présent */}
                    <AnimatePresence>
                      {loadedItem && catCfg && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0, y: 15 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 350, damping: 20 }}
                          className="absolute inset-1 rounded-lg flex flex-col items-center justify-center p-1 border border-white/20 shadow-md"
                          style={{
                            background: `linear-gradient(135deg, ${catCfg.colorStart}, ${catCfg.colorEnd})`,
                          }}
                        >
                          <span className="text-base sm:text-xl drop-shadow-sm select-none">
                            {catCfg.icon}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* 2. PANNEAU DE DOSAGE (Grille 2x2 Bento) */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-[family-name:var(--font-antonio)] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-neutral-800 text-white text-[11px] flex items-center justify-center font-bold font-[family-name:var(--font-plus-jakarta)]">2</span>
            Doser la répartition des univers
          </h3>

          {/* Grille 2x2 Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(MYSTERY_CATEGORIES) as MysteryCategoryKey[]).map((catKey) => {
              const cat = MYSTERY_CATEGORIES[catKey];
              const count = distribution[catKey] || 0;
              const isMaxReached = totalSelected >= selectedSize;

              return (
                <div
                  key={cat.key}
                  className="rounded-2xl p-4 sm:p-5 bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 transition-all flex items-center justify-between gap-4 group"
                >
                  {/* Icône + Nom */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border border-white/10 shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${cat.colorStart}25, ${cat.colorEnd}40)`,
                      }}
                    >
                      <span>{cat.icon}</span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-white truncate">
                      {cat.name}
                    </span>
                  </div>

                  {/* Hardware Switch Controller [ - ] [ Nombre ] [ + ] */}
                  <div className="flex items-center gap-2 shrink-0 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(catKey)}
                      disabled={count <= 0}
                      className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 disabled:opacity-20 disabled:pointer-events-none text-white font-bold text-base flex items-center justify-center cursor-pointer transition-colors"
                      title="Diminuer"
                    >
                      -
                    </button>

                    <span className="w-6 text-center font-mono font-extrabold text-sm text-white">
                      {count}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAddCategory(catKey)}
                      disabled={isMaxReached}
                      className="w-8 h-8 rounded-lg border disabled:opacity-20 disabled:pointer-events-none text-black font-bold text-base flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                      style={{
                        backgroundColor: cat.colorEnd,
                        borderColor: cat.colorEnd,
                      }}
                      title="Augmenter"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. BARRE D'ACTION BASSE (Boutons Aléatoire + Injection Panier) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-neutral-800">
          {/* Bouton Remplissage Aléatoire */}
          <button
            type="button"
            onClick={handleRandomFill}
            className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white font-[family-name:var(--font-antonio)] text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>🎲 REMPLISSAGE ALÉATOIRE</span>
          </button>

          {/* Bouton Principal Ajouter au Panier */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isQuotaReached}
            className={`w-full py-4 px-6 rounded-xl font-[family-name:var(--font-antonio)] font-extrabold text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isQuotaReached
                ? "bg-[#FF5500] hover:bg-[#ff661a] text-black shadow-lg shadow-[#FF5500]/25 hover:scale-[1.01]"
                : "bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed"
            }`}
          >
            {isQuotaReached ? (
              <span>INJECTER LA POCHETTE AU PANIER • {currentSizeObj.price.toFixed(2)} € 🛒</span>
            ) : (
              <span>CHOISIS ENCORE {remainingCount} OBJET(S)...</span>
            )}
          </button>
        </div>

        {/* Toast Succès */}
        <AnimatePresence>
          {isAddedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-xl bg-[#00FF66]/15 border border-[#00FF66]/30 text-[#00FF66] text-center font-bold text-xs sm:text-sm font-[family-name:var(--font-plus-jakarta)]"
            >
              🎉 Pochette de {selectedSize} objets ajoutée avec succès à ton panier !
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
