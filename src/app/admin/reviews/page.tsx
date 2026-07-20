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
  const [filterTab, setFilterTab] = useState<string>("all"); // default to all so he can see Google reviews instantly
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Products list for manual review association
  const [productsList, setProductsList] = useState<{ id: number; name: string }[]>([]);

  // Manual review form states
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState<string>("");
  const [newCustEmail, setNewCustEmail] = useState<string>("");
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");
  const [newProductId, setNewProductId] = useState<string>("");
  const [newShowOnHome, setNewShowOnHome] = useState<boolean>(true);
  const [formSaving, setFormSaving] = useState<boolean>(false);

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

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProductsList(data || []);
      }
    } catch (e) {
      console.error("Failed to load products list:", e);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, []);

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newComment.trim()) {
      alert("Veuillez remplir le nom et le commentaire.");
      return;
    }
    setFormSaving(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          customerName: newCustName,
          email: newCustEmail,
          rating: newRating,
          comment: newComment,
          productId: newProductId ? parseInt(newProductId, 10) : null,
          showOnHome: newShowOnHome
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.review) {
          setReviews([data.review, ...reviews]);
          // Reset form
          setNewCustName("");
          setNewCustEmail("");
          setNewRating(5);
          setNewComment("");
          setNewProductId("");
          setNewShowOnHome(true);
          setShowAddForm(false);
        } else {
          alert("Erreur lors de la création.");
        }
      } else {
        const data = await res.json();
        alert(data.error || "Erreur de serveur.");
      }
    } catch (err) {
      alert("Erreur réseau.");
    } finally {
      setFormSaving(false);
    }
  };

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer select-none ${
              showAddForm
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {showAddForm ? "Annuler ❌" : "Ajouter un avis ➕"}
          </button>
          <button
            onClick={fetchReviews}
            className={`text-xs px-4 py-2 border ${cls.border} ${cls.inputBg} rounded-xl hover:text-white cursor-pointer transition-colors`}
          >
            Rafraîchir les avis 🔄
          </button>
        </div>
      </div>

      {/* Manual review creation form */}
      {showAddForm && (
        <form onSubmit={handleSubmitManual} className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 space-y-4 animate-reveal`}>
          <div className="flex items-center justify-between border-b pb-3 border-spoolio-border">
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-antonio">
              ➕ Saisir un avis manuellement
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-white text-xs cursor-pointer"
            >
              Fermer ❌
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nom */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nom du client *</label>
              <input
                type="text"
                required
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="Ex: Daphné Marlière"
                className={`w-full bg-[#131316] border ${cls.border} rounded-xl px-3 py-2 text-xs ${cls.textMain} placeholder-gray-600 focus:outline-none focus:border-gray-500`}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Adresse Email (Optionnel)</label>
              <input
                type="email"
                value={newCustEmail}
                onChange={(e) => setNewCustEmail(e.target.value)}
                placeholder="Ex: daphne@example.com"
                className={`w-full bg-[#131316] border ${cls.border} rounded-xl px-3 py-2 text-xs ${cls.textMain} placeholder-gray-600 focus:outline-none focus:border-gray-500`}
              />
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Note (de 1 à 5) *</label>
              <select
                value={newRating}
                onChange={(e) => setNewRating(parseInt(e.target.value, 10))}
                className={`w-full bg-[#131316] border ${cls.border} rounded-xl px-3 py-2 text-xs ${cls.textMain} focus:outline-none focus:border-gray-500`}
              >
                {[5, 4, 3, 2, 1].map(n => (
                  <option key={n} value={n} className="bg-[#131316]">{Array(n).fill("★").join("")} ({n}/5)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Produit lié */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Associer à un produit (Optionnel)</label>
              <select
                value={newProductId}
                onChange={(e) => setNewProductId(e.target.value)}
                className={`w-full bg-[#131316] border ${cls.border} rounded-xl px-3 py-2 text-xs ${cls.textMain} focus:outline-none focus:border-gray-500`}
              >
                <option value="" className="bg-[#131316]">🌐 Aucun produit (Avis Général / Fiche Google)</option>
                {productsList.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#131316]">{p.name}</option>
                ))}
              </select>
            </div>

            {/* Affichage Home checkbox */}
            <div className="flex items-center gap-2 pt-5 select-none">
              <input
                type="checkbox"
                id="show_home_form"
                checked={newShowOnHome}
                onChange={(e) => setNewShowOnHome(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600 bg-[#131316] border-gray-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="show_home_form" className="text-xs font-semibold text-gray-300 cursor-pointer">
                Afficher sur la page d'accueil (Home)
              </label>
            </div>
          </div>

          {/* Commentaire */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Commentaire / Avis client *</label>
            <textarea
              required
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Saisis ici le commentaire rédigé par le client..."
              className={`w-full bg-[#131316] border ${cls.border} rounded-xl px-3 py-2 text-xs ${cls.textMain} placeholder-gray-600 focus:outline-none focus:border-gray-500 font-sans leading-relaxed`}
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs px-4 py-2 border border-transparent text-gray-400 hover:text-white cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={formSaving}
              className="text-xs px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition-colors disabled:opacity-50"
            >
              {formSaving ? "Enregistrement..." : "Enregistrer l'avis ✓"}
            </button>
          </div>
        </form>
      )}

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
