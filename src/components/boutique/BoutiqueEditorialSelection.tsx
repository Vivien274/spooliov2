"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/components/ProductCard";
import { Star, Sparkles, Tag, ArrowRight } from "lucide-react";

export type EditorialTabType = "favoris" | "nouveautes" | "under10";

interface BoutiqueEditorialSelectionProps {
  products: Product[];
  onApplySelectionToCatalogue: (tab: EditorialTabType) => void;
}

export default function BoutiqueEditorialSelection({
  products,
  onApplySelectionToCatalogue,
}: BoutiqueEditorialSelectionProps) {
  const [activeTab, setActiveTab] = useState<EditorialTabType>("favoris");

  // Format price helper
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    return num.toLocaleString("fr-FR", { minimumFractionDigits: num % 1 === 0 ? 0 : 2 }) + " €";
  };

  // 1. Favoris de l'atelier (curated real products or high-rated/featured)
  const favorisProducts = useMemo(() => {
    // Look for iconic products
    const iconicKeywords = ["boîte magique", "boite magique", "support de téléphone", "clicker", "dragon", "vide-poche", "marcel"];
    const found: Product[] = [];

    iconicKeywords.forEach((kw) => {
      const match = products.find(
        (p) =>
          p.name.toLowerCase().includes(kw) &&
          !found.some((f) => f.id === p.id)
      );
      if (match) found.push(match);
    });

    // Fill up to 4 if needed
    if (found.length < 4) {
      products.forEach((p) => {
        if (found.length < 4 && !found.some((f) => f.id === p.id)) {
          found.push(p);
        }
      });
    }

    return found.slice(0, 4);
  }, [products]);

  // 2. Nouveautés de l'imprimante (sorted by date_created or catalog order)
  const nouveautesProducts = useMemo(() => {
    const sorted = [...products].sort((a, b) => {
      const timeA = a.date_created ? new Date(a.date_created).getTime() : 0;
      const timeB = b.date_created ? new Date(b.date_created).getTime() : 0;
      return timeB - timeA;
    });
    return sorted.slice(0, 4);
  }, [products]);

  // 3. À moins de 10 €
  const under10Products = useMemo(() => {
    const cheap = products.filter((p) => {
      const price = parseFloat(p.price);
      return !isNaN(price) && price > 0 && price <= 10;
    });
    return cheap.slice(0, 4);
  }, [products]);

  // Active items to display
  const currentItems = useMemo(() => {
    if (activeTab === "nouveautes") return nouveautesProducts;
    if (activeTab === "under10") return under10Products;
    return favorisProducts;
  }, [activeTab, favorisProducts, nouveautesProducts, under10Products]);

  // Total count for current tab
  const totalInSelection = useMemo(() => {
    if (activeTab === "nouveautes") return Math.min(products.length, 24);
    if (activeTab === "under10") {
      return products.filter((p) => {
        const price = parseFloat(p.price);
        return !isNaN(price) && price > 0 && price <= 10;
      }).length;
    }
    return Math.min(favorisProducts.length, 12);
  }, [activeTab, products, favorisProducts.length]);

  return (
    <section className="mb-12 p-6 sm:p-7 rounded-3xl bg-zinc-50 border border-zinc-200/90 shadow-2xs font-sans">
      {/* Header with Title and Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#ff4f00] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sélection Éditoriale</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-outfit tracking-tight">
            Les pépites de l'atelier
          </h2>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-zinc-200 shadow-2xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("favoris")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "favoris"
                ? "bg-[#ff4f00] text-white shadow-xs no-invert keep-white"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Favoris de l'atelier</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("nouveautes")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "nouveautes"
                ? "bg-[#ff4f00] text-white shadow-xs no-invert keep-white"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nouveautés</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("under10")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "under10"
                ? "bg-[#ff4f00] text-white shadow-xs no-invert keep-white"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>À moins de 10 €</span>
          </button>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-4">
        {currentItems.map((product) => {
          const mainImage = product.images?.[0]?.src || "/images/figma_keychains.jpg";
          const categoryName = product.categories?.[0]?.name || "Spoolio 3D";

          return (
            <Link
              key={`editorial-${product.id}`}
              href={`/product/${product.slug}`}
              className="group flex flex-col rounded-2xl bg-white border border-zinc-200/90 overflow-hidden hover:border-[#ff4f00]/50 hover:shadow-md transition-all duration-200"
            >
              {/* Product Visual */}
              <div className="relative aspect-square w-full bg-zinc-100 overflow-hidden">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badge based on active tab */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  {activeTab === "favoris" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>Coup de cœur</span>
                    </span>
                  )}
                  {activeTab === "nouveautes" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold shadow-xs">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Sorti d'atelier</span>
                    </span>
                  )}
                  {activeTab === "under10" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                      <Tag className="w-2.5 h-2.5" />
                      <span>Petit prix</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 space-y-2">
                <div>
                  <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider block truncate">
                    {categoryName}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
                  <span className="text-xs sm:text-sm font-black text-zinc-950 font-outfit">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-[11px] font-bold text-[#ff4f00] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>Voir</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Action Footer: apply this selection to the main catalog below */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          onClick={() => onApplySelectionToCatalogue(activeTab)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-[#ff4f00] transition-colors cursor-pointer"
        >
          <span>
            {activeTab === "under10" && `Voir tous les objets à moins de 10 € (${totalInSelection})`}
            {activeTab === "nouveautes" && `Voir toutes les nouveautés dans le catalogue`}
            {activeTab === "favoris" && `Explorer tout le catalogue Spoolio`}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
}
