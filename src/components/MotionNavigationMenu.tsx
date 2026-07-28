"use client";

import { useState } from "react";
import Link from "next/link";
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
  Info,
  Building2,
  BookOpen,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  hasDropdown?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { id: "boutique", label: "Boutique", href: "/boutique", hasDropdown: true },
  { id: "univers", label: "Expériences & Jeux", hasDropdown: true },
  { id: "atelier", label: "L'Atelier", href: "/a-propos", hasDropdown: true },
];

export default function MotionNavigationMenu() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const handleMouseEnter = (id: string) => {
    setHoveredTab(id);
    setActiveTab(id);
  };

  const handleMouseLeave = () => {
    setHoveredTab(null);
    setActiveTab(null);
  };

  return (
    <div className="relative hidden lg:flex items-center" onMouseLeave={handleMouseLeave}>
      {/* Navigation Pills Bar */}
      <nav className="relative flex items-center gap-1 p-1.5 bg-white/10 dark:bg-white/10 light:bg-gray-100/80 backdrop-blur-xl border border-white/15 dark:border-white/15 light:border-gray-200 rounded-full shadow-lg">
        {MENU_ITEMS.map((item) => {
          const isSelected = activeTab === item.id;
          const isHovered = hoveredTab === item.id;

          return (
            <div
              key={item.id}
              className="relative px-4 py-2 rounded-full cursor-pointer select-none transition-colors"
              onMouseEnter={() => handleMouseEnter(item.id)}
            >
              {/* Animated Hover Pill Background */}
              {(isHovered || isSelected) && (
                <motion.div
                  layoutId="motion-nav-pill"
                  className="absolute inset-0 bg-white/20 dark:bg-white/20 light:bg-white rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Tab Title & Chevron */}
              {item.href && !item.hasDropdown ? (
                <Link
                  href={item.href}
                  className="relative z-10 flex items-center gap-1.5 text-xs font-bold text-white dark:text-white light:text-gray-900 tracking-wide"
                >
                  <span>{item.label}</span>
                </Link>
              ) : (
                <div className="relative z-10 flex items-center gap-1.5 text-xs font-bold text-white dark:text-white light:text-gray-900 tracking-wide">
                  <span>{item.label}</span>
                  {item.hasDropdown && (
                    <motion.div
                      animate={{ rotate: isSelected ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3.5 h-3.5 opacity-70" />
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
          className="relative px-3.5 py-1.5 ml-1 rounded-full bg-gradient-to-r from-[#ff4f00] to-[#FF8800] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform no-invert"
        >
          <span>Soutenir l'Atelier</span>
          <Heart className="w-3.5 h-3.5 fill-current text-white animate-pulse" />
        </Link>
      </nav>

      {/* Morphing Dropdown Panel Container */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute top-full left-0 mt-3 z-50 origin-top-left"
            onMouseEnter={() => setActiveTab(activeTab)}
          >
            <div className="w-[620px] tombola-card bg-[#131316]/95 dark:bg-[#131316]/95 light:bg-white/98 backdrop-blur-2xl border border-white/15 dark:border-white/15 light:border-gray-200 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] light:shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
              
              {/* DROPDOWN TAB 1: BOUTIQUE */}
              {activeTab === "boutique" && (
                <div className="grid grid-cols-12 gap-6">
                  {/* Featured Left Card */}
                  <div className="col-span-5 tombola-inner-box bg-gradient-to-br from-[#ff4f00]/20 via-[#ff4f00]/10 to-transparent p-5 rounded-2xl border border-[#ff4f00]/30 flex flex-col justify-between relative overflow-hidden group">
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ff4f00] text-white text-[9px] font-black uppercase tracking-wider no-invert">
                        🔥 POPULAIRE
                      </span>
                      <h4 className="text-base font-black text-white dark:text-white light:text-gray-900 leading-tight">
                        Fidgets & Objets Sensoriels
                      </h4>
                      <p className="text-xs text-gray-300 dark:text-gray-300 light:text-gray-600 leading-relaxed font-medium">
                        Manipulations apaisantes, clics satisfaisants et créations 3D TDAH.
                      </p>
                    </div>

                    <Link
                      href="/categorie/Fidgets"
                      className="mt-4 inline-flex items-center justify-between text-xs font-black text-[#ff4f00] group-hover:translate-x-1 transition-transform"
                    >
                      <span>Découvrir la collection</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Right Categories Links */}
                  <div className="col-span-7 grid grid-cols-1 gap-2">
                    <Link
                      href="/categorie/Fidgets"
                      className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-[#ff4f00]/20 text-[#ff4f00]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white dark:text-white light:text-gray-900 group-hover:text-[#ff4f00] transition-colors">
                            Fidgets & Sensoriel
                          </h5>
                          <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-400 light:text-gray-500">
                          Manipulations, clics & anti-stress
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/categorie/Geek %2F Gaming"
                      className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                        <Gamepad2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white dark:text-white light:text-gray-900 group-hover:text-cyan-400 transition-colors">
                            Geek & Gaming
                          </h5>
                          <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-400 light:text-gray-500">
                          Figurines, setups & univers pop-culture
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/categorie/Porte clés"
                      className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                        <Key className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white dark:text-white light:text-gray-900 group-hover:text-amber-400 transition-colors">
                            Porte-clés & Accessoires
                          </h5>
                          <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-400 light:text-gray-500">
                          Créations 3D originales & personnalisées
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/categorie/Animaux %26 Figurines"
                      className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Smile className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white dark:text-white light:text-gray-900 group-hover:text-emerald-400 transition-colors">
                            Animaux & Figurines 3D
                          </h5>
                          <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-400 light:text-gray-500">
                          Créatures articulées & figurines amusantes
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}

              {/* DROPDOWN TAB 2: EXPÉRIENCES & JEUX */}
              {activeTab === "univers" && (
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/pochette-surprise"
                    className="group tombola-inner-box bg-white/5 dark:bg-white/5 light:bg-gray-50 p-4 rounded-2xl border border-white/10 dark:border-white/10 light:border-gray-200 hover:border-[#ff4f00]/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-[#ff4f00]/20 text-[#ff4f00]">
                          <Gift className="w-5 h-5" />
                        </div>
                        <span className="bg-[#ff4f00]/20 text-[#ff4f00] text-[9px] font-black px-2 py-0.5 rounded-full uppercase no-invert">
                          ✨ NOUVEAU
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white dark:text-white light:text-gray-900 group-hover:text-[#ff4f00] transition-colors">
                        Pochettes Surprises 3D
                      </h4>
                      <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">
                        Sélection mystère avec animation d'ouverture et drops exclusifs.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#ff4f00]">
                      <span>Ouvrir ma pochette</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </Link>

                  <Link
                    href="/boussole-sensorielle"
                    className="group tombola-inner-box bg-white/5 dark:bg-white/5 light:bg-gray-50 p-4 rounded-2xl border border-white/10 dark:border-white/10 light:border-gray-200 hover:border-cyan-400/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                          <Compass className="w-5 h-5" />
                        </div>
                        <span className="bg-cyan-500/20 text-cyan-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase no-invert">
                          🧭 INTERACTIF
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white dark:text-white light:text-gray-900 group-hover:text-cyan-400 transition-colors">
                        Boussole Sensorielle
                      </h4>
                      <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">
                        Trouve l'objet apaisant idéal selon tes besoins et préférences.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-bold text-cyan-400">
                      <span>Lancer le test</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </Link>

                  <Link
                    href="/createur-cliqueur"
                    className="group tombola-inner-box bg-white/5 dark:bg-white/5 light:bg-gray-50 p-4 rounded-2xl border border-white/10 dark:border-white/10 light:border-gray-200 hover:border-purple-400/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                          <Gamepad2 className="w-5 h-5" />
                        </div>
                        <span className="bg-purple-500/20 text-purple-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase no-invert">
                          🎨 SUR-MESURE
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white dark:text-white light:text-gray-900 group-hover:text-purple-400 transition-colors">
                        Créateur de Clicker 3D
                      </h4>
                      <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">
                        Personnalise ton boîtier, tes switchs et tes gravures de touches en 3D.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-bold text-purple-400">
                      <span>Créer mon clicker</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </Link>

                  <Link
                    href="/tombola"
                    className="group col-span-2 tombola-inner-box bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-500/30 hover:border-amber-400/60 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                        <Ticket className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white dark:text-white light:text-gray-900 group-hover:text-amber-400 transition-colors">
                            Tombola du Moment
                          </h4>
                          <span className="bg-amber-500/20 text-amber-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase no-invert">
                            🎟️ JEU CONCOURS
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">
                          Choisis tes numéros et tente de remporter le grand Mega Pack !
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              )}

              {/* DROPDOWN TAB 3: L'ATELIER */}
              {activeTab === "atelier" && (
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/a-propos"
                    className="group tombola-inner-box bg-white/5 dark:bg-white/5 light:bg-gray-50 p-4 rounded-2xl border border-white/10 dark:border-white/10 light:border-gray-200 hover:border-[#ff4f00]/50 transition-all flex items-start gap-3"
                  >
                    <div className="p-2.5 rounded-xl bg-[#ff4f00]/20 text-[#ff4f00]">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white dark:text-white light:text-gray-900 group-hover:text-[#ff4f00] transition-colors">
                        Notre Histoire & Atelier
                      </h4>
                      <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1">
                        Découvre les coulisses de l'impression 3D et notre philosophie artisanale.
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/pro"
                    className="group tombola-inner-box bg-white/5 dark:bg-white/5 light:bg-gray-50 p-4 rounded-2xl border border-white/10 dark:border-white/10 light:border-gray-200 hover:border-blue-400/50 transition-all flex items-start gap-3"
                  >
                    <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white dark:text-white light:text-gray-900 group-hover:text-blue-400 transition-colors">
                        Espace Pro & Projets 3D
                      </h4>
                      <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1">
                        Partenariats, impressions sur-mesure et commandes pros.
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/blog"
                    className="group col-span-2 tombola-inner-box bg-gradient-to-r from-purple-500/15 via-purple-500/5 to-transparent p-4 rounded-2xl border border-purple-500/30 hover:border-purple-400/60 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white dark:text-white light:text-gray-900 group-hover:text-purple-400 transition-colors">
                            Le Blog Spoolio
                          </h4>
                          <span className="bg-purple-500/20 text-purple-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase no-invert">
                            📖 ARTICLES & GUIDES
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">
                          Guides fidgets, conseils concentration, ASMR et coulisses de l'impression 3D.
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
