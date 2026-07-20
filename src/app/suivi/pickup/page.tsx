"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function PickupConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id");
  const slot = searchParams.get("slot");
  const email = searchParams.get("email");

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!id || !slot || !email) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders/pickup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, slot, email })
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Impossible de confirmer le créneau.");
      }
    } catch (e) {
      setError("Erreur de connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  if (!id || !slot || !email) {
    return (
      <div className="text-center py-12 max-w-md mx-auto font-sans">
        <span className="text-red-400 text-3xl">⚠️</span>
        <h2 className="text-xl font-bold mt-4 text-white">Lien invalide</h2>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          Ce lien de confirmation de créneau est incomplet ou expiré. Veuillez vérifier l'e-mail reçu.
        </p>
      </div>
    );
  }

  const formattedDate = new Date(slot).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short"
  });

  return (
    <div className="max-w-xl mx-auto w-full px-6 py-12 font-sans flex flex-col items-center justify-center min-h-[50vh] no-invert select-none">
      {success ? (
        <div className="text-center space-y-4 animate-reveal">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center text-3xl mx-auto">
            ✓
          </div>
          <h2 className="text-2xl font-black font-antonio uppercase tracking-tight text-white">
            Créneau Confirmé !
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
            Votre créneau de retrait à l'Atelier pour le <strong>{formattedDate}</strong> est validé. Votre commande <strong>{id}</strong> est prête à vous attendre.
          </p>
          <button
            onClick={() => router.push(`/suivi?id=${id}&email=${encodeURIComponent(email)}`)}
            className="mt-6 px-6 py-2.5 bg-white text-black hover:bg-gray-150 transition-colors font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
          >
            Suivre ma commande 📦
          </button>
        </div>
      ) : (
        <div className="w-full bg-[#131316]/50 border border-[#222225] p-8 rounded-[32px] shadow-2xl space-y-6">
          <div className="text-center">
            <span className="bg-[#ff4f00]/10 text-[#ff4f00] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-[#ff4f00]/20 inline-block">
              Click & Collect 📅
            </span>
            <h2 className="text-2xl font-black font-antonio uppercase tracking-tight text-white mt-4">
              Nouveau créneau proposé
            </h2>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Pour votre commande <strong>{id}</strong>, notre équipe vous propose le créneau horaire suivant :
            </p>
          </div>

          <div className="bg-black/50 border border-white/5 rounded-2xl p-6 text-center shadow-inner">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
              Date & Heure proposées
            </span>
            <span className="text-lg font-black text-[#ff4f00] block mt-1.5 leading-none">
              {formattedDate}
            </span>
          </div>

          {error && (
            <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-xl text-center leading-normal">
              ⚠️ {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full h-12 flex items-center justify-center bg-[#ff4f00] hover:bg-[#e04500] disabled:bg-[#ff4f00]/50 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-[#ff4f00]/25"
            >
              {loading ? "Confirmation..." : "Valider ce créneau de retrait"}
            </button>
            <button
              onClick={() => router.push(`/suivi?id=${id}&email=${encodeURIComponent(email)}`)}
              className="w-full h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              Voir le suivi de commande
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PickupConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between selection:bg-[#ff4f00] selection:text-white">
      <Header className="h-24 flex items-center justify-between px-6 max-w-[1200px] mx-auto w-full no-invert" />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-xs text-gray-500 font-bold uppercase tracking-widest font-sans">
            Chargement...
          </div>
        </div>
      }>
        <PickupConfirmationContent />
      </Suspense>
      <Footer />
    </div>
  );
}
