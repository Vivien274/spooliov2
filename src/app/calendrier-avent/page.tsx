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
  Truck,
  Leaf,
  ChevronDown,
  Play,
  Video,
  Calendar,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AdventData, AdventObjectItem } from "@/types/avent";
import { getAdventDataAction, likeAdventObjectAction } from "@/app/actions/aventActions";
import { useCart } from "@/context/CartContext";
import AdventMarqueeBanner from "@/components/AdventMarqueeBanner";

export default function PublicCalendrierAventPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [data, setData] = useState<AdventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Local Dev / Preview Simulation State
  const [simulatedDay, setSimulatedDay] = useState<number>(1);
  const [unlockAllDev, setUnlockAllDev] = useState<boolean>(false);
  const [simulatedDateOverride, setSimulatedDateOverride] = useState<string>("auto");

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
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("dev") === "true" || params.get("preview") === "true") {
        setUnlockAllDev(true);
        return;
      }
    }
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
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#f43f5e", "#fb7185", "#fda4af"],
      });
    } catch (e) {
      console.error(e);
    }

    // Persist on server
    try {
      await likeAdventObjectAction(day);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#140306] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
          <span className="text-sm font-mono text-white/70">Chargement de l'Avent Spoolio...</span>
        </div>
      </div>
    );
  }

  // Snowflake count for background
  const snowflakes = Array.from({ length: 28 });

  // Preorder Capacity and Stock (50 total calendars)
  const preorder = data.config.preorder || {
    tier1Price: 45,
    tier2Price: 50,
    totalLimit: 50,
    totalSold: 0,
  };

  const totalLimit = preorder.totalLimit || 50;
  const totalSold = preorder.totalSold ?? (preorder.tier1Sold || 0);

  // Date-based phase determination:
  // Phase 1: jusqu'au 30 Septembre -> 45€ + 25ème cadeau inclus
  // Phase 2: du 1er au 15 Octobre -> 45€ remisé (sans 25ème cadeau)
  // Phase 3: à partir du 16 Octobre -> 50€ tarif normal
  const realNow = new Date();
  const currentYear = realNow.getFullYear();
  const sept30 = new Date(currentYear, 8, 30, 23, 59, 59); // 30 Septembre
  const oct15 = new Date(currentYear, 9, 15, 23, 59, 59); // 15 Octobre

  // Simulation mode date calculation
  const isSeptemberPhase =
    simulatedDateOverride === "sept"
      ? true
      : simulatedDateOverride === "oct_early" || simulatedDateOverride === "oct_late"
      ? false
      : realNow <= sept30;

  const isEarlyOctoberPhase =
    simulatedDateOverride === "oct_early"
      ? true
      : simulatedDateOverride === "sept" || simulatedDateOverride === "oct_late"
      ? false
      : realNow > sept30 && realNow <= oct15;

  const isStandardPhase =
    simulatedDateOverride === "oct_late"
      ? true
      : simulatedDateOverride === "sept" || simulatedDateOverride === "oct_early"
      ? false
      : realNow > oct15;

  const hasBonus25thGift = isSeptemberPhase;
  const isPriceDiscounted = isSeptemberPhase || isEarlyOctoberPhase;
  const currentPrice = isPriceDiscounted ? (preorder.tier1Price || 45) : (preorder.tier2Price || 50);

  const handlePreorder = () => {
    triggerConfetti();
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);

    addToCart(
      {
        productId: 202612,
        name: data.config.title || "Calendrier de l'Avent Spoolio 2026",
        slug: "calendrier-avent",
        price: currentPrice.toFixed(2),
        selectedOptions: {
          "Formule": hasBonus25thGift
            ? "Offre de Lancement (45€ + 25ème Cadeau Exclusif Offert)"
            : isEarlyOctoberPhase
            ? "Tarif Remisé Précommande (45€)"
            : "Tarif Standard d'Achat (50€)",
          "Contenu": hasBonus25thGift
            ? "24 créations 3D + 25ème cadeau surprise + Kit Guirlande DIY"
            : "24 créations 3D + Kit Guirlande DIY",
        },
        image: "/images/calendrier-avent-hero.jpg",
      },
      1,
      true
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0509] via-[#120306] to-[#0a0204] text-white relative overflow-hidden font-sans pb-12">
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
              className="snow-particle text-white/80"
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
      <header className="sticky top-0 z-30 bg-[#140407]/90 backdrop-blur-md border-b border-red-500/25 shadow-lg">
        <AdventMarqueeBanner />
        {/* Delicate String Lights along top border */}
        <div className="w-full h-1 bg-gradient-to-r from-red-600 via-rose-400 via-amber-300 via-rose-400 to-red-600 opacity-90" />

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
            <span className="text-xs font-bold font-antonio tracking-widest uppercase text-red-300 flex items-center gap-1.5">
              <span>🎄 Village de Noël Spoolio</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600/20 text-red-200 border border-red-500/30 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Édition Limitée</span>
              <span>2026</span>
            </span>
          </div>
        </div>
      </header>

      {/* Glow Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-b from-red-600/25 via-rose-600/10 to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4 relative z-10 space-y-8">
        {/* Clean Hero Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-300 text-2xl shadow-xl shadow-red-500/20 mb-1">
            🎁
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-antonio tracking-wider uppercase bg-gradient-to-r from-white via-red-100 to-rose-200 bg-clip-text text-transparent">
            {data.config.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-200/80 leading-relaxed font-light">
            {data.config.subtitle}
          </p>

          <div className="pt-1 flex items-center justify-center gap-3 text-[11px] font-mono flex-wrap">
            <span className="flex items-center gap-1 bg-amber-500/15 text-amber-300 font-bold px-3 py-1 rounded-xl border border-amber-500/30 shadow-sm">
              💎 80 € de Valeur Produits
            </span>
            <span className="flex items-center gap-1 bg-white/10 text-white font-semibold px-3 py-1 rounded-xl border border-white/20">
              <span>🇫🇷</span> 100% Imprimé en France
            </span>
            <span className="flex items-center gap-1 bg-red-600/20 text-red-200 font-semibold px-3 py-1 rounded-xl border border-red-500/40">
              <span>🎁</span> 24 Créations 3D
            </span>
          </div>
        </div>

        {/* CONDITION 1: PREORDER PRODUCT HERO BLOCK (Avant le 1er Décembre) */}
        {isPreorderPhase ? (
          <div className="space-y-8">
            <div className="bg-gradient-to-b from-[#24080e]/95 via-[#180509]/95 to-[#100306]/95 border-2 border-red-500/40 rounded-3xl p-6 md:p-8 lg:p-10 shadow-2xl shadow-red-950/60 w-full relative overflow-hidden backdrop-blur-xl">
              {/* Badge Top Offer */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-mono font-bold text-[10px] sm:text-xs px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-md">
                🔥 Précommandes Ouvertes • Expédition Novembre
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-center pt-4">
                {/* Left: Product Box Image */}
                <div className="h-full flex flex-col justify-center">
                  <div className="w-full aspect-square max-w-md mx-auto md:max-w-none rounded-2xl overflow-hidden relative border-2 border-red-500/40 shadow-2xl bg-black/60 group">
                    <Image
                      src="/images/calendrier-avent-hero.jpg"
                      alt="Première édition : Calendrier de l'Avent Spoolio"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority
                    />
                  </div>
                </div>

                {/* Right: Offer Details & Price */}
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                      Coffret de Noël Édition Spéciale
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white font-antonio tracking-wide uppercase leading-tight mt-1">
                      Le Calendrier de l'Avent 3D Spoolio
                    </h2>
                  </div>

                  {/* Active Pricing & Jauge Stock */}
                  <div className="bg-gradient-to-b from-black/70 to-black/40 border border-red-500/30 p-5 rounded-2xl space-y-4 shadow-inner">
                    {/* Price Row: Horizontal layout */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight whitespace-nowrap">
                        {currentPrice.toFixed(2)} €
                      </span>
                      {isPriceDiscounted && (
                        <span className="text-base font-mono line-through text-white/40 whitespace-nowrap">
                          {(preorder.tier2Price || 50).toFixed(2)} €
                        </span>
                      )}
                      <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 whitespace-nowrap">
                        {hasBonus25thGift
                          ? "⚡ Offre Lancement (-5€ & 25ème Cadeau Offert)"
                          : isEarlyOctoberPhase
                          ? "⚡ Tarif Remisé Précommande (-5€)"
                          : "📦 Tarif Standard"}
                      </span>
                    </div>

                    {/* Conditions Banner */}
                    <div className="space-y-1.5 pt-1">
                      {hasBonus25thGift ? (
                        <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-600/30 to-amber-500/20 border border-amber-500/40 text-xs text-amber-200 flex items-center gap-2">
                          <span className="text-base">🎁</span>
                          <span>
                            <strong>Bonus de Lancement :</strong> Commandez avant le <strong>30 Septembre</strong> et recevez un <strong>25ème cadeau exclusif</strong> dans votre coffret !
                          </span>
                        </div>
                      ) : isEarlyOctoberPhase ? (
                        <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-xs text-rose-200 flex items-center gap-2">
                          <span className="text-base">⏳</span>
                          <span>
                            <strong>Prix remisé à 45€ jusqu'au 15 Octobre</strong> (Passage à 50€ dès le 16/10).
                          </span>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/75 flex items-center gap-2">
                          <span className="text-base">📦</span>
                          <span>Tarif standard d'achat (50€) • Fin des expéditions mi-novembre, retrait atelier possible jusqu'au 1er décembre.</span>
                        </div>
                      )}
                    </div>

                    {/* Real Value Pill */}
                    <div>
                      <span className="inline-flex items-center gap-2 text-xs font-mono text-red-100 font-bold bg-red-600/20 px-3.5 py-1.5 rounded-xl border border-red-500/30">
                        <span>🎁</span>
                        <span>Valeur réelle de produits :</span>
                        <strong className="text-amber-300 font-extrabold">+80,00 €</strong>
                      </span>
                    </div>

                    {/* Gauge Stock (50 total calendars) */}
                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between text-[11px] font-mono text-rose-200">
                        <span>Exemplaires réservés sur la série limitée :</span>
                        <strong className="text-white">
                          {totalSold} / {totalLimit} ({Math.round((totalSold / totalLimit) * 100)}%)
                        </strong>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-rose-600 via-red-500 to-amber-400 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round((totalSold / totalLimit) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Included Items Checklist */}
                  <div className="space-y-2 text-xs text-white/90">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                      <span><strong>24 sachets kraft numérotés</strong> avec 24 créations 3D exclusives</span>
                    </div>
                    {hasBonus25thGift && (
                      <div className="flex items-center gap-2 text-amber-300 font-bold">
                        <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                        <span><strong>25ème cadeau exclusif</strong> offert (commande avant le 30/09)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                      <span><strong>Kit DIY d'assemblage</strong> (cordons & fixations)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                      <span><strong>100% fait maison</strong>, dans notre atelier à Comines !</span>
                    </div>
                  </div>

                  {/* CTA Preorder */}
                  <button
                    onClick={handlePreorder}
                    className={`relative group w-full py-4 px-6 rounded-2xl text-white font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-2xl border flex items-center justify-between gap-3 active:scale-[0.99] cursor-pointer overflow-hidden ${
                      addedSuccess
                        ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 border-red-300/60 shadow-red-500/30"
                        : "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 border-red-400/50 shadow-red-600/40"
                    }`}
                  >
                    {/* Glossy hover shimmer overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                    <div className="flex items-center gap-2.5 z-10">
                      <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-sm">
                        {addedSuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <Gift className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="font-antonio font-bold text-base tracking-wider text-white drop-shadow">
                        {addedSuccess ? "Ajouté au Panier ! ✨" : "Précommander Mon Calendrier"}
                      </span>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/20 font-mono text-xs font-extrabold text-white shadow-inner z-10 whitespace-nowrap">
                      {currentPrice.toFixed(2)} €
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* PREORDER MILESTONES TIMELINE */}
            <div className="bg-gradient-to-b from-[#20060b]/90 to-[#120306]/90 border-2 border-red-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-300 shadow-sm">
                    <Calendar className="w-4 h-4 text-red-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg font-antonio tracking-wide uppercase">
                      Calendrier des Précommandes & Jalons
                    </h3>
                    <p className="text-[11px] text-white/70 font-mono">
                      Capacité totale strictement plafonnée à 50 exemplaires artisanaux
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                    ⏱️ Suivi en direct
                  </span>
                </div>
              </div>

              {/* Timeline Steps */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Step 1: Jusqu'au 30 Septembre */}
                <div
                  className={`relative rounded-2xl p-4.5 border transition-all space-y-2.5 ${
                    isSeptemberPhase
                      ? "bg-gradient-to-b from-red-600/25 to-black/60 border-amber-400 shadow-lg shadow-red-950/60 ring-1 ring-amber-400/40"
                      : "bg-black/40 border-white/10 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                      Jalon 1 • Lancement
                    </span>
                    {isSeptemberPhase && (
                      <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        En cours
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-white font-antonio uppercase tracking-wide">
                      Jusqu'au 30 Septembre
                    </div>
                    <div className="text-xl font-black font-mono text-amber-300 mt-0.5">
                      45,00 € <span className="text-xs line-through text-white/40">50 €</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-white/10 text-xs leading-relaxed text-white/85">
                    <p className="flex items-start gap-1.5 text-amber-200">
                      <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>25ème cadeau exclusif</strong> offert dans votre boîte !</span>
                    </p>
                    <p className="text-[11px] text-white/60">
                      Le tarif le plus avantageux avec la surprise bonus.
                    </p>
                  </div>
                </div>

                {/* Step 2: Du 1er au 15 Octobre */}
                <div
                  className={`relative rounded-2xl p-4.5 border transition-all space-y-2.5 ${
                    isEarlyOctoberPhase
                      ? "bg-gradient-to-b from-red-600/25 to-black/60 border-amber-400 shadow-lg shadow-red-950/60 ring-1 ring-amber-400/40"
                      : "bg-black/40 border-white/10 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300 bg-red-500/15 px-2.5 py-0.5 rounded-full border border-red-500/30">
                      Jalon 2 • Phase 2
                    </span>
                    {isEarlyOctoberPhase && (
                      <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        En cours
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-white font-antonio uppercase tracking-wide">
                      Du 1er au 15 Octobre
                    </div>
                    <div className="text-xl font-black font-mono text-white mt-0.5">
                      45,00 € <span className="text-xs line-through text-white/40">50 €</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-white/10 text-xs leading-relaxed text-white/85">
                    <p className="text-rose-200">
                      <strong>Prix remisé maintenu</strong> à 45 €.
                    </p>
                    <p className="text-[11px] text-white/60">
                      Fin de l'offre du 25ème cadeau bonus (24 créations dans le coffret).
                    </p>
                  </div>
                </div>

                {/* Step 3: À partir du 16 Octobre */}
                <div
                  className={`relative rounded-2xl p-4.5 border transition-all space-y-2.5 ${
                    isStandardPhase
                      ? "bg-gradient-to-b from-red-600/25 to-black/60 border-amber-400 shadow-lg shadow-red-950/60 ring-1 ring-amber-400/40"
                      : "bg-black/40 border-white/10 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/70 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                      Jalon 3 • Achat Standard
                    </span>
                    {isStandardPhase && (
                      <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        En cours
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-white font-antonio uppercase tracking-wide">
                      Dès le 16 Octobre
                    </div>
                    <div className="text-xl font-black font-mono text-white mt-0.5">
                      50,00 €
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-white/10 text-xs leading-relaxed text-white/85">
                    <p className="text-white/90">
                      <strong>Tarif standard d'achat</strong>.
                    </p>
                    <p className="text-[11px] text-white/60">
                      Ce n'est plus de la précommande : vente dans la limite des 50 pièces produites.
                    </p>
                  </div>
                </div>

                {/* Step 4: Mi-Novembre Expédition & Retrait */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4.5 space-y-2.5 opacity-90">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Jalon 4 • Réception
                    </span>
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>

                  <div>
                    <div className="text-sm font-bold text-white font-antonio uppercase tracking-wide">
                      Mi-Nov. à 1er Décembre
                    </div>
                    <div className="text-xl font-black font-mono text-emerald-300 mt-0.5">
                      Expéditions & Retrait 📦
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-white/10 text-xs leading-relaxed text-white/85">
                    <p className="text-emerald-200">
                      <strong>Fin des expéditions mi-novembre</strong> (Colissimo / Relais).
                    </p>
                    <p className="text-[11px] text-white/70">
                      Retrait atelier à Comines possible jusqu'au <strong>1er décembre</strong> !
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* MARKETING SECTION 1: LES 6 ATOUTS MAJEURS */}
            <div className="space-y-6 pt-4">
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-200 text-[11px] font-mono font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pourquoi choisir l'Avent Spoolio ?</span>
                </span>
                <h3 className="text-2xl sm:text-3xl font-black font-antonio uppercase tracking-wide text-white">
                  24 Jours d'Émerveillement 3D Inédit
                </h3>
                <p className="text-xs sm:text-sm text-slate-200/80 leading-relaxed font-light">
                  Bien plus qu'un simple calendrier : chaque matin de décembre, découvrez une création originale et tactile, pensée pour durer et émerveiller.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Atout 1: 24 créations exclusives */}
                <div className="bg-gradient-to-b from-[#18080c]/90 to-black/70 border border-red-500/40 rounded-3xl p-5 hover:border-red-400 hover:shadow-xl hover:shadow-red-950/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-3 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600/30 to-rose-700/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-md">
                        <Sparkles className="w-5 h-5 text-red-300 group-hover:rotate-12 transition-transform" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-red-300 bg-red-500/20 px-2.5 py-0.5 rounded-full border border-red-500/30">
                        100% Exclusif
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base font-antonio tracking-wide uppercase">
                        24 Modèles Inédits
                      </h4>
                      <p className="text-xs text-white/70 leading-relaxed mt-1">
                        Zéro objet recyclé du catalogue standard ! Toutes les pièces ont été spécialement modélisées pour ce calendrier et ne sont vendues nulle part ailleurs.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-red-200/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Zéro doublon garanti</span>
                  </div>
                </div>

                {/* Atout 2: 80€ de valeur réelle */}
                <div className="bg-gradient-to-b from-[#22070d]/90 to-black/70 border border-amber-500/30 rounded-3xl p-5 hover:border-amber-400 hover:shadow-xl hover:shadow-red-950/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-3 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-rose-600/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md">
                        <Award className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        -40% d'économie
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base font-antonio tracking-wide uppercase">
                        +80 € de Valeur Réelle
                      </h4>
                      <p className="text-xs text-white/70 leading-relaxed mt-1">
                        À 45 € en Early Bird, chaque création revient à moins de 1,90 € pièce, alors que leur valeur individuelle en boutique oscille entre 3,50 € et 8,00 €.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-amber-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Le meilleur deal de l'année</span>
                  </div>
                </div>

                {/* Atout 3: 100% fait en France */}
                <div className="bg-gradient-to-b from-[#1c060b]/90 to-black/70 border border-white/20 rounded-3xl p-5 hover:border-white/40 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-3 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600/30 via-white/10 to-rose-600/20 border border-white/30 flex items-center justify-center text-white shadow-md">
                        <Printer className="w-5 h-5 text-white group-hover:-rotate-12 transition-transform" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-white bg-white/15 px-2.5 py-0.5 rounded-full border border-white/30">
                        🇫🇷 Made in France
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base font-antonio tracking-wide uppercase">
                        Artisanat & Impression 3D
                      </h4>
                      <p className="text-xs text-white/70 leading-relaxed mt-1">
                        Pas d'importation de masse : chaque figurine et fidget est imprimé couche par couche et vérifié à la main dans notre atelier en France.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Contrôle qualité pièce par pièce</span>
                  </div>
                </div>

                {/* Atout 4: PLA Végétal */}
                <div className="bg-gradient-to-b from-[#1a050a]/90 to-black/70 border border-red-500/30 rounded-3xl p-5 hover:border-red-400 hover:shadow-xl hover:shadow-red-950/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-3 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600/30 to-amber-600/20 border border-red-500/40 flex items-center justify-center text-red-300 shadow-md">
                        <Leaf className="w-5 h-5 text-red-300 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-red-200 bg-red-500/20 px-2.5 py-0.5 rounded-full border border-red-500/30">
                        Biosourcé
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base font-antonio tracking-wide uppercase">
                        Matière Végétale Saine
                      </h4>
                      <p className="text-xs text-white/70 leading-relaxed mt-1">
                        Imprimé exclusivement en PLA issu de ressources renouvelables (amidon de maïs). Sans odeur toxique, solide, lisse et agréable à manipuler au quotidien.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-rose-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Sans pétrole ni solvants nocifs</span>
                  </div>
                </div>

                {/* Atout 5: Rituel Magique & Kit DIY */}
                <div className="bg-gradient-to-b from-[#18080c]/90 to-black/70 border border-red-500/40 rounded-3xl p-5 hover:border-red-400 hover:shadow-xl hover:shadow-red-950/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-3 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600/30 to-amber-600/20 border border-red-500/40 flex items-center justify-center text-red-300 shadow-md">
                        <Gift className="w-5 h-5 text-red-300 group-hover:rotate-6 transition-transform" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-red-300 bg-red-500/20 px-2.5 py-0.5 rounded-full border border-red-500/30">
                        Kit Déco Inclus
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base font-antonio tracking-wide uppercase">
                        Un Rituel Poétique
                      </h4>
                      <p className="text-xs text-white/70 leading-relaxed mt-1">
                        24 sachets kraft numérotés, fournis avec de la cordelette de jute et 24 mini-pinces en bois pour créer une authentique guirlande de l'Avent.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-red-200/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Décoration festive prête à poser</span>
                  </div>
                </div>

                {/* Atout 6: Livraison Garantie avant Décembre */}
                <div className="bg-gradient-to-b from-[#20070e]/90 to-black/70 border border-red-500/35 rounded-3xl p-5 hover:border-red-400 hover:shadow-xl hover:shadow-red-950/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-3 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600/30 to-amber-600/20 border border-red-500/40 flex items-center justify-center text-red-300 shadow-md">
                        <Truck className="w-5 h-5 text-red-300 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-red-200 bg-red-500/20 px-2.5 py-0.5 rounded-full border border-red-500/30">
                        Départ Mi-Nov.
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base font-antonio tracking-wide uppercase">
                        Garanti Avant le 1er Décembre
                      </h4>
                      <p className="text-xs text-white/70 leading-relaxed mt-1">
                        Toutes les précommandes sont expédiées mi-novembre en emballage carton kraft renforcé avec numéro de suivi. Zéro stress, votre calendrier sera là à l'heure.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-rose-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Livraison Colissimo ou Point Relais</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MARKETING SECTION 2: LE RENDEZ-VOUS VIDÉO CHAQUE MATIN */}
            <div className="bg-gradient-to-b from-[#24080e]/95 via-[#180509]/95 to-[#0e0205]/95 border-2 border-red-500/35 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <span className="text-xs font-mono font-bold text-red-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-red-400" />
                    <span>Rendez-vous Quotidien du 1er au 24 Décembre</span>
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black font-antonio uppercase tracking-wide text-white mt-1">
                    Chaque matin, découvrez la surprise en mini-vidéo !
                  </h3>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-red-600/20 border border-red-500/40 text-xs font-mono text-red-200 font-bold self-start md:self-auto">
                  <span>🎬 24 Vidéos Inédites</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3.5 bg-black/50 border border-red-500/25 rounded-2xl p-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600/30 to-rose-600/20 border border-red-500/40 flex items-center justify-center text-red-300 shrink-0 shadow-md">
                    <Play className="w-6 h-6 text-red-300 fill-red-300/40 ml-0.5" />
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-white text-base font-antonio tracking-wide uppercase">
                      Une mini-vidéo de déballage par jour
                    </h5>
                    <p className="text-xs text-white/75 leading-relaxed">
                      Chaque matin à 8h, nous ouvrirons la case du jour en direct de l'atelier ! Vous découvrirez la création en action, ses mouvements, sa couleur et ses secrets de conception.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-black/50 border border-amber-500/25 rounded-2xl p-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-rose-600/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 shadow-md">
                    <Eye className="w-6 h-6 text-amber-300" />
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-white text-base font-antonio tracking-wide uppercase">
                      Accès 100% gratuit pour voir ce que vous ratez
                    </h5>
                    <p className="text-xs text-white/75 leading-relaxed">
                      Même si vous n'avez pas commandé votre calendrier à temps, toute la communauté pourra regarder gratuitement chaque déballage ici même... et mesurer tout ce que vous avez manqué ! 😉
                    </p>
                  </div>
                </div>
              </div>

              {/* Bonus Accessories Included Banner */}
              <div className="bg-gradient-to-r from-red-600/20 via-rose-600/15 to-transparent border border-red-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✨</div>
                  <div>
                    <span className="font-bold text-white block font-mono">
                      + Tout le kit physique prêt à suspendre pour les précommandes :
                    </span>
                    <span className="text-white/80">
                      24 créations 3D exclusives sous sachets kraft numérotés scellés + cordelette de jute naturelle + 24 pinces en bois.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MARKETING SECTION 3: URGENCE & ÉDITION LIMITÉE + REASSURANCE CTA */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#2a070f]/95 via-[#1c050a]/95 to-[#120206]/95 border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-200 font-mono font-bold text-xs">
                    <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    <span>Série Limitée à 50 Exemplaires Seulement</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black font-antonio uppercase tracking-wide text-white">
                    Profitez des conditions de lancement
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200/80 leading-relaxed font-light">
                    Pour garantir un travail artisanal irréprochable et un emballage soigné à la main, notre atelier limite strictement la production à <strong>50 coffrets au total</strong> cette année.
                  </p>
                  <ul className="text-xs text-rose-200/90 space-y-1 font-mono pt-1">
                    <li>• <strong>Jusqu'au 30 Septembre :</strong> 45 € + <strong>25ème cadeau exclusif</strong> inclus</li>
                    <li>• <strong>Du 1er au 15 Octobre :</strong> 45 € (remisé, sans 25ème cadeau)</li>
                    <li>• <strong>À partir du 16 Octobre :</strong> 50 € (tarif normal)</li>
                  </ul>
                </div>

                <div className="shrink-0 space-y-2 text-center">
                  <button
                    onClick={handlePreorder}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-xl shadow-red-600/40 border border-white/20 flex items-center justify-center gap-3 cursor-pointer active:scale-95 group"
                  >
                    <Gift className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                    <span>Réserver Mon Calendrier ({currentPrice.toFixed(2)} €)</span>
                  </button>
                  <p className="text-[11px] font-mono text-rose-200/80">
                    ⚡ Expédition garantie mi-novembre 2026
                  </p>
                </div>
              </div>
            </div>

            {/* MARKETING SECTION 4: FAQ (QUESTIONS FRÉQUENTES) */}
            <div className="space-y-4 pt-2">
              <div className="text-center space-y-1">
                <span className="text-xs font-mono font-bold text-red-300 uppercase tracking-widest">
                  Besoin d'en savoir plus ?
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-antonio uppercase tracking-wide text-white">
                  Questions Fréquentes sur le Calendrier
                </h3>
              </div>

              <div className="space-y-2.5 max-w-3xl mx-auto">
                {[
                  {
                    q: "Quelles sont les conditions et dates clés de précommande ?",
                    a: "La production est plafonnée à 50 exemplaires : 1) Jusqu'au 30 septembre, vous bénéficiez du tarif remisé à 45 € et un 25ème cadeau exclusif est offert dans votre coffret. 2) Du 1er au 15 octobre, le tarif reste remisé à 45 € mais le 25ème cadeau n'est plus inclus. 3) À partir du 16 octobre, le calendrier passe à son tarif standard de 50 € dans la limite des 50 pièces disponibles.",
                  },
                  {
                    q: "À quel public s'adresse ce calendrier de l'Avent ?",
                    a: "Ce calendrier est pensé pour séduire tous les âges ! Les enfants (dès 4-5 ans) adoreront la découverte des petits animaux articulés et des objets rigolos, tandis que les adolescents et adultes apprécieront les fidgets tactiles, les mécanismes anti-stress et les créations originales pour leur bureau.",
                  },
                  {
                    q: "Quand vais-je recevoir mon calendrier de l'Avent ?",
                    a: "Toutes les commandes en livraison seront expédiées jusqu'à mi-novembre 2026 avec numéro de suivi afin de garantir une réception bien avant le 1er décembre. Si vous préférez venir le récupérer directement à notre atelier à Comines, le retrait sur place reste possible jusqu'au 1er décembre !",
                  },
                  {
                    q: "Y a-t-il des doublons ou des objets déjà vendus sur le site ?",
                    a: "Aucun doublon ! Les 24 créations sont toutes rigoureusement distinctes et ont été spécialement conçues pour ce coffret. Vous ne trouverez aucun de ces modèles dans la boutique standard de Spoolio.",
                  },
                  {
                    q: "Comment s'installe le calendrier dans la maison ?",
                    a: "C'est un véritable kit déco ! Vous recevez les 24 sachets kraft numérotés scellés, une bobine de cordelette naturelle en jute et 24 mini-pinces en bois. Vous pouvez accrocher la guirlande le long d'une rampe d'escalier, sur une branche de sapin ou sur un mur.",
                  },
                  {
                    q: "Quels sont les frais de livraison pour le calendrier ?",
                    a: "Vous pouvez choisir la livraison à domicile par Colissimo ou en Point Relais (Mondial Relay / Shop2Shop). De plus, comme le panier dépasse 40 €, vous profitez automatiquement de la livraison offerte en Point Relais !",
                  },
                ].map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-[#180509]/80 border border-red-500/25 hover:border-red-500/50 rounded-2xl overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-white text-xs sm:text-sm">{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-red-400 shrink-0 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 pt-1 text-xs text-white/80 leading-relaxed border-t border-white/5 font-sans">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Locked Grid Teaser Banner */}
            <div className="text-center pt-4 border-t border-white/10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/60 border border-red-500/30 text-xs font-mono text-red-200">
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>La grille des 24 fenêtres s'ouvrira du 1er au 24 Décembre</span>
              </div>
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
                        ? "bg-gradient-to-b from-red-700/60 via-amber-950/40 to-black border-2 border-amber-300 shadow-2xl shadow-red-600/40 scale-[1.03] col-span-2 sm:col-span-1"
                        : "bg-gradient-to-b from-red-950/60 via-black to-red-950/40 border-2 border-red-500/50 shadow-lg"
                      : isUnlocked
                      ? isOpen
                        ? "bg-gradient-to-b from-red-950/50 via-black/90 to-rose-950/40 border-red-400/60 shadow-xl shadow-red-600/20 scale-[1.02]"
                        : "bg-gradient-to-b from-red-950/40 via-black/80 to-[#180509]/80 border-red-500/50 hover:border-red-400 hover:shadow-2xl hover:shadow-red-600/30 hover:-translate-y-1.5"
                      : "bg-[#140407]/80 border-red-500/20 hover:border-red-500/40 opacity-80"
                  }`}
                >
                  {/* Decorative Christmas Box Ribbon Overlay for unopened doors */}
                  {!isOpen && (
                    <>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-full bg-gradient-to-b from-red-500/60 via-amber-300/40 to-transparent pointer-events-none" />
                      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-1.5 bg-gradient-to-r from-red-500/60 via-amber-300/40 to-transparent pointer-events-none" />
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
                            ? "bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 text-white shadow-md shadow-red-600/40"
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
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-red-600/25 text-red-200 border-red-500/40 animate-pulse"
                        }`}
                      >
                        {isOpen ? "Ouvert ✨" : "Débloqué 🎁"}
                      </span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-white/40" />
                    )}
                  </div>

                  {/* Door Center Content */}
                  <div className="my-2 z-10 text-center flex flex-col items-center justify-center min-h-[70px]">
                    {isUnlocked ? (
                      isOpen ? (
                        <div className="space-y-1">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden relative border-2 border-red-500/40 mx-auto shadow-md">
                            {obj.imageUrl ? (
                              <Image src={obj.imageUrl} alt={obj.title} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm">🎁</div>
                            )}
                          </div>
                          <h4 className="text-[11px] font-bold text-white line-clamp-1 mt-1 font-antonio">
                            {obj.title}
                          </h4>
                        </div>
                      ) : (
                        <div className="space-y-1 group-hover:scale-110 transition-transform">
                          <div className="relative inline-block">
                            <Gift className="w-9 h-9 text-red-400 mx-auto drop-shadow-lg" />
                            <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-spin" />
                          </div>
                          <span className="text-[10px] text-red-300 font-extrabold block tracking-wider font-mono">
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
                    <div className="text-[9px] text-white/80 italic line-clamp-2 bg-black/80 p-1.5 rounded-xl border border-red-500/30 backdrop-blur-sm z-10 font-sans">
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
          <div className="bg-gradient-to-b from-[#24080e] via-[#160408] to-[#0c0204] border-2 border-red-500/60 rounded-3xl p-6 max-w-lg w-full space-y-5 relative shadow-2xl shadow-red-950/60">
            {/* Close button */}
            <button
              onClick={() => setSelectedObject(null)}
              className="absolute top-4 right-4 p-2 rounded-2xl bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-all z-20 border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Day Pill */}
            <div className="flex items-center gap-3">
              <span className="px-4 py-1 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-xs font-mono shadow-md">
                🎅 JOUR {selectedObject.day} DE NOËL
              </span>
              <span className="text-xs font-mono text-rose-300 font-bold uppercase tracking-wider">
                {selectedObject.category}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-black text-white font-antonio tracking-wide leading-tight">
              {selectedObject.title}
            </h2>

            {/* Object Image Preview */}
            <div className="w-full h-60 rounded-2xl overflow-hidden bg-black/60 border-2 border-red-500/40 relative shadow-2xl">
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
            <div className="bg-white/5 border border-red-500/20 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] text-red-200/80 font-mono block uppercase font-bold">Couleur</span>
              <span className="font-bold text-white block text-xs">{selectedObject.filamentColor}</span>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-red-300 font-mono uppercase block">
                ✨ Histoire de la création :
              </span>
              <p className="text-xs text-white/90 leading-relaxed bg-black/50 p-3.5 rounded-2xl border border-white/10">
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
                className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95"
              >
                <Heart className="w-4 h-4 fill-white text-white animate-bounce" />
                <span>J'aime ({selectedObject.likesCount || 0})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
