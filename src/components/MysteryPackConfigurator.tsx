"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useCart } from "@/context/CartContext";

export type MysteryCategoryKey = "figurines" | "fidgets" | "gadgets" | "jeux";

export interface MysteryCategoryConfig {
  key: MysteryCategoryKey;
  name: string;
  icon: string;
  color: string;
  bgGradient: string;
}

export const MYSTERY_CATEGORIES: Record<MysteryCategoryKey, MysteryCategoryConfig> = {
  figurines: {
    key: "figurines",
    name: "Figurines & Animaux",
    icon: "🐉",
    color: "#00F0FF",
    bgGradient: "from-cyan-500 to-blue-600",
  },
  fidgets: {
    key: "fidgets",
    name: "Fidgets & Stimulation",
    icon: "⌨️",
    color: "#FF5500",
    bgGradient: "from-orange-500 to-red-600",
  },
  gadgets: {
    key: "gadgets",
    name: "Porte-clés & Gadgets",
    icon: "🗝️",
    color: "#00FF66",
    bgGradient: "from-emerald-400 to-green-600",
  },
  jeux: {
    key: "jeux",
    name: "Mini-jeux & Déco",
    icon: "🎲",
    color: "#A855F7",
    bgGradient: "from-purple-500 to-indigo-600",
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
  icon: string;
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
    gadgets: 1,
    jeux: 1,
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
            className="absolute z-50 pointer-events-none w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-xl border-2 border-white/90 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              backgroundColor: token.color,
              boxShadow: `0 0 20px ${token.color}`,
            }}
          >
            <span>{token.icon}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* LAYOUT GRILLE 2 COLONNES (md:grid-cols-12) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* ========================================================== */}
        {/* COLONNE GAUCHE (md:col-span-5) : BLOC BENTO SACHET KRAFT  */}
        {/* ========================================================== */}
        <div className="md:col-span-5 rounded-3xl bento-left-card bg-[#09090b]/90 backdrop-blur-md border border-neutral-800/80 p-6 sm:p-7 shadow-2xl flex flex-col justify-between items-center relative overflow-hidden min-h-[520px]">
          {/* Ambience background glow */}
          <div
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none opacity-20 blur-3xl transition-all duration-500"
            style={{
              backgroundColor: isQuotaReached ? "#00FF66" : "#FF5500",
            }}
          />

          {/* En-tête Bento Gauche */}
          <div className="w-full flex items-center justify-between z-10 pb-3 border-b border-neutral-800/80">
            <span className="text-xs font-[family-name:var(--font-antonio)] font-bold uppercase tracking-wider text-gray-400">
              Pochette Kraft Spoolio
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bento-badge bg-neutral-900 border border-neutral-800 text-gray-300 font-bold">
              {totalSelected}/{selectedSize} OBJETS
            </span>
          </div>

          {/* Zone Centrale Vector Pouch & animations */}
          <div
            ref={pouchTargetRef}
            className="relative my-4 flex flex-col items-center justify-center w-full"
          >
            {/* STICKER ORANGE SPOOLIO FLOTTANT DE SCELLAGE SI QUOTA ATTEINT */}
            <AnimatePresence>
              {isQuotaReached && (
                <motion.div
                  initial={{ scale: 2.2, opacity: 0, y: -30, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, y: 0, rotate: -4 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 450, damping: 22 }}
                  className="absolute -top-3 z-30 px-3.5 py-1.5 bg-gradient-to-r from-[#FF5500] via-[#ff661a] to-[#FF5500] text-black font-black text-xs font-[family-name:var(--font-antonio)] uppercase tracking-widest rounded-xl shadow-[0_0_25px_rgba(255,85,0,0.85)] border-2 border-amber-300 flex items-center gap-1.5 select-none"
                >
                  <span className="text-sm">🔒</span>
                  <span>POCHETTE COMPLÈTE</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ILLUSTRATION VECTORIELLE DE LA POCHETTE KRAFT AVEC SHAKE ANIMATION */}
            <motion.div
              animate={
                isPouchShaking
                  ? {
                      y: [0, -8, 5, -3, 2, 0],
                      rotate: [0, -3, 3, -2, 1, 0],
                      scale: [1, 1.04, 0.97, 1.02, 1],
                    }
                  : { y: 0, rotate: 0, scale: 1 }
              }
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative w-full max-w-[220px] h-64 sm:h-72 flex items-center justify-center cursor-pointer"
            >
              {/* Inline SVG Vector Kraft Bag */}
              <svg
                viewBox="0 0 240 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)] select-none"
              >
                <defs>
                  {/* Kraft Paper Base Gradient */}
                  <linearGradient id="kraftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D99B66" />
                    <stop offset="50%" stopColor="#C4844F" />
                    <stop offset="100%" stopColor="#9E6131" />
                  </linearGradient>

                  {/* Inner Pocket Cavity */}
                  <linearGradient id="innerCavity" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1A0F08" />
                    <stop offset="100%" stopColor="#382212" />
                  </linearGradient>

                  {/* Spoolio Orange Sticker Gradient */}
                  <linearGradient id="stickerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF661A" />
                    <stop offset="100%" stopColor="#FF3300" />
                  </linearGradient>

                  {/* Glowing filter for sticker when quota reached */}
                  <filter id="stickerGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#FF5500" floodOpacity="0.8" />
                  </filter>
                </defs>

                {/* Inner Cavity (Opening Mouth where tokens drop) */}
                <ellipse cx="120" cy="55" rx="75" ry="22" fill="url(#innerCavity)" stroke="#613B1B" strokeWidth="2" />

                {/* Kraft Bag Main Body */}
                <path
                  d="M45 55 C 45 42, 195 42, 195 55 L 185 270 C 185 282, 55 282, 55 270 Z"
                  fill="url(#kraftGradient)"
                  stroke="#2E1B0D"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />

                {/* Front Opening Mouth Rim */}
                <path
                  d="M45 55 C 65 70, 175 70, 195 55 C 175 60, 65 60, 45 55 Z"
                  fill="#B87B48"
                  stroke="#472A14"
                  strokeWidth="2"
                />

                {/* Fold lines / fine line-art */}
                <path d="M55 70 L 62 265" stroke="#7E4A21" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                <path d="M185 70 L 178 265" stroke="#7E4A21" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                <path d="M120 70 L 120 270" stroke="#7E4A21" strokeWidth="1" opacity="0.25" />

                {/* Bottom fold line */}
                <path d="M55 250 C 90 262, 150 262, 185 250" stroke="#523016" strokeWidth="2" fill="none" opacity="0.5" />

                {/* STICKER ORANGE SPOOLIO CENTERED ON VECTOR KRAFT BAG */}
                <g transform="translate(120, 160)">
                  <rect
                    x="-55"
                    y="-30"
                    width="110"
                    height="60"
                    rx="12"
                    fill="url(#stickerGradient)"
                    stroke={isQuotaReached ? "#FFE600" : "#29180D"}
                    strokeWidth={isQuotaReached ? "2.5" : "1.5"}
                    filter={isQuotaReached ? "url(#stickerGlow)" : undefined}
                  />

                  {/* Inner Dashed Border */}
                  <rect
                    x="-50"
                    y="-25"
                    width="100"
                    height="50"
                    rx="8"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="1.2"
                    strokeDasharray="4 2"
                    opacity="0.4"
                  />

                  {/* Spoolio Text */}
                  <text
                    x="0"
                    y="-2"
                    textAnchor="middle"
                    fill="#000000"
                    fontSize="14"
                    fontWeight="900"
                    fontFamily="sans-serif"
                    letterSpacing="1.5"
                  >
                    SPOOLIO
                  </text>

                  {/* Quota indicator inside sticker */}
                  <rect
                    x="-42"
                    y="8"
                    width="84"
                    height="14"
                    rx="7"
                    fill="#000000"
                    opacity="0.9"
                  />

                  <text
                    x="0"
                    y="18"
                    textAnchor="middle"
                    fill={isQuotaReached ? "#00FF66" : "#FFD700"}
                    fontSize="7.5"
                    fontWeight="800"
                    fontFamily="sans-serif"
                  >
                    {isQuotaReached ? "POCHETTE COMPLÈTE" : `${totalSelected} / ${selectedSize} OBJETS`}
                  </text>
                </g>
              </svg>
            </motion.div>
          </div>

          {/* REASSURANCE TEXT UNDER THE ILLUSTRATION */}
          <div className="w-full z-10 pt-3 border-t border-neutral-800/80 flex flex-col items-center gap-3">
            {/* BADGES REPRÉSENTANT LES OBJETS DROPPÉS DANS LA POCHETTE */}
            <div className="flex flex-wrap items-center justify-center gap-2 min-h-[32px]">
              {(Object.keys(distribution) as MysteryCategoryKey[]).map((catKey) => {
                const count = distribution[catKey] || 0;
                if (count <= 0) return null;
                const cat = MYSTERY_CATEGORIES[catKey];

                return (
                  <motion.div
                    key={catKey}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-900 bento-badge border border-neutral-700 text-white shadow-sm"
                    style={{ borderColor: cat.color }}
                  >
                    <span>{cat.icon}</span>
                    <span>{count}x</span>
                  </motion.div>
                );
              })}
              {totalSelected === 0 && (
                <span className="text-xs text-gray-400 italic">
                  Sélectionne des objets pour remplir le sachet...
                </span>
              )}
            </div>

            {/* Texte de réassurance requis */}
            <p className="text-[11px] text-gray-400 text-center font-medium leading-tight">
              Emballé avec soin à Comines en sachet Kraft écoresponsable 🌱
            </p>
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

            <div className="grid grid-cols-3 gap-3">
              {MYSTERY_SIZES.map((sizeOpt) => {
                const isSelected = selectedSize === sizeOpt.count;
                return (
                  <button
                    key={sizeOpt.count}
                    type="button"
                    onClick={() => handleSelectSize(sizeOpt.count)}
                    className={`relative py-4 px-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1 ${
                      isSelected
                        ? "bg-neutral-900 border-2 border-[#FF5500] shadow-md"
                        : "size-tab-unselected bg-neutral-900/40 border border-neutral-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {/* Badge RECOMMANDÉ & MEGA PACK */}
                    {sizeOpt.badge && (
                      <span className="absolute -top-3 px-2.5 py-0.5 rounded-full bg-[#FF5500] text-black font-extrabold text-[10px] font-[family-name:var(--font-antonio)] uppercase tracking-wider shadow-md z-10 whitespace-nowrap">
                        {sizeOpt.badge}
                      </span>
                    )}
                    <span
                      className="text-base sm:text-lg font-bold font-[family-name:var(--font-plus-jakarta)]"
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

            <div className="flex flex-col gap-3">
              {(Object.keys(MYSTERY_CATEGORIES) as MysteryCategoryKey[]).map((catKey) => {
                const cat = MYSTERY_CATEGORIES[catKey];
                const count = distribution[catKey] || 0;
                const isMaxReached = totalSelected >= selectedSize;

                return (
                  <div
                    key={cat.key}
                    className="category-card rounded-2xl p-4 bg-neutral-900/40 border border-neutral-800 flex items-center justify-between gap-4 transition-colors hover:border-neutral-700"
                  >
                    {/* Icône + Nom à gauche */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0 select-none">{cat.icon}</span>
                      <span className="text-sm sm:text-base font-bold text-white truncate">
                        {cat.name}
                      </span>
                    </div>

                    {/* Compteur Simple [ - ] COUNT [ + ] */}
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(catKey)}
                        disabled={count <= 0}
                        className="btn-minus w-10 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 disabled:opacity-20 disabled:pointer-events-none text-white font-bold text-xl flex items-center justify-center cursor-pointer transition-colors"
                        title="Moins"
                      >
                        -
                      </button>

                      <span className="w-6 text-center font-extrabold text-base font-[family-name:var(--font-plus-jakarta)] text-white">
                        {count}
                      </span>

                      {/* Bouton [ + ] qui lance le jeton vers la pochette */}
                      <button
                        type="button"
                        onClick={(e) => handleAddCategory(catKey, e)}
                        disabled={isMaxReached}
                        className="w-10 h-10 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] border border-[#FF5500] disabled:opacity-20 disabled:pointer-events-none text-black font-extrabold text-xl flex items-center justify-center cursor-pointer transition-all shadow-sm active:scale-95"
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
              className="btn-random w-full py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-gray-200 hover:text-white font-[family-name:var(--font-antonio)] font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>🎲 REMPLIR AU HASARD</span>
            </button>

            {/* Gros Bouton Principal Orange Spoolio - Fluo Clignotant quand Quota Atteint */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isQuotaReached}
              className={`w-full py-4 px-6 rounded-2xl font-[family-name:var(--font-antonio)] font-extrabold text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
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

