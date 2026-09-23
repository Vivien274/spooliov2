"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Sparkles,
  Compass,
  Gift,
  Ticket,
  ChevronDown,
  ArrowUpRight,
  Gamepad2,
  Smile,
  Key,
  Palette,
  Building2,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Dices,
  Flame,
  Zap,
  Leaf,
  ArrowRight,
} from "lucide-react";
import { isPreprodEnv } from "@/lib/env";

interface MenuItem {
  id: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  href?: string;
  hasDropdown?: boolean;
}

export default function MotionNavigationMenu() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [isTombolaActive, setIsTombolaActive] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/tombola")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tombola?.status === "active") {
          setIsTombolaActive(true);
        }
      })
      .catch(() => {});
  }, []);

  const menuItems: MenuItem[] = [
    {
      id: "boutique",
      label: t("header.shop"),
      href: "/boutique",
      hasDropdown: true,
    },
    {
      id: "univers",
      label: t("header.experiences"),
      hasDropdown: true,
    },
    {
      id: "atelier",
      label: t("header.workshop"),
      href: "/a-propos",
      hasDropdown: true,
    },
  ];

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

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Close dropdown on Escape press
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
      {/* Mega Navigation Links - Transparent container & refined typography */}
      <nav className="relative flex items-center gap-1">
        {menuItems.map((item) => {
          const isSelected = activeTab === item.id;
          const isHovered = hoveredTab === item.id;

          return (
            <div
              key={item.id}
              className="relative px-3.5 py-2 rounded-full cursor-pointer select-none transition-all duration-200"
              onMouseEnter={() => handleMouseEnter(item.id)}
            >
              {/* Animated Active/Hover Backdrop */}
              {(isHovered || isSelected) && (
                <motion.div
                  layoutId="motion-nav-pill-active"
                  className="absolute inset-0 bg-zinc-100 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Label & Indicators */}
              <div className="relative z-10 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-900">
                <span>{item.label}</span>

                {item.badge && (
                  <span
                    className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white shadow-xs no-invert ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.hasDropdown && (
                  <motion.div
                    animate={{ rotate: isSelected ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Morphing Mega Dropdown Panel */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 pt-3 z-[999999] origin-top-left"
            onMouseEnter={handleDropdownMouseEnter}
          >
            {/* Panel Body Container */}
            <div className="w-[940px] max-w-[calc(100vw-3rem)] bg-white/98 backdrop-blur-3xl border border-zinc-200/90 rounded-[32px] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.12)] ring-1 ring-zinc-900/5 relative overflow-hidden text-zinc-900">
              {/* Subtle ambient lighting glows */}
              <div className="absolute -top-20 -left-20 w-56 h-56 bg-[#ff4f00]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* ============================================================ */}
              {/* TAB 1: BOUTIQUE & CATALOGUE                                  */}
              {/* ============================================================ */}
              {activeTab === "boutique" && (
                <div className="grid grid-cols-12 gap-6 relative z-10">
                  {/* LEFT HERO / SPOTLIGHT CARD (Col 1 to 4) */}
                  <div className="col-span-4 relative rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-br from-[#ff4f00]/30 via-black/80 to-black/95 p-6 flex flex-col justify-between group/hero shadow-xl keep-white no-invert">
                    {/* Light Sweep Reflection animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover/hero:translate-x-[150%] transition-transform duration-1000 z-20 pointer-events-none" />

                    <div className="absolute inset-0 opacity-25 group-hover/hero:opacity-40 transition-opacity duration-500 pointer-events-none">
                      <Image
                        src="/images/marcel_octopus.jpg"
                        alt="Spoolio 3D Creations"
                        fill
                        className="object-cover object-center no-invert filter brightness-95 group-hover/hero:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/50 to-transparent z-10" />

                    <div className="relative z-20 space-y-2.5">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ff4f00] text-white !text-white text-[10px] font-black uppercase tracking-wider shadow-md no-invert keep-white">
                        <Flame className="w-3 h-3 text-yellow-300 animate-pulse" />
                        Catalogue Spoolio 3D
                      </span>
                      <h4 className="text-xl font-black text-white !text-white leading-tight font-antonio uppercase tracking-wide keep-white">
                        Créations 3D &amp; Objets Tactiles
                      </h4>
                      <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                        Figurines, objets tactiles, accessoires gaming &amp; jeux de société.
                      </p>
                    </div>

                    <div className="relative z-20 pt-6">
                      <Link
                        href="/boutique"
                        onClick={() => setActiveTab(null)}
                        className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-black text-xs uppercase tracking-wider hover:bg-[#ff4f00] hover:text-white transition-all duration-200 shadow-md group/btn btn-light force-dark-text no-invert"
                      >
                        <span className="text-zinc-950 !text-zinc-950 font-black group-hover/btn:!text-white">Tout le catalogue</span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-950 !text-zinc-950 group-hover/btn:!text-white group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
                      </Link>
                    </div>
                  </div>

                  {/* RIGHT SECTION: 2 SUB-COLUMNS + BOTTOM ACTION BAR (Col 5 to 12) */}
                  <div className="col-span-8 flex flex-col justify-between space-y-4">
                    {/* Top 2 Vertical Columns */}
                    <div className="grid grid-cols-2 gap-5">
                      {/* Column A: Nos Collections */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest px-2 mb-2">
                          Nos Collections
                        </h5>

                        <Link
                          href="/categorie/Fidgets"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#ff4f00]/10 text-[#ff4f00] flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-xs">
                            <Sparkles className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors truncate">
                                {t("header.categories.fidgets")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate">
                              Objets sensoriels, desk toys &amp; clickers
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/categorie/Geek %2F Gaming"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-xs">
                            <Gamepad2 className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors truncate">
                                {t("nav_menu.geek_gaming")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate">
                              Supports manette &amp; accessoires bureau
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/categorie/Porte clés"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-xs">
                            <Key className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors truncate">
                                {t("nav_menu.keychain_title")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate">
                              Porte-clés originaux &amp; fun
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/categorie/Animaux %26 Figurines"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-xs">
                            <Smile className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors truncate">
                                Figurines &amp; Sculptures 3D
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate">
                              Créations décoratives &amp; figurines articulées
                            </p>
                          </div>
                        </Link>
                      </div>

                      {/* Column B: Spécialités Spoolio */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest px-2 mb-2">
                          Spécialités &amp; Univers
                        </h5>

                        <Link
                          href="/medaillon-nfc-chien-chat"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-xs">
                            <ShieldCheck className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors truncate flex items-center gap-1.5">
                                <span>{t("nav_menu.nfc_title")}</span>
                                <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-zinc-900 text-white">
                                  SOS
                                </span>
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate">
                              Puce d'urgence pour animaux
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/jeux-de-societe"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-xs">
                            <Dices className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors truncate flex items-center gap-1.5">
                                <span>Jeux &amp; Accessoires 3D</span>
                                <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-[#ff4f00] text-white">
                                  ENJEU
                                </span>
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate">
                              Accessoires 3D &amp; compteur de score
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/pochette-surprise"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-xs">
                            <Gift className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors truncate">
                                Pochettes Surprises
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate">
                              Packs surprises multi-créations d'atelier
                            </p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-4 mt-2">
                      <div className="min-w-0">
                        <h6 className="text-xs font-black text-zinc-900 font-antonio uppercase tracking-wide">
                          Besoin d'aide pour choisir votre création 3D ?
                        </h6>
                        <p className="text-[11px] text-zinc-500 truncate">
                          Notre équipe est disponible pour vous conseiller dans l'atelier.
                        </p>
                      </div>

                      <Link
                        href="/faq"
                        onClick={() => setActiveTab(null)}
                        className="px-4 py-2 rounded-full bg-zinc-950 hover:bg-[#ff4f00] text-white text-xs font-black shrink-0 transition-all duration-200 border border-zinc-950 cursor-pointer no-invert shadow-sm"
                      >
                        Contacter l'Atelier
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 2: EXPÉRIENCES & JEUX                                   */}
              {/* ============================================================ */}
              {activeTab === "univers" && (
                <div className="grid grid-cols-12 gap-6 relative z-10">
                  {/* LEFT HERO / SPOTLIGHT CARD (Col 1 to 4) */}
                  <div className="col-span-4 relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 p-6 flex flex-col justify-between group/hero shadow-md keep-white no-invert">
                    {/* Light Sweep Reflection animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover/hero:translate-x-[150%] transition-transform duration-1000 z-20 pointer-events-none" />

                    <div className="absolute inset-0 opacity-25 group-hover/hero:opacity-40 transition-opacity duration-500 pointer-events-none">
                      <Image
                        src="/images/enjeu/Enjeu_banniere.png"
                        alt="Spoolio Experiences & Games"
                        fill
                        className="object-cover object-center no-invert filter brightness-95 group-hover/hero:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/60 to-transparent z-10" />

                    <div className="relative z-20 space-y-2.5">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-800 text-white !text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm no-invert keep-white border border-zinc-700">
                        <Dices className="w-3.5 h-3.5 text-[#ff4f00] animate-pulse" />
                        Expériences &amp; Jeux
                      </span>
                      <h4 className="text-xl font-black text-white !text-white leading-tight font-antonio uppercase tracking-wide keep-white">
                        L'Univers Jeux Spoolio 🎲
                      </h4>
                      <p className="text-xs text-zinc-300 font-medium leading-relaxed keep-white">
                        Apps Web gratuites, studio 3D &amp; accessoires de jeu.
                      </p>
                    </div>

                    <div className="relative z-20 pt-6">
                      <Link
                        href="/jeux-de-societe"
                        onClick={() => setActiveTab(null)}
                        className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-black text-xs uppercase tracking-wider hover:bg-[#ff4f00] hover:text-white transition-all duration-200 shadow-md group/btn btn-light force-dark-text no-invert"
                      >
                        <span className="text-zinc-950 !text-zinc-950 font-black group-hover/btn:!text-white">Découvrir l'App Enjeu</span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-950 !text-zinc-950 group-hover/btn:!text-white group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
                      </Link>
                    </div>
                  </div>

                  {/* RIGHT SECTION: 2 SUB-COLUMNS + BOTTOM ACTION BAR (Col 5 to 12) */}
                  <div className="col-span-8 flex flex-col justify-between space-y-4">
                    {/* Top 2 Vertical Columns */}
                    <div className="grid grid-cols-2 gap-5">
                      {/* Column A: Jeux & Compagnons */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest px-2 mb-2">
                          Jeux &amp; Compagnons Web
                        </h5>

                        <Link
                          href="/jeux-de-societe"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-xs">
                            <Dices className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors truncate flex items-center gap-1">
                                <span>Jeux &amp; App Enjeu</span>
                                <span className="text-[8px] font-black px-1 py-0.2 rounded bg-[#ff4f00] text-white">
                                  GRATUIT
                                </span>
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate">
                              Calculateur de score &amp; tours à dés
                            </p>
                          </div>
                        </Link>

                        {isTombolaActive && (
                          <Link
                            href="/tombola"
                            onClick={() => setActiveTab(null)}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-150 group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-xs">
                              <Ticket className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <h6 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors truncate">
                                  Tombola Spoolio
                                </h6>
                                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                              </div>
                              <p className="text-[11px] text-zinc-500 truncate">
                                {t("nav_menu.tombola_desc")}
                              </p>
                            </div>
                          </Link>
                        )}
                      </div>

                      {/* Column B: Outils & Studio 3D */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest px-2 mb-2">
                          Outils &amp; Studio 3D
                        </h5>

                        <Link
                          href="/boussole-sensorielle"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-xs">
                            <Compass className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors truncate">
                                {t("nav_menu.boussole_title")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate">
                              Trouvez votre objet idéal en 3 clics
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/createur-cliqueur"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-xs">
                            <Gamepad2 className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors truncate">
                                {t("nav_menu.clicker_studio")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate">
                              Personnalisez votre clicker en 3D
                            </p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-4 mt-2">
                      <div className="min-w-0">
                        <h6 className="text-xs font-black text-zinc-900 font-antonio uppercase tracking-wide">
                          Une idée de jeu de société ou d'accessoire ?
                        </h6>
                        <p className="text-[11px] text-zinc-500 truncate">
                          Partagez vos idées pour enrichir les prochaines créations 3D.
                        </p>
                      </div>

                      <Link
                        href="/jeux-de-societe#communaute"
                        onClick={() => setActiveTab(null)}
                        className="px-4 py-2 rounded-full bg-zinc-950 hover:bg-[#ff4f00] text-white text-xs font-black shrink-0 transition-all duration-200 border border-zinc-950 cursor-pointer no-invert shadow-sm"
                      >
                        Suggérer une idée
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 3: L'ATELIER                                             */}
              {/* ============================================================ */}
              {activeTab === "atelier" && (
                <div className="grid grid-cols-12 gap-6 relative z-10">
                  {/* LEFT HERO / SPOTLIGHT CARD (Col 1 to 4) */}
                  <div className="col-span-4 relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 p-6 flex flex-col justify-between group/hero shadow-md keep-white no-invert">
                    {/* Light Sweep Reflection animation */}
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
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-800 text-white !text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm no-invert keep-white border border-zinc-700">
                        <Leaf className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        Impression 3D Eco 🇫🇷
                      </span>
                      <h4 className="text-xl font-black text-white !text-white leading-tight font-antonio uppercase tracking-wide keep-white">
                        Savoir-Faire &amp; Engagement
                      </h4>
                      <p className="text-xs text-zinc-300 font-medium leading-relaxed keep-white">
                        Objets conçus en France à partir de bioplastiques recyclables.
                      </p>
                    </div>

                    <div className="relative z-20 pt-6">
                      <Link
                        href="/a-propos"
                        onClick={() => setActiveTab(null)}
                        className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-black text-xs uppercase tracking-wider hover:bg-[#ff4f00] hover:text-white transition-all duration-200 shadow-md group/btn btn-light force-dark-text no-invert"
                      >
                        <span className="text-zinc-950 !text-zinc-950 font-black group-hover/btn:!text-white">Découvrir l'Atelier</span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-950 !text-zinc-950 group-hover/btn:!text-white group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
                      </Link>
                    </div>
                  </div>

                  {/* RIGHT SECTION: 2 SUB-COLUMNS + BOTTOM ACTION BAR (Col 5 to 12) */}
                  <div className="col-span-8 flex flex-col justify-between space-y-4">
                    {/* Top 2 Vertical Columns */}
                    <div className="grid grid-cols-2 gap-5">
                      {/* Column A: L'Univers Spoolio */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest px-2 mb-2">
                          L'Univers Spoolio
                        </h5>

                        <Link
                          href="/a-propos"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-xs">
                            <Palette className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors truncate">
                                {t("nav_menu.our_story")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate">
                              Savoir-faire &amp; fabrication à Comines
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/blog"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-xs">
                            <BookOpen className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors truncate">
                                {t("nav_menu.blog_title")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate">
                              Guides 3D, coulisses &amp; actualités
                            </p>
                          </div>
                        </Link>
                      </div>

                      {/* Column B: Services & Support */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest px-2 mb-2">
                          Services &amp; Support
                        </h5>

                        <Link
                          href="/pro"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-xs">
                            <Building2 className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors truncate flex items-center gap-1">
                                <span>{t("nav_menu.pro_space")}</span>
                                <span className="text-[8px] font-black px-1 py-0.2 rounded bg-zinc-900 text-white">
                                  B2B
                                </span>
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate">
                              Goodies &amp; séries 3D sur-mesure
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/faq"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-xs">
                            <HelpCircle className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors truncate">
                                {t("nav_menu.faq_title")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate">
                              Livraison, retours &amp; questions
                            </p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-4 mt-2">
                      <div className="min-w-0">
                        <h6 className="text-xs font-black text-zinc-900 font-antonio uppercase tracking-wide">
                          Un projet d'impression 3D sur-mesure pour votre entreprise ?
                        </h6>
                        <p className="text-[11px] text-zinc-500 truncate">
                          Demandez une étude de faisabilité et un devis rapide.
                        </p>
                      </div>

                      <Link
                        href="/pro"
                        onClick={() => setActiveTab(null)}
                        className="px-4 py-2 rounded-full bg-zinc-950 hover:bg-[#ff4f00] text-white text-xs font-black shrink-0 transition-all duration-200 border border-zinc-950 cursor-pointer no-invert shadow-sm"
                      >
                        Demander un devis
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
