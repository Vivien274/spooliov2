"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Gift,
  Sparkles,
  Check,
  Copy,
  Heart,
  Mail,
  User,
  CreditCard,
  Flame,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";

const PRESET_AMOUNTS = [10, 25, 50, 100];

function GiftCardContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const codeParam = searchParams.get("code");
  const amountParam = searchParams.get("amount");

  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [isForRecipient, setIsForRecipient] = useState<boolean>(true);
  const [buyerName, setBuyerName] = useState<string>("");
  const [buyerEmail, setBuyerEmail] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const effectiveAmount = isCustom
    ? parseFloat(customAmount) || 0
    : selectedAmount;

  const handleCopyCode = () => {
    if (codeParam) {
      navigator.clipboard.writeText(codeParam);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (effectiveAmount < 5 || effectiveAmount > 500) {
      setError("Le montant de la carte cadeau doit être compris entre 5€ et 500€.");
      return;
    }

    if (!buyerEmail || !buyerEmail.includes("@")) {
      setError("Veuillez renseigner votre adresse email.");
      return;
    }

    if (isForRecipient && recipientEmail && !recipientEmail.includes("@")) {
      setError("L'adresse email du destinataire est invalide.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/gift-card/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: effectiveAmount,
          buyerName,
          buyerEmail,
          recipientName: isForRecipient ? recipientName : null,
          recipientEmail: isForRecipient ? recipientEmail : null,
          customMessage: isForRecipient ? customMessage : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "Impossible d'initier l'achat de la carte cadeau.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070709] text-white font-sans flex flex-col items-center selection:bg-[#ff4f00] selection:text-black overflow-x-hidden">
      <Header />

      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#ff4f00]/10 rounded-full blur-[150px] pointer-events-none z-0" />

      <main className="w-full max-w-[1100px] px-4 pt-28 pb-20 relative z-10 flex flex-col items-center">
        {/* Banner Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4f00]/15 text-[#ff4f00] border border-[#ff4f00]/30 text-xs font-black uppercase tracking-widest mb-4">
            <Gift className="w-4 h-4 text-[#ff4f00]" />
            <span>OFFREZ LE CHOIX SPUNKY &amp; ÉCO</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight font-antonio text-white">
            La Carte Cadeau Spoolio 3D
          </h1>
          <p className="text-sm text-gray-300 font-medium mt-3 leading-relaxed">
            Fidgets anti-stress, accessoires gaming, créations articulées et objets personnalisables. Valable 1 an sur tout le site !
          </p>
        </div>

        {/* ============================================================ */}
        {/* SUCCESS SCREEN STATE                                          */}
        {/* ============================================================ */}
        {success && codeParam ? (
          <div className="w-full max-w-xl bg-[#0f0f16] border border-white/20 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight text-white font-antonio">
                Carte Cadeau Activée ! 🎉
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Un e-mail de confirmation a été envoyé. Voici votre code unique :
              </p>
            </div>

            {/* Code Box */}
            <div className="w-full bg-black/60 border-2 border-dashed border-[#ff4f00]/60 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ff4f00]">
                  CODE CARTE CADEAU ({amountParam || "25"}€)
                </span>
                <strong className="text-xl sm:text-2xl font-mono font-black text-white tracking-widest truncate">
                  {codeParam}
                </strong>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 border border-white/20 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copié !" : "Copier"}</span>
              </button>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full">
              <Link
                href="/boutique"
                className="flex-1 py-3 px-6 rounded-xl bg-[#ff4f00] hover:bg-[#ff4f00]/90 text-white font-black text-xs uppercase tracking-wider text-center transition-all shadow-lg shadow-[#ff4f00]/25"
              >
                Utiliser dans la boutique
              </Link>
              <button
                type="button"
                onClick={() => (window.location.href = "/carte-cadeau")}
                className="py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider text-center transition-all border border-white/15"
              >
                Acheter une autre carte
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* PURCHASE FORM & PREVIEW STATE                                 */
          /* ============================================================ */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: LIVE CARD PREVIEW (Col 1 to 5) */}
            <div className="lg:col-span-5 sticky top-28 space-y-6">
              <div className="relative w-full aspect-[1.58/1] rounded-3xl overflow-hidden border border-white/25 bg-gradient-to-br from-[#ff4f00] via-[#801700] to-black p-6 flex flex-col justify-between shadow-[0_25px_60px_rgba(255,79,0,0.3)] group">
                {/* Glossy specular reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />

                {/* Card Header */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-white font-antonio">
                      Spoolio 3D
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-white text-black text-xs font-black uppercase tracking-wider shadow-lg">
                    {effectiveAmount.toFixed(2)}€
                  </span>
                </div>

                {/* Card Center Info */}
                <div className="relative z-10 space-y-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-white/70">
                    CARTE CADEAU IMPRESSION 3D
                  </span>
                  {isForRecipient && recipientName ? (
                    <h3 className="text-lg font-black text-white leading-tight">
                      Pour {recipientName}
                    </h3>
                  ) : (
                    <h3 className="text-lg font-black text-white leading-tight">
                      Carte Cadeau Spoolio
                    </h3>
                  )}

                  {isForRecipient && customMessage && (
                    <p className="text-xs text-white/90 italic line-clamp-2 bg-black/30 p-2 rounded-xl border border-white/10">
                      « {customMessage} »
                    </p>
                  )}
                </div>

                {/* Card Footer Code Preview */}
                <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-[10px] font-mono font-bold text-white/80">
                  <span>SPOOLIO-GIFT-XXXX-XXXX</span>
                  <span>100% BIOSOURCÉ</span>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 font-sans">
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Valable 1 an sur l'ensemble de la boutique Spoolio.</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <Zap className="w-4 h-4 text-[#ff4f00] shrink-0" />
                  <span>Utilisable en une ou plusieurs fois jusqu'à épuisement du solde.</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: CONFIGURATION FORM (Col 6 to 12) */}
            <form
              onSubmit={handlePurchase}
              className="lg:col-span-7 bg-[#0d0d12] border border-white/15 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl"
            >
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                  ⚠️ {error}
                </div>
              )}

              {/* Step 1: Choose Amount */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  <span>1. Choisissez le montant</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setIsCustom(false);
                      }}
                      className={`h-12 rounded-xl text-sm font-black transition-all border cursor-pointer ${
                        !isCustom && selectedAmount === amt
                          ? "bg-[#ff4f00] text-white border-[#ff4f00] shadow-lg shadow-[#ff4f00]/30 scale-105"
                          : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {amt} €
                    </button>
                  ))}
                </div>

                {/* Custom Amount Option */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCustom(true)}
                    className={`text-xs font-bold hover:underline transition-colors ${
                      isCustom ? "text-[#ff4f00]" : "text-gray-400"
                    }`}
                  >
                    Ou saisir un montant libre (entre 5€ et 500€)...
                  </button>

                  {isCustom && (
                    <div className="mt-2 relative max-w-xs">
                      <input
                        type="number"
                        min="5"
                        max="500"
                        placeholder="Montant libre (ex: 35)"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full h-11 px-4 pr-8 rounded-xl bg-black/60 border border-white/20 text-white font-bold text-sm focus:outline-none focus:border-[#ff4f00]"
                      />
                      <span className="absolute right-3 top-3 text-sm font-bold text-gray-400">
                        €
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Recipient Type */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  <span>2. Pour qui est cette carte ?</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsForRecipient(true)}
                    className={`h-11 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                      isForRecipient
                        ? "bg-white text-black border-white shadow-md font-extrabold"
                        : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
                    }`}
                  >
                    <Heart className="w-4 h-4 text-[#ff4f00]" />
                    <span>Offrir à un proche</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsForRecipient(false)}
                    className={`h-11 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                      !isForRecipient
                        ? "bg-white text-black border-white shadow-md font-extrabold"
                        : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Pour moi-même</span>
                  </button>
                </div>
              </div>

              {/* Step 3: Details & Personalization */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <label className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  <span>3. Informations de commande</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-400">Votre Nom</span>
                    <input
                      type="text"
                      placeholder="Ex: Camille Dupont"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-[#ff4f00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-400">Votre Email (Acheteur) *</span>
                    <input
                      type="email"
                      required
                      placeholder="votre@email.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-[#ff4f00]"
                    />
                  </div>
                </div>

                {isForRecipient && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-gray-400">Nom du destinataire</span>
                        <input
                          type="text"
                          placeholder="Ex: Alex"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-[#ff4f00]"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-gray-400">Email du destinataire (optionnel)</span>
                        <input
                          type="email"
                          placeholder="alex@email.com"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-[#ff4f00]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-gray-400">Message personnalisé</span>
                      <textarea
                        rows={3}
                        placeholder="Joyeux anniversaire ! Profite bien de tes créations 3D 🎁"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        className="w-full p-4 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-[#ff4f00] resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#ff4f00] to-[#ff7700] hover:scale-[1.01] active:scale-[0.99] text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#ff4f00]/30 transition-all cursor-pointer flex items-center justify-center gap-2 no-invert disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5" />
                <span>
                  {loading ? "Préparation du paiement..." : `Acheter la Carte Cadeau (${effectiveAmount.toFixed(2)}€)`}
                </span>
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function GiftCardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070709] text-white flex items-center justify-center">Chargement...</div>}>
      <GiftCardContent />
    </Suspense>
  );
}
