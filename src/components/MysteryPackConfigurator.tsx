"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Sliders,
  KeyRound,
  Dices,
  ShoppingBag,
  Check,
  ArrowRight,
  Leaf,
  MapPin,
  ShieldCheck,
  Plus,
  Minus,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { isPreprodEnv } from "@/lib/env";

export type MysteryCategoryKey = "figurines" | "fidgets" | "gadgets";

export interface MysteryCategoryConfig {
  key: MysteryCategoryKey;
  code: string;
  name: string;
  shortName: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tagBg: string;
  tagText: string;
  borderColor: string;
  tokenBg: string;
}

export const MYSTERY_CATEGORIES: Record<MysteryCategoryKey, MysteryCategoryConfig> = {
  figurines: {
    key: "figurines",
    code: "01 //",
    name: "Figurines & Sculptures d'Atelier",
    shortName: "Art Toy 3D",
    description: "Créatures articulées, animaux pop et mini-sculptures de bureau.",
    icon: Sparkles,
    tagBg: "bg-stone-100",
    tagText: "text-stone-900",
    borderColor: "border-stone-300",
    tokenBg: "bg-blue-50/80 border-blue-200/80 text-blue-900",
  },
  fidgets: {
    key: "fidgets",
    code: "02 //",
    name: "Fidgets & Stimulations Tactiles",
    shortName: "Tactile ASMR",
    description: "Clickers mécaniques à touches, cubes haptiques et mécanismes sensoriels.",
    icon: Sliders,
    tagBg: "bg-orange-50",
    tagText: "text-[#FF5500]",
    borderColor: "border-orange-200",
    tokenBg: "bg-orange-50/80 border-orange-200/80 text-[#FF5500]",
  },
  gadgets: {
    key: "gadgets",
    code: "03 //",
    name: "Curiosités de Poche & Porte-clés",
    shortName: "Curiosité",
    description: "Accessoires de poche, porte-clés architecturés et curiosités soignées.",
    icon: KeyRound,
    tagBg: "bg-emerald-50",
    tagText: "text-emerald-800",
    borderColor: "border-emerald-200",
    tokenBg: "bg-emerald-50/80 border-emerald-200/80 text-emerald-900",
  },
};

export function getMysteryCategoryName(key: MysteryCategoryKey, isPreprod: boolean): string {
  if (isPreprod) {
    if (key === "figurines") return "Sculptures & Miniatures";
    if (key === "fidgets") return "Outils de focus & Stimulation";
    if (key === "gadgets") return "Porte-clés & Accessoires";
  }
  return MYSTERY_CATEGORIES[key].name;
}

export interface MysterySizeOption {
  count: number;
  editionName: string;
  label: string;
  sublabel: string;
  price: number;
  badge?: string;
  image: string;
}

export const MYSTERY_SIZES: MysterySizeOption[] = [
  {
    count: 3,
    editionName: "L'Édition Découverte",
    label: "3 Créations",
    sublabel: "Idéal pour s'initier aux pièces d'atelier",
    price: 10.0,
    image: "/images/imported/Pochette_S.png",
  },
  {
    count: 6,
    editionName: "La Sélection Signature",
    label: "6 Créations",
    sublabel: "L'équilibre parfait entre tactile et curiosités",
    price: 15.0,
    badge: "Édition Favorite ★",
    image: "/images/imported/PochetteM-1.png",
  },
  {
    count: 10,
    editionName: "Le Grand Format Collector",
    label: "10 Créations",
    sublabel: "L'expérience maximale d'unboxing avec finitions rares",
    price: 20.0,
    badge: "Pack Intégral ⚡",
    image: "/images/imported/Pochette_L.png",
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
  const isPreprod = isPreprodEnv();
  const cartContext = useCart();

  const [selectedSize, setSelectedSize] = useState<number>(6);
  const [distribution, setDistribution] = useState<Record<MysteryCategoryKey, number>>({
    figurines: 2,
    fidgets: 2,
    gadgets: 2,
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

  // Fill objects randomly
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
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (totalSelected < selectedSize) return;

    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.65 },
        colors: ["#FF5500", "#121212", "#059669", "#D97706", "#2563EB"],
      });
    } catch {
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
        .map((cat) => `${distribution[cat]}× ${MYSTERY_CATEGORIES[cat].shortName}`)
        .join(", ");

      cartContext.addToCart(
        {
          productId: 8888 + selectedSize,
          name: `Pochette Surprise Spoolio (${selectedSize} créations)`,
          slug: `blind-bag-${selectedSize}-pieces`,
          price: currentSizeObj.price.toFixed(2),
          selectedOptions: {
            "Édition": `${currentSizeObj.editionName} (${selectedSize} pièces)`,
            "Composition": summaryText,
          },
          image: currentSizeObj.image,
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
    <div className={`w-full max-w-4xl mx-auto font-[family-name:var(--font-plus-jakarta)] ${className}`}>
      <div className="bg-white border border-[#E4E4E0] rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col gap-8">
        
        {/* EN-TÊTE : TITRE & PROGRESSION */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-6 border-b border-[#E4E4E0]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)]">
              Composer votre pochette d&apos;atelier
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-medium">
              Sélectionnez votre édition puis dosez la répartition de vos créations 3D.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <span
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
                isQuotaReached
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-orange-50 text-[#FF5500] border-orange-200"
              }`}
            >
              {isQuotaReached ? "Sachet complet ✨" : `${totalSelected} / ${selectedSize} pièces`}
            </span>
          </div>
        </div>

        {/* ÉTAPE 1 : CHOIX DU FORMAT D'ÉDITION */}
        <div>
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Choisir le format de la pochette</span>
            </span>
            <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
              Tarifs dégressifs d&apos;atelier
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-2">
            {MYSTERY_SIZES.map((sizeOpt) => {
              const isSelected = selectedSize === sizeOpt.count;

              return (
                <button
                  key={sizeOpt.count}
                  type="button"
                  onClick={() => handleSelectSize(sizeOpt.count)}
                  className={`relative p-4 sm:p-5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "bg-stone-50/70 border-2 border-zinc-950 shadow-sm ring-4 ring-zinc-950/5"
                      : "bg-white border-[#E4E4E0] hover:border-zinc-300 hover:bg-zinc-50/50"
                  }`}
                >
                  {sizeOpt.badge && (
                    <span className="absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full bg-[#FF5500] text-white text-[9px] font-bold uppercase tracking-wider shadow-xs">
                      {sizeOpt.badge}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                        {sizeOpt.count} Pièces
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-950 font-[family-name:var(--font-plus-jakarta)] leading-snug">
                      {sizeOpt.editionName}
                    </h3>
                    <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
                      {sizeOpt.sublabel}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-zinc-200/80 flex items-baseline justify-between">
                    <span className="text-[11px] font-mono uppercase text-zinc-600 font-semibold">
                      {(sizeOpt.price / sizeOpt.count).toFixed(2)} € / pièce
                    </span>
                    <span className="text-lg font-extrabold font-[family-name:var(--font-antonio)] text-zinc-950 tracking-tight">
                      {sizeOpt.price.toFixed(2)} €
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ÉTAPE 2 : DOSAGE DES UNIVERS */}
        <div>
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Doser vos univers créatifs</span>
            </span>
            <span className="text-xs font-mono font-bold text-zinc-700">
              {totalSelected} / {selectedSize} pièces
            </span>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {(Object.keys(MYSTERY_CATEGORIES) as MysteryCategoryKey[]).map((catKey) => {
              const cat = MYSTERY_CATEGORIES[catKey];
              const count = distribution[catKey] || 0;
              const isMaxReached = totalSelected >= selectedSize;
              const IconComp = cat.icon;

              return (
                <div
                  key={cat.key}
                  className="p-4 sm:p-4.5 rounded-2xl bg-zinc-50/60 hover:bg-zinc-50 border border-[#E4E4E0] transition-colors flex items-center justify-between gap-4"
                >
                  {/* Icône & Titre & Description */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#E4E4E0] shadow-2xs flex items-center justify-center shrink-0 text-zinc-800">
                      <IconComp className="w-5 h-5 text-zinc-800" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-semibold text-zinc-600">
                          {cat.code}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-zinc-950 truncate leading-snug">
                          {getMysteryCategoryName(catKey, isPreprod)}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-600 font-medium line-clamp-1 mt-0.5">
                        {cat.description}
                      </span>
                    </div>
                  </div>

                  {/* Contrôles Haut de Gamme [-] Count [+] */}
                  <div className="flex items-center gap-2 shrink-0 bg-white p-1 rounded-2xl border border-[#E4E4E0] shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(catKey)}
                      disabled={count <= 0}
                      aria-label={`Retirer un élément ${cat.shortName}`}
                      className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl hover:bg-zinc-100 disabled:opacity-20 disabled:pointer-events-none text-zinc-900 font-bold text-base flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-7 sm:w-8 text-center font-extrabold text-sm sm:text-base text-zinc-950 font-mono">
                      {count}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAddCategory(catKey)}
                      disabled={isMaxReached}
                      aria-label={`Ajouter un élément ${cat.shortName}`}
                      className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-zinc-950 hover:bg-[#FF5500] disabled:bg-zinc-200 disabled:opacity-30 disabled:pointer-events-none text-white font-bold text-base flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ÉTAPE 3 : ACTION & COMMANDE */}
        <div className="pt-4 border-t border-[#E4E4E0] flex flex-col gap-3.5">
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Bouton Remplir au Hasard d'Atelier */}
            <button
              type="button"
              onClick={handleRandomFill}
              className="sm:col-span-5 py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-300 hover:border-zinc-400 text-zinc-800 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <Dices className="w-4 h-4 text-[#FF5500]" />
              <span>Laisser l&apos;Atelier Choisir 🎲</span>
            </button>

            {/* Bouton Principal de Scellage et Panier */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isQuotaReached}
              className={`sm:col-span-7 py-4 px-6 rounded-2xl font-[family-name:var(--font-antonio)] font-extrabold text-sm sm:text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 ${
                isQuotaReached
                  ? "bg-[#FF5500] hover:bg-[#ff4400] text-white shadow-[0_10px_30px_rgba(255,85,0,0.3)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  : "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {isQuotaReached ? (
                <span>Sceller &amp; Ajouter au Panier • {currentSizeObj.price.toFixed(2)} €</span>
              ) : (
                <span>Complétez encore {remainingCount} création{remainingCount > 1 ? "s" : ""}...</span>
              )}
            </button>
          </div>

          {/* Toast de succès avec ouverture directe du panier */}
          <AnimatePresence>
            {isAddedSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Votre pochette d&apos;atelier a été scellée et ajoutée au panier !</span>
                </div>
                {cartContext && (
                  <button
                    type="button"
                    onClick={() => cartContext?.setIsCartOpen(true)}
                    className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 cursor-pointer"
                  >
                    <span>Ouvrir mon panier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Micro-réassurances éditoriales */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-[11px] text-zinc-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>100% PLA d&apos;origine végétale</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Fabrication artisanale à Comines (Nord)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Sachet kraft opaque inviolable</span>
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
