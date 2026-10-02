"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Calendar, Clock, Lock, ArrowRight, EyeOff } from "lucide-react";
import DropCountdown from "@/components/drops/DropCountdown";
import { Drop } from "@/lib/drops";

interface LatestDropBannerProps {
  drop?: Drop | null;
}

export default function LatestDropBanner({ drop }: LatestDropBannerProps) {
  const [mounted, setMounted] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!drop?.startDate) return;

    const checkLive = () => {
      const now = new Date().getTime();
      const target = new Date(drop.startDate).getTime();
      setIsLive(drop.status === "live" || now >= target);
    };

    checkLive();
    const interval = setInterval(checkLive, 1000);
    return () => clearInterval(interval);
  }, [drop]);

  if (!drop) return null;

  const dTheme = drop.theme;
  const dBg = dTheme?.bgColor || "linear-gradient(135deg, #180b2b 0%, #0d0617 100%)";
  const dText = dTheme?.textColor || "#ffffff";
  const dSubtitle = dTheme?.subtitleColor || "#d8b4fe";
  const dAccent = dTheme?.accentColor || drop.themeColor || "#ff5500";
  const dCardBg = dTheme?.cardBgColor || "rgba(255, 255, 255, 0.06)";
  const dBorder = dTheme?.borderColor || "rgba(216, 180, 254, 0.2)";
  const dTitleFont = dTheme?.titleFont || "var(--font-permanent-marker)";

  // Format date en français
  const formattedDate = (() => {
    try {
      const d = new Date(drop.startDate);
      const str = new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
      return str.charAt(0).toUpperCase() + str.slice(1);
    } catch {
      return drop.startDate;
    }
  })();

  return (
    <section className="w-full max-w-[1200px] px-4 my-8 sm:my-12 relative z-10 font-sans no-invert keep-white">
      <div
        className="relative rounded-3xl sm:rounded-[32px] border overflow-hidden shadow-2xl transition-all duration-300 no-invert keep-white"
        style={{
          background: dBg,
          borderColor: dBorder,
          color: "#ffffff",
        }}
      >
        {/* Glow atmosphérique en arrière-plan */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div
            className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[140px] opacity-25"
            style={{ backgroundColor: dAccent }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full blur-[140px] opacity-20"
            style={{ backgroundColor: "#8b5cf6" }}
          />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[440px]">
          {/* Colonne gauche : Informations, Date & Compte à rebours */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 sm:space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              {/* Badge d'en-tête */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider shadow-sm"
                  style={{ backgroundColor: dAccent, color: "#ffffff" }}
                >
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "#ffffff" }} />
                  <span style={{ color: "#ffffff" }}>{drop.dropNumber || "DROP"}</span>
                </span>

                {/* Badge Prochain Drop Exclusif : Couleurs vives et contrastées */}
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider border shadow-sm backdrop-blur-xs"
                  style={{
                    backgroundColor: "rgba(251, 191, 36, 0.16)",
                    borderColor: "rgba(251, 191, 36, 0.4)",
                    color: "#fde047",
                  }}
                >
                  <Clock className="w-3.5 h-3.5" style={{ color: "#fde047" }} />
                  <span style={{ color: "#fde047" }}>
                    {isLive ? "En direct maintenant" : "Prochain Drop Exclusif"}
                  </span>
                </span>

                {drop.editionSize && (
                  <span
                    className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono font-bold border"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      borderColor: "rgba(255, 255, 255, 0.15)",
                      color: "#e4e4e7",
                    }}
                  >
                    Série limitée : {drop.editionSize} pcs
                  </span>
                )}
              </div>

              {/* Titre du Drop */}
              <div className="space-y-1">
                <h3
                  className="text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.1] tracking-tight select-none"
                  style={{ fontFamily: dTitleFont, color: "#ffffff" }}
                >
                  {drop.dropName || drop.title}
                </h3>
              </div>

              {/* Description / Tagline */}
              <p
                className="text-sm sm:text-base leading-relaxed font-medium max-w-xl"
                style={{ color: dSubtitle }}
              >
                {drop.tagline || drop.description}
              </p>
            </div>

            {/* Bloc Date & Compte à rebours */}
            <div
              className="p-4 sm:p-6 rounded-2xl border space-y-3 backdrop-blur-md shadow-inner"
              style={{ backgroundColor: dCardBg, borderColor: dBorder }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2" style={{ color: "#ffffff" }}>
                  <Calendar className="w-4 h-4" style={{ color: dAccent }} />
                  <span style={{ color: "#ffffff" }}>Lancement officiel de la collection :</span>
                </span>
                <span
                  className="font-mono text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-lg border"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    borderColor: "rgba(255, 255, 255, 0.18)",
                    color: "#ffffff",
                  }}
                >
                  {formattedDate}
                </span>
              </div>

              {/* Compte à rebours temps réel */}
              <DropCountdown targetDate={drop.startDate} theme={dTheme} />
            </div>

            {/* Statut d'accès : verrouillé sans clic avant la date */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
              {isLive ? (
                // Une fois la date atteinte : CTA actif cliquable
                <Link
                  href={`/drops/${drop.slug}`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  style={{
                    backgroundColor: dAccent,
                    color: "#ffffff",
                    boxShadow: `0 12px 28px -6px ${dAccent}60`,
                  }}
                >
                  <span style={{ color: "#ffffff" }}>Accéder au Drop en Direct</span>
                  <ArrowRight className="w-4 h-4" style={{ color: "#ffffff" }} />
                </Link>
              ) : (
                // Avant la date : AUCUN CLIC possible, bouton teaser verrouillé avec texte parfaitement lisible
                <div className="flex flex-col sm:flex-row sm:items-center gap-3.5">
                  <div
                    className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border shadow-xl backdrop-blur-md select-none cursor-not-allowed transition-all"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.14)",
                      borderColor: "rgba(255, 255, 255, 0.28)",
                    }}
                    title={`Disponible le ${formattedDate}`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "rgba(251, 191, 36, 0.25)" }}
                    >
                      <Lock className="w-3.5 h-3.5" style={{ color: "#fde047" }} />
                    </div>
                    <span
                      className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider"
                      style={{ color: "#ffffff" }}
                    >
                      Ouverture le {formattedDate}
                    </span>
                  </div>

                  <span
                    className="text-xs font-mono flex items-center gap-1.5"
                    style={{ color: "#d4d4d8" }}
                  >
                    <EyeOff className="w-3.5 h-3.5 shrink-0" style={{ color: "#a1a1aa" }} />
                    <span style={{ color: "#d4d4d8" }}>
                      Fiche et pièces révélées à l'heure du lancement
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite : Médias (Vidéo ou Image du Drop) */}
          <div className="lg:col-span-5 relative aspect-square sm:aspect-16/10 lg:aspect-auto min-h-[300px] lg:min-h-[480px] bg-neutral-950 overflow-hidden order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-white/10">
            {drop.bannerVideo ? (
              <video
                src={drop.bannerVideo}
                poster={drop.bannerImage}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 ease-out select-none"
              />
            ) : (
              <Image
                src={drop.bannerImage}
                alt={drop.title}
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                className="w-full h-full object-cover transition-transform duration-700 ease-out select-none"
              />
            )}

            {/* Gradient d'ombrage pour la lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Pastille de verrouillage / compte à rebours sur l'image */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              {isLive ? (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-xs font-black uppercase tracking-wider shadow-lg"
                  style={{ color: "#ffffff" }}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  EN COURS
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-md text-xs font-mono font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    borderColor: "rgba(251, 191, 36, 0.4)",
                    color: "#fde047",
                  }}
                >
                  <Lock className="w-3.5 h-3.5" style={{ color: "#fde047" }} />
                  <span style={{ color: "#fde047" }}>BIENTÔT DISPO</span>
                </span>
              )}
            </div>

            {/* Légende discrète en bas de l'image */}
            <div
              className="absolute bottom-4 left-4 right-4 z-10 text-xs font-mono backdrop-blur-md p-2.5 rounded-xl border flex items-center justify-between"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.75)",
                borderColor: "rgba(255, 255, 255, 0.15)",
                color: "#e4e4e7",
              }}
            >
              <span className="truncate" style={{ color: "#e4e4e7" }}>
                Atelier Comines • Série Exclusive
              </span>
              <span className="font-bold shrink-0" style={{ color: "#ffffff" }}>
                {drop.dropNumber}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
