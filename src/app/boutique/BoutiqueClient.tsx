"use client";

import { useEffect, useState, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard, { Product } from "@/components/ProductCard";
import CustomSelect, { CustomSelectOption } from "@/components/CustomSelect";

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
} from "lucide-react";

const PRODUCTS_PER_PAGE = 12;

function getCategoryLucideIcon(catName: string, className = "w-4 h-4") {
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

function BoutiqueClientContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("category");
  const qParam = searchParams.get("q");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Sort & Infinite Scroll states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [onlyOnSale, setOnlyOnSale] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>("newest");
  const [visibleCount, setVisibleCount] = useState<number>(PRODUCTS_PER_PAGE);

  // Pills horizontal scroll ref & helper
  const pillsRef = useRef<HTMLDivElement>(null);
  const scrollPills = (direction: "left" | "right") => {
    if (pillsRef.current) {
      const amount = direction === "left" ? -280 : 280;
      pillsRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  // Update selected category and search query when parameters change
  useEffect(() => {
    if (catParam) {
      setSelectedCategory(catParam);
    } else {
      setSelectedCategory("all");
    }
    if (qParam) {
      setSearchQuery(qParam);
    }
  }, [catParam, qParam]);

  // Fetch all products from MySQL database
  useEffect(() => {
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
  }, []);

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
  }, [searchQuery, selectedCategory, onlyOnSale, sortOption]);

  // Apply filters and sorting
  const processedProducts = useMemo(() => {
    let result = [...products];

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

    // 2. Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) =>
        p.categories?.some((c) => decodeHtml(c.name) === decodeHtml(selectedCategory))
      );
    }

    // 3. Promo filter
    if (onlyOnSale) {
      result = result.filter((p) => p.on_sale);
    }

    // 4. Sorting
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
  }, [products, searchQuery, selectedCategory, onlyOnSale, sortOption]);

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
          // Preload next batch before user reaches bottom margin
          setVisibleCount((prev) => Math.min(prev + PRODUCTS_PER_PAGE, processedProducts.length));
        }
      },
      { threshold: 0.1, rootMargin: "250px" }
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [visibleCount, processedProducts.length]);

  return (
    <div className="min-h-screen bg-spoolio-bg text-white font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-black">
      {/* Sticky Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-28 lg:pt-32 pb-12 lg:pb-16">
        {/* SEO Header & Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6 font-sans select-none">
          <Link href="/" className="hover:text-white transition-colors duration-200">
            Accueil
          </Link>
          <span className="text-gray-700 font-bold">/</span>
          <span className="text-white font-black">Boutique</span>
        </nav>

        <section className="mb-6 text-left border-b border-spoolio-border/40 pb-6">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Boutique Spoolio 3D
          </h1>
          <p className="text-gray-400 text-sm max-w-3xl leading-relaxed font-sans">
            Découvrez nos créations exclusives imprimées en 3D en France. Des fidgets satisfaisants, des supports de bureaux designs et des cadeaux originaux, tous fabriqués de façon éco-responsable en PLA biodégradable à partir d'amidon de maïs. Faites le choix du fun et de la qualité locale !
          </p>

          {/* Reassurance Micro Banner (Point 4 UX) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mt-6 font-sans text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-base">🚚</span>
              <span><strong>Livraison OFFERTE</strong> dès 40€ d'achat</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-base">🇫🇷</span>
              <span><strong>Fabrication artisanale</strong> à Comines (59)</span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-base">🌱</span>
              <span><strong>PLA Biosourcé</strong> sans pétrole</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold">
              <span className="text-base">⚡</span>
              <span>Zéro Surstock • Made in Nord</span>
            </div>
          </div>
        </section>

        {/* Category Pills Bar with Navigation Chevrons & Mouse Wheel Support (Point 1 UX) */}
        <div className="relative group/pills mb-6 select-none font-sans">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollPills("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/80 hover:bg-[#ff4f00] border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-md opacity-0 group-hover/pills:opacity-100 hidden sm:flex"
            title="Défiler vers la gauche"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollPills("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/80 hover:bg-[#ff4f00] border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-md opacity-0 group-hover/pills:opacity-100 hidden sm:flex"
            title="Défiler vers la droite"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div
            ref={pillsRef}
            onWheel={(e) => {
              if (pillsRef.current && Math.abs(e.deltaY) > 0) {
                pillsRef.current.scrollLeft += e.deltaY;
              }
            }}
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x scroll-smooth"
          >
            {categorySelectOptions.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer snap-start ${
                    isSelected
                      ? "bg-[#ff4f00] text-white border border-[#ff4f00] shadow-md shadow-[#ff4f00]/20 scale-[1.02]"
                      : "bg-spoolio-card text-gray-300 hover:text-white border border-spoolio-border hover:border-white/20"
                  }`}
                >
                  <span className={isSelected ? "text-white" : "text-gray-400"}>{cat.icon}</span>
                  <span>{cat.label}</span>
                  {cat.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                        isSelected ? "bg-black/30 text-white" : "bg-white/10 text-gray-400"
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

        {/* Filter Toolbar Section */}
        <section className="flex flex-col lg:flex-row gap-6 mb-6 items-stretch lg:items-center justify-between select-none">
          {/* Search & Promo filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Rechercher un objet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-xs font-semibold bg-spoolio-card border border-spoolio-border rounded-xl text-white placeholder-gray-500 outline-none focus:border-white/40 transition-all font-sans"
              />
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Toggle Button for Sale products */}
            <button
              onClick={() => setOnlyOnSale(!onlyOnSale)}
              className={`h-11 px-4 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                onlyOnSale
                  ? "bg-[#ff4f00] border-[#ff4f00] text-white shadow-lg shadow-[#ff4f00]/15"
                  : "bg-spoolio-card border-spoolio-border text-gray-300 hover:text-white"
              }`}
            >
              <span className="text-sm">🏷️</span>
              <span>Promotions</span>
            </button>
          </div>

          {/* Category & Sorting selection */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Category Dropdown */}
            <CustomSelect
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
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

        {/* Active Filter Chips & Reset Button (Points 2 & 3 UX) */}
        {(searchQuery.trim() !== "" || selectedCategory !== "all" || onlyOnSale || sortOption !== "newest") && (
          <div className="flex flex-wrap items-center gap-2 mb-6 font-sans select-none">
            <span className="text-xs text-gray-400 font-bold mr-1">Filtres actifs :</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
                <span>🔍 "{searchQuery}"</span>
                <button onClick={() => setSearchQuery("")} className="hover:text-white font-bold cursor-pointer">
                  &times;
                </button>
              </span>
            )}

            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ff4f00]/20 text-[#ff4f00] border border-[#ff4f00]/30 text-xs font-semibold">
                <span>🏷️ {selectedCategory}</span>
                <button onClick={() => setSelectedCategory("all")} className="hover:text-white font-bold cursor-pointer">
                  &times;
                </button>
              </span>
            )}

            {onlyOnSale && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold">
                <span>🏷️ Promotions</span>
                <button onClick={() => setOnlyOnSale(false)} className="hover:text-white font-bold cursor-pointer">
                  &times;
                </button>
              </span>
            )}

            {sortOption !== "newest" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                <span>⚙️ {sortSelectOptions.find((o) => o.value === sortOption)?.label}</span>
                <button onClick={() => setSortOption("newest")} className="hover:text-white font-bold cursor-pointer">
                  &times;
                </button>
              </span>
            )}

            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setOnlyOnSale(false);
                setSortOption("newest");
              }}
              className="text-xs text-gray-400 hover:text-white underline font-bold ml-2 cursor-pointer transition-colors"
            >
              Réinitialiser tout ↺
            </button>
          </div>
        )}

        {/* Dynamic products count */}
        <div className="text-xs text-gray-500 mb-6 font-semibold font-sans">
          {processedProducts.length} produit{processedProducts.length > 1 ? "s" : ""} trouvé{processedProducts.length > 1 ? "s" : ""}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <svg className="animate-spin h-8 w-8 text-[#ff4f00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Chargement de la boutique...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 bg-spoolio-card border border-spoolio-border rounded-2xl max-w-md mx-auto text-center shadow-xl">
            <span className="text-3xl mb-4">⚠️</span>
            <h3 className="text-lg font-bold text-gray-200 mb-2">Erreur de Chargement</h3>
            <p className="text-sm text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 text-xs font-bold text-black bg-spoolio-orange hover:bg-spoolio-orange/90 rounded-lg transition-colors cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        ) : processedProducts.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 bg-spoolio-card border border-spoolio-border/40 rounded-3xl max-w-xl mx-auto text-center shadow-lg">
            <span className="text-4xl select-none">📦</span>
            <h3 className="text-lg font-extrabold text-white mt-2">Aucun objet ne correspond à votre recherche</h3>
            <p className="text-xs text-gray-400 max-w-md leading-relaxed px-4">
              Essayez de modifier vos filtres, de vider la barre de recherche ou de choisir une autre catégorie de produits.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setOnlyOnSale(false);
                setSortOption("newest");
              }}
              className="mt-4 px-5 py-2.5 text-xs font-bold text-black bg-white hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shadow-md"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            {/* Products Bento-Style Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
                  <svg className="animate-spin h-6 w-6 text-[#ff4f00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest font-sans animate-pulse">Chargement de nouveaux objets...</span>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function BoutiqueClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-spoolio-bg text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-[#ff4f00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Initialisation de la boutique...</span>
        </div>
      </div>
    }>
      <BoutiqueClientContent />
    </Suspense>
  );
}
