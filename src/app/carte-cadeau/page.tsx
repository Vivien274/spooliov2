"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Gift,
  Sparkles,
  Check,
  Copy,
  Heart,
  User,
  CreditCard,
  ShieldCheck,
  Zap,
  PartyPopper,
  Gamepad2,
  Smile,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const PRESET_AMOUNTS = [10, 25, 50, 100];

const CARD_THEMES = [
  {
    id: "cosmic",
    name: "Cosmic Aurora",
    bgGradient: "from-indigo-600 via-purple-700 to-pink-600",
    glow: "shadow-[0_25px_60px_rgba(168,85,247,0.45)] border-purple-400/40",
    badgeBg: "bg-purple-500/20 text-purple-200 border-purple-400/30",
    accentColor: "#a855f7",
    textColor: "text-purple-300",
    dot: "bg-purple-500",
  },
  {
    id: "lava",
    name: "Spoolio Lava",
    bgGradient: "from-[#ff4f00] via-[#c02600] to-black",
    glow: "shadow-[0_25px_60px_rgba(255,79,0,0.45)] border-[#ff4f00]/40",
    badgeBg: "bg-[#ff4f00]/20 text-[#ff4f00] border-[#ff4f00]/30",
    accentColor: "#ff4f00",
    textColor: "text-[#ff4f00]",
    dot: "bg-[#ff4f00]",
  },
  {
    id: "cyber",
    name: "Cyber Emerald",
    bgGradient: "from-emerald-600 via-teal-800 to-slate-950",
    glow: "shadow-[0_25px_60px_rgba(16,185,129,0.45)] border-emerald-400/40",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    accentColor: "#10b981",
    textColor: "text-emerald-300",
    dot: "bg-emerald-400",
  },
  {
    id: "candy",
    name: "Candy Pop",
    bgGradient: "from-pink-500 via-rose-500 to-cyan-500",
    glow: "shadow-[0_25px_60px_rgba(244,114,182,0.45)] border-pink-300/40",
    badgeBg: "bg-pink-500/20 text-pink-200 border-pink-300/30",
    accentColor: "#ec4899",
    textColor: "text-pink-300",
    dot: "bg-pink-400",
  },
  {
    id: "chrome",
    name: "Diamond Chrome",
    bgGradient: "from-slate-300 via-zinc-600 to-slate-900",
    glow: "shadow-[0_25px_60px_rgba(255,255,255,0.35)] border-white/40",
    badgeBg: "bg-white/20 text-white border-white/30",
    accentColor: "#ffffff",
    textColor: "text-white",
    dot: "bg-white",
  },
];

const OCCASIONS = [
  { id: "plaisir", label: "Plaisir d'offrir 🎁", icon: Gift },
  { id: "anniversaire", label: "Joyeux Anniversaire 🎂", icon: PartyPopper },
  { id: "gaming", label: "Zone Gaming 🎮", icon: Gamepad2 },
  { id: "merci", label: "Un Grand Merci 💖", icon: Heart },
];

function GiftCardContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const codeParam = searchParams.get("code");
  const amountParam = searchParams.get("amount");

  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [selectedTheme, setSelectedTheme] = useState(CARD_THEMES[0]);
  const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS[0]);

  const [isForRecipient, setIsForRecipient] = useState<boolean>(true);
  const [buyerName, setBuyerName] = useState<string>("");
  const [buyerEmail, setBuyerEmail] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // 3D Motion Tilt Values
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 300, damping: 25 });
  const sheenX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const sheenY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

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

      {/* Dynamic Background Glow changing according to selected theme */}
      <motion.div
        animate={{
          backgroundColor: selectedTheme.accentColor,
          opacity: 0.12,
        }}
        transition={{ duration: 0.8 }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[750px] rounded-full blur-[160px] pointer-events-none z-0"
      />

      <main className="w-full max-w-[1150px] px-4 pt-28 pb-20 relative z-10 flex flex-col items-center">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight font-antonio text-white">
            La Carte Cadeau Spoolio 3D
          </h1>
          <p className="text-sm text-gray-300 font-medium mt-3 leading-relaxed">
            Personalisez votre carte holographique avec le montant et le thème de votre choix. Valable 1 an sur toutes nos créations 3D !
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
            <div className="w-full bg-black/60 border-2 border-dashed border-amber-400/60 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
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
          /* PURCHASE FORM & 3D INTERACTIVE CARD STATE                     */
          /* ============================================================ */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: INTERACTIVE 3D HOLOGRAM CARD (Col 1 to 5) */}
            <div className="lg:col-span-5 sticky top-28 space-y-6">
              {/* 3D Motion Perspective Card */}
              <div
                className="perspective-[1000px] w-full"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <motion.div
                  ref={cardRef}
                  style={{ rotateX, rotateY }}
                  className={`relative w-full aspect-[1.58/1] rounded-3xl overflow-hidden border bg-gradient-to-br ${selectedTheme.bgGradient} p-6 flex flex-col justify-between ${selectedTheme.glow} transition-shadow duration-500 select-none group`}
                >
                  {/* Holographic specular light sweep layer */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent pointer-events-none"
                    style={{
                      opacity: 0.6,
                      backgroundPosition: `${sheenX.get()}% ${sheenY.get()}%`,
                    }}
                  />

                  {/* Shimmer light bar sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                  {/* Card Top Header */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-md">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-white font-antonio">
                        Spoolio 3D
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/40 backdrop-blur-md border border-white/20 text-white">
                        {selectedOccasion.label}
                      </span>
                      <span className="px-3.5 py-1 rounded-full bg-white text-black text-xs font-black uppercase tracking-wider shadow-lg">
                        {effectiveAmount.toFixed(2)}€
                      </span>
                    </div>
                  </div>

                  {/* Card Center Message */}
                  <div className="relative z-10 space-y-1.5 my-auto">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-white/80 font-bold">
                      CARTE CADEAU IMPRESSION 3D
                    </span>
                    {isForRecipient && recipientName ? (
                      <h3 className="text-xl font-black text-white leading-tight font-antonio tracking-tight drop-shadow">
                        Pour {recipientName}
                      </h3>
                    ) : (
                      <h3 className="text-xl font-black text-white leading-tight font-antonio tracking-tight drop-shadow">
                        Carte Cadeau Spoolio
                      </h3>
                    )}

                    {isForRecipient && customMessage && (
                      <p className="text-xs text-white/90 italic line-clamp-2 bg-black/40 backdrop-blur-md p-2.5 rounded-xl border border-white/15 shadow-inner">
                        « {customMessage} »
                      </p>
                    )}
                  </div>

                  {/* Card Footer Code Preview */}
                  <div className="relative z-10 pt-3 border-t border-white/20 flex items-center justify-between text-[10px] font-mono font-bold text-white/80">
                    <span className="tracking-widest">SPOOLIO-XXXX-XXXX</span>
                    <span className="text-[9px] bg-black/30 px-2 py-0.5 rounded-md border border-white/10 uppercase">
                      100% BIOSOURCÉ 🌾
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Theme Palette Switcher Buttons */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Palette className="w-3.5 h-3.5 text-amber-400" /> Thème visuel de la carte
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">{selectedTheme.name}</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {CARD_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(theme)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        selectedTheme.id === theme.id
                          ? "bg-white text-black border-white shadow-md scale-105"
                          : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${theme.dot}`} />
                      <span>{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 font-sans">
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Valable 1 an sur l'ensemble de la boutique Spoolio.</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
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
                          ? "bg-white text-black border-white shadow-lg scale-105"
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
                      isCustom ? "text-amber-400" : "text-gray-400"
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
                        className="w-full h-11 px-4 pr-8 rounded-xl bg-black/60 border border-white/20 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                      />
                      <span className="absolute right-3 top-3 text-sm font-bold text-gray-400">
                        €
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Occasion Picker */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  <span>2. Occasion &amp; Thème</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {OCCASIONS.map((occ) => {
                    const Icon = occ.icon;
                    const isSelected = selectedOccasion.id === occ.id;
                    return (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => setSelectedOccasion(occ)}
                        className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white/15 border-white text-white font-black shadow-md"
                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-gray-400"}`} />
                        <span className="text-[11px] font-bold leading-tight">{occ.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Recipient Type */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  <span>3. Pour qui est cette carte ?</span>
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
                    <Heart className="w-4 h-4 text-pink-500" />
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

              {/* Step 4: Details & Personalization */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <label className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  <span>4. Informations de commande</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-400">Votre Nom</span>
                    <input
                      type="text"
                      placeholder="Ex: Camille Dupont"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
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
                      className="w-full h-11 px-4 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
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
                          className="w-full h-11 px-4 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-gray-400">Email du destinataire (optionnel)</span>
                        <input
                          type="email"
                          placeholder="alex@email.com"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
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
                        className="w-full p-4 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-amber-400 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#ff4f00] hover:scale-[1.01] active:scale-[0.99] text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 no-invert disabled:opacity-50"
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
