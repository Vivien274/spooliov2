"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  Palette,
  Dices,
  BookOpen,
  HelpCircle,
  Building2,
  ChevronDown,
  ArrowUpRight,
  ArrowRight,
  Flame,
  Hammer,
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
  MAIN_NAV_ITEMS,
  SHOP_UNIVERSES,
  COLLECTIONS_LIST,
  WORKSHOP_PAGES,
  EDITORIAL_MEGA_CARD,
} from "@/config/navigationConfig";

interface MotionNavigationMenuProps {
  isDark?: boolean;
}

function getUniversIcon(iconName?: string) {
  switch (iconName) {
    case "Sparkles":
      return <Sparkles className="w-4 h-4 text-[#ff4f00]" />;
    case "Zap":
      return <Zap className="w-4 h-4 text-[#ff4f00]" />;
    case "Palette":
      return <Palette className="w-4 h-4 text-[#ff4f00]" />;
    case "Dices":
      return <Dices className="w-4 h-4 text-[#ff4f00]" />;
    default:
      return <Sparkles className="w-4 h-4 text-[#ff4f00]" />;
  }
}

function getWorkshopIcon(iconName: string) {
  switch (iconName) {
    case "Palette":
      return <Palette className="w-4.5 h-4.5" />;
    case "BookOpen":
      return <BookOpen className="w-4.5 h-4.5" />;
    case "HelpCircle":
      return <HelpCircle className="w-4.5 h-4.5" />;
    case "Building2":
      return <Building2 className="w-4.5 h-4.5" />;
    default:
      return <Palette className="w-4.5 h-4.5" />;
  }
}

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

export default function MotionNavigationMenu({ isDark = false }: MotionNavigationMenuProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setHoveredTab(id);
    setActiveTab(id);
  };

  const handleMouseLeave = () => {
    setHoveredTab(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveTab(null);
    }, 200);
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveTab(null);
        setHoveredTab(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative hidden md:flex items-center"
      onMouseLeave={handleMouseLeave}
    >
      {/* Mega Navigation Links - V2.1 */}
      <nav className="relative flex items-center gap-0.5 lg:gap-1">
        {MAIN_NAV_ITEMS.map((item) => {
          const isSelected = activeTab === item.id;
          const isHovered = hoveredTab === item.id;

          const linkInner = (
            <div
              className={`relative z-10 flex items-center gap-1 text-[11px] xl:text-xs font-black uppercase tracking-wider transition-colors no-invert ${
                isDark ? "text-white" : "text-zinc-900"
              }`}
              style={isDark ? { color: "#ffffff" } : undefined}
            >
              <span style={isDark ? { color: "#ffffff" } : undefined}>{item.label}</span>

              {item.badge && (
                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#ff4f00] text-white shadow-xs no-invert">
                  {item.badge}
                </span>
              )}

              {item.hasDropdown && (
                <motion.div
                  animate={{ rotate: isSelected ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown
                    className={`w-3 h-3 transition-colors ${
                      isDark ? "text-zinc-300 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900"
                    }`}
                    style={isDark ? { color: "#ffffff" } : undefined}
                  />
                </motion.div>
              )}
            </div>
          );

          if (!item.hasDropdown) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className="relative px-2 lg:px-2.5 xl:px-3 py-1.5 rounded-full cursor-pointer select-none transition-all duration-200 group"
                onMouseEnter={() => {
                  handleMouseLeave();
                  setHoveredTab(item.id);
                }}
                onMouseLeave={() => setHoveredTab(null)}
              >
                {(isHovered || isSelected) && (
                  <motion.div
                    layoutId="motion-nav-pill-active"
                    className={`absolute inset-0 rounded-full ${
                      isDark ? "bg-white/15 backdrop-blur-md border border-white/10" : "bg-zinc-100"
                    }`}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {linkInner}
              </Link>
            );
          }

          return (
            <div
              key={item.id}
              className="relative px-2 lg:px-2.5 xl:px-3 py-1.5 rounded-full cursor-pointer select-none transition-all duration-200 group"
              onMouseEnter={() => handleMouseEnter(item.id)}
            >
              {(isHovered || isSelected) && (
                <motion.div
                  layoutId="motion-nav-pill-active"
                  className={`absolute inset-0 rounded-full ${
                    isDark ? "bg-white/15 backdrop-blur-md border border-white/10" : "bg-zinc-100"
                  }`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {linkInner}
            </div>
          );
        })}
      </nav>

      {/* Morphing Dropdown Panels */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-[999999] origin-top pointer-events-auto"
            onMouseEnter={handleDropdownMouseEnter}
          >
            {/* ============================================================ */}
            {/* PANEL 1: MEGA-MENU "BOUTIQUE"                                */}
            {/* ============================================================ */}
            {activeTab === "boutique" && (
              <div className="w-[1040px] max-w-[calc(100vw-2.5rem)] bg-white/98 backdrop-blur-3xl border border-zinc-200/90 rounded-[32px] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.12)] ring-1 ring-zinc-900/5 relative overflow-hidden text-zinc-900">
                {/* Subtle ambient lighting glows */}
                <div className="absolute -top-20 -left-20 w-56 h-56 bg-[#ff4f00]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-12 gap-6 relative z-10">
                  {/* CARTE ÉDITORIALE GAUCHE (Col 1 to 3) */}
                  <div className="col-span-3 relative rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-br from-[#ff4f00]/30 via-zinc-950 to-black p-5 flex flex-col justify-between group/hero shadow-xl keep-white no-invert">
                    {/* Light Sweep Reflection animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover/hero:translate-x-[150%] transition-transform duration-1000 z-20 pointer-events-none" />

                    <div className="absolute inset-0 opacity-25 group-hover/hero:opacity-40 transition-opacity duration-500 pointer-events-none">
                      <Image
                        src={EDITORIAL_MEGA_CARD.imageSrc}
                        alt="Spoolio Cabinet de Curiosités"
                        fill
                        className="object-cover object-center no-invert filter brightness-95 group-hover/hero:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10" />

                    <div className="relative z-20 space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ff4f00] text-white !text-white text-[9px] font-black uppercase tracking-wider shadow-md no-invert keep-white">
                        <Flame className="w-3 h-3 text-yellow-300 animate-pulse" />
                        {EDITORIAL_MEGA_CARD.badge}
                      </span>
                      <h4 className="text-lg font-black text-white !text-white leading-tight font-antonio uppercase tracking-wide keep-white">
                        {EDITORIAL_MEGA_CARD.title}
                      </h4>
                      <p className="text-[11px] text-zinc-200 font-medium leading-relaxed keep-white">
                        {EDITORIAL_MEGA_CARD.description}
                      </p>
                    </div>

                    <div className="relative z-20 pt-5">
                      <Link
                        href={EDITORIAL_MEGA_CARD.ctaHref}
                        onClick={() => setActiveTab(null)}
                        className="inline-flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-white text-zinc-950 font-black text-xs uppercase tracking-wider hover:bg-[#ff4f00] hover:text-white transition-all duration-200 shadow-md group/btn btn-light force-dark-text no-invert"
                      >
                        <span className="text-zinc-950 !text-zinc-950 font-black group-hover/btn:!text-white">
                          {EDITORIAL_MEGA_CARD.ctaLabel}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-950 !text-zinc-950 group-hover/btn:!text-white group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
                      </Link>
                    </div>
                  </div>

                  {/* 4 UNIVERS ET CATÉGORIES (Col 4 to 12) */}
                  <div className="col-span-9 flex flex-col justify-between space-y-4">
                    <div className="grid grid-cols-4 gap-3">
                      {SHOP_UNIVERSES.map((univers) => (
                        <div key={univers.id} className="flex flex-col space-y-2">
                          {/* En-tête de l'univers : priorité graphique et titre complet */}
                          <Link
                            href={univers.href}
                            onClick={() => setActiveTab(null)}
                            className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 hover:bg-zinc-100 hover:border-zinc-300 transition-all group/u flex flex-col justify-between min-h-[64px]"
                          >
                            <div className="flex items-start gap-2 text-black group-hover/u:text-[#ff4f00] transition-colors">
                              <div className="mt-0.5 shrink-0">
                                {getUniversIcon(univers.iconName)}
                              </div>
                              <span className="font-be-vietnam font-normal text-black group-hover/u:text-[#ff4f00] text-[13px] xl:text-[14px] uppercase tracking-normal leading-snug transition-colors">
                                {univers.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 font-medium leading-tight mt-1.5">
                              {univers.shortDesc}
                            </p>
                          </Link>

                          {/* Liste des catégories filles */}
                          <ul className="space-y-0.5">
                            {univers.categories.map((cat) => (
                              <li key={cat.href}>
                                <Link
                                  href={cat.href}
                                  onClick={() => setActiveTab(null)}
                                  className="px-2 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/70 transition-all flex items-center justify-between group/cat"
                                >
                                  <span className="group-hover/cat:translate-x-0.5 transition-transform truncate">
                                    {cat.label}
                                  </span>
                                  {cat.badge ? (
                                    <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-zinc-900 text-white shrink-0">
                                      {cat.badge}
                                    </span>
                                  ) : (
                                    <ArrowUpRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover/cat:opacity-100 transition-opacity shrink-0" />
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/90 flex items-center justify-between gap-4 mt-2">
                      <div className="min-w-0">
                        <h6 className="text-xs font-black text-zinc-900 font-antonio uppercase tracking-wide">
                          FABRIQUÉ À L&apos;ATELIER &bull; PETITES SÉRIES &bull; IMPRIMÉ À COMINES
                        </h6>
                        <p className="text-[11px] text-zinc-500">
                          Des objets conçus, imprimés et préparés dans notre atelier.
                        </p>
                      </div>

                      <Link
                        href="/boutique"
                        onClick={() => setActiveTab(null)}
                        className="px-4 py-2 rounded-full bg-zinc-950 hover:bg-[#ff4f00] text-white text-xs font-black shrink-0 transition-all duration-200 border border-zinc-950 cursor-pointer no-invert shadow-sm flex items-center gap-1.5"
                      >
                        <span>Tout le catalogue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* PANEL 2: DROPDOWN COMPACT "COLLECTIONS"                      */}
            {/* ============================================================ */}
            {activeTab === "collections" && (
              <div className="w-[560px] max-w-[calc(100vw-3rem)] bg-white/98 backdrop-blur-3xl border border-zinc-200/90 rounded-[28px] p-5 shadow-[0_25px_70px_rgba(0,0,0,0.12)] ring-1 ring-zinc-900/5 relative overflow-hidden text-zinc-900">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 px-1">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#ff4f00]" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                      Séries &amp; Collections Thématiques
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                    8 Séries
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {COLLECTIONS_LIST.map((col) => {
                    const IconComponent = (col.iconName && COLLECTION_ICONS[col.iconName]) || Layers;
                    return (
                      <Link
                        key={col.id}
                        href={col.href}
                        onClick={() => setActiveTab(null)}
                        className="p-3 rounded-2xl bg-zinc-50/70 hover:bg-zinc-100/90 border border-zinc-200/60 hover:border-zinc-300 transition-all flex flex-col justify-between group/col"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <IconComponent className="w-4 h-4 text-zinc-500 group-hover/col:text-[#ff4f00] transition-colors shrink-0" />
                            <span className="font-be-vietnam font-medium text-[13px] xl:text-[14px] text-zinc-950 group-hover/col:text-[#ff4f00] transition-colors truncate">
                              {col.label}
                            </span>
                          </div>
                          {col.badge ? (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-white shrink-0">
                              {col.badge}
                            </span>
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover/col:opacity-100 group-hover/col:translate-x-0.5 transition-all shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-medium truncate mt-1 pl-6">
                          {col.tagline}
                        </p>
                      </Link>
                    );
                  })}
                </div>

                <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between px-1">
                  <span className="text-[11px] text-zinc-500 font-medium">
                    Explorations artistiques &amp; séries capsules
                  </span>
                  <Link
                    href="/collections"
                    onClick={() => setActiveTab(null)}
                    className="text-xs font-bold text-zinc-950 hover:text-[#ff4f00] transition-colors flex items-center gap-1 group/link"
                  >
                    <span>Toutes les collections</span>
                    <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* PANEL 3: DROPDOWN "L'ATELIER"                                */}
            {/* ============================================================ */}
            {activeTab === "atelier" && (
              <div className="w-[820px] max-w-[calc(100vw-3rem)] bg-white/98 backdrop-blur-3xl border border-zinc-200/90 rounded-[32px] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.12)] ring-1 ring-zinc-900/5 relative overflow-hidden text-zinc-900">
                <div className="grid grid-cols-12 gap-6 relative z-10">
                  {/* CARTE ÉDITORIALE GAUCHE (Col 1 to 4) */}
                  <div className="col-span-4 relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 p-6 flex flex-col justify-between group/hero shadow-md keep-white no-invert">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover/hero:translate-x-[150%] transition-transform duration-1000 z-20 pointer-events-none" />

                    <div className="absolute inset-0 opacity-25 group-hover/hero:opacity-40 transition-opacity duration-500 pointer-events-none">
                      <Image
                        src="/images/clicker_gallery_2.jpg"
                        alt="Atelier Spoolio"
                        fill
                        className="object-cover object-center no-invert filter brightness-95 group-hover/hero:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/60 to-transparent z-10" />

                    <div className="relative z-20 space-y-2.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-white !text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm no-invert keep-white border border-zinc-700">
                        <Hammer className="w-3.5 h-3.5 text-[#ff4f00]" />
                        ATELIER SPOOLIO &bull; COMINES
                      </span>
                      <h4 className="text-xl font-black text-white !text-white leading-tight font-antonio uppercase tracking-wide keep-white">
                        SAVOIR-FAIRE &amp; ATELIER
                      </h4>
                      <p className="text-xs text-zinc-300 font-medium leading-relaxed keep-white">
                        Objets conçus, imprimés et préparés en petites séries dans notre atelier à Comines.
                      </p>
                    </div>

                    <div className="relative z-20 pt-6">
                      <Link
                        href="/a-propos"
                        onClick={() => setActiveTab(null)}
                        className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-black text-xs uppercase tracking-wider hover:bg-[#ff4f00] hover:text-white transition-all duration-200 shadow-md group/btn btn-light force-dark-text no-invert"
                      >
                        <span className="text-zinc-950 !text-zinc-950 font-black group-hover/btn:!text-white">
                          DÉCOUVRIR L&apos;ATELIER
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-950 !text-zinc-950 group-hover/btn:!text-white group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
                      </Link>
                    </div>
                  </div>

                  {/* PAGES INSTITUTIONNELLES (Col 5 to 12) */}
                  <div className="col-span-8 flex flex-col justify-between space-y-4">
                    <div className="grid grid-cols-2 gap-3.5">
                      {WORKSHOP_PAGES.map((page) => (
                        <Link
                          key={page.href}
                          href={page.href}
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-100 border border-zinc-200/70 hover:border-zinc-300 transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:text-[#ff4f00] transition-all shadow-xs">
                            {getWorkshopIcon(page.iconName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="font-be-vietnam font-normal text-[13px] xl:text-[14px] text-black group-hover:text-[#ff4f00] transition-colors truncate">
                                {page.label}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                              {page.desc}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-4 mt-2">
                      <div className="min-w-0">
                        <h6 className="text-xs font-black text-zinc-900 font-antonio uppercase tracking-wide">
                          Une question ou un projet sur-mesure ?
                        </h6>
                        <p className="text-[11px] text-zinc-500 truncate">
                          Notre équipe d&apos;artisanat 3D vous répond avec plaisir.
                        </p>
                      </div>

                      <Link
                        href="/faq"
                        onClick={() => setActiveTab(null)}
                        className="px-4 py-2 rounded-full bg-zinc-950 hover:bg-[#ff4f00] text-white text-xs font-black shrink-0 transition-all duration-200 border border-zinc-950 cursor-pointer no-invert shadow-sm"
                      >
                        Contacter l&apos;Atelier
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
