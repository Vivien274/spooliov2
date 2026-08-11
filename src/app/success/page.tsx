"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function SuccessPageContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const isSimulated = searchParams.get("simulated") === "true";
  const sessionId = searchParams.get("session_id");

  const [realOrderId, setRealOrderId] = useState<string | null>(null);
  const [loadingOrder, setLoadingOrder] = useState<boolean>(!!sessionId);
  const [loyaltyCard, setLoyaltyCard] = useState<any | null>(null);

  // Clear cart when payment success page loads
  useEffect(() => {
    clearCart();
  }, []);

  // Poll API with retries to resolve the human-readable order ID from the database
  useEffect(() => {
    if (!sessionId) return;
    
    let retries = 0;
    const maxRetries = 6;

    const fetchOrderId = async () => {
      try {
        const res = await fetch(`/api/orders/by-session?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.orderId) {
            setRealOrderId(data.orderId);
            if (data.loyaltyCard) {
              setLoyaltyCard(data.loyaltyCard);
            }
            setLoadingOrder(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load order ID from session:", err);
      }

      if (retries < maxRetries) {
        retries++;
        setTimeout(fetchOrderId, 1200); // Retry every 1.2s to account for Stripe webhook delay
      } else {
        setLoadingOrder(false);
      }
    };

    fetchOrderId();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-spoolio-bg text-white font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-black">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-[600px] w-full mx-auto px-6 pt-28 lg:pt-32 pb-16 flex flex-col items-center justify-center text-center">
        {/* Animated Celebration Icon */}
        <div className="relative w-24 h-24 bg-[#2F3CD9]/10 border border-[#2F3CD9]/30 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-[#2F3CD9]/10 select-none">
          <span className="text-5xl animate-bounce">🎉</span>
          <div className="absolute inset-0 rounded-full border border-dashed border-[#2F3CD9]/40 animate-[spin_20s_linear_infinite]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
          Merci pour votre commande !
        </h1>

        <p className="text-gray-400 text-sm leading-relaxed mb-6 font-sans">
          Votre paiement a été validé avec succès. Vos créations vont bientôt prendre vie couche par couche !
        </p>

        {/* Personal Vivien Message Banner */}
        <div className="w-full mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#ff4f00]/10 to-transparent border border-[#ff4f00]/30 shadow-xl flex items-center gap-4 text-left">
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white p-0.5 border border-[#ff4f00]/40 shrink-0 shadow-md overflow-hidden">
            <Image
              src="/images/vivien-avatar.png"
              alt="Vivien Spoolio"
              fill
              className="object-contain p-1"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm sm:text-base">Vivien de l'Atelier</span>
              <span className="text-[10px] font-mono font-bold text-[#ff4f00] px-2 py-0.5 rounded bg-[#ff4f00]/20 border border-[#ff4f00]/30 uppercase">Créateur 🛠️</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              "Merci infiniment pour ta confiance ! Je fais chauffer les imprimantes 3D tout de suite pour lancer ta commande."
            </p>
          </div>
        </div>

        {/* Dynamic Payment Details */}
        <div className="w-full bg-spoolio-card border border-spoolio-border rounded-2xl p-5 mb-8 text-left flex flex-col gap-3 font-sans">
          <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5">
            <span className="text-gray-500 font-bold uppercase tracking-wider font-sans">Statut</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Paiement validé
            </span>
          </div>

          {sessionId && (
            <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5">
              <span className="text-gray-500 font-bold uppercase tracking-wider font-sans">Commande ID</span>
              <span className="text-gray-300 font-mono select-all truncate max-w-[180px]">
                {loadingOrder ? (
                  <span className="text-gray-500 italic font-sans">Recherche en cours...</span>
                ) : realOrderId ? (
                  realOrderId
                ) : (
                  `${sessionId.slice(0, 18)}...`
                )}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-bold uppercase tracking-wider font-sans">Délai de fabrication</span>
            <span className="text-gray-300 font-semibold font-sans">
              24h à 48h (Comines, France)
            </span>
          </div>
        </div>

        {/* Loyalty Card widget */}
        {loyaltyCard && (() => {
          // Charger la configuration des cadeaux depuis le localStorage si disponible (sinon fallback)
          const currentRewards: Record<number, string> = {
            20: "Porte-clés Clavier Mécanique ⌨️",
            40: "Boîte Canette Cachette Secrète 🥫",
            60: "Capsule Mystère 🧪",
            100: "Super Lot Mystère 🎁"
          };
          if (typeof window !== "undefined") {
            try {
              const saved = localStorage.getItem("spoolio_loyalty_rewards");
              if (saved) {
                const parsed = JSON.parse(saved);
                Object.keys(parsed).forEach(k => {
                  const pts = parseInt(k);
                  if (parsed[pts]?.text) {
                    currentRewards[pts] = parsed[pts].text;
                  }
                });
              }
            } catch (e) {}
          }

          const getNextRewardDetails = (points: number) => {
            if (points < 20) {
              return { target: 20, text: currentRewards[20], diff: 20 - points };
            } else if (points < 40) {
              return { target: 40, text: currentRewards[40], diff: 40 - points };
            } else if (points < 60) {
              return { target: 60, text: currentRewards[60], diff: 60 - points };
            } else if (points < 100) {
              return { target: 100, text: currentRewards[100], diff: 100 - points };
            }
            return null;
          };

          const getPointsAdded = () => {
            if (!loyaltyCard || !realOrderId) return null;
            const latestEvent = loyaltyCard.history?.[0];
            if (latestEvent && latestEvent.reason?.includes(realOrderId)) {
              return latestEvent.points;
            }
            return null;
          };

          const pointsAdded = getPointsAdded();
          const nextReward = getNextRewardDetails(loyaltyCard.points);
          const progressPercent = nextReward ? Math.min(100, (loyaltyCard.points / nextReward.target) * 100) : 100;

          return (
            <div className="w-full bg-gradient-to-br from-[#ff4f00]/10 via-[#2F3CD9]/10 to-black border border-[#ff4f00]/20 rounded-2xl p-5 mb-8 text-left font-sans shadow-xl relative overflow-hidden group select-none">
              {/* Background lighting */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#ff4f00]/10 filter blur-[20px] pointer-events-none" />
              
              {/* Header info */}
              <div className="flex items-center gap-2 mb-3.5">
                <span className="text-lg">⚡</span>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">
                    Carte Super-Fan Connectée
                  </h4>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                    Badge ID: {loyaltyCard.id}
                  </p>
                </div>
              </div>

              {/* Points won indicator */}
              <p className="text-xs text-gray-300 mb-4 leading-relaxed font-sans">
                Merci <span className="font-bold text-white">{loyaltyCard.customerName || "l'ami"}</span> ! 
                {pointsAdded && (
                  <> Ton achat vient de créditer <span className="font-black text-[#ff4f00] text-sm px-1">{pointsAdded} points</span> sur ta carte.</>
                )} Solde actuel : <span className="font-black text-white">{loyaltyCard.points} pts</span>.
              </p>

              {/* Progress bar */}
              {nextReward && (
                <div className="space-y-2 mb-4 font-sans">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                    <span>PROGRÈS VERS PALIER {nextReward.target} PTS</span>
                    <span className="text-white font-extrabold">{loyaltyCard.points} / {nextReward.target} PTS</span>
                  </div>
                  
                  {/* Visual Bar */}
                  <div className="w-full h-2.5 bg-white/5 border border-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#ff4f00] to-[#ff9f1c] rounded-full transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Reward detail */}
                  <p className="text-[11px] text-gray-400 leading-normal flex items-start gap-1 font-sans">
                    <span>🎁</span>
                    <span>
                      Plus que <strong className="text-white">{nextReward.diff} points</strong> avant de débloquer : <strong className="text-[#ff4f00]">{nextReward.text}</strong> !
                    </span>
                  </p>
                </div>
              )}

              {/* CTA to interactive 3D Card */}
              <Link 
                href={`/loyalty/${loyaltyCard.id}`}
                className="inline-flex items-center gap-1.5 text-xs text-[#ff4f00] hover:text-white font-bold transition-colors cursor-pointer group-hover:underline font-sans"
              >
                <span>Consulter ma carte 3D interactive</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          );
        })()}

        {/* Simulation Banner warning */}
        {isSimulated && (
          <div className="w-full bg-[#f7eb12]/10 border border-[#f7eb12]/20 text-[#f7eb12] text-[11px] font-semibold px-4 py-3 rounded-xl mb-8 flex items-center gap-2 font-sans select-none animate-pulse">
            <span className="text-sm shrink-0">⚙️</span>
            <span>Mode simulation activé. Aucune transaction réelle n'a été effectuée.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link
            href="/boutique"
            className="flex-1 h-[50px] min-h-[50px] inline-flex items-center justify-center text-xs font-bold text-black bg-white hover:bg-gray-100 rounded-xl transition-all shadow-lg cursor-pointer font-sans"
          >
            Retourner à la boutique
          </Link>
          <Link
            href="/"
            className="flex-1 h-[50px] min-h-[50px] inline-flex items-center justify-center text-xs font-bold text-gray-300 bg-spoolio-card border border-spoolio-border hover:border-white/40 hover:text-white rounded-xl transition-all cursor-pointer font-sans"
          >
            Page d'accueil
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-spoolio-bg text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-[#ff4f00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Enregistrement de la commande...</span>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
