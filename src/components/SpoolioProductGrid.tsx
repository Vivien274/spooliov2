"use client";

import { useEffect, useState } from "react";
import ProductCard, { Product } from "./ProductCard";

export default function SpoolioProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        setProducts(sorted.slice(0, 12));
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue lors du chargement des produits");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

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
            // trigger re-fetch by triggering effect manually or reloading
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
    <div className="w-full">
      {/* Bento-style product grid with auto-fill minmax 280px */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col justify-between h-full bg-spoolio-card border border-spoolio-border rounded-xl p-4 animate-pulse"
              >
                <div>
                  {/* Image Skeleton */}
                  <div className="w-full aspect-square rounded-lg bg-spoolio-bg/60 border border-spoolio-border/40 mb-4" />
                  
                  {/* Title Skeleton */}
                  <div className="h-5 w-3/4 rounded bg-spoolio-bg/60 mb-2" />
                  
                  {/* Category Skeleton */}
                  <div className="h-3 w-1/2 rounded bg-spoolio-bg/60 mb-4" />
                </div>

                {/* Footer Skeleton */}
                <div className="pt-3 border-t border-spoolio-border/40 flex items-center justify-between">
                  <div className="flex flex-col gap-1 w-1/3">
                    <div className="h-3 w-1/2 rounded bg-spoolio-bg/60" />
                    <div className="h-5 w-full rounded bg-spoolio-bg/60" />
                  </div>
                  <div className="h-8 w-24 rounded-lg bg-spoolio-bg/60" />
                </div>
              </div>
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </div>
  );
}
