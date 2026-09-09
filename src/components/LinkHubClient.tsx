"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ArrowUpRight,
  Flame,
  Calendar,
  MapPin,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Ticket,
  Compass,
  Star,
  Mail,
  Keyboard,
  Gift,
  Dices,
  Link2,
  Store,
  Layers,
  CheckCircle2,
  Leaf,
  Zap,
  Tag,
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

export interface HubEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  linkUrl?: string;
  linkLabel?: string;
  badge?: string;
  isPublished: boolean;
  order: number;
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
  initialEvents?: HubEvent[];
  isPreview?: boolean;
}

const DEFAULT_PROFILE: HubProfile = {
  title: "Spoolio.fr",
  subtitle: "Impression 3D & Objets Fidgets Sensoriels TDAH",
  avatar: "https://ugc.production.linktr.ee/fdb01a4c-7a6f-4109-92fc-331e44f5bb26_Frame-294.png",
  verifiedBadge: true,
  socials: {
    tiktok: "https://www.tiktok.com/@spoolio.fr",
    instagram: "https://www.instagram.com/spoolio.fr",
    facebook: "https://www.facebook.com/spoolio.fr",
    email: "contact@spoolio.fr",
  },
};

// Fonction pour retirer tout emoji d'un texte
function cleanEmoji(text?: string): string {
  if (!text) return "";
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, "")
    .trim();
}

// Mapper universel vers des icônes vectorielles Lucide
function renderLinkIcon(iconString?: string, linkId?: string, className = "w-5 h-5") {
  const str = (iconString || "").toLowerCase().trim();
  const id = linkId || "";

  if (str === "shopping-bag" || str.includes("boutique") || str.includes("cart") || id === "link-boutique") {
    return <ShoppingBag className={className} />;
  }
  if (str === "keyboard" || str.includes("clicker") || str.includes("clavier") || id === "link-clicker") {
    return <Keyboard className={className} />;
  }
  if (str === "gift" || str.includes("pochette") || str.includes("cadeau") || id === "link-pochette") {
    return <Gift className={className} />;
  }
  if (str === "dices" || str.includes("loterie") || str.includes("roue") || id === "link-loterie") {
    return <Dices className={className} />;
  }
  if (str === "ticket" || str.includes("tombola") || id === "link-tombola") {
    return <Ticket className={className} />;
  }
  if (str === "compass" || str.includes("boussole") || id === "link-boussole") {
    return <Compass className={className} />;
  }
  if (str === "star" || str.includes("avis") || str.includes("review") || id === "link-reviews") {
    return <Star className={className} />;
  }

  return <Link2 className={className} />;
}

// Mapper pour afficher le badge avec son icône Lucide associée
function renderBadge(badgeText?: string) {
  if (!badgeText) return null;
  const clean = cleanEmoji(badgeText);
  const lower = badgeText.toLowerCase();

  let Icon = Sparkles;
  if (lower.includes("best") || lower.includes("seller") || badgeText.includes("🔥")) {
    Icon = Flame;
  } else if (lower.includes("concours") || badgeText.includes("⚡")) {
    Icon = Zap;
  } else if (lower.includes("kdo") || lower.includes("gratuit") || badgeText.includes("🎁")) {
    Icon = Gift;
  } else if (lower.includes("stand") || badgeText.includes("🎪")) {
    Icon = Store;
  } else if (lower.includes("guidage") || badgeText.includes("🧠")) {
    Icon = Compass;
  } else if (lower.includes("accès") || lower.includes("direct") || badgeText.includes("🛍️")) {
    Icon = ShoppingBag;
  } else if (lower.includes("%") || lower.includes("satisfait") || badgeText.includes("⭐")) {
    Icon = Star;
  }

  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="w-2.5 h-2.5 shrink-0" />
      <span>{clean || badgeText}</span>
    </span>
  );
}

// Official TikTok SVG Icon
function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.82V7.59a6.34 6.34 0 0 0-5.71 6.31 6.33 6.33 0 0 0 11.39 3.86 6.33 6.33 0 0 0 .66-2.73V8.8a8.28 8.28 0 0 0 4.77 1.51V6.86a4.82 4.82 0 0 1-1.04-.17z" />
    </svg>
  );
}

// Official Instagram SVG Icon
function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
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
function YouTubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function LinkHubClient({
  initialProfile,
  initialLinks,
  initialEvents,
  isPreview = false,
}: LinkHubClientProps) {
  const [profile, setProfile] = useState<HubProfile>(initialProfile || DEFAULT_PROFILE);
  const [links, setLinks] = useState<LinkItem[]>(initialLinks || []);
  const [events, setEvents] = useState<HubEvent[]>(initialEvents || []);

  useEffect(() => {
    if (initialProfile) setProfile(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    if (initialLinks) setLinks(initialLinks);
  }, [initialLinks]);

  useEffect(() => {
    if (initialEvents) setEvents(initialEvents);
  }, [initialEvents]);

  useEffect(() => {
    if (!initialLinks || !initialEvents) {
      fetch("/api/links")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.profile) setProfile(data.profile);
            if (data.links) setLinks(data.links);
            if (data.events) setEvents(data.events);
          }
        })
        .catch((e) => console.error("Error loading links:", e));
    }
  }, [initialLinks, initialEvents]);

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

  const publishedEvents = events.filter((ev) => ev.isPublished !== false);
  const publishedLinks = links.filter((l) => l.isPublished !== false);

  const isFeatured = (link: LinkItem, index: number) => {
    if (link.style === "glow" || link.style === "highlight") return true;
    if (link.id === "link-boutique" || link.id === "link-clicker") return true;
    if (index === 0) return true;
    return false;
  };

  const getCardTheme = (link: LinkItem) => {
    if (link.id === "link-boutique" || link.style === "highlight") {
      return {
        container: "bg-gradient-to-r from-[#ff4f00]/30 via-neutral-900/90 to-neutral-950 border-[#ff4f00]/60 hover:border-[#ff4f00] shadow-[0_15px_35px_rgba(255,79,0,0.18)]",
        iconBox: "bg-[#ff4f00] text-white border-white/20 shadow-lg",
        badge: "bg-[#ff4f00] text-white",
        accentText: "text-[#ff4f00]",
        btn: "bg-[#ff4f00] hover:bg-[#e04500] text-white",
      };
    }
    if (link.id === "link-clicker" || link.style === "glow") {
      return {
        container: "bg-gradient-to-br from-[#ff4f00]/20 via-neutral-900/90 to-neutral-950 border-neutral-800 hover:border-[#ff4f00]/70 shadow-[0_12px_30px_rgba(255,79,0,0.12)]",
        iconBox: "bg-[#ff4f00]/20 text-[#ff4f00] border-[#ff4f00]/30",
        badge: "bg-[#ff4f00] text-white",
        accentText: "text-[#ff4f00]",
        btn: "bg-white/10 hover:bg-white/20 text-white",
      };
    }
    if (link.id === "link-pochette" || link.style === "pulse") {
      return {
        container: "bg-gradient-to-br from-purple-600/25 via-neutral-900/90 to-neutral-950 border-purple-500/50 hover:border-purple-400 shadow-[0_10px_25px_rgba(168,85,247,0.15)]",
        iconBox: "bg-purple-500/20 text-purple-300 border-purple-400/40",
        badge: "bg-purple-500 text-white",
        accentText: "text-purple-400 group-hover:text-purple-300",
        btn: "bg-purple-500/20 text-purple-300",
      };
    }
    if (link.id === "link-loterie") {
      return {
        container: "bg-gradient-to-br from-pink-600/25 via-neutral-900/90 to-neutral-950 border-pink-500/50 hover:border-pink-400 shadow-[0_10px_25px_rgba(236,72,153,0.15)]",
        iconBox: "bg-pink-500/20 text-pink-300 border-pink-400/40",
        badge: "bg-pink-500 text-white",
        accentText: "text-pink-400 group-hover:text-pink-300",
        btn: "bg-pink-500/20 text-pink-300",
      };
    }
    if (link.id === "link-tombola") {
      return {
        container: "bg-gradient-to-br from-amber-500/25 via-neutral-900/90 to-neutral-950 border-amber-500/50 hover:border-amber-400 shadow-[0_10px_25px_rgba(245,158,11,0.15)]",
        iconBox: "bg-amber-500/20 text-amber-300 border-amber-400/40",
        badge: "bg-amber-500 text-black font-black",
        accentText: "text-amber-400 group-hover:text-amber-300",
        btn: "bg-amber-500/20 text-amber-300",
      };
    }
    if (link.id === "link-boussole") {
      return {
        container: "bg-neutral-900/70 hover:bg-neutral-900/95 border-neutral-800 hover:border-cyan-500/50 shadow-lg",
        iconBox: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
        badge: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
        accentText: "text-cyan-400 group-hover:text-cyan-300",
        btn: "bg-cyan-500/20 text-cyan-300",
      };
    }
    if (link.id === "link-reviews") {
      return {
        container: "bg-neutral-900/70 hover:bg-neutral-900/95 border-neutral-800 hover:border-amber-500/50 shadow-lg",
        iconBox: "bg-amber-500/20 text-amber-300 border-amber-400/40",
        badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        accentText: "text-amber-400 group-hover:text-amber-300",
        btn: "bg-amber-500/20 text-amber-300",
      };
    }

    return {
      container: "bg-neutral-900/70 hover:bg-neutral-900/95 border-neutral-800 hover:border-neutral-700 shadow-sm",
      iconBox: "bg-neutral-800 text-white border-white/10",
      badge: "bg-white/10 text-neutral-300",
      accentText: "text-[#ff4f00]",
      btn: "bg-white/10 text-neutral-300",
    };
  };

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-white flex flex-col items-center justify-between p-3.5 sm:p-6 font-sans relative overflow-hidden select-none">
      
      {/* Ambient Glows vibrants & sexy */}
      <div className="absolute top-[-140px] left-1/2 -translate-x-1/2 w-[650px] h-[500px] bg-gradient-to-br from-[#ff4f00]/25 via-purple-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-50px] w-[450px] h-[450px] bg-gradient-to-tl from-cyan-500/15 via-blue-600/10 to-transparent rounded-full blur-[130px] pointer-events-none" />

      {/* Grid Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* MAIN CONTAINER */}
      <main className="w-full max-w-xl mx-auto space-y-6 pt-6 pb-12 z-10 flex flex-col items-center">
        
        {/* =========================================================================
            HEADER DE PROFIL (PICTOS VECTORIELS PURS)
           ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left pt-2 pb-1"
        >
          {/* Avatar avec halo néon circulaire */}
          <div className="relative group shrink-0">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#ff4f00] via-purple-500 to-amber-500 blur-md opacity-75 group-hover:opacity-100 transition duration-700" />
            
            <div className="relative w-22 h-22 sm:w-26 sm:h-26 rounded-full overflow-hidden border-2 border-white/30 shadow-2xl bg-neutral-950 p-1">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src={profile.avatar || "https://ugc.production.linktr.ee/fdb01a4c-7a6f-4109-92fc-331e44f5bb26_Frame-294.png"}
                  alt={cleanEmoji(profile.title) || "Spoolio"}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 bg-[#ff4f00] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow border border-white/20 whitespace-nowrap flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" />
              <span>3D &amp; FIDGETS</span>
            </div>
          </div>

          {/* Textes du profil */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
                {cleanEmoji(profile.title) || "Spoolio.fr"}
              </h1>
              {profile.verifiedBadge !== false && (
                <span title="Compte officiel Spoolio" className="inline-flex">
                  <ShieldCheck className="w-5 h-5 text-[#ff4f00] fill-[#ff4f00]/20" />
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-snug">
              {cleanEmoji(profile.subtitle)}
            </p>

            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-neutral-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Atelier &amp; Objets Imprimés en France</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            SECTION ÉVÉNEMENTS & MARCHÉS (CARTE BENTO SANS EMOJI)
           ========================================================================= */}
        {publishedEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="w-full space-y-3 pt-1"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#ff4f00]" />
                <span>Marchés &amp; Événements à venir</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#ff4f00]" />
                <span>Où nous rencontrer</span>
              </span>
            </div>

            <div className="space-y-3">
              {publishedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="group relative p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-neutral-900/95 to-neutral-950 border border-amber-500/40 hover:border-amber-400/80 backdrop-blur-2xl shadow-[0_12px_35px_rgba(245,158,11,0.12)] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden"
                >
                  <div className="space-y-2 relative z-10 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ff4f00] text-white shadow flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{cleanEmoji(ev.date)}</span>
                      </span>
                      {ev.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Store className="w-3 h-3" />
                          <span>{cleanEmoji(ev.badge)}</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors leading-tight">
                        {cleanEmoji(ev.title)}
                      </h3>
                      <p className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#ff4f00] shrink-0" />
                        <span>{cleanEmoji(ev.location)}</span>
                      </p>
                    </div>

                    {ev.description && (
                      <p className="text-xs text-neutral-400 leading-relaxed max-w-md">
                        {cleanEmoji(ev.description)}
                      </p>
                    )}
                  </div>

                  {ev.linkUrl && (
                    <div className="shrink-0 relative z-10 pt-1 sm:pt-0">
                      <a
                        href={ev.linkUrl}
                        target={ev.linkUrl.startsWith("http") ? "_blank" : undefined}
                        rel={ev.linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1.5 text-xs font-black text-black bg-amber-400 hover:bg-amber-300 px-4 py-2.5 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <span>{cleanEmoji(ev.linkLabel) || "Voir les infos & lieu"}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            BENTO GRID DES LIENS (100% PICTOS LUCIDE)
           ========================================================================= */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {publishedLinks.map((link, idx) => {
            const span2 = isFeatured(link, idx);
            const theme = getCardTheme(link);
            const titleClean = cleanEmoji(link.title);
            const subtitleClean = cleanEmoji(link.subtitle);

            // SPECIAL LAYOUT : CLICKER 3D (AVEC PREVIEW 3D BOX ET PICTO KEYBOARD)
            if (link.id === "link-clicker") {
              return (
                <motion.a
                  key={link.id}
                  href={link.url}
                  onClick={() => handleLinkClick(link.id)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * (idx + 1) }}
                  whileHover={{ scale: 1.015, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="sm:col-span-2 group relative p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#ff4f00]/20 via-neutral-900/90 to-neutral-950 border border-neutral-800 hover:border-[#ff4f00]/60 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden cursor-pointer"
                >
                  <div className="space-y-3 relative z-10 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#ff4f00] text-white shadow border border-white/20">
                        {renderBadge(link.badge || "BEST-SELLER")}
                      </span>
                      <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>1 à 9 Touches</span>
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#ff4f00] transition-colors leading-tight">
                        {titleClean}
                      </h2>
                      {subtitleClean && (
                        <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-snug mt-1 max-w-md">
                          {subtitleClean}
                        </p>
                      )}
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
                    <Keyboard className="w-9 h-9 sm:w-10 sm:h-10 text-[#ff4f00]" strokeWidth={1.75} />
                    <span className="text-[9px] font-mono font-bold text-neutral-400 mt-1.5 uppercase">3D Custom</span>
                  </div>
                </motion.a>
              );
            }

            // SPECIAL LAYOUT : BOUTIQUE (SPAN 2 HERO)
            if (span2) {
              return (
                <motion.a
                  key={link.id}
                  href={link.url}
                  onClick={() => handleLinkClick(link.id)}
                  target={link.url.startsWith("http") && !link.url.includes("spoolio.fr") ? "_blank" : undefined}
                  rel={link.url.startsWith("http") && !link.url.includes("spoolio.fr") ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * (idx + 1) }}
                  whileHover={{ scale: 1.015, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className={`sm:col-span-2 group relative p-6 rounded-3xl border backdrop-blur-2xl flex items-center justify-between gap-4 overflow-hidden cursor-pointer ${theme.container}`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${theme.iconBox}`}>
                      {renderLinkIcon(link.icon, link.id, "w-6 h-6")}
                    </div>

                    <div>
                      {link.badge && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow ${theme.badge}`}>
                            {renderBadge(link.badge)}
                          </span>
                        </div>
                      )}
                      <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-[#ff4f00] transition-colors">
                        {titleClean}
                      </h3>
                      {subtitleClean && (
                        <p className="text-xs text-neutral-300 font-medium leading-tight mt-0.5">
                          {subtitleClean}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 relative z-10">
                    <span className="text-xs font-bold text-white bg-[#ff4f00] px-4 py-2 rounded-xl shadow-md group-hover:bg-[#e04500] transition-colors hidden sm:inline-block">
                      Découvrir
                    </span>
                    <ArrowUpRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.a>
              );
            }

            // STANDARD BENTO CARD (1 COLONNE AVEC PICTO LUCIDE)
            return (
              <motion.a
                key={link.id}
                href={link.url}
                onClick={() => handleLinkClick(link.id)}
                target={link.url.startsWith("http") && !link.url.includes("spoolio.fr") ? "_blank" : undefined}
                rel={link.url.startsWith("http") && !link.url.includes("spoolio.fr") ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * (idx + 1) }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative p-5 sm:p-6 rounded-3xl border backdrop-blur-2xl flex flex-col justify-between gap-4 overflow-hidden cursor-pointer ${theme.container}`}
              >
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner border ${theme.iconBox}`}>
                      {renderLinkIcon(link.icon, link.id, "w-5 h-5")}
                    </span>
                    {link.badge && (
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${theme.badge}`}>
                        {renderBadge(link.badge)}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-white transition-colors">
                      {titleClean}
                    </h3>
                    {subtitleClean && (
                      <p className="text-xs text-neutral-300 font-medium leading-snug mt-1">
                        {subtitleClean}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10">
                  <span className="text-xs font-mono font-bold text-neutral-400 group-hover:text-white transition-colors">
                    Accéder
                  </span>
                  <ArrowUpRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${theme.accentText}`} />
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* =========================================================================
            RÉSEAUX SOCIAUX OFFICIELS (PILLS GLASSMORPHISM COLORÉES)
           ========================================================================= */}
        {profile.socials && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-6 w-full border-t border-neutral-800/80 flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap"
          >
            {profile.socials.tiktok && (
              <a
                href={profile.socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-4 py-2.5 rounded-2xl bg-black border border-[#25F4EE]/50 hover:border-[#25F4EE] text-white flex items-center gap-2 shadow-lg shadow-[#25F4EE]/10 hover:shadow-[#25F4EE]/30 transition-all hover:scale-105"
                title="TikTok Spoolio"
              >
                <div className="w-6 h-6 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-[#25F4EE] shrink-0">
                  <TikTokIcon className="w-3.5 h-3.5 fill-[#25F4EE]" />
                </div>
                <span className="text-xs font-black tracking-wide text-white">TikTok</span>
              </a>
            )}

            {profile.socials.instagram && (
              <a
                href={profile.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center gap-2 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 border border-white/20 transition-all hover:scale-105"
                title="Instagram Spoolio"
              >
                <div className="w-6 h-6 rounded-lg bg-black/30 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                  <InstagramIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-black tracking-wide text-white">Instagram</span>
              </a>
            )}

            {profile.socials.facebook && (
              <a
                href={profile.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-4 py-2.5 rounded-2xl bg-[#1877F2] text-white flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 border border-white/20 transition-all hover:scale-105"
                title="Facebook Spoolio"
              >
                <div className="w-6 h-6 rounded-lg bg-black/30 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                  <FacebookIcon className="w-3.5 h-3.5 fill-white" />
                </div>
                <span className="text-xs font-black tracking-wide text-white">Facebook</span>
              </a>
            )}

            {profile.socials.youtube && (
              <a
                href={profile.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-4 py-2.5 rounded-2xl bg-[#FF0000] text-white flex items-center gap-2 shadow-lg shadow-red-600/20 hover:shadow-red-600/40 border border-white/20 transition-all hover:scale-105"
                title="YouTube Spoolio"
              >
                <div className="w-6 h-6 rounded-lg bg-black/30 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                  <YouTubeIcon className="w-3.5 h-3.5 fill-white" />
                </div>
                <span className="text-xs font-black tracking-wide text-white">YouTube</span>
              </a>
            )}

            {profile.socials.email && (
              <a
                href={`mailto:${profile.socials.email}`}
                className="group relative px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff4f00] to-[#e04500] text-white flex items-center gap-2 shadow-lg shadow-[#ff4f00]/20 hover:shadow-[#ff4f00]/40 border border-white/20 transition-all hover:scale-105"
                title="Email Spoolio"
              >
                <div className="w-6 h-6 rounded-lg bg-black/30 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                  <Mail className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-black tracking-wide text-white">Email</span>
              </a>
            )}
          </motion.div>
        )}

        {/* FOOTER */}
        <div className="text-center pt-2 space-y-1">
          <Link
            href="/"
            className="text-xs font-bold text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Spoolio.fr</span>
            <span className="w-1 h-1 rounded-full bg-[#ff4f00]" />
            <span>Atelier 3D &amp; Fidgets</span>
          </Link>
          <p className="text-[10px] text-neutral-500 font-mono flex items-center justify-center gap-1">
            <Leaf className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Conçu &amp; imprimé en France avec du PLA écoresponsable</span>
          </p>
        </div>

      </main>
    </div>
  );
}
