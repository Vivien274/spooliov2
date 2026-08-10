"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Sparkles,
  Compass,
  Gift,
  Ticket,
  Heart,
  ChevronDown,
  ArrowUpRight,
  Gamepad2,
  Smile,
  Key,
  Palette,
  Building2,
  BookOpen,
  HelpCircle,
  Shapes,
  ShieldCheck,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  hasDropdown?: boolean;
}

export default function MotionNavigationMenu() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const menuItems: MenuItem[] = [
    { id: "boutique", label: t("header.shop"), href: "/boutique", hasDropdown: true },
    { id: "univers", label: t("header.experiences"), hasDropdown: true },
    { id: "atelier", label: t("header.workshop"), href: "/a-propos", hasDropdown: true },
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
    }, 180);
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

  // Close dropdown when pressing Escape
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
    <div ref={containerRef} className="relative hidden lg:flex items-center" onMouseLeave={handleMouseLeave}>
      {/* Navigation Pills Bar (Translucent Glassmorphism) */}
      <nav className="relative flex items-center gap-1.5 p-1.5 bg-black/40 dark:bg-black/40 backdrop-blur-2xl border border-white/20 rounded-full shadow-2xl shadow-black/60">
        {menuItems.map((item) => {
          const isSelected = activeTab === item.id;
          const isHovered = hoveredTab === item.id;

          return (
            <div
              key={item.id}
              className="relative px-4 py-2 rounded-full cursor-pointer select-none transition-all duration-200"
              onMouseEnter={() => handleMouseEnter(item.id)}
            >
              {/* Animated Hover Pill Background */}
              {(isHovered || isSelected) && (
                <motion.div
                  layoutId="motion-nav-pill"
                  className="absolute inset-0 bg-gradient-to-r from-white/15 to-white/10 rounded-full border border-white/20 shadow-md"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}

              {/* Tab Title & Chevron */}
              {item.href && !item.hasDropdown ? (
                <Link
                  href={item.href}
                  className="relative z-10 flex items-center gap-1.5 text-xs font-bold text-white tracking-wide"
                >
                  <span>{item.label}</span>
                </Link>
              ) : (
                <div className="relative z-10 flex items-center gap-1.5 text-xs font-bold text-white tracking-wide">
                  <span>{item.label}</span>
                  {item.hasDropdown && (
                    <motion.div
                      animate={{ rotate: isSelected ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Highlighted CTA Badge */}
        <Link
          href="/don"
          className="relative px-4 py-2 ml-1 rounded-full bg-gradient-to-r from-[#ff4f00] via-[#FF6600] to-[#FF8800] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#ff4f00]/30 hover:scale-105 transition-all duration-200 cursor-pointer no-invert group"
        >
          <span>{t("footer.support_workshop")}</span>
          <Heart className="w-3.5 h-3.5 fill-current text-white animate-pulse group-hover:scale-125 transition-transform" />
        </Link>
      </nav>

      {/* Morphing Mega Dropdown Panel Container with Invisible Hover Bridge */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 pt-2.5 z-[999999] origin-top-left"
            onMouseEnter={handleDropdownMouseEnter}
          >
            <div className="w-[660px] bg-[#121215]/98 backdrop-blur-3xl border border-white/20 rounded-3xl p-6 shadow-[0_30px_70px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
              
              {/* DROPDOWN TAB 1: BOUTIQUE */}
              {activeTab === "boutique" && (
                <div className="space-y-4">
                  {/* Top Banner: Voir toute la boutique */}
                  <Link
                    href="/boutique"
                    className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#2F3CD9]/30 via-[#ff4f00]/20 to-[#FF8800]/20 hover:from-[#2F3CD9]/45 hover:via-[#ff4f00]/35 hover:to-[#FF8800]/35 border border-white/20 shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#2F3CD9] to-[#5163FF] text-white shadow-lg shadow-[#2F3CD9]/40 group-hover:scale-110 transition-transform no-invert">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white group-hover:text-[#ff4f00] transition-colors font-extrabold">
                            {t("nav_menu.see_all_shop")}
                          </h4>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#ff4f00] text-white shadow-sm no-invert">
                            {t("nav_menu.full_catalog_badge")}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 font-medium mt-0.5">
                          {t("nav_menu.full_catalog_desc")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-black text-[#ff4f00] group-hover:translate-x-1 transition-transform pr-2">
                      <span>{t("common.see_all")}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </Link>

                  <div className="grid grid-cols-12 gap-5">
                    {/* Featured Left Card */}
                    <div className="col-span-5 bg-gradient-to-br from-[#ff4f00]/25 via-[#ff4f00]/10 to-transparent p-5 rounded-2xl border border-[#ff4f00]/35 flex flex-col justify-between relative overflow-hidden group hover:border-[#ff4f00]/60 transition-all">
                      <div className="space-y-2.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ff4f00] text-white text-[9px] font-black uppercase tracking-wider shadow-md no-invert">
                          {t("nav_menu.must_have_badge")}
                        </span>
                        <h4 className="text-base font-black text-white leading-tight font-extrabold">
                          {t("nav_menu.fidgets_card_title")}
                        </h4>
                        <p className="text-xs text-gray-300 leading-relaxed font-medium">
                          {t("nav_menu.fidgets_card_desc")}
                        </p>
                      </div>

                      <Link
                        href="/categorie/Fidgets"
                        className="mt-5 inline-flex items-center justify-between text-xs font-black text-[#ff4f00] group-hover:translate-x-1 transition-transform"
                      >
                        <span>{t("nav_menu.discover_fidgets")}</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Right Categories Grid */}
                    <div className="col-span-7 grid grid-cols-1 gap-2">
                      <Link
                        href="/categorie/Fidgets"
                        className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#ff4f00]/20 text-[#ff4f00]">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white group-hover:text-[#ff4f00] transition-colors">
                              {t("header.categories.fidgets")}
                            </h5>
                            <p className="text-[11px] text-gray-400">
                              {t("nav_menu.fidgets_sub")}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      <Link
                        href="/categorie/Geek %2F Gaming"
                        className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                            <Gamepad2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                              {t("nav_menu.geek_gaming")}
                            </h5>
                            <p className="text-[11px] text-gray-400">
                              {t("nav_menu.geek_sub")}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      <Link
                        href="/categorie/Porte clés"
                        className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                            <Key className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                              {t("nav_menu.keychain_title")}
                            </h5>
                            <p className="text-[11px] text-gray-400">
                              {t("nav_menu.keychain_sub")}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      <Link
                        href="/categorie/Animaux %26 Figurines"
                        className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                            <Smile className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {t("nav_menu.animals_title")}
                            </h5>
                            <p className="text-[11px] text-gray-400">
                              {t("nav_menu.animals_sub")}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      <Link
                        href="/medaillon-nfc-chien-chat"
                        className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-[#ff4f00]/30 transition-all bg-[#ff4f00]/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#ff4f00]/20 text-[#ff4f00]">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white group-hover:text-[#ff4f00] transition-colors flex items-center gap-1.5">
                              <span>{t("nav_menu.nfc_title")}</span>
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#ff4f00] text-black">SOS</span>
                            </h5>
                            <p className="text-[11px] text-gray-400">
                              {t("nav_menu.nfc_sub")}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#ff4f00] group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* DROPDOWN TAB 2: EXPÉRIENCES & JEUX (Harmonized 2x2 Grid) */}
              {activeTab === "univers" && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Card 1: Pochettes Surprises 3D */}
                  <Link
                    href="/pochette-surprise"
                    className="group bg-gradient-to-br from-[#ff4f00]/15 via-white/5 to-transparent p-4 rounded-2xl border border-white/15 hover:border-[#ff4f00]/60 transition-all duration-200 flex flex-col justify-between h-40 shadow-lg hover:shadow-[#ff4f00]/10"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-[#ff4f00]/20 text-[#ff4f00] group-hover:scale-110 transition-transform">
                          <Gift className="w-5 h-5" />
                        </div>
                        <span className="bg-[#ff4f00]/20 text-[#ff4f00] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider no-invert">
                          ✨ NOUVEAU
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white group-hover:text-[#ff4f00] transition-colors font-extrabold">
                        {t("nav_menu.surprise_pack")}
                      </h4>
                      <p className="text-xs text-gray-300 leading-snug line-clamp-2">
                        {t("nav_menu.surprise_pack_sub")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs font-black text-[#ff4f00]">
                      <span>{t("nav_menu.open_pack")}</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </Link>

                  {/* Card 2: Boussole Sensorielle */}
                  <Link
                    href="/boussole-sensorielle"
                    className="group bg-gradient-to-br from-cyan-500/15 via-white/5 to-transparent p-4 rounded-2xl border border-white/15 hover:border-cyan-400/60 transition-all duration-200 flex flex-col justify-between h-40 shadow-lg hover:shadow-cyan-500/10"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                          <Compass className="w-5 h-5" />
                        </div>
                        <span className="bg-cyan-500/20 text-cyan-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider no-invert">
                          🧭 INTERACTIF
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors font-extrabold">
                        {t("nav_menu.boussole_title")}
                      </h4>
                      <p className="text-xs text-gray-300 leading-snug line-clamp-2">
                        {t("nav_menu.boussole_desc")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs font-black text-cyan-400">
                      <span>{t("nav_menu.launch_test")}</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </Link>

                  {/* Card 3: Créateur de Clicker 3D */}
                  <Link
                    href="/createur-cliqueur"
                    className="group bg-gradient-to-br from-purple-500/15 via-white/5 to-transparent p-4 rounded-2xl border border-white/15 hover:border-purple-400/60 transition-all duration-200 flex flex-col justify-between h-40 shadow-lg hover:shadow-purple-500/10"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                          <Gamepad2 className="w-5 h-5" />
                        </div>
                        <span className="bg-purple-500/20 text-purple-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider no-invert">
                          🎨 SUR-MESURE
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white group-hover:text-purple-400 transition-colors font-extrabold">
                        {t("nav_menu.clicker_studio")}
                      </h4>
                      <p className="text-xs text-gray-300 leading-snug line-clamp-2">
                        {t("nav_menu.clicker_studio_desc")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs font-black text-purple-400">
                      <span>{t("nav_menu.create_clicker")}</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </Link>

                  {/* Card 4: Tombola du Moment */}
                  <Link
                    href="/tombola"
                    className="group bg-gradient-to-br from-amber-500/15 via-white/5 to-transparent p-4 rounded-2xl border border-white/15 hover:border-amber-400/60 transition-all duration-200 flex flex-col justify-between h-40 shadow-lg hover:shadow-amber-500/10"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                          <Ticket className="w-5 h-5" />
                        </div>
                        <span className="bg-amber-500/20 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider no-invert">
                          🎟️ JEU CONCOURS
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors font-extrabold">
                        {t("nav_menu.tombola_title")}
                      </h4>
                      <p className="text-xs text-gray-300 leading-snug line-clamp-2">
                        {t("nav_menu.tombola_desc")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs font-black text-amber-400">
                      <span>{t("nav_menu.try_luck")}</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </Link>
                </div>
              )}

              {/* DROPDOWN TAB 3: L'ATELIER (Balanced 2x2 Grid) */}
              {activeTab === "atelier" && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Card 1: Histoire & Atelier */}
                  <Link
                    href="/a-propos"
                    className="group bg-gradient-to-br from-[#ff4f00]/15 via-white/5 to-transparent p-4 rounded-2xl border border-white/15 hover:border-[#ff4f00]/60 transition-all duration-200 flex flex-col justify-between h-40 shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-[#ff4f00]/20 text-[#ff4f00] group-hover:scale-110 transition-transform">
                          <Palette className="w-5 h-5" />
                        </div>
                        <span className="bg-[#ff4f00]/20 text-[#ff4f00] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider no-invert">
                          ✨ ARTISANAL
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white group-hover:text-[#ff4f00] transition-colors font-extrabold">
                        {t("nav_menu.our_story")}
                      </h4>
                      <p className="text-xs text-gray-300 leading-snug line-clamp-2">
                        {t("nav_menu.our_story_desc")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs font-black text-[#ff4f00]">
                      <span>{t("nav_menu.discover_workshop")}</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </Link>

                  {/* Card 2: Espace Pro */}
                  <Link
                    href="/pro"
                    className="group bg-gradient-to-br from-blue-500/15 via-white/5 to-transparent p-4 rounded-2xl border border-white/15 hover:border-blue-400/60 transition-all duration-200 flex flex-col justify-between h-40 shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <span className="bg-blue-500/20 text-blue-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider no-invert">
                          🏢 PROJETS 3D
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors font-extrabold">
                        {t("nav_menu.pro_space")}
                      </h4>
                      <p className="text-xs text-gray-300 leading-snug line-clamp-2">
                        {t("nav_menu.pro_space_desc")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs font-black text-blue-400">
                      <span>{t("nav_menu.custom_projects")}</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </Link>

                  {/* Card 3: Le Blog Spoolio */}
                  <Link
                    href="/blog"
                    className="group bg-gradient-to-br from-purple-500/15 via-white/5 to-transparent p-4 rounded-2xl border border-white/15 hover:border-purple-400/60 transition-all duration-200 flex flex-col justify-between h-40 shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="bg-purple-500/20 text-purple-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider no-invert">
                          📖 GUIDES &amp; ASMR
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white group-hover:text-purple-400 transition-colors font-extrabold">
                        {t("nav_menu.blog_title")}
                      </h4>
                      <p className="text-xs text-gray-300 leading-snug line-clamp-2">
                        {t("nav_menu.blog_desc")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs font-black text-purple-400">
                      <span>{t("nav_menu.read_articles")}</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </Link>

                  {/* Card 4: FAQ & Support */}
                  <Link
                    href="/faq"
                    className="group bg-gradient-to-br from-emerald-500/15 via-white/5 to-transparent p-4 rounded-2xl border border-white/15 hover:border-emerald-400/60 transition-all duration-200 flex flex-col justify-between h-40 shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider no-invert">
                          ❓ AIDE &amp; LIVRAISON
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors font-extrabold">
                        {t("nav_menu.faq_title")}
                      </h4>
                      <p className="text-xs text-gray-300 leading-snug line-clamp-2">
                        {t("nav_menu.faq_desc")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs font-black text-emerald-400">
                      <span>{t("nav_menu.view_faq")}</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
