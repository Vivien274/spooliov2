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
}

export const MYSTERY_CATEGORIES: Record<MysteryCategoryKey, MysteryCategoryConfig> = {
  figurines: {
    key: "figurines",
    name: "Figurines & Animaux",
    icon: "🐉",
  },
  fidgets: {
    key: "fidgets",
    name: "Fidgets & Stimulation",
    icon: "⌨️",
  },
  gadgets: {
    key: "gadgets",
    name: "Porte-clés & Gadgets",
    icon: "🗝️",
  },
  jeux: {
    key: "jeux",
    name: "Mini-jeux & Déco",
    icon: "🎲",
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

  // Current selected size object
  const currentSizeObj = useMemo(() => {
    return MYSTERY_SIZES.find((s) => s.count === selectedSize) || MYSTERY_SIZES[1];
  }, [selectedSize]);

  // Handle changing size
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

  // Add category item
  const handleAddCategory = (catKey: MysteryCategoryKey) => {
    if (totalSelected >= selectedSize) return;
    setDistribution((prev) => ({
      ...prev,
      [catKey]: (prev[catKey] || 0) + 1,
    }));
    setIsAddedSuccess(false);
  };

  // Remove category item
  const handleRemoveCategory = (catKey: MysteryCategoryKey) => {
    if ((distribution[catKey] || 0) <= 0) return;
    setDistribution((prev) => ({
      ...prev,
      [catKey]: Math.max(0, (prev[catKey] || 0) - 1),
    }));
    setIsAddedSuccess(false);
  };

  // Fill remaining objects randomly
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
        particleCount: 110,
        spread: 75,
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
    <div className={`no-invert w-full max-w-3xl mx-auto font-[family-name:var(--font-plus-jakarta)] text-white ${className}`}>
      {/* Unique Conteneur Bento Sombre Minimaliste */}
      <div className="rounded-3xl bg-[#09090b] border border-neutral-800 p-6 sm:p-8 shadow-xl flex flex-col gap-7">
        
        {/* 1. EN-TÊTE & PROGRESSION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-antonio)] font-bold uppercase tracking-wide text-white">
              Pochette Surprise Sur-Mesure
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-1">
              Choisis le nombre d’objets et dose tes univers 3D
            </p>
          </div>

          {/* Barre de charge / Compteur simple */}
          <div className="flex flex-col items-end gap-1.5 self-start sm:self-auto">
            <span className={`text-xs font-mono font-bold ${isQuotaReached ? "text-[#00FF66]" : "text-[#FF5500]"}`}>
              {totalSelected} / {selectedSize} objets sélectionnés
            </span>
            <div className="w-36 h-2 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#FF5500] to-[#00FF66]"
                style={{ width: `${(totalSelected / selectedSize) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. ÉTAPE 1 - SELECTION DE TAILLE (3 Onglets Simples Alignés) */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-[family-name:var(--font-antonio)] font-bold uppercase tracking-wider text-neutral-400">
            1. Choisis la taille de la pochette
          </label>

          <div className="grid grid-cols-3 gap-2.5">
            {MYSTERY_SIZES.map((sizeOpt) => {
              const isSelected = selectedSize === sizeOpt.count;
              return (
                <button
                  key={sizeOpt.count}
                  type="button"
                  onClick={() => handleSelectSize(sizeOpt.count)}
                  className={`relative py-3 px-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1 ${
                    isSelected
                      ? "bg-neutral-900 border-[#FF5500] text-white shadow-md"
                      : "bg-neutral-900/30 hover:bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white opacity-80 hover:opacity-100"
                  }`}
                >
                  {sizeOpt.badge && (
                    <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-[#FF5500] text-black font-extrabold text-[8px] font-[family-name:var(--font-antonio)] uppercase tracking-wider">
                      {sizeOpt.badge}
                    </span>
                  )}
                  <span className="text-sm sm:text-base font-bold font-[family-name:var(--font-plus-jakarta)]">
                    {sizeOpt.label}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#00FF66]">
                    {sizeOpt.price.toFixed(2)} €
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. ÉTAPE 2 - DOSAGE (Liste Verticale Propre) */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-[family-name:var(--font-antonio)] font-bold uppercase tracking-wider text-neutral-400">
            2. Dose la répartition des catégories
          </label>

          <div className="flex flex-col gap-2.5">
            {(Object.keys(MYSTERY_CATEGORIES) as MysteryCategoryKey[]).map((catKey) => {
              const cat = MYSTERY_CATEGORIES[catKey];
              const count = distribution[catKey] || 0;
              const isMaxReached = totalSelected >= selectedSize;

              return (
                <div
                  key={cat.key}
                  className="rounded-2xl p-3.5 bg-neutral-900/40 border border-neutral-800 flex items-center justify-between gap-4 transition-colors hover:border-neutral-700"
                >
                  {/* Icône + Nom à gauche */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0 select-none">{cat.icon}</span>
                    <span className="text-sm font-bold text-white truncate">
                      {cat.name}
                    </span>
                  </div>

                  {/* Compteur Simple [ - ] COUNT [ + ] à droite */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(catKey)}
                      disabled={count <= 0}
                      className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 disabled:opacity-20 disabled:pointer-events-none text-white font-bold text-base flex items-center justify-center cursor-pointer transition-colors"
                      title="Moins"
                    >
                      -
                    </button>

                    <span className="w-5 text-center font-mono font-bold text-sm text-white">
                      {count}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAddCategory(catKey)}
                      disabled={isMaxReached}
                      className="w-8 h-8 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] border border-[#FF5500] disabled:opacity-20 disabled:pointer-events-none text-black font-extrabold text-base flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                      title="Plus"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. ÉTAPE 3 - ACTION BASSE */}
        <div className="flex flex-col gap-3 pt-4 border-t border-neutral-800">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Bouton discret Remplir au hasard */}
            <button
              type="button"
              onClick={handleRandomFill}
              className="text-xs font-mono font-semibold text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer py-1"
            >
              <span>🎲 Remplir au hasard</span>
            </button>

            <span className="text-xs font-mono text-neutral-500">
              Matière PLA Biosourcé • Fabriqué à Comines 🇫🇷
            </span>
          </div>

          {/* Gros Bouton Principal Orange Spoolio */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isQuotaReached}
            className={`w-full py-4 px-6 rounded-2xl font-[family-name:var(--font-antonio)] font-extrabold text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isQuotaReached
                ? "bg-[#FF5500] hover:bg-[#ff661a] text-black shadow-lg shadow-[#FF5500]/25 hover:scale-[1.01]"
                : "bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed"
            }`}
          >
            {isQuotaReached ? (
              <span>AJOUTER AU PANIER • {currentSizeObj.price.toFixed(2)} € 🛒</span>
            ) : (
              <span>CHOISIS ENCORE {remainingCount} OBJET(S)...</span>
            )}
          </button>

          {/* Toast Succès */}
          <AnimatePresence>
            {isAddedSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-xl bg-[#00FF66]/15 border border-[#00FF66]/30 text-[#00FF66] text-center font-bold text-xs font-[family-name:var(--font-plus-jakarta)] mt-1"
              >
                🎉 Pochette surprise ajoutée avec succès à ton panier !
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
