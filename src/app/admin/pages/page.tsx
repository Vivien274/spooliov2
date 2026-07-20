"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";

const ADMIN_BLUE = "#2F3CD9";

interface AdminPageItem {
  id: number;
  title: string;
  slug: string;
  status: string;
  date: string;
}

interface AdminPageDetail extends AdminPageItem {
  content: string;
}

export default function AdminPagesPage() {
  const { cls, theme } = useAdminTheme();
  const [pages, setPages] = useState<AdminPageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Editor states
  const [editingPage, setEditingPage] = useState<AdminPageDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch page list
  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      } else {
        const err = await res.json();
        setError(err.error || "Erreur de chargement des pages.");
      }
    } catch (e) {
      setError("Erreur de connexion réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Fetch page detail for editing
  const handleEditClick = async (slug: string) => {
    setLoadingDetail(true);
    setSuccessMsg(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pages?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setEditingPage(data.page || null);
      } else {
        const err = await res.json();
        alert(err.error || "Erreur de récupération de la page.");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur de connexion.");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Submit edits
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    setSaving(true);
    setSuccessMsg(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPage)
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Page enregistrée avec succès !");
        // Reload page list
        await fetchPages();
      } else {
        setError(data.error || "Erreur lors de la sauvegarde.");
      }
    } catch (err) {
      setError("Erreur de connexion.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      
      {/* Header breadcrumb & title */}
      <div className="flex items-center justify-between">
        <div>
          <nav className={`text-[10px] uppercase font-bold tracking-wider ${cls.textFaint} mb-1`}>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span className="mx-2">&rarr;</span>
            <span>Pages</span>
          </nav>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>
            Gestion des pages
          </h1>
          <p className={`text-xs ${cls.textMuted} mt-1`}>
            {pages.length} pages trouvées dans la base MySQL o2switch.
          </p>
        </div>
      </div>

      {editingPage ? (
        /* Edit view */
        <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 md:p-8 space-y-6 transition-all duration-300`}>
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Mode Édition</span>
              <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-tight font-antonio`}>
                Modifier « {editingPage.title} »
              </h3>
            </div>
            <button
              onClick={() => setEditingPage(null)}
              className={`text-xs font-bold px-4 py-2 border ${cls.border} rounded-xl hover:text-white transition-colors cursor-pointer`}
            >
              Annuler / Retour
            </button>
          </div>

          <form onSubmit={handleSavePage} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                  Titre de la Page *
                </label>
                <input
                  type="text"
                  required
                  value={editingPage.title}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                  Slug / URL unique *
                </label>
                <input
                  type="text"
                  required
                  value={editingPage.slug}
                  onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                  className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                Statut de publication
              </label>
              <select
                value={editingPage.status}
                onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value })}
                className={`h-10 border rounded-xl px-3 outline-none transition-colors appearance-none cursor-pointer ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
              >
                <option value="publish">Publiée</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                Contenu HTML de la page *
              </label>
              <textarea
                required
                rows={14}
                value={editingPage.content}
                onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                placeholder="Saisissez ici le code HTML ou le texte brut de la page..."
                className={`border rounded-xl p-3 outline-none transition-colors resize-y leading-relaxed font-mono ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
              />
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs leading-normal">
                ✓ {successMsg}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs leading-normal">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full h-11 flex items-center justify-center text-black bg-white hover:bg-white/90 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-white/5 disabled:opacity-50"
            >
              {saving ? "Sauvegarde..." : "Enregistrer les modifications"}
            </button>
          </form>
        </div>
      ) : (
        /* List view */
        <div className={`${cls.cardBg} border ${cls.border} rounded-3xl overflow-hidden transition-colors`}>
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500 font-bold uppercase tracking-widest font-sans">
              Chargement des pages...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-xs text-red-400 font-sans">
              ⚠️ {error}
            </div>
          ) : (
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className={`border-b ${cls.border}`}>
                  {["Titre de la page", "Slug", "Statut", "Actions"].map((h) => (
                    <th key={h} className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-5 py-3.5 first:pl-6 last:pr-6`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${cls.divider}`}>
                {pages.map((p) => (
                  <tr key={p.slug} className={`group ${cls.hoverRow} transition-colors`}>
                    <td className={`px-5 pl-6 py-4 font-semibold ${cls.textMain}`}>{p.title}</td>
                    <td className={`px-5 py-4 ${cls.textFaint} text-xs`}>/{p.slug}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        p.status === "publish"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-gray-400/10 text-gray-400 border border-gray-400/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === "publish" ? "bg-emerald-400" : "bg-gray-400"}`} />
                        {p.status === "publish" ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-5 pr-6 py-4">
                      <button
                        onClick={() => handleEditClick(p.slug)}
                        disabled={loadingDetail}
                        className={`flex items-center gap-1.5 text-[11px] font-bold ${cls.textMain} ${
                          theme === "dark" ? "bg-white/10 hover:bg-white/15" : "bg-gray-100 hover:bg-gray-200"
                        } px-3 py-1.5 rounded-lg transition-colors cursor-pointer`}
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {loadingDetail ? "Chargement..." : "Modifier"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
