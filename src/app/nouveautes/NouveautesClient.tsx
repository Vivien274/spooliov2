"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard, { Product } from "@/components/ProductCard";
import DropCountdown from "@/components/drops/DropCountdown";
import DropAlertForm from "@/components/drops/DropAlertForm";
import { Drop, isTeaserDrop } from "@/lib/drops";
import {
  Sparkles,
  Flame,
  ArrowRight,
  Clock,
  ShieldCheck,
  Package,
  Layers,
  SlidersHorizontal,
  Zap,
  Lock,
} from "lucide-react";

interface NouveautesClientProps {
  drops: Drop[];
  products: Product[];
}

type CategoryFilter = "all" | "fidgets" | "art-toys" | "deco" | "tabletop";

export default function NouveautesClient({ drops, products }: NouveautesClientProps) {
  useEffect(() => {
    document.title = "Nouveautés & Dernières Créations 3D | Spoolio";
  }, []);

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<"recent" | "price-asc" | "price-desc">("recent");
  const [visibleCount, setVisibleCount] = useState<number>(24);

  // Active / featured drop for the showcase section
  const featuredDrop = useMemo(() => {
    return (
      drops.find((d) => d.status === "live") ||
      drops.find((d) => d.status === "upcoming") ||
      drops.find((d) => isTeaserDrop(d)) ||
      drops[0] ||
      null
    );
  }, [drops]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    // 1. Filtrer les produits valides et publiés
    let list = products.filter(
      (p) => (p.status === "publish" || !p.status) && p.status !== "draft"
    );

    // 2. Filtre par univers / catégorie
    if (activeCategory === "fidgets") {
      list = list.filter((p) => {
        const catMatch = p.categories?.some((c) =>
          /fidget|clic|tactile|anti-stress|clicker|switch|sensoriel/i.test(c.name || "")
        );
        const nameMatch = /fidget|clicker|clic|switch|touche|clavier|trône|engrenage|sensoriel|iris/i.test(p.name || "");
        const tagMatch = p.tags?.some((t) => /fidget|clic|tactile|anti-stress|sensoriel/i.test(t));
        return catMatch || nameMatch || tagMatch;
      });
    } else if (activeCategory === "art-toys") {
      list = list.filter((p) => {
        const catMatch = p.categories?.some((c) =>
          /art-toy|art toy|figurine|miniature|collection|curiosité|personnage/i.test(c.name || "")
        );
        const nameMatch = /figurine|dragon|chat|pieuvre|robot|crâne|fantôme|marcel|skateur|dummy|axolotl/i.test(p.name || "");
        return catMatch || nameMatch;
      });
    } else if (activeCategory === "deco") {
      list = list.filter((p) => {
        const catMatch = p.categories?.some((c) =>
          /décoration|decoration|déco|deco|bureau|maison|support|vase/i.test(c.name || "")
        );
        const nameMatch = /support|vase|pot|porte|lampe|rangement|organis|cube/i.test(p.name || "");
        return catMatch || nameMatch;
      });
    } else if (activeCategory === "tabletop") {
      list = list.filter((p) => {
        const catMatch = p.categories?.some((c) =>
          /jeu|tabletop|dés|boardgame|plateau|accessoire/i.test(c.name || "")
        );
        const nameMatch = /dés|tour|pion|jeton|rangement|cartes|deck/i.test(p.name || "");
        return catMatch || nameMatch;
      });
    }

    // 3. Tri
    if (sortBy === "recent") {
      list = [...list].sort((a, b) => {
        const timeA = a.date_created ? new Date(a.date_created).getTime() : 0;
        const timeB = b.date_created ? new Date(b.date_created).getTime() : 0;
        return timeB - timeA;
      });
    } else if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => parseFloat(a.price || "0") - parseFloat(b.price || "0"));
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => parseFloat(b.price || "0") - parseFloat(a.price || "0"));
    }

    return list;
  }, [products, activeCategory, sortBy]);

  const displayedList = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-[#121212] font-sans flex flex-col items-center selection:bg-[#FF5500] selection:text-white">
      <Header />

      <main className="w-full max-w-[1200px] px-4 sm:px-6 pt-28 lg:pt-32 pb-20 relative z-10 flex flex-col">
        {/* ================================================================= */}
        {/* 1. HERO HEADER NOUVEAUTÉS                                         */}
        {/* ================================================================= */}
        <section className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E4E4E0] shadow-2xs text-[#121212] text-xs font-mono font-bold uppercase tracking-wider mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>FRAÎCHEMENT SORTI DE L'ATELIER</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#121212] font-be-vietnam mb-3">
            LES NOUVEAUTÉS<span className="text-[#FF5500]">.</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Explorez les dernières créations 3D conçues et imprimées dans notre atelier à Comines :
            fidgets sensoriels, figurines d'atelier, objets déco et nos séries exclusives.
          </p>
        </section>

        {/* ================================================================= */}
        {/* 2. SECTION DROP EN VEDETTE (MISE EN VALEUR SHOWCASE)              */}
        {/* ================================================================= */}
        {featuredDrop && (() => {
          const isTeaser = isTeaserDrop(featuredDrop);

          return (
            <section className="w-full mb-14 sm:mb-20">
              <div className="relative rounded-3xl bg-white border border-[#E4E4E0] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
                  {/* Visual / Media Showcase (5 cols on lg) */}
                  <div className="lg:col-span-5 relative min-h-[280px] sm:min-h-[360px] lg:min-h-[440px] bg-neutral-100 overflow-hidden group">
                    <Image
                      src={featuredDrop.bannerImage || "/images/marcel_octopus.jpg"}
                      alt={featuredDrop.title}
                      fill
                      priority
                      className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                        isTeaser ? "filter blur-md scale-105" : ""
                      }`}
                      sizes="(max-width: 1024px) 100vw, 42vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent lg:hidden pointer-events-none" />

                    {/* Mystery Teaser Overlay */}
                    {isTeaser && (
                      <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[3px] flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl shadow-xl mb-3">
                          🔮
                        </div>
                        <span className="text-xs font-mono font-black text-white uppercase tracking-widest bg-black/60 px-3.5 py-1.5 rounded-full border border-white/20 shadow-sm">
                          Projet secret d'atelier
                        </span>
                        <p className="text-[11px] text-zinc-300 font-sans mt-2 max-w-xs">
                          Création en cours de fabrication à Comines
                        </p>
                      </div>
                    )}

                    {/* Badges on image */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200 shadow-sm text-[#FF5500] text-xs font-mono font-black uppercase tracking-wider">
                        {isTeaser ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span>À Venir</span>
                          </>
                        ) : (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5500] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5500]"></span>
                            </span>
                            <span>{featuredDrop.status === "live" ? "Drop en cours" : "Prochain Drop"}</span>
                          </>
                        )}
                      </span>

                      {featuredDrop.badge && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-900/90 text-white text-[11px] font-mono font-bold uppercase tracking-wider backdrop-blur-sm self-start shadow-xs">
                          {featuredDrop.badge}
                        </span>
                      )}
                    </div>

                    {featuredDrop.editionSize && (
                      <div className="absolute bottom-4 left-4 z-20">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-neutral-200 text-neutral-900 text-xs font-mono font-bold shadow-xs">
                          <Package className="w-3.5 h-3.5 text-[#FF5500]" />
                          <span>Série limitée · {featuredDrop.editionSize} pièces</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Side (7 cols on lg) */}
                  <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                      
                      {/* Header Tag / Meta */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          {featuredDrop.dropNumber && (
                            <span className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-800 text-xs font-mono font-black uppercase tracking-wider">
                              {featuredDrop.dropNumber}
                            </span>
                          )}
                          <span className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-widest">
                            Atelier Spoolio · Comines
                          </span>
                        </div>

                        {!isTeaser && featuredDrop.startDate && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            <span>
                              {new Date(featuredDrop.startDate).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Title in Be Vietnam font */}
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#121212] font-be-vietnam tracking-tight leading-tight">
                        {featuredDrop.title}
                      </h2>

                      {/* Tagline */}
                      {featuredDrop.tagline && (
                        <p className="text-base sm:text-lg font-medium text-neutral-700 italic border-l-2 border-[#FF5500] pl-3.5 py-0.5">
                          « {featuredDrop.tagline} »
                        </p>
                      )}

                      {/* Description preview */}
                      <p className="text-sm sm:text-base text-neutral-600 leading-relaxed line-clamp-3">
                        {featuredDrop.description.split("\n\n")[0]}
                      </p>
                    </div>

                    {/* Countdown & Action Bar */}
                    <div className="space-y-4 pt-4 border-t border-[#E4E4E0]">
                      {isTeaser ? (
                        <DropAlertForm
                          dropSlug={featuredDrop.slug}
                          dropTitle={featuredDrop.title}
                        />
                      ) : featuredDrop.status !== "ended" && featuredDrop.startDate ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF9F6] border border-[#E4E4E0]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF5500] flex items-center justify-center shrink-0">
                              <Zap className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                                {featuredDrop.status === "live" ? "Clôture de la vente dans" : "Ouverture officielle dans"}
                              </p>
                              <p className="text-xs font-semibold text-neutral-900">
                                {featuredDrop.status === "live" ? "Pièces numérotées en direct" : "Préparez votre commande"}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <DropCountdown
                              targetDate={
                                featuredDrop.status === "live" && featuredDrop.endDate
                                  ? featuredDrop.endDate
                                  : featuredDrop.startDate
                              }
                              compact={false}
                            />
                          </div>
                        </div>
                      ) : null}

                      {/* CTA Buttons */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {isTeaser ? (
                          <div className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-neutral-200/90 text-neutral-600 border border-neutral-300 text-sm font-black uppercase tracking-wider select-none cursor-not-allowed">
                            <Lock className="w-4 h-4 text-neutral-500" />
                            <span>Date de sortie non dévoilée</span>
                          </div>
                        ) : (
                          <Link
                            href={`/drops/${featuredDrop.slug}`}
                            className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#E04B00] text-white text-sm font-black uppercase tracking-wider transition-all shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-98"
                          >
                            <span>{featuredDrop.status === "live" ? "Accéder à la Vente" : "Découvrir la Collection"}</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}

                        <Link
                          href="/drops"
                          className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl border border-[#E4E4E0] bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                          title="Voir toutes les archives et drops"
                        >
                          <span>Tous les drops</span>
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </section>
          );
        })()}

        {/* ================================================================= */}
        {/* 3. BARRE DE FILTRES ET TRI                                        */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E4E4E0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
              <h2 className="text-xl sm:text-2xl font-black text-[#121212] font-be-vietnam tracking-tight">
                Objets Récemment Ajoutés
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
              {filteredProducts.length} créations disponibles
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Univers Filter Pills */}
            <div className="flex items-center p-1 bg-white border border-[#E4E4E0] rounded-xl shadow-2xs overflow-x-auto max-w-full">
              {[
                { id: "all", label: "Tous" },
                { id: "fidgets", label: "Fidgets" },
                { id: "art-toys", label: "Art Toys" },
                { id: "deco", label: "Déco" },
                { id: "tabletop", label: "Tabletop" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setActiveCategory(f.id as CategoryFilter);
                    setVisibleCount(24);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === f.id
                      ? "bg-[#121212] text-white shadow-2xs"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Trier les nouveautés"
                className="px-3 py-2 pr-8 rounded-xl border border-[#E4E4E0] bg-white text-xs font-bold text-neutral-800 shadow-2xs appearance-none cursor-pointer focus:outline-hidden focus:border-[#FF5500]"
              >
                <option value="recent">Plus récents d'abord</option>
                <option value="price-asc">Prix : croissant</option>
                <option value="price-desc">Prix : décroissant</option>
              </select>
              <SlidersHorizontal className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 4. GRILLE DE PRODUITS                                             */}
        {/* ================================================================= */}
        {displayedList.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#E4E4E0] p-8 shadow-2xs">
            <Package className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#121212]">Aucun objet trouvé dans cette catégorie</h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
              Sélectionnez un autre filtre pour découvrir toutes nos nouveautés.
            </p>
            <button
              onClick={() => setActiveCategory("all")}
              className="mt-4 px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-bold hover:bg-neutral-800 transition-colors"
            >
              Afficher tout le catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {displayedList.map((product, idx) => (
              <ProductCard
                key={product.id || product.slug}
                product={product}
                priority={idx < 4}
              />
            ))}
          </div>
        )}

        {/* ================================================================= */}
        {/* 5. BOUTON CHARGER PLUS                                            */}
        {/* ================================================================= */}
        {hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={() => setVisibleCount((prev) => prev + 24)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-[#E4E4E0] hover:bg-neutral-50 text-xs sm:text-sm font-bold text-[#121212] shadow-xs hover:shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>Voir plus de nouveautés ({filteredProducts.length - visibleCount} restantes)</span>
              <ArrowRight className="w-4 h-4 text-[#FF5500]" />
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* 6. ENTRAIN & ENGAGEMENTS ATELIER                                  */}
        {/* ================================================================= */}
        <section className="mt-16 pt-10 border-t border-[#E4E4E0]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#E4E4E0] shadow-2xs">
              <span className="p-2.5 rounded-xl bg-[#FF5500]/10 text-[#FF5500] shrink-0">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#121212]">Créations Originales</h4>
                <p className="text-[11px] sm:text-xs text-neutral-600 mt-0.5 leading-snug">
                  Dessiné et prototypé avec passion dans notre atelier à Comines (59).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#E4E4E0] shadow-2xs">
              <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#121212]">Matériaux Biosourcés</h4>
                <p className="text-[11px] sm:text-xs text-neutral-600 mt-0.5 leading-snug">
                  Filaments PLA issus d'amidon de maïs, recyclables et sans dérivés pétroliers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#E4E4E0] shadow-2xs">
              <span className="p-2.5 rounded-xl bg-sky-50 text-sky-600 shrink-0">
                <Package className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#121212]">Expédition Soignée</h4>
                <p className="text-[11px] sm:text-xs text-neutral-600 mt-0.5 leading-snug">
                  Envoi sous 24/48h en point relais ou à domicile avec suivi en direct.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

