"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import EnjeuBanner from "@/components/EnjeuBanner";
import {
  ShieldCheck,
  Share2,
  Check,
  ArrowUpRight,
  Sparkles,
  Flame,
  Zap,
  ShoppingBag,
  Heart,
  Gift,
  Ticket,
  Compass,
  Star,
  Mail,
  ExternalLink,
  Sliders,
  Package
} from "lucide-react";

export interface LinkItem {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  icon?: string;
  badge?: string;
  style?: "normal" | "glow" | "pulse" | "highlight";
  isPublished: boolean;
  order: number;
  clicks?: number;
}

export interface HubProfile {
  title: string;
  subtitle: string;
  avatar: string;
  verifiedBadge?: boolean;
  theme?: string;
  socials?: {
    tiktok?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    email?: string;
  };
}

interface LinkHubClientProps {
  initialProfile?: HubProfile;
  initialLinks?: LinkItem[];
  isPreview?: boolean;
}

const DEFAULT_PROFILE: HubProfile = {
  title: "Spoolio.fr 🌀",
  subtitle: "Créateur d'Objets 3D & Fidgets Sensoriels TDAH 🇫🇷",
  avatar: "https://ugc.production.linktr.ee/fdb01a4c-7a6f-4109-92fc-331e44f5bb26_Frame-294.png",
  verifiedBadge: true,
  socials: {
    tiktok: "https://www.tiktok.com/@spoolio.fr",
    instagram: "https://www.instagram.com/spoolio.fr",
    facebook: "https://www.facebook.com/spoolio.fr",
    email: "contact@spoolio.fr"
  }
};

// Official TikTok SVG Icon
function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.82V7.59a6.34 6.34 0 0 0-5.71 6.31 6.33 6.33 0 0 0 11.39 3.86 6.33 6.33 0 0 0 .66-2.73V8.8a8.28 8.28 0 0 0 4.77 1.51V6.86a4.82 4.82 0 0 1-1.04-.17z" />
    </svg>
  );
}

// Official Instagram SVG Icon
function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// Official Facebook SVG Icon
function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// Official YouTube SVG Icon
function YouTubeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function LinkHubClient({ initialProfile, initialLinks, isPreview = false }: LinkHubClientProps) {
  const [profile, setProfile] = useState<HubProfile>(initialProfile || DEFAULT_PROFILE);
  const [links, setLinks] = useState<LinkItem[]>(initialLinks || []);
  const [loading, setLoading] = useState<boolean>(!initialLinks);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  useEffect(() => {
    if (initialLinks) {
      setLinks(initialLinks);
    }
  }, [initialLinks]);

  useEffect(() => {
    if (!initialLinks) {
      fetch("/api/links")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.profile) setProfile(data.profile);
            if (data.links) setLinks(data.links);
          }
        })
        .catch((e) => console.error("Error loading links:", e))
        .finally(() => setLoading(false));
    }
  }, [initialLinks]);

  const handleLinkClick = (linkId: string) => {
    if (isPreview) return;
    try {
      fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "click", linkId }),
      });
    } catch (e) {}
  };

  const handleShare = async () => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "https://www.spoolio.fr/liens";
    if (navigator.share && !isPreview) {
      try {
        await navigator.share({
          title: profile.title || "Spoolio Links",
          text: profile.subtitle,
          url: currentUrl,
        });
        return;
      } catch (e) {}
    }

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch (e) {}
  };

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-white flex flex-col items-center justify-between p-3 sm:p-6 font-sans relative overflow-hidden select-none">
      
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#ff4f00]/25 via-purple-600/15 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-50px] w-[450px] h-[450px] bg-gradient-to-tl from-cyan-500/15 via-blue-600/10 to-transparent rounded-full blur-[130px] pointer-events-none" />

      {/* Grid Pattern Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* MAIN CONTENT WRAPPER */}
      <div className="w-full max-w-xl mx-auto space-y-6 pt-2 pb-12 z-10 flex flex-col items-center">

        {/* TOP BAR NAVIGATION */}
        <div className="w-full flex items-center justify-between px-1 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
              Atelier 3D Spoolio (Comines 🇫🇷)
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all backdrop-blur-md shadow cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs font-bold"
            title="Partager cette page"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Partager</span>
          </button>
        </div>

        {/* SHARE TOAST NOTIFICATION */}
        <AnimatePresence>
          {copiedToast && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="fixed top-6 z-50 px-4 py-2 rounded-full bg-[#ff4f00] text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/20"
            >
              <Check className="w-4 h-4" />
              <span>Lien Spoolio copié dans le presse-papier !</span>
            </motion.div>
          )}
        </AnimatePresence>


        {/* PROFILE HEADER HERO (CLEAN FLUID HEADER, NO CARD) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full py-4 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left relative"
        >
          {/* Conic Ring Avatar */}
          <div className="relative group shrink-0">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#ff4f00] via-purple-500 to-cyan-400 blur-md opacity-80 group-hover:opacity-100 transition duration-700 animate-spin-slow" />
            
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/30 shadow-2xl bg-neutral-950 p-1">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src={profile.avatar || "https://ugc.production.linktr.ee/fdb01a4c-7a6f-4109-92fc-331e44f5bb26_Frame-294.png"}
                  alt={profile.title || "Spoolio Links"}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 bg-[#ff4f00] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow border border-white/20 whitespace-nowrap">
              3D &amp; FIDGETS
            </div>
          </div>

          {/* Profile Text */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
                {profile.title || "Spoolio.fr 🌀"}
              </h1>
              {profile.verifiedBadge !== false && (
                <ShieldCheck className="w-5 h-5 text-[#ff4f00] fill-[#ff4f00]/20" />
              )}
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-snug">
              {profile.subtitle}
            </p>

            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-mono text-neutral-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span>🇫🇷</span>
                <span>Objets Imprimés en France</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            BENTO GRID LAYOUT (INTERACTIVE BENTO HUB)
           ========================================================================= */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">

          {/* 1. BOUTIQUE OFFICIELLE (SPAN 2 - EN PREMIER) */}
          <motion.a
            href="https://www.spoolio.fr/boutique"
            onClick={() => handleLinkClick("link-boutique")}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            whileHover={{ scale: 1.015, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="sm:col-span-2 group relative p-6 rounded-3xl bg-gradient-to-r from-[#ff4f00]/30 via-neutral-900/90 to-neutral-950 border border-[#ff4f00]/60 hover:border-[#ff4f00] backdrop-blur-2xl shadow-[0_15px_40px_rgba(255,79,0,0.15)] flex items-center justify-between gap-4 overflow-hidden cursor-pointer"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#ff4f00] text-white flex items-center justify-center text-2xl shrink-0 shadow-lg border border-white/20">
                🛒
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#ff4f00] text-white shadow">
                    🛍️ ACCÈS DIRECT
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-[#ff4f00] transition-colors">
                  La Boutique Officielle Spoolio.fr
                </h3>
                <p className="text-xs text-neutral-300 font-medium leading-tight mt-0.5">
                  Découvre toute notre collection d'objets, figurines &amp; fidgets 3D.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 relative z-10">
              <span className="text-xs font-bold text-white bg-[#ff4f00] px-4 py-2 rounded-xl shadow-md group-hover:bg-[#e04500] transition-colors hidden sm:inline-block">
                Explorer le Shop
              </span>
              <ArrowUpRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.a>

          {/* 2. CLICKER CREATOR (SPAN 2) */}
          <motion.a
            href="https://www.spoolio.fr/createur-cliqueur"
            onClick={() => handleLinkClick("link-clicker")}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ scale: 1.015, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="sm:col-span-2 group relative p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#ff4f00]/20 via-neutral-900/90 to-neutral-950 border border-neutral-800 hover:border-[#ff4f00]/60 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden cursor-pointer"
          >
            <div className="space-y-3 relative z-10 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#ff4f00] text-white shadow border border-white/20 flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-white" />
                  <span>🔥 BEST-SELLER 3D</span>
                </span>
                <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-full">
                  1 à 9 Touches
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#ff4f00] transition-colors leading-tight">
                  ⌨️ Créateur de Clicker 3D Sur-Mesure
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-snug mt-1 max-w-md">
                  Personnalise chaque touche (Lettre, Mot, Symbole SVG) &amp; tes filaments PLA en direct sur l'aperçu 3D !
                </p>
              </div>

              <div className="pt-1 flex items-center gap-3">
                <span className="text-xs font-black text-white bg-black/60 px-3 py-1 rounded-xl border border-white/10">
                  À partir de 3.00€
                </span>
                <span className="text-xs text-[#ff4f00] font-bold group-hover:underline flex items-center gap-1">
                  <span>Créer mon Clicker</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black/60 border border-white/20 shrink-0 flex flex-col items-center justify-center p-3 relative z-10 shadow-2xl group-hover:scale-105 transition-transform">
              <span className="text-3xl sm:text-4xl">⌨️</span>
              <span className="text-[9px] font-mono font-bold text-neutral-400 mt-1 uppercase">3D Custom</span>
            </div>
          </motion.a>

          {/* 3. POCHETTE SURPRISE (SPAN 1) */}
          <motion.a
            href="https://www.spoolio.fr/pochette-surprise"
            onClick={() => handleLinkClick("link-pochette")}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-600/25 via-neutral-900/90 to-neutral-950 border border-purple-500/50 hover:border-purple-400 backdrop-blur-2xl shadow-xl flex flex-col justify-between gap-4 overflow-hidden cursor-pointer"
          >
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center text-xl shadow-inner">
                  🎁
                </span>
                <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500 text-white border border-purple-400 uppercase tracking-wider">
                  ✨ NOUVEAU
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-purple-300 transition-colors">
                  Pochette Surprise Spoolio
                </h3>
                <p className="text-xs text-neutral-300 font-medium leading-snug mt-1">
                  Déballe 3, 6 ou 10 objets 3D et fidgets mystères !
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10">
              <span className="text-xs font-mono font-bold text-purple-300">À partir de 10.00€</span>
              <ArrowUpRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.a>

          {/* 4. TOMBOLA & JEU CONCOURS (SPAN 1) */}
          <motion.a
            href="https://www.spoolio.fr/tombola"
            onClick={() => handleLinkClick("link-tombola")}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-neutral-900/90 to-neutral-950 border border-amber-500/50 hover:border-amber-400 backdrop-blur-2xl shadow-xl flex flex-col justify-between gap-4 overflow-hidden cursor-pointer"
          >
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-xl shadow-inner">
                  🎟️
                </span>
                <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-black uppercase tracking-wider">
                  ⚡ JEU CONCOURS
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                  Grand Jeu Tombola
                </h3>
                <p className="text-xs text-neutral-300 font-medium leading-snug mt-1">
                  Tente de gagner le Mega Pack Fidget 3D (Val. 85€) !
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10">
              <span className="text-xs font-mono font-bold text-amber-300">Ticket à 2.00€</span>
              <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.a>

          {/* 5. APPLI ENJEU (SPAN 2 - SECONDAIRE COMPACT) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="sm:col-span-2 w-full"
          >
            <EnjeuBanner variant="link-hub" className="w-full text-left" />
          </motion.div>

          {/* 6. BOUSSOLE SENSORIELLE TDAH (SPAN 1) */}
          <motion.a
            href="https://www.spoolio.fr/boussole-sensorielle"
            onClick={() => handleLinkClick("link-boussole")}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative p-5 rounded-3xl bg-neutral-900/60 hover:bg-neutral-900/90 border border-neutral-800 hover:border-neutral-600 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-3 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center text-lg">
                  🧭
                </span>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/15">
                  🧠 GUIDAGE TDAH
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Boussole Sensorielle
                </h4>
                <p className="text-xs text-neutral-400 leading-tight mt-0.5">
                  Trouve l'objet adapté à ton profil sensoriel.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-cyan-400 font-bold">
              <span>Faire le test</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </motion.a>

          {/* 7. AVIS CLIENTS (SPAN 1) */}
          <motion.a
            href="https://www.spoolio.fr/#avis"
            onClick={() => handleLinkClick("link-reviews")}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative p-5 rounded-3xl bg-neutral-900/60 hover:bg-neutral-900/90 border border-neutral-800 hover:border-neutral-600 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-3 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-lg">
                  ⭐
                </span>
                <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  4.9 / 5.0
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Avis Clients Certifiés
                </h4>
                <p className="text-xs text-neutral-400 leading-tight mt-0.5">
                  99% de clients ravis par la qualité Spoolio.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-amber-400 font-bold">
              <span>Lire les témoignages</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </motion.a>

        </div>


          {/* SOCIAL LINKS PILLS BAR WITH OFFICIAL BRAND COLORS & LOGOS */}
        {profile.socials && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-6 w-full border-t border-neutral-800/80 flex items-center justify-center gap-2.5 sm:gap-3.5 flex-wrap"
          >
            {profile.socials.tiktok && (
              <a
                href={profile.socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-black border border-[#25F4EE]/50 hover:border-[#25F4EE] text-white flex items-center gap-2.5 shadow-lg shadow-[#25F4EE]/10 hover:shadow-[#25F4EE]/30 transition-all hover:scale-105"
                title="TikTok Spoolio"
              >
                <div className="w-7 h-7 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-[#25F4EE] shrink-0">
                  <TikTokIcon className="w-4 h-4 fill-[#25F4EE]" />
                </div>
                <span className="text-xs font-black tracking-wide text-white">TikTok</span>
              </a>
            )}

            {profile.socials.instagram && (
              <a
                href={profile.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center gap-2.5 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 border border-white/20 transition-all hover:scale-105"
                title="Instagram Spoolio"
              >
                <div className="w-7 h-7 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                  <InstagramIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-black tracking-wide text-white">Instagram</span>
              </a>
            )}

            {profile.socials.facebook && (
              <a
                href={profile.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-[#1877F2] text-white flex items-center gap-2.5 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 border border-white/20 transition-all hover:scale-105"
                title="Facebook Spoolio"
              >
                <div className="w-7 h-7 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                  <FacebookIcon className="w-4 h-4 fill-white" />
                </div>
                <span className="text-xs font-black tracking-wide text-white">Facebook</span>
              </a>
            )}

            {profile.socials.youtube && (
              <a
                href={profile.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-[#FF0000] text-white flex items-center gap-2.5 shadow-lg shadow-red-600/20 hover:shadow-red-600/40 border border-white/20 transition-all hover:scale-105"
                title="YouTube Spoolio"
              >
                <div className="w-7 h-7 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                  <YouTubeIcon className="w-4 h-4 fill-white" />
                </div>
                <span className="text-xs font-black tracking-wide text-white">YouTube</span>
              </a>
            )}

            {profile.socials.email && (
              <a
                href={`mailto:${profile.socials.email}`}
                className="group relative px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#ff4f00] to-[#e04500] text-white flex items-center gap-2.5 shadow-lg shadow-[#ff4f00]/20 hover:shadow-[#ff4f00]/40 border border-white/20 transition-all hover:scale-105"
                title="Email Spoolio"
              >
                <div className="w-7 h-7 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-black tracking-wide text-white">Email</span>
              </a>
            )}
          </motion.div>
        )}

        {/* BRANDING FOOTER */}
        <div className="text-center pt-2 space-y-1">
          <Link
            href="https://www.spoolio.fr"
            className="text-xs font-bold text-neutral-400 hover:text-white font-sans transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Spoolio.fr</span>
            <span className="w-1 h-1 rounded-full bg-[#ff4f00]" />
            <span>Objets 3D &amp; Fidgets TDAH</span>
          </Link>
          <p className="text-[10px] text-neutral-600 font-mono">
            Conçu &amp; imprimé en France avec du PLA écoresponsable 🇫🇷
          </p>
        </div>

      </div>

    </div>
  );
}
