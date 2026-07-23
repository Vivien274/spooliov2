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
  Gift
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

function getTimelineProgress(points: number): number {
  if (points <= 0) return 0;
  if (points <= 20) {
    return (points / 20) * 25; // Interpolate between 0% and 25%
  }
  if (points <= 40) {
    return 25 + ((points - 20) / 20) * 25; // Interpolate between 25% and 50%
  }
  if (points <= 60) {
    return 50 + ((points - 40) / 20) * 25; // Interpolate between 50% and 75%
  }
  if (points <= 100) {
    return 75 + ((points - 60) / 40) * 25; // Interpolate between 75% and 100%
  }
  return 100; // Capped at 100%
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
          setRewards(prev => ({ ...prev, ...normalized }));
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
    if (pts >= 100) {
      return (
        <>
          FÉLICITATIONS ! Tu as atteint le palier maximal.<br />Cadeau : <span className="text-[#ff4f00]">{rewards[100]?.text || "Super Lot Mystère"}</span> ! 🎁
        </>
      );
    }
    if (pts >= 60) {
      return (
        <>
          Prochain palier à 100 points :<br /><span className="text-[#ff4f00]">{rewards[100]?.text || "Super Lot Mystère"}</span> ! 🚀
        </>
      );
    }
    if (pts >= 40) {
      return (
        <>
          Prochain palier à 60 points :<br /><span className="text-[#ff4f00]">{rewards[60]?.text || "Support Bobine Premium"}</span> ! 🔥
        </>
      );
    }
    if (pts >= 20) {
      return (
        <>
          Prochain palier à 40 points :<br /><span className="text-[#ff4f00]">{rewards[40]?.text || "Figurine Spoolio"}</span> ! 🛠️
        </>
      );
    }
    return (
      <>
        Prochain palier à 20 points :<br /><span className="text-[#ff4f00]">{rewards[20]?.text || "Porte-clé Spooly"}</span> ! 🦖
      </>
    );
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
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-600/5 via-slate-950 to-slate-950 text-slate-100 flex flex-col justify-between p-4 relative selection:bg-orange-500/20 selection:text-orange-300 font-sans">
      
      {/* Conteneur principal (Public Client View) */}
      <main className="w-full max-w-sm mx-auto my-auto bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl relative">
        {/* Glow décoratif de fond */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 flex flex-col items-center gap-6 relative z-10">
          {/* Badge Spoolio */}
          <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 relative group">
            <Smartphone size={24} className="group-hover:scale-115 transition-transform" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-slate-900 shadow-sm" />
          </div>

          {/* Salutation Client */}
          <div className="text-center">
            <h2 className="text-slate-100 tracking-tight leading-snug font-sans">
              {card.customerName ? (
                <>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-0.5">La carte Spoolio de</span>
                  <span className="text-2xl font-light text-orange-500 block">{card.customerName}</span>
                </>
              ) : (
                <span className="text-base font-black block">Bienvenue dans l'univers Spoolio ! 🌟</span>
              )}
            </h2>
            <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider mt-2">
              Carte de Fidélité NFC Spoolio
            </p>
          </div>

          {/* Solde de points en gros */}
          <div className="text-center py-2 shrink-0">
            <span className="text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              {card.points}
            </span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mt-1.5 font-sans">
              point{card.points > 1 ? "s" : ""} cumulé{card.points > 1 ? "s" : ""}
            </span>
            <span className="text-[9px] font-bold text-slate-500 block mt-1 font-sans">
              (2 € dépensés = 1 point)
            </span>
          </div>

          {/* Timeline Horizontale avec Scroll */}
          <div className="w-full overflow-x-auto pb-6 pt-2 shrink-0 scrollbar-none select-none">
            <div className="w-[460px] px-8 relative">
              <div className="relative w-full h-14">
                <div className="h-1.5 bg-slate-950 border border-slate-800/80 rounded-full w-full absolute top-1/2 -translate-y-1/2 left-0" />
                
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getTimelineProgress(card.points)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-1.5 bg-gradient-to-r from-[#ff4f00] to-amber-500 rounded-full absolute top-1/2 -translate-y-1/2 left-0 shadow-lg shadow-orange-500/20"
                />
                
                {[
                  { pts: 20, pct: 25, image: rewards[20]?.image },
                  { pts: 40, pct: 50, image: rewards[40]?.image },
                  { pts: 60, pct: 75, image: rewards[60]?.image },
                  { pts: 100, pct: 100, image: rewards[100]?.image }
                ].map(milestone => {
                  const active = card.points >= milestone.pts;
                  return (
                    <div
                      key={milestone.pts}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group animate-reveal"
                      style={{ left: `${milestone.pct}%` }}
                      onClick={() => setSelectedReward({ pts: milestone.pts, ...rewards[milestone.pts] })}
                    >
                      {active ? (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          className="w-13 h-13 rounded-full border-2.5 border-orange-500 shadow-lg shadow-orange-500/40 overflow-hidden relative bg-slate-900 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
                        >
                          {milestone.image ? (
                            <img src={milestone.image} alt={`Cadeau Palier ${milestone.pts} points Spoolio`} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-black text-white">{milestone.pts}</span>
                          )}
                          <span className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-25" />
                        </motion.div>
                      ) : (
                        <div className="w-13 h-13 rounded-full bg-slate-950 border border-slate-800 overflow-hidden relative shadow-inner flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                          {milestone.image ? (
                            <img src={milestone.image} alt={`Cadeau Verrouillé ${milestone.pts} points Spoolio`} className="w-full h-full object-cover grayscale opacity-25" />
                          ) : (
                            <span className="text-xs font-black text-slate-600">{milestone.pts}</span>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-950/30">
                            <Lock size={14} className="stroke-[2.5]" />
                          </div>
                        </div>
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-wider absolute top-full mt-3 whitespace-nowrap ${active ? "text-orange-500" : "text-slate-500"} group-hover:text-orange-400 transition-colors`}>
                        {milestone.pts} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Liste des paliers & cadeaux */}
          <div className="w-full space-y-2.5 my-2">
            <span className="text-[9.5px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1 text-left font-sans">
              Paliers de cadeaux à débloquer :
            </span>
            {[
              { pts: 20, text: rewards[20]?.text || "Porte-clé Spooly 🦖", image: rewards[20]?.image },
              { pts: 40, text: rewards[40]?.text || "Figurine Spoolio 🌟", image: rewards[40]?.image },
              { pts: 60, text: rewards[60]?.text || "Support Bobine Premium 🛠️", image: rewards[60]?.image },
              { pts: 100, text: rewards[100]?.text || "Super Lot Mystère 🎁", image: rewards[100]?.image }
            ].map(tier => {
              const completed = card.points >= tier.pts;
              return (
                <div
                  key={tier.pts}
                  onClick={() => setSelectedReward({ pts: tier.pts, text: tier.text, image: tier.image || "", description: rewards[tier.pts]?.description || "", value: rewards[tier.pts]?.value || 0 })}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] hover:border-orange-500/20 active:scale-[0.99] select-none ${
                    completed
                      ? "bg-slate-900/60 border-orange-500/20 text-slate-200 shadow-sm shadow-orange-500/2 hover:bg-slate-900/80"
                      : "bg-slate-950/40 border-slate-800/60 text-slate-550 opacity-60 hover:opacity-85"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 text-left">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      completed
                        ? "bg-orange-500/10 border-orange-500/30 text-orange-500"
                        : "bg-slate-950 border-slate-800 text-slate-600"
                    }`}>
                      {completed ? <Check size={11} className="stroke-[2.5]" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-750" />}
                    </div>
                    
                    {tier.image && (
                      <div className="w-9 h-9 rounded-xl border border-slate-800 overflow-hidden shrink-0 bg-slate-950">
                        <img src={tier.image} alt={`Cadeau fidélité ${tier.text}`} className={`w-full h-full object-cover ${completed ? "" : "grayscale opacity-40"}`} />
                      </div>
                    )}
                    
                    <div className="flex flex-col min-w-0">
                      <span className={`text-xs font-bold leading-tight truncate max-w-[130px] ${completed ? "text-slate-200" : "text-slate-500"}`}>
                        {tier.text}
                      </span>
                      <span className="text-[9.5px] font-semibold text-slate-400 mt-0.5">
                        Palier {tier.pts} points
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 font-sans">
                    <span className={`text-[8.5px] font-black tracking-wider uppercase shrink-0 px-2 py-0.5 rounded-lg border ${
                      completed
                        ? "bg-orange-500/15 border-orange-500/20 text-orange-500"
                        : "bg-slate-950 border-slate-900 text-slate-500"
                    }`}>
                      {completed ? "Débloqué" : `${tier.pts - card.points} pts`}
                    </span>
                    <Sparkles size={10} className="text-slate-500 opacity-40 shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Copy d'encouragement */}
          <div className="w-full text-center bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-inner">
            <p className="text-[11.5px] font-extrabold text-slate-200 leading-relaxed transition-all">
              {getMotivationalCopy(card.points)}
            </p>
          </div>

          {/* Historique des Points */}
          {card.history && Array.isArray(card.history) && card.history.length > 0 && (
            <div className="w-full space-y-2 my-1.5 font-sans">
              <span className="text-[9.5px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1.5 text-left">
                Historique de ton activité :
              </span>
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl divide-y divide-slate-850/40 max-h-[140px] overflow-y-auto pr-0.5 scrollbar-none">
                {card.history.map((event: any, idx: number) => {
                  const isPositive = String(event.points).startsWith("+");
                  const isZero = String(event.points) === "0";
                  return (
                    <div key={idx} className="flex items-center justify-between px-3.5 py-2.5 text-left font-sans">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-extrabold text-slate-300 truncate">
                          {event.reason}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-500 mt-0.5 font-mono">
                          {new Date(event.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black shrink-0 px-2 py-0.5 rounded-lg border ${
                        isPositive
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : isZero
                          ? "bg-slate-800/10 border-slate-800/20 text-slate-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
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
            className="text-[11px] text-[#ff4f00] hover:text-white transition-colors font-bold uppercase tracking-wider flex items-center gap-1 mt-1 cursor-pointer font-sans"
          >
            Visiter la boutique Spoolio
            <ArrowRight size={11} />
          </a>
        </div>
      </main>

      {/* Modal - Affichage Détails Cadeau */}
      <AnimatePresence>
        {selectedReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              {selectedReward.image && (
                <div className="w-full h-44 relative bg-slate-950 border-b border-slate-850">
                  <img src={selectedReward.image} alt={selectedReward.text} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setSelectedReward(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-black transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="p-6 space-y-4 text-left font-sans">
                {!selectedReward.image && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                      Détail de la récompense
                    </span>
                    <button
                      onClick={() => setSelectedReward(null)}
                      className="text-gray-500 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-black text-white uppercase tracking-tight">
                    {selectedReward.text}
                  </h4>
                  <span className="text-[10px] font-extrabold text-[#ff4f00] uppercase tracking-widest block mt-0.5">
                    Palier {selectedReward.pts} Points (Valeur : {selectedReward.value}€)
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  {selectedReward.description}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedReward(null)}
                    className="w-full py-3 bg-[#ff4f00] hover:bg-[#ff6a22] text-black text-xs font-bold rounded-2xl transition-all cursor-pointer font-sans"
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
