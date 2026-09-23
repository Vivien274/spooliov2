"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Sparkles,
  Keyboard,
  Shapes,
  Gift,
  Compass,
  Ticket,
  ShieldCheck,
  Dices,
  Palette,
  Building2,
  HelpCircle,
  Search,
  X,
  ChevronRight,
  Heart,
  Flame,
} from "lucide-react";
import { isPreprodEnv } from "@/lib/env";

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
}: MobileMenuDrawerProps) {
  const [isTombolaActive, setIsTombolaActive] = useState<boolean>(false);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex md:hidden font-sans select-none animate-in fade-in duration-200">
      {/* Soft dark overlay backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container (sleek, minimalist, high-end) */}
      <div className="relative w-[320px] max-w-[85vw] h-full bg-white border-r border-zinc-200 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-300 text-zinc-900">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <Link href="/" onClick={onClose} className="flex items-center">
            <Image
              src="/images/logo-spoolio-eyes.png"
              alt="Spoolio Logo"
              width={100}
              height={30}
              className="h-7 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className="p-1.5 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
              aria-label="Rechercher"
              title="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
              aria-label="Fermer le menu"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation - Clean, Sober, High-End */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
          
          {/* 1. Main Catalog Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 px-3 mb-1.5 block">
              Boutique
            </span>

            {/* Toute la Boutique */}
            <Link
              href="/boutique"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-zinc-400 group-hover:text-[#ff4f00] transition-colors" />
                <span className="text-sm font-semibold font-outfit text-zinc-900 group-hover:text-zinc-950">
                  Toute la boutique
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* Fidgets & Anti-Stress */}
            <Link
              href="/categorie/Fidgets"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-zinc-400 group-hover:text-[#ff4f00] transition-colors" />
                <span className="text-sm font-semibold font-outfit text-zinc-900 group-hover:text-zinc-950">
                  Fidgets &amp; Sensoriel
                </span>
              </div>
              <span className="text-[10px] font-mono font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                TDAH
              </span>
            </Link>

            {/* Jeux de Société & App Enjeu */}
            <Link
              href="/jeux-de-societe"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Dices className="w-4 h-4 text-zinc-400 group-hover:text-[#ff4f00] transition-colors" />
                <span className="text-sm font-semibold font-outfit text-zinc-900 group-hover:text-zinc-950">
                  Jeux de Société &amp; Enjeu
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#ff4f00] bg-[#ff4f00]/10 px-2 py-0.5 rounded-full">
                App
              </span>
            </Link>

            {/* Studio Clicker 3D */}
            <Link
              href="/createur-cliqueur"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Keyboard className="w-4 h-4 text-zinc-400 group-hover:text-[#ff4f00] transition-colors" />
                <span className="text-sm font-semibold font-outfit text-zinc-900 group-hover:text-zinc-950">
                  Studio Clickers 3D
                </span>
              </div>
              <span className="text-[10px] font-mono font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                Custom
              </span>
            </Link>

            {/* Dragons & Figurines */}
            <Link
              href="/categorie/Animaux %26 Figurines"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Shapes className="w-4 h-4 text-zinc-400 group-hover:text-[#ff4f00] transition-colors" />
                <span className="text-sm font-semibold font-outfit text-zinc-900 group-hover:text-zinc-950">
                  Dragons &amp; Figurines Articulées
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* Pochettes Surprises / Blind Bags */}
            <Link
              href="/pochette-surprise"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Gift className="w-4 h-4 text-zinc-400 group-hover:text-[#ff4f00] transition-colors" />
                <span className="text-sm font-semibold font-outfit text-zinc-900 group-hover:text-zinc-950">
                  Pochettes Surprises
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* Drops Exclusifs */}
            <Link
              href="/drops"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Flame className="w-4 h-4 text-[#ff4f00] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold font-outfit text-zinc-900 group-hover:text-zinc-950">
                  Drops Exclusifs
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#ff4f00] bg-[#ff4f00]/10 px-2 py-0.5 rounded-full">
                Séries Limitées
              </span>
            </Link>
          </div>

          {/* 2. Expériences & Outils */}
          <div className="space-y-1 pt-3 border-t border-zinc-100">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 px-3 mb-1.5 block">
              Expériences
            </span>

            {/* Calendrier de l'Avent Spoolio */}
            <Link
              href="/calendrier-avent"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Gift className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-950">
                  Calendrier de l&apos;Avent 3D
                </span>
              </div>
              <span className="text-[10px] font-mono font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                2026
              </span>
            </Link>

            {/* Boussole Sensorielle TDAH */}
            <Link
              href="/boussole-sensorielle"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-950">
                  Boussole Sensorielle
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500" />
            </Link>

            {/* Médaillon SOS NFC */}
            <Link
              href="/medaillon-nfc-chien-chat"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-950">
                  Médaillon SOS NFC Animaux
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500" />
            </Link>

            {/* Tombola (si active) */}
            {isTombolaActive && (
              <Link
                href="/tombola"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Ticket className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                  <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-950">
                    Tombola Spoolio
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  En cours
                </span>
              </Link>
            )}
          </div>

          {/* 3. L'Atelier */}
          <div className="space-y-1 pt-3 border-t border-zinc-100">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 px-3 mb-1.5 block">
              L&apos;Atelier
            </span>

            <Link
              href="/a-propos"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-950">
                  Histoire &amp; Éco-conception
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500" />
            </Link>

            <Link
              href="/faq"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-950">
                  FAQ &amp; Contact
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500" />
            </Link>

            <Link
              href="/pro"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-950">
                  Espace Professionnels (B2B)
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500" />
            </Link>
          </div>

        </div>

        {/* Pinned Bottom Action: Discreet, Elegant Workshop Support Link */}
        <div className="p-4 border-t border-zinc-100 shrink-0 space-y-2 bg-zinc-50/50">
          <Link
            href="/don"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Heart className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#ff4f00]" />
            <span>Soutenir l&apos;Atelier Spoolio</span>
          </Link>
          <p className="text-[10px] text-zinc-400 text-center font-medium">
            Impression 3D biosourcée • Comines (59) 🇫🇷
          </p>
        </div>

      </div>
    </div>
  );
}
