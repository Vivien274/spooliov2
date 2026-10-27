"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import type { CollectionPageData } from "@/services/collectionService";
import {
  Sparkles,
  ArrowRight,
  Boxes,
  Layers,
} from "lucide-react";

interface CollectionPageViewProps {
  data: CollectionPageData;
}

export default function CollectionPageView({ data }: CollectionPageViewProps) {
  const { collection, siblingCollections, products, productContextMap } = data;

  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name-asc">("default");

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === "price-asc") {
      list.sort((a, b) => parseFloat(a.price || "0") - parseFloat(b.price || "0"));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => parseFloat(b.price || "0") - parseFloat(a.price || "0"));
    } else if (sortBy === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [products, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#121212] font-sans flex flex-col justify-between selection:bg-[#FF5500] selection:text-white">
      {/* Header */}
      <Header isDark={false} />

      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 pt-24 lg:pt-28 pb-16">
        {/* 1. FIL D'ARIANE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#E4E4E0]/80 mb-8">
          <nav
            aria-label="Fil d'Ariane"
            className="flex items-center gap-2 text-xs font-mono text-zinc-500 select-none overflow-x-auto no-scrollbar"
          >
            <Link href="/" className="hover:text-zinc-900 transition-colors shrink-0">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/boutique" className="hover:text-zinc-900 transition-colors shrink-0">
              Boutique
            </Link>
            <span>/</span>
            <span className="text-zinc-400 shrink-0">Collections</span>
            <span>/</span>
            <span className="text-zinc-900 font-semibold shrink-0">{collection.name}</span>
          </nav>

          {/* Lien retour boutique */}
          <Link
            href="/boutique"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-[#FF5500] transition-colors shrink-0"
          >
            <span>Toutes les créations boutique</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2. HERO ÉDITORIAL RICHE */}
        <header className="mb-10 lg:mb-12">
          <div className="relative overflow-hidden bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xs">
            {/* Texture de fond */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 10px 10px",
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 max-w-3xl">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-[#E4E4E0] text-[11px] font-mono tracking-wider uppercase text-zinc-600 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
                <span>{collection.tagline}</span>
              </div>

              {/* Titre Collection */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-950 mb-3">
                {collection.name}
              </h1>

              {/* Sous-titre éditorial */}
              {collection.editorialSubtitle && (
                <p className="text-base sm:text-lg font-medium text-zinc-700 mb-3">
                  {collection.editorialSubtitle}
                </p>
              )}

              {/* Description riche */}
              {collection.editorialDescription && (
                <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">
                  {collection.editorialDescription}
                </p>
              )}

              {/* Statistiques & fabrication */}
              <div className="mt-6 pt-5 border-t border-zinc-100 flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span>
                    <strong className="text-zinc-900">{products.length}</strong> pièce
                    {products.length > 1 ? "s" : ""} dans cette collection
                  </span>
                </div>
                <span className="text-zinc-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Sélection thématique Spoolio V2.1</span>
                </div>
                <span className="text-zinc-300">•</span>
                <span>Atelier Comines</span>
              </div>
            </div>
          </div>
        </header>

        {/* 3. NAVIGATION CONTEXTUELLE DES COLLECTIONS (Chips élégantes) */}
        {siblingCollections.length > 1 && (
          <nav className="mb-8" aria-label="Autres collections">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1.5">
                <span>Collections Spoolio</span>
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
              {siblingCollections.map((sib) => {
                const isCurrent = sib.slug === collection.slug;
                return (
                  <Link
                    key={sib.id}
                    href={sib.url}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 border flex items-center gap-2 ${
                      isCurrent
                        ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                        : "bg-white text-zinc-700 border-[#E4E4E0] hover:border-zinc-300 hover:bg-[#FAF9F6]"
                    }`}
                  >
                    <span>{sib.name}</span>
                    {sib.productCount > 0 && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                          isCurrent
                            ? "bg-zinc-800 text-zinc-300"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {sib.productCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}

        {/* 4. BARRE DE STATUT & TRI */}
        <div className="flex items-center justify-between gap-4 py-3 mb-6 border-b border-[#E4E4E0]/60">
          <div className="text-xs font-mono text-zinc-500">
            <span>
              Affichage de <strong className="text-zinc-900">{sortedProducts.length}</strong> pièce
              {sortedProducts.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="collection-sort-select" className="text-xs font-mono text-zinc-500 hidden sm:inline">
              Tri :
            </label>
            <select
              id="collection-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-mono bg-white border border-[#E4E4E0] rounded-lg px-2.5 py-1.5 text-zinc-800 focus:outline-none focus:border-[#FF5500] cursor-pointer"
            >
              <option value="default">Ordre catalogue</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="name-asc">Nom (A-Z)</option>
            </select>
          </div>
        </div>

        {/* 5. GRILLE PRODUITS AVEC CONTEXTE SUBTIL */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 mb-12">
            {sortedProducts.map((p, index) => {
              const ctx = productContextMap[p.id];
              return (
                <div key={p.id} className="h-full flex flex-col">
                  {/* Petit badge contextuel discret au-dessus de la carte */}
                  {ctx?.universeName && (
                    <div className="text-[10px] font-mono text-zinc-400 mb-1 px-1 truncate">
                      {ctx.universeName} {ctx.categoryName ? `› ${ctx.categoryName}` : ""}
                    </div>
                  )}
                  <div className="flex-1">
                    <ProductCard product={p} priority={index < 4} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 6. ÉTAT VIDE */
          <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white border border-[#E4E4E0] rounded-2xl max-w-lg mx-auto text-center shadow-xs my-8 px-6">
            <span className="text-4xl select-none" aria-hidden="true">
              ✨
            </span>
            <h3 className="text-base font-extrabold text-zinc-950 mt-2">
              Cette collection sera bientôt disponible
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              Les pièces de la collection {collection.name} sont actuellement en cours de préparation
              dans notre atelier.
            </p>
            <Link
              href="/boutique"
              className="mt-4 px-4 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-black rounded-lg transition-colors cursor-pointer"
            >
              Découvrir la boutique
            </Link>
          </div>
        )}

        {/* 7. FOOTER ÉDITORIAL DE LA COLLECTION */}
        <section className="mt-16 pt-8 border-t border-[#E4E4E0] text-center max-w-xl mx-auto">
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
            // SÉLECTION EXCLUSIVE SPOOLIO V2.1
          </p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Chaque pièce de la collection <strong>{collection.name}</strong> répond à une direction
            artistique précise, conçue et fabriquée avec passion dans notre atelier à Comines.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold">
            <Link
              href="/boutique"
              className="text-zinc-700 hover:text-[#FF5500] transition-colors inline-flex items-center gap-1"
            >
              <span>Voir tout le catalogue boutique →</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
