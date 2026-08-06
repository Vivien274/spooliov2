"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/context/LanguageContext";
import MotionNavigationMenu from "@/components/MotionNavigationMenu";
import MobileMenuDrawer from "@/components/MobileMenuDrawer";

import { Sparkles } from "lucide-react";

interface HeaderProps {
  className?: string;
}

export default function Header({
  className = "relative h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full"
}: HeaderProps) {
  const { locale, setLocale, t } = useTranslation();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const { cartCount, setIsCartOpen } = useCart();
  const [isBouncing, setIsBouncing] = useState<boolean>(false);

  // Trigger bouncy-cart animation when item is added
  useEffect(() => {
    if (cartCount > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 650);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search states
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{
    products: any[];
    blogPosts: any[];
    pages: any[];
    aiAnswer?: string;
  }>({ products: [], blogPosts: [], pages: [] });
  const [searching, setSearching] = useState<boolean>(false);

  useEffect(() => {
    // Sync theme state on component mount
    const isLight = document.documentElement.classList.contains("light");
    if (isLight) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    setTheme(isLight ? "light" : "dark");
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
    if (theme === "dark") {
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
  };

  return (
    <header className={`sticky top-0 z-[99999] w-full transition-all duration-300 ${isSticky
        ? "bg-[#131316]/90 dark:bg-[#131316]/90 light:bg-white/95 backdrop-blur-md border-b border-white/10 light:border-gray-200 shadow-xl"
        : "bg-transparent border-b border-transparent"
      }`}>
      <div className={`mx-auto w-full flex items-center justify-between transition-all duration-300 ${isSticky
          ? "h-16 md:h-20 px-6 md:px-12 max-w-7xl"
          : "h-24 px-6 max-w-[1200px]"
        }`}>
        {/* Mobile Burger Button (left on mobile) */}
        <div className="flex md:hidden mr-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/15 text-white rounded-full border border-white/10 transition-all cursor-pointer z-50"
            title="Menu"
            aria-label={isMobileMenuOpen ? "Fermer le menu mobile" : "Ouvrir le menu mobile"}
          >
            {isMobileMenuOpen ? (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-50 flex items-center gap-2 group">
          <Image
            src="/images/logo.png"
            alt="Spoolio Logo"
            width={130}
            height={38}
            priority
            className={`h-10 w-auto object-contain transition-all ${isSticky && theme === "light" ? "filter invert" : ""
              }`}
          />
        </Link>

        {/* Central Motion Navigation Menu with Morphing Dropdowns & Sliding Pill */}
        <div className="hidden md:flex items-center gap-3">
          <MotionNavigationMenu />

          {/* Search magnifier bubble */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 rounded-full bg-white/10 dark:bg-white/10 light:bg-gray-100 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer shadow-sm border border-white/10 light:border-gray-200"
            title="Rechercher (Cmd+K)"
            aria-label="Rechercher"
          >
            <svg className="w-4 h-4 text-white dark:text-white light:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Header Actions (Theme Toggle + Cart) */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex md:hidden w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center transition-all cursor-pointer border border-white/10"
            title="Rechercher"
            aria-label="Rechercher"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="hidden md:flex w-12 h-12 items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-lg"
            title={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
            aria-label={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
          >
            {theme === "dark" ? (
              // Sun Icon
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
              </svg>
            ) : (
              // Moon Icon
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>


          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className={`relative w-12 h-12 flex items-center justify-center bg-[#ff4f00] hover:bg-[#e04500] text-white rounded-full transition-colors shadow-lg shadow-[#ff4f00]/15 cursor-pointer ${isBouncing ? "animate-bouncy-cart" : ""}`}
            title="Ouvrir le panier"
            aria-label="Ouvrir le panier"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-none no-invert">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Global Search Dialog Modal */}
        {mounted && isSearchOpen && createPortal(
          <div className="fixed inset-0 z-[999999] flex items-start justify-center p-4 sm:p-10 md:p-20 font-sans select-none no-invert">
            {/* Backdrop blur overlay */}
            <div
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
            />

            {/* Search container box */}
            <div className="relative w-full max-w-2xl bg-[#111113] border border-[#222225] rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 transition-all duration-300 animate-scale-up mt-8 search-dialog-box">

              {/* Search Input field */}
              <div className="p-4 border-b border-[#222225] flex items-center gap-3 search-input-container">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des produits, articles d'atelier ou pages..."
                  className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-500 font-sans search-field"
                />
                {searching ? (
                  <svg className="animate-spin h-5 w-5 text-gray-500 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer select-none font-bold"
                  >
                    Effacer
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-500 border border-[#222225] px-1.5 py-0.5 rounded-md font-mono select-none">
                    ESC
                  </span>
                )}
              </div>

              {/* Results sections */}
              <div className="flex-1 overflow-y-auto max-h-[380px] p-6 space-y-6 search-results-content">
                {/* AI Answer Banner */}
                {searchQuery && searchResults.aiAnswer && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/40 text-xs text-purple-200 leading-relaxed font-sans space-y-1.5 shadow-lg animate-in fade-in">
                    <div className="flex items-center gap-2 font-black uppercase text-[10px] text-purple-400 tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                      <span>Recherche Intelligente IA</span>
                    </div>
                    <p className="font-semibold text-gray-200">{searchResults.aiAnswer}</p>
                  </div>
                )}

                {/* If no query, show helper categories/quick links */}
                {!searchQuery && (
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2.5">
                        Raccourcis rapides
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {searchResults.pages?.map((p, idx) => (
                          <Link
                            key={idx}
                            href={`/${p.slug === "boutique" ? "boutique" : p.slug}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#ff4f00]/30 hover:bg-[#ff4f00]/5 transition-all text-xs font-bold text-gray-200 search-shortcut-link"
                          >
                            <span className="text-sm">📄</span>
                            <span>{p.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {searchResults.products?.length > 0 && (
                      <div>
                        <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2.5">
                          Produits populaires
                        </h5>
                        <div className="flex flex-col gap-2">
                          {searchResults.products.map((p) => (
                            <Link
                              key={p.id}
                              href={`/product/${p.slug}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-3.5 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#ff4f00]/30 hover:bg-[#ff4f00]/5 transition-all search-shortcut-link"
                            >
                              <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/5 bg-black/20">
                                {(p.image || p.images?.[0]?.src) && (
                                  <Image
                                    src={p.image || p.images?.[0]?.src}
                                    alt={p.name}
                                    fill
                                    sizes="36px"
                                    className="object-cover no-invert"
                                  />
                                )}
                              </div>
                              <div className="flex-1 flex justify-between items-center text-xs">
                                <span className="font-bold text-white">{p.name}</span>
                                <span className="text-gray-400 font-extrabold">{parseFloat(p.price).toFixed(2)}€</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* If query has text, render results */}
                {searchQuery && (
                  <div className="space-y-5">
                    {/* Products Matches */}
                    {searchResults.products?.length > 0 && (
                      <div>
                        <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2.5">
                          Produits ({searchResults.products.length})
                        </h5>
                        <div className="flex flex-col gap-2">
                          {searchResults.products.map((p) => (
                            <Link
                              key={p.id}
                              href={`/product/${p.slug}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-3.5 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#ff4f00]/30 hover:bg-[#ff4f00]/5 transition-all search-result-item"
                            >
                              <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/5 bg-black/20">
                                {(p.image || p.images?.[0]?.src) && (
                                  <Image
                                    src={p.image || p.images?.[0]?.src}
                                    alt={p.name}
                                    fill
                                    sizes="36px"
                                    className="object-cover no-invert"
                                  />
                                )}
                              </div>
                              <div className="flex-1 flex justify-between items-center text-xs">
                                <span className="font-bold text-white">{p.name}</span>
                                <span className="text-gray-400 font-extrabold">{parseFloat(p.price).toFixed(2)}€</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Blog Matches */}
                    {searchResults.blogPosts?.length > 0 && (
                      <div>
                        <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2.5">
                          Articles d'Atelier ({searchResults.blogPosts.length})
                        </h5>
                        <div className="flex flex-col gap-2">
                          {searchResults.blogPosts.map((post) => (
                            <Link
                              key={post.id}
                              href={`/blog/${post.slug}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#ff4f00]/30 hover:bg-[#ff4f00]/5 transition-all text-xs font-bold text-white search-result-item"
                            >
                              <span className="text-sm">📝</span>
                              <span className="truncate">{post.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pages Matches */}
                    {searchResults.pages?.length > 0 && (
                      <div>
                        <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2.5">
                          Pages ({searchResults.pages.length})
                        </h5>
                        <div className="flex flex-col gap-2">
                          {searchResults.pages.map((p, idx) => (
                            <Link
                              key={idx}
                              href={p.isStatic ? `/${p.slug}` : `/page/${p.slug}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#ff4f00]/30 hover:bg-[#ff4f00]/5 transition-all text-xs font-bold text-white search-result-item"
                            >
                              <span className="text-sm">📄</span>
                              <span className="truncate">{p.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Results Message */}
                    {searchResults.products?.length === 0 &&
                      searchResults.blogPosts?.length === 0 &&
                      searchResults.pages?.length === 0 && (
                        <div className="text-center py-10 text-xs text-gray-500 font-medium">
                          Aucun résultat trouvé pour « {searchQuery} ». Essayez d'autres mots clés.
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

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
      </div>
    </header>
  );
}
