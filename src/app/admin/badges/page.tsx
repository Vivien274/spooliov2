"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";
import { Fiche, FicheType } from "@/lib/badgeTypes";

export default function AdminBadgesPage() {
  const { theme } = useAdminTheme();
  const isDark = theme === "dark";

  const [badges, setBadges] = useState<Fiche[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [generateCount, setGenerateCount] = useState<number>(5);
  const [generateType, setGenerateType] = useState<FicheType>("festivalier");
  const [search, setSearch] = useState<string>("");

  const cls = {
    cardBg: isDark ? "bg-[#16161c]" : "bg-white",
    border: isDark ? "border-white/10" : "border-gray-200",
    textMain: isDark ? "text-white" : "text-gray-900",
    textMuted: isDark ? "text-gray-400" : "text-gray-500",
    textFaint: isDark ? "text-gray-500" : "text-gray-400",
    inputBg: isDark ? "bg-black/50 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900",
    hoverRow: isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50",
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await fetch("/api/admin/badges");
      if (res.ok) {
        const data = await res.json();
        setBadges(data.badges || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBatch = async () => {
    if (!confirm(`Générer un lot de ${generateCount} nouveaux badges NFC (${generateType}) ?`)) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_batch",
          count: generateCount,
          type: generateType,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ ${data.message}`);
        fetchBadges();
      } else {
        alert(`⚠️ ${data.error || "Erreur de génération."}`);
      }
    } catch (e) {
      alert("Erreur réseau.");
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkNfcEncoded = async (badgeId: string) => {
    try {
      const res = await fetch("/api/admin/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "encode_nfc", badgeId }),
      });
      if (res.ok) {
        setBadges(prev => prev.map(b => b.id === badgeId ? { ...b, nfc_encoded_at: new Date().toISOString() } : b));
      }
    } catch (e) {}
  };

  const filteredBadges = badges.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.token.toLowerCase().includes(q) ||
      (b.claim_code || "").toLowerCase().includes(q) ||
      (b.data?.prenom || "").toLowerCase().includes(q) ||
      (b.data?.nom || "").toLowerCase().includes(q)
    );
  });

  const claimedCount = badges.filter(b => b.is_claimed).length;
  const nfcEncodedCount = badges.filter(b => b.nfc_encoded_at).length;

  return (
    <div className="w-full max-w-[1850px] mx-auto space-y-6 font-sans px-3 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <nav className={`text-[10px] uppercase font-bold tracking-wider ${cls.textFaint} mb-1`}>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span className="mx-2">&rarr;</span>
            <span>Badges NFC</span>
          </nav>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Gestion des Badges NFC & Fiches SOS</h1>
          <p className={`text-sm ${cls.textMuted} mt-1`}>
            {badges.length} badges enregistrés · {claimedCount} activés par les clients · {nfcEncodedCount} encodés NFC à l&apos;atelier
          </p>
        </div>

        {/* Generate Batch Form */}
        <div className={`flex items-center gap-2 p-2 ${cls.cardBg} border ${cls.border} rounded-2xl`}>
          <select
            value={generateType}
            onChange={(e) => setGenerateType(e.target.value as FicheType)}
            className={`text-xs font-bold px-3 py-2 rounded-xl ${cls.inputBg} focus:outline-none`}
          >
            <option value="festivalier">🎟️ Pass Festival</option>
            <option value="enfant">👶 Enfant SOS</option>
            <option value="animal">🐾 Animal SOS</option>
          </select>
          <input
            type="number"
            min={1}
            max={50}
            value={generateCount}
            onChange={(e) => setGenerateCount(Number(e.target.value))}
            className={`w-16 text-xs font-bold px-3 py-2 rounded-xl ${cls.inputBg} focus:outline-none font-mono`}
          />
          <button
            onClick={handleGenerateBatch}
            disabled={generating}
            className="text-xs px-4 py-2 bg-[#ff4f00] hover:bg-[#ff6600] text-black font-extrabold rounded-xl transition-all cursor-pointer shadow-md shrink-0 uppercase tracking-wider"
          >
            {generating ? "Génération..." : "➕ Générer un lot"}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cls.cardBg} border border-blue-500/30 rounded-2xl p-4 flex flex-col justify-between`}>
          <span className="text-[10px] uppercase font-black tracking-wider text-blue-400">Total Badges Générés</span>
          <span className="text-3xl font-black font-antonio text-white mt-2">{badges.length}</span>
        </div>
        <div className={`${cls.cardBg} border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between`}>
          <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">Badges Activés Clients</span>
          <span className="text-3xl font-black font-antonio text-white mt-2">{claimedCount}</span>
        </div>
        <div className={`${cls.cardBg} border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between`}>
          <span className="text-[10px] uppercase font-black tracking-wider text-purple-400">Encodés NFC Atelier</span>
          <span className="text-3xl font-black font-antonio text-white mt-2">{nfcEncodedCount}</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un badge (token, code activation, nom, prénom)..."
          className={`w-full max-w-md ${cls.inputBg} border ${cls.border} rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none`}
        />
      </div>

      {/* Badges Table */}
      <div className={`${cls.cardBg} border ${cls.border} rounded-3xl overflow-hidden shadow-xl`}>
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500 font-bold uppercase tracking-widest font-sans">
            Chargement des badges NFC...
          </div>
        ) : filteredBadges.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500 font-sans">
            Aucun badge ne correspond aux critères.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${cls.border}`}>
                  <th className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-4 py-3.5 pl-6`}>Token NFC</th>
                  <th className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-4 py-3.5`}>Code Activation</th>
                  <th className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-4 py-3.5`}>Type</th>
                  <th className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-4 py-3.5`}>Statut Client</th>
                  <th className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-4 py-3.5`}>Identité / Contact</th>
                  <th className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-4 py-3.5`}>Encodage NFC</th>
                  <th className={`text-right text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-4 py-3.5 pr-6`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBadges.map((b) => {
                  const displayName = b.data?.prenom || b.data?.nom || "Non configuré";

                  return (
                    <tr key={b.id} className={`${cls.hoverRow} transition-colors text-xs`}>
                      <td className="px-4 py-4 pl-6 font-mono font-bold text-amber-400 select-all">
                        {b.token}
                      </td>
                      <td className="px-4 py-4 font-mono text-gray-300">
                        {b.claim_code || "—"}
                      </td>
                      <td className="px-4 py-4 font-bold capitalize">
                        {b.type === "festivalier" ? "🎟️ Pass" : b.type === "enfant" ? "👶 Enfant" : "🐾 Animal"}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          b.is_claimed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        }`}>
                          {b.is_claimed ? "Activé ✓" : "En attente"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-white">{displayName}</div>
                        <div className="text-[10px] text-gray-400">{b.data?.contact1_tel || b.data?.tel_parent_1 || b.data?.tel_proprio_1 || "Pas de numéro"}</div>
                      </td>
                      <td className="px-4 py-4">
                        {b.nfc_encoded_at ? (
                          <span className="text-[10px] text-purple-400 font-bold">
                            Encodé le {new Date(b.nfc_encoded_at).toLocaleDateString("fr-FR")}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarkNfcEncoded(b.id)}
                            className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Marquer Encodé NFC ⚡️
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4 pr-6 text-right">
                        <a
                          href={`/badges/${b.token}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-[10px] transition-colors border border-white/10 inline-flex items-center gap-1"
                        >
                          <span>Accéder à la fiche ↗</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
