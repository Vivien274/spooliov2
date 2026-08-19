"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Fiche, FicheType, FicheData } from "@/lib/badgeTypes";
import Particles from "@/components/badges/Particles";

export default function EditBadgePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [fiche, setFiche] = useState<Fiche | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [claimCode, setClaimCode] = useState<string>("");
  const [type, setType] = useState<FicheType>("festivalier");
  const [formData, setFormData] = useState<FicheData>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchBadge();
  }, [token]);

  const fetchBadge = async () => {
    try {
      const res = await fetch(`/api/badges?token=${token}`);
      if (res.ok) {
        const data = await res.json();
        if (data.fiche) {
          setFiche(data.fiche);
          setType(data.fiche.type || "festivalier");
          setFormData(data.fiche.data || {});
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          type,
          claimCode,
          password,
          data: formData,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setMessage({ type: "success", text: result.message || "Fiche mise à jour avec succès !" });
        fetchBadge();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur de sauvegarde." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erreur réseau lors de la sauvegarde." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e12] flex items-center justify-center text-white font-sans text-xs">
        Chargement du badge Spoolio...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0e0e12] text-white px-4 py-8 flex flex-col items-center justify-center font-sans relative">
      <Particles variant={type} />

      <div className="w-full max-w-md bg-[#16161c] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff4f00]">
              Configuration Badge NFC #{token.substring(0, 8)}
            </span>
            <h1 className="text-xl font-black font-antonio uppercase tracking-tight text-white mt-0.5">
              {fiche?.is_claimed ? "Modifier ma fiche SOS" : "Activer mon badge SOS"}
            </h1>
          </div>
          <Link
            href={`/badges/${token}`}
            className="text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition-colors font-bold"
          >
            ← Voir
          </Link>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold border ${
              message.type === "success"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-red-500/20 text-red-300 border-red-500/40"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Badge Type Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-300">Type de Badge / Profil</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-black/40 border border-white/10 rounded-2xl">
              {(["festivalier", "enfant", "animal"] as FicheType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    type === t
                      ? "bg-[#ff4f00] text-black shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t === "festivalier" ? "🎟️ Pass" : t === "enfant" ? "👶 Enfant" : "🐾 Animal"}
                </button>
              ))}
            </div>
          </div>

          {!fiche?.is_claimed && fiche?.claim_code && (
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-amber-400">
                Code d&apos;Activation (fourni avec le badge) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                placeholder="Ex: 123456"
                className="w-full bg-black/50 border border-amber-500/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono font-bold"
                required
              />
            </div>
          )}

          {/* Form fields based on selected badge type */}
          {type === "festivalier" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 uppercase">Prénom / Pseudo</label>
                <input
                  type="text"
                  value={formData.prenom || ""}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Ex: Alex"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4f00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase">Contact SOS 1 (Nom)</label>
                  <input
                    type="text"
                    value={formData.contact1_nom || ""}
                    onChange={(e) => setFormData({ ...formData, contact1_nom: e.target.value })}
                    placeholder="Ex: Marie"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase">Contact SOS 1 (Tél)</label>
                  <input
                    type="tel"
                    value={formData.contact1_tel || ""}
                    onChange={(e) => setFormData({ ...formData, contact1_tel: e.target.value })}
                    placeholder="Ex: 06 12 34 56 78"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase">Groupe Sanguin</label>
                  <input
                    type="text"
                    value={formData.groupe_sanguin || ""}
                    onChange={(e) => setFormData({ ...formData, groupe_sanguin: e.target.value })}
                    placeholder="Ex: O+"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase">Camping / Repère</label>
                  <input
                    type="text"
                    value={formData.camping || ""}
                    onChange={(e) => setFormData({ ...formData, camping: e.target.value })}
                    placeholder="Ex: Tente 42"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </>
          )}

          {type === "enfant" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 uppercase">Prénom de l&apos;enfant</label>
                <input
                  type="text"
                  value={formData.prenom || ""}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Ex: Lucas"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase">Tél Parent 1</label>
                  <input
                    type="tel"
                    value={formData.tel_parent_1 || ""}
                    onChange={(e) => setFormData({ ...formData, tel_parent_1: e.target.value })}
                    placeholder="Ex: 06 12 34 56 78"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase">Tél Parent 2</label>
                  <input
                    type="tel"
                    value={formData.tel_parent_2 || ""}
                    onChange={(e) => setFormData({ ...formData, tel_parent_2: e.target.value })}
                    placeholder="Ex: 06 98 76 54 32"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </>
          )}

          {type === "animal" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 uppercase">Nom de l&apos;animal</label>
                <input
                  type="text"
                  value={formData.nom || ""}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Rex"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase">Tél Propriétaire 1</label>
                  <input
                    type="tel"
                    value={formData.tel_proprio_1 || ""}
                    onChange={(e) => setFormData({ ...formData, tel_proprio_1: e.target.value })}
                    placeholder="Ex: 06 12 34 56 78"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase">Tél Propriétaire 2</label>
                  <input
                    type="tel"
                    value={formData.tel_proprio_2 || ""}
                    onChange={(e) => setFormData({ ...formData, tel_proprio_2: e.target.value })}
                    placeholder="Ex: 06 98 76 54 32"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-gray-300 uppercase">Infos médicales / Message SOS</label>
            <textarea
              rows={3}
              value={formData.infos_medicales || formData.medical || formData.message || ""}
              onChange={(e) => setFormData({ ...formData, infos_medicales: e.target.value, medical: e.target.value, message: e.target.value })}
              placeholder="Ex: Allergie aux arachides, besoin de contacter les parents immédiatement..."
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4f00]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-gradient-to-r from-[#2F3CD9] via-[#ff4f00] to-[#FF8800] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:opacity-90 transition-all cursor-pointer"
          >
            {saving ? "Sauvegarde en cours..." : "Enregistrer la fiche SOS 🏷️"}
          </button>
        </form>
      </div>
    </main>
  );
}
