"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { User, Keyboard, KeyRound } from "lucide-react";
import { useCart } from "@/context/CartContext";

export type MysteryCategoryKey = "figurines" | "fidgets" | "gadgets";

export interface MysteryCategoryConfig {
  key: MysteryCategoryKey;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGradient: string;
}

export const MYSTERY_CATEGORIES: Record<MysteryCategoryKey, MysteryCategoryConfig> = {
  figurines: {
    key: "figurines",
    name: "Figurines & Animaux",
    icon: User,
    color: "#00F0FF",
    bgGradient: "from-cyan-500 to-blue-600",
  },
  fidgets: {
    key: "fidgets",
    name: "Fidgets & objets à manipuler",
    icon: Keyboard,
    color: "#FF5500",
    bgGradient: "from-orange-500 to-red-600",
  },
  gadgets: {
    key: "gadgets",
    name: "Porte-clés",
    icon: KeyRound,
    color: "#00FF66",
    bgGradient: "from-emerald-400 to-green-600",
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
    price: 10.00,
  },
  {
    count: 6,
    label: "6 Objets",
    price: 15.00,
    badge: "RECOMMANDÉ 🔥",
  },
  {
    count: 10,
    label: "10 Objets",
    price: 20.00,
    badge: "MEGA PACK ⚡",
  },
];

export interface FlyingToken {
  id: string;
  catKey: MysteryCategoryKey;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

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
    gadgets: 2,
  });

  const [isAddedSuccess, setIsAddedSuccess] = useState<boolean>(false);
  const [flyingTokens, setFlyingTokens] = useState<FlyingToken[]>([]);
  const [isPouchShaking, setIsPouchShaking] = useState<boolean>(false);

  // DOM Refs for calculating parabolic arc trajectory
  const containerRef = useRef<HTMLDivElement>(null);
  const pouchTargetRef = useRef<HTMLDivElement>(null);

  // Compute total selected items
  const totalSelected = useMemo(() => {
    return (Object.keys(distribution) as MysteryCategoryKey[]).reduce(
      (sum, cat) => sum + (distribution[cat] || 0),
      0
    );
  }, [distribution]);

  // Compute individual items list for floating mini-cards render
  const individualItems = useMemo(() => {
    const list: Array<{ id: string; catKey: MysteryCategoryKey; indexInCat: number }> = [];
    (Object.keys(distribution) as MysteryCategoryKey[]).forEach((catKey) => {
      const count = distribution[catKey] || 0;
      for (let i = 0; i < count; i++) {
        list.push({
          id: `${catKey}-${i}`,
          catKey,
          indexInCat: i + 1,
        });
      }
    });
    return list;
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

  // Add category item with flying token animation
  const handleAddCategory = (
    catKey: MysteryCategoryKey,
    event?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (totalSelected >= selectedSize) return;

    // Trigger flying token if button click event is available
    if (event && containerRef.current && pouchTargetRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const btnRect = event.currentTarget.getBoundingClientRect();
      const pouchRect = pouchTargetRef.current.getBoundingClientRect();

      // Start position (under the clicked + button)
      const startX = btnRect.left + btnRect.width / 2 - containerRect.left;
      const startY = btnRect.top + btnRect.height / 2 - containerRect.top;

      // Target position (top mouth opening of Kraft pouch)
      const targetX = pouchRect.left + pouchRect.width / 2 - containerRect.left;
      const targetY = pouchRect.top + 45 - containerRect.top;

      const catInfo = MYSTERY_CATEGORIES[catKey];
      const tokenId = `${catKey}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      setFlyingTokens((prev) => [
        ...prev,
        {
          id: tokenId,
          catKey,
          icon: catInfo.icon,
          color: catInfo.color,
          startX,
          startY,
          targetX,
          targetY,
        },
      ]);
    } else {
      // Fallback pouch shake if no event position
      triggerPouchShake();
    }

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

  // Helper to shake pouch
  const triggerPouchShake = useCallback(() => {
    setIsPouchShaking(true);
    setTimeout(() => {
      setIsPouchShaking(false);
    }, 400);
  }, []);

  // Remove flying token when animation lands
  const handleTokenAnimationComplete = (tokenId: string) => {
    setFlyingTokens((prev) => prev.filter((t) => t.id !== tokenId));
    triggerPouchShake();
  };

  // Fill remaining objects randomly with staggered tokens
  const handleRandomFill = () => {
    const categories: MysteryCategoryKey[] = ["figurines", "fidgets", "gadgets"];
    const newDist: Record<MysteryCategoryKey, number> = {
      figurines: 0,
      fidgets: 0,
      gadgets: 0,
    };

    for (let i = 0; i < selectedSize; i++) {
      const randCat = categories[Math.floor(Math.random() * categories.length)];
      newDist[randCat]++;
    }

    setDistribution(newDist);
    setIsAddedSuccess(false);
    triggerPouchShake();
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (totalSelected < selectedSize) return;

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FF5500", "#00F0FF", "#00FF66", "#A855F7", "#FFFFFF"],
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
          image: "/images/pochette-kraft.jpg",
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
    <div
      ref={containerRef}
      className={`w-full max-w-6xl mx-auto font-[family-name:var(--font-plus-jakarta)] relative ${className}`}
    >
      {/* FLYING PARABOLIC TOKENS OVERLAY */}
      <AnimatePresence>
        {flyingTokens.map((token) => (
          <motion.div
            key={token.id}
            initial={{
              x: token.startX,
              y: token.startY,
              scale: 0.7,
              opacity: 1,
            }}
            animate={{
              x: [token.startX, (token.startX + token.targetX) / 2, token.targetX],
              y: [
                token.startY,
                Math.min(token.startY, token.targetY) - 120,
                token.targetY,
              ],
              scale: [0.7, 1.3, 0.4],
              opacity: [1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 0.55,
              ease: "easeInOut",
            }}
            onAnimationComplete={() => handleTokenAnimationComplete(token.id)}
            className="absolute z-50 pointer-events-none w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-2 border-white/90 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              backgroundColor: token.color,
              boxShadow: `0 0 20px ${token.color}`,
            }}
          >
            {(() => {
              const IconComp = token.icon;
              return <IconComp className="w-5 h-5 text-black" />;
            })()}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* LAYOUT GRILLE 2 COLONNES (md:grid-cols-12) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* ========================================================== */}
        {/* COLONNE GAUCHE (md:col-span-5) : CHAMBRE CYBER 3D FULL-SIZE */}
        {/* ========================================================== */}
        <div
          ref={pouchTargetRef}
          className="md:col-span-5 rounded-3xl bento-left-card bg-[#09090b] border-2 border-neutral-800 p-6 sm:p-8 shadow-2xl flex flex-col justify-between items-center relative overflow-hidden min-h-[520px] lg:min-h-[560px] group"
        >
          {/* Plasma Fluid Liquid Level filling the ENTIRE Left Bento Card background */}
          <div
            className="absolute inset-x-0 bottom-0 transition-all duration-700 pointer-events-none z-0"
            style={{
              height: `${(totalSelected / selectedSize) * 100}%`,
              background: isQuotaReached
                ? "linear-gradient(180deg, rgba(0,255,102,0.22) 0%, rgba(0,204,82,0.08) 50%, rgba(0,0,0,0) 100%)"
                : "linear-gradient(180deg, rgba(255,85,0,0.22) 0%, rgba(255,136,0,0.08) 50%, rgba(0,0,0,0) 100%)",
            }}
          />

          {/* Ambient Cyber glow in the background */}
          <div
            className="absolute -top-20 -left-20 w-80 h-80 rounded-full pointer-events-none opacity-30 blur-3xl transition-all duration-700 z-0"
            style={{
              backgroundColor: isQuotaReached ? "#00FF66" : "#FF5500",
            }}
          />

          {/* Holographic Glass Reflection Sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none z-10" />

          {/* Flying Laser Scanner Line across full card height */}
          <motion.div
            animate={{
              y: [0, 480, 0],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-x-0 h-1 z-10 pointer-events-none"
            style={{
              background: isQuotaReached
                ? "linear-gradient(90deg, transparent, #00FF66, transparent)"
                : "linear-gradient(90deg, transparent, #FF5500, transparent)",
              boxShadow: isQuotaReached
                ? "0 0 20px #00FF66"
                : "0 0 20px #FF5500",
            }}
          />

          {/* EN-TÊTE SUPÉRIEUR : TOP CAP DU SYSTÈME */}
          <div className="w-full flex items-center justify-between z-20 pb-4 border-b border-neutral-800/90">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isQuotaReached ? "bg-[#00FF66] animate-ping" : "bg-[#FF5500]"}`} />
              <span className="text-xs sm:text-sm font-[family-name:var(--font-antonio)] font-extrabold uppercase tracking-widest text-white">
                CAPSULE SURPRISE 3D
              </span>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-gray-200 font-extrabold shadow-sm">
              {totalSelected}/{selectedSize} OBJETS
            </span>
          </div>

          {/* RUBAN / STICKER FLOTTANT SCELLÉ SI QUOTA ATTEINT */}
          <AnimatePresence>
            {isQuotaReached && (
              <motion.div
                initial={{ scale: 2, opacity: 0, y: -20, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, y: 0, rotate: -2 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 22 }}
                className="z-30 my-2 px-5 py-2 bg-gradient-to-r from-[#00FF66] via-[#00cc52] to-[#00FF66] text-black font-black text-xs sm:text-sm font-[family-name:var(--font-antonio)] uppercase tracking-widest rounded-2xl shadow-[0_0_35px_rgba(0,255,102,0.9)] border-2 border-white flex items-center gap-2 select-none"
              >
                <span className="text-base">🔒</span>
                <span>CAPSULE SCELLÉE & PRÊTE !</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ZONE CENTRALE SPACIEUSE : MINI-CARDS FLOTTANTES ANIMÉES DE CHAQUE OBJET */}
          <div className="relative z-20 w-full flex-1 my-4 flex flex-col items-center justify-center min-h-[240px]">
            <div className="w-full max-w-md flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 p-2">
              <AnimatePresence>
                {individualItems.map((item, idx) => {
                  const cat = MYSTERY_CATEGORIES[item.catKey];
                  const IconComp = cat.icon;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ scale: 0, y: 30, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        y: [0, -8, 3, -6, 0],
                        rotate: [-2, 2, -1, 2.5, -2],
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        scale: { duration: 0.35 },
                        y: { duration: 3.2 + (idx % 3) * 0.4, repeat: Infinity, ease: "easeInOut", delay: (idx % 4) * 0.15 },
                        rotate: { duration: 4.2 + (idx % 2) * 0.5, repeat: Infinity, ease: "easeInOut", delay: (idx % 4) * 0.1 },
                      }}
                      whileHover={{ scale: 1.12, rotate: 0, zIndex: 30 }}
                      className="w-22 sm:w-26 py-3 px-2 rounded-2xl bg-neutral-950/95 border-2 text-white shadow-xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer backdrop-blur-md transition-all select-none group"
                      style={{
                        boxShadow: `0 0 22px ${cat.color}45, inset 0 1px 0 rgba(255,255,255,0.15)`,
                        borderColor: `${cat.color}90`,
                      }}
                    >
                      {/* Picto en haut */}
                      <div
                        className="p-2 sm:p-2.5 rounded-xl border border-white/20 shadow-inner shrink-0 transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: `${cat.color}25`,
                          color: cat.color,
                        }}
                      >
                        <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      
                      {/* Texte en dessous */}
                      <span className="font-extrabold text-xs sm:text-xs text-white leading-tight truncate max-w-full">
                        {cat.name.split(" ")[0]}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {totalSelected === 0 && (
                <div className="flex flex-col items-center justify-center text-center gap-3 py-8 opacity-70">
                  <span className="text-4xl animate-bounce">⚡</span>
                  <span className="text-xs sm:text-sm text-gray-300 font-semibold max-w-[220px]">
                    Sélectionne tes catégories à droite pour charger la capsule 3D...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* PIED SUPÉRIEUR : INFOS DE SCELLAGE & RÉASSURANCE */}
          <div className="w-full z-20 pt-4 border-t border-neutral-800/90 flex items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-gray-400">
              SPOOLIO 3D VAULT
            </span>
            <span className={`text-xs font-mono font-extrabold ${isQuotaReached ? "text-[#00FF66]" : "text-[#FF5500]"}`}>
              {Math.round((totalSelected / selectedSize) * 100)}% CHARGÉ
            </span>
          </div>
        </div>

        {/* ========================================================== */}
        {/* COLONNE DROITE (md:col-span-7) : CONFIGURATEUR ET DOSAGE  */}
        {/* ========================================================== */}
        <div className="md:col-span-7 rounded-3xl bento-right-card bg-[#09090b] border border-neutral-800 p-6 sm:p-8 shadow-xl flex flex-col gap-6">
          
          {/* 1. EN-TÊTE & PROGRESSION */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div>
              <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-antonio)] font-bold uppercase tracking-wide text-white">
                Pochette Surprise Sur-Mesure
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1">
                Choisis le nombre d’objets et dose tes univers 3D
              </p>
            </div>

            {/* Barre de charge / Compteur */}
            <div className="flex flex-col items-end gap-1.5 self-start sm:self-auto">
              <span
                className={`text-xs font-bold font-[family-name:var(--font-plus-jakarta)] ${
                  isQuotaReached ? "text-[#00FF66] price-tag" : "text-[#FF5500]"
                }`}
              >
                {totalSelected} / {selectedSize} objets sélectionnés
              </span>
              <div className="w-36 h-2.5 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#FF5500] to-[#00FF66]"
                  style={{ width: `${(totalSelected / selectedSize) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. ÉTAPE 1 - SELECTION DE TAILLE (3 Onglets Simples Alignés) */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-[family-name:var(--font-antonio)] font-bold uppercase tracking-wider text-gray-400">
              1. Choisis la taille de la pochette
            </label>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {MYSTERY_SIZES.map((sizeOpt) => {
                const isSelected = selectedSize === sizeOpt.count;
                return (
                  <button
                    key={sizeOpt.count}
                    type="button"
                    onClick={() => handleSelectSize(sizeOpt.count)}
                    className={`relative py-3 px-1.5 sm:py-4 sm:px-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1 ${
                      isSelected
                        ? "bg-neutral-900 border-2 border-[#FF5500] shadow-md"
                        : "size-tab-unselected bg-neutral-900/40 border border-neutral-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {/* Badge RECOMMANDÉ & MEGA PACK */}
                    {sizeOpt.badge && (
                      <span className="absolute -top-3 px-2 sm:px-2.5 py-0.5 rounded-full bg-[#FF5500] text-black font-extrabold text-[9px] sm:text-[10px] font-[family-name:var(--font-antonio)] uppercase tracking-wider shadow-md z-10 whitespace-nowrap">
                        {sizeOpt.badge}
                      </span>
                    )}
                    <span
                      className="text-sm sm:text-base md:text-lg font-bold font-[family-name:var(--font-plus-jakarta)]"
                      style={{ color: isSelected ? "#ffffff" : undefined }}
                    >
                      {sizeOpt.label}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-extrabold font-[family-name:var(--font-antonio)] price-tag ${
                        isSelected ? "text-[#00FF66]" : "text-[#00FF66]"
                      }`}
                    >
                      {sizeOpt.price.toFixed(2)} €
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. ÉTAPE 2 - DOSAGE (Liste Verticale avec boutons [ + ] animés) */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-[family-name:var(--font-antonio)] font-bold uppercase tracking-wider text-gray-400">
              2. Dose la répartition des catégories
            </label>

            <div className="flex flex-col gap-2.5 sm:gap-3">
              {(Object.keys(MYSTERY_CATEGORIES) as MysteryCategoryKey[]).map((catKey) => {
                const cat = MYSTERY_CATEGORIES[catKey];
                const count = distribution[catKey] || 0;
                const isMaxReached = totalSelected >= selectedSize;

                return (
                  <div
                    key={cat.key}
                    className="category-card rounded-2xl p-3 sm:p-4 bg-neutral-900/40 border border-neutral-800 flex items-center justify-between gap-2 sm:gap-4 transition-colors hover:border-neutral-700"
                  >
                    {/* Icône Lucide + Nom à gauche */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      {(() => {
                        const IconComp = cat.icon;
                        return (
                          <div
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-sm transition-transform duration-300 group-hover:scale-105"
                            style={{
                              backgroundColor: `${cat.color}18`,
                              borderColor: `${cat.color}35`,
                              color: cat.color,
                            }}
                          >
                            <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        );
                      })()}
                      <span className="text-xs sm:text-sm md:text-base font-bold text-white leading-snug break-words">
                        {cat.name}
                      </span>
                    </div>

                    {/* Compteur Simple [ - ] COUNT [ + ] */}
                    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(catKey)}
                        disabled={count <= 0}
                        className="btn-minus w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 disabled:opacity-20 disabled:pointer-events-none text-white font-bold text-lg sm:text-xl flex items-center justify-center cursor-pointer transition-colors"
                        title="Moins"
                      >
                        -
                      </button>

                      <span className="w-5 sm:w-6 text-center font-extrabold text-sm sm:text-base font-[family-name:var(--font-plus-jakarta)] text-white">
                        {count}
                      </span>

                      {/* Bouton [ + ] qui lance le jeton vers la pochette */}
                      <button
                        type="button"
                        onClick={(e) => handleAddCategory(catKey, e)}
                        disabled={isMaxReached}
                        className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#FF5500] hover:bg-[#ff661a] border border-[#FF5500] disabled:opacity-20 disabled:pointer-events-none text-black font-extrabold text-lg sm:text-xl flex items-center justify-center cursor-pointer transition-all shadow-sm active:scale-95"
                        title="Ajouter au sachet"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. ÉTAPE 3 - ACTIONS (Remplir au hasard & Bouton Fluo Clignotant) */}
          <div className="flex flex-col gap-3 pt-4 border-t border-neutral-800">
            
            {/* Bouton Remplir au hasard */}
            <button
              type="button"
              onClick={handleRandomFill}
              className="btn-random w-full py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-gray-200 hover:text-white font-[family-name:var(--font-antonio)] font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>🎲 REMPLIR AU HASARD</span>
            </button>

            {/* Gros Bouton Principal Orange Spoolio - Fluo Clignotant quand Quota Atteint */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isQuotaReached}
              className={`w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl font-[family-name:var(--font-antonio)] font-extrabold text-xs sm:text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isQuotaReached
                  ? "bg-[#FF5500] hover:bg-[#ff661a] text-black shadow-[0_0_30px_rgba(255,85,0,0.6)] animate-pulse border-2 border-amber-300 hover:scale-[1.02]"
                  : "bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed"
              }`}
            >
              {isQuotaReached ? (
                <span>AJOUTER AU PANIER • {currentSizeObj.price.toFixed(2)} € 🛒</span>
              ) : (
                <span>CHOISIS ENCORE {remainingCount} OBJET(S)...</span>
              )}
            </button>

            <div className="flex items-center justify-center text-center mt-1">
              <span className="text-xs font-[family-name:var(--font-plus-jakarta)] text-gray-400">
                Matière PLA Biosourcé • Fabriqué à Comines 🇫🇷
              </span>
            </div>

            {/* Toast Succès */}
            <AnimatePresence>
              {isAddedSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-xl bg-[#00FF66]/15 border border-[#00FF66]/30 text-[#00FF66] text-center font-bold text-xs font-[family-name:var(--font-plus-jakarta)]"
                >
                  🎉 Pochette surprise ajoutée avec succès à ton panier !
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}

