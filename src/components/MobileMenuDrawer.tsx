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
      <div className="relative w-[340px] max-w-[85vw] h-full bg-white border-r border-zinc-200 flex flex-col justify-between p-5 shadow-[0_0_50px_rgba(0,0,0,0.15)] z-10 animate-in slide-in-from-left duration-300 text-zinc-900">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
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
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-950 transition-all cursor-pointer active:scale-95"
              aria-label="Rechercher"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-950 transition-all cursor-pointer active:scale-95"
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
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1 block">
              Boutique &amp; Univers
            </span>

            {/* 0. Calendrier de l'Avent Spoolio */}
            <Link
              href="/calendrier-avent"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-red-50/70 hover:bg-red-100/70 border border-red-200 transition-all group active:scale-[0.99] shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                  <Gift className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-900 group-hover:text-red-700 transition-colors flex items-center gap-1.5">
                    <span>Calendrier de l&apos;Avent 3D</span>
                  </span>
                  <span className="text-[10px] text-red-700/80">Précommandes ouvertes • Édition 50 ex.</span>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                2026 🎄
              </span>
            </Link>

            {/* 1. Toute la Boutique */}
            <Link
              href="/boutique"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#ff4f00]/10 border border-[#ff4f00]/20 flex items-center justify-center text-[#ff4f00] shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors">
                  Toute la Boutique
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* 1.5. Jeux de Société & App Enjeu */}
            <Link
              href="/jeux-de-societe"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/60 hover:bg-indigo-100/60 border border-indigo-200/80 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                  <Dices className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                    Jeux de Société &amp; App Enjeu
                  </span>
                  <span className="text-[10px] text-zinc-500">Accessoires 3D &amp; App Gratuite</span>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                Nouveau
              </span>
            </Link>

            {/* 2. Fidgets Anti-Stress */}
            <Link
              href="/categorie/Fidgets"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#ff4f00]/10 border border-[#ff4f00]/20 flex items-center justify-center text-[#ff4f00] shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors">
                  Fidgets &amp; Anti-Stress
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#ff4f00]/10 text-[#ff4f00] border border-[#ff4f00]/20">
                TDAH
              </span>
            </Link>

            {/* 3. Studio Clicker 3D */}
            <Link
              href="/createur-cliqueur"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
                  <Keyboard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-zinc-900 group-hover:text-cyan-600 transition-colors">
                  Studio Clickers 3D
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
                Sur-Mesure
              </span>
            </Link>

            {/* 4. Dragons & Figurines */}
            <Link
              href="/categorie/Animaux %26 Figurines"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                  <Shapes className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-zinc-900 group-hover:text-purple-600 transition-colors">
                  Dragons &amp; Figurines
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* 5. Pochettes Surprises */}
            <Link
              href="/pochette-surprise"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">
                  Pochettes Surprises
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Dès 10€
              </span>
            </Link>
          </div>

          {/* Expériences & Outils */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-200">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1 block">
              Expériences &amp; Outils
            </span>

            <Link
              href="/boussole-sensorielle"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 transition-all group text-xs text-zinc-700 hover:text-zinc-950"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-cyan-600" />
                <span>Boussole Sensorielle TDAH</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>

            {/* Tombola (Uniquement si active en admin) */}
            {isTombolaActive && (
              <Link
                href="/tombola"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 transition-all group text-xs text-zinc-700 hover:text-zinc-950"
              >
                <div className="flex items-center gap-2.5">
                  <Ticket className="w-4 h-4 text-amber-500" />
                  <span>Tombola Spoolio</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </Link>
            )}

            <Link
              href="/medaillon-nfc-chien-chat"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 transition-all group text-xs text-zinc-700 hover:text-zinc-950"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#ff4f00]" />
                <span>Médaillon SOS NFC Chien &amp; Chat</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>

          {/* L'Atelier Spoolio */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-200">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1 block">
              L&apos;Atelier
            </span>

            <Link
              href="/a-propos"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 transition-all group text-xs text-zinc-700 hover:text-zinc-950"
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-purple-600" />
                <span>Notre Histoire &amp; Éco-conception</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>

            <Link
              href="/faq"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 transition-all group text-xs text-zinc-700 hover:text-zinc-950"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>FAQ &amp; Contact</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>

            <Link
              href="/pro"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 transition-all group text-xs text-zinc-700 hover:text-zinc-950"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Espace Professionnels (B2B)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>

            <Link
              href="/don"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 transition-all group text-xs text-zinc-700 hover:text-zinc-950"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-[#ff4f00] fill-[#ff4f00]" />
                <span className="font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors">
                  Soutenir Spoolio (Dons)
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#ff4f00]/10 text-[#ff4f00] border border-[#ff4f00]/20">
                💖 Merci
              </span>
            </Link>
          </div>
        </div>

        {/* Pinned Bottom Action: Soutenir Spoolio */}
        <div className="pt-3 border-t border-zinc-200 shrink-0">
          <Link
            href="/don"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff4f00] via-[#FF6600] to-[#FF8800] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#ff4f00]/20 hover:opacity-95 active:scale-[0.98] transition-all no-invert"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>Soutenir l&apos;Atelier Spoolio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
