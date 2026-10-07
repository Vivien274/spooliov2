"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Calendar,
  MapPin,
  ShoppingBag,
  Keyboard,
  Gift,
  Dices,
  Ticket,
  Compass,
  Star,
  Mail,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  Sparkles,
  Link2,
  ExternalLink,
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
  instagramPhotos?: string[];
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
  title: "Spoolio",
  subtitle: "Atelier d'impression 3D & Fidgets sensoriels façonnés en France",
  avatar: "/images/spoolio-avatar.png",
  verifiedBadge: true,
  instagramPhotos: [
    "/images/clicker_gallery_0.jpg",
    "/images/marcel_octopus.jpg",
    "/images/alien_capsule.jpg",
  ],
  socials: {
    tiktok: "https://www.tiktok.com/@spoolio.fr",
    instagram: "https://www.instagram.com/spoolio.fr",
    facebook: "https://www.facebook.com/spoolio.fr",
    email: "contact@spoolio.fr",
  },
};

// Nettoyage systématique des emojis pour préserver la DA épurée
function cleanEmoji(text?: string): string {
  if (!text) return "";
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, "")
    .trim();
}

// Mapper d'icônes Lucide pour chaque lien
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

// Icônes officielles des réseaux
function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.82V7.59a6.34 6.34 0 0 0-5.71 6.31 6.33 6.33 0 0 0 11.39 3.86 6.33 6.33 0 0 0 .66-2.73V8.8a8.28 8.28 0 0 0 4.77 1.51V6.86a4.82 4.82 0 0 1-1.04-.17z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

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

  const isBoutiqueHero = (link: LinkItem) => {
    return link.id === "link-boutique" || link.url.includes("/boutique");
  };

  const instaPhotos =
    profile.instagramPhotos && profile.instagramPhotos.length >= 3
      ? profile.instagramPhotos.slice(0, 3)
      : [
          "/images/clicker_gallery_0.jpg",
          "/images/marcel_octopus.jpg",
          "/images/alien_capsule.jpg",
        ];

  const isClickerHero = (link: LinkItem) => {
    return link.id === "link-clicker";
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-neutral-900 flex flex-col items-center justify-between p-4 sm:p-6 font-sans relative overflow-x-hidden selection:bg-[#FF5500] selection:text-white antialiased">
      
      {/* 1. Trame d'atelier technique discrète en thème clair */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* 2. Halo ambré Spoolio très subtil en arrière-plan */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[680px] h-[340px] bg-[#FF5500]/[0.035] rounded-full blur-[140px] pointer-events-none" />

      {/* 3. CONTENEUR PRINCIPAL */}
      <main className="w-full max-w-xl mx-auto space-y-6 pt-3 pb-12 z-10 flex flex-col items-center">
        
        {/* Bandeau d'en-tête discret avec retour vers le site principal */}
        {/* Barre technique supérieure */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-neutral-200/90 text-[11px] font-mono text-neutral-500">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-neutral-950 font-medium transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FF5500] group-hover:-translate-x-0.5 transition-transform" />
            <span>spoolio.fr</span>
          </Link>
        </div>

        {/* =========================================================================
            HEADER DE PROFIL ATELIER (THÈME CLAIR SPOOLIO V2)
           ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-2 pb-2 text-center sm:text-left"
        >
          {/* Avatar / Logo Spoolio dans un boîtier technique blanc atelier */}
          <div className="relative shrink-0 group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-neutral-200/90 p-2 shadow-md flex items-center justify-center relative overflow-hidden">
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-neutral-50 flex items-center justify-center">
                <Image
                  src={profile.avatar || "/images/spoolio-avatar.png"}
                  alt={cleanEmoji(profile.title) || "Spoolio"}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 bg-[#FF5500] text-white text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm border border-white/40 whitespace-nowrap flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" />
              <span>COMINES (59)</span>
            </div>
          </div>

          {/* Textes d'identité */}
          <div className="space-y-2 flex-1">
            {/* Surtitre technique d'atelier avec liseré orange Spoolio */}
            <div className="inline-flex items-center gap-2 border-l-2 border-[#FF5500] pl-2.5 py-0.5">
              <span className="font-mono text-[10px] tracking-[0.22em] text-[#FF5500] uppercase font-bold">
                Cabinet de Curiosités &amp; Atelier 3D
              </span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 font-be-vietnam">
                {cleanEmoji(profile.title) || "Spoolio"}
              </h1>
              {profile.verifiedBadge !== false && (
                <span title="Compte officiel vérifié" className="inline-flex">
                  <ShieldCheck className="w-5 h-5 text-[#FF5500]" />
                </span>
              )}
            </div>

            {/* Badges de réassurance atelier */}
            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-neutral-700 bg-white border border-neutral-200/90 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
                <Leaf className="w-3 h-3 text-emerald-600" />
                <span>100% Matière végétale (PLA)</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-700 bg-white border border-neutral-200/90 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3 h-3 text-amber-600" />
                <span>Fabriqué en France</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            AGENDA D'ATELIER & MARCHÉS (SI PRÉSENT)
           ========================================================================= */}
        {publishedEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="w-full space-y-2.5 pt-1"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Rencontres &amp; Marchés</span>
              </span>
            </div>

            <div className="space-y-2.5">
              {publishedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="group relative p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-300 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/25">
                        {cleanEmoji(ev.date)}
                      </span>
                      {ev.badge && (
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {cleanEmoji(ev.badge)}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-neutral-950 font-be-vietnam group-hover:text-[#FF5500] transition-colors leading-snug">
                        {cleanEmoji(ev.title)}
                      </h3>
                      <p className="text-xs font-medium text-neutral-600 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                        <span>{cleanEmoji(ev.location)}</span>
                      </p>
                    </div>

                    {ev.description && (
                      <p className="text-xs text-neutral-500 leading-relaxed max-w-md pt-0.5">
                        {cleanEmoji(ev.description)}
                      </p>
                    )}
                  </div>

                  {ev.linkUrl && (
                    <a
                      href={ev.linkUrl}
                      target={ev.linkUrl.startsWith("http") ? "_blank" : undefined}
                      rel={ev.linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-800 bg-neutral-100 hover:bg-[#FF5500] hover:text-white px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95 shrink-0"
                    >
                      <span>{cleanEmoji(ev.linkLabel) || "Voir les infos"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            GRILLE BENTO DES LIENS (THÈME CLAIR ATELIER)
           ========================================================================= */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {publishedLinks.map((link, idx) => {
            const titleClean = cleanEmoji(link.title);
            const subtitleClean = cleanEmoji(link.subtitle);
            const isHeroBoutique = isBoutiqueHero(link);
            const isHeroClicker = isClickerHero(link);

            // 1. CARTE HERO : LA BOUTIQUE OFFICIELLE SPOOLIO (Pleine largeur avec liseré orange Spoolio)
            if (isHeroBoutique) {
              return (
                <React.Fragment key={link.id}>
                  <motion.a
                    href={link.url}
                    onClick={() => handleLinkClick(link.id)}
                    target={link.url.startsWith("http") && !link.url.includes("spoolio.fr") ? "_blank" : undefined}
                    rel={link.url.startsWith("http") && !link.url.includes("spoolio.fr") ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.04 * (idx + 1) }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    className="sm:col-span-2 group relative p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/90 hover:border-[#FF5500]/60 transition-all duration-200 shadow-[0_4px_18px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(255,85,0,0.12)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer border-l-4 border-l-[#FF5500]"
                  >
                    <div className="flex items-start sm:items-center gap-4 relative z-10 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-[#FF5500] text-white flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(255,85,0,0.25)]">
                        <ShoppingBag className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/25">
                            {cleanEmoji(link.badge) || "CATALOGUE OFFICIEL"}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500">
                            Expédition 24/48h
                          </span>
                        </div>

                        <h2 className="text-lg sm:text-xl font-bold text-neutral-950 font-be-vietnam group-hover:text-[#FF5500] transition-colors">
                          {titleClean}
                        </h2>
                        {subtitleClean && (
                          <p className="text-xs text-neutral-600 font-sans leading-snug">
                            {subtitleClean}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider bg-neutral-950 text-white px-4 py-2.5 rounded-xl group-hover:bg-[#FF5500] transition-all shadow-sm">
                        <span>Explorer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.a>

                  {/* 2. BLOC INSTAGRAM HIGHLIGHT (Placé juste après l'encart boutique) */}
                  <motion.div
                    key="instagram-highlight-feed"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.04 * (idx + 1.5) }}
                    className="sm:col-span-2 group relative p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-300 transition-all duration-200 shadow-[0_3px_14px_rgba(0,0,0,0.03)] hover:shadow-md space-y-4"
                  >
                    {/* En-tête Instagram avec profil et lien direct */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <InstagramIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-gradient-to-r from-pink-500/10 to-orange-500/10 text-pink-700 border border-pink-200/60">
                              Instagram @spoolio.fr
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              En direct de l&apos;atelier
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-neutral-950 font-be-vietnam leading-tight mt-0.5">
                            Les coulisses &amp; nouveautés
                          </h3>
                        </div>
                      </div>

                      <a
                        href={profile.socials?.instagram || "https://www.instagram.com/spoolio.fr"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-neutral-950 hover:bg-[#FF5500] text-white transition-all shadow-sm group/btn shrink-0"
                      >
                        <span>Voir mon compte</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </a>
                    </div>

                    {/* Grille des 3 photos de publications récentes */}
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                      {instaPhotos.map((photo, pIdx) => (
                        <a
                          key={pIdx}
                          href={profile.socials?.instagram || "https://www.instagram.com/spoolio.fr"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/photo relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/80 shadow-xs block"
                          title="Voir sur Instagram @spoolio.fr"
                        >
                          <Image
                            src={photo}
                            alt={`Publication Instagram Spoolio ${pIdx + 1}`}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-500 group-hover/photo:scale-108"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-end justify-between p-2">
                            <InstagramIcon className="w-4 h-4 text-white drop-shadow" />
                            <ExternalLink className="w-3 h-3 text-white/90 drop-shadow" />
                          </div>
                        </a>
                      ))}
                    </div>

                    {/* Pied de carte informatif */}
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[11px] font-mono text-neutral-500">
                      <span>📸 Vidéos, impressions &amp; réels</span>
                      <a
                        href={profile.socials?.instagram || "https://www.instagram.com/spoolio.fr"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FF5500] hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <span>Suivre @spoolio.fr</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            }

            // 2. CARTE VEDETTE : CRÉATEUR DE CLICKER 3D SUR-MESURE (Pleine largeur)
            if (isHeroClicker) {
              return (
                <motion.a
                  key={link.id}
                  href={link.url}
                  onClick={() => handleLinkClick(link.id)}
                  target={link.url.startsWith("http") && !link.url.includes("spoolio.fr") ? "_blank" : undefined}
                  rel={link.url.startsWith("http") && !link.url.includes("spoolio.fr") ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.04 * (idx + 1) }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  className="sm:col-span-2 group relative p-5 sm:p-6 rounded-2xl bg-white hover:bg-neutral-50/60 border border-neutral-200/90 hover:border-neutral-300 transition-all duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start sm:items-center gap-4 relative z-10 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 text-[#FF5500] flex items-center justify-center shrink-0 shadow-inner group-hover:border-[#FF5500]/40 transition-colors">
                      <Keyboard className="w-6 h-6" strokeWidth={1.8} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/25">
                          {cleanEmoji(link.badge) || "CONFIGURATEUR 3D"}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          1 à 9 touches mécaniques
                        </span>
                      </div>

                      <h2 className="text-base sm:text-lg font-bold text-neutral-950 font-be-vietnam group-hover:text-[#FF5500] transition-colors">
                        {titleClean}
                      </h2>
                      {subtitleClean && (
                        <p className="text-xs text-neutral-600 font-sans leading-snug">
                          {subtitleClean}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-mono font-bold text-neutral-700 bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-lg">
                      Dès 3.00€
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-[#FF5500] group-hover:translate-x-1 transition-transform">
                      <span>Personnaliser</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.a>
              );
            }

            // 3. CARTES BENTO STANDARD (Pochette surprise, Boussole, Tombola, Avis...)
            return (
              <motion.a
                key={link.id}
                href={link.url}
                onClick={() => handleLinkClick(link.id)}
                target={link.url.startsWith("http") && !link.url.includes("spoolio.fr") ? "_blank" : undefined}
                rel={link.url.startsWith("http") && !link.url.includes("spoolio.fr") ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.04 * (idx + 1) }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                className="group relative p-4 sm:p-5 rounded-2xl bg-white hover:bg-neutral-50/60 border border-neutral-200/90 hover:border-neutral-300 transition-all duration-200 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md flex flex-col justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100/90 border border-neutral-200/90 text-neutral-700 group-hover:text-[#FF5500] group-hover:border-[#FF5500]/40 transition-colors flex items-center justify-center shadow-xs">
                      {renderLinkIcon(link.icon, link.id, "w-5 h-5")}
                    </div>

                    {link.badge && (
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {cleanEmoji(link.badge)}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-neutral-950 font-be-vietnam group-hover:text-[#FF5500] transition-colors leading-snug">
                      {titleClean}
                    </h3>
                    {subtitleClean && (
                      <p className="text-xs text-neutral-600 font-sans leading-snug mt-1">
                        {subtitleClean}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 relative z-10">
                  <span className="text-[11px] font-mono text-neutral-500 group-hover:text-neutral-950 font-medium transition-colors">
                    Accéder
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#FF5500] group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* =========================================================================
            RÉSEAUX SOCIAUX OFFICIELS (PILLS CLAIRES ATELIER)
           ========================================================================= */}
        {profile.socials && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="pt-6 w-full border-t border-neutral-200/90 flex flex-col items-center gap-3"
          >
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-500 font-semibold">
              Réseaux officiels de l'atelier
            </span>

            <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
              {profile.socials.tiktok && (
                <a
                  href={profile.socials.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 flex items-center gap-2 transition-all hover:scale-105 shadow-xs"
                  title="TikTok Spoolio"
                >
                  <TikTokIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono font-medium">TikTok</span>
                </a>
              )}

              {profile.socials.instagram && (
                <a
                  href={profile.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 flex items-center gap-2 transition-all hover:scale-105 shadow-xs"
                  title="Instagram Spoolio"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono font-medium">Instagram</span>
                </a>
              )}

              {profile.socials.facebook && (
                <a
                  href={profile.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 flex items-center gap-2 transition-all hover:scale-105 shadow-xs"
                  title="Facebook Spoolio"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono font-medium">Facebook</span>
                </a>
              )}

              {profile.socials.youtube && (
                <a
                  href={profile.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 flex items-center gap-2 transition-all hover:scale-105 shadow-xs"
                  title="YouTube Spoolio"
                >
                  <YouTubeIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono font-medium">YouTube</span>
                </a>
              )}

              {profile.socials.email && (
                <a
                  href={`mailto:${profile.socials.email}`}
                  className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 flex items-center gap-2 transition-all hover:scale-105 shadow-xs"
                  title="Email Spoolio"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono font-medium">Email</span>
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            FOOTER ATELIER
           ========================================================================= */}
        <div className="text-center pt-3 space-y-1.5 border-t border-neutral-200/90 w-full">
          <Link
            href="/"
            className="text-xs font-mono font-bold text-neutral-600 hover:text-neutral-950 transition-colors inline-flex items-center justify-center gap-2"
          >
            <span>Spoolio.fr</span>
            <span className="w-1 h-1 rounded-full bg-[#FF5500]" />
            <span>Atelier d'impression 3D &amp; Objets sensoriels</span>
          </Link>
          <p className="text-[11px] text-neutral-500 font-mono flex items-center justify-center gap-1.5">
            <Leaf className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Comines (59) • 100% Polymère végétal biosourcé • Zéro surstock</span>
          </p>
        </div>

      </main>
    </div>
  );
}
