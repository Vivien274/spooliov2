"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShoppingBag, Eye, Store, ShieldCheck } from "lucide-react";
import { useBazarCart } from "@/context/BazarCartContext";

interface BazarHeroProps {
  totalAvailablePieces: number;
  scenesCount: number;
}

export const BazarHero: React.FC<BazarHeroProps> = ({
  totalAvailablePieces,
}) => {
  const { totalCount, setIsCartOpen } = useBazarCart();

  return (
    <section className="relative pt-3 pb-5 md:pt-4 md:pb-6 border-b border-[#E4E4E0] bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E4E4E0] shadow-2xs text-xs font-medium text-[#121212]">
            <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
            <span className="font-bold text-[#FF5500]">LE BAZAR</span>
            <span className="text-neutral-300">•</span>
            <span>Brocante d&apos;atelier interactive</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/bazar"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-600 hover:text-[#121212] border border-[#E4E4E0] text-xs font-medium transition-colors shadow-2xs"
            >
              <Store className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Éditeur Vendeur</span>
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121212] text-white hover:bg-neutral-800 text-xs font-semibold shadow-2xs transition-transform active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Panier</span>
              {totalCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#FF5500] text-white text-[11px] font-bold">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Hero Title & Lead */}
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#121212] font-righteous">
            LE BAZAR<span className="text-[#FF5500]">.</span>
          </h1>

          <p className="mt-2 text-base sm:text-lg text-neutral-700 font-medium leading-relaxed">
            Des prototypes, des dernières pièces, des essais et des curiosités.
            Des objets déjà fabriqués qui cherchent une nouvelle maison.
          </p>

          {/* Clean inline stats & guide strip (no bulky bento boxes) */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E4E4E0] font-semibold text-[#121212] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
              <span><strong>{totalAvailablePieces}</strong> pièces disponibles</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E4E4E0] font-medium text-neutral-700 shadow-2xs">
              <span>Dès <strong>1 €</strong></span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E4E4E0] font-medium text-neutral-700 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Fait à l&apos;atelier (Comines)</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-[#FF5500] font-medium">
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>Touchez un objet sur la photo pour découvrir son prix</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
