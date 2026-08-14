"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Sparkles,
  Trophy,
  Gift,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Dices,
  Layers,
  Eye,
  Sliders,
  Mail,
  User,
  Copy,
  Check,
  Calendar,
} from "lucide-react";
import { useAdminTheme } from "../AdminThemeContext";
import {
  LotteryPrizeItem,
  LotterySpinItem,
  getAllLotteryPrizesAdminAction,
  createLotteryPrizeAdminAction,
  updateLotteryPrizeAdminAction,
  deleteLotteryPrizeAdminAction,
} from "@/app/actions/lotteryActions";
import WheelOfFortune from "@/components/lottery/WheelOfFortune";

const COLOR_PRESETS = [
  { name: "Spoolio Orange", color: "#FF5500", textColor: "#FFFFFF" },
  { name: "Bleu Néon", color: "#3B82F6", textColor: "#FFFFFF" },
  { name: "Émeraude", color: "#10B981", textColor: "#FFFFFF" },
  { name: "Violet Flash", color: "#8B5CF6", textColor: "#FFFFFF" },
  { name: "Or / Jaune", color: "#EAB308", textColor: "#000000" },
  { name: "Rose Pop", color: "#EC4899", textColor: "#FFFFFF" },
  { name: "Sombre", color: "#1F2937", textColor: "#9CA3AF" },
  { name: "Cyan", color: "#06B6D4", textColor: "#FFFFFF" },
];

export default function AdminLoteriePage() {
  const { cls } = useAdminTheme();

  const [prizes, setPrizes] = useState<LotteryPrizeItem[]>([]);
  const [spins, setSpins] = useState<LotterySpinItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();

  // Active tab state in Admin: "prizes" | "spins"
  const [activeTab, setActiveTab] = useState<"prizes" | "spins">("prizes");

  // Prize Modal state (New or Edit)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPrize, setEditingPrize] = useState<LotteryPrizeItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState<string>("");
  const [formSubtitle, setFormSubtitle] = useState<string>("");
  const [formIcon, setFormIcon] = useState<string>("🎁");
  const [formColor, setFormColor] = useState<string>("#FF5500");
  const [formTextColor, setFormTextColor] = useState<string>("#FFFFFF");
  const [formProbability, setFormProbability] = useState<number>(1);
  const [formStock, setFormStock] = useState<string>("");
  const [formCouponCode, setFormCouponCode] = useState<string>("");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Alerts feedback & copy emails state
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedEmails, setCopiedEmails] = useState<boolean>(false);

  const refreshData = async () => {
    try {
      const data = await getAllLotteryPrizesAdminAction();
      setPrizes(data.prizes);
      setSpins(data.spins);
    } catch (err: any) {
      console.error("Error refreshing lottery data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const totalPrizes = prizes.length;
  const activePrizes = prizes.filter((p) => p.isActive);
  const totalSpinsCount = spins.length;
  const capturedEmailsCount = spins.filter((s) => s.userEmail).length;

  const openCreateModal = () => {
    setEditingPrize(null);
    setFormTitle("");
    setFormSubtitle("");
    setFormIcon("🎁");
    setFormColor("#FF5500");
    setFormTextColor("#FFFFFF");
    setFormProbability(1);
    setFormStock("");
    setFormCouponCode("");
    setFormIsActive(true);
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prize: LotteryPrizeItem) => {
    setEditingPrize(prize);
    setFormTitle(prize.title);
    setFormSubtitle(prize.subtitle || "");
    setFormIcon(prize.icon || "🎁");
    setFormColor(prize.color || "#FF5500");
    setFormTextColor(prize.textColor || "#FFFFFF");
    setFormProbability(prize.probability || 1);
    setFormStock(prize.stock !== null && prize.stock !== undefined ? String(prize.stock) : "");
    setFormCouponCode(prize.couponCode || "");
    setFormIsActive(prize.isActive);
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setActionError("Le titre du lot est obligatoire.");
      return;
    }

    startTransition(async () => {
      const stockVal = formStock.trim() === "" ? null : Number(formStock);

      if (editingPrize) {
        const res = await updateLotteryPrizeAdminAction(editingPrize.id, {
          title: formTitle,
          subtitle: formSubtitle,
          icon: formIcon,
          color: formColor,
          textColor: formTextColor,
          probability: formProbability,
          stock: stockVal,
          couponCode: formCouponCode,
          isActive: formIsActive,
        });

        if (res.success) {
          setActionSuccess(`Lot "${formTitle}" mis à jour avec succès !`);
          setIsModalOpen(false);
          refreshData();
          setTimeout(() => setActionSuccess(null), 3000);
        } else {
          setActionError(res.error || "Erreur lors de la mise à jour.");
        }
      } else {
        const res = await createLotteryPrizeAdminAction({
          title: formTitle,
          subtitle: formSubtitle,
          icon: formIcon,
          color: formColor,
          textColor: formTextColor,
          probability: formProbability,
          stock: stockVal,
          couponCode: formCouponCode,
          isActive: formIsActive,
        });

        if (res.success) {
          setActionSuccess(`Lot "${formTitle}" créé avec succès !`);
          setIsModalOpen(false);
          refreshData();
          setTimeout(() => setActionSuccess(null), 3000);
        } else {
          setActionError(res.error || "Erreur lors de la création.");
        }
      }
    });
  };

  const handleToggleActive = (prize: LotteryPrizeItem) => {
    startTransition(async () => {
      const res = await updateLotteryPrizeAdminAction(prize.id, {
        isActive: !prize.isActive,
      });
      if (res.success) {
        refreshData();
      }
    });
  };

  const handleDeletePrize = (id: string, title: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le lot "${title}" ?`)) return;

    startTransition(async () => {
      const res = await deleteLotteryPrizeAdminAction(id);
      if (res.success) {
        setActionSuccess(`Lot "${title}" supprimé.`);
        refreshData();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    });
  };

  const handleCopyEmailsList = () => {
    const emailsList = spins
      .map((s) => s.userEmail)
      .filter((e): e is string => Boolean(e))
      .filter((v, i, a) => a.indexOf(v) === i)
      .join("\n");

    if (!emailsList) {
      alert("Aucune adresse email capturée pour le moment.");
      return;
    }

    navigator.clipboard.writeText(emailsList);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 3000);
  };

  return (
    <div className={`min-h-screen ${cls.pageBg} p-4 sm:p-6 lg:p-8 text-white space-y-8 font-sans`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500]">
            <Dices className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Gestion de la <span className="text-[#FF5500]">Loterie & Roue</span>
            </h1>
            <p className="text-xs text-neutral-400">
              Définis les lots, consulte les emails des gagnants et ajuste les règles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            className="px-3.5 py-2.5 rounded-xl bg-[#1A1A22] border border-white/10 hover:bg-white/10 text-neutral-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF7700] hover:from-[#FF6600] hover:to-[#FF8800] text-white text-xs font-bold shadow-lg shadow-[#FF5500]/20 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nouveau Lot
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`${cls.cardBg} border ${cls.border} rounded-2xl p-5 shadow-xl flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/15 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500]">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Lots configurés</p>
            <h3 className="text-2xl font-black text-white">{totalPrizes}</h3>
            <p className="text-[11px] text-[#FF5500] font-mono">{activePrizes.length} visibles sur la roue</p>
          </div>
        </div>

        <div className={`${cls.cardBg} border ${cls.border} rounded-2xl p-5 shadow-xl flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Tirages effectués</p>
            <h3 className="text-2xl font-black text-white">{totalSpinsCount}</h3>
            <p className="text-[11px] text-blue-400 font-mono">Tirages cumulés</p>
          </div>
        </div>

        <div className={`${cls.cardBg} border ${cls.border} rounded-2xl p-5 shadow-xl flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Emails Capturés</p>
            <h3 className="text-2xl font-black text-white">{capturedEmailsCount}</h3>
            <p className="text-[11px] text-emerald-400 font-mono">Leads qualifiés</p>
          </div>
        </div>

        <div className={`${cls.cardBg} border ${cls.border} rounded-2xl p-5 shadow-xl flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Statut Loterie</p>
            <h3 className="text-2xl font-black text-emerald-400">ACTIF</h3>
            <p className="text-[11px] text-amber-400 font-mono">En ligne sur /loterie</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("prizes")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "prizes"
              ? "bg-[#FF5500] text-white shadow-lg shadow-[#FF5500]/20"
              : "bg-white/5 text-neutral-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          Configuration des Lots ({prizes.length})
        </button>

        <button
          onClick={() => setActiveTab("spins")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "spins"
              ? "bg-[#FF5500] text-white shadow-lg shadow-[#FF5500]/20"
              : "bg-white/5 text-neutral-400 hover:text-white"
          }`}
        >
          <Mail className="w-4 h-4" />
          Historique des Gains & Leads Emails ({spins.length})
        </button>
      </div>

      {/* Tab 1: Prizes Configuration & Live Preview */}
      {activeTab === "prizes" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Prizes Table (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 shadow-2xl space-y-6`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#FF5500]" />
                  Liste des Lots ({prizes.length})
                </h3>
                <span className="text-xs text-neutral-400 font-mono">
                  Pondération & Ordre d'affichage
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-neutral-400 space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#FF5500]" />
                  <p className="text-xs">Chargement des lots...</p>
                </div>
              ) : prizes.length === 0 ? (
                <div className="p-12 text-center text-neutral-500 space-y-3">
                  <Gift className="w-10 h-10 mx-auto text-neutral-600" />
                  <p className="text-sm font-semibold">Aucun lot configuré pour le moment.</p>
                  <button
                    onClick={openCreateModal}
                    className="px-4 py-2 rounded-xl bg-[#FF5500] text-white text-xs font-bold"
                  >
                    Créer le premier lot
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {prizes.map((prize) => (
                    <div
                      key={prize.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-4 ${
                        prize.isActive
                          ? "bg-[#161622] border-white/10 hover:border-white/20"
                          : "bg-[#0E0E14] border-white/5 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md shrink-0 border border-white/20"
                          style={{ backgroundColor: prize.color, color: prize.textColor }}
                        >
                          {prize.icon}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">{prize.title}</h4>
                            {!prize.isActive && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 font-mono">
                                Masqué
                              </span>
                            )}
                          </div>
                          {prize.subtitle && (
                            <p className="text-xs text-neutral-400 truncate">{prize.subtitle}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                            {prize.couponCode && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-400 font-mono flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {prize.couponCode}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono">
                              Poids: {prize.probability}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono">
                              Stock: {prize.stock === null || prize.stock === undefined ? "Illimité" : prize.stock}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleActive(prize)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                            prize.isActive
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-neutral-800 border-white/10 text-neutral-400 hover:text-white"
                          }`}
                        >
                          {prize.isActive ? "Actif" : "Inactif"}
                        </button>

                        <button
                          onClick={() => openEditModal(prize)}
                          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 text-neutral-300 hover:text-white cursor-pointer"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeletePrize(prize.id, prize.title)}
                          className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Wheel Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 shadow-2xl space-y-6 sticky top-24`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#FF5500]" />
                  Aperçu En Direct de la Roue
                </h3>
                <span className="text-xs text-neutral-400 font-mono">Test Admin</span>
              </div>

              <div className="bg-[#0B0B10] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center">
                <WheelOfFortune prizes={activePrizes} isAdminPreview={true} />
                <p className="text-[11px] text-neutral-500 text-center mt-2">
                  * Testez la roue en mode aperçu admin.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Spins & Email Leads History */}
      {activeTab === "spins" && (
        <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 shadow-2xl space-y-6`}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#FF5500]" />
                Historique des Gagnants & Leads Emails ({spins.length})
              </h3>
              <p className="text-xs text-neutral-400">
                Adresses emails capturées et lots attribués
              </p>
            </div>

            <button
              onClick={handleCopyEmailsList}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              {copiedEmails ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedEmails ? "Emails Copiés !" : "Copier la Liste des Emails"}
            </button>
          </div>

          {spins.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 space-y-2">
              <Mail className="w-10 h-10 mx-auto text-neutral-600" />
              <p className="text-sm font-semibold">Aucun lancer enregistré pour l'instant.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 uppercase font-mono">
                    <th className="py-3 px-4">Date & Heure</th>
                    <th className="py-3 px-4">Email Utilisateur</th>
                    <th className="py-3 px-4">Nom / Prénom</th>
                    <th className="py-3 px-4">Lot Gagné</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {spins.map((spin) => (
                    <tr key={spin.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-neutral-400 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#FF5500]" />
                        {new Date(spin.createdAt).toLocaleString("fr-FR")}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {spin.userEmail ? (
                          <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            {spin.userEmail}
                          </span>
                        ) : (
                          <span className="text-neutral-500 italic">Non renseigné</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-300">
                        {spin.userName || <span className="text-neutral-500 italic">-</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                          {spin.prizeTitle}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Prize Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#14141E] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#FF5500]/20 border border-[#FF5500]/40 text-[#FF5500]">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingPrize ? "Modifier le Lot" : "Nouveau Lot de Loterie"}
                  </h3>
                  <p className="text-xs text-neutral-400">Paramètres visuels et règles de gain</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3 space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Titre du lot</label>
                  <input
                    type="text"
                    placeholder="Ex: -15% Boutique"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A10] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
                <div className="col-span-1 space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Icône / Emoji</label>
                  <input
                    type="text"
                    placeholder="🎁"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A10] border border-white/10 text-white text-center text-lg focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Sous-titre / Description (Optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: Sur toute la boutique Spoolio"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A10] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Couleur du secteur de la roue</label>
                <div className="flex items-center gap-2 flex-wrap pb-1">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => {
                        setFormColor(preset.color);
                        setFormTextColor(preset.textColor);
                      }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        formColor === preset.color ? "scale-125 border-white shadow-lg" : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Code promo (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: SPOOLIE15"
                    value={formCouponCode}
                    onChange={(e) => setFormCouponCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A10] border border-white/10 text-white uppercase placeholder-neutral-500 text-sm font-mono focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Poids / Probabilité (1-50)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formProbability}
                    onChange={(e) => setFormProbability(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A10] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Stock maximal disponible</label>
                <input
                  type="number"
                  placeholder="Vide = Illimité (ex: 5)"
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A10] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0A0A10] border-white/20 text-[#FF5500] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-semibold text-neutral-300 cursor-pointer select-none">
                  Afficher ce lot sur la roue publique
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF6600] text-white text-xs font-bold shadow-lg shadow-[#FF5500]/25 cursor-pointer flex items-center gap-1.5"
                >
                  {editingPrize ? "Enregistrer les modifications" : "Créer le lot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
