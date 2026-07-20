"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard, { Product } from "@/components/ProductCard";

const PRODUCTS_PER_PAGE = 12;

function BoutiqueClientContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("category");
  const qParam = searchParams.get("q");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Sort & Pagination states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [onlyOnSale, setOnlyOnSale] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);

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

  // Dynamically extract categories list from products loaded
  const categoriesList = useMemo(() => {
    const list = new Set<string>();
    products.forEach((p) => {
      if (p.categories) {
        p.categories.forEach((c) => {
          if (c.name) list.add(decodeHtml(c.name));
        });
      }
    });
    return Array.from(list).sort();
  }, [products]);

  // Reset page when filter or sorting changes
  useEffect(() => {
    setCurrentPage(1);
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

  // Pagination slicing
  const totalPages = Math.ceil(processedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return processedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [processedProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 220, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-spoolio-bg text-white font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-black">
      {/* Sticky Header with Glassmorphism */}
      <div className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-md border-b border-[#1f1f23]">
        <Header className="h-24 flex items-center justify-between px-6 max-w-[1200px] mx-auto w-full" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-12">
        {/* SEO Header & Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6 font-sans select-none">
          <Link href="/" className="hover:text-white transition-colors duration-200">
            Accueil
          </Link>
          <span className="text-gray-700 font-bold">/</span>
          <span className="text-white font-black">Boutique</span>
        </nav>

        <section className="mb-10 text-left border-b border-spoolio-border/40 pb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Boutique Spoolio 3D
          </h1>
          <p className="text-gray-400 text-sm max-w-3xl leading-relaxed font-sans">
            Découvrez nos créations exclusives imprimées en 3D en France. Des fidgets satisfaisants, des supports de bureaux designs et des cadeaux originaux, tous fabriqués de façon éco-responsable en PLA biodégradable à partir d'amidon de maïs. Faites le choix du fun et de la qualité locale !
          </p>
        </section>

        {/* Filter Toolbar Section */}
        <section className="flex flex-col lg:flex-row gap-6 mb-10 items-stretch lg:items-center justify-between select-none">
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
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-11 pl-4 pr-10 text-xs font-bold bg-spoolio-card border border-spoolio-border rounded-xl text-white outline-none cursor-pointer appearance-none focus:border-white/40 transition-all"
              >
                <option value="all">Toutes les catégories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#131316]">
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Sorting Dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="h-11 pl-4 pr-10 text-xs font-bold bg-spoolio-card border border-spoolio-border rounded-xl text-white outline-none cursor-pointer appearance-none focus:border-white/40 transition-all"
              >
                <option value="newest">Trier par : Nouveautés</option>
                <option value="price-asc">Prix : croissant</option>
                <option value="price-desc">Prix : décroissant</option>
                <option value="name-asc">Nom : A-Z</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </section>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {paginatedProducts.map((p) => (
                <div key={p.id} className="h-full">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-2 select-none border-t border-spoolio-border/40 pt-8 mt-12">
                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
                    currentPage === 1
                      ? "border-spoolio-border/20 text-gray-600 cursor-not-allowed"
                      : "border-spoolio-border text-gray-300 hover:border-white hover:text-white cursor-pointer"
                  }`}
                  title="Page précédente"
                >
                  &larr;
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isCurrent = currentPage === pNum;
                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-white border-white text-black shadow-md shadow-white/5"
                          : "bg-spoolio-card border-spoolio-border text-gray-300 hover:border-white/50 hover:text-white"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                {/* Next button */}
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
                    currentPage === totalPages
                      ? "border-spoolio-border/20 text-gray-600 cursor-not-allowed"
                      : "border-spoolio-border text-gray-300 hover:border-white hover:text-white cursor-pointer"
                  }`}
                  title="Page suivante"
                >
                  &rarr;
                </button>
              </nav>
            )}
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
