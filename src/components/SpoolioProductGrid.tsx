"use client";

import { useEffect, useState, useMemo } from "react";
import ProductCard, { Product } from "./ProductCard";

interface SpoolioProductGridProps {
  limit?: number;
  filterType?: "latest" | "best-of" | "all";
  showFilters?: boolean;
  compact?: boolean;
  excludeIds?: (number | string)[];
}

export default function SpoolioProductGrid({
  limit,
  filterType = "all",
  showFilters = true,
  compact = false,
  excludeIds = []
}: SpoolioProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Available real WooCommerce categories in catalog
  const categories = useMemo(() => [
    "TOUT", 
    "Fidgets", 
    "Animaux & Figurines", 
    "Accessoires", 
    "Décoration", 
    "Geek / Gaming"
  ], []);

  const [activeCategory, setActiveCategory] = useState<string>("TOUT");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          throw new Error("Impossible de récupérer les produits");
        }
        const data: Product[] = await res.json();
        const sorted = [...data].sort((a, b) => {
          const timeA = a.date_created ? new Date(a.date_created).getTime() : 0;
          const timeB = b.date_created ? new Date(b.date_created).getTime() : 0;
          return timeB - timeA;
        });
        setProducts(sorted);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue lors du chargement des produits");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Filter products by active category or segments
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter out any explicitly excluded IDs
    if (excludeIds && excludeIds.length > 0) {
      result = result.filter(
        (p) => !excludeIds.includes(p.id) && !excludeIds.includes(String(p.id)) && !excludeIds.includes(p.slug)
      );
    }

    if (filterType === "latest") {
      // Sort strictly by date_created (newest to oldest)
      result.sort((a, b) => {
        const timeA = a.date_created ? new Date(a.date_created).getTime() : 0;
        const timeB = b.date_created ? new Date(b.date_created).getTime() : 0;
        return timeB - timeA;
      });
    } else if (filterType === "best-of") {
      // Exclude top 3 newest products (shown in "Dernières créations") to guarantee zero duplicates on home
      const latestIds = [...products]
        .sort((a, b) => {
          const timeA = a.date_created ? new Date(a.date_created).getTime() : 0;
          const timeB = b.date_created ? new Date(b.date_created).getTime() : 0;
          return timeB - timeA;
        })
        .slice(0, 3)
        .map((p) => p.id);

      result = result.filter((p) => !latestIds.includes(p.id));

      const hasRecordedViews = result.some((p) => (p.views || 0) > 0);
      if (hasRecordedViews) {
        // Sort products primarily by customer view count (most viewed first)
        result.sort((a, b) => {
          const viewsA = a.views || 0;
          const viewsB = b.views || 0;
          if (viewsB !== viewsA) return viewsB - viewsA;
          // Pseudo-random fallback for ties
          return ((b.id * 13) % 11) - ((a.id * 13) % 11);
        });
      } else {
        // Randomized selection fallback if no views recorded yet
        result.sort((a, b) => ((a.id * 31 + 7) % 19) - ((b.id * 31 + 7) % 19));
      }
    } else if (filterType === "all" && activeCategory !== "TOUT") {
      result = result.filter((product) =>
        product.categories?.some(
          (cat) => cat.name.toLowerCase() === activeCategory.toLowerCase()
        )
      );
    }

    // Apply slice limit if provided
    if (limit && limit > 0) {
      return result.slice(0, limit);
    }
    return result;
  }, [products, activeCategory, filterType, limit]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-spoolio-card border border-spoolio-border rounded-2xl max-w-md mx-auto text-center shadow-xl">
        <div className="w-16 h-16 rounded-full bg-red-950/30 border border-red-500/30 flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-bold text-gray-200 mb-2">Erreur de Chargement</h3>
        <p className="text-sm text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            window.location.reload();
          }}
          className="px-5 py-2.5 text-xs font-bold text-black bg-spoolio-orange hover:bg-spoolio-orange/90 rounded-lg transition-colors cursor-pointer shadow-lg shadow-spoolio-orange/15"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Category Filter Pills */}
      {showFilters && filterType === "all" && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveCategory(tag)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all border cursor-pointer select-none ${
                activeCategory === tag
                  ? "bg-white text-black border-white shadow-lg"
                  : "bg-transparent text-gray-400 border-[#1f1f23] hover:text-white hover:border-gray-500"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Bento-style product grid with auto-fill minmax 280px on desktop & horizontal snap scroll on mobile */}
      {loading ? (
        <div className="flex sm:grid overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 gap-4 sm:gap-6 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] snap-x snap-mandatory scrollbar-none">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="min-w-[260px] sm:min-w-0 max-w-[280px] sm:max-w-none shrink-0 sm:shrink snap-center flex flex-col justify-between h-full bg-spoolio-card border border-spoolio-border rounded-2xl p-4 animate-pulse"
            >
              <div>
                <div className="w-full aspect-square rounded-xl bg-spoolio-bg/60 border border-spoolio-border/40 mb-4" />
                <div className="h-5 w-3/4 rounded bg-spoolio-bg/60 mb-2" />
                <div className="h-3 w-1/2 rounded bg-spoolio-bg/60 mb-4" />
              </div>
              <div className="pt-3 border-t border-spoolio-border/40 flex items-center justify-between">
                <div className="flex flex-col gap-1 w-1/3">
                  <div className="h-3 w-1/2 rounded bg-spoolio-bg/60" />
                  <div className="h-5 w-full rounded bg-spoolio-bg/60" />
                </div>
                <div className="h-8 w-24 rounded-lg bg-spoolio-bg/60" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="flex sm:grid overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 gap-4 sm:gap-6 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] snap-x snap-mandatory scrollbar-none px-1">
          {filteredProducts.map((product, index) => (
            <div key={product.id} className="min-w-[260px] sm:min-w-0 max-w-[285px] sm:max-w-none shrink-0 sm:shrink snap-center flex flex-col">
              <ProductCard product={product} compact={compact} priority={index < 4} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-spoolio-card border border-spoolio-border rounded-[30px] font-sans">
          <div className="w-16 h-16 rounded-full bg-gray-900 border border-[#1f1f23] flex items-center justify-center mx-auto mb-4 text-xl">
            🔍
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Aucun produit trouvé</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Aucun objet de la catégorie "{activeCategory}" n'a été trouvé pour le moment.
          </p>
        </div>
      )}
    </div>
  );
}
