"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ProductCard, { Product } from "./ProductCard";
import { Sparkles, Flame, Dices, Grid, ArrowRight, RefreshCw } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

type TabKey = "latest" | "best-of" | "jeux-de-societe" | "all";

export default function HomeTabbedProductGrid() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("latest");

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

    if (activeTab === "latest") {
      // Sort strictly by date_created (newest first)
      result.sort((a, b) => {
        const timeA = a.date_created ? new Date(a.date_created).getTime() : 0;
        const timeB = b.date_created ? new Date(b.date_created).getTime() : 0;
        return timeB - timeA;
      });
      return result.slice(0, 8);
    }

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
      id: "latest" as TabKey,
      label: "Nouveautés",
      icon: Sparkles,
      badge: "Récent",
      color: "text-amber-400",
    },
    {
      id: "best-of" as TabKey,
      label: "Les Incontournables",
      icon: Flame,
      badge: "Incontournable",
      color: "text-[#ff4f00]",
    },
    {
      id: "jeux-de-societe" as TabKey,
      label: "Jeux de Société",
      icon: Dices,
      badge: "Fun",
      color: "text-indigo-400",
    },
    {
      id: "all" as TabKey,
      label: "Tout le Catalogue",
      icon: Grid,
      badge: "Complet",
      color: "text-emerald-400",
    },
  ];

  return (
    <section className="w-full flex flex-col gap-6 font-sans">
      {/* Header Title */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-black uppercase text-white font-antonio tracking-tight">
          {t("home.collection.title") || "Nos Créations 3D"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          {t("home.collection.subtitle") || "Découvrez nos fidgets, jeux et accessoires 3D biosourcés faits main en France."}
        </p>
      </div>

      {/* Tabs Navigation Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1.5 bg-white/5 border border-white/10 rounded-2xl max-w-3xl mx-auto backdrop-blur-md">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer select-none ${
                isActive
                  ? "bg-gradient-to-r from-white/20 to-white/10 text-white border border-white/20 shadow-lg scale-105"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-80 bg-spoolio-card border border-spoolio-border rounded-2xl p-4 animate-pulse flex flex-col justify-between"
            >
              <div className="w-full aspect-square bg-white/5 rounded-xl mb-4" />
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10 text-rose-400 text-xs">{error}</div>
      ) : displayProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 px-1">
          {displayProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 text-xs">
          Aucun produit trouvé dans cet onglet.
        </div>
      )}

      {/* CTA to full shop */}
      <div className="pt-2 flex justify-center">
        <Link
          href="/boutique"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-[#ff4f00] text-gray-300 hover:text-white border border-white/10 hover:border-[#ff4f00] text-xs font-bold uppercase tracking-wider transition-all duration-300 group shadow-md"
        >
          <span>Voir toute la boutique</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
