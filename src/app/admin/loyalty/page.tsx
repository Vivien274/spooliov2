"use client";

import { useState, useEffect } from "react";
import { useAdminTheme } from "../AdminThemeContext";
import confetti from "canvas-confetti";
import {
  Award,
  Search,
  Plus,
  Minus,
  RotateCcw,
  Trash2,
  ExternalLink,
  Edit2,
  Check,
  X,
  PlusCircle,
  Clock,
  User,
  AlertCircle,
  Mail,
  Nfc,
  Gift,
  Lock,
  Users,
  TrendingUp
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

function getTierDetails(points: number, rewards: Record<number, { text: string; image: string; description: string; value: number }>) {
  if (points < 20) {
    return {
      range: "0 - 20 pts",
      nextTarget: 20,
      reward: rewards[20]?.text || "Non configurée",
      image: rewards[20]?.image || ""
    };
  }
  if (points < 40) {
    return {
      range: "20 - 40 pts",
      nextTarget: 40,
      reward: rewards[40]?.text || "Non configurée",
      image: rewards[40]?.image || ""
    };
  }
  if (points < 60) {
    return {
      range: "40 - 60 pts",
      nextTarget: 60,
      reward: rewards[60]?.text || "Non configurée",
      image: rewards[60]?.image || ""
    };
  }
  if (points < 100) {
    return {
      range: "60 - 100 pts",
      nextTarget: 100,
      reward: rewards[100]?.text || "Non configurée",
      image: rewards[100]?.image || ""
    };
  }
  return {
    range: "Palier Max (100+ pts)",
    nextTarget: 100,
    reward: rewards[100]?.text || "Non configurée",
    image: rewards[100]?.image || ""
  };
}

export default function AdminLoyaltyCardsPage() {
  const { cls } = useAdminTheme();
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Configuration des récompenses par palier
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  interface RewardItem {
    text: string;
    image: string;
    description: string;
    value: number;
  }
  const [rewards, setRewards] = useState<Record<number, RewardItem>>({
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

  // Charger la configuration des récompenses depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("spoolio_loyalty_rewards");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const normalized: Record<number, RewardItem> = {};
        Object.entries(parsed).forEach(([key, val]) => {
          const numKey = parseInt(key);
          if (val && typeof val === "object") {
            normalized[numKey] = val as RewardItem;
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

  // Charger les cartes de fidélité via l'API Prisma locale
  const fetchCards = async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/loyalty?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
      }
    } catch (e) {
      console.error("Failed to load loyalty cards:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCards(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // États pour le modal de création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCardId, setNewCardId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newPoints, setNewPoints] = useState(2);
  const [newMaxPoints, setNewMaxPoints] = useState(100);
  const [creating, setCreating] = useState(false);

  // États pour l'édition en ligne du nom, email, points et maxPoints
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [editEmailValue, setEditEmailValue] = useState("");
  const [editPointsValue, setEditPointsValue] = useState(0);
  const [editMaxPointsValue, setEditMaxPointsValue] = useState(100);
  const [sendingEmailCardId, setSendingEmailCardId] = useState<string | null>(null);

  // Saisie NFC Simulée ou Détection Web NFC
  const [isNfcSupported, setIsNfcSupported] = useState(false);
  const [isNfcReading, setIsNfcReading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "NDEFReader" in window) {
      setIsNfcSupported(true);
    }
  }, []);

  const handleStartNfcRead = async () => {
    if (!isNfcSupported) return;
    setIsNfcReading(true);
    try {
      // @ts-ignore
      const ndef = new NDEFReader();
      await ndef.scan();
      // @ts-ignore
      ndef.onreading = (event: any) => {
        const serialNumber = event.serialNumber;
        setNewCardId(serialNumber);
        setIsNfcReading(false);
        confetti();
      };
    } catch (err) {
      console.error("NFC Scan failed:", err);
      setIsNfcReading(false);
      alert("La détection NFC a échoué. Assure-toi d'être sur mobile avec NFC activé.");
    }
  };

  // Action : Créer une nouvelle carte de fidélité
  async function handleCreateCard(e: React.FormEvent) {
    e.preventDefault();
    if (!newCardId.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/admin/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newCardId.trim().toLowerCase(),
          customerName: newCustomerName.trim() || null,
          customerEmail: newCustomerEmail.trim().toLowerCase() || null,
          points: newPoints,
          maxPoints: newMaxPoints
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Erreur : ${data.error || "Impossible de créer la carte"}`);
      } else {
        setCards(prev => [data.card, ...prev]);
        setShowCreateModal(false);
        setNewCardId("");
        setNewCustomerName("");
        setNewCustomerEmail("");
        setNewPoints(2);
        confetti();
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau lors de la création.");
    } finally {
      setCreating(false);
    }
  }

  // Action : Supprimer définitivement une carte
  async function handleDeleteCard(cardId: string) {
    if (!window.confirm("Voulez-vous vraiment supprimer définitivement cette carte de fidélité ?")) return;

    try {
      const res = await fetch(`/api/admin/loyalty?id=${cardId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setCards(prev => prev.filter(c => c.id !== cardId));
      } else {
        const data = await res.json();
        alert(`Erreur : ${data.error || "Impossible de supprimer la carte"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de la carte.");
    }
  }

  // Action : Mettre à jour les points (+1 / -1)
  async function handleUpdatePoints(card: LoyaltyCard, delta: number) {
    const nextPoints = Math.max(0, card.points + delta);
    const pointsDiff = nextPoints - card.points;
    
    const currentHistory = Array.isArray(card.history) ? card.history : [];
    let nextHistory = currentHistory;
    if (pointsDiff !== 0) {
      const newEvent = {
        date: new Date().toISOString(),
        points: pointsDiff > 0 ? `+${pointsDiff}` : `${pointsDiff}`,
        reason: "Ajustement Admin"
      };
      nextHistory = [newEvent, ...currentHistory];
    }
    
    // UI Optimiste
    setCards(prev =>
      prev.map(c => (c.id === card.id ? { ...c, points: nextPoints, history: nextHistory } : c))
    );

    try {
      const res = await fetch("/api/admin/loyalty", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: card.id,
          points: nextPoints,
          history: nextHistory
        })
      });

      if (!res.ok) throw new Error("API call failed");

      if (delta > 0 && nextPoints > card.points) {
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.85 }
        });

        // Envoi automatique d'email cadeau si la carte franchit un palier [20, 40, 60, 100]
        const TIERS = [20, 40, 60, 100];
        const crossedTier = TIERS.find(t => card.points < t && nextPoints >= t);
        if (crossedTier && card.customerEmail) {
          fetch("/api/loyalty/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cardId: card.id,
              email: card.customerEmail,
              name: card.customerName,
              points: nextPoints,
              maxPoints: crossedTier,
              isReward: true
            })
          }).catch(err => console.error("Failed to auto-send reward email:", err));
        }
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour des points.");
      fetchCards(searchQuery); // Recharger depuis le serveur
    }
  }

  // Action : Commencer l'édition en ligne
  function startEditing(card: LoyaltyCard) {
    setEditingCardId(card.id);
    setEditNameValue(card.customerName || "");
    setEditEmailValue(card.customerEmail || "");
    setEditPointsValue(card.points);
    setEditMaxPointsValue(card.maxPoints);
  }

  // Action : Enregistrer l'édition d'une carte
  async function saveEditingName(cardId: string) {
    const trimmedName = editNameValue.trim() || null;
    const trimmedEmail = editEmailValue.trim().toLowerCase() || null;
    const newPointsVal = editPointsValue;
    const newMaxPointsVal = editMaxPointsValue;

    const card = cards.find(c => c.id === cardId);
    const pointsDiff = card ? newPointsVal - card.points : 0;
    let nextHistory = card ? (Array.isArray(card.history) ? card.history : []) : [];
    if (pointsDiff !== 0) {
      const newEvent = {
        date: new Date().toISOString(),
        points: pointsDiff > 0 ? `+${pointsDiff}` : `${pointsDiff}`,
        reason: "Ajustement Admin (Édition)"
      };
      nextHistory = [newEvent, ...nextHistory];
    }

    setCards(prev =>
      prev.map(c => (c.id === cardId ? { 
        ...c, 
        customerName: trimmedName, 
        customerEmail: trimmedEmail,
        points: newPointsVal,
        maxPoints: newMaxPointsVal,
        history: nextHistory
      } : c))
    );
    setEditingCardId(null);

    try {
      const res = await fetch("/api/admin/loyalty", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cardId,
          customerName: trimmedName,
          customerEmail: trimmedEmail,
          points: newPointsVal,
          maxPoints: newMaxPointsVal,
          history: nextHistory
        })
      });

      if (!res.ok) throw new Error("Edit failed");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour.");
      fetchCards(searchQuery);
    }
  }

  // Action : Réinitialiser la carte à 0 point (Cadeau remis)
  async function handleResetCard(cardId: string) {
    if (!window.confirm("Voulez-vous réinitialiser le solde de cette carte à 0 point ? (Les informations du client seront conservées)")) return;

    const card = cards.find(c => c.id === cardId);
    const prevPoints = card ? card.points : 0;
    const currentHistory = card ? (Array.isArray(card.history) ? card.history : []) : [];
    const newEvent = {
      date: new Date().toISOString(),
      points: `-${prevPoints}`,
      reason: "Cadeau remis & Réinitialisation"
    };
    const nextHistory = [newEvent, ...currentHistory];

    setCards(prev =>
      prev.map(c => (c.id === cardId ? { ...c, points: 0, history: nextHistory } : c))
    );

    try {
      const res = await fetch("/api/admin/loyalty", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cardId,
          points: 0,
          history: nextHistory
        })
      });

      if (!res.ok) throw new Error("Reset failed");
      confetti({
        particleCount: 80,
        spread: 60
      });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la réinitialisation.");
      fetchCards(searchQuery);
    }
  }

  // Action : Envoyer manuellement un email récapitulatif
  async function handleSendEmail(card: LoyaltyCard) {
    if (!card.customerEmail) return;
    setSendingEmailCardId(card.id);

    try {
      const res = await fetch("/api/loyalty/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: card.id,
          email: card.customerEmail,
          name: card.customerName,
          points: card.points,
          maxPoints: card.maxPoints,
          isReward: false
        })
      });

      if (res.ok) {
        alert("E-mail envoyé avec succès !");
      } else {
        alert("Impossible d'envoyer l'e-mail.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion.");
    } finally {
      setSendingEmailCardId(null);
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Title area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-[#ff4f00]" />
            Cartes de Fidélité
          </h1>
          <p className="text-xs text-gray-400">
            Créez, gérez et créditez des points sur les badges NFC physiques Spoolio de vos clients.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRewardsModal(true)}
            className="px-4 py-2 text-xs font-bold bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5" />
            Paliers Cadeaux
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-xs font-bold bg-[#ff4f00] text-black rounded-lg hover:bg-[#ff6a22] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Créer une carte
          </button>
        </div>
      </div>

      {/* Analytics stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cls.cardBg} ${cls.border} p-4 rounded-xl flex items-center gap-4`}>
          <div className="w-10 h-10 rounded-lg bg-[#ff4f00]/10 flex items-center justify-center text-[#ff4f00]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Clients</div>
            <div className="text-xl font-extrabold text-white">{cards.length}</div>
          </div>
        </div>
        <div className={`${cls.cardBg} ${cls.border} p-4 rounded-xl flex items-center gap-4`}>
          <div className="w-10 h-10 rounded-lg bg-[#2F3CD9]/10 flex items-center justify-center text-[#2F3CD9]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Points Distribués</div>
            <div className="text-xl font-extrabold text-white">
              {cards.reduce((acc, c) => acc + c.points, 0)} pts
            </div>
          </div>
        </div>
        <div className={`${cls.cardBg} ${cls.border} p-4 rounded-xl flex items-center gap-4`}>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Moyenne de Points</div>
            <div className="text-xl font-extrabold text-white">
              {cards.length > 0 ? Math.round(cards.reduce((acc, c) => acc + c.points, 0) / cards.length) : 0} pts
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par Nom, E-mail ou Identifiant de Carte..."
          className="w-full bg-[#0d0d0f] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4f00]/50 transition-all font-sans"
        />
      </div>

      {/* Cards List table */}
      <div className={`${cls.cardBg} ${cls.border} rounded-xl overflow-hidden`}>
        {loading && cards.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm font-bold flex flex-col items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-[#ff4f00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Chargement des badges...</span>
          </div>
        ) : cards.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm font-sans flex flex-col items-center gap-2">
            <span>Aucune carte de fidélité trouvée.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-black/10">
                  <th className="p-4">Identifiant (UID)</th>
                  <th className="p-4">Client</th>
                  <th className="p-4 text-center">Solde Points</th>
                  <th className="p-4 text-center">Ajuster</th>
                  <th className="p-4">Palier Actuel</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => {
                  const isEditing = editingCardId === card.id;
                  const tier = getTierDetails(card.points, rewards);
                  return (
                    <tr key={card.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all align-middle">
                      {/* ID / UID */}
                      <td className="p-4 font-mono font-bold text-gray-400 select-all max-w-[120px] truncate">
                        {card.id}
                      </td>
                      {/* Customer Details */}
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex flex-col gap-2 max-w-[200px]">
                            <input
                              type="text"
                              value={editNameValue}
                              onChange={(e) => setEditNameValue(e.target.value)}
                              placeholder="Nom du client"
                              className="bg-[#0d0d0f] border border-white/10 rounded px-2 py-1 text-xs text-white"
                            />
                            <input
                              type="email"
                              value={editEmailValue}
                              onChange={(e) => setEditEmailValue(e.target.value)}
                              placeholder="E-mail"
                              className="bg-[#0d0d0f] border border-white/10 rounded px-2 py-1 text-xs text-white"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-white text-sm">
                              {card.customerName || <span className="text-gray-600 italic">Sans Nom</span>}
                            </span>
                            {card.customerEmail && (
                              <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                                <Mail className="w-3 h-3 text-gray-600" />
                                {card.customerEmail}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      {/* Points balance */}
                      <td className="p-4 text-center">
                        {isEditing ? (
                          <div className="flex flex-col gap-1.5 max-w-[100px] mx-auto">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-500">Pts:</span>
                              <input
                                type="number"
                                value={editPointsValue}
                                onChange={(e) => setEditPointsValue(parseInt(e.target.value) || 0)}
                                className="w-full bg-[#0d0d0f] border border-white/10 rounded px-1.5 py-0.5 text-xs text-white font-extrabold text-center"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-500">Max:</span>
                              <input
                                type="number"
                                value={editMaxPointsValue}
                                onChange={(e) => setEditMaxPointsValue(parseInt(e.target.value) || 100)}
                                className="w-full bg-[#0d0d0f] border border-white/10 rounded px-1.5 py-0.5 text-xs text-white font-extrabold text-center"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-base font-black text-white">
                              {card.points}
                            </span>
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                              sur {card.maxPoints} pts
                            </span>
                          </div>
                        )}
                      </td>
                      {/* Increment Adjustment */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdatePoints(card, -1)}
                            disabled={card.points <= 0}
                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleUpdatePoints(card, 1)}
                            className="w-7 h-7 rounded-lg bg-[#ff4f00]/10 border border-[#ff4f00]/20 hover:bg-[#ff4f00]/25 text-[#ff4f00] flex items-center justify-center transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      {/* Tier details */}
                      <td className="p-4 font-sans">
                        <div className="flex items-center gap-2">
                          {tier.image && (
                            <img src={tier.image} alt={tier.reward} className="w-7 h-7 rounded object-cover border border-white/10 shrink-0" />
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-gray-300 text-xs">
                              {tier.reward}
                            </span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                              {tier.range}
                            </span>
                          </div>
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEditingName(card.id)}
                                className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all cursor-pointer"
                                title="Sauvegarder"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingCardId(null)}
                                className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-all cursor-pointer"
                                title="Annuler"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(card)}
                                className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-all cursor-pointer"
                                title="Modifier"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {card.customerEmail && (
                                <button
                                  onClick={() => handleSendEmail(card)}
                                  disabled={sendingEmailCardId === card.id}
                                  className="p-2 bg-white/5 hover:bg-white/10 text-[#2F3CD9] rounded-lg transition-all cursor-pointer disabled:opacity-40"
                                  title="Envoyer e-mail"
                                >
                                  {sendingEmailCardId === card.id ? (
                                    <span className="w-3.5 h-3.5 block border-2 border-[#2F3CD9] border-t-transparent animate-spin rounded-full" />
                                  ) : (
                                    <Mail className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => handleResetCard(card.id)}
                                className="p-2 bg-white/5 hover:bg-yellow-500/10 hover:text-yellow-400 text-gray-400 rounded-lg transition-all cursor-pointer"
                                title="Cadeau remis (Réinitialiser)"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <a
                                href={`/loyalty/${card.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-all flex items-center justify-center"
                                title="Voir la carte client"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleDeleteCard(card.id)}
                                className="p-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-400 rounded-lg transition-all cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Création de carte */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`${cls.cardBg} ${cls.border} w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 relative`}>
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Créer une Carte de Fidélité
              </h3>
              <p className="text-xs text-gray-400">
                Saisis ou scanne l'identifiant NFC physique de la carte pour la lier à ton client.
              </p>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-4">
              {/* NFC Scan section */}
              {isNfcSupported ? (
                <button
                  type="button"
                  onClick={handleStartNfcRead}
                  className={`w-full py-3 border rounded-xl flex items-center justify-center gap-2 font-bold transition-all text-xs cursor-pointer ${
                    isNfcReading
                      ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-400 animate-pulse"
                      : "bg-[#2F3CD9]/10 border-[#2F3CD9]/20 text-[#2F3CD9] hover:bg-[#2F3CD9]/15"
                  }`}
                >
                  <Nfc className="w-4 h-4" />
                  {isNfcReading ? "Approcher le badge de l'appareil..." : "Scanner le badge NFC"}
                </button>
              ) : (
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start gap-2 text-[10px] text-gray-400">
                  <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                  <span>
                    La détection NFC Web n'est pas supportée par ton navigateur ou ta machine. Saisis l'ID manuellement ci-dessous.
                  </span>
                </div>
              )}

              <div className="space-y-3 font-sans">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Identifiant de la carte (UID)*
                  </label>
                  <input
                    type="text"
                    required
                    value={newCardId}
                    onChange={(e) => setNewCardId(e.target.value)}
                    placeholder="Saisir ou coller l'identifiant du badge"
                    className="w-full bg-[#0d0d0f] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#ff4f00]/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Nom du client
                  </label>
                  <input
                    type="text"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Vivien"
                    className="w-full bg-[#0d0d0f] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Adresse E-mail (Liaison automatique)
                  </label>
                  <input
                    type="email"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    placeholder="client@email.com"
                    className="w-full bg-[#0d0d0f] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Points initiaux
                    </label>
                    <input
                      type="number"
                      value={newPoints}
                      onChange={(e) => setNewPoints(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#0d0d0f] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-extrabold text-center"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Palier Max
                    </label>
                    <input
                      type="number"
                      value={newMaxPoints}
                      onChange={(e) => setNewMaxPoints(parseInt(e.target.value) || 100)}
                      className="w-full bg-[#0d0d0f] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-extrabold text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 text-xs font-bold bg-[#ff4f00] text-black hover:bg-[#ff6a22] rounded-xl flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Création..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Configuration des Paliers/Récompenses */}
      {showRewardsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`${cls.cardBg} ${cls.border} w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-y-auto max-h-[85vh]`}>
            <button
              onClick={() => setShowRewardsModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Configuration des Paliers Cadeaux
              </h3>
              <p className="text-xs text-gray-400">
                Configure les récompenses et valeurs associées aux différents seuils de points cumulés.
              </p>
            </div>

            <div className="space-y-4">
              {Object.keys(rewards).map((ptsKey) => {
                const pts = parseInt(ptsKey);
                const r = rewards[pts];
                return (
                  <div key={pts} className="p-4 bg-black/25 border border-white/5 rounded-xl space-y-3 font-sans">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-black text-[#ff4f00] uppercase tracking-wider">
                        Palier {pts} Points
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <span>Valeur:</span>
                        <input
                          type="number"
                          value={r.value}
                          onChange={(e) => {
                            const newRewards = { ...rewards };
                            newRewards[pts].value = parseInt(e.target.value) || 0;
                            setRewards(newRewards);
                            localStorage.setItem("spoolio_loyalty_rewards", JSON.stringify(newRewards));
                          }}
                          className="w-10 bg-white/5 border border-white/10 rounded text-center text-white px-1 py-0.5"
                        />
                        <span>€</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                          Titre Cadeau
                        </label>
                        <input
                          type="text"
                          value={r.text}
                          onChange={(e) => {
                            const newRewards = { ...rewards };
                            newRewards[pts].text = e.target.value;
                            setRewards(newRewards);
                            localStorage.setItem("spoolio_loyalty_rewards", JSON.stringify(newRewards));
                          }}
                          className="bg-[#0d0d0f] border border-white/10 rounded px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                          URL Image Miniature
                        </label>
                        <input
                          type="text"
                          value={r.image}
                          onChange={(e) => {
                            const newRewards = { ...rewards };
                            newRewards[pts].image = e.target.value;
                            setRewards(newRewards);
                            localStorage.setItem("spoolio_loyalty_rewards", JSON.stringify(newRewards));
                          }}
                          className="bg-[#0d0d0f] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                        Description / Conditions
                      </label>
                      <textarea
                        value={r.description}
                        onChange={(e) => {
                          const newRewards = { ...rewards };
                          newRewards[pts].description = e.target.value;
                          setRewards(newRewards);
                          localStorage.setItem("spoolio_loyalty_rewards", JSON.stringify(newRewards));
                        }}
                        rows={2}
                        className="bg-[#0d0d0f] border border-white/10 rounded p-2 text-white text-xs resize-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowRewardsModal(false)}
                className="w-full py-2.5 text-xs font-bold bg-[#ff4f00] text-black hover:bg-[#ff6a22] rounded-xl cursor-pointer"
              >
                Fermer & Enregistrer la config
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
