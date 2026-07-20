"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";

export default function PickupSlotsPage() {
  const { cls, theme } = useAdminTheme();
  const [pickupSlots, setPickupSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [savingSlots, setSavingSlots] = useState<boolean>(false);
  const [newSlotText, setNewSlotText] = useState<string>("");
  const [slotsSuccess, setSlotsSuccess] = useState<string | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const fetchPickupSlots = async () => {
    setLoadingSlots(true);
    try {
      const res = await fetch("/api/pickup-slots");
      if (res.ok) {
        const data = await res.json();
        setPickupSlots(data.slots || []);
      }
    } catch (e) {
      console.error("Failed to load pickup slots:", e);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchPickupSlots();
  }, []);

  const handleSavePickupSlots = async (updatedSlots: string[]) => {
    setSavingSlots(true);
    setSlotsError(null);
    setSlotsSuccess(null);

    try {
      const res = await fetch("/api/pickup-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: updatedSlots }),
      });
      if (res.ok) {
        setSlotsSuccess("Liste des créneaux mise à jour avec succès !");
        setTimeout(() => setSlotsSuccess(null), 3000);
      } else {
        const data = await res.json();
        setSlotsError(data.error || "Erreur de sauvegarde.");
      }
    } catch (err) {
      setSlotsError("Erreur réseau.");
    } finally {
      setSavingSlots(false);
    }
  };

  const handleAddSlot = () => {
    if (!newSlotText.trim()) return;
    if (pickupSlots.includes(newSlotText.trim())) {
      setSlotsError("Ce créneau existe déjà.");
      setTimeout(() => setSlotsError(null), 3000);
      return;
    }

    const updated = [...pickupSlots, newSlotText.trim()];
    setPickupSlots(updated);
    setNewSlotText("");
    handleSavePickupSlots(updated);
  };

  const handleRemoveSlot = (index: number) => {
    const updated = pickupSlots.filter((_, i) => i !== index);
    setPickupSlots(updated);
    handleSavePickupSlots(updated);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/admin" className={`text-xs ${cls.textMuted} hover:text-white transition-colors`}>
              &larr; Retour Dashboard
            </Link>
          </div>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Créneaux de Retrait 📅</h1>
          <p className={`text-sm ${cls.textMuted} mt-1`}>
            Gérez les tranches horaires disponibles pour les retraits en Click & Collect à l'Atelier de Comines.
          </p>
        </div>
      </div>

      <div className={`p-8 rounded-[32px] border ${cls.border} ${cls.cardBg} shadow-2xl space-y-6 font-sans no-invert`}>
        <div>
          <h3 className={`text-xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Gestion des créneaux Click & Collect</h3>
          <p className={`text-xs ${cls.textMuted} mt-1`}>
            Définissez la liste des créneaux horaires que vous proposez pour le retrait des commandes. Les clients devront obligatoirement choisir parmi ces options au panier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${cls.textMain}`}>Ajouter un nouveau créneau</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSlotText}
                onChange={(e) => setNewSlotText(e.target.value)}
                placeholder="Ex: Samedi 25 Juillet - 14h à 16h"
                className={`flex-1 h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9] text-xs`}
                onKeyDown={(e) => e.key === "Enter" && handleAddSlot()}
              />
              <button
                onClick={handleAddSlot}
                disabled={savingSlots}
                className="h-10 px-4 bg-white hover:bg-white/90 text-black text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-50 shadow-md shadow-white/5"
              >
                Ajouter ➕
              </button>
            </div>

            {slotsSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs leading-normal">
                ✓ {slotsSuccess}
              </div>
            )}
            {slotsError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs leading-normal">
                ⚠️ {slotsError}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${cls.textMain}`}>Créneaux actuellement proposés</h4>
            
            {loadingSlots ? (
              <div className={`text-xs ${cls.textMuted} italic animate-pulse`}>Chargement des créneaux...</div>
            ) : pickupSlots.length === 0 ? (
              <div className={`text-xs ${cls.textMuted} italic`}>Aucun créneau configuré. Les créneaux par défaut seront appliqués.</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {pickupSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-xl border ${cls.border} ${cls.inputBg} text-xs`}
                  >
                    <span className={`font-bold ${cls.textMain}`}>{slot}</span>
                    <button
                      onClick={() => handleRemoveSlot(index)}
                      className="text-red-400 hover:text-red-600 font-bold hover:scale-105 transition-all cursor-pointer p-1 text-base leading-none border-transparent"
                      title="Supprimer ce créneau"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
