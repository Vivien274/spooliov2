"use client";

import { useState, useEffect } from "react";
import { useAdminTheme } from "../AdminThemeContext";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabaseClient";
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
  TrendingUp,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Link2,
  ChevronRight,
  Euro,
  Layers,
  ArrowRight,
  Wand2,
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

const REWARD_PRESET_IMAGES = [
  { label: "Porte-clés Clavier", url: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp" },
  { label: "Capsule Mystère", url: "/images/alien_capsule.jpg" },
  { label: "Pochette Kraft", url: "/images/pochette-kraft.jpg" },
  { label: "Porte-clés Figma", url: "/images/figma_keychains.jpg" },
  { label: "Fidget 3D", url: "/images/hero_background.jpg" },
  { label: "Canette 3D", url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80" },
  { label: "Coffret Cadeau", url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&auto=format&fit=crop&q=80" },
];

function ImagePreview({ src, alt, size = "md" }: { src: string; alt: string; size?: "sm" | "md" | "lg" }) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const sizeCls =
    size === "lg"
      ? "w-24 h-24 sm:w-28 sm:h-28"
      : size === "sm"
      ? "w-12 h-12"
      : "w-20 h-20 sm:w-24 sm:h-24";

  return (
    <div className={`${sizeCls} rounded-2xl bg-black/60 border border-white/15 overflow-hidden flex items-center justify-center shrink-0 relative group shadow-inner`}>
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-neutral-500 gap-1.5 p-2 text-center">
          <Gift className="w-6 h-6 text-[#ff4f00]" />
          <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">Sans visuel</span>
        </div>
      )}
    </div>
  );
}

function getTierDetails(points: number, rewards: Record<number, { text: string; image: string; description: string; value: number }>) {
  const sortedTiers = Object.keys(rewards)
    .map(Number)
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);

  if (sortedTiers.length === 0) {
    return {
      range: "Non configuré",
      nextTarget: 100,
      reward: "Aucun palier",
      image: ""
    };
  }

  for (let i = 0; i < sortedTiers.length; i++) {
    const tierPts = sortedTiers[i];
    const prevPts = i === 0 ? 0 : sortedTiers[i - 1];
    if (points < tierPts) {
      return {
        range: `${prevPts} - ${tierPts} pts`,
        nextTarget: tierPts,
        reward: rewards[tierPts]?.text || "Non configurée",
        image: rewards[tierPts]?.image || ""
      };
    }
  }

  const maxTier = sortedTiers[sortedTiers.length - 1];
  return {
    range: `Palier Max (${maxTier}+ pts)`,
    nextTarget: maxTier,
    reward: rewards[maxTier]?.text || "Non configurée",
    image: rewards[maxTier]?.image || ""
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
          setRewards(normalized);
        }
      } catch (e) {
        console.error("Failed to parse rewards:", e);
      }
    }
  }, []);

  // États et handlers pour la gestion dynamique des paliers (Studio)
  const [newTierPts, setNewTierPts] = useState<number | "">("");
  const [showAddTierForm, setShowAddTierForm] = useState(false);

  const handleAddTier = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = typeof newTierPts === "number" ? newTierPts : parseInt(String(newTierPts));
    if (!pts || isNaN(pts) || pts <= 0) return;
    if (rewards[pts]) {
      alert("Un palier avec ce nombre de points existe déjà.");
      return;
    }
    const updated = {
      ...rewards,
      [pts]: {
        text: `Récompense ${pts} Pts 🎁`,
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&auto=format&fit=crop&q=80",
        description: `Cadeau débloqué à partir de ${pts} points accumulés !`,
        value: 10
      }
    };
    setRewards(updated);
    localStorage.setItem("spoolio_loyalty_rewards", JSON.stringify(updated));
    setNewTierPts("");
    setShowAddTierForm(false);
  };

  const handleUploadTierImage = (pts: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const webpDataUrl = canvas.toDataURL("image/webp", 0.85);
          const updated = {
            ...rewards,
            [pts]: { ...rewards[pts], image: webpDataUrl },
          };
          setRewards(updated);
          localStorage.setItem("spoolio_loyalty_rewards", JSON.stringify(updated));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateTierPoints = (oldPts: number, newPts: number) => {
    if (!newPts || isNaN(newPts) || newPts <= 0 || oldPts === newPts) return;
    if (rewards[newPts]) {
      alert("Un palier avec ce nombre de points existe déjà.");
      return;
    }
    const currentData = rewards[oldPts];
    const updated = { ...rewards };
    delete updated[oldPts];
    updated[newPts] = currentData;
    setRewards(updated);
    localStorage.setItem("spoolio_loyalty_rewards", JSON.stringify(updated));
  };

  const handleDeleteTier = (pts: number) => {
    if (Object.keys(rewards).length <= 1) {
      alert("Vous devez conserver au moins un palier de fidélité.");
      return;
    }
    if (!window.confirm(`Voulez-vous supprimer le palier ${pts} points ?`)) return;
    const updated = { ...rewards };
    delete updated[pts];
    setRewards(updated);
    localStorage.setItem("spoolio_loyalty_rewards", JSON.stringify(updated));
  };

  const handleResetDefaultTiers = () => {
    if (!window.confirm("Réinitialiser les paliers aux 4 valeurs par défaut (20, 40, 60, 100 pts) ?")) return;
    const defaultRewards = {
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
    };
    setRewards(defaultRewards);
    localStorage.setItem("spoolio_loyalty_rewards", JSON.stringify(defaultRewards));
  };

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

  // Supabase Realtime subscription for instant syncing with Spoolio Manager
  useEffect(() => {
    const channel = supabase
      .channel("loyalty_cards_realtime_admin")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "loyalty_cards",
        },
        () => {
          fetchCards(searchQuery);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchQuery]);

  const generateCardId = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `SP-${code}`;
  };

  // États pour le modal de création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCardId, setNewCardId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newPoints, setNewPoints] = useState(2);
  const [newMaxPoints, setNewMaxPoints] = useState(100);
  const [creating, setCreating] = useState(false);

  const handleOpenCreateModal = () => {
    setNewCardId(generateCardId());
    setNewCustomerName("");
    setNewCustomerEmail("");
    setNewPoints(2);
    setNewMaxPoints(100);
    setShowCreateModal(true);
  };

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

        // Envoi automatique d'email cadeau si la carte franchit un palier dynamique
        const TIERS = Object.keys(rewards).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
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

      const data = await res.json();
      if (res.ok && data.success) {
        alert("E-mail de fidélité envoyé avec succès !");
      } else {
        alert(`Erreur lors de l'envoi : ${data.error || "Impossible d'envoyer l'e-mail."}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion lors de l'envoi de l'e-mail.");
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
            onClick={handleOpenCreateModal}
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
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <span>Identifiant de la carte (UID)</span>
                      <span className="text-[#ff4f00]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewCardId(generateCardId())}
                      className="text-[10px] font-bold text-[#ff4f00] hover:text-[#ff7a22] flex items-center gap-1 transition-colors cursor-pointer"
                      title="Générer un nouvel ID aléatoire"
                    >
                      <Wand2 className="w-3 h-3" />
                      Générer un ID
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={newCardId}
                      onChange={(e) => setNewCardId(e.target.value)}
                      placeholder="ex: SP-A8F9K2 ou UID NFC"
                      className="w-full bg-[#0d0d0f] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-[#ff4f00]/60"
                    />
                    <button
                      type="button"
                      onClick={() => setNewCardId(generateCardId())}
                      className="px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ff4f00]/50 rounded-xl text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      title="Générer un identifiant"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-[#ff4f00]" />
                      <span>Auto</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-500">
                    💡 ID généré automatiquement ou UID de badge NFC scanné.
                  </p>
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

      {/* Modal - Configuration des Paliers/Récompenses (Refonte Studio Ultra-Clair) */}
      {showRewardsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200 font-sans">
          <div className="bg-[#0b0c12] border border-white/15 w-full max-w-4xl rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 relative overflow-y-auto max-h-[92vh] text-white">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff4f00] to-[#ff8800] flex items-center justify-center text-black shadow-lg shadow-[#ff4f00]/25 shrink-0">
                  <Gift className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">
                      Studio des Paliers Cadeaux
                    </h3>
                    <span className="px-2.5 py-0.5 text-xs font-black bg-[#ff4f00]/15 text-[#ff4f00] border border-[#ff4f00]/30 rounded-full font-mono">
                      {Object.keys(rewards).length} paliers configurés
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Organisez l&apos;échelle de récompenses fidélité, les visuels, les descriptions et la valeur offerte aux clients.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRewardsModal(false)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progression Ribbon (Aperçu de l'échelle des paliers) */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-white">
                  <Layers className="w-3.5 h-3.5 text-[#ff4f00]" />
                  Échelle de progression client
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {Object.keys(rewards).length} étapes déblocables
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                {Object.keys(rewards)
                  .map(Number)
                  .filter((n) => !isNaN(n))
                  .sort((a, b) => a - b)
                  .map((pts, idx, arr) => (
                    <div key={pts} className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                        <span className="w-5 h-5 rounded-lg bg-[#ff4f00]/20 text-[#ff4f00] font-black text-[10px] flex items-center justify-center font-mono">
                          #{idx + 1}
                        </span>
                        <span className="font-extrabold text-white">{pts} pts</span>
                        <span className="text-neutral-500 text-[10px]">•</span>
                        <span className="text-emerald-400 font-mono font-bold text-[11px]">
                          {rewards[pts]?.value || 0}€
                        </span>
                        <span className="text-neutral-300 font-medium text-[11px] truncate max-w-[110px]">
                          {rewards[pts]?.text.split(" ")[0]}...
                        </span>
                      </div>
                      {idx < arr.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
              {!showAddTierForm ? (
                <button
                  onClick={() => setShowAddTierForm(true)}
                  className="px-4 py-2.5 text-xs font-black bg-gradient-to-r from-[#ff4f00] to-[#ff7700] hover:from-[#ff6600] hover:to-[#ff8800] text-black rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#ff4f00]/20 uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Ajouter un palier
                </button>
              ) : (
                <form onSubmit={handleAddTier} className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-neutral-300">Nouveau seuil :</span>
                  <input
                    type="number"
                    placeholder="ex: 80"
                    value={newTierPts}
                    onChange={(e) =>
                      setNewTierPts(e.target.value === "" ? "" : parseInt(e.target.value))
                    }
                    className="w-28 bg-[#151722] border border-[#ff4f00] rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none font-bold text-center"
                    autoFocus
                  />
                  <span className="text-xs font-bold text-neutral-400">points</span>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-bold bg-[#ff4f00] text-black rounded-xl hover:bg-[#ff6a22] cursor-pointer"
                  >
                    Valider
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTierForm(false)}
                    className="p-1.5 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={handleResetDefaultTiers}
                className="px-3.5 py-2 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center gap-1.5 border border-white/5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Réinitialiser par défaut (4 paliers)
              </button>
            </div>

            {/* List of Tiers (Cards bien espacées et structurées) */}
            <div className="space-y-5">
              {Object.keys(rewards)
                .map(Number)
                .filter((n) => !isNaN(n))
                .sort((a, b) => a - b)
                .map((pts, index) => {
                  const r = rewards[pts];
                  return (
                    <div
                      key={pts}
                      className="bg-[#11131c]/90 border border-white/10 hover:border-white/20 rounded-3xl p-5 sm:p-6 space-y-5 transition-all duration-200 shadow-xl relative group"
                    >
                      {/* Tier Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-xl bg-white/10 text-neutral-300 font-mono font-black text-xs flex items-center justify-center border border-white/10">
                            #{index + 1}
                          </span>
                          
                          {/* Points badge & quick edit */}
                          <div className="flex items-center gap-2 bg-[#ff4f00]/15 border border-[#ff4f00]/30 px-3.5 py-1.5 rounded-xl text-[#ff4f00]">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="text-xs font-black uppercase tracking-wider font-mono">
                              Palier {pts} Points
                            </span>
                          </div>
                        </div>

                        {/* Right: Value input + Delete action */}
                        <div className="flex items-center gap-3">
                          {/* Value tag */}
                          <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs shadow-inner">
                            <Euro className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-neutral-400 font-bold text-xs">Valeur cadeau :</span>
                            <input
                              type="number"
                              min="0"
                              value={r.value}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                const updated = {
                                  ...rewards,
                                  [pts]: { ...rewards[pts], value: val },
                                };
                                setRewards(updated);
                                localStorage.setItem("spoolio_loyalty_rewards", JSON.stringify(updated));
                              }}
                              className="w-12 bg-transparent text-center font-black text-emerald-400 focus:outline-none text-sm font-mono border-b border-white/20 focus:border-emerald-400"
                            />
                            <span className="text-emerald-400 font-bold">€</span>
                          </div>

                          {/* Delete Tier Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteTier(pts)}
                            className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                            title="Supprimer ce palier"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Tier Card Body (2 Columns Layout) */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        
                        {/* Left Column: Image Thumbnail & Upload/Presets (4 cols) */}
                        <div className="md:col-span-4 flex flex-col items-center sm:items-start gap-3 bg-black/30 border border-white/5 rounded-2xl p-4">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider flex items-center justify-between w-full">
                            <span>Photo de la récompense</span>
                            {r.image?.startsWith("data:image/webp") && (
                              <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                                ⚡ WebP
                              </span>
                            )}
                          </label>

                          <div className="flex items-center gap-3 w-full">
                            <ImagePreview src={r.image} alt={r.text} size="lg" />

                            <div className="flex flex-col gap-2 flex-1">
                              {/* File Upload with Canvas WebP auto-compress */}
                              <label className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#ff4f00] rounded-xl text-[11px] font-bold text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center">
                                <Upload className="w-3.5 h-3.5 text-[#ff4f00]" />
                                <span>Téléverser</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleUploadTierImage(pts, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>

                          {/* Quick Preset Selector */}
                          <div className="w-full space-y-1.5 pt-1">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase">Presets Spoolio :</span>
                            <div className="grid grid-cols-4 gap-1.5">
                              {REWARD_PRESET_IMAGES.slice(0, 4).map((preset, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => {
                                    const updated = {
                                      ...rewards,
                                      [pts]: { ...rewards[pts], image: preset.url },
                                    };
                                    setRewards(updated);
                                    localStorage.setItem("spoolio_loyalty_rewards", JSON.stringify(updated));
                                  }}
                                  className={`aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer relative group/preset ${
                                    r.image === preset.url
                                      ? "border-[#ff4f00] ring-1 ring-[#ff4f00]"
                                      : "border-white/10 opacity-60 hover:opacity-100"
                                  }`}
                                  title={preset.label}
                                >
                                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Collapsible/Direct Image URL input */}
                          <div className="w-full space-y-1 pt-1">
                            <label className="text-[9px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              Ou URL directe :
                            </label>
                            <input
                              type="text"
                              value={r.image}
                              onChange={(e) => {
                                const updated = {
                                  ...rewards,
                                  [pts]: { ...rewards[pts], image: e.target.value },
                                };
                                setRewards(updated);
                                localStorage.setItem("spoolio_loyalty_rewards", JSON.stringify(updated));
                              }}
                              className="w-full bg-[#0a0a0d] border border-white/10 focus:border-[#ff4f00] rounded-xl px-2.5 py-1.5 text-[11px] text-neutral-300 font-mono placeholder-neutral-600 focus:outline-none"
                              placeholder="https://..."
                            />
                          </div>
                        </div>

                        {/* Right Column: Title & Description Form (8 cols) */}
                        <div className="md:col-span-8 space-y-4">
                          {/* Reward Title */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                              <span>Nom & Titre de la Récompense</span>
                              <span className="text-[#ff4f00] text-[10px]">*</span>
                            </label>
                            <input
                              type="text"
                              value={r.text}
                              onChange={(e) => {
                                const updated = {
                                  ...rewards,
                                  [pts]: { ...rewards[pts], text: e.target.value },
                                };
                                setRewards(updated);
                                localStorage.setItem("spoolio_loyalty_rewards", JSON.stringify(updated));
                              }}
                              className="w-full bg-[#0d0e14] border border-white/15 focus:border-[#ff4f00] rounded-2xl px-4 py-3 text-sm text-white font-bold placeholder-neutral-600 focus:outline-none transition-all shadow-inner"
                              placeholder="ex: Porte-clés Clavier Mécanique ⌨️"
                            />
                          </div>

                          {/* Description & Conditions */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                              Description & Message affiché au client
                            </label>
                            <textarea
                              value={r.description}
                              onChange={(e) => {
                                const updated = {
                                  ...rewards,
                                  [pts]: { ...rewards[pts], description: e.target.value },
                                };
                                setRewards(updated);
                                localStorage.setItem("spoolio_loyalty_rewards", JSON.stringify(updated));
                              }}
                              rows={3}
                              className="w-full bg-[#0d0e14] border border-white/15 focus:border-[#ff4f00] rounded-2xl p-3.5 text-xs text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none transition-all leading-relaxed shadow-inner"
                              placeholder="Description attrayante du produit offert lorsqu'il atteint ce palier..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-neutral-400">
                Les modifications sont automatiquement enregistrées en temps réel.
              </span>
              <button
                type="button"
                onClick={() => setShowRewardsModal(false)}
                className="w-full sm:w-auto px-7 py-3.5 text-xs font-black bg-gradient-to-r from-[#ff4f00] to-[#ff7700] hover:from-[#ff6600] hover:to-[#ff8800] text-black rounded-2xl transition-all shadow-xl shadow-[#ff4f00]/25 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Enregistrer & Fermer le Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
