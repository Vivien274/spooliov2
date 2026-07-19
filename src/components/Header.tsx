"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

interface HeaderProps {
  className?: string;
}

export default function Header({ className = "" }: HeaderProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const { cartCount, setIsCartOpen } = useCart();

  // Search states
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{
    products: any[];
    blogPosts: any[];
    pages: any[];
  }>({ products: [], blogPosts: [], pages: [] });
  const [searching, setSearching] = useState<boolean>(false);

  useEffect(() => {
    // Sync theme state on component mount
    const isLight = document.documentElement.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
  }, []);

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
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  return (
    <header className={className}>
      {/* Mobile Burger Button (left on mobile) */}
      <div className="flex md:hidden mr-2">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/15 text-white rounded-full border border-white/10 transition-all cursor-pointer z-50"
          title="Menu"
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
          className="h-10 w-auto object-contain"
        />
      </Link>

      {/* Central Search Pill Menu with Glassmorphism */}
      <div className="hidden md:flex items-center gap-6 px-6 py-2.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[12px] font-semibold text-white/90 select-none shadow-lg">
        <div className="relative group/menu flex items-center gap-1 hover:text-white cursor-pointer transition-colors py-1.5">
          <Link href="/boutique" className="flex items-center gap-1">
            <span>Boutique</span>
            <svg className="w-3 h-3 text-white/70 transition-transform duration-200 group-hover/menu:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
 
          {/* Dropdown Menu Wrapper (Continuous hover area) */}
          <div className="absolute top-[80%] left-1/2 -translate-x-1/2 pt-4 w-68 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 transform scale-95 group-hover/menu:scale-100 z-50 cursor-default">
            <div className="bg-[#131316]/95 backdrop-blur-lg border border-[#1f1f23] rounded-2xl p-3 shadow-2xl text-white/80">
              <div className="flex flex-col gap-1">
                <Link href="/boutique?category=Accessoires" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-[10px] font-bold tracking-wider uppercase">
                  <span>Accessoires</span>
                </Link>
                <Link href="/boutique?category=Animaux & Figurines" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-[10px] font-bold tracking-wider uppercase">
                  <span>Animaux & Figurines</span>
                </Link>
                <Link href="/boutique?category=Fidgets" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-[10px] font-bold tracking-wider uppercase">
                  <span>Fidgets</span>
                  <span className="bg-red-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wide leading-none shadow-sm no-invert">HOT !</span>
                </Link>
                <Link href="/boutique?category=Décoration" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-[10px] font-bold tracking-wider uppercase">
                  <span>Décoration</span>
                </Link>
                <Link href="/boutique?category=Jeux & activités" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-[10px] font-bold tracking-wider uppercase">
                  <span>Jeux & activités</span>
                </Link>
                <Link href="/boutique?category=Porte clés" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-[10px] font-bold tracking-wider uppercase">
                  <span>Porte clés</span>
                </Link>
                <Link href="/boutique?category=Geek / Gaming" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-[10px] font-bold tracking-wider uppercase">
                  <span>Geek / Gaming</span>
                  <span className="bg-[#ff4f00] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wide leading-none shadow-sm whitespace-nowrap no-invert">TOUT CHAUD !</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <a href="https://boussole.spoolio.fr" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer transition-colors">Boussole Sensorielle</a>
        <Link href="/blog" className="hover:text-white cursor-pointer transition-colors">L'Atelier</Link>

        {/* Search magnifier bubble */}
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors ml-2 cursor-pointer shadow-sm border border-white/5"
          title="Rechercher (Cmd+K)"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-lg"
          title={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
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
          className="relative w-12 h-12 flex items-center justify-center bg-[#ff4f00] hover:bg-[#e04500] text-white rounded-full transition-colors shadow-lg shadow-[#ff4f00]/15 cursor-pointer"
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
      {isSearchOpen && (
        <div className="fixed inset-0 z-[20000] flex items-start justify-center p-4 sm:p-10 md:p-20 font-sans select-none no-invert">
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
                              {p.images[0] && (
                                <Image
                                  src={p.images[0].src}
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
                              {p.images[0] && (
                                <Image
                                  src={p.images[0].src}
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
        </div>
      )}

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-0 left-0 w-screen h-screen z-[15000] flex md:hidden font-sans select-none no-invert">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
          />

          {/* Drawer menu content (slide-in from left) */}
          <div className="relative w-[300px] max-w-full h-screen bg-[#0d0d0f] border-r border-[#1f1f23] flex flex-col justify-between p-6 shadow-2xl z-10 transition-all duration-300 animate-slide-in">
            <div className="flex flex-col gap-6">
              {/* Logo & close row */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="relative z-50 flex items-center gap-2">
                  <Image
                    src="/images/logo.png"
                    alt="Spoolio Logo"
                    width={110}
                    height={32}
                    className="h-8 w-auto object-contain"
                  />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation links */}
              <nav className="flex flex-col gap-5">
                {/* Categories title */}
                <div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">
                    La Boutique (Catégories)
                  </span>
                  <div className="flex flex-col gap-2">
                    <Link 
                      href="/boutique" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 text-xs font-bold text-gray-200 hover:text-white rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors"
                    >
                      <span>Tous les produits</span>
                      <span className="text-gray-600">→</span>
                    </Link>
                    <Link 
                      href="/boutique?category=Accessoires" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 text-xs font-bold text-gray-300 hover:text-white rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors"
                    >
                      <span>Accessoires</span>
                    </Link>
                    <Link 
                      href="/boutique?category=Animaux & Figurines" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 text-xs font-bold text-gray-300 hover:text-white rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors"
                    >
                      <span>Animaux & Figurines</span>
                    </Link>
                    <Link 
                      href="/boutique?category=Fidgets" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 text-xs font-bold text-gray-300 hover:text-white rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors"
                    >
                      <span>Fidgets</span>
                      <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide leading-none no-invert">HOT</span>
                    </Link>
                    <Link 
                      href="/boutique?category=Décoration" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 text-xs font-bold text-gray-300 hover:text-white rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors"
                    >
                      <span>Décoration</span>
                    </Link>
                    <Link 
                      href="/boutique?category=Jeux & activités" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 text-xs font-bold text-gray-300 hover:text-white rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors"
                    >
                      <span>Jeux & activités</span>
                    </Link>
                    <Link 
                      href="/boutique?category=Porte clés" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 text-xs font-bold text-gray-300 hover:text-white rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors"
                    >
                      <span>Porte clés</span>
                    </Link>
                    <Link 
                      href="/boutique?category=Geek / Gaming" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 text-xs font-bold text-gray-300 hover:text-white rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors"
                    >
                      <span>Geek / Gaming</span>
                      <span className="bg-[#ff4f00] text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide leading-none no-invert">NEW</span>
                    </Link>
                  </div>
                </div>

                {/* Others title */}
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">
                    Découvrir
                  </span>
                  <div className="flex flex-col gap-2">
                    <a 
                      href="https://boussole.spoolio.fr" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-2 text-xs font-bold text-gray-200 hover:text-white rounded-lg hover:bg-white/5 block transition-colors"
                    >
                      🧩 Boussole Sensorielle
                    </a>
                    <Link 
                      href="/pro" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 text-xs font-bold text-gray-200 hover:text-white rounded-lg hover:bg-white/5 block transition-colors"
                    >
                      💼 Spoolio pour les pros
                    </Link>
                    <Link 
                      href="/blog" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 text-xs font-bold text-gray-200 hover:text-white rounded-lg hover:bg-white/5 block transition-colors"
                    >
                      📝 L'Atelier (Blog)
                    </Link>
                  </div>
                </div>
              </nav>
            </div>

            {/* Bottom contact signature */}
            <div className="text-[10px] text-gray-600 border-t border-white/5 pt-4">
              <span>Spoolio V2 - Fait avec passion</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
