"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";

const ADMIN_BLUE = "#2F3CD9";

interface Review {
  id: number;
  productId: number;
  customerName: string;
  email: string;
  rating: number;
  comment: string;
  approved: boolean;
  showOnHome: boolean;
  createdAt: string;
  product: {
    name: string;
    slug: string;
  };
}

export default function AdminReviewsPage() {
  const { cls, theme } = useAdminTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filterTab, setFilterTab] = useState<string>("pending"); // pending | approved | all
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      } else {
        const err = await res.json();
        setError(err.error || "Impossible de charger les avis.");
      }
    } catch (e) {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved: true })
      });
      if (res.ok) {
        setReviews(reviews.map(r => r.id === id ? { ...r, approved: true } : r));
      } else {
        const data = await res.json();
        alert(data.error || "Erreur de validation.");
      }
    } catch (e) {
      alert("Erreur de connexion.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleHome = async (id: number, currentShow: boolean) => {
    setActionLoading(id);
    const newShow = !currentShow;
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, showOnHome: newShow })
      });
      if (res.ok) {
        setReviews(reviews.map(r => r.id === id ? { ...r, showOnHome: newShow } : r));
      } else {
        const data = await res.json();
        alert(data.error || "Erreur de mise à jour.");
      }
    } catch (e) {
      alert("Erreur de connexion.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number, author: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer définitivement l'avis de « ${author} » ?`)) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Erreur de suppression.");
      }
    } catch (e) {
      alert("Erreur de connexion.");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter
  const filteredReviews = reviews.filter((r) => {
    const matchesTab =
      filterTab === "all" ||
      (filterTab === "pending" && !r.approved) ||
      (filterTab === "approved" && r.approved);

    const searchStr = `${r.customerName} ${r.email} ${r.comment} ${r.product?.name || ""}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      <div className="flex items-start justify-between">
        <div>
          <nav className={`text-[10px] uppercase font-bold tracking-wider ${cls.textFaint} mb-1`}>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span className="mx-2">&rarr;</span>
            <span>Avis</span>
          </nav>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Modération des avis</h1>
          <p className={`text-sm ${cls.textMuted} mt-1`}>
            {reviews.length} avis reçus · {reviews.filter(r => !r.approved).length} en attente de validation
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className={`text-xs px-4 py-2 border ${cls.border} ${cls.inputBg} rounded-xl hover:text-white cursor-pointer transition-colors`}
        >
          Rafraîchir les avis 🔄
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative flex-1 w-full max-w-md">
          <svg className={`w-4 h-4 ${cls.textMuted} absolute left-3 top-1/2 -translate-y-1/2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par client, commentaire ou produit..."
            className={`w-full ${cls.cardBg} border ${cls.border} rounded-xl pl-9 pr-4 py-2.5 text-sm ${cls.textMain} placeholder-gray-500 focus:outline-none transition-colors`}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          {[
            { id: "pending", label: "En attente ⏳" },
            { id: "approved", label: "Approuvés ✓" },
            { id: "all", label: "Tous" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                filterTab === tab.id
                  ? "bg-white text-black border-white"
                  : `${cls.cardBg} ${cls.border} ${cls.textMuted} hover:text-white`
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <div className={`${cls.cardBg} border ${cls.border} rounded-3xl overflow-hidden transition-colors`}>
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500 font-bold uppercase tracking-widest font-sans animate-pulse">
            Chargement des avis clients...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-red-400 font-sans">
            ⚠️ {error}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500 font-sans">
            Aucun avis ne correspond aux critères sélectionnés.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${cls.border}`}>
                  {["Date", "Client", "Produit", "Note", "Commentaire", "Statut", "Affiche Home", "Actions"].map((h) => (
                    <th key={h} className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-5 py-3.5 first:pl-6 last:pr-6`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${cls.divider}`}>
                {filteredReviews.map((r) => (
                  <tr key={r.id} className={`group ${cls.hoverRow} transition-colors text-xs`}>
                    <td className="px-5 pl-6 py-4 text-gray-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`block font-bold ${cls.textMain}`}>{r.customerName}</span>
                      <span className={`block text-[10px] ${cls.textFaint}`}>{r.email}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-300">
                      {r.product ? (
                        <Link href={`/product/${r.product.slug}`} target="_blank" className="hover:text-[#ff4f00] hover:underline">
                          {r.product.name}
                        </Link>
                      ) : (
                        <span className="text-gray-500 font-medium text-[11px] flex items-center gap-1">
                          🌐 Avis Google (Général)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex text-[#ff4f00] text-sm select-none">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <span key={idx}>{idx < r.rating ? "★" : "☆"}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-[280px]">
                      <p className="text-gray-300 line-clamp-3 leading-relaxed" title={r.comment}>
                        {r.comment}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        r.approved ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
                      }`}>
                        {r.approved ? "Approuvé" : "En attente"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleHome(r.id, r.showOnHome)}
                        disabled={actionLoading === r.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 select-none ${
                          r.showOnHome
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                            : "bg-gray-500/10 text-gray-500 border border-gray-500/15 hover:bg-gray-500/20 hover:text-gray-400"
                        }`}
                        title={r.showOnHome ? "Retirer de la page d'accueil" : "Afficher sur la page d'accueil"}
                      >
                        <span>{r.showOnHome ? "🏠 Oui" : "❌ Non"}</span>
                      </button>
                    </td>
                    <td className="px-5 pr-6 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        {!r.approved && (
                          <button
                            onClick={() => handleApprove(r.id)}
                            disabled={actionLoading === r.id}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Approuver ✓
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(r.id, r.customerName)}
                          disabled={actionLoading === r.id}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-[10px] transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Supprimer 🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
