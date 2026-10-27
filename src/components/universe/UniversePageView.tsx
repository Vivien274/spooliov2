"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import type { UniversePageData } from "@/services/universeService";
import {
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Compass,
  Boxes,
  RotateCcw,
} from "lucide-react";

interface UniversePageViewProps {
  data: UniversePageData;
}

const ALL_UNIVERSES = [
  { slug: "art-toys", name: "Art Toys & Collectibles" },
  { slug: "tactile", name: "Tactile & Focus" },
  { slug: "objets-deco", name: "Objets & Déco" },
  { slug: "tabletop", name: "Tabletop" },
];

export default function UniversePageView({ data }: UniversePageViewProps) {
  const { universe, categories, categoryProductMap, products } = data;

  // Selected category filter: null = "Tous"
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name-asc">("default");

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategoryId !== null) {
      const allowedIds = new Set(categoryProductMap[selectedCategoryId] || []);
      list = list.filter((p) => allowedIds.has(p.id));
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => parseFloat(a.price || "0") - parseFloat(b.price || "0"));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => parseFloat(b.price || "0") - parseFloat(a.price || "0"));
    } else if (sortBy === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [products, selectedCategoryId, categoryProductMap, sortBy]);

  // Find active category item if any
  const activeCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#121212] font-sans flex flex-col justify-between selection:bg-[#FF5500] selection:text-white">
      {/* Header (Strict Light Theme) */}
      <Header isDark={false} />

      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 pt-24 lg:pt-28 pb-16">
        {/* 1. Fil d'Ariane & Univers Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#E4E4E0]/80 mb-8">
          <nav
            aria-label="Fil d'Ariane"
            className="flex items-center gap-2 text-xs font-mono text-zinc-500 select-none"
          >
            <Link href="/" className="hover:text-zinc-900 transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/boutique" className="hover:text-zinc-900 transition-colors">
              Boutique
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-semibold">{universe.name}</span>
          </nav>

          {/* Univers sibling navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-mono">
            <span className="text-zinc-400 mr-1 hidden md:inline">Univers :</span>
            {ALL_UNIVERSES.map((u) => {
              const isActive = u.slug === universe.slug;
              return (
                <Link
                  key={u.slug}
                  href={`/${u.slug}`}
                  className={`px-2.5 py-1 rounded-full transition-all whitespace-nowrap text-[11px] ${
                    isActive
                      ? "bg-zinc-900 text-white font-medium shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                >
                  {u.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 2. HERO ÉDITORIAL COMPACT */}
        <header className="mb-10 lg:mb-12">
          <div className="relative overflow-hidden bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xs">
            {/* Ambient decorative grid texture */}
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

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10">
              <div className="max-w-2xl flex-1">
                {/* Tagline / Eyebrow */}
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-[#E4E4E0] text-[11px] font-mono tracking-wider uppercase text-zinc-600 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
                  <span>{universe.tagline}</span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-950 mb-3">
                  {universe.name}
                </h1>

                {/* Subtitle */}
                {universe.editorialSubtitle && (
                  <p className="text-base sm:text-lg font-medium text-zinc-700 mb-3">
                    {universe.editorialSubtitle}
                  </p>
                )}

                {/* Description */}
                {universe.editorialDescription && (
                  <p className="text-sm text-zinc-500 leading-relaxed max-w-xl">
                    {universe.editorialDescription}
                  </p>
                )}

                {/* Quick stats pill */}
                <div className="mt-6 pt-5 border-t border-zinc-100 flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>
                      <strong className="text-zinc-900">{products.length}</strong> pièces disponibles
                    </span>
                  </div>
                  <span className="text-zinc-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      <strong className="text-zinc-900">{categories.length}</strong> catégories
                    </span>
                  </div>
                  <span className="text-zinc-300">•</span>
                  <span className="text-zinc-500">
                    Fabrication atelier Comines (Nord)
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

        {/* 3. NAVIGATION DES CATÉGORIES ENFANTS (Chips éditoriales) */}
        {categories.length > 0 && (
          <section className="mb-8" aria-label="Catégories de l'univers">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1.5">
                <span>Catégories</span>
                <span className="text-zinc-300 font-normal">/</span>
                <span className="text-zinc-700">{universe.name}</span>
              </h2>

              {selectedCategoryId !== null && (
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(null)}
                  className="text-xs font-mono text-[#FF5500] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Voir tout ({products.length})</span>
                </button>
              )}
            </div>

            {/* Chips bar: Horizontal scroll on mobile, flex wrap on desktop */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
              {/* "Toutes" Chip */}
              <Link
                href={`/${universe.slug}`}
                className="group px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap border flex items-center gap-2 bg-zinc-900 text-white border-zinc-900 shadow-xs"
              >
                <span>Toutes les créations</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                  {products.length}
                </span>
              </Link>

              {/* Child Categories Chips linking to dedicated Category or Collection pages */}
              {categories.map((cat) => {
                const count = (categoryProductMap[cat.id] || []).length;
                const targetUrl =
                  cat.slug === "cabinet-noir"
                    ? "/collections/cabinet-noir"
                    : `/${universe.slug}/${cat.slug}`;

                return (
                  <Link
                    key={cat.id}
                    href={targetUrl}
                    className="group px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap border flex items-center gap-2 bg-white text-zinc-700 border-[#E4E4E0] hover:border-zinc-300 hover:bg-[#FAF9F6]"
                  >
                    <span>{cat.name}</span>
                    {count > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200">
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. BARRE DE STATUT & TRI */}
        <div className="flex items-center justify-between gap-4 py-3 mb-6 border-b border-[#E4E4E0]/60">
          <div className="text-xs font-mono text-zinc-500">
            {activeCategory ? (
              <span>
                Filtré par : <strong className="text-zinc-900">{activeCategory.name}</strong>{" "}
                ({filteredProducts.length} résultat{filteredProducts.length > 1 ? "s" : ""})
              </span>
            ) : (
              <span>
                Affichage de <strong className="text-zinc-900">{filteredProducts.length}</strong> pièce
                {filteredProducts.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="universe-sort-select" className="text-xs font-mono text-zinc-500 hidden sm:inline">
              Tri :
            </label>
            <select
              id="universe-sort-select"
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
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 mb-12">
            {filteredProducts.map((p, index) => (
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
              Aucune pièce trouvée dans cette catégorie
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              {selectedCategoryId !== null
                ? "Il n'y a pas encore de pièce active pour cette catégorie précise. Réinitialisez le filtre pour voir toutes les créations de cet univers."
                : "Cet univers ne contient pas encore de pièces publiées dans le catalogue Spoolio."}
            </p>
            {selectedCategoryId !== null && (
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-black rounded-lg transition-colors cursor-pointer"
              >
                Afficher tout l'univers ({products.length})
              </button>
            )}
          </div>
        )}

        {/* 7. FOOTER ÉDITORIAL DE L'UNIVERS */}
        <section className="mt-16 pt-8 border-t border-[#E4E4E0] text-center max-w-xl mx-auto">
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
            // FABRICATION LOCALE & SUR MESURE
          </p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Toutes les créations de l'univers <strong>{universe.name}</strong> sont imprimées en 3D
            avec soin dans notre atelier de Comines, à partir de filaments biosourcés (PLA premium).
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Link
              href="/boutique"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-800 hover:text-[#FF5500] transition-colors"
            >
              <span>Découvrir toute la boutique</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
