"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ProductCard, { Product } from "./ProductCard";
import { Flame, Dices, Grid, ArrowRight } from "lucide-react";
import { isPreprodEnv } from "@/lib/env";
import { useTranslation } from "@/context/LanguageContext";

type TabKey = "best-of" | "jeux-de-societe" | "all";

export default function HomeTabbedProductGrid() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("best-of");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          throw new Error("Impossible de récupérer les produits");
        }
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue lors du chargement");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Filter products by active tab
  const displayProducts = useMemo(() => {
    let result = [...products];

    if (activeTab === "best-of") {
      // Sort by views or popular
      const hasViews = result.some((p) => (p.views || 0) > 0);
      if (hasViews) {
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
      } else {
        result.sort((a, b) => ((a.id * 31 + 7) % 19) - ((b.id * 31 + 7) % 19));
      }
      return result.slice(0, 8);
    }

    if (activeTab === "jeux-de-societe") {
      const filtered = result.filter((p) => {
        const catMatch = p.categories?.some((c) =>
          /jeux|gaming|geek|dés|cartes|boardgames/i.test(c.name || "")
        );
        const nameMatch = /tour|dés|carte|jeu|skull|skyjo|yams|gaming/i.test(p.name || "");
        const tagMatch = p.tags?.some((t) => /jeux|gaming|geek/i.test(t));
        return catMatch || nameMatch || tagMatch;
      });
      return filtered.length > 0 ? filtered.slice(0, 8) : result.slice(0, 6);
    }

    // "all" : afficher d'autres produits du catalogue que les nouveautés
    const latestIds = new Set(
      [...products]
        .sort((a, b) => {
          const timeA = a.date_created ? new Date(a.date_created).getTime() : 0;
          const timeB = b.date_created ? new Date(b.date_created).getTime() : 0;
          return timeB - timeA;
        })
        .slice(0, 8)
        .map((p) => p.id)
    );

    const nonLatest = products.filter((p) => !latestIds.has(p.id));

    // Sélection diversifiée représentant le catalogue
    const diverse: Product[] = [];
    const seenCategories = new Set<string>();

    for (const prod of nonLatest) {
      if (/carte cadeau/i.test(prod.name || "")) continue;
      const catName = prod.categories?.[0]?.name || "Autre";
      if (!seenCategories.has(catName)) {
        seenCategories.add(catName);
        diverse.push(prod);
      }
      if (diverse.length >= 8) break;
    }

    for (const prod of nonLatest) {
      if (diverse.length >= 8) break;
      if (!diverse.some((d) => d.id === prod.id)) {
        diverse.push(prod);
      }
    }

    return diverse.slice(0, 8);
  }, [products, activeTab]);

  const tabs = [
    {
      id: "best-of" as TabKey,
      label: "Art Toys & Collection",
      icon: Flame,
      badge: "Incontournable",
    },
    {
      id: "jeux-de-societe" as TabKey,
      label: "Jeux de Société",
      icon: Dices,
      badge: "Tabletop",
    },
    {
      id: "all" as TabKey,
      label: "Tout le Catalogue",
      icon: Grid,
      badge: "Complet",
    },
  ];

  return (
    <section className="w-full flex flex-col gap-6 font-sans">
      {/* Header Title */}
      <div className="text-center space-y-2">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase text-zinc-900 font-dynapuff tracking-tighter leading-tight"
          style={{ fontFamily: "var(--font-dynapuff), cursive, sans-serif" }}
        >
          {t("home.collection.title") || "La Collection Spoolio"}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
          {t("home.collection.subtitle") || "Art toys, accessoires de jeux de société et objets geek imprimés en 3D en France."}
        </p>
      </div>

      {/* Tabs Navigation Pills - strictly on a single line */}
      <div className="w-full flex items-center justify-start sm:justify-center overflow-x-auto scrollbar-none py-1">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 p-1.5 bg-neutral-100/90 border border-neutral-200/90 rounded-2xl mx-auto flex-nowrap shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-zinc-950 text-white shadow-sm border border-zinc-950"
                    : "border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-zinc-900 bg-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#ff4f00]" : "text-neutral-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-80 bg-white border border-zinc-200 rounded-2xl p-4 animate-pulse flex flex-col justify-between shadow-xs"
            >
              <div className="w-full aspect-square bg-zinc-100 rounded-xl mb-4" />
              <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-zinc-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10 text-rose-500 text-xs">{error}</div>
      ) : displayProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 px-1">
          {displayProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-400 text-xs">
          Aucun produit trouvé dans cet onglet.
        </div>
      )}

      {/* CTA to full shop */}
      <div className="pt-2 flex justify-center">
        <Link
          href="/boutique"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-[#ff4f00] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 group shadow-sm"
        >
          <span>Voir toute la boutique</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
