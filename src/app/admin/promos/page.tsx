"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Tag,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Calendar,
  Percent,
  Coins,
  Truck,
  Search,
  Sparkles,
  RotateCw,
} from "lucide-react";
import { useAdminTheme } from "../AdminThemeContext";
import {
  PromoCodeItem,
  getAllPromoCodesAdminAction,
  createPromoCodeAdminAction,
  updatePromoCodeAdminAction,
  deletePromoCodeAdminAction,
  togglePromoCodeStatusAdminAction,
  syncLotteryPromoCodesAdminAction,
} from "@/app/actions/promoActions";

export default function AdminPromosPage() {
  const { cls } = useAdminTheme();

  const [promos, setPromos] = useState<PromoCodeItem[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, totalUses: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingTombola, setSyncingTombola] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPromo, setEditingPromo] = useState<PromoCodeItem | null>(null);

  // Form States
  const [formCode, setFormCode] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formDiscountType, setFormDiscountType] = useState<"percentage" | "fixed" | "free_shipping">("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState<number>(10);
  const [formMinOrderAmount, setFormMinOrderAmount] = useState<number>(0);
  const [formMaxUses, setFormMaxUses] = useState<string>("");
  const [formStartDate, setFormStartDate] = useState<string>("");
  const [formEndDate, setFormEndDate] = useState<string>("");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Feedback states
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const data = await getAllPromoCodesAdminAction();
      setPromos(data.promos);
      setStats(data.stats);
    } catch (err: any) {
      console.error("Error refreshing promo codes data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSyncTombola = async () => {
    setSyncingTombola(true);
    setActionError(null);
    try {
      await syncLotteryPromoCodesAdminAction();
      await refreshData();
      setActionSuccess("Synchronisation avec la Tombola et la Roue de la Loterie réussie !");
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError("Erreur lors de la synchronisation avec la Tombola.");
    } finally {
      setSyncingTombola(false);
    }
  };

  const openCreateModal = () => {
    setEditingPromo(null);
    setFormCode("");
    setFormDescription("");
    setFormDiscountType("percentage");
    setFormDiscountValue(10);
    setFormMinOrderAmount(0);
    setFormMaxUses("");
    setFormStartDate("");
    setFormEndDate("");
    setFormIsActive(true);
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: PromoCodeItem) => {
    setEditingPromo(p);
    setFormCode(p.code);
    setFormDescription(p.description || "");
    setFormDiscountType(p.discountType);
    setFormDiscountValue(p.discountValue);
    setFormMinOrderAmount(p.minOrderAmount || 0);
    setFormMaxUses(p.maxUses !== null && p.maxUses !== undefined ? String(p.maxUses) : "");
    setFormStartDate(p.startDate ? p.startDate.split("T")[0] : "");
    setFormEndDate(p.endDate ? p.endDate.split("T")[0] : "");
    setFormIsActive(p.isActive);
    setActionError(null);
    setIsModalOpen(true);
  };

  const generateRandomCode = () => {
    const prefixes = ["SPOOLIO", "FLASH", "VIP", "OFFRE", "SUMMER", "BONUS"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setFormCode(`${prefix}${num}`);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const cleanCode = formCode.trim().toUpperCase();
    if (!cleanCode) {
      setActionError("Veuillez saisir un code promo.");
      return;
    }

    startTransition(async () => {
      try {
        if (editingPromo) {
          await updatePromoCodeAdminAction(editingPromo.id, {
            code: cleanCode,
            description: formDescription,
            discountType: formDiscountType,
            discountValue: Number(formDiscountValue) || 0,
            minOrderAmount: Number(formMinOrderAmount) || 0,
            maxUses: formMaxUses.trim() ? Number(formMaxUses) : null,
            startDate: formStartDate ? new Date(formStartDate).toISOString() : null,
            endDate: formEndDate ? new Date(formEndDate).toISOString() : null,
            isActive: formIsActive,
          });
          setActionSuccess(`Le code promo "${cleanCode}" a été mis à jour avec succès.`);
        } else {
          await createPromoCodeAdminAction({
            code: cleanCode,
            description: formDescription,
            discountType: formDiscountType,
            discountValue: Number(formDiscountValue) || 0,
            minOrderAmount: Number(formMinOrderAmount) || 0,
            maxUses: formMaxUses.trim() ? Number(formMaxUses) : null,
            startDate: formStartDate ? new Date(formStartDate).toISOString() : null,
            endDate: formEndDate ? new Date(formEndDate).toISOString() : null,
            isActive: formIsActive,
          });
          setActionSuccess(`Le code promo "${cleanCode}" a été créé avec succès.`);
        }
        setIsModalOpen(false);
        await refreshData();
        setTimeout(() => setActionSuccess(null), 4000);
      } catch (err: any) {
        setActionError(err.message || "Erreur lors de l'enregistrement du code promo.");
      }
    });
  };

  const handleToggleStatus = (p: PromoCodeItem) => {
    startTransition(async () => {
      try {
        await togglePromoCodeStatusAdminAction(p.id, !p.isActive);
        setPromos((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, isActive: !item.isActive } : item))
        );
        setActionSuccess(`Statut du code "${p.code}" mis à jour.`);
        setTimeout(() => setActionSuccess(null), 3000);
      } catch (err: any) {
        setActionError(err.message || "Erreur de modification du statut.");
      }
    });
  };

  const handleDelete = (p: PromoCodeItem) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le code "${p.code}" ?`)) return;

    startTransition(async () => {
      try {
        await deletePromoCodeAdminAction(p.id);
        setActionSuccess(`Code promo "${p.code}" supprimé.`);
        await refreshData();
        setTimeout(() => setActionSuccess(null), 3000);
      } catch (err: any) {
        setActionError(err.message || "Erreur de suppression.");
      }
    });
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredPromos = promos.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (typeFilter === "all") return true;
    if (typeFilter === "tombola") {
      return p.description && (p.description.includes("Tombola") || p.description.includes("Loterie"));
    }
    return p.discountType === typeFilter;
  });

  return (
    <div className={`p-6 max-w-7xl mx-auto space-y-6 ${cls.textMain}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#ff4f00]/10 border border-[#ff4f00]/20 text-[#ff4f00]">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Codes Promo Panier</h1>
              <p className={`text-xs ${cls.textMuted}`}>
                Gérez les réductions du panier Spoolio (incluant automatiquement les codes de la Tombola & Loterie).
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncTombola}
            disabled={syncingTombola}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all cursor-pointer ${
              syncingTombola ? "opacity-75 cursor-not-allowed" : ""
            }`}
            title="Importer et synchroniser automatiquement les codes créés dans la Tombola & Roue de la chance"
          >
            <RotateCw className={`w-3.5 h-3.5 ${syncingTombola ? "animate-spin" : ""}`} />
            <span>{syncingTombola ? "Synchronisation..." : "Sync Tombola"}</span>
          </button>

          <button
            onClick={refreshData}
            disabled={loading}
            className={`p-2.5 rounded-xl border ${cls.border} ${cls.cardBg} hover:opacity-80 transition-opacity cursor-pointer`}
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff4f00] hover:bg-[#e04500] text-white font-bold text-xs shadow-lg shadow-[#ff4f00]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Code Promo</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border ${cls.border} ${cls.cardBg} flex items-center justify-between shadow-sm`}>
          <div>
            <span className={`text-xs font-bold ${cls.textMuted} uppercase tracking-wider block`}>
              Total des Codes
            </span>
            <span className="text-2xl font-black mt-1 block font-mono">{stats.total}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${cls.border} ${cls.cardBg} flex items-center justify-between shadow-sm`}>
          <div>
            <span className={`text-xs font-bold ${cls.textMuted} uppercase tracking-wider block`}>
              Codes Actifs
            </span>
            <span className="text-2xl font-black mt-1 block font-mono text-emerald-400">
              {stats.active}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${cls.border} ${cls.cardBg} flex items-center justify-between shadow-sm`}>
          <div>
            <span className={`text-xs font-bold ${cls.textMuted} uppercase tracking-wider block`}>
              Utilisations Totales
            </span>
            <span className="text-2xl font-black mt-1 block font-mono text-[#ff4f00]">
              {stats.totalUses}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ff4f00]/10 text-[#ff4f00] border border-[#ff4f00]/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={`p-4 rounded-2xl border ${cls.border} ${cls.cardBg} flex flex-col sm:flex-row gap-3 items-center justify-between`}>
        <div className="relative w-full sm:w-80">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${cls.textMuted}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un code ou une note..."
            className={`w-full h-10 pl-9 pr-3 rounded-xl border ${cls.border} ${cls.inputBg} text-xs focus:outline-none focus:border-[#ff4f00] transition-colors`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`h-10 px-3 rounded-xl border ${cls.border} ${cls.inputBg} text-xs focus:outline-none focus:border-[#ff4f00] transition-colors cursor-pointer w-full sm:w-auto`}
          >
            <option value="all">Tous les types</option>
            <option value="tombola">🎡 Tombola / Loterie</option>
            <option value="percentage">Pourcentage (%)</option>
            <option value="fixed">Montant fixe (€)</option>
            <option value="free_shipping">Livraison Offerte</option>
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className={`rounded-2xl border ${cls.border} ${cls.cardBg} overflow-hidden shadow-sm`}>
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#ff4f00] mb-2" />
            <span className={`text-xs ${cls.textMuted}`}>Chargement des codes promos...</span>
          </div>
        ) : filteredPromos.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className={`w-10 h-10 mx-auto ${cls.textMuted} mb-3 opacity-40`} />
            <h3 className="text-sm font-bold">Aucun code promo trouvé</h3>
            <p className={`text-xs ${cls.textMuted} mt-1`}>
              {searchQuery ? "Essayez une autre recherche." : "Créez votre premier code promotionnel ou synchronisez la Tombola."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className={`border-b ${cls.border} bg-white/[0.02] text-[11px] font-bold ${cls.textMuted} uppercase tracking-wider`}>
                <tr>
                  <th className="py-3.5 px-4">Code Promo</th>
                  <th className="py-3.5 px-4">Type & Valeur</th>
                  <th className="py-3.5 px-4">Conditions</th>
                  <th className="py-3.5 px-4">Validité</th>
                  <th className="py-3.5 px-4">Utilisations</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${cls.divider}`}>
                {filteredPromos.map((p) => {
                  const isExpired = p.endDate && new Date(p.endDate) < new Date();
                  const isNotStarted = p.startDate && new Date(p.startDate) > new Date();
                  const isFromTombola = p.description && (p.description.includes("Tombola") || p.description.includes("Loterie"));

                  return (
                    <tr key={p.id} className={`${cls.hoverRow} transition-colors group`}>
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-sm text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                            {p.code}
                          </span>
                          <button
                            onClick={() => handleCopy(p.code)}
                            className={`p-1.5 rounded-md hover:bg-white/10 ${cls.textMuted} hover:text-white transition-colors cursor-pointer`}
                            title="Copier le code"
                          >
                            {copiedCode === p.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {isFromTombola && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                              🎡 Tombola
                            </span>
                          )}
                        </div>
                        {p.description && (
                          <span className={`text-[10px] ${cls.textMuted} block mt-1 truncate max-w-xs`}>
                            {p.description}
                          </span>
                        )}
                      </td>

                      {/* Type & Valeur */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {p.discountType === "percentage" ? (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                              <Percent className="w-3 h-3" /> -{p.discountValue}%
                            </span>
                          ) : p.discountType === "fixed" ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                              <Coins className="w-3 h-3" /> -{p.discountValue.toFixed(2)}€
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md border border-blue-400/20">
                              <Truck className="w-3 h-3" /> Port Offert
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Conditions */}
                      <td className="py-3.5 px-4">
                        {p.minOrderAmount > 0 ? (
                          <span className="font-semibold text-gray-300">
                            Min. {p.minOrderAmount.toFixed(2)}€
                          </span>
                        ) : (
                          <span className={`text-[11px] ${cls.textMuted}`}>Aucun minimum</span>
                        )}
                      </td>

                      {/* Validité */}
                      <td className="py-3.5 px-4">
                        {isExpired ? (
                          <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                            Expiré ({new Date(p.endDate!).toLocaleDateString("fr-FR")})
                          </span>
                        ) : isNotStarted ? (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            Débute le {new Date(p.startDate!).toLocaleDateString("fr-FR")}
                          </span>
                        ) : p.endDate ? (
                          <span className="text-[11px] text-gray-300 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            <span>Jusqu'au {new Date(p.endDate).toLocaleDateString("fr-FR")}</span>
                          </span>
                        ) : (
                          <span className={`text-[11px] ${cls.textMuted}`}>Illimitée</span>
                        )}
                      </td>

                      {/* Utilisations */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-gray-200">
                          {p.usedCount}
                          {p.maxUses ? (
                            <span className={cls.textMuted}> / {p.maxUses}</span>
                          ) : (
                            <span className={cls.textMuted}> / ∞</span>
                          )}
                        </span>
                      </td>

                      {/* Statut Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            p.isActive
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                          <span>{p.isActive ? "Actif" : "Désactivé"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className={`p-2 rounded-lg hover:bg-white/10 ${cls.textMuted} hover:text-white transition-colors cursor-pointer`}
                            title="Modifier"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans select-none">
          <div className={`relative w-full max-w-lg rounded-3xl border ${cls.border} ${cls.cardBg} p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#ff4f00]/10 border border-[#ff4f00]/20 text-[#ff4f00]">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingPromo ? `Modifier ${editingPromo.code}` : "Créer un Code Promo"}
                  </h3>
                  <span className={`text-xs ${cls.textMuted}`}>
                    Définissez les paramètres de réduction et conditions d'accès.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-2 rounded-xl hover:bg-white/10 ${cls.textMuted} hover:text-white transition-colors cursor-pointer`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSavePromo} className="space-y-4">
              {/* Code */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Code Promo <span className="text-[#ff4f00]">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="Ex: SPOOLIO10"
                    className={`flex-1 h-11 px-3.5 rounded-xl border ${cls.border} ${cls.inputBg} text-sm font-mono font-bold uppercase tracking-wider text-white focus:outline-none focus:border-[#ff4f00] transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3 h-11 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer shrink-0"
                    title="Générer un code aléatoire"
                  >
                    🎲 Aléatoire
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Description / Note interne (optionnelle)
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ex: Offre spéciale pour la rentrée"
                  className={`w-full h-10 px-3 rounded-xl border ${cls.border} ${cls.inputBg} text-xs text-white focus:outline-none focus:border-[#ff4f00] transition-colors`}
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Type de Réduction
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "percentage", label: "Pourcentage (%)", icon: "%" },
                    { id: "fixed", label: "Montant Fixe (€)", icon: "€" },
                    { id: "free_shipping", label: "Port Offert", icon: "🚚" },
                  ].map((t) => {
                    const active = formDiscountType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFormDiscountType(t.id as any)}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          active
                            ? "bg-[#ff4f00]/15 border-[#ff4f00] text-white"
                            : `${cls.inputBg} ${cls.border} ${cls.textMuted} hover:text-white`
                        }`}
                      >
                        <span className="text-base">{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Value & Min Amount */}
              <div className="grid grid-cols-2 gap-3">
                {formDiscountType !== "free_shipping" && (
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1.5">
                      Valeur ({formDiscountType === "percentage" ? "%" : "€"}) <span className="text-[#ff4f00]">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(parseFloat(e.target.value) || 0)}
                      className={`w-full h-10 px-3 rounded-xl border ${cls.border} ${cls.inputBg} text-xs font-bold text-white focus:outline-none focus:border-[#ff4f00] transition-colors`}
                    />
                  </div>
                )}

                <div className={formDiscountType === "free_shipping" ? "col-span-2" : ""}>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">
                    Panier Minimum Requis (€)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formMinOrderAmount}
                    onChange={(e) => setFormMinOrderAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0 = sans minimum"
                    className={`w-full h-10 px-3 rounded-xl border ${cls.border} ${cls.inputBg} text-xs font-bold text-white focus:outline-none focus:border-[#ff4f00] transition-colors`}
                  />
                </div>
              </div>

              {/* Max Uses */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Nombre max d'utilisations (optionnel)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formMaxUses}
                  onChange={(e) => setFormMaxUses(e.target.value)}
                  placeholder="Laissez vide pour illimité"
                  className={`w-full h-10 px-3 rounded-xl border ${cls.border} ${cls.inputBg} text-xs text-white focus:outline-none focus:border-[#ff4f00] transition-colors`}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className={`w-full h-10 px-3 rounded-xl border ${cls.border} ${cls.inputBg} text-xs text-white focus:outline-none focus:border-[#ff4f00] transition-colors cursor-pointer`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">
                    Date d'expiration
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className={`w-full h-10 px-3 rounded-xl border ${cls.border} ${cls.inputBg} text-xs text-white focus:outline-none focus:border-[#ff4f00] transition-colors cursor-pointer`}
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs font-bold text-white">Activer ce code dès maintenant</span>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    formIsActive ? "bg-emerald-500 justify-end" : "bg-gray-700 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md transform" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2.5 rounded-xl border ${cls.border} hover:bg-white/5 text-xs font-bold text-gray-300 transition-colors cursor-pointer`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-[#ff4f00] hover:bg-[#e04500] disabled:bg-[#ff4f00]/50 text-xs font-black text-white shadow-lg shadow-[#ff4f00]/25 transition-all cursor-pointer"
                >
                  {isPending ? "Enregistrement..." : editingPromo ? "Mettre à jour" : "Créer le code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
