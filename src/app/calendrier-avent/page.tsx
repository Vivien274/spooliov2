"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Gift,
  Lock,
  Sparkles,
  Printer,
  ChevronRight,
  Info,
  X,
  Eye,
  Settings,
  Star,
  CheckCircle2,
  Share2,
  ShoppingBag,
  RefreshCw,
  Flame,
  Award,
  Heart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AdventData, AdventObjectItem } from "@/types/avent";
import { getAdventDataAction, likeAdventObjectAction } from "@/app/actions/aventActions";

export default function PublicCalendrierAventPage() {
  const router = useRouter();
  const [data, setData] = useState<AdventData | null>(null);
  const [loading, setLoading] = useState(true);

  // Local Dev / Preview Simulation State
  const [simulatedDay, setSimulatedDay] = useState<number>(1);
  const [unlockAllDev, setUnlockAllDev] = useState<boolean>(false);

  // Modal State for Object Detail
  const [selectedObject, setSelectedObject] = useState<AdventObjectItem | null>(null);
  const [openedDays, setOpenedDays] = useState<number[]>([]);

  // Preorder vs Open Grid Phase State (Before Dec 1st)
  const [isPreorderPhase, setIsPreorderPhase] = useState<boolean>(true);

  // Load Data
  useEffect(() => {
    async function load() {
      try {
        const res = await getAdventDataAction();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Automatic Redirection to Homepage if Page is Private & Not in Dev Mode
  useEffect(() => {
    if (data && data.config.isPublicActive === false && !unlockAllDev) {
      router.replace("/");
    }
  }, [data, unlockAllDev, router]);

  // Trigger festive confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 110,
        spread: 90,
        origin: { y: 0.55 },
        colors: ["#f59e0b", "#ef4444", "#10b981", "#ffffff", "#ffd700", "#ec4899"],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenDoor = (obj: AdventObjectItem, isUnlocked: boolean) => {
    if (!isUnlocked) return;

    if (!openedDays.includes(obj.day)) {
      setOpenedDays((prev) => [...prev, obj.day]);
      triggerConfetti();
    }
    setSelectedObject(obj);
  };

  const handleLikeObject = async (day: number) => {
    if (!selectedObject) return;

    // Optimistic UI update
    const currentLikes = selectedObject.likesCount || 0;
    const updatedObj = { ...selectedObject, likesCount: currentLikes + 1 };
    setSelectedObject(updatedObj);

    if (data) {
      const updatedObjects = data.objects.map((o) => (o.day === day ? updatedObj : o));
      setData({ ...data, objects: updatedObjects });
    }

    // Trigger small heart confetti
    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#ef4444", "#ec4899", "#f59e0b"],
      });
    } catch (e) {}

    // Persist in local storage via server action
    try {
      await likeAdventObjectAction(day);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#09040d] text-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
          <span className="text-xs font-mono text-amber-200/80">Chargement de la féérie de Noël Spoolio...</span>
        </div>
      </div>
    );
  }

  // Snowflake count for background
  const snowflakes = Array.from({ length: 28 });

  // Calculated Preorder Pricing
  const preorder = data.config.preorder || {
    tier1Price: 45,
    tier1Limit: 25,
    tier1Sold: 8,
    tier2Price: 50,
    tier2Limit: 25,
    tier2Sold: 0,
  };

  const isVague1Active = preorder.tier1Sold < preorder.tier1Limit;
  const currentPrice = isVague1Active ? preorder.tier1Price : preorder.tier2Price;
  const currentSold = isVague1Active ? preorder.tier1Sold : preorder.tier2Sold;
  const currentLimit = isVague1Active ? preorder.tier1Limit : preorder.tier2Limit;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0512] via-[#0f091a] to-[#07030a] text-white relative overflow-hidden font-sans pb-28">
      {/* CSS Animations for Floating Snow & Glowing Lights */}
      <style jsx global>{`
        @keyframes floatSnow {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: translateY(45vh) translateX(15px) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: translateY(95vh) translateX(-15px) rotate(360deg);
            opacity: 0.2;
          }
        }
        @keyframes bulbGlow {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 8px currentColor); }
          50% { opacity: 0.4; filter: drop-shadow(0 0 2px currentColor); }
        }
        .snow-particle {
          position: absolute;
          top: -30px;
          pointer-events: none;
          user-select: none;
          animation: floatSnow linear infinite;
        }
        .bulb-light {
          animation: bulbGlow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Falling Snowflakes Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {snowflakes.map((_, i) => {
          const left = (i * 3.7) % 100;
          const duration = 7 + (i % 8);
          const delay = (i % 5) * 1.5;
          const size = 10 + (i % 14);
          const icon = i % 3 === 0 ? "❄" : i % 3 === 1 ? "❅" : "✨";
          return (
            <div
              key={i}
              className="snow-particle text-amber-100/60"
              style={{
                left: `${left}%`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
                fontSize: `${size}px`,
              }}
            >
              {icon}
            </div>
          );
        })}
      </div>

      {/* Top Header & Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#0a0512]/90 backdrop-blur-md border-b border-amber-500/20 shadow-lg">
        {/* Delicate String Lights along top border */}
        <div className="w-full h-1 bg-gradient-to-r from-amber-500 via-rose-500 via-emerald-500 to-amber-500 opacity-80" />

        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform hover:scale-105"
            title="Retour à Spoolio.fr"
          >
            <Image
              src="/images/logo.png"
              alt="Spoolio Logo"
              width={120}
              height={35}
              className="h-8 sm:h-9 w-auto object-contain"
              priority
            />
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-antonio tracking-widest uppercase text-amber-300 flex items-center gap-1.5">
              <span>Village de Noël Spoolio</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Édition Limitée</span>
              <span>2026</span>
            </span>
          </div>
        </div>
      </header>

      {/* Glow Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-b from-amber-500/15 via-rose-500/10 to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4 relative z-10 space-y-8">
        {/* Clean Hero Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-2xl shadow-xl shadow-amber-500/10 mb-1">
            🎁
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-antonio tracking-wider uppercase bg-gradient-to-r from-amber-100 via-amber-200 to-rose-200 bg-clip-text text-transparent">
            {data.config.title}
          </h1>

          <p className="text-xs sm:text-sm text-amber-100/70 leading-relaxed font-light">
            {data.config.subtitle}
          </p>

          <div className="pt-1 flex items-center justify-center gap-3 text-[11px] font-mono flex-wrap">
            <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded-xl border border-amber-500/40 shadow-sm">
              💎 80 € de Valeur Produits
            </span>
            <span className="flex items-center gap-1 bg-white/5 text-amber-100/90 px-3 py-1 rounded-xl border border-white/10">
              <span>🇫🇷</span> 100% Imprimé en France
            </span>
            <span className="flex items-center gap-1 bg-white/5 text-amber-100/90 px-3 py-1 rounded-xl border border-white/10">
              <span>🎁</span> 24 Créations 3D
            </span>
          </div>
        </div>

        {/* CONDITION 1: PREORDER PRODUCT HERO BLOCK (Avant le 1er Décembre) */}
        {isPreorderPhase ? (
          <div className="space-y-8">
            <div className="bg-gradient-to-b from-[#180e29]/90 to-[#0e071a]/90 border-2 border-amber-400/40 rounded-3xl p-6 md:p-8 shadow-2xl shadow-amber-500/20 max-w-4xl mx-auto relative overflow-hidden backdrop-blur-xl">
              {/* Badge Top Offer */}
              <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-600 via-rose-500 to-amber-500 text-white font-mono font-bold text-[10px] sm:text-xs px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-md">
                🔥 Précommandes Ouvertes • Expédition Novembre
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
                {/* Left: Product Box Image */}
                <div className="space-y-4">
                  <div className="w-full h-72 rounded-2xl overflow-hidden relative border border-amber-500/30 shadow-2xl bg-black/60 group">
                    <Image
                      src="/images/imported/Spoolio_Kit-Festival-16-scaled.webp"
                      alt="Coffret Calendrier de l'Avent Spoolio"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Right: Offer Details & Price */}
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
                      Coffret de Noël Édition Spéciale
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white font-antonio tracking-wide uppercase leading-tight mt-1">
                      Le Calendrier de l'Avent 3D Spoolio
                    </h2>
                  </div>

                  {/* Active Pricing & Jauge Stock */}
                  <div className="bg-gradient-to-b from-black/60 to-black/30 border border-amber-500/30 p-5 rounded-2xl space-y-4 shadow-inner">
                    {/* Price Row: Horizontal layout */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight whitespace-nowrap">
                        {currentPrice.toFixed(2)} €
                      </span>
                      {isVague1Active && (
                        <span className="text-base font-mono line-through text-white/40 whitespace-nowrap">
                          {preorder.tier2Price.toFixed(2)} €
                        </span>
                      )}
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 whitespace-nowrap">
                        {isVague1Active ? "⚡ Offre Lancement (-5€)" : "📦 Tarif Standard"}
                      </span>
                    </div>

                    {/* Real Value Pill */}
                    <div>
                      <span className="inline-flex items-center gap-2 text-xs font-mono text-amber-200/90 font-bold bg-amber-500/10 px-3.5 py-1.5 rounded-xl border border-amber-500/30">
                        <span>🎁</span>
                        <span>Valeur réelle de produits :</span>
                        <strong className="text-amber-300 font-extrabold">80,00 €</strong>
                      </span>
                    </div>

                    {/* Gauge Stock */}
                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between text-[11px] font-mono text-amber-200">
                        <span>Exemplaires réservés :</span>
                        <strong className="text-amber-300">
                          {currentSold} / {currentLimit} ({Math.round((currentSold / currentLimit) * 100)}%)
                        </strong>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${(currentSold / currentLimit) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Included Items Checklist */}
                  <div className="space-y-2 text-xs text-white/80">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>24 sachets kraft numérotés</strong> avec 24 créations 3D exclusives</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Kit DIY d'assemblage</strong> (cordons & fixations)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Planche A4 de stickers Spoolio</strong> + Flyer de Noël</span>
                    </div>
                  </div>

                  {/* CTA Preorder */}
                  <button
                    onClick={() => {
                      alert(`Merci ! Votre calendrier a été ajouté au panier au tarif de ${currentPrice.toFixed(2)}€ !`);
                    }}
                    className="relative group w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 hover:from-amber-400 hover:to-rose-500 text-white font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-2xl shadow-amber-500/25 border border-amber-300/40 flex items-center justify-between gap-3 active:scale-[0.99] cursor-pointer overflow-hidden"
                  >
                    {/* Glossy hover shimmer overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                    <div className="flex items-center gap-2.5 z-10">
                      <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-sm">
                        <Gift className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-antonio font-bold text-base tracking-wider text-white drop-shadow">
                        Précommander Mon Calendrier
                      </span>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/20 font-mono text-xs font-extrabold text-amber-200 shadow-inner z-10 whitespace-nowrap">
                      {currentPrice.toFixed(2)} €
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Locked Grid Teaser Banner */}
            <div className="text-center space-y-3 pt-4 border-t border-white/10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-amber-500/30 text-xs font-mono text-amber-200">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>La grille des 24 fenêtres s'ouvrira du 1er au 24 Décembre</span>
              </div>
              <p className="text-xs text-white/50">
                (Astuce dev : utilisez la barre en bas pour tester la grille ouverte ou simuler la date du 1er Décembre !)
              </p>
            </div>
          </div>
        ) : null}

        {/* 24-DOOR CALENDAR GRID (Affiché à partir du 1er Décembre ou si déverrouillé) */}
        {(!isPreorderPhase || unlockAllDev) ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.objects.map((obj) => {
              const isUnlockedByDate = obj.day <= simulatedDay;
              const isManuallyRevealed = obj.visibility === "devoile_manuel";
              const isUnlocked = unlockAllDev || isUnlockedByDate || isManuallyRevealed;
              const isOpen = openedDays.includes(obj.day) || unlockAllDev;
              const isChristmasEve = obj.day === 24;

              return (
                <div
                  key={obj.day}
                  onClick={() => handleOpenDoor(obj, isUnlocked)}
                  className={`group relative min-h-[175px] rounded-3xl p-4 flex flex-col justify-between transition-all duration-500 cursor-pointer overflow-hidden border ${
                    isChristmasEve
                      ? isUnlocked
                        ? "bg-gradient-to-b from-amber-500/30 via-rose-950/70 to-black border-2 border-amber-400 shadow-2xl shadow-amber-500/30 scale-[1.03] col-span-2 sm:col-span-1"
                        : "bg-gradient-to-b from-amber-950/40 via-black to-rose-950/30 border-2 border-amber-500/40 shadow-lg"
                      : isUnlocked
                      ? isOpen
                        ? "bg-gradient-to-b from-amber-500/20 via-black/90 to-amber-950/40 border-amber-500/50 shadow-xl shadow-amber-500/10 scale-[1.02]"
                        : "bg-gradient-to-b from-rose-900/20 via-black/80 to-amber-950/30 border-amber-400/40 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-1.5"
                      : "bg-black/60 border-white/10 hover:border-white/20 opacity-80"
                  }`}
                >
                  {/* Decorative Christmas Box Ribbon Overlay for unopened doors */}
                  {!isOpen && (
                    <>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-full bg-gradient-to-b from-amber-400/30 via-rose-500/20 to-transparent pointer-events-none" />
                      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-1.5 bg-gradient-to-r from-amber-400/30 via-rose-500/20 to-transparent pointer-events-none" />
                    </>
                  )}

                  {/* Day Badge & Status */}
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center font-mono font-black text-sm transition-all ${
                          isChristmasEve
                            ? "bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-500 text-black shadow-lg shadow-amber-500/40 font-extrabold"
                            : isUnlocked
                            ? "bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/30"
                            : "bg-white/10 text-white/50 border border-white/10"
                        }`}
                      >
                        {obj.day}
                      </span>
                      {isChristmasEve && (
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.5 rounded-lg border border-amber-400/40">
                          👑 24 Déc.
                        </span>
                      )}
                    </div>

                    {isUnlocked ? (
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isOpen
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
                        }`}
                      >
                        {isOpen ? "Ouvert ✨" : "Débloqué 🎁"}
                      </span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-amber-200/40" />
                    )}
                  </div>

                  {/* Door Center Content */}
                  <div className="my-2 z-10 text-center flex flex-col items-center justify-center min-h-[70px]">
                    {isUnlocked ? (
                      isOpen ? (
                        <div className="space-y-1">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden relative border-2 border-amber-400/50 mx-auto shadow-md">
                            {obj.imageUrl ? (
                              <Image src={obj.imageUrl} alt={obj.title} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm">🎁</div>
                            )}
                          </div>
                          <h4 className="text-[11px] font-bold text-amber-100 line-clamp-1 mt-1 font-antonio">
                            {obj.title}
                          </h4>
                        </div>
                      ) : (
                        <div className="space-y-1 group-hover:scale-110 transition-transform">
                          <div className="relative inline-block">
                            <Gift className="w-9 h-9 text-amber-400 mx-auto drop-shadow-lg" />
                            <Sparkles className="w-4 h-4 text-amber-200 absolute -top-1 -right-1 animate-spin" />
                          </div>
                          <span className="text-[10px] text-amber-300 font-extrabold block tracking-wider font-mono">
                            OUVRIR !
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="space-y-1">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-xs">
                          🔒
                        </div>
                        <span className="text-[9px] text-white/40 font-mono block">Case Verrouillée</span>
                      </div>
                    )}
                  </div>

                  {/* Teaser hint for locked door */}
                  {!isUnlocked && (
                    <div className="text-[9px] text-amber-200/70 italic line-clamp-2 bg-black/70 p-1.5 rounded-xl border border-amber-500/20 backdrop-blur-sm z-10 font-sans">
                      💡 "{obj.teaser}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* CHRISTMAS OBJECT DETAIL MODAL */}
      {selectedObject && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-b from-[#1c122b] to-[#0e0719] border-2 border-amber-400/60 rounded-3xl p-6 max-w-lg w-full space-y-5 relative shadow-2xl shadow-amber-500/30">
            {/* Close button */}
            <button
              onClick={() => setSelectedObject(null)}
              className="absolute top-4 right-4 p-2 rounded-2xl bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-all z-20 border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Day Pill */}
            <div className="flex items-center gap-3">
              <span className="px-4 py-1 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-amber-500 text-black font-black text-xs font-mono shadow-md">
                🎅 JOUR {selectedObject.day} DE NOËL
              </span>
              <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
                {selectedObject.category}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-black text-white font-antonio tracking-wide leading-tight">
              {selectedObject.title}
            </h2>

            {/* Object Image Preview */}
            <div className="w-full h-60 rounded-2xl overflow-hidden bg-black/60 border border-amber-500/30 relative shadow-2xl">
              {selectedObject.imageUrl ? (
                <Image
                  src={selectedObject.imageUrl}
                  alt={selectedObject.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">🎁</div>
              )}
            </div>

            {/* Color Pill */}
            <div className="bg-white/5 border border-amber-500/20 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] text-amber-200/60 font-mono block uppercase font-bold">Couleur</span>
              <span className="font-bold text-amber-300 block text-xs">{selectedObject.filamentColor}</span>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-amber-300 font-mono uppercase block">
                ✨ Histoire de la création :
              </span>
              <p className="text-xs text-white/90 leading-relaxed bg-black/40 p-3.5 rounded-2xl border border-white/10">
                {selectedObject.description}
              </p>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: selectedObject.title,
                      text: `Regarde le jour ${selectedObject.day} du Calendrier de l'Avent Spoolio ! 🎄`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Lien copié dans le presse-papier !");
                  }
                }}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-white/10"
              >
                <Share2 className="w-4 h-4" />
                <span>Partager</span>
              </button>

              <button
                onClick={() => handleLikeObject(selectedObject.day)}
                className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95"
              >
                <Heart className="w-4 h-4 fill-white text-white animate-bounce" />
                <span>J'aime ({selectedObject.likesCount || 0})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING LOCAL DEV SIMULATOR TOOLBAR */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#170e24]/95 border border-amber-500/50 backdrop-blur-xl px-5 py-3 rounded-3xl shadow-2xl flex items-center gap-4 z-40 text-xs shadow-amber-500/20">
        <div className="flex items-center gap-2 text-amber-300 font-mono font-bold">
          <Settings className="w-4 h-4 text-amber-400 animate-spin" />
          <span>Simulateur Dev Local :</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/70 font-mono text-[11px]">Jour simulé :</span>
          <select
            value={simulatedDay}
            onChange={(e) => setSimulatedDay(parseInt(e.target.value))}
            className="bg-black/60 border border-amber-500/40 text-amber-200 font-mono font-bold rounded-xl px-2 py-1 focus:outline-none cursor-pointer"
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Jour {i + 1}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsPreorderPhase(!isPreorderPhase)}
          className={`px-3.5 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 ${
            isPreorderPhase
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
          }`}
        >
          <span>{isPreorderPhase ? "🛒 Mode Précommande (< 01/12)" : "🎁 Mode Grille Ouverte (≥ 01/12)"}</span>
        </button>

        <button
          onClick={() => setUnlockAllDev(!unlockAllDev)}
          className={`px-3.5 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 ${
            unlockAllDev
              ? "bg-amber-400 text-black shadow-lg"
              : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{unlockAllDev ? "Tout Déverrouillé ACTIVE" : "Tout Déverrouiller"}</span>
        </button>

        <Link
          href="/admin/calendrier-avent"
          className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 font-bold transition-all"
        >
          Admin Hub →
        </Link>
      </div>
    </div>
  );
}
