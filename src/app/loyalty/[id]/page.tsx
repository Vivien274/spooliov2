"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles,
  User,
  Smartphone,
  AlertTriangle,
  ArrowRight,
  Mail,
  Check,
  Lock,
  X,
  Gift,
  PartyPopper
} from "lucide-react";

interface LoyaltyCard {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  points: number;
  maxPoints: number;
  createdAt: string;
  history?: any;
}

function getTimelineProgress(points: number, rewards?: Record<number, any>): number {
  if (!rewards) {
    if (points <= 0) return 0;
    if (points >= 100) return 100;
    return (points / 100) * 100;
  }
  const tiers = Object.keys(rewards).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
  if (tiers.length === 0) return 0;
  const maxTier = tiers[tiers.length - 1];
  if (points <= 0) return 0;
  if (points >= maxTier) return 100;

  for (let i = 0; i < tiers.length; i++) {
    const prev = i === 0 ? 0 : tiers[i - 1];
    const curr = tiers[i];
    if (points <= curr) {
      const stepPercent = 100 / tiers.length;
      const progressInStep = (points - prev) / (curr - prev);
      return (i * stepPercent) + (progressInStep * stepPercent);
    }
  }
  return 100;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LoyaltyCardPage({ params }: PageProps) {
  const { id: cardId } = use(params);

  const [card, setCard] = useState<LoyaltyCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Configuration des cadeaux par palier
  const [rewards, setRewards] = useState<Record<number, { text: string; image: string; description: string; value: number }>>({
    20: {
      text: "Porte-clés Clavier Mécanique ⌨️",
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80",
      description: "Le clic le plus satisfaisant de ta journée. Un véritable switch mécanique monté sur un mini-support imprimé en 3D. Le fidget ultime à accrocher à tes clés pour cliquer !",
      value: 5
    },
    40: {
      text: "Boîte Canette Cachette Secrète 🥫",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80",
      description: "L'art du design et du secret. Une canette ultra-stylée entièrement imprimée en 3D avec un mécanisme à vis invisible. Parfaite pour trôner sur ton bureau et cacher tes petits trésors !",
      value: 8
    },
    60: {
      text: "Capsule Mystère 🧪",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80",
      description: "Le frisson de l'inattendu. Un contenant unique qui renferme un secret tout juste sorti de nos imprimantes... On ne te dit rien, mais l'unboxing s'annonce haut en couleur !",
      value: 10
    },
    100: {
      text: "Super Lot Mystère 🎁",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&auto=format&fit=crop&q=80",
      description: "Le coffret ultime pour les passionnés ! Contient un assortiment de filaments rares, d'accessoires et de surprises exclusives.",
      value: 15
    }
  });

  const [selectedReward, setSelectedReward] = useState<any | null>(null);

  // Charger la configuration personnalisée des paliers si présente dans localStorage
  useEffect(() => {
    const saved = localStorage.getItem("spoolio_loyalty_rewards");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const normalized: any = {};
        Object.entries(parsed).forEach(([key, val]) => {
          const numKey = parseInt(key);
          if (val && typeof val === "object") {
            normalized[numKey] = val;
          }
        });
        if (Object.keys(normalized).length > 0) {
          setRewards(normalized);
        }
      } catch (e) {
        console.error("Failed to parse rewards:", e);
      }
    }
  }, []);

  // Charger les données du badge par API locale
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/loyalty?id=${encodeURIComponent(cardId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.card) {
            setCard(data.card);
            setNotFound(false);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Failed to fetch card details:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [cardId]);

  // Choix de la phrase d'encouragement dynamique
  const getMotivationalCopy = (pts: number) => {
    const sortedTiers = Object.keys(rewards)
      .map(Number)
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);

    if (sortedTiers.length === 0) return null;

    const maxTier = sortedTiers[sortedTiers.length - 1];
    if (pts >= maxTier) {
      return (
        <>
          FÉLICITATIONS ! Tu as atteint le palier maximal.<br />Cadeau : <span className="text-[#ff4f00]">{rewards[maxTier]?.text || "Super Cadeau"}</span> ! 🎁
        </>
      );
    }

    const nextTier = sortedTiers.find(t => t > pts);
    if (nextTier) {
      return (
        <>
          Prochain palier à {nextTier} points :<br /><span className="text-[#ff4f00]">{rewards[nextTier]?.text}</span> ! 🚀
        </>
      );
    }

    return null;
  };

  // Squelette de chargement premium
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100 font-sans">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto" />
          <div className="h-6 w-2/3 bg-slate-800 mx-auto rounded-lg" />
          <div className="grid grid-cols-5 gap-3.5 max-w-[280px] mx-auto py-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-slate-800" />
            ))}
          </div>
          <div className="h-3 w-4/5 bg-slate-800 mx-auto rounded-lg" />
          <div className="h-10 w-full bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // Écran Carte inexistante
  if (notFound || !card) {
    return (
      <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-600/5 via-slate-950 to-slate-950 text-slate-100 flex flex-col items-center justify-center p-5 text-center font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center gap-4">
          <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-2xl text-red-500">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-100 tracking-wide uppercase">Carte non détectée</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Ce badge de fidélité n'est pas encore enregistré ou associé dans notre système.
            </p>
          </div>

          <div className="border-t border-slate-800/80 pt-4 w-full text-left text-xs font-semibold text-slate-505 flex flex-col gap-1 font-mono">
            <span>ID : {cardId}</span>
            <span>Statut : En attente d'association par l'Atelier</span>
          </div>

          <a
            href="/"
            className="w-full bg-[#ff4f00] hover:bg-[#ff6a22] text-black text-xs font-bold py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-sans"
          >
            Retourner à la boutique
          </a>
        </div>
      </div>
    );
  }

  const TIERS = [20, 40, 60, 100];
  const nextTier = TIERS.find(t => t > card.points) || TIERS[TIERS.length - 1];

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-600/10 via-slate-950 to-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative selection:bg-orange-500/20 selection:text-orange-300 font-sans">
      
      {/* Conteneur principal (Public Client View) */}
      <main className="w-full max-w-md sm:max-w-lg mx-auto my-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl relative">
        {/* Glow décoratif de fond */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 sm:p-8 flex flex-col items-center gap-7 relative z-10">
          {/* Badge Spoolio */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-500/25 relative group">
            <Smartphone size={32} className="group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-md" />
          </div>

          {/* Salutation Client */}
          <div className="text-center">
            <h2 className="text-slate-100 tracking-tight leading-snug font-sans">
              {card.customerName ? (
                <>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#ff4f00] block mb-1">
                    La carte Spoolio de
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-white block">
                    {card.customerName}
                  </span>
                </>
              ) : (
                <span className="text-xl sm:text-2xl font-black block">
                  Bienvenue dans l'univers Spoolio ! 🌟
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest mt-2">
              Carte de Fidélité NFC Spoolio
            </p>
          </div>

          {/* Solde de points en gros */}
          <div className="text-center py-2 shrink-0">
            <span className="text-6xl sm:text-7xl font-black tracking-tight leading-none bg-gradient-to-r from-orange-400 via-[#ff4f00] to-amber-400 bg-clip-text text-transparent">
              {card.points}
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-300 uppercase tracking-widest block mt-2 font-sans">
              point{card.points > 1 ? "s" : ""} cumulé{card.points > 1 ? "s" : ""}
            </span>
            <span className="text-xs font-semibold text-slate-400 block mt-1 font-sans">
              (2 € dépensés = 1 point)
            </span>
          </div>



          {/* Liste des paliers & cadeaux */}
          <div className="w-full space-y-3.5 my-3 font-sans">
            <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest block mb-1 text-left">
              Paliers de cadeaux à débloquer :
            </span>
            {Object.keys(rewards)
              .map(Number)
              .filter(n => !isNaN(n))
              .sort((a, b) => a - b)
              .map(pts => {
                const r = rewards[pts];
                const completed = card.points >= pts;
                return (
                  <div
                    key={pts}
                    onClick={() => setSelectedReward({ pts, text: r.text, image: r.image || "", description: r.description || "", value: r.value || 0 })}
                    className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none relative ${
                      completed
                        ? "bg-[#111420] border border-[#ff4f00]/50 text-slate-100 shadow-lg shadow-[#ff4f00]/10 hover:border-[#ff4f00]"
                        : "bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {/* Image Miniature + Badge Coche Overlay */}
                    <div className="relative shrink-0">
                      {r.image ? (
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border overflow-hidden bg-slate-950 ${
                          completed ? "border-2 border-[#ff4f00] shadow-md shadow-orange-500/20" : "border-slate-800"
                        }`}>
                          <img src={r.image} alt={`Cadeau fidélité ${r.text}`} className={`w-full h-full object-cover ${completed ? "" : "grayscale opacity-40"}`} />
                        </div>
                      ) : (
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex items-center justify-center bg-slate-950 ${
                          completed ? "border-2 border-[#ff4f00] text-orange-500" : "border-slate-800 text-slate-700"
                        }`}>
                          <Gift size={24} />
                        </div>
                      )}

                      {/* Check badge overlay on thumbnail */}
                      {completed && (
                        <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-[#ff4f00] text-black border-2 border-slate-900 flex items-center justify-center shadow-md">
                          <Check size={13} className="stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Centre : Titre & Infos (full width expansion) */}
                    <div className="flex-1 min-w-0 text-left space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-base sm:text-lg font-black leading-snug ${completed ? "text-white" : "text-slate-300"}`}>
                          {r.text}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <span className={completed ? "text-[#ff4f00]" : "text-slate-500"}>
                          Palier {pts} points
                        </span>
                        {r.value ? (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400">Valeur {r.value} €</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {/* Droite : Badge Statut Compact */}
                    <div className="shrink-0 font-sans">
                      {completed ? (
                        <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
                          <PartyPopper size={13} className="stroke-[2.5]" />
                          Débloqué
                        </span>
                      ) : (
                        <span className="text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-xl border bg-slate-950 border-slate-900 text-slate-500">
                          {pts - card.points} pts
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Copy d'encouragement */}
          <div className="w-full text-center bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-inner">
            <div className="text-sm sm:text-base font-extrabold text-slate-100 leading-relaxed transition-all">
              {getMotivationalCopy(card.points)}
            </div>
          </div>

          {/* Historique des Points */}
          {card.history && Array.isArray(card.history) && card.history.length > 0 && (
            <div className="w-full space-y-2.5 my-2 font-sans">
              <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest block mb-2 text-left">
                Historique de ton activité :
              </span>
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl divide-y divide-slate-800/60 max-h-[180px] overflow-y-auto pr-0.5 scrollbar-none">
                {card.history.map((event: any, idx: number) => {
                  const isPositive = String(event.points).startsWith("+");
                  const isZero = String(event.points) === "0";
                  return (
                    <div key={idx} className="flex items-center justify-between px-4 py-3 text-left font-sans">
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-sm font-extrabold text-slate-200 truncate">
                          {event.reason}
                        </span>
                        <span className="text-xs font-medium text-slate-400 mt-0.5 font-mono">
                          {new Date(event.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <span className={`text-xs sm:text-sm font-black shrink-0 px-2.5 py-1 rounded-xl border ${
                        isPositive
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                          : isZero
                          ? "bg-slate-800/20 border-slate-800/40 text-slate-400"
                          : "bg-red-500/15 border-red-500/30 text-red-400"
                      }`}>
                        {event.points}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lien externe vers boutique */}
          <a
            href="https://spoolio.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-[#ff4f00] hover:text-white transition-colors font-black uppercase tracking-wider flex items-center gap-2 mt-2 py-2 cursor-pointer font-sans"
          >
            Visiter la boutique Spoolio
            <ArrowRight size={14} />
          </a>
        </div>
      </main>

      {/* Modal - Affichage Détails Cadeau */}
      <AnimatePresence>
        {selectedReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              {selectedReward.image && (
                <div className="w-full h-52 relative bg-slate-950 border-b border-slate-800">
                  <img src={selectedReward.image} alt={selectedReward.text} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setSelectedReward(null)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center hover:bg-black transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              <div className="p-6 sm:p-7 space-y-4 text-left font-sans">
                {!selectedReward.image && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-orange-500 uppercase tracking-widest">
                      Détail de la récompense
                    </span>
                    <button
                      onClick={() => setSelectedReward(null)}
                      className="text-gray-400 hover:text-white cursor-pointer"
                    >
                      <X size={22} />
                    </button>
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">
                    {selectedReward.text}
                  </h4>
                  <span className="text-xs font-extrabold text-[#ff4f00] uppercase tracking-widest block mt-1">
                    Palier {selectedReward.pts} Points (Valeur : {selectedReward.value}€)
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {selectedReward.description}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedReward(null)}
                    className="w-full py-3.5 bg-[#ff4f00] hover:bg-[#ff6a22] text-black text-sm font-extrabold rounded-2xl transition-all cursor-pointer font-sans"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
