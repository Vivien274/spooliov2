"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Heart,
  Layers,
  Moon,
  MousePointerClick,
  Bot,
  Shield,
  Eye,
  Package,
  Ghost,
  Gem,
} from "lucide-react";
import {
  SHOP_UNIVERSES,
  COLLECTIONS_LIST,
  WORKSHOP_PAGES,
  NavUnivers,
} from "@/config/navigationConfig";

const COLLECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Moon,
  MousePointerClick,
  Bot,
  Shield,
  Eye,
  Package,
  Ghost,
  Gem,
};

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  t: (key: string) => string;
}

type ViewState = "main" | "shop" | "universe" | "collections" | "atelier";

export default function MobileMenuDrawer({
  isOpen,
  onClose,
  onOpenSearch,
}: MobileMenuDrawerProps) {
  // Navigation stack: 'main' -> 'shop' / 'collections' / 'atelier' -> 'universe'
  const [currentView, setCurrentView] = useState<ViewState>("main");
  const [selectedUniverseId, setSelectedUniverseId] = useState<string | null>(null);
  const [direction, setDirection] = useState<number>(1); // 1 = forward, -1 = back

  // Reset navigation when closed
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setCurrentView("main");
        setSelectedUniverseId(null);
        setDirection(1);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const goToView = (view: ViewState, universeId: string | null = null) => {
    setDirection(1);
    setCurrentView(view);
    if (universeId !== null) {
      setSelectedUniverseId(universeId);
    }
  };

  const goBack = () => {
    setDirection(-1);
    if (currentView === "universe") {
      setCurrentView("shop");
      setSelectedUniverseId(null);
    } else {
      setCurrentView("main");
      setSelectedUniverseId(null);
    }
  };

  const selectedUniverse: NavUnivers | undefined = SHOP_UNIVERSES.find(
    (u) => u.id === selectedUniverseId
  );

  if (!isOpen) return null;

  // Variants for drill-down sliding transitions
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.18, ease: "easeOut" as const },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -20 : 20,
      opacity: 0,
      transition: { duration: 0.14, ease: "easeIn" as const },
    }),
  };

  return (
    <div className="fixed inset-0 z-[99999] flex md:hidden font-sans select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Container */}
      <div className="relative w-[360px] max-w-[88vw] h-full bg-white border-r border-zinc-200 flex flex-col justify-between shadow-2xl z-10 text-zinc-900 animate-in slide-in-from-left duration-300">
        
        {/* ================================================================= */}
        {/* TOP BAR : Logo OU Bouton Retour + Bouton Fermer                   */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-zinc-100 shrink-0">
          {currentView === "main" ? (
            <Link href="/" onClick={onClose} className="flex items-center">
              <Image
                src="/images/logo-spoolio-eyes.png"
                alt="Spoolio Logo"
                width={100}
                height={30}
                className="h-7 w-auto object-contain"
              />
            </Link>
          ) : (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 transition-colors py-2 cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>
                {currentView === "shop" && "Boutique"}
                {currentView === "collections" && "Collections"}
                {currentView === "atelier" && "L'Atelier"}
                {currentView === "universe" && (selectedUniverse?.label || "Boutique")}
              </span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-950 transition-colors cursor-pointer rounded-full hover:bg-zinc-100"
            aria-label="Fermer le menu"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================================================================= */}
        {/* CONTENU DRILL-DOWN (Écrans successifs)                             */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar relative">
          <AnimatePresence mode="wait" custom={direction}>
            
            {/* ------------------------------------------------------------- */}
            {/* NIVEAU 1 : MENU PRINCIPAL                                     */}
            {/* ------------------------------------------------------------- */}
            {currentView === "main" && (
              <motion.div
                key="view-main"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col py-2"
              >
                {/* 1. BOUTIQUE → */}
                <button
                  type="button"
                  onClick={() => goToView("shop")}
                  className="w-full flex items-center justify-between py-4 border-b border-zinc-100/90 text-left cursor-pointer group"
                >
                  <span className="font-be-vietnam font-normal text-lg text-zinc-950 group-hover:text-[#ff4f00] transition-colors tracking-tight">
                    Boutique
                  </span>
                  <ChevronRight className="w-4.5 h-4.5 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 2. NOUVEAUTÉS [DROP] */}
                <Link
                  href="/nouveautes"
                  onClick={onClose}
                  className="w-full flex items-center justify-between py-4 border-b border-zinc-100/90 text-left group"
                >
                  <span className="font-be-vietnam font-normal text-lg text-zinc-950 group-hover:text-[#ff4f00] transition-colors tracking-tight">
                    Nouveautés
                  </span>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-white bg-[#ff4f00] px-2 py-0.5 rounded-full shadow-2xs">
                    Drop
                  </span>
                </Link>

                {/* 3. BLIND BAGS */}
                <Link
                  href="/blind-bags"
                  onClick={onClose}
                  className="w-full flex items-center justify-between py-4 border-b border-zinc-100/90 text-left group"
                >
                  <span className="font-be-vietnam font-normal text-lg text-zinc-950 group-hover:text-[#ff4f00] transition-colors tracking-tight">
                    Blind Bags
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </Link>

                {/* 4. COLLECTIONS → */}
                <button
                  type="button"
                  onClick={() => goToView("collections")}
                  className="w-full flex items-center justify-between py-4 border-b border-zinc-100/90 text-left cursor-pointer group"
                >
                  <span className="font-be-vietnam font-normal text-lg text-zinc-950 group-hover:text-[#ff4f00] transition-colors tracking-tight">
                    Collections
                  </span>
                  <ChevronRight className="w-4.5 h-4.5 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 5. L'ATELIER → */}
                <button
                  type="button"
                  onClick={() => goToView("atelier")}
                  className="w-full flex items-center justify-between py-4 border-b border-zinc-100/90 text-left cursor-pointer group"
                >
                  <span className="font-be-vietnam font-normal text-lg text-zinc-950 group-hover:text-[#ff4f00] transition-colors tracking-tight">
                    L&apos;Atelier
                  </span>
                  <ChevronRight className="w-4.5 h-4.5 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
                </button>
              </motion.div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* NIVEAU 2 : BOUTIQUE (Univers)                                 */}
            {/* ------------------------------------------------------------- */}
            {currentView === "shop" && (
              <motion.div
                key="view-shop"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col py-2"
              >
                {/* Entrée globale : Tout le catalogue */}
                <Link
                  href="/boutique"
                  onClick={onClose}
                  className="w-full flex items-center justify-between py-3.5 mb-2 border-b border-zinc-200/80 group"
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#ff4f00]">
                    Tout le catalogue
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#ff4f00] group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* 4 Univers */}
                {SHOP_UNIVERSES.map((univ) => (
                  <button
                    key={univ.id}
                    type="button"
                    onClick={() => goToView("universe", univ.id)}
                    className="w-full flex items-center justify-between py-4 border-b border-zinc-100 text-left cursor-pointer group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-be-vietnam font-normal text-[15px] text-zinc-950 group-hover:text-[#ff4f00] transition-colors leading-snug">
                        {univ.label}
                      </div>
                      <p className="text-xs text-zinc-400 font-sans mt-0.5 font-normal">
                        {univ.shortDesc}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </motion.div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* NIVEAU 3 : CATÉGORIES D'UN UNIVERS                            */}
            {/* ------------------------------------------------------------- */}
            {currentView === "universe" && selectedUniverse && (
              <motion.div
                key={`view-universe-${selectedUniverse.id}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col py-2"
              >
                {/* Entrée globale de l'univers : Tout voir */}
                <Link
                  href={selectedUniverse.href}
                  onClick={onClose}
                  className="w-full flex items-center justify-between py-3.5 mb-2 border-b border-zinc-200/80 group"
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#ff4f00]">
                    Tout voir
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#ff4f00] group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* Catégories de l'univers */}
                {selectedUniverse.categories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={onClose}
                    className="w-full flex items-center justify-between py-3.5 border-b border-zinc-100 text-left group"
                  >
                    <span className="font-be-vietnam font-normal text-sm text-zinc-800 group-hover:text-zinc-950 transition-colors">
                      {cat.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </motion.div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* NIVEAU 2 : COLLECTIONS (8 Séries)                             */}
            {/* ------------------------------------------------------------- */}
            {currentView === "collections" && (
              <motion.div
                key="view-collections"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col py-2"
              >
                {/* Entrée globale : Toutes les collections */}
                <Link
                  href="/collections"
                  onClick={onClose}
                  className="w-full flex items-center justify-between py-3.5 mb-2 border-b border-zinc-200/80 group"
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#ff4f00]">
                    Toutes les collections
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#ff4f00] group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* 8 Collections */}
                {COLLECTIONS_LIST.map((col) => {
                  const IconComponent = (col.iconName && COLLECTION_ICONS[col.iconName]) || Layers;
                  return (
                    <Link
                      key={col.id}
                      href={col.href}
                      onClick={onClose}
                      className="w-full flex items-center justify-between py-3.5 border-b border-zinc-100/70 text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-[#ff4f00]/10 transition-colors">
                          <IconComponent className="w-4 h-4 text-zinc-600 group-hover:text-[#ff4f00] transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-be-vietnam font-medium text-sm text-zinc-950 group-hover:text-[#ff4f00] transition-colors">
                            {col.label}
                          </div>
                          <p className="text-[11px] text-zinc-400 font-sans mt-0.5 font-normal">
                            {col.tagline}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  );
                })}
              </motion.div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* NIVEAU 2 : L'ATELIER                                          */}
            {/* ------------------------------------------------------------- */}
            {currentView === "atelier" && (
              <motion.div
                key="view-atelier"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col py-2"
              >
                {WORKSHOP_PAGES.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    onClick={onClose}
                    className="w-full flex items-center justify-between py-3.5 border-b border-zinc-100 text-left group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-be-vietnam font-normal text-sm text-zinc-950 group-hover:text-[#ff4f00] transition-colors">
                        {page.label}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-sans mt-0.5 font-normal">
                        {page.desc}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ================================================================= */}
        {/* BAS DU DRAWER : Recherche, Nous soutenir (sobre & aéré)           */}
        {/* ================================================================= */}
        <div className="p-6 border-t border-zinc-100 shrink-0 space-y-3 bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            {/* Bouton Recherche */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span>Recherche</span>
            </button>

            {/* Bouton Nous soutenir */}
            <Link
              href="/don"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-2xs group"
            >
              <Heart className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#ff4f00] transition-colors" />
              <span>Soutenir</span>
            </Link>
          </div>

          <p className="text-[10px] text-zinc-400 text-center font-medium">
            Atelier de fabrication 3D • Comines (59) 🇫🇷
          </p>
        </div>

      </div>
    </div>
  );
}
