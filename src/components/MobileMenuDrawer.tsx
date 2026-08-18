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
  Palette,
  Building2,
  HelpCircle,
  Search,
  X,
  ChevronRight,
  Sun,
  Moon,
  Heart,
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
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container (slide-in from left) */}
      <div className="relative w-[340px] max-w-[85vw] h-full bg-[#0e0e12] border-r border-white/10 flex flex-col justify-between p-5 shadow-[0_0_50px_rgba(0,0,0,0.9)] z-10 animate-in slide-in-from-left duration-300 text-white">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Spoolio Logo"
              width={100}
              height={30}
              className="h-7 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95"
              aria-label="Rechercher"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95"
              aria-label="Fermer le menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 custom-scrollbar pr-1">
          
          {/* Main Direct Navigation */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 px-2 mb-1 block">
              Boutique &amp; Univers
            </span>

            {/* 1. Toute la Boutique */}
            <Link
              href="/boutique"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#ff4f00]/15 border border-[#ff4f00]/30 flex items-center justify-center text-[#ff4f00] shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-[#ff4f00] transition-colors">
                  Toute la Boutique
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* 2. Fidgets Anti-Stress */}
            <Link
              href="/categorie/Fidgets"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#ff4f00]/15 border border-[#ff4f00]/30 flex items-center justify-center text-[#ff4f00] shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-[#ff4f00] transition-colors">
                  Fidgets &amp; Anti-Stress
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#ff4f00]/20 text-[#ff4f00] border border-[#ff4f00]/30">
                TDAH
              </span>
            </Link>

            {/* 3. Studio Clicker 3D */}
            <Link
              href="/createur-cliqueur"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Keyboard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Studio Clickers 3D
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Sur-Mesure
              </span>
            </Link>

            {/* 4. Dragons & Figurines */}
            <Link
              href="/categorie/Animaux %26 Figurines"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Shapes className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                  Dragons &amp; Figurines
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* 5. Pochettes Surprises */}
            <Link
              href="/pochette-surprise"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Pochettes Surprises
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Dès 10€
              </span>
            </Link>
          </div>

          {/* Expériences & Outils */}
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 px-2 mb-1 block">
              Expériences &amp; Outils
            </span>

            <Link
              href="/boussole-sensorielle"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all group text-xs text-gray-300 hover:text-white"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Boussole Sensorielle TDAH</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            </Link>

            {/* Tombola (Uniquement si active en admin) */}
            {isTombolaActive && (
              <Link
                href="/tombola"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all group text-xs text-gray-300 hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <span>Tombola Spoolio</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
              </Link>
            )}

            <Link
              href="/medaillon-nfc-chien-chat"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all group text-xs text-gray-300 hover:text-white"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#ff4f00]" />
                <span>Médaillon SOS NFC Chien &amp; Chat</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            </Link>
          </div>

          {/* L'Atelier Spoolio */}
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 px-2 mb-1 block">
              L&apos;Atelier
            </span>

            <Link
              href="/a-propos"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all group text-xs text-gray-300 hover:text-white"
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Notre Histoire &amp; Éco-conception</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            </Link>

            <Link
              href="/faq"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all group text-xs text-gray-300 hover:text-white"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>FAQ &amp; Contact</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            </Link>

            <Link
              href="/pro"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all group text-xs text-gray-300 hover:text-white"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Espace Professionnels (B2B)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            </Link>
          </div>

          {/* Soutenir Spoolio Button */}
          <Link
            href="/don"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff4f00] to-[#ff7700] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#ff4f00]/25 active:scale-[0.98] transition-transform no-invert"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>Soutenir l&apos;Atelier</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
