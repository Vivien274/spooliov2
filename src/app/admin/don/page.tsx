"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";

interface DonationTier {
  id: string;
  amount: number;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  color: string;
  isActive: boolean;
}

export default function AdminDonationTiersPage() {
  const { cls } = useAdminTheme();
  const [tiers, setTiers] = useState<DonationTier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingTier, setEditingTier] = useState<Partial<DonationTier> | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTiers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/don/tiers");
      if (res.ok) {
        const data = await res.json();
        setTiers(data.tiers || []);
      }
    } catch (e) {
      console.error("Failed to load donation tiers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;

    setSaving(true);
    setError(null);

    const isNew = !editingTier.id;
    const url = "/api/admin/don/tiers";
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTier),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de la sauvegarde.");
      }

      await fetchTiers();
      setEditingTier(null);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce palier de don ?")) return;

    try {
      const res = await fetch(`/api/admin/don/tiers?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchTiers();
      } else {
        const err = await res.json();
        alert(err.error || "Impossible de supprimer ce palier.");
      }
    } catch (e) {
      alert("Erreur réseau.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans selection:bg-[#ff4f00] selection:text-black">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/admin" className={`text-xs ${cls.textMuted} hover:text-white transition-colors`}>
              &larr; Retour Dashboard
            </Link>
          </div>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Configuration des Dons 🧡</h1>
          <p className={`text-sm ${cls.textMuted} mt-1 font-sans`}>
            Gérez les différents paliers d'entraide affichés aux clients sur la page publique.
          </p>
        </div>

        <button
          onClick={() => setEditingTier({ amount: 10, title: "", subtitle: "", description: "", emoji: "🎁", color: "orange", isActive: true })}
          className="h-12 px-6 rounded-xl bg-white hover:bg-white/95 text-black font-extrabold text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          + Ajouter un palier
        </button>
      </div>

      {/* Main card panel */}
      <div className={`p-8 rounded-[32px] border ${cls.border} ${cls.cardBg} shadow-2xl space-y-6 font-sans`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Liste des paliers de dons</h3>
            <p className={`text-xs ${cls.textMuted} mt-1`}>
              Modifiez l'apparence des paliers ou désactivez-les temporairement pour les masquer de la page publique.
            </p>
          </div>
          <button
            onClick={fetchTiers}
            disabled={loading}
            className={`text-xs px-3 py-1.5 rounded-lg border ${cls.border} ${cls.inputBg} hover:text-white cursor-pointer transition-colors`}
          >
            {loading ? "Chargement..." : "Rafraîchir 🔄"}
          </button>
        </div>

        {loading ? (
          <div className={`text-xs ${cls.textMuted} italic animate-pulse py-12 text-center`}>
            Chargement des paliers de dons...
          </div>
        ) : tiers.length === 0 ? (
          <div className={`text-xs ${cls.textMuted} italic py-12 text-center`}>
            Aucun palier de don configuré en base de données. Cliquez sur "+ Ajouter un palier" pour commencer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className={`border-b ${cls.border} text-gray-500 font-bold uppercase tracking-wider text-[10px]`}>
                  <th className="py-3 px-4 w-16 text-center">Emoji</th>
                  <th className="py-3 px-4 w-20">Montant</th>
                  <th className="py-3 px-4">Titre / Sous-titre</th>
                  <th className="py-3 px-4 max-w-xs">Description</th>
                  <th className="py-3 px-4 w-20">Thème</th>
                  <th className="py-3 px-4 w-24 text-center">Statut</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${cls.divider}`}>
                {tiers.map((tier) => (
                  <tr key={tier.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-4 text-center text-2xl select-none">
                      {tier.emoji}
                    </td>
                    <td className={`py-4 px-4 font-black text-sm ${cls.textMain}`}>
                      {tier.amount} €
                    </td>
                    <td className="py-4 px-4">
                      <span className={`block font-bold ${cls.textMain}`}>{tier.title}</span>
                      <span className={`block text-[10px] ${cls.textFaint}`}>{tier.subtitle}</span>
                    </td>
                    <td className={`py-4 px-4 text-gray-400 max-w-xs truncate`} title={tier.description}>
                      {tier.description}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        tier.color === "orange" 
                          ? "bg-[#ff4f00]/10 text-[#ff4f00] border border-[#ff4f00]/25" 
                          : "bg-[#2F3CD9]/10 text-[#2F3CD9] border border-[#2F3CD9]/25"
                      }`}>
                        {tier.color}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        tier.isActive 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {tier.isActive ? "Actif (Visible)" : "Désactivé"}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right space-x-2">
                      <button
                        onClick={() => setEditingTier(tier)}
                        className={`px-2.5 py-1.5 rounded-lg border ${cls.border} ${cls.inputBg} hover:text-white cursor-pointer transition-colors text-[10px] font-bold uppercase tracking-wider`}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(tier.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer transition-colors text-[10px] font-bold uppercase tracking-wider"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editing / Creating Modal */}
      {editingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-3xl border ${cls.border} ${cls.cardBg} shadow-2xl p-6 md:p-8 space-y-6 animate-scale-up`}>
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className={`text-lg font-black font-antonio uppercase tracking-widest ${cls.textMain}`}>
                {editingTier.id ? "Modifier le Palier" : "Créer un Palier"}
              </h3>
              <button 
                onClick={() => setEditingTier(null)}
                className="text-gray-500 hover:text-white transition-colors cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2 animate-pulse">
                <span className="text-sm">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Amount */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">Montant (€)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingTier.amount || ""}
                    onChange={(e) => setEditingTier(prev => ({ ...prev, amount: parseInt(e.target.value, 10) }))}
                    className={`w-full h-11 px-3 ${cls.inputBg} border ${cls.border} rounded-xl ${cls.textMain} outline-none focus:border-[#ff4f00]/50 transition-colors text-xs font-bold`}
                  />
                </div>

                {/* Emoji */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">Emoji (icône)</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={editingTier.emoji || ""}
                    onChange={(e) => setEditingTier(prev => ({ ...prev, emoji: e.target.value }))}
                    className={`w-full h-11 px-3 ${cls.inputBg} border ${cls.border} rounded-xl ${cls.textMain} outline-none focus:border-[#ff4f00]/50 transition-colors text-xs text-center`}
                  />
                </div>

                {/* Color Scheme */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">Thème Couleur</label>
                  <select
                    value={editingTier.color || "orange"}
                    onChange={(e) => setEditingTier(prev => ({ ...prev, color: e.target.value }))}
                    className={`w-full h-11 px-3 ${cls.inputBg} border ${cls.border} rounded-xl ${cls.textMain} outline-none focus:border-[#ff4f00]/50 transition-colors text-xs font-bold`}
                  >
                    <option value="orange">Orange</option>
                    <option value="blue">Bleu</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">Titre</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Une Buse en Laiton"
                  value={editingTier.title || ""}
                  onChange={(e) => setEditingTier(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full h-11 px-4 ${cls.inputBg} border ${cls.border} rounded-xl ${cls.textMain} outline-none focus:border-[#ff4f00]/50 transition-colors text-xs font-semibold`}
                />
              </div>

              {/* Subtitle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">Sous-titre</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Entretien Précision"
                  value={editingTier.subtitle || ""}
                  onChange={(e) => setEditingTier(prev => ({ ...prev, subtitle: e.target.value }))}
                  className={`w-full h-11 px-4 ${cls.inputBg} border ${cls.border} rounded-xl ${cls.textMain} outline-none focus:border-[#ff4f00]/50 transition-colors text-xs font-semibold`}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">Description d'impact</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Expliquez concrètement ce que ce don finance..."
                  value={editingTier.description || ""}
                  onChange={(e) => setEditingTier(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full p-4 ${cls.inputBg} border ${cls.border} rounded-xl ${cls.textMain} outline-none focus:border-[#ff4f00]/50 transition-colors text-xs font-sans leading-relaxed resize-none`}
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingTier.isActive !== false}
                  onChange={(e) => setEditingTier(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-[#ff4f00] focus:ring-[#ff4f00]"
                />
                <label htmlFor="isActive" className={`text-xs font-bold cursor-pointer select-none ${cls.textMain}`}>
                  Activer le palier (visible publiquement)
                </label>
              </div>

              {/* Actions submit */}
              <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingTier(null)}
                  className={`px-4 py-2.5 rounded-xl border ${cls.border} ${cls.inputBg} hover:text-white cursor-pointer transition-colors text-xs font-bold uppercase tracking-wider`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-white/95 text-black font-extrabold text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:bg-white/50"
                >
                  {saving ? "Sauvegarde..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
