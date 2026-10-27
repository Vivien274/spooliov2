"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import type { CategoryPageData } from "@/services/categoryService";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  RotateCcw,
  Compass,
} from "lucide-react";

interface CategoryPageViewProps {
  data: CategoryPageData;
}

export default function CategoryPageView({ data }: CategoryPageViewProps) {
  const { category, universe, siblingCategories, products } = data;

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
            <Link
              href={`/${universe.slug}`}
              className="hover:text-zinc-900 transition-colors shrink-0"
            >
              {universe.name}
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-semibold shrink-0">{category.name}</span>
          </nav>

          {/* Lien retour vers l'univers */}
          <Link
            href={`/${universe.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-[#FF5500] transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voir tout l'univers {universe.name}</span>
          </Link>
        </div>

        {/* 2. HERO COMPACT */}
        <header className="mb-8 lg:mb-10">
          <div className="relative overflow-hidden bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 shadow-xs">
            {/* Texture de fond subtile */}
            <div
              className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 10px 10px",
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10">
              <div className="max-w-2xl flex-1">
                {/* Tagline / Eyebrow */}
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-[#E4E4E0] text-[11px] font-mono tracking-wider uppercase text-zinc-600 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
                  <span>{category.tagline}</span>
                </div>

                {/* Titre */}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 mb-2">
                  {category.name}
                </h1>

                {/* Sous-titre */}
                {category.editorialSubtitle && (
                  <p className="text-sm sm:text-base font-medium text-zinc-700 mb-2">
                    {category.editorialSubtitle}
                  </p>
                )}

                {/* Description courte */}
                {category.editorialDescription && (
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-xl">
                    {category.editorialDescription}
                  </p>
                )}

                {/* Badge compteur */}
                <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center gap-4 text-xs font-mono text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>
                      <strong className="text-zinc-900">{products.length}</strong> pièce
                      {products.length > 1 ? "s" : ""} dans cette catégorie
                    </span>
                  </div>
                  <span className="text-zinc-300">•</span>
                  <span>
                    Univers <strong className="text-zinc-900">{universe.name}</strong>
                  </span>
                </div>
              </div>

              {/* Encart dédié Boussole Sensorielle (Tactile & Focus) */}
              {universe.slug === "tactile" && (
                <div className="w-full lg:w-[320px] xl:w-[340px] shrink-0">
                  <Link
                    href="/boussole-sensorielle"
                    className="group relative block p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#FFF5EE] via-[#FFF1E8] to-[#FFE8DA] border border-[#FF5500]/25 shadow-xs hover:shadow-md hover:border-[#FF5500]/40 transition-all duration-300 overflow-hidden"
                  >
                    {/* Decorative ambient glow */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FF5500]/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

                    <div className="relative z-10 flex flex-col h-full justify-between gap-3.5">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-[#FF5500]/20 text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF5500] shadow-2xs">
                          <Compass className="w-3 h-3 text-[#FF5500] animate-spin-slow" />
                          <span>Boussole Sensorielle</span>
                        </div>

                        <h3 className="text-base sm:text-lg font-extrabold text-zinc-950 leading-snug group-hover:text-[#FF5500] transition-colors">
                          Quelle sensation pour vos doigts ?
                        </h3>

                        <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                          Clic franc, glisse silencieuse ou relief texturé : trouvez votre interaction idéale en 60 secondes.
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-[#FF5500]/15">
                        <span className="text-xs font-bold text-[#FF5500] flex items-center gap-1.5 font-mono uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                          <span>Lancer le guide</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 bg-white/70 px-2 py-0.5 rounded-md border border-[#FF5500]/15">
                          Quiz 1 min
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. NAVIGATION CONTEXTUELLE (Catégories du même univers) */}
        {siblingCategories.length > 1 && (
          <nav className="mb-8" aria-label="Catégories du même univers">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Dans l'univers {universe.name} :
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
              {/* Lien vers tout l'univers */}
              <Link
                href={`/${universe.slug}`}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-zinc-600 border border-[#E4E4E0] hover:border-zinc-300 hover:bg-[#FAF9F6] transition-all whitespace-nowrap shrink-0"
              >
                <span>Tout l'univers</span>
              </Link>

              {/* Chips des catégories sœurs */}
              {siblingCategories.map((sib) => {
                const isCurrent = sib.slug === category.slug;
                return (
                  <Link
                    key={sib.id}
                    href={sib.url}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 border flex items-center gap-1.5 ${
                      isCurrent
                        ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                        : "bg-white text-zinc-700 border-[#E4E4E0] hover:border-zinc-300 hover:bg-[#FAF9F6]"
                    }`}
                  >
                    <span>{sib.name}</span>
                    {sib.productCount > 0 && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
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

        {/* 4. BARRE DE TRI & RÉSULTATS */}
        <div className="flex items-center justify-between gap-4 py-3 mb-6 border-b border-[#E4E4E0]/60">
          <div className="text-xs font-mono text-zinc-500">
            <span>
              Affichage de <strong className="text-zinc-900">{sortedProducts.length}</strong> pièce
              {sortedProducts.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="category-sort-select" className="text-xs font-mono text-zinc-500 hidden sm:inline">
              Tri :
            </label>
            <select
              id="category-sort-select"
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

        {/* 5. GRILLE PRODUITS */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 mb-12">
            {sortedProducts.map((p, index) => (
              <div key={p.id} className="h-full">
                <ProductCard product={p} priority={index < 4} />
              </div>
            ))}
          </div>
        ) : (
          /* 6. ÉTAT VIDE */
          <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white border border-[#E4E4E0] rounded-2xl max-w-lg mx-auto text-center shadow-xs my-8 px-6">
            <span className="text-4xl select-none" aria-hidden="true">
              📦
            </span>
            <h3 className="text-base font-extrabold text-zinc-950 mt-2">
              Aucune création active dans cette catégorie
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              Il n'y a pas encore d'objet publié pour {category.name}. Découvrez les autres créations
              de l'univers {universe.name}.
            </p>
            <Link
              href={`/${universe.slug}`}
              className="mt-4 px-4 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-black rounded-lg transition-colors cursor-pointer"
            >
              Explorer l'univers {universe.name}
            </Link>
          </div>
        )}

        {/* 7. PIED DE PAGE CONTEXTUEL */}
        <section className="mt-16 pt-8 border-t border-[#E4E4E0] text-center max-w-xl mx-auto">
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
            // FABRICATION ATELIER COMINES
          </p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Chaque pièce de la catégorie <strong>{category.name}</strong> est conçue et imprimée en 3D
            dans notre atelier à Comines avec des matériaux durables et une finition manuelle soignée.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold">
            <Link
              href={`/${universe.slug}`}
              className="text-zinc-700 hover:text-[#FF5500] transition-colors inline-flex items-center gap-1"
            >
              <span>← Univers {universe.name}</span>
            </Link>
            <span className="text-zinc-300">•</span>
            <Link
              href="/boutique"
              className="text-zinc-700 hover:text-[#FF5500] transition-colors inline-flex items-center gap-1"
            >
              <span>Toute la boutique →</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
