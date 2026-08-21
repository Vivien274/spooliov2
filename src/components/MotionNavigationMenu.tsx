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
      badge: "HOT",
      badgeColor: "bg-[#ff4f00]",
    },
    {
      id: "univers",
      label: t("header.experiences"),
      hasDropdown: true,
      badge: "JEUX",
      badgeColor: "bg-indigo-500",
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
      className="relative hidden lg:flex items-center"
      onMouseLeave={handleMouseLeave}
    >
      {/* Mega Navigation Pills Bar Container */}
      <nav className="relative flex items-center gap-1.5 p-1.5 bg-black/50 backdrop-blur-2xl border border-white/15 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
        {menuItems.map((item) => {
          const isSelected = activeTab === item.id;
          const isHovered = hoveredTab === item.id;

          return (
            <div
              key={item.id}
              className="relative px-4 py-2 rounded-full cursor-pointer select-none transition-all duration-200"
              onMouseEnter={() => handleMouseEnter(item.id)}
            >
              {/* Animated Active Backdrop */}
              {(isHovered || isSelected) && (
                <motion.div
                  layoutId="motion-nav-pill-active"
                  className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/15 to-white/10 rounded-full border border-white/25 shadow-lg shadow-black/40"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Label & Indicators */}
              <div className="relative z-10 flex items-center gap-2 text-xs font-black text-white tracking-wide">
                <span>{item.label}</span>

                {item.badge && (
                  <span
                    className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white shadow-sm no-invert ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.hasDropdown && (
                  <motion.div
                    animate={{ rotate: isSelected ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-white/70" />
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}

        {/* Featured Workshop CTA Button */}
        <Link
          href="/don"
          className="relative px-4 py-2 ml-1 rounded-full bg-gradient-to-r from-[#ff4f00] via-[#FF6600] to-[#FF8800] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#ff4f00]/30 hover:scale-105 transition-all duration-200 cursor-pointer no-invert group overflow-hidden"
        >
          <motion.div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
          <span>{t("footer.support_workshop")}</span>
        </Link>
      </nav>

      {/* Morphing Mega Dropdown Panel */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-[999999] origin-top"
            onMouseEnter={handleDropdownMouseEnter}
          >
            {/* Panel Body Container */}
            <div className="w-[860px] bg-[#0d0d10]/98 backdrop-blur-3xl border border-white/20 rounded-[32px] p-6 shadow-[0_35px_80px_rgba(0,0,0,0.85)] ring-1 ring-white/10 relative overflow-hidden">
              {/* Subtle ambient lighting glows */}
              <div className="absolute -top-20 -left-20 w-56 h-56 bg-[#ff4f00]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* ============================================================ */}
              {/* TAB 1: BOUTIQUE & CATALOGUE                                  */}
              {/* ============================================================ */}
              {activeTab === "boutique" && (
                <div className="grid grid-cols-12 gap-6 relative z-10">
                  {/* LEFT HERO / SPOTLIGHT CARD (Col 1 to 5) */}
                  <div className="col-span-5 relative rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-br from-[#ff4f00]/30 via-black/80 to-black/95 p-6 flex flex-col justify-between group/hero shadow-xl">
                    {/* Light Sweep Reflection animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover/hero:translate-x-[150%] transition-transform duration-1000 z-20 pointer-events-none" />

                    <div className="absolute inset-0 opacity-40 group-hover/hero:opacity-65 transition-opacity duration-500 pointer-events-none">
                      <Image
                        src="/images/marcel_octopus.jpg"
                        alt="Spoolio 3D Creations"
                        fill
                        className="object-cover object-center no-invert filter brightness-90 group-hover/hero:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />

                    <div className="relative z-20 space-y-2.5">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ff4f00] text-white text-[10px] font-black uppercase tracking-wider shadow-lg no-invert">
                        <Flame className="w-3 h-3 text-yellow-300 animate-pulse" />
                        Catalogue Spoolio 3D
                      </span>
                      <h4 className="text-xl font-black text-white leading-tight">
                        Créations 3D Artisanales &amp; Ludiques
                      </h4>
                      <p className="text-xs text-gray-300 font-medium leading-relaxed">
                        Fidgets articulés, objet déco &amp; accessoires gaming zéro déchet.
                      </p>
                    </div>

                    <div className="relative z-20 pt-6">
                      <Link
                        href="/boutique"
                        onClick={() => setActiveTab(null)}
                        className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-[#ff4f00] hover:text-white transition-all duration-300 shadow-lg group/btn no-invert"
                      >
                        <span>Tout le catalogue</span>
                        <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>

                  {/* RIGHT SECTION: 2 SUB-COLUMNS + BOTTOM ACTION BAR (Col 6 to 12) */}
                  <div className="col-span-7 flex flex-col justify-between space-y-4">
                    {/* Top 2 Vertical Columns */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Column A: Nos Collections */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">
                          Nos Collections
                        </h5>

                        <Link
                          href="/categorie/Fidgets"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#ff4f00]/20 text-[#ff4f00] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                            <Sparkles className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-white group-hover:text-[#ff4f00] transition-colors truncate">
                                {t("header.categories.fidgets")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Jouets tactiles &amp; anti-stress 3D
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/categorie/Geek %2F Gaming"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-md">
                            <Gamepad2 className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                                {t("nav_menu.geek_gaming")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Supports manette &amp; accessoires
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/categorie/Porte clés"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                            <Key className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                                {t("nav_menu.keychain_title")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Porte-clés originaux &amp; fun
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/categorie/Animaux %26 Figurines"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-md">
                            <Smile className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                                {t("nav_menu.animals_title")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Dragons articulés &amp; figurines
                            </p>
                          </div>
                        </Link>
                      </div>

                      {/* Column B: Spécialités Spoolio */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">
                          Spécialités &amp; Innovations
                        </h5>

                        <Link
                          href="/medaillon-nfc-chien-chat"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#ff4f00]/20 text-[#ff4f00] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                            <ShieldCheck className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-white group-hover:text-[#ff4f00] transition-colors truncate flex items-center gap-1.5">
                                <span>{t("nav_menu.nfc_title")}</span>
                                <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-[#ff4f00] text-black">
                                  SOS
                                </span>
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Puce d'urgence pour animaux
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/jeux-de-societe"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-md">
                            <Dices className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate flex items-center gap-1.5">
                                <span>Jeux &amp; Accessoires 3D</span>
                                <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-indigo-500 text-white">
                                  ENJEU
                                </span>
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Accessoires 3D &amp; compteur de score
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/pochette-surprise"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                            <Gift className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                                {t("nav_menu.surprise_pack")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Packs mystères multi-objets
                            </p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 mt-2">
                      <div className="min-w-0">
                        <h6 className="text-xs font-black text-white">
                          Besoin d'aide pour choisir votre création 3D ?
                        </h6>
                        <p className="text-[11px] text-gray-400 truncate">
                          Notre équipe est disponible pour vous conseiller dans l'atelier.
                        </p>
                      </div>

                      <Link
                        href="/faq"
                        onClick={() => setActiveTab(null)}
                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#ff4f00] text-white hover:text-white text-xs font-black shrink-0 transition-all duration-200 border border-white/15 cursor-pointer no-invert hover:scale-105 shadow-md"
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
                  {/* LEFT HERO / SPOTLIGHT CARD (Col 1 to 5) */}
                  <div className="col-span-5 relative rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-br from-indigo-600/30 via-black/80 to-black/95 p-6 flex flex-col justify-between group/hero shadow-xl">
                    {/* Light Sweep Reflection animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover/hero:translate-x-[150%] transition-transform duration-1000 z-20 pointer-events-none" />

                    <div className="absolute inset-0 opacity-40 group-hover/hero:opacity-65 transition-opacity duration-500 pointer-events-none">
                      <Image
                        src="/images/enjeu/Enjeu_banniere.png"
                        alt="Spoolio Experiences & Games"
                        fill
                        className="object-cover object-center no-invert filter brightness-90 group-hover/hero:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />

                    <div className="relative z-20 space-y-2.5">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg no-invert">
                        <Dices className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                        Expériences &amp; Jeux
                      </span>
                      <h4 className="text-xl font-black text-white leading-tight">
                        L'Univers Interactif Spoolio 🎲
                      </h4>
                      <p className="text-xs text-gray-300 font-medium leading-relaxed">
                        Apps Web gratuites, studio 3D &amp; accessoires de jeu.
                      </p>
                    </div>

                    <div className="relative z-20 pt-6">
                      <Link
                        href="/jeux-de-societe"
                        onClick={() => setActiveTab(null)}
                        className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-indigo-500 hover:text-white transition-all duration-300 shadow-lg group/btn no-invert"
                      >
                        <span>Découvrir l'App Enjeu</span>
                        <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>

                  {/* RIGHT SECTION: 2 SUB-COLUMNS + BOTTOM ACTION BAR (Col 6 to 12) */}
                  <div className="col-span-7 flex flex-col justify-between space-y-4">
                    {/* Top 2 Vertical Columns */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Column A: Jeux & Compagnons */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">
                          Jeux &amp; Compagnons Web
                        </h5>

                        <Link
                          href="/jeux-de-societe"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-md">
                            <Dices className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate flex items-center gap-1">
                                <span>Jeux &amp; App Enjeu</span>
                                <span className="text-[8px] font-black px-1 py-0.2 rounded bg-emerald-500 text-black">
                                  GRATUIT
                                </span>
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Calculateur de score &amp; tours à dés
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/loterie"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                            <Sparkles className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                                Roue de la Fortune
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Tournez la roue &amp; gagnez des promos
                            </p>
                          </div>
                        </Link>

                        {isTombolaActive && (
                          <Link
                            href="/tombola"
                            onClick={() => setActiveTab(null)}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-md">
                              <Ticket className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <h6 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                                  Tombola Spoolio
                                </h6>
                                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                              </div>
                              <p className="text-[11px] text-gray-400 truncate">
                                {t("nav_menu.tombola_desc")}
                              </p>
                            </div>
                          </Link>
                        )}
                      </div>

                      {/* Column B: Outils & Studio 3D */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">
                          Outils &amp; Studio 3D
                        </h5>

                        <Link
                          href="/boussole-sensorielle"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                            <Compass className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                                {t("nav_menu.boussole_title")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Trouvez votre fidget idéal en 3 clics
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/createur-cliqueur"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-md">
                            <Gamepad2 className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                                {t("nav_menu.clicker_studio")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Personnalisez votre clicker en 3D
                            </p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 mt-2">
                      <div className="min-w-0">
                        <h6 className="text-xs font-black text-white">
                          Une idée de jeu de société ou d'accessoire ?
                        </h6>
                        <p className="text-[11px] text-gray-400 truncate">
                          Partagez vos idées pour enrichir les prochaines créations 3D.
                        </p>
                      </div>

                      <Link
                        href="/jeux-de-societe#communaute"
                        onClick={() => setActiveTab(null)}
                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-indigo-500 text-white hover:text-white text-xs font-black shrink-0 transition-all duration-200 border border-white/15 cursor-pointer no-invert hover:scale-105 shadow-md"
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
                  {/* LEFT HERO / SPOTLIGHT CARD (Col 1 to 5) */}
                  <div className="col-span-5 relative rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-br from-emerald-600/30 via-black/80 to-black/95 p-6 flex flex-col justify-between group/hero shadow-xl">
                    {/* Light Sweep Reflection animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover/hero:translate-x-[150%] transition-transform duration-1000 z-20 pointer-events-none" />

                    <div className="absolute inset-0 opacity-40 group-hover/hero:opacity-65 transition-opacity duration-500 pointer-events-none">
                      <Image
                        src="/images/hero_background.jpg"
                        alt="Atelier Spoolio"
                        fill
                        className="object-cover object-center no-invert filter brightness-90 group-hover/hero:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />

                    <div className="relative z-20 space-y-2.5">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider shadow-lg no-invert">
                        <Leaf className="w-3.5 h-3.5 text-black animate-bounce" />
                        Impression 3D Eco 🇫🇷
                      </span>
                      <h4 className="text-xl font-black text-white leading-tight">
                        Savoir-Faire &amp; Engagement Spoolio
                      </h4>
                      <p className="text-xs text-gray-300 font-medium leading-relaxed">
                        Objets conçus en France à partir de bioplastiques compostables.
                      </p>
                    </div>

                    <div className="relative z-20 pt-6">
                      <Link
                        href="/a-propos"
                        onClick={() => setActiveTab(null)}
                        className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-emerald-500 hover:text-black transition-all duration-300 shadow-lg group/btn no-invert"
                      >
                        <span>Découvrir l'Atelier</span>
                        <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>

                  {/* RIGHT SECTION: 2 SUB-COLUMNS + BOTTOM ACTION BAR (Col 6 to 12) */}
                  <div className="col-span-7 flex flex-col justify-between space-y-4">
                    {/* Top 2 Vertical Columns */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Column A: L'Univers Spoolio */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">
                          L'Univers Spoolio
                        </h5>

                        <Link
                          href="/a-propos"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#ff4f00]/20 text-[#ff4f00] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                            <Palette className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-white group-hover:text-[#ff4f00] transition-colors truncate">
                                {t("nav_menu.our_story")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Savoir-faire &amp; engagements éco
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/blog"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-md">
                            <BookOpen className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                                {t("nav_menu.blog_title")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Guides 3D, coulisses &amp; ASMR
                            </p>
                          </div>
                        </Link>
                      </div>

                      {/* Column B: Services & Support */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">
                          Services &amp; Support
                        </h5>

                        <Link
                          href="/pro"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                            <Building2 className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate flex items-center gap-1">
                                <span>{t("nav_menu.pro_space")}</span>
                                <span className="text-[8px] font-black px-1 py-0.2 rounded bg-blue-500 text-white">
                                  B2B
                                </span>
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Goodies &amp; séries 3D sur-mesure
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/faq"
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-md">
                            <HelpCircle className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                                {t("nav_menu.faq_title")}
                              </h6>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Livraison, retours &amp; questions
                            </p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 mt-2">
                      <div className="min-w-0">
                        <h6 className="text-xs font-black text-white">
                          Un projet d'impression 3D sur-mesure pour votre entreprise ?
                        </h6>
                        <p className="text-[11px] text-gray-400 truncate">
                          Demandez une étude de faisabilité et un devis rapide.
                        </p>
                      </div>

                      <Link
                        href="/pro"
                        onClick={() => setActiveTab(null)}
                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-blue-500 text-white hover:text-white text-xs font-black shrink-0 transition-all duration-200 border border-white/15 cursor-pointer no-invert hover:scale-105 shadow-md"
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
