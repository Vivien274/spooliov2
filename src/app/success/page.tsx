"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
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
      <div className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-md border-b border-[#1f1f23]">
        <Header className="h-24 flex items-center justify-between px-6 max-w-[1200px] mx-auto w-full" />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[600px] w-full mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
        {/* Animated Celebration Icon */}
        <div className="relative w-24 h-24 bg-[#2F3CD9]/10 border border-[#2F3CD9]/30 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-[#2F3CD9]/10 select-none">
          <span className="text-5xl animate-bounce">🎉</span>
          <div className="absolute inset-0 rounded-full border border-dashed border-[#2F3CD9]/40 animate-[spin_20s_linear_infinite]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
          Merci pour votre commande !
        </h1>

        <p className="text-gray-400 text-sm leading-relaxed mb-6 font-sans">
          Votre paiement a été validé avec succès. Nos imprimantes 3D (Berthe, Philomène, Ursule, Godelaine et Claudine) se préparent déjà à fabriquer vos objets fidèlement, couche par couche.
        </p>

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
