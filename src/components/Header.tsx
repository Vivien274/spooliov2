"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/context/LanguageContext";
import MotionNavigationMenu from "@/components/MotionNavigationMenu";
import MobileMenuDrawer from "@/components/MobileMenuDrawer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import VacationBanner from "@/components/VacationBanner";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Search, X, Loader2, ArrowRight } from "lucide-react";

interface HeaderProps {
  className?: string;
  isDark?: boolean;
}

const POPULAR_SEARCH_TAGS = [
  { label: "Dragons", emoji: "🐉", query: "dragon" },
  { label: "Objets tactiles", emoji: "⚙️", query: "fidget" },
  { label: "Pochettes surprises", emoji: "🎁", query: "surprise" },
  { label: "Porte-clés", emoji: "🔑", query: "porte-cle" },
  { label: "Boussole", emoji: "🧭", query: "boussole" },
  { label: "Clickers", emoji: "🖱️", query: "clicker" },
];

const QUICK_PAGE_SHORTCUTS = [
  { title: "Toute la Boutique", href: "/boutique", icon: "🛍️", desc: "Découvrir toutes les créations & pièces d'atelier" },
  { title: "Boussole Sensorielle", href: "/boussole-sensorielle", icon: "🧭", desc: "Trouvez l'objet adapté à votre manipulation" },
  { title: "Créateur de Clicker", href: "/createur-cliqueur", icon: "🖱️", desc: "Personnalisez votre clicker tactile sur-mesure" },
  { title: "Blind Bags", href: "/blind-bags", icon: "🎁", desc: "Le pack mystère kraft prêt à offrir" },
];

export default function Header({
  className = "relative h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full",
  isDark = false,
}: HeaderProps) {
  const { locale, setLocale, t } = useTranslation();
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const { cartCount, setIsCartOpen } = useCart();
  const [isBouncing, setIsBouncing] = useState<boolean>(false);

  // Trigger bouncy-cart animation when item is added
  useEffect(() => {
    if (cartCount > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const [isSticky, setIsSticky] = useState<boolean>(false);

  // Track sticky state on scroll with subtle threshold
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [mounted, setMounted] = useState<boolean>(false);

  // Avoid SSR hydration issues for portal components
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogoClick = () => {
    if (typeof window !== "undefined") {
      const clicks = ((window as any)._spoolioLogoClicks =
        ((window as any)._spoolioLogoClicks || 0) + 1);
      if (clicks >= 3) {
        window.dispatchEvent(new CustomEvent("unlock-spooly"));
        (window as any)._spoolioLogoClicks = 0;
      } else {
        setTimeout(() => {
          (window as any)._spoolioLogoClicks = 0;
        }, 1500);
      }
    }
  };

  // Live search state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{
    products: any[];
    blogPosts: any[];
    pages: any[];
    aiAnswer?: string;
  }>({ products: [], blogPosts: [], pages: [] });
  const [searching, setSearching] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when search dropdown opens
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 75);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    // Force light theme
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    setTheme("light");
  }, []);

  // Re-sync theme state whenever mobile menu is opened
  useEffect(() => {
    if (isMobileMenuOpen) {
      const isLight = document.documentElement.classList.contains("light");
      setTheme(isLight ? "light" : "dark");
    }
  }, [isMobileMenuOpen]);

  // Prevent background body scrolling when mobile drawer or search modal is open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  // Keyboard shortcut for search modale (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch search results on search query change with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (e) {
        console.error("Error fetching search results:", e);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }

    // Fire & forget theme tracking POST request
    fetch("/api/analytics/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: nextTheme }),
    }).catch(() => {});
  };

  return (
    <>
      <header
        data-header-theme={isDark ? "dark" : "light"}
        className={`fixed top-0 left-0 right-0 z-[99999] w-full transition-all duration-300 ${
          isDark
            ? `header-dark ${isSticky ? "header-sticky bg-black/85 backdrop-blur-2xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.6)]" : "bg-transparent border-transparent shadow-none"}`
            : isSticky
              ? "header-light header-sticky bg-white/90 backdrop-blur-2xl border-b border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
              : "header-light bg-white/75 backdrop-blur-md border-b border-zinc-200/60"
        }`}
        style={
          isDark
            ? {
                backgroundColor: isSticky ? "rgba(10, 10, 14, 0.88)" : "transparent",
                backdropFilter: isSticky ? "blur(24px)" : "none",
                WebkitBackdropFilter: isSticky ? "blur(24px)" : "none",
                borderBottom: isSticky ? "1px solid rgba(255, 255, 255, 0.15)" : "none",
                boxShadow: isSticky ? "0 10px 30px -5px rgba(0, 0, 0, 0.6)" : "none",
              }
            : undefined
        }
      >
      <VacationBanner />
      <div className={`w-full max-w-[1440px] mx-auto transition-all duration-300 relative z-10 ${isSticky
          ? "h-16 md:h-20 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12"
          : "h-20 md:h-24 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12"
        }`}>
        {/* ========================================================================= */}
        {/* DESKTOP 3-ZONE HEADER (md and up)                                         */}
        {/* [ ZONE GAUCHE: Logo ] [ ZONE CENTRALE: Nav ] [ ZONE DROITE: Actions ]     */}
        {/* ========================================================================= */}
        <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] items-center w-full h-full">
          {/* ZONE GAUCHE : Logo Spoolio (largeur naturelle, centré verticalement) */}
          <div className="flex items-center justify-start min-w-0">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center cursor-pointer no-invert group shrink-0"
              title="Spoolio - Accueil"
            >
              <Image
                src={isDark ? "/images/logo-spoolio-eyes-white.png" : "/images/logo-spoolio-eyes.png"}
                alt="Spoolio Logo"
                width={136}
                height={40}
                priority
                className="h-8 lg:h-9 w-auto object-contain transition-all duration-300 header-logo group-hover:opacity-90"
              />
            </Link>
          </div>

          {/* ZONE CENTRALE : Navigation principale (réellement centrée visuellement) */}
          <div className="flex items-center justify-center px-1 lg:px-3">
            <MotionNavigationMenu isDark={isDark} />
          </div>

          {/* ZONE DROITE : Actions utilisateur (Recherche · Panier) */}
          <div className="flex items-center justify-end gap-2 lg:gap-2.5 shrink-0">

            {/* Action neutre : Recherche iconique */}
            <button
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className={`w-9.5 h-9.5 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0 header-search-btn ${
                isSearchOpen
                  ? "bg-zinc-900 text-white border border-zinc-900 scale-105 search-active"
                  : isDark
                    ? "bg-white/10 hover:bg-white/20 text-white border border-white/20 no-invert"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border border-zinc-200/70"
              }`}
              title={isSearchOpen ? "Fermer la recherche (ESC)" : "Rechercher (Cmd+K)"}
              aria-label={isSearchOpen ? "Fermer la recherche" : "Rechercher"}
            >
              {isSearchOpen ? (
                <X className="w-4 h-4 text-white" />
              ) : (
                <svg
                  className={`w-4 h-4 ${isDark ? "text-white" : "text-black"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>

            {/* Action forte : Panier orange Spoolio */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative w-9.5 h-9.5 lg:w-10 lg:h-10 flex items-center justify-center bg-[#ff4f00] hover:bg-[#e04500] text-white rounded-full transition-all shadow-md shadow-[#ff4f00]/25 cursor-pointer shrink-0 ${
                isBouncing ? "animate-bouncy-cart" : ""
              }`}
              title="Ouvrir le panier"
              aria-label="Ouvrir le panier"
            >
              <svg className="w-4 h-4 md:w-4.5 md:h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-none no-invert">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE / TABLET HEADER (below md)                                         */}
        {/* Burger à gauche, Logo centré, Recherche + Panier à droite                 */}
        {/* ========================================================================= */}
        <div className="flex md:hidden items-center justify-between w-full h-full relative">
          {/* Mobile Burger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer z-50 ${
              isDark
                ? "bg-transparent hover:bg-white/10 text-white no-invert"
                : "bg-transparent hover:bg-zinc-100 text-zinc-900"
            }`}
            title="Menu"
            aria-label={isMobileMenuOpen ? "Fermer le menu mobile" : "Ouvrir le menu mobile"}
          >
            {isMobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            )}
          </button>

          {/* Logo centré sur mobile */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto flex items-center justify-center">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center justify-center cursor-pointer no-invert"
            >
              <Image
                src={isDark ? "/images/logo-spoolio-eyes-white.png" : "/images/logo-spoolio-eyes.png"}
                alt="Spoolio Logo"
                width={130}
                height={38}
                priority
                className="h-8 sm:h-9 w-auto object-contain header-logo"
              />
            </Link>
          </div>

          {/* Actions Droite Mobile (Recherche + Panier) */}
          <div className="flex items-center gap-2 z-30">
            <button
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className={`w-9.5 h-9.5 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm header-search-btn ${
                isSearchOpen
                  ? "bg-zinc-900 text-white border border-zinc-900 scale-105 search-active"
                  : isDark
                    ? "bg-white/10 hover:bg-white/20 text-white border border-white/20 no-invert"
                    : "bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200/80"
              }`}
              title={isSearchOpen ? "Fermer la recherche (ESC)" : "Rechercher"}
              aria-label={isSearchOpen ? "Fermer la recherche" : "Rechercher"}
            >
              {isSearchOpen ? (
                <X className="w-4 h-4 text-white" />
              ) : (
                <svg
                  className={`w-4 h-4 ${isDark ? "text-white" : "text-black"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative w-9.5 h-9.5 flex items-center justify-center bg-[#ff4f00] hover:bg-[#e04500] text-white rounded-full transition-colors shadow-lg shadow-[#ff4f00]/20 cursor-pointer ${
                isBouncing ? "animate-bouncy-cart" : ""
              }`}
              title="Ouvrir le panier"
              aria-label="Ouvrir le panier"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-none no-invert">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

        {/* Search Dropdown Panel (Apple / Nike style) */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              key="search-dropdown-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full bg-white/98 dark:bg-[#121216]/98 backdrop-blur-2xl border-t border-zinc-200/80 dark:border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.12)] overflow-hidden text-zinc-900 dark:text-zinc-100"
            >
              <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-5 sm:py-6 space-y-4">
                {/* Search Bar Input */}
                <div className="relative flex items-center gap-3 bg-zinc-100/90 dark:bg-white/5 rounded-2xl px-4 py-3 border border-zinc-200/80 dark:border-white/10 focus-within:border-[#ff4f00] focus-within:ring-2 focus-within:ring-[#ff4f00]/20 transition-all">
                  <Search className="w-5 h-5 text-zinc-500 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un fidget, une création 3D, une couleur..."
                    className="w-full bg-transparent outline-none text-sm sm:text-base text-zinc-900 dark:text-white placeholder-zinc-400 font-sans"
                  />
                  {searching ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#ff4f00] shrink-0" />
                  ) : searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                      title="Effacer la recherche"
                      aria-label="Effacer la recherche"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  >
                    <span>Fermer</span>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-200/80 dark:bg-white/10 rounded-md">ESC</kbd>
                  </button>
                </div>

                {/* Quick Suggestion Pills */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  <span className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#ff4f00]" /> Idées :
                  </span>
                  {POPULAR_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => setSearchQuery(tag.query)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all shrink-0 cursor-pointer active:scale-95 ${
                        searchQuery.toLowerCase() === tag.query.toLowerCase()
                          ? "bg-[#ff4f00] text-white border-[#ff4f00] shadow-sm"
                          : "bg-zinc-100 hover:bg-[#ff4f00]/10 hover:text-[#ff4f00] dark:bg-white/5 dark:hover:bg-[#ff4f00]/20 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-white/5"
                      }`}
                    >
                      <span>{tag.emoji}</span>
                      <span>{tag.label}</span>
                    </button>
                  ))}
                </div>

                {/* Results Container */}
                <div className="max-h-[min(65vh,480px)] overflow-y-auto custom-scrollbar pr-1 pt-2 pb-3 space-y-6">
                  {/* AI Smart Advice Banner */}
                  {searchQuery && searchResults.aiAnswer && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-orange-50/90 dark:from-[#ff4f00]/10 dark:to-amber-500/10 border border-orange-200/70 dark:border-[#ff4f00]/20 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-2 font-bold uppercase text-[10px] text-[#ff4f00] tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        <span>Conseil de l'Atelier Spoolio</span>
                      </div>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{searchResults.aiAnswer}</p>
                    </div>
                  )}

                  {/* Case 1: Search Query is Active */}
                  {searchQuery ? (
                    <div className="space-y-6">
                      {/* Products */}
                      {searchResults.products?.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                              <span>🛍️</span>
                              <span>Produits ({searchResults.products.length})</span>
                            </h5>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                            {searchResults.products.map((p: any) => {
                              const rawPrice = p.price;
                              const formattedPrice =
                                typeof rawPrice === "number"
                                  ? rawPrice.toFixed(2)
                                  : !isNaN(parseFloat(rawPrice))
                                    ? parseFloat(rawPrice).toFixed(2)
                                    : rawPrice;
                              const imgUrl = p.image || p.images?.[0]?.src;

                              return (
                                <Link
                                  key={p.id}
                                  href={`/product/${p.slug}`}
                                  onClick={() => setIsSearchOpen(false)}
                                  className="group flex flex-col p-2.5 rounded-2xl bg-zinc-50/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-zinc-200/80 dark:border-white/10 hover:border-[#ff4f00] dark:hover:border-[#ff4f00] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                >
                                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-white/5 mb-2.5">
                                    {imgUrl ? (
                                      <Image
                                        src={imgUrl}
                                        alt={p.name}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out no-invert"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-zinc-300 text-2xl">
                                        📦
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 flex flex-col justify-between">
                                    <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white group-hover:text-[#ff4f00] transition-colors line-clamp-1">
                                      {p.name}
                                    </h4>
                                    <div className="mt-1.5 flex items-center justify-between">
                                      <span className="text-xs font-black text-[#ff4f00]">
                                        {formattedPrice} €
                                      </span>
                                      <span className="text-[10px] font-semibold text-zinc-400 group-hover:text-[#ff4f00] transition-colors flex items-center gap-0.5">
                                        Voir <ArrowRight className="w-2.5 h-2.5" />
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Blog Articles */}
                      {searchResults.blogPosts?.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <h5 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                              <span>📝</span>
                              <span>Articles d'Atelier ({searchResults.blogPosts.length})</span>
                            </h5>
                            <Link
                              href="/blog"
                              onClick={() => setIsSearchOpen(false)}
                              className="text-[11px] font-bold text-[#ff4f00] hover:underline"
                            >
                              Tous les articles →
                            </Link>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {searchResults.blogPosts.slice(0, 4).map((post: any) => (
                              <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                onClick={() => setIsSearchOpen(false)}
                                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-white/5 hover:bg-orange-50/40 dark:hover:bg-[#ff4f00]/10 border border-zinc-200/80 dark:border-white/10 hover:border-[#ff4f00]/50 transition-all text-xs font-bold text-zinc-800 dark:text-zinc-200 group"
                              >
                                <span className="truncate group-hover:text-[#ff4f00] transition-colors">{post.title}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#ff4f00] shrink-0 transition-colors" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pages */}
                      {searchResults.pages?.length > 0 && (
                        <div>
                          <h5 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span>📄</span>
                            <span>Pages ({searchResults.pages.length})</span>
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {searchResults.pages.map((p: any, idx: number) => (
                              <Link
                                key={idx}
                                href={p.isStatic ? `/${p.slug}` : `/page/${p.slug}`}
                                onClick={() => setIsSearchOpen(false)}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 hover:bg-orange-50/40 dark:hover:bg-[#ff4f00]/10 border border-zinc-200/80 dark:border-white/10 hover:border-[#ff4f00]/50 transition-all text-xs font-bold text-zinc-800 dark:text-zinc-200 group"
                              >
                                <span className="group-hover:text-[#ff4f00] transition-colors">{p.title}</span>
                                <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-[#ff4f00] transition-colors" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No Results Fallback */}
                      {searchResults.products?.length === 0 &&
                        searchResults.blogPosts?.length === 0 &&
                        searchResults.pages?.length === 0 &&
                        !searching && (
                          <div className="text-center py-10 px-4 space-y-3">
                            <span className="text-4xl block">🔍</span>
                            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                              Aucun objet trouvé pour « {searchQuery} »
                            </p>
                            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                              Essayez avec un mot-clé plus simple comme « dragon », « fidget », « clicker », ou parcourez nos créations.
                            </p>
                            <Link
                              href="/boutique"
                              onClick={() => setIsSearchOpen(false)}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ff4f00] hover:bg-[#e04500] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#ff4f00]/20"
                            >
                              <span>Explorer la boutique</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                    </div>
                  ) : (
                    /* Case 2: Empty query (Initial recommendations) */
                    <div className="space-y-6">
                      {/* Popular featured products */}
                      {searchResults.products?.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                              <span>🔥</span>
                              <span>Coups de cœur de l'atelier</span>
                            </h5>
                            <Link
                              href="/boutique"
                              onClick={() => setIsSearchOpen(false)}
                              className="text-[11px] font-bold text-[#ff4f00] hover:underline"
                            >
                              Voir tout →
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                            {searchResults.products.slice(0, 4).map((p: any) => {
                              const rawPrice = p.price;
                              const formattedPrice =
                                typeof rawPrice === "number"
                                  ? rawPrice.toFixed(2)
                                  : !isNaN(parseFloat(rawPrice))
                                    ? parseFloat(rawPrice).toFixed(2)
                                    : rawPrice;
                              const imgUrl = p.image || p.images?.[0]?.src;

                              return (
                                <Link
                                  key={p.id}
                                  href={`/product/${p.slug}`}
                                  onClick={() => setIsSearchOpen(false)}
                                  className="group flex flex-col p-2.5 rounded-2xl bg-zinc-50/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-zinc-200/80 dark:border-white/10 hover:border-[#ff4f00] dark:hover:border-[#ff4f00] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                >
                                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-white/5 mb-2.5">
                                    {imgUrl ? (
                                      <Image
                                        src={imgUrl}
                                        alt={p.name}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out no-invert"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-zinc-300 text-2xl">
                                        📦
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 flex flex-col justify-between">
                                    <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white group-hover:text-[#ff4f00] transition-colors line-clamp-1">
                                      {p.name}
                                    </h4>
                                    <div className="mt-1.5 flex items-center justify-between">
                                      <span className="text-xs font-black text-[#ff4f00]">
                                        {formattedPrice} €
                                      </span>
                                      <span className="text-[10px] font-semibold text-zinc-400 group-hover:text-[#ff4f00] transition-colors flex items-center gap-0.5">
                                        Découvrir <ArrowRight className="w-2.5 h-2.5" />
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Quick universe shortcuts */}
                      <div>
                        <h5 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <span>⚡</span>
                          <span>Découvrir l'univers Spoolio</span>
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {QUICK_PAGE_SHORTCUTS.map((item, idx) => (
                            <Link
                              key={idx}
                              href={item.href}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50/80 dark:bg-white/5 hover:bg-orange-50/40 dark:hover:bg-[#ff4f00]/10 border border-zinc-200/80 dark:border-white/10 hover:border-[#ff4f00]/50 transition-all group"
                            >
                              <span className="text-xl shrink-0">{item.icon}</span>
                              <div className="min-w-0 flex-1">
                                <h6 className="font-bold text-xs text-zinc-900 dark:text-white group-hover:text-[#ff4f00] transition-colors truncate">
                                  {item.title}
                                </h6>
                                <p className="text-[10px] text-zinc-500 truncate">
                                  {item.desc}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Soft Dim Backdrop Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsSearchOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[99998]"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer Navigation Menu (Portaled to document.body) */}
      {mounted && createPortal(
        <MobileMenuDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onOpenSearch={() => setIsSearchOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
          t={t}
        />,
        document.body
      )}
    </>
  );
}
