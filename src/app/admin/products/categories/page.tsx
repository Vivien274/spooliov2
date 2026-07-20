"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "../../AdminThemeContext";

interface Category {
  id: number;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
}

export default function AdminCategoriesPage() {
  const { cls, theme } = useAdminTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newName, setNewName] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      } else {
        setErrorMsg("Impossible de récupérer les catégories.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(`Catégorie "${data.category.name}" créée avec succès !`);
        setNewName("");
        fetchCategories();
      } else {
        setErrorMsg(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setErrorMsg("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number, count: number) => {
    if (count > 0) {
      alert(`Impossible de supprimer cette catégorie car ${count} produit(s) y sont rattaché(s).`);
      return;
    }

    if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) {
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Catégorie supprimée avec succès !");
        fetchCategories();
      } else {
        setErrorMsg(data.error || "La suppression a échoué.");
      }
    } catch (err) {
      setErrorMsg("Erreur réseau.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/admin/products" className={`text-xs ${cls.textMuted} hover:text-white transition-colors`}>
              &larr; Retour Produits
            </Link>
          </div>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Gestion des Catégories 📁</h1>
          <p className={`text-sm ${cls.textMuted} mt-1`}>
            Ajoutez et supprimez des catégories de produits pour structurer votre boutique.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Add Form */}
        <div className={`lg:col-span-1 p-6 rounded-3xl border ${cls.border} ${cls.cardBg} space-y-4 transition-colors duration-300`}>
          <div>
            <h3 className={`text-sm font-bold ${cls.textMain} uppercase tracking-widest font-antonio`}>Nouvelle Catégorie</h3>
            <p className={`text-xs ${cls.textMuted} mt-0.5`}>Créez une catégorie pour classer vos articles.</p>
          </div>

          <form onSubmit={handleAddCategory} className="space-y-4 text-xs font-sans">
            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                Nom de la catégorie *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Porte-clés, Supports Bureau"
                className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
              />
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs leading-normal">
                ✓ {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs leading-normal">
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 flex items-center justify-center text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer bg-white hover:bg-white/90 disabled:opacity-50 shadow-md shadow-white/5"
            >
              {submitting ? "Création..." : "Ajouter la catégorie ➕"}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border ${cls.border} ${cls.cardBg} space-y-4 transition-colors duration-300`}>
          <h3 className={`text-sm font-bold ${cls.textMain} uppercase tracking-widest font-antonio`}>Catégories existantes</h3>
          
          {loading ? (
            <div className={`text-xs ${cls.textMuted} italic animate-pulse py-8 text-center`}>
              Chargement des catégories...
            </div>
          ) : categories.length === 0 ? (
            <div className={`text-xs ${cls.textMuted} italic py-8 text-center`}>
              Aucune catégorie créée pour le moment.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/5">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className={`border-b border-white/5 bg-black/20 text-gray-500 font-bold uppercase tracking-wider text-[10px]`}>
                    <th className="py-3 px-4">Nom</th>
                    <th className="py-3 px-4">Slug d'URL</th>
                    <th className="py-3 px-4 text-center">Produits</th>
                    <th className="py-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${cls.divider}`}>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className={`py-3 px-4 font-bold ${cls.textMain}`}>{cat.name}</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-gray-400 select-all">{cat.slug}</td>
                      <td className={`py-3 px-4 text-center font-bold ${cat._count.products > 0 ? "text-emerald-400" : cls.textMuted}`}>
                        {cat._count.products}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat._count.products)}
                          className={`text-red-400 hover:text-red-600 font-bold transition-all cursor-pointer p-1 text-sm ${
                            cat._count.products > 0 ? "opacity-30 cursor-not-allowed" : ""
                          }`}
                          title={cat._count.products > 0 ? "Des produits utilisent cette catégorie" : "Supprimer"}
                          disabled={cat._count.products > 0}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
