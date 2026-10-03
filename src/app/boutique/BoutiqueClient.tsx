"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard, { Product } from "@/components/ProductCard";
import CustomSelect, { CustomSelectOption } from "@/components/CustomSelect";
import BoutiqueEditorialHero from "@/components/boutique/BoutiqueEditorialHero";
import BoutiqueReassuranceBar from "@/components/boutique/BoutiqueReassuranceBar";
import BoutiqueUniverses, { BOUTIQUE_UNIVERSES } from "@/components/boutique/BoutiqueUniverses";
import BoutiqueEditorialSelection, { EditorialTabType } from "@/components/boutique/BoutiqueEditorialSelection";

import {
  LayoutGrid,
  Zap,
  Gamepad2,
  Dices,
  PawPrint,
  Box,
  Gift,
  Gem,
  Palette,
  Tag,
  Wrench,
  Sparkles,
  TrendingUp,
  TrendingDown,
  SortAsc,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

const PRODUCTS_PER_PAGE = 12;

function getCategoryLucideIcon(catName: string, className = "w-3.5 h-3.5") {
  const cat = catName.toLowerCase().trim();

  if (cat === "all" || cat.includes("toutes")) {
    return <LayoutGrid className={className} />;
  }
  if (cat.includes("cadeau") || cat.includes("pochette") || cat.includes("surprise") || cat.includes("gift")) {
    return <Gift className={className} />;
  }
  if (cat.includes("fidget") || cat.includes("stress") || cat.includes("cliqueur") || cat.includes("clicker") || cat.includes("sensori")) {
    return <Zap className={className} />;
  }
  if (cat.includes("jeu") || cat.includes("société") || cat.includes("societe") || cat.includes("dice") || cat.includes("cartes")) {
    return <Dices className={className} />;
  }
  if (cat.includes("geek") || cat.includes("gaming") || cat.includes("console") || cat.includes("switch")) {
    return <Gamepad2 className={className} />;
  }
  if (cat.includes("animau") || cat.includes("figurine") || cat.includes("chien") || cat.includes("chat") || cat.includes("creature")) {
    return <PawPrint className={className} />;
  }
  if (cat.includes("boite") || cat.includes("boîte") || cat.includes("sac") || cat.includes("emballage") || cat.includes("packaging")) {
    return <Box className={className} />;
  }
  if (cat.includes("bijou") || cat.includes("bague") || cat.includes("collier")) {
    return <Gem className={className} />;
  }
  if (cat.includes("déco") || cat.includes("deco") || cat.includes("maison") || cat.includes("bureau")) {
    return <Palette className={className} />;
  }
  if (cat.includes("accessoire") || cat.includes("outil") || cat.includes("support")) {
    return <Wrench className={className} />;
  }

  return <Tag className={className} />;
}

function BoutiqueClientContent({
  initialProducts = [],
  initialCategory,
  initialQuery,
}: {
  initialProducts?: Product[];
  initialCategory?: string;
  initialQuery?: string;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(initialProducts.length === 0);
  const [error, setError] = useState<string | null>(null);

  // Filter & Sort & Infinite Scroll states
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "all");
  const [selectedUniverse, setSelectedUniverse] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [onlyOnSale, setOnlyOnSale] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>("newest");
  const [visibleCount, setVisibleCount] = useState<number>(PRODUCTS_PER_PAGE);

  // Pills horizontal scroll ref & helper
  const pillsRef = useRef<HTMLDivElement>(null);
  const scrollPills = (direction: "left" | "right") => {
    if (pillsRef.current) {
      const amount = direction === "left" ? -240 : 240;
      pillsRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  // Smooth scroll helpers
  const scrollToCatalogue = () => {
    const el = document.getElementById("catalogue-explorer");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToUniverses = () => {
    const el = document.getElementById("nos-univers");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSelectUniverse = (univId: string | null) => {
    setSelectedUniverse(univId);
    if (univId) {
      setSelectedCategory("all");
      setTimeout(() => {
        const el = document.getElementById("catalogue-explorer");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 80);
    }
  };

  const handleApplySelection = (tab: EditorialTabType) => {
    if (tab === "under10") {
      setMaxPrice(10);
      setSortOption("price-asc");
    } else if (tab === "nouveautes") {
      setMaxPrice(null);
      setSortOption("newest");
    } else {
      setMaxPrice(null);
    }
    setTimeout(() => {
      const el = document.getElementById("catalogue-explorer");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
  };

  // Sync with browser URL params on client mount if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      const q = params.get("q");
      const univ = params.get("universe");
      if (cat) setSelectedCategory(cat);
      if (q) setSearchQuery(q);
      if (univ) setSelectedUniverse(univ);
    }
  }, []);

  // Fetch all products from MySQL database if not provided from SSR
  useEffect(() => {
    if (products.length > 0) return;

    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          throw new Error("Impossible de récupérer les produits");
        }
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue lors du chargement des produits");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [products.length]);

  const decodeHtml = (str: string) => {
    if (!str) return "";
    return str
      .replace(/&#039;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&nbsp;/g, " ");
  };

  // Dynamically extract categories list with product counts from products loaded
  const categorySelectOptions = useMemo<CustomSelectOption[]>(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.categories) {
        p.categories.forEach((c) => {
          if (c.name) {
            const decoded = decodeHtml(c.name);
            counts[decoded] = (counts[decoded] || 0) + 1;
          }
        });
      }
    });

    const sortedCats = Object.keys(counts).sort((a, b) => a.localeCompare(b, "fr"));

    return [
      { value: "all", label: "Toutes les catégories", count: products.length, icon: getCategoryLucideIcon("all") },
      ...sortedCats.map((cat) => ({
        value: cat,
        label: cat,
        count: counts[cat],
        icon: getCategoryLucideIcon(cat),
      })),
    ];
  }, [products]);

  const sortSelectOptions: CustomSelectOption[] = [
    { value: "newest", label: "Trier par : Nouveautés", icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { value: "price-asc", label: "Prix : croissant", icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
    { value: "price-desc", label: "Prix : décroissant", icon: <TrendingDown className="w-4 h-4 text-rose-400" /> },
    { value: "name-asc", label: "Nom : A-Z", icon: <SortAsc className="w-4 h-4 text-indigo-400" /> },
  ];

  // Reset scroll limit when filter or sorting changes
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [searchQuery, selectedCategory, selectedUniverse, maxPrice, onlyOnSale, sortOption]);

  // Apply filters and sorting (published products only)
  const processedProducts = useMemo(() => {
    let result = products.filter(
      (p) => (p.status === "publish" || !p.status) && p.status !== "draft"
    );

    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.short_description && p.short_description.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // 2. Universe filter (applied when selectedUniverse is set and category is 'all')
    if (selectedUniverse) {
      const univ = BOUTIQUE_UNIVERSES.find((u) => u.id === selectedUniverse);
      if (univ) {
        result = result.filter((p) => {
          const catMatch = p.categories?.some((c) => {
            const catLower = decodeHtml(c.name).toLowerCase();
            return univ.categoryKeywords.some((kw) => catLower.includes(kw));
          });
          const nameLower = p.name.toLowerCase();
          const nameMatch = univ.categoryKeywords.some((kw) => nameLower.includes(kw));
          return catMatch || nameMatch;
        });
      }
    }

    // 3. Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) =>
        p.categories?.some((c) => decodeHtml(c.name) === decodeHtml(selectedCategory))
      );
    }

    // 4. Max Price filter
    if (maxPrice !== null) {
      result = result.filter((p) => {
        const val = parseFloat(p.price);
        return !isNaN(val) && val > 0 && val <= maxPrice;
      });
    }

    // 5. Promo filter
    if (onlyOnSale) {
      result = result.filter((p) => p.on_sale);
    }

    // 6. Sorting
    result.sort((a, b) => {
      if (sortOption === "newest") {
        const timeA = a.date_created ? new Date(a.date_created).getTime() : 0;
        const timeB = b.date_created ? new Date(b.date_created).getTime() : 0;
        return timeB - timeA; // most recent first
      }
      if (sortOption === "price-asc") {
        return parseFloat(a.price) - parseFloat(b.price);
      }
      if (sortOption === "price-desc") {
        return parseFloat(b.price) - parseFloat(a.price);
      }
      if (sortOption === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [products, searchQuery, selectedCategory, selectedUniverse, maxPrice, onlyOnSale, sortOption]);

  // Slicing for infinite scroll
  const displayedProducts = useMemo(() => {
    return processedProducts.slice(0, visibleCount);
  }, [processedProducts, visibleCount]);

  // IntersectionObserver effect for seamless, lag-free infinite scrolling
  useEffect(() => {
    const trigger = document.getElementById("infinite-scroll-trigger");
    if (!trigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < processedProducts.length) {
          setVisibleCount((prev) => Math.min(prev + PRODUCTS_PER_PAGE, processedProducts.length));
        }
      },
      { threshold: 0.1, rootMargin: "250px" }
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [visibleCount, processedProducts.length]);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-900 font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-white">
      {/* Sticky Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 pt-24 lg:pt-28 pb-12 lg:pb-16">
        {/* SEO Header & Breadcrumb */}
        <nav
          aria-label="Fil d'Ariane"
          className="flex items-center gap-2 text-xs font-semibold text-zinc-500 mb-5 font-sans select-none"
        >
          <Link href="/" className="hover:text-zinc-950 transition-colors duration-200">
            Accueil
          </Link>
          <span className="text-zinc-300 font-bold" aria-hidden="true">/</span>
          <span className="text-zinc-950 font-black">Boutique</span>
        </nav>

        {/* 1. Compact Editorial Hero */}
        <BoutiqueEditorialHero
          onExploreClick={scrollToCatalogue}
          onUniversesClick={scrollToUniverses}
        />

        {/* 2. Reassurance Bar (Livraison offerte, Fabrication Comines, PLA Bio, Zéro surstock) */}
        <BoutiqueReassuranceBar />

        {/* 3. The 4 Visual Universes ("Pour jouer", "Pour le bureau", "Petits cadeaux", "Nos curiosités") */}
        <BoutiqueUniverses
          selectedUniverse={selectedUniverse}
          onSelectUniverse={handleSelectUniverse}
        />

        {/* 4. Petite sélection éditoriale ("Favoris de l'atelier", "Nouveautés", "À moins de 10 €") */}
        <BoutiqueEditorialSelection
          products={products}
          onApplySelectionToCatalogue={handleApplySelection}
        />

        {/* 5. Main Catalogue Explorer Section */}
        <section
          id="catalogue-explorer"
          className="scroll-mt-24 pt-6 border-t border-zinc-200/80"
          aria-labelledby="catalogue-heading"
        >
          {/* Catalogue Title & Status */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
            <div>
              <h2
                id="catalogue-heading"
                className="text-xl sm:text-2xl font-black text-zinc-950 font-outfit tracking-tight"
              >
                Tout le Catalogue
              </h2>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                {processedProducts.length} création{processedProducts.length > 1 ? "s" : ""} disponible{processedProducts.length > 1 ? "s" : ""} à la commande
              </p>
            </div>

            {/* Micro hint */}
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-sans">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#ff4f00]" />
              <span>Filtres & recherche rapide</span>
            </div>
          </div>

          {/* Simplified, Sleek Category Pills Bar */}
          <div className="relative group/pills mb-5 select-none font-sans">
            <button
              type="button"
              onClick={() => scrollPills("left")}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/95 hover:bg-[#ff4f00] border border-zinc-200 text-zinc-700 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm opacity-0 group-hover/pills:opacity-100 hidden sm:flex"
              title="Défiler vers la gauche"
              aria-label="Défiler vers la gauche"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => scrollPills("right")}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/95 hover:bg-[#ff4f00] border border-zinc-200 text-zinc-700 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm opacity-0 group-hover/pills:opacity-100 hidden sm:flex"
              title="Défiler vers la droite"
              aria-label="Défiler vers la droite"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <div
              ref={pillsRef}
              onWheel={(e) => {
                if (pillsRef.current && Math.abs(e.deltaY) > 0) {
                  pillsRef.current.scrollLeft += e.deltaY;
                }
              }}
              className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none snap-x scroll-smooth"
            >
              {categorySelectOptions.map((cat) => {
                const isSelected = selectedCategory === cat.value && !selectedUniverse;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.value);
                      setSelectedUniverse(null); // Clear universe when explicitly selecting a category
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4f00] ${
                      isSelected
                        ? "bg-[#ff4f00] text-white border border-[#ff4f00] shadow-xs no-invert keep-white"
                        : "bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <span className={isSelected ? "text-white" : "text-zinc-400"}>
                      {cat.icon}
                    </span>
                    <span>{cat.label}</span>
                    {cat.count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                          isSelected ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {cat.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Toolbar Section (Search, Promo, Dropdowns) */}
          <section
            aria-label="Outils de tri et filtres"
            className="flex flex-col lg:flex-row gap-4 mb-5 items-stretch lg:items-center justify-between select-none"
          >
            {/* Search & Promo filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
              {/* Search Input */}
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder="Rechercher un objet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 text-xs font-semibold bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#ff4f00] focus:ring-1 focus:ring-[#ff4f00] transition-all font-sans shadow-2xs"
                  aria-label="Rechercher un objet dans la boutique"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-zinc-200 hover:bg-zinc-300 text-zinc-700 flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer"
                    aria-label="Effacer la recherche"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Toggle Button for Sale products */}
              <button
                type="button"
                onClick={() => setOnlyOnSale(!onlyOnSale)}
                className={`h-10 px-3.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4f00] ${
                  onlyOnSale
                    ? "bg-[#ff4f00] border-[#ff4f00] text-white shadow-xs no-invert keep-white"
                    : "bg-white border-zinc-200 text-zinc-700 hover:text-zinc-950 shadow-2xs"
                }`}
                aria-pressed={onlyOnSale}
              >
                <span className="text-xs">🏷️</span>
                <span>Promotions</span>
              </button>
            </div>

            {/* Category & Sorting selection */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Category Dropdown */}
              <CustomSelect
                value={selectedCategory}
                onChange={(val) => {
                  setSelectedCategory(val);
                  setSelectedUniverse(null);
                }}
                options={categorySelectOptions}
                placeholder="Toutes les catégories"
                showSearch={true}
              />

              {/* Sorting Dropdown */}
              <CustomSelect
                value={sortOption}
                onChange={(val) => setSortOption(val)}
                options={sortSelectOptions}
                placeholder="Trier par..."
              />
            </div>
          </section>

          {/* Active Filter Chips & Reset Button */}
          {(searchQuery.trim() !== "" ||
            selectedCategory !== "all" ||
            selectedUniverse !== null ||
            maxPrice !== null ||
            onlyOnSale ||
            sortOption !== "newest") && (
            <div className="flex flex-wrap items-center gap-2 mb-6 font-sans select-none">
              <span className="text-xs text-zinc-500 font-bold mr-1">Filtres actifs :</span>

              {/* Active Universe Badge */}
              {selectedUniverse && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-[#ff4f00] border border-orange-200 text-xs font-semibold">
                  <span>
                    🪐 Univers : {BOUTIQUE_UNIVERSES.find((u) => u.id === selectedUniverse)?.title}
                  </span>
                  <button
                    onClick={() => setSelectedUniverse(null)}
                    className="hover:text-orange-950 font-bold cursor-pointer"
                    aria-label="Supprimer le filtre univers"
                  >
                    &times;
                  </button>
                </span>
              )}

              {/* Active Max Price Badge */}
              {maxPrice !== null && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <span>🏷️ Prix ≤ {maxPrice} €</span>
                  <button
                    onClick={() => setMaxPrice(null)}
                    className="hover:text-emerald-950 font-bold cursor-pointer"
                    aria-label="Supprimer la limite de prix"
                  >
                    &times;
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                  <span>🔍 "{searchQuery}"</span>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-indigo-950 font-bold cursor-pointer"
                    aria-label="Effacer le mot-clé de recherche"
                  >
                    &times;
                  </button>
                </span>
              )}

              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold">
                  <span>🏷️ {selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="hover:text-orange-950 font-bold cursor-pointer"
                    aria-label="Effacer la catégorie"
                  >
                    &times;
                  </button>
                </span>
              )}

              {onlyOnSale && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                  <span>🏷️ Promotions</span>
                  <button
                    onClick={() => setOnlyOnSale(false)}
                    className="hover:text-amber-950 font-bold cursor-pointer"
                    aria-label="Désactiver le filtre promotion"
                  >
                    &times;
                  </button>
                </span>
              )}

              {sortOption !== "newest" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <span>⚙️ {sortSelectOptions.find((o) => o.value === sortOption)?.label}</span>
                  <button
                    onClick={() => setSortOption("newest")}
                    className="hover:text-emerald-950 font-bold cursor-pointer"
                    aria-label="Réinitialiser le tri"
                  >
                    &times;
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedUniverse(null);
                  setMaxPrice(null);
                  setOnlyOnSale(false);
                  setSortOption("newest");
                }}
                className="text-xs text-zinc-500 hover:text-zinc-900 underline font-bold ml-1 cursor-pointer transition-colors"
              >
                Réinitialiser tout ↺
              </button>
            </div>
          )}

          {/* Loading Spinner */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <svg
                className="animate-spin h-8 w-8 text-[#ff4f00]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                Chargement de la boutique...
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-zinc-200/90 rounded-2xl max-w-md mx-auto text-center shadow-xs">
              <span className="text-3xl mb-4" aria-hidden="true">⚠️</span>
              <h3 className="text-lg font-bold text-zinc-950 mb-2">Erreur de Chargement</h3>
              <p className="text-sm text-zinc-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#ff4f00] hover:bg-[#e04500] rounded-lg transition-colors cursor-pointer shadow-md no-invert keep-white"
              >
                Réessayer
              </button>
            </div>
          ) : processedProducts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white border border-zinc-200/90 rounded-3xl max-w-xl mx-auto text-center shadow-xs">
              <span className="text-4xl select-none" aria-hidden="true">📦</span>
              <h3 className="text-lg font-extrabold text-zinc-950 mt-2">
                Aucun objet ne correspond à votre sélection
              </h3>
              <p className="text-xs text-zinc-600 max-w-md leading-relaxed px-4">
                Essayez de modifier vos filtres, de vider la barre de recherche ou de choisir un autre univers.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedUniverse(null);
                  setMaxPrice(null);
                  setOnlyOnSale(false);
                  setSortOption("newest");
                }}
                className="mt-3 px-5 py-2.5 text-xs font-bold text-white bg-zinc-900 hover:bg-black rounded-lg transition-colors cursor-pointer shadow-md no-invert keep-white"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <>
              {/* Products Bento-Style Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 mb-8">
                {displayedProducts.map((p, index) => (
                  <div key={p.id} className="h-full animate-reveal">
                    <ProductCard product={p} priority={index < 4} />
                  </div>
                ))}
              </div>

              {/* Infinite Scroll Trigger element */}
              <div id="infinite-scroll-trigger" className="h-10 w-full flex items-center justify-center">
                {visibleCount < processedProducts.length && (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <svg
                      className="animate-spin h-6 w-6 text-[#ff4f00]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest font-sans animate-pulse">
                      Chargement de nouveaux objets...
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Crawlable catalogue for search engine bots without JS */}
          {products.length > 0 && (
            <div className="sr-only" aria-hidden="true">
              <h2>Catalogue complet de nos créations 3D</h2>
              <ul>
                {products.map((p) => (
                  <li key={`crawl-idx-${p.id}`}>
                    <a href={`/product/${p.slug}`}>
                      {p.name} - {p.price}€
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function BoutiqueClient({
  initialProducts = [],
  initialCategory,
  initialQuery,
}: {
  initialProducts?: Product[];
  initialCategory?: string;
  initialQuery?: string;
}) {
  return (
    <BoutiqueClientContent
      initialProducts={initialProducts}
      initialCategory={initialCategory}
      initialQuery={initialQuery}
    />
  );
}
