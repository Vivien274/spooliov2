"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ProductCard, { Product } from "./ProductCard";
import { Sparkles, Dices, Grid, ArrowRight, Zap, Gift, Palette } from "lucide-react";
import { isPreprodEnv } from "@/lib/env";
import { useTranslation } from "@/context/LanguageContext";

type TabKey =
  | "all"
  | "nouveautes"
  | "fidgets"
  | "pochettes"
  | "bureau-deco"
  | "jeux-accessoires";

export default function HomeTabbedProductGrid() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
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

  // Filter products by active tab (strictly published products only)
  const displayProducts = useMemo(() => {
    let result = products.filter(
      (p) => (p.status === "publish" || !p.status) && p.status !== "draft"
    );
    if (result.length === 0) return [];

    if (activeTab === "nouveautes") {
      // Trier strictement par date de création descendante (nouveautés d'abord)
      return result
        .sort((a, b) => {
          const timeA = a.date_created ? new Date(a.date_created).getTime() : 0;
          const timeB = b.date_created ? new Date(b.date_created).getTime() : 0;
          return timeB - timeA;
        })
        .slice(0, 12);
    }

    if (activeTab === "fidgets") {
      const filtered = result.filter((p) => {
        const catMatch = p.categories?.some((c) =>
          /fidget|clic|tactile|anti-stress|clicker|switch|sensoriel/i.test(c.name || "")
        );
        const nameMatch = /fidget|clicker|clic|switch|touche|clavier|trône|engrenage|sensoriel/i.test(p.name || "");
        const tagMatch = p.tags?.some((t) => /fidget|clic|tactile|anti-stress|sensoriel/i.test(t));
        return catMatch || nameMatch || tagMatch;
      });
      return filtered.length > 0 ? filtered.slice(0, 12) : result.slice(0, 12);
    }

    if (activeTab === "pochettes") {
      const pochetteSlugs = [
        "pochette-surprise-s",
        "pochette-surprise-m",
        "pochette-surprise-l",
      ];
      // Filtrer STRICTEMENT les 3 formats officiels de pochette surprise (S, M, L)
      const filtered = result
        .filter((p) => pochetteSlugs.includes(p.slug))
        .sort((a, b) => pochetteSlugs.indexOf(a.slug) - pochetteSlugs.indexOf(b.slug));

      return filtered;
    }

    if (activeTab === "bureau-deco") {
      const filtered = result.filter((p) => {
        const catMatch = p.categories?.some((c) =>
          /décoration|decoration|déco|deco|bureau|accessoire|maison|figurine/i.test(c.name || "")
        );
        const nameMatch = /bureau|support|dragon|figurine|porte-clé|pot|vase|rangement|organis|cube|plante|skateur|main|articulé/i.test(p.name || "");
        const tagMatch = p.tags?.some((t) => /déco|deco|bureau|figurine|dragon/i.test(t));
        return catMatch || nameMatch || tagMatch;
      });
      return filtered.length > 0 ? filtered.slice(0, 12) : result.slice(0, 12);
    }

    if (activeTab === "jeux-accessoires") {
      const filtered = result.filter((p) => {
        const catMatch = p.categories?.some((c) =>
          /jeux|gaming|geek|dés|cartes|boardgame|société|societe/i.test(c.name || "")
        );
        const nameMatch = /tour|dés|carte|jeu|skull|skyjo|yams|gaming|plateau|enjeu|insert/i.test(p.name || "");
        const tagMatch = p.tags?.some((t) => /jeux|gaming|geek|tabletop/i.test(t));
        return catMatch || nameMatch || tagMatch;
      });
      return filtered.length > 0 ? filtered.slice(0, 12) : result.slice(0, 12);
    }

    // "all" : Tout voir (sélection diversifiée et attrayante du catalogue)
    const diverse: Product[] = [];
    const seenCategories = new Set<string>();

    for (const prod of result) {
      if (/carte cadeau/i.test(prod.name || "")) continue;
      const catName = prod.categories?.[0]?.name || "Autre";
      if (!seenCategories.has(catName)) {
        seenCategories.add(catName);
        diverse.push(prod);
      }
      if (diverse.length >= 12) break;
    }

    for (const prod of result) {
      if (diverse.length >= 12) break;
      if (!diverse.some((d) => d.id === prod.id)) {
        diverse.push(prod);
      }
    }

    return diverse.slice(0, 12);
  }, [products, activeTab]);

  const tabs = [
    {
      id: "all" as TabKey,
      label: "Tout voir",
      icon: Grid,
    },
    {
      id: "nouveautes" as TabKey,
      label: "Nouveautés",
      icon: Sparkles,
    },
    {
      id: "fidgets" as TabKey,
      label: "Objets Tactiles & Fidgets",
      icon: Zap,
    },
    {
      id: "pochettes" as TabKey,
      label: "Pochettes Surprises",
      icon: Gift,
    },
    {
      id: "bureau-deco" as TabKey,
      label: "Bureau & Déco",
      icon: Palette,
    },
    {
      id: "jeux-accessoires" as TabKey,
      label: "Jeux & Accessoires",
      icon: Dices,
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
        <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto leading-relaxed">
          Créations d'atelier, objets tactiles et accessoires durables imprimés en 3D en France.
        </p>
      </div>

      {/* Tabs Navigation Pills - Scrollable and responsive on desktop and mobile */}
      <div className="w-full flex items-center justify-start md:justify-center overflow-x-auto scrollbar-none py-1">
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
                    : "border border-neutral-200/80 text-zinc-700 hover:bg-white hover:text-zinc-950 bg-white/70"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-[#ff4f00]" : "text-zinc-400"}`} />
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
        <div
          className={
            activeTab === "pochettes"
              ? "grid grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto gap-4 sm:gap-6 px-1 w-full"
              : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 px-1"
          }
        >
          {displayProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-400 text-xs">
          Aucun produit trouvé dans cet onglet.
        </div>
      )}

      {/* CTA to full shop or configurator */}
      <div className="pt-2 flex justify-center">
        <Link
          href={activeTab === "pochettes" ? "/pochette-surprise" : "/boutique"}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-[#ff4f00] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 group shadow-sm"
        >
          <span>{activeTab === "pochettes" ? "Composer ma pochette sur-mesure" : "Voir toute la boutique"}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
