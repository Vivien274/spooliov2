"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Award,
  Search,
  Sparkles,
  Gift,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShoppingBag,
  Star,
  Clock,
  Info
} from "lucide-react";

interface LoyaltyCard {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  points: number;
  maxPoints: number;
  createdAt: string;
  history?: any[];
}

import { useCart } from "@/context/CartContext";

export default function LoyaltyRootPage() {
  const { addToCart } = useCart();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<LoyaltyCard | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleClaimReward = (r: typeof rewards[0]) => {
    if (!card) return;
    addToCart(
      {
        productId: -9900 - r.tier,
        name: `🎁 [Cadeau Club Spoolio] ${r.text}`,
        slug: "cadeau-fidelite",
        price: "0.00",
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&auto=format&fit=crop&q=80",
        selectedOptions: {
          "Palier": `${r.tier} points`,
          "Carte Spoolio": card.id.substring(0, 14)
        },
        isLoyaltyReward: true,
        rewardPointsCost: r.tier,
        loyaltyCardId: card.id
      },
      1,
      true
    );
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
  };

  const rewards = [
    {
      tier: 20,
      text: "Porte-clés Clavier Mécanique ⌨️",
      description: "Un véritable switch mécanique monté sur un mini-support 3D. Le fidget le plus cliquable de ta journée !",
      value: 5,
      icon: "⌨️"
    },
    {
      tier: 40,
      text: "Boîte Canette Cachette Secrète 🥫",
      description: "Une canette ultra-stylée entièrement imprimée en 3D avec un pas de vis invisible pour ranger tes secrets.",
      value: 8,
      icon: "🥫"
    },
    {
      tier: 60,
      text: "Capsule Mystère 🧪",
      description: "Un objet exclusif tout juste sorti des imprimantes de l'atelier Spoolio !",
      value: 10,
      icon: "🧪"
    },
    {
      tier: 100,
      text: "Super Lot Mystère 🎁",
      description: "Le coffret collector ultime pour les passionnés avec créations rares et surprises !",
      value: 15,
      icon: "🎁"
    }
  ];

  // Auto-search saved email on load if present in localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("spoolio_customer_loyalty_email");
    if (savedEmail) {
      setQuery(savedEmail);
      handleSearch(savedEmail);
    }
  }, []);

  const handleSearch = async (searchTerm?: string) => {
    const q = (searchTerm || query).trim();
    if (!q) return;

    setLoading(true);
    setErrorMsg("");
    setCard(null);

    try {
      const res = await fetch(`/api/loyalty?id=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (res.ok && data.success && data.card) {
        setCard(data.card);
        localStorage.setItem("spoolio_customer_loyalty_email", data.card.customerEmail || q);
        if (data.card.points >= 20) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }
      } else {
        setErrorMsg("Aucune carte de fidélité n'est encore associée à cette adresse e-mail ou cet identifiant.");
      }
    } catch (err) {
      setErrorMsg("Erreur lors de la recherche. Veuillez rééssayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d10] text-white flex flex-col font-sans selection:bg-[#ff4f00] selection:text-white">
      <Header />

      <main className="flex-1 pt-28 pb-20 px-4 max-w-5xl mx-auto w-full">
        {/* Banner Hero */}
        <section className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#ff4f00]/20 via-[#005cff]/20 to-transparent blur-3xl rounded-full -z-10 pointer-events-none" />
          
          {/* Mascotte Spoolio */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-4 relative group">
            <img
              src="/images/spoolio-mascot.png"
              alt="Mascotte Spoolio"
              className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(255,79,0,0.45)] group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-[#ff4f00] uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Club Spoolio & Programme Fidélité</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight font-antonio mb-4">
            Consulter mon <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f00] via-orange-400 to-[#005cff]">Solde de Tampons</span>
          </h1>
          
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto font-medium">
            Entrez votre adresse e-mail ou scannez votre QR Code pour découvrir vos points accumulés et débloquer vos récompenses exclusives.
          </p>
        </section>

        {/* Formulaire de Recherche */}
        <div className="max-w-xl mx-auto mb-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-2.5 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: laura@gmail.com ou spoolio-abc123"
                className="w-full pl-12 pr-4 py-3.5 bg-transparent text-white placeholder-gray-500 font-medium text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#ff4f00] to-orange-500 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#ff4f00]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Vérifier</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 text-gray-300 text-xs font-medium text-center flex flex-col items-center gap-2.5 shadow-xl"
            >
              <div className="w-9 h-9 rounded-full bg-[#ff4f00]/15 border border-[#ff4f00]/30 flex items-center justify-center text-[#ff4f00]">
                <Info className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-sm">{errorMsg}</span>
              <p className="text-gray-400 text-xs max-w-md leading-relaxed">
                💡 <strong className="text-gray-200">Pas d'inquiétude !</strong> Votre carte de fidélité sera <span className="text-[#ff4f00] font-semibold">automatiquement créée</span> avec vos premiers points attribués dès votre première commande sur Spoolio.fr ou lors de votre passage sur l'un de nos stands !
              </p>
            </motion.div>
          )}
        </div>

        {/* Affichage de la carte si trouvée */}
        <AnimatePresence>
          {card && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#181820] to-[#101016] border border-[#ff4f00]/30 shadow-2xl shadow-[#ff4f00]/10 relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff4f00] font-bold">
                    Carte Spoolio Club • N° {card.id.substring(0, 14)}
                  </span>
                  <h2 className="text-2xl font-black text-white font-antonio uppercase tracking-wide">
                    {card.customerName || card.customerEmail || "Membre Spoolio"}
                  </h2>
                  {card.customerEmail && (
                    <p className="text-xs text-gray-400">{card.customerEmail}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                  <Award className="w-8 h-8 text-[#ff4f00]" />
                  <div>
                    <div className="text-2xl font-black text-white leading-none font-antonio">
                      {card.points} <span className="text-xs text-gray-400 font-sans font-normal">pts</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Solde Actuel</span>
                  </div>
                </div>
              </div>

              {/* Barre de progression vers le prochain palier */}
              <div className="py-6">
                {(() => {
                  const nextReward = rewards.find(r => r.tier > card.points) || rewards[rewards.length - 1];
                  const prevTier = [...rewards].reverse().find(r => r.tier <= card.points)?.tier || 0;
                  const progressPct = Math.min(100, Math.max(0, ((card.points - prevTier) / (nextReward.tier - prevTier)) * 100));

                  return (
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-gray-300">Prochain palier : {nextReward.text}</span>
                        <span className="text-[#ff4f00]">{card.points} / {nextReward.tier} pts</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#ff4f00] via-orange-400 to-[#005cff] transition-all duration-500 shadow-sm"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Raccourci vers la page numérique publique */}
              <div className="flex justify-end pt-2">
                <Link
                  href={`/loyalty/${card.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white hover:underline"
                >
                  <span>Ouvrir ma carte numérique dédiée (QR Code)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Historique récent */}
              {card.history && Array.isArray(card.history) && card.history.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#ff4f00]" />
                    <span>Derniers mouvements de tampons</span>
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {card.history.slice(0, 5).map((h: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                        <div>
                          <span className="font-semibold text-white">{h.reason || "Mouvement de fidélité"}</span>
                          <span className="block text-[10px] text-gray-500">
                            {h.date ? new Date(h.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "Récemment"}
                          </span>
                        </div>
                        <span className={`font-mono font-black text-sm ${String(h.points).startsWith("+") ? "text-emerald-400" : "text-amber-400"}`}>
                          {h.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Explication du Programme & Paliers */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black uppercase font-antonio tracking-tight mb-2">
              Comment accumuler des tampons ?
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Votre fidélité est récompensée aussi bien en ligne que sur nos stands de marché !
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-[#ff4f00]/10 border border-[#ff4f00]/30 flex items-center justify-center text-[#ff4f00] mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">1. Sur la Boutique & les Stands</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Chaque tranche de 2 € dépensés (en ligne sur spoolio.fr ou sur nos marchés physiques) vous rapporte <strong className="text-white">1 tampon</strong>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-[#005cff]/10 border border-[#005cff]/30 flex items-center justify-center text-[#005cff] mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">2. Donnez votre avis</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Laissez un avis sur nos objets ou notre fiche Google pour recevoir des <strong className="text-white">tampons bonus</strong> sur votre carte.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">3. Débloquez vos Cadeaux</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Dès que vous franchissez un palier (20, 40, 60 ou 100 points), réclamez votre cadeau directement à l'atelier ou lors de votre prochaine commande !
              </p>
            </div>
          </div>

          {/* Grille des paliers */}
          <h3 className="text-xl font-black uppercase font-antonio tracking-wider mb-6 text-center">
            🎁 Les Paliers de Récompenses
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rewards.map((r) => {
              const isUnlocked = card ? card.points >= r.tier : false;
              const pointsNeeded = card ? Math.max(0, r.tier - card.points) : r.tier;

              return (
                <div
                  key={r.tier}
                  className={`p-5 sm:p-6 rounded-3xl border transition-all select-none relative overflow-hidden group flex flex-col justify-between gap-4 ${
                    isUnlocked
                      ? "bg-gradient-to-br from-[#121824] via-[#161f30] to-[#0f1420] border-emerald-500/40 text-white shadow-xl shadow-emerald-500/10 hover:border-emerald-400"
                      : "bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  {/* Glowing aura */}
                  {isUnlocked && (
                    <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
                  )}

                  {/* Top Row: Icon + Title & Description + Badges */}
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl border shrink-0 flex items-center justify-center text-2xl shadow-inner ${
                      isUnlocked
                        ? "bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400"
                        : "bg-white/5 border-white/10 text-gray-500"
                    }`}>
                      {r.icon}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2 text-left">
                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full border ${
                          isUnlocked
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-[#ff4f00]/10 text-[#ff4f00] border-[#ff4f00]/25"
                        }`}>
                          Palier {r.tier} points
                        </span>

                        <span className="text-[11px] font-bold text-gray-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                          Valeur : {r.value} €
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-white font-antonio tracking-wide leading-snug">
                        {r.text}
                      </h4>

                      <p className="text-xs text-gray-400 leading-relaxed">{r.description}</p>
                    </div>
                  </div>

                  {/* Bottom Action Row (Full Width Button / Status Bar) */}
                  <div className="pt-3 border-t border-white/10 relative z-10">
                    {isUnlocked ? (
                      <button
                        onClick={() => handleClaimReward(r)}
                        className="w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider py-3 px-4 rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-98 border border-emerald-300/40"
                      >
                        <Gift className="w-4 h-4" />
                        <span>Ajouter au panier</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/10 text-xs font-medium">
                        <span className="text-gray-400">Requis : <strong className="text-gray-200">{r.tier} pts</strong></span>
                        <span className="text-amber-400 font-mono font-bold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-gray-500" />
                          Encore {pointsNeeded} pts manquants
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
