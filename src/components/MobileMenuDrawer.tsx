"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Sparkles,
  Compass,
  Gift,
  Ticket,
  Heart,
  Gamepad2,
  Smile,
  Key,
  Palette,
  Building2,
  BookOpen,
  HelpCircle,
  Search,
  X,
  ChevronRight,
  Sun,
  Moon,
  ChevronDown,
  Layers,
  ShieldCheck,
} from "lucide-react";

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  t: (key: string) => string;
}

export default function MobileMenuDrawer({
  isOpen,
  onClose,
  onOpenSearch,
  theme,
  toggleTheme,
  t,
}: MobileMenuDrawerProps) {
  const [categoriesExpanded, setCategoriesExpanded] = useState<boolean>(true);
  const [atelierExpanded, setAtelierExpanded] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex md:hidden font-sans select-none animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Drawer Container (slide-in from left) */}
      <div className="mobile-drawer-bg relative w-[350px] max-w-[90vw] h-full bg-white dark:bg-[#121215]/98 backdrop-blur-3xl border-r border-gray-200 dark:border-white/15 flex flex-col justify-between p-5 shadow-[0_0_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 animate-in slide-in-from-left duration-300 text-gray-900 dark:text-white">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Spoolio Logo"
              width={110}
              height={32}
              className="mobile-drawer-logo h-8 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className="mobile-drawer-close w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer active:scale-95"
              aria-label="Rechercher"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="mobile-drawer-close w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer active:scale-95"
              aria-label="Fermer le menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-5 custom-scrollbar">
          
          {/* Quick Search Banner */}
          <button
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="mobile-drawer-btn w-full h-12 px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-between text-xs text-gray-700 dark:text-gray-300 transition-all cursor-pointer group active:scale-[0.99]"
          >
            <span className="flex items-center gap-3">
              <Search className="w-4 h-4 text-gray-400 group-hover:text-[#ff4f00] transition-colors" />
              <span className="font-semibold">Rechercher un produit...</span>
            </span>
            <span className="mobile-drawer-badge text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400">
              ⌘K
            </span>
          </button>

          {/* Featured 2x2 Grid of Experiences */}
          <div className="space-y-2.5">
            <span className="mobile-drawer-header text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
              Expériences &amp; Jeux
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/pochette-surprise"
                onClick={onClose}
                className="group p-3.5 rounded-2xl bg-gradient-to-br from-[#ff4f00]/15 via-gray-100 dark:via-white/5 to-transparent border border-gray-200 dark:border-white/10 hover:border-[#ff4f00]/50 transition-all flex flex-col justify-between min-h-[105px] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-[#ff4f00]/20 text-[#ff4f00]">
                    <Gift className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#ff4f00] text-white uppercase no-invert">
                    FUN
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#ff4f00] transition-colors leading-tight">
                    Pochettes 3D
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">Surprises &amp; drops</p>
                </div>
              </Link>

              <Link
                href="/boussole-sensorielle"
                onClick={onClose}
                className="group p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/15 via-gray-100 dark:via-white/5 to-transparent border border-gray-200 dark:border-white/10 hover:border-cyan-400/50 transition-all flex flex-col justify-between min-h-[105px] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-500 dark:text-cyan-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 uppercase no-invert">
                    TEST
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors leading-tight">
                    Boussole
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">Guide apaisant</p>
                </div>
              </Link>

              <Link
                href="/createur-cliqueur"
                onClick={onClose}
                className="group p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/15 via-gray-100 dark:via-white/5 to-transparent border border-gray-200 dark:border-white/10 hover:border-purple-400/50 transition-all flex flex-col justify-between min-h-[105px] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-500 dark:text-purple-400">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-400 uppercase no-invert">
                    3D
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors leading-tight">
                    Clicker 3D
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">Sur-mesure</p>
                </div>
              </Link>

              <Link
                href="/tombola"
                onClick={onClose}
                className="group p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-gray-100 dark:via-white/5 to-transparent border border-gray-200 dark:border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between min-h-[105px] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 uppercase no-invert">
                    JEU
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors leading-tight">
                    Tombola
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">Gagner le pack</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Section: Boutique & Catégories (Accordion Header - Clean transparent top level) */}
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-white/10">
            <button
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
              className="w-full min-h-[44px] px-1 py-2 flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-white/80 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#ff4f00]/20 text-[#ff4f00]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span>Boutique &amp; Catégories</span>
              </span>
              <div className={`p-1 transition-transform duration-200 ${categoriesExpanded ? "rotate-180" : ""}`}>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {categoriesExpanded && (
              <div className="space-y-2 pt-1">
                {/* Full shop banner */}
                <Link
                  href="/boutique"
                  onClick={onClose}
                  className="min-h-[50px] px-4 py-3 rounded-2xl bg-gradient-to-r from-[#2F3CD9]/20 via-[#5163FF]/20 to-[#2F3CD9]/15 border border-[#2F3CD9]/40 text-gray-900 dark:text-white font-bold text-xs flex items-center justify-between hover:border-[#2F3CD9] transition-all active:scale-[0.99]"
                >
                  <span className="flex items-center gap-3">
                    <div className="p-1.5 rounded-xl bg-[#2F3CD9] text-white">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-gray-900 dark:text-white">Toute la boutique</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                {/* Touch-Friendly Category Rows */}
                <Link
                  href="/categorie/Fidgets"
                  onClick={onClose}
                  className="mobile-drawer-link min-h-[48px] px-3.5 py-2.5 rounded-xl bg-gray-100/80 dark:bg-white/[0.04] hover:bg-gray-200/80 dark:hover:bg-white/[0.08] border border-gray-200/80 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/15 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white transition-all active:scale-[0.99]"
                >
                  <span className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-[#ff4f00]/20 text-[#ff4f00]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span>Fidgets &amp; Anti-stress</span>
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-[#ff4f00] text-white no-invert">
                    HOT
                  </span>
                </Link>

                <Link
                  href="/categorie/Geek %2F Gaming"
                  onClick={onClose}
                  className="mobile-drawer-link min-h-[48px] px-3.5 py-2.5 rounded-xl bg-gray-100/80 dark:bg-white/[0.04] hover:bg-gray-200/80 dark:hover:bg-white/[0.08] border border-gray-200/80 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/15 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white transition-all active:scale-[0.99]"
                >
                  <span className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-500 dark:text-cyan-400">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <span>Geek &amp; Gaming</span>
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 no-invert">
                    NEW
                  </span>
                </Link>

                <Link
                  href="/categorie/Porte clés"
                  onClick={onClose}
                  className="mobile-drawer-link min-h-[48px] px-3.5 py-2.5 rounded-xl bg-gray-100/80 dark:bg-white/[0.04] hover:bg-gray-200/80 dark:hover:bg-white/[0.08] border border-gray-200/80 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/15 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white transition-all active:scale-[0.99]"
                >
                  <span className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <span>Porte-clés 3D</span>
                  </span>
                  <ChevronRight className="mobile-drawer-arrow w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/categorie/Animaux %26 Figurines"
                  onClick={onClose}
                  className="mobile-drawer-link min-h-[48px] px-3.5 py-2.5 rounded-xl bg-gray-100/80 dark:bg-white/[0.04] hover:bg-gray-200/80 dark:hover:bg-white/[0.08] border border-gray-200/80 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/15 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white transition-all active:scale-[0.99]"
                >
                  <span className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 dark:text-emerald-400">
                      <Smile className="w-4 h-4" />
                    </div>
                    <span>Animaux &amp; Figurines</span>
                  </span>
                  <ChevronRight className="mobile-drawer-arrow w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/medaillon-nfc-chien-chat"
                  onClick={onClose}
                  className="mobile-drawer-link min-h-[48px] px-3.5 py-2.5 rounded-xl bg-[#ff4f00]/10 dark:bg-[#ff4f00]/15 hover:bg-[#ff4f00]/20 border border-[#ff4f00]/30 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-900 dark:text-white transition-all active:scale-[0.99]"
                >
                  <span className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-[#ff4f00]/20 text-[#ff4f00]">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span>Médaillons NFC Chien, Chat &amp; Enfant</span>
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-[#ff4f00] text-white no-invert">
                    SOS
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Section: L'Atelier & Infos (Accordion Header - Clean transparent top level) */}
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-white/10">
            <button
              onClick={() => setAtelierExpanded(!atelierExpanded)}
              className="w-full min-h-[44px] px-1 py-2 flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-white/80 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-500 dark:text-purple-400">
                  <Palette className="w-4 h-4" />
                </div>
                <span>L'Atelier &amp; Infos</span>
              </span>
              <div className={`p-1 transition-transform duration-200 ${atelierExpanded ? "rotate-180" : ""}`}>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {atelierExpanded && (
              <div className="space-y-2 pt-1">
                <Link
                  href="/a-propos"
                  onClick={onClose}
                  className="mobile-drawer-link min-h-[48px] px-3.5 py-2.5 rounded-xl bg-gray-100/80 dark:bg-white/[0.04] hover:bg-gray-200/80 dark:hover:bg-white/[0.08] border border-gray-200/80 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/15 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white transition-all active:scale-[0.99]"
                >
                  <span className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-[#ff4f00]/20 text-[#ff4f00]">
                      <Palette className="w-4 h-4" />
                    </div>
                    <span>Notre Histoire &amp; Atelier</span>
                  </span>
                  <ChevronRight className="mobile-drawer-arrow w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/pro"
                  onClick={onClose}
                  className="mobile-drawer-link min-h-[48px] px-3.5 py-2.5 rounded-xl bg-gray-100/80 dark:bg-white/[0.04] hover:bg-gray-200/80 dark:hover:bg-white/[0.08] border border-gray-200/80 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/15 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white transition-all active:scale-[0.99]"
                >
                  <span className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-500 dark:text-blue-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span>Espace Pro &amp; B2B</span>
                  </span>
                  <ChevronRight className="mobile-drawer-arrow w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/blog"
                  onClick={onClose}
                  className="mobile-drawer-link min-h-[48px] px-3.5 py-2.5 rounded-xl bg-gray-100/80 dark:bg-white/[0.04] hover:bg-gray-200/80 dark:hover:bg-white/[0.08] border border-gray-200/80 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/15 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white transition-all active:scale-[0.99]"
                >
                  <span className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-500 dark:text-purple-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span>Le Blog Spoolio</span>
                  </span>
                  <ChevronRight className="mobile-drawer-arrow w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/faq"
                  onClick={onClose}
                  className="mobile-drawer-link min-h-[48px] px-3.5 py-2.5 rounded-xl bg-gray-100/80 dark:bg-white/[0.04] hover:bg-gray-200/80 dark:hover:bg-white/[0.08] border border-gray-200/80 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/15 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white transition-all active:scale-[0.99]"
                >
                  <span className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 dark:text-emerald-400">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span>FAQ &amp; Centre d'aide</span>
                  </span>
                  <ChevronRight className="mobile-drawer-arrow w-4 h-4 text-gray-400" />
                </Link>
              </div>
            )}
          </div>

          {/* Highlighted CTA: Soutenir l'Atelier */}
          <Link
            href="/don"
            onClick={onClose}
            className="w-full min-h-[50px] py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#ff4f00] via-[#FF6600] to-[#FF8800] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#ff4f00]/30 hover:scale-[1.02] active:scale-[0.98] transition-transform no-invert"
          >
            <span>Soutenir l'Atelier</span>
            <Heart className="w-4 h-4 fill-current animate-pulse" />
          </Link>
        </div>

        {/* Bottom Preferences (Full Width Theme Toggle Only) */}
        <div className="pt-3 border-t border-gray-200 dark:border-white/10 flex items-center">
          <button
            onClick={toggleTheme}
            className="mobile-drawer-btn w-full h-12 px-4 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Passer au thème clair</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Passer au thème sombre</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
