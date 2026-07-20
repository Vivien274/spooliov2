"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";

const ADMIN_BLUE = "#2F3CD9";

function SeoScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? "#059669" : score >= 50 ? "#f59e0b" : "#dc2626";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-[#1e1e2a] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

export default function AdminProductsPage() {
  const { cls, theme } = useAdminTheme();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // List of main categories
  const categoriesList = [
    "Tous",
    "Fidgets",
    "Animaux & Figurines",
    "Décoration",
    "Accessoires",
    "Jeux & activités",
    "Porte clés",
    "Geek / Gaming"
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?status=all");
      if (res.ok) {
        const data = await res.json();
        setProducts(data || []);
      }
    } catch (e) {
      console.error("Failed to load database products in admin:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le produit « ${name} » ?`)) return;

    setDeletingId(id);
    try {
      // Direct API fetch to delete
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        // Remove from state
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert("Impossible de supprimer le produit.");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur de connexion.");
    } finally {
      setDeletingId(null);
    }
  };

  // Dynamic filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Tous" ||
      p.categories?.some((c: any) => c.name.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      <div className="flex items-start justify-between">
        <div>
          <nav className={`text-[10px] uppercase font-bold tracking-wider ${cls.textFaint} mb-1`}>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span className="mx-2">&rarr;</span>
            <span>Produits</span>
          </nav>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Gestion des produits</h1>
          <p className={`text-sm ${cls.textMuted} mt-1`}>
            {products.length} produits chargés · {products.filter(p => p.stock === 0).length} en rupture
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer"
          style={{ background: ADMIN_BLUE, boxShadow: `0 8px 24px rgba(47, 60, 217, 0.25)` }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau produit
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <svg className={`w-4 h-4 ${cls.textMuted} absolute left-3 top-1/2 -translate-y-1/2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un produit par nom ou slug…"
            className={`w-full ${cls.cardBg} border ${cls.border} rounded-xl pl-9 pr-4 py-2.5 text-sm ${cls.textMain} placeholder-gray-500 focus:outline-none transition-colors`}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-white text-black border-white"
                  : `${cls.cardBg} ${cls.border} ${cls.textMuted} hover:text-white`
              }`}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={`${cls.cardBg} border ${cls.border} rounded-3xl overflow-hidden transition-colors`}>
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500 font-bold uppercase tracking-widest font-sans animate-pulse">
            Chargement des 200+ produits...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500 font-sans">
            Aucun produit ne correspond aux filtres de recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${cls.border}`}>
                  {["Produit", "Catégories", "Prix", "Stock", "SEO", "Actions"].map((h) => (
                    <th key={h} className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-5 py-3.5 first:pl-6 last:pr-6`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${cls.divider}`}>
                {filteredProducts.map((p) => (
                  <tr key={p.id} className={`group ${cls.hoverRow} transition-colors`}>
                    <td className="px-5 pl-6 py-4">
                      <span className={`font-semibold ${cls.textMain}`}>{p.name}</span>
                      <a
                        href={`/product/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] text-[#ff4f00] hover:underline mt-0.5 font-mono cursor-pointer w-fit"
                      >
                        /{p.slug}
                        <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(p.categories || []).map((cat: any) => (
                          <span key={cat.id || cat.slug} className={`text-[10px] ${cls.badgeBg} ${cls.textMain} px-2 py-0.5 rounded`}>
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-sans">
                      {p.sale_price ? (
                        <div className="flex flex-col">
                          <span className={`font-bold text-[#ff4f00]`}>{p.sale_price} €</span>
                          <span className={`text-[10px] ${cls.textFaint} line-through`}>{p.price} €</span>
                        </div>
                      ) : (
                        <span className={`font-bold ${cls.textMain}`}>{p.price} €</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold ${p.stock === 0 ? "text-red-400" : p.stock <= 5 ? "text-amber-400" : "text-emerald-400"}`}>
                        {p.stock === 0 ? "Rupture" : `${p.stock} en stock`}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <SeoScoreBadge score={p.seoScore || 65} />
                    </td>
                    <td className="px-5 pr-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className={`flex items-center gap-1.5 text-[11px] font-bold ${cls.textMain} ${theme === "dark" ? "bg-white/10 hover:bg-white/15" : "bg-gray-100 hover:bg-gray-200"} px-3 py-1.5 rounded-lg transition-colors`}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          disabled={deletingId === p.id}
                          className="text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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
