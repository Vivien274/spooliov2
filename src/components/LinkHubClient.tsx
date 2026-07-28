"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ExternalLink, Sparkles, Flame, ShieldCheck, Mail, ArrowUpRight } from "lucide-react";

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
  title: "Spoolio 🌀",
  subtitle: "Impression 3D & Objets Fidgets Sensoriels TDAH 🇫🇷",
  avatar: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
  verifiedBadge: true,
  socials: {
    tiktok: "https://www.tiktok.com/@spoolio_3d",
    instagram: "https://www.instagram.com/spoolio.fr",
    email: "contact@spoolio.fr"
  }
};

export default function LinkHubClient({ initialProfile, initialLinks, isPreview = false }: LinkHubClientProps) {
  const [profile, setProfile] = useState<HubProfile>(initialProfile || DEFAULT_PROFILE);
  const [links, setLinks] = useState<LinkItem[]>(initialLinks || []);
  const [loading, setLoading] = useState<boolean>(!initialLinks);

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

  const handleLinkClick = (link: LinkItem) => {
    if (isPreview) return;
    try {
      fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "click", linkId: link.id }),
      });
    } catch (e) {}
  };

  return (
    <div className="w-full min-h-screen bg-[#0d0d10] text-white flex flex-col items-center justify-between p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#ff4f00]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Container Box */}
      <div className="w-full max-w-md mx-auto space-y-6 pt-6 pb-12 z-10">

        {/* PROFILE HEADER */}
        <div className="flex flex-col items-center text-center space-y-3">
          
          {/* Avatar with Animated Neon Border */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#ff4f00] via-purple-500 to-cyan-400 blur-md opacity-75 group-hover:opacity-100 transition duration-500 animate-tilt" />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl bg-neutral-900">
              <Image
                src={profile.avatar || "/images/imported/Spoolio_Kit-Festival-16-scaled.webp"}
                alt={profile.title || "Spoolio Links"}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Title & Badge */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {profile.title || "Spoolio 🌀"}
              </h1>
              {profile.verifiedBadge !== false && (
                <ShieldCheck className="w-5 h-5 text-[#ff4f00] fill-[#ff4f00]/20" />
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xs font-medium leading-snug">
              {profile.subtitle}
            </p>
          </div>

        </div>


        {/* LINKS LIST */}
        <div className="space-y-3.5 pt-2">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full h-16 rounded-2xl bg-neutral-900/60 animate-pulse border border-neutral-800" />
              ))}
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs font-mono">
              Aucun lien disponible pour le moment.
            </div>
          ) : (
            links.map((link) => {
              const isGlow = link.style === "glow";
              const isPulse = link.style === "pulse";
              const isHighlight = link.style === "highlight";

              return (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.url.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(link)}
                  className={`group relative w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 shadow-lg cursor-pointer ${
                    isGlow
                      ? "bg-gradient-to-r from-[#ff4f00]/20 via-neutral-900 to-black border-[#ff4f00]/60 hover:border-[#ff4f00] hover:scale-[1.02] shadow-[#ff4f00]/15"
                      : isPulse
                      ? "bg-neutral-900/90 border-purple-500/50 hover:border-purple-400 hover:scale-[1.02] animate-pulse"
                      : isHighlight
                      ? "bg-neutral-900/90 border-amber-500/50 hover:border-amber-400 hover:scale-[1.02]"
                      : "bg-neutral-900/70 hover:bg-neutral-800/90 border-neutral-800 hover:border-neutral-700 hover:scale-[1.01]"
                  }`}
                >
                  {/* Left Icon & Text Container */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    
                    {/* Icon Circle */}
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                      {link.icon || "🔗"}
                    </div>

                    {/* Titles */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#ff4f00] transition-colors truncate">
                          {link.title}
                        </span>
                      </div>
                      {link.subtitle && (
                        <p className="text-[11px] text-neutral-400 font-medium truncate leading-tight mt-0.5">
                          {link.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Badge & Arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    {link.badge && (
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        isGlow
                          ? "bg-[#ff4f00] text-white border-[#ff4f00] shadow-sm"
                          : isPulse
                          ? "bg-purple-500 text-white border-purple-400"
                          : "bg-white/10 text-neutral-300 border-white/20"
                      }`}>
                        {link.badge}
                      </span>
                    )}

                    <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </a>
              );
            })
          )}
        </div>


        {/* SOCIAL LINKS BAR */}
        {profile.socials && (
          <div className="pt-6 border-t border-neutral-800/80 flex items-center justify-center gap-3">
            {profile.socials.tiktok && (
              <a
                href={profile.socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 hover:border-white/30 text-neutral-300 hover:text-white flex items-center justify-center text-xs font-mono font-bold transition-all hover:scale-110"
                title="TikTok Spoolio"
              >
                🎵
              </a>
            )}

            {profile.socials.instagram && (
              <a
                href={profile.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 hover:border-white/30 text-neutral-300 hover:text-white flex items-center justify-center text-xs font-mono font-bold transition-all hover:scale-110"
                title="Instagram Spoolio"
              >
                📸
              </a>
            )}

            {profile.socials.youtube && (
              <a
                href={profile.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 hover:border-white/30 text-neutral-300 hover:text-white flex items-center justify-center text-xs font-mono font-bold transition-all hover:scale-110"
                title="YouTube Spoolio"
              >
                ▶️
              </a>
            )}

            {profile.socials.email && (
              <a
                href={`mailto:${profile.socials.email}`}
                className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 hover:border-white/30 text-neutral-300 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                title="Email Spoolio"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* BRANDING FOOTER */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-[11px] text-neutral-400 hover:text-white font-mono transition-colors"
          >
            Spoolio.fr 🇫🇷 — Objets 3D &amp; Fidgets Sensoriels
          </Link>
        </div>

      </div>

    </div>
  );
}
