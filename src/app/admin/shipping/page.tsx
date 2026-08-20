"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";
import { DEFAULT_SHIPPING_CONFIG, ShippingConfig } from "@/types/shipping";

export default function AdminShippingPage() {
  const { cls } = useAdminTheme();
  const [config, setConfig] = useState<ShippingConfig>(DEFAULT_SHIPPING_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Live Simulator state
  const [simulatedCartTotal, setSimulatedCartTotal] = useState<number>(35);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shipping");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (err) {
      console.error("Failed to load shipping config:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleChange = (field: keyof ShippingConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Configuration financière et tarifs de livraison enregistrés avec succès !");
        if (data.config) {
          setConfig(data.config);
        }
      } else {
        setError(data.error || "Erreur lors de la sauvegarde.");
      }
    } catch (err) {
      setError("Erreur réseau lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  // Live Simulator Calculations
  const simMissing = Math.max(0, config.freeShippingThreshold - simulatedCartTotal);
  const simProgress = Math.min(100, (simulatedCartTotal / config.freeShippingThreshold) * 100);
  const simIsFree = simulatedCartTotal >= config.freeShippingThreshold;
  const simRelayCost = simIsFree ? 0 : config.relayShippingCost;
  const simHomeCost = simIsFree ? 0 : config.homeShippingCost;

  return (
    <div className="max-w-[1720px] mx-auto w-full px-2 sm:px-4 lg:px-6 space-y-8 font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#ff4f00] bg-[#ff4f00]/10 border border-[#ff4f00]/30 px-2.5 py-1 rounded-full uppercase tracking-widest">
              🚚 GESTION FINANCIÈRE & LIVRAISON
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black ${cls.textMain} uppercase tracking-tight font-antonio mt-1`}>
            Tarifs de Livraison & Seuils de Gratuité
          </h1>
          <p className={`text-xs ${cls.textMuted} mt-1 max-w-2xl`}>
            Configurez le montant minimum pour la livraison gratuite, les frais d'expédition légère (Point Relais) ou lourde (Domicile) et visualisez l'impact en direct sur les paniers de vos clients.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl transition-all w-fit"
        >
          ← Retour au Dashboard
        </Link>
      </div>

      {loading ? (
        <div className={`p-8 text-center font-mono text-sm ${cls.textMuted}`}>
          Chargement des paramètres financiers...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT FORM PANEL (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Card 1: Seuil de Gratuité */}
              <div className={`p-5 sm:p-6 rounded-3xl ${cls.cardBg} ${cls.border} border shadow-xl space-y-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#ff4f00]/15 border border-[#ff4f00]/30 text-[#ff4f00] flex items-center justify-center font-bold text-lg">
                    🎁
                  </div>
                  <div>
                    <h3 className={`text-base font-extrabold uppercase font-antonio tracking-wide ${cls.textMain}`}>
                      Livraison Gratuite (Seuil de Gratuité)
                    </h3>
                    <p className={`text-xs ${cls.textMuted}`}>
                      Montant du panier à partir duquel les frais de port deviennent entièrement offerts.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${cls.textFaint}`}>
                    Montant Minimum du Panier (€)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={config.freeShippingThreshold}
                      onChange={(e) => handleChange("freeShippingThreshold", parseFloat(e.target.value) || 0)}
                      className={`w-full h-12 border rounded-xl px-4 text-base font-mono font-black outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#ff4f00]`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono font-black text-sm text-[#ff4f00]">
                      €
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Actuellement défini à <strong className="text-white font-mono">{config.freeShippingThreshold.toFixed(2)}€</strong>. Les clients verront une jauge se remplir dans le panier jusqu'à atteindre ce montant.
                  </p>
                </div>
              </div>

              {/* Card 2: Tarifs de Livraison */}
              <div className={`p-5 sm:p-6 rounded-3xl ${cls.cardBg} ${cls.border} border shadow-xl space-y-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-lg">
                    📦
                  </div>
                  <div>
                    <h3 className={`text-base font-extrabold uppercase font-antonio tracking-wide ${cls.textMain}`}>
                      Tarifs d'Expédition (Hors Gratuité)
                    </h3>
                    <p className={`text-xs ${cls.textMuted}`}>
                      Frais appliqués si le panier est inférieur au seuil de gratuité.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Point Relais / Livraison Légère */}
                  <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <label className={`text-[11px] font-extrabold uppercase tracking-wider ${cls.textFaint}`}>
                      🏪 Point Relais / Livraison Légère (€)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        value={config.relayShippingCost}
                        onChange={(e) => handleChange("relayShippingCost", parseFloat(e.target.value) || 0)}
                        className={`w-full h-11 border rounded-xl px-3 text-sm font-mono font-bold outline-none ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-blue-400`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-blue-400 font-bold">€</span>
                    </div>
                    <span className="text-[10px] text-gray-400">Mondial Relay, Boxtal ou relais partenaire.</span>
                  </div>

                  {/* Domicile / Livraison Lourde */}
                  <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <label className={`text-[11px] font-extrabold uppercase tracking-wider ${cls.textFaint}`}>
                      🏠 Domicile / Livraison Express (€)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        value={config.homeShippingCost}
                        onChange={(e) => handleChange("homeShippingCost", parseFloat(e.target.value) || 0)}
                        className={`w-full h-11 border rounded-xl px-3 text-sm font-mono font-bold outline-none ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-blue-400`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-blue-400 font-bold">€</span>
                    </div>
                    <span className="text-[10px] text-gray-400">Colissimo ou livraison à domicile standard.</span>
                  </div>

                  {/* Retrait Atelier / Click & Collect */}
                  <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 sm:col-span-2">
                    <label className={`text-[11px] font-extrabold uppercase tracking-wider ${cls.textFaint}`}>
                      🏢 Retrait à l'Atelier / Click & Collect (€)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        value={config.pickupShippingCost}
                        onChange={(e) => handleChange("pickupShippingCost", parseFloat(e.target.value) || 0)}
                        className={`w-full h-11 border rounded-xl px-3 text-sm font-mono font-bold outline-none ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-emerald-400`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-emerald-400 font-bold">€</span>
                    </div>
                    <span className="text-[10px] text-gray-400">Généralement à 0.00€ pour le retrait gratuit à l'atelier de Comines.</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Réassurance & Code Promo */}
              <div className={`p-5 sm:p-6 rounded-3xl ${cls.cardBg} ${cls.border} border shadow-xl space-y-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
                    ✨
                  </div>
                  <div>
                    <h3 className={`text-base font-extrabold uppercase font-antonio tracking-wide ${cls.textMain}`}>
                      Options & Message d'Expédition
                    </h3>
                    <p className={`text-xs ${cls.textMuted}`}>
                      Bannière d'information affichée dans le panier et lors du passage de commande.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[11px] font-extrabold uppercase tracking-wider ${cls.textFaint}`}>
                      Texte de Réassurance Livraison
                    </label>
                    <input
                      type="text"
                      value={config.shippingNotice}
                      onChange={(e) => handleChange("shippingNotice", e.target.value)}
                      placeholder="Ex: Expédition rapide sous 24/48h depuis notre atelier de Comines (59) 🇫🇷"
                      className={`h-11 border rounded-xl px-3 text-xs outline-none ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-emerald-400`}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <span className="text-xs font-bold text-white block">Codes Promo "Port Offert"</span>
                      <span className="text-[10px] text-gray-400">Autoriser les codes promo offrant les frais de port indépendamment du montant</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.enablePromoFreeShipping}
                      onChange={(e) => handleChange("enablePromoFreeShipping", e.target.checked)}
                      className="w-5 h-5 rounded border border-white/20 text-[#ff4f00] bg-transparent focus:ring-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Status Notifications */}
              {success && (
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-medium leading-relaxed">
                  ✓ {success}
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/15 border border-red-500/30 text-red-400 rounded-2xl text-xs font-medium leading-relaxed">
                  ⚠️ {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full h-13 flex items-center justify-center text-white bg-[#ff4f00] hover:bg-[#e04500] text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-lg shadow-[#ff4f00]/25 disabled:opacity-50"
              >
                {saving ? "Enregistrement en cours..." : "Enregistrer les Tarifs & Paramètres Financiers"}
              </button>

            </form>
          </div>

          {/* RIGHT PANEL: LIVE FINANCIAL SIMULATOR (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-widest font-antonio`}>
                ⚡ Simulateur Financier en Direct
              </h3>
              <p className={`text-xs ${cls.textMuted} mt-0.5`}>
                Ajustez le curseur de sous-total panier ci-dessous pour vérifier exactement comment s'appliqueront les frais et la gratuité.
              </p>
            </div>

            <div className={`p-6 rounded-3xl ${cls.cardBg} ${cls.border} border shadow-2xl space-y-5 relative overflow-hidden`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-gray-300">Simuler un Panier Client</span>
                  <span className="text-xl font-black font-mono text-[#ff4f00]">{simulatedCartTotal.toFixed(2)}€</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="1"
                  value={simulatedCartTotal}
                  onChange={(e) => setSimulatedCartTotal(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff4f00]"
                />
              </div>

              {/* Simulated Cart Progress Bar */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  {simMissing > 0 ? (
                    <span className="text-gray-300 text-xs">
                      Plus que <strong className="text-[#ff4f00] font-black">{simMissing.toFixed(2)}€</strong> pour la livraison offerte
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-black text-xs">
                      🎉 LIVRAISON OFFERTE DÉBLOQUÉE !
                    </span>
                  )}
                  <span className="text-xs font-mono font-black text-white">{Math.round(simProgress)}%</span>
                </div>

                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden border border-white/15">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      simMissing > 0 ? "bg-gradient-to-r from-[#ff4f00] to-amber-400" : "bg-emerald-400"
                    }`}
                    style={{ width: `${simProgress}%` }}
                  />
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 text-xs font-sans">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Sous-total articles</span>
                  <span className="font-mono text-white font-bold">{simulatedCartTotal.toFixed(2)}€</span>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <span>Expédition Point Relais</span>
                  <span className="font-mono font-bold text-white">
                    {simRelayCost === 0 ? <strong className="text-emerald-400">GRATUIT (0.00€)</strong> : `${simRelayCost.toFixed(2)}€`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <span>Expédition Domicile</span>
                  <span className="font-mono font-bold text-white">
                    {simHomeCost === 0 ? <strong className="text-emerald-400">GRATUIT (0.00€)</strong> : `${simHomeCost.toFixed(2)}€`}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="font-bold text-white uppercase">Total Estimé (Relais)</span>
                  <span className="text-lg font-black font-antonio text-white">
                    {(simulatedCartTotal + simRelayCost).toFixed(2)}€
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 italic leading-snug">
                💬 {config.shippingNotice}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
