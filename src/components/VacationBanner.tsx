"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Palmtree, X, ArrowRight, Sparkles } from "lucide-react";
import { AnnouncementBannerConfig, DEFAULT_BANNER_CONFIG } from "@/app/api/announcement-banner/route";

export default function VacationBanner() {
  const [config, setConfig] = useState<AnnouncementBannerConfig>(DEFAULT_BANNER_CONFIG);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local dismissal status first
    try {
      const isDismissed = sessionStorage.getItem("spoolio_vacation_banner_dismissed");
      if (isDismissed === "true") {
        setIsVisible(false);
      }
    } catch (e) {}

    // Fetch dynamic banner configuration from server
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/announcement-banner");
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setConfig(data.config);
          }
        }
      } catch (e) {
        console.warn("Could not fetch banner config, using defaults:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem("spoolio_vacation_banner_dismissed", "true");
    } catch (e) {}
  };

  if (!isVisible || !config.enabled) return null;

  const gradientClass = config.bgGradient || "from-[#12131c] via-[#1c1e2d] to-[#12131c]";

  return (
    <div className={`w-full bg-gradient-to-r ${gradientClass} text-white py-1 sm:py-1.5 px-3 sm:px-6 relative z-50 border-b border-white/10 shadow-sm flex items-center justify-between gap-2 text-[11px] sm:text-xs font-medium transition-all duration-300`}>
      <div className="mx-auto flex items-center justify-center gap-2 sm:gap-3 text-center flex-1 min-w-0">
        {config.badgeText && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs">
            <Palmtree className="w-3 h-3 text-amber-200" />
            <span>{config.badgeText}</span>
          </span>
        )}

        <p className="truncate sm:whitespace-normal leading-tight font-sans tracking-wide">
          {config.message}
        </p>

        {config.buttonText && config.buttonLink && (
          <Link
            href={config.buttonLink}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-gray-900 font-bold text-[10px] sm:text-xs hover:bg-amber-100 transition-all transform hover:scale-105 shadow-xs shrink-0 ml-1"
          >
            <span>{config.buttonText}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {config.dismissible && (
        <button
          onClick={handleDismiss}
          className="p-0.5 sm:p-1 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white shrink-0 cursor-pointer"
          title="Masquer l'information"
          aria-label="Fermer le bandeau d'information"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
