"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Calendar, Clock, Lock, ArrowRight, EyeOff, Bell, Mail, CheckCircle2 } from "lucide-react";
import DropCountdown from "@/components/drops/DropCountdown";
import { Drop } from "@/lib/drops";

interface LatestDropBannerProps {
  drop?: Drop | null;
}

export default function LatestDropBanner({ drop }: LatestDropBannerProps) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!drop) return null;

  const now = Date.now();
  const startTime = drop.startDate ? new Date(drop.startDate).getTime() : 0;
  const endTime = drop.endDate ? new Date(drop.endDate).getTime() : 0;

  // Données réelles des produits du drop
  const products = drop.products || [];
  const totalModels = products.length > 0 ? products.length : (drop.productIds?.length || 0);

  // Un produit est commandable s'il est publié et en stock réel > 0
  const availableProducts = products.filter(
    (p) => p.status === "publish" && (p.stock ?? 0) > 0
  );
  const availableModelsCount = availableProducts.length;
  const totalStockRemaining = products.reduce(
    (sum, p) => sum + (p.status === "publish" && (p.stock ?? 0) > 0 ? (p.stock ?? 0) : 0),
    0
  );

  const isPastStart = startTime > 0 && now >= startTime;
  const isPastEnd = endTime > 0 && now >= endTime;
  const hasLoadedProducts = products.length > 0;
  const isSoldOut = hasLoadedProducts && availableModelsCount === 0;

  let currentStatus: "upcoming" | "live" | "sold_out" | "ended" = "upcoming";
  if (isPastEnd || drop.status === "ended") {
    currentStatus = "ended";
  } else if (isSoldOut) {
    currentStatus = "sold_out";
  } else if (isPastStart || drop.status === "live") {
    currentStatus = "live";
  } else {
    currentStatus = "upcoming";
  }

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
          {/* Colonne gauche : Informations, Date & Disponibilité */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 sm:space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              {/* Badges d'état dynamique */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider shadow-sm"
                  style={{ backgroundColor: dAccent, color: "#ffffff" }}
                >
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "#ffffff" }} />
                  <span style={{ color: "#ffffff" }}>{drop.dropNumber || "DROP 001"}</span>
                </span>

                {currentStatus === "live" && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider border shadow-sm backdrop-blur-xs bg-emerald-500/15 border-emerald-400/30 text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Disponible à l&apos;Atelier</span>
                  </span>
                )}

                {currentStatus === "sold_out" && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider border shadow-sm backdrop-blur-xs bg-zinc-800/80 border-zinc-700 text-zinc-300">
                    <span>Édition Épuisée (Sold Out)</span>
                  </span>
                )}

                {currentStatus === "upcoming" && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider border shadow-sm backdrop-blur-xs"
                    style={{
                      backgroundColor: "rgba(251, 191, 36, 0.16)",
                      borderColor: "rgba(251, 191, 36, 0.4)",
                      color: "#fde047",
                    }}
                  >
                    <Clock className="w-3.5 h-3.5" style={{ color: "#fde047" }} />
                    <span style={{ color: "#fde047" }}>Prochain Drop d&apos;Atelier</span>
                  </span>
                )}

                {totalModels > 0 && (
                  <span
                    className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono font-bold border"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      borderColor: "rgba(255, 255, 255, 0.15)",
                      color: "#e4e4e7",
                    }}
                  >
                    {hasLoadedProducts
                      ? `${availableModelsCount} / ${totalModels} modèles dispo • ${totalStockRemaining} ${totalStockRemaining > 1 ? "pièces" : "pièce"}`
                      : `Série de ${totalModels} modèles`}
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

            {/* Bloc Statut / Disponibilité / Date */}
            <div
              className="p-4 sm:p-6 rounded-2xl border space-y-3 backdrop-blur-md shadow-inner"
              style={{ backgroundColor: dCardBg, borderColor: dBorder }}
            >
              {currentStatus === "live" ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-2" style={{ color: "#ffffff" }}>
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Série lancée à l&apos;Atelier :</span>
                    </span>
                    <span
                      className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg border text-emerald-300 bg-emerald-950/40 border-emerald-500/30"
                    >
                      En direct
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                    {hasLoadedProducts ? (
                      <>
                        <strong className="text-white font-bold">{availableModelsCount}</strong> modèle{availableModelsCount > 1 ? "s" : ""} encore disponible{availableModelsCount > 1 ? "s" : ""} sur {totalModels} ({totalStockRemaining} pièce{totalStockRemaining > 1 ? "s" : ""} au total en stock atelier).
                      </>
                    ) : (
                      "Pièces uniques façonnées et peintes à la main à Comines."
                    )}
                  </p>
                </div>
              ) : currentStatus === "sold_out" ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <Lock className="w-4 h-4 text-zinc-500" />
                    <span>Édition terminée</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">
                    Toutes les pièces de ce drop ont été adoptées. Rendez-vous au prochain drop d&apos;atelier.
                  </p>
                </div>
              ) : (
                <>
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
                  <DropCountdown targetDate={drop.startDate} theme={dTheme} />
                </>
              )}
            </div>

            {/* CTA ou Formulaire d'alerte */}
            <div className="pt-2">
              {currentStatus === "live" ? (
                <Link
                  href={`/drops/${drop.slug}`}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  style={{
                    backgroundColor: dAccent,
                    color: "#ffffff",
                    boxShadow: `0 12px 28px -6px ${dAccent}60`,
                  }}
                >
                  <span style={{ color: "#ffffff" }}>Découvrir la Série en Direct</span>
                  <ArrowRight className="w-4 h-4" style={{ color: "#ffffff" }} />
                </Link>
              ) : currentStatus === "sold_out" ? (
                <Link
                  href={`/drops/${drop.slug}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                >
                  <span>Voir la Galerie du Drop</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                    <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Être prévenu(e) à l'ouverture :</span>
                  </div>

                  {submitted ? (
                    <div
                      className="p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 backdrop-blur-md animate-fade-in"
                      style={{
                        backgroundColor: "rgba(16, 185, 129, 0.15)",
                        borderColor: "rgba(16, 185, 129, 0.4)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-white">
                            Tu es sur la liste d'attente !
                          </p>
                          <p className="text-[11px] text-emerald-200">
                            Vérifie ta boîte mail pour valider ton inscription.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          setEmail("");
                        }}
                        className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer shrink-0"
                      >
                        Autre email
                      </button>
                    </div>
                  ) : (
                    <form
                      action="https://spoolio.us15.list-manage.com/subscribe/post?u=ac0c921fbe515914135ceab3c&amp;id=bcabd4b111&amp;f_id=001a85e0f0"
                      method="post"
                      target="_blank"
                      onSubmit={() => setSubmitted(true)}
                      className="flex flex-col sm:flex-row items-stretch gap-2.5"
                    >
                      {/* Champ anti-bot Mailchimp */}
                      <div aria-hidden="true" style={{ position: "absolute", left: "-5000px" }}>
                        <input
                          type="text"
                          name="b_ac0c921fbe515914135ceab3c_bcabd4b111"
                          tabIndex={-1}
                          defaultValue=""
                        />
                      </div>
                      <input type="hidden" name="tags" value="info-drop" />

                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          name="EMAIL"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ton.email@exemple.com"
                          className="w-full pl-10 pr-3.5 py-3 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-sans placeholder:text-zinc-400 text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-amber-400/50"
                          style={{
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            borderColor: "rgba(255, 255, 255, 0.22)",
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 text-white"
                        style={{
                          backgroundColor: dAccent,
                          boxShadow: `0 8px 24px -4px ${dAccent}60`,
                        }}
                      >
                        <span>M'avertir du drop</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                    <EyeOff className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                    <span>Fiche et pièces révélées à l'heure du lancement • 0 spam garanti</span>
                  </div>
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
              {currentStatus === "live" ? (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-xs font-black uppercase tracking-wider shadow-lg"
                  style={{ color: "#ffffff" }}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  EN COURS
                </span>
              ) : currentStatus === "sold_out" ? (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 text-xs font-black uppercase tracking-wider shadow-lg border border-zinc-700"
                  style={{ color: "#a1a1aa" }}
                >
                  SOLD OUT
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
