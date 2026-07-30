"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdminTheme } from "../AdminThemeContext";
import { computeSeoScore } from "@/lib/seoUtils";
import { isVideoMedia, isYouTubeUrl, getYouTubeThumbnail } from "@/lib/mediaUtils";

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
  const [statusFilter, setStatusFilter] = useState<string>("all"); // "all" | "publish" | "draft"
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Sort States
  const [sortBy, setSortBy] = useState<"date" | "name" | "price" | "seo" | "stock">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleHeaderSort = (key: "date" | "name" | "price" | "seo" | "stock") => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder(key === "name" || key === "price" ? "asc" : "desc");
    }
  };

  // Bulk Edit States
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState<boolean>(false);
  const [showPricePopover, setShowPricePopover] = useState<boolean>(false);
  const [bulkPriceType, setBulkPriceType] = useState<"percentage" | "fixed">("percentage");
  const [bulkPriceDirection, setBulkPriceDirection] = useState<"increase" | "decrease">("increase");
  const [bulkPriceValue, setBulkPriceValue] = useState<string>("");

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
      const res = await fetch("/api/products?status=all", { cache: "no-store" });
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

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    const filteredIds = filteredProducts.map(p => p.id);
    const allSelected = filteredIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(selectedIds.filter(id => !filteredIds.includes(id)));
    } else {
      const newSelected = Array.from(new Set([...selectedIds, ...filteredIds]));
      setSelectedIds(newSelected);
    }
  };

  const handleBulkAction = async (action: string, extraData?: any) => {
    if (selectedIds.length === 0) return;
    
    if (action === "delete") {
      if (!confirm(`Voulez-vous vraiment supprimer les ${selectedIds.length} produits sélectionnés ?`)) return;
    }

    setIsBulkUpdating(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ids: selectedIds,
          action,
          ...extraData
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedIds([]);
        setShowPricePopover(false);
        setBulkPriceValue("");
        await fetchProducts();
      } else {
        alert(data.error || "Une erreur est survenue lors de l'opération.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Dynamic filtering & sorting
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "Tous" ||
        p.categories?.some((c: any) => c.name.toLowerCase() === selectedCategory.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name, "fr", { sensitivity: "base" });
      } else if (sortBy === "price") {
        const priceA = parseFloat(a.sale_price || a.price || "0");
        const priceB = parseFloat(b.sale_price || b.price || "0");
        comparison = priceA - priceB;
      } else if (sortBy === "seo") {
        const seoA = computeSeoScore(a);
        const seoB = computeSeoScore(b);
        comparison = seoA - seoB;
      } else if (sortBy === "stock") {
        const stockA = typeof a.stock === "number" ? a.stock : 0;
        const stockB = typeof b.stock === "number" ? b.stock : 0;
        comparison = stockA - stockB;
      } else if (sortBy === "date") {
        const dateA = a.date_created ? new Date(a.date_created).getTime() : a.id;
        const dateB = b.date_created ? new Date(b.date_created).getTime() : b.id;
        comparison = dateA - dateB;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  return (
    <div className="max-w-[1700px] w-full mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className={`text-[10px] uppercase font-bold tracking-wider ${cls.textFaint} mb-1 flex items-center gap-1.5`}>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>&rarr;</span>
            <span>Catalogue</span>
            <span>&rarr;</span>
            <span className="text-[#ff4f00]">Produits</span>
          </nav>
          <h1 className={`text-3xl sm:text-4xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>
            Gestion des produits
          </h1>
          <p className={`text-sm ${cls.textMuted} mt-1 flex items-center gap-2 flex-wrap`}>
            <span>{products.length} produits enregistrés</span>
            <span>·</span>
            <span className="text-emerald-400 font-bold">{products.filter(p => p.status === "publish").length} publiés</span>
            <span>·</span>
            <span className="text-gray-400 font-bold">{products.filter(p => p.status === "draft").length} brouillons</span>
            <span>·</span>
            <span className="text-red-400 font-bold">{products.filter(p => p.stock === 0).length} indisponibles</span>
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-2xl transition-all shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
          style={{ background: ADMIN_BLUE, boxShadow: `0 8px 24px rgba(47, 60, 217, 0.35)` }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nouveau produit</span>
        </Link>
      </div>

      {/* KPI Stats Quick Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${cls.cardBg} border ${cls.border} p-4 rounded-2xl flex items-center justify-between`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${cls.textFaint} block`}>Total Catalogue</span>
            <span className={`text-xl font-black ${cls.textMain}`}>{products.length}</span>
          </div>
          <span className="text-2xl opacity-70">📦</span>
        </div>
        <div className={`${cls.cardBg} border ${cls.border} p-4 rounded-2xl flex items-center justify-between`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${cls.textFaint} block`}>Boussole Active</span>
            <span className="text-xl font-black text-purple-400">{products.filter(p => p.show_in_sensory_compass).length}</span>
          </div>
          <span className="text-2xl opacity-70">🧭</span>
        </div>
        <div className={`${cls.cardBg} border ${cls.border} p-4 rounded-2xl flex items-center justify-between`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${cls.textFaint} block`}>Publiés en Ligne</span>
            <span className="text-xl font-black text-emerald-400">{products.filter(p => p.status === "publish").length}</span>
          </div>
          <span className="text-2xl opacity-70">🟢</span>
        </div>
        <div className={`${cls.cardBg} border ${cls.border} p-4 rounded-2xl flex items-center justify-between`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${cls.textFaint} block`}>Indisponibles</span>
            <span className="text-xl font-black text-red-400">{products.filter(p => p.stock === 0).length}</span>
          </div>
          <span className="text-2xl opacity-70">🔴</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="flex flex-1 gap-2 flex-col sm:flex-row">
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
          
          {/* Status Filters Toggle */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border ${cls.border} ${cls.cardBg} w-fit h-fit shrink-0`}>
            {[
              { id: "all", label: "Tous" },
              { id: "publish", label: "Publiés" },
              { id: "draft", label: "Brouillons" }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? (theme === "dark" ? "bg-white/10 text-white shadow-sm" : "bg-[#2F3CD9]/10 text-[#2F3CD9]")
                    : `text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white`
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Sort Selector Dropdown */}
          <div className="relative shrink-0">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const parts = e.target.value.split("-");
                setSortBy(parts[0] as typeof sortBy);
                setSortOrder(parts[1] as typeof sortOrder);
              }}
              className={`h-full ${cls.cardBg} border ${cls.border} rounded-xl px-3.5 py-2 text-xs font-bold ${cls.textMain} focus:outline-none cursor-pointer transition-colors appearance-none pr-8 hover:border-white/20`}
            >
              <option value="date-desc">Tri : Plus récents d&apos;abord</option>
              <option value="date-asc">Tri : Plus anciens d&apos;abord</option>
              <option value="name-asc">Tri : Nom (A &rarr; Z)</option>
              <option value="name-desc">Tri : Nom (Z &rarr; A)</option>
              <option value="price-asc">Tri : Prix (Croissant)</option>
              <option value="price-desc">Tri : Prix (Décroissant)</option>
              <option value="seo-desc">Tri : Score SEO (Élevé &rarr; Faible)</option>
              <option value="seo-asc">Tri : Score SEO (Faible &rarr; Élevé)</option>
            </select>
            <svg className={`w-3.5 h-3.5 ${cls.textMuted} absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-white text-black border-white shadow-md"
                  : `${cls.cardBg} ${cls.border} ${cls.textMuted} hover:text-white`
              }`}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={`${cls.cardBg} border ${cls.border} rounded-3xl overflow-hidden transition-colors shadow-2xl`}>
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-500 font-bold uppercase tracking-widest font-sans animate-pulse">
            Chargement du catalogue produits...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500 font-sans">
            Aucun produit ne correspond aux filtres de recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className={`border-b ${cls.border} bg-white/[0.02]`}>
                  <th className="w-12 px-5 py-4 pl-6 text-left">
                    <input
                      type="checkbox"
                      checked={filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.includes(p.id))}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-[#2F3CD9] focus:ring-[#2F3CD9] cursor-pointer"
                    />
                  </th>
                  {[
                    { key: "name", label: "Produit", sortable: true },
                    { key: "category", label: "Catégories", sortable: false },
                    { key: "status", label: "Statut", sortable: false },
                    { key: "boussole", label: "Boussole", sortable: false },
                    { key: "price", label: "Prix", sortable: true },
                    { key: "seo", label: "SEO", sortable: true },
                    { key: "actions", label: "Actions", sortable: false },
                  ].map((col) => (
                    <th key={col.key} className={`text-left text-[10px] font-black ${cls.textFaint} uppercase tracking-widest px-5 py-4 last:pr-6`}>
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleHeaderSort(col.key as any)}
                          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer group/sort"
                        >
                          <span>{col.label}</span>
                          <span className={`text-[10px] transition-opacity ${sortBy === col.key ? "opacity-100 text-[#ff4f00]" : "opacity-30 group-hover/sort:opacity-70"}`}>
                            {sortBy === col.key ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                          </span>
                        </button>
                      ) : (
                        <span>{col.label}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${cls.divider}`}>
                {filteredProducts.map((p) => (
                  <tr key={p.id} className={`group ${cls.hoverRow} ${selectedIds.includes(p.id) ? (theme === "dark" ? "bg-white/5" : "bg-gray-50") : ""} transition-colors`}>
                    <td className="w-12 px-5 py-3.5 pl-6">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded border-gray-300 text-[#2F3CD9] focus:ring-[#2F3CD9] cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3.5 min-w-[280px]">
                        {/* Product Thumbnail Image */}
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/50 border border-white/10 shrink-0 group-hover:border-[#ff4f00]/50 transition-colors shadow-sm">
                          {(() => {
                            const firstImg = p.images?.[0]?.src || "/images/figma_keychains.jpg";
                            const isVid = isVideoMedia(firstImg);
                            const ytThumb = isYouTubeUrl(firstImg) ? getYouTubeThumbnail(firstImg) : null;

                            if (isVid) {
                              return (
                                <div className="w-full h-full relative flex items-center justify-center bg-black">
                                  {ytThumb ? (
                                    <Image src={ytThumb} alt={p.name} fill unoptimized className="object-cover opacity-80" />
                                  ) : (
                                    <video src={firstImg} muted className="object-cover w-full h-full opacity-60" />
                                  )}
                                  <span className="absolute text-xs">🎥</span>
                                </div>
                              );
                            }

                            return (
                              <Image
                                src={firstImg}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            );
                          })()}
                        </div>

                        {/* Name and Slug */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className={`font-bold text-sm leading-snug ${cls.textMain} truncate group-hover:text-[#ff4f00] transition-colors`}>
                            {p.name}
                          </span>
                          <a
                            href={`/product/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#ff4f00] hover:underline font-mono cursor-pointer w-fit mt-0.5"
                          >
                            <span>/{p.slug}</span>
                            <svg className="w-2.5 h-2.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(p.categories || []).map((cat: any) => (
                          <span key={cat.id || cat.slug} className={`text-[10px] font-bold ${cls.badgeBg} ${cls.textMain} px-2.5 py-1 rounded-lg border border-white/5`}>
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold leading-none ${
                          p.status === "publish"
                            ? (theme === "dark" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border border-emerald-200")
                            : (theme === "dark" ? "bg-white/5 text-gray-400 border border-white/10" : "bg-gray-100 text-gray-600 border border-gray-200")
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.status === "publish" ? "bg-emerald-400" : "bg-gray-400"}`} />
                          {p.status === "publish" ? "Publié" : "Brouillon"}
                        </span>
                        {p.status === "publish" && (p.stock === 0 || p.stock === -2) && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <span>🚫</span>
                            <span>Vente désactivée</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={async () => {
                          const newValue = !p.show_in_sensory_compass;
                          setProducts((prev) => prev.map((item) => item.id === p.id ? { ...item, show_in_sensory_compass: newValue } : item));
                          try {
                            await fetch("/api/products", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ productId: p.id, showInSensoryCompass: newValue }),
                            });
                          } catch (e) {
                            console.error("Failed to toggle boussole:", e);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                          p.show_in_sensory_compass
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:text-gray-200"
                        }`}
                        title={p.show_in_sensory_compass ? "Désactiver de la Boussole" : "Activer dans la Boussole"}
                      >
                        <span>🧭</span>
                        <span>{p.show_in_sensory_compass ? "Actif" : "Off"}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 font-sans">
                      {p.sale_price ? (
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[#ff4f00] text-sm">{p.sale_price} €</span>
                          <span className={`text-[10px] ${cls.textFaint} line-through`}>{p.price} €</span>
                        </div>
                      ) : (
                        <span className={`font-extrabold text-sm ${cls.textMain}`}>{p.price} €</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <SeoScoreBadge score={computeSeoScore(p)} />
                    </td>
                    <td className="px-5 pr-6 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className={`flex items-center gap-1.5 text-[11px] font-bold ${cls.textMain} ${theme === "dark" ? "bg-white/10 hover:bg-white/20" : "bg-gray-100 hover:bg-gray-200"} px-3 py-1.5 rounded-lg transition-colors`}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          disabled={deletingId === p.id}
                          className="text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
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

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 ${theme === "dark" ? "bg-[#181824]/95 border-white/10 text-white" : "bg-white/95 border-gray-250 text-black"} border rounded-2xl px-6 py-3.5 flex items-center justify-between gap-6 shadow-2xl transition-all max-w-[90vw] md:max-w-2xl w-full`}>
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${theme === "dark" ? "bg-white/10 text-white" : "bg-[#2F3CD9]/15 text-[#2F3CD9]"}`}>
              {selectedIds.length} sélectionné{selectedIds.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className={`text-[10px] font-bold ${cls.textMuted} hover:${cls.textMain} underline transition-colors cursor-pointer`}
            >
              Désélectionner
            </button>
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Status change actions */}
            <button
              onClick={() => handleBulkAction("status", { status: "publish" })}
              disabled={isBulkUpdating}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${theme === "dark" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10" : "border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"} transition-all cursor-pointer disabled:opacity-50`}
            >
              Publier
            </button>
            <button
              onClick={() => handleBulkAction("status", { status: "draft" })}
              disabled={isBulkUpdating}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${theme === "dark" ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-100"} transition-all cursor-pointer disabled:opacity-50`}
            >
              Brouillon
            </button>

            {/* Price change action */}
            <div className="relative">
              <button
                onClick={() => setShowPricePopover(!showPricePopover)}
                disabled={isBulkUpdating}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${theme === "dark" ? "border-amber-500/30 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10" : "border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100"} transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50`}
              >
                <span>Ajuster le prix</span>
                <svg className={`w-3 h-3 transition-transform ${showPricePopover ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Price adjustment popover */}
              {showPricePopover && (
                <div className={`absolute bottom-full mb-3 right-0 ${theme === "dark" ? "bg-[#181824] border-white/10 text-white" : "bg-white border-gray-200 text-black"} border rounded-2xl p-4 w-64 shadow-xl z-50 flex flex-col gap-3`}>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Modifier les prix</div>
                  <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                    <button
                      onClick={() => setBulkPriceDirection("increase")}
                      className={`flex-1 text-[10px] font-bold py-1 rounded-md transition-all cursor-pointer ${bulkPriceDirection === "increase" ? "bg-[#2F3CD9] text-white" : `${cls.textMuted} hover:text-white`}`}
                    >
                      Augmenter
                    </button>
                    <button
                      onClick={() => setBulkPriceDirection("decrease")}
                      className={`flex-1 text-[10px] font-bold py-1 rounded-md transition-all cursor-pointer ${bulkPriceDirection === "decrease" ? "bg-[#2F3CD9] text-white" : `${cls.textMuted} hover:text-white`}`}
                    >
                      Diminuer
                    </button>
                  </div>

                  <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                    <button
                      onClick={() => setBulkPriceType("percentage")}
                      className={`flex-1 text-[10px] font-bold py-1 rounded-md transition-all cursor-pointer ${bulkPriceType === "percentage" ? "bg-white/10 text-white" : `${cls.textMuted} hover:text-white`}`}
                    >
                      En %
                    </button>
                    <button
                      onClick={() => setBulkPriceType("fixed")}
                      className={`flex-1 text-[10px] font-bold py-1 rounded-md transition-all cursor-pointer ${bulkPriceType === "fixed" ? "bg-white/10 text-white" : `${cls.textMuted} hover:text-white`}`}
                    >
                      En €
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      placeholder={bulkPriceType === "percentage" ? "Ex: 10 pour 10%" : "Ex: 2.50 pour 2.50€"}
                      value={bulkPriceValue}
                      onChange={(e) => setBulkPriceValue(e.target.value)}
                      className={`w-full text-xs px-2.5 py-1.5 rounded-lg border ${cls.border} ${cls.inputBg} ${cls.textMain} focus:outline-none focus:border-[#2F3CD9]`}
                    />
                    <button
                      onClick={() => {
                        const val = parseFloat(bulkPriceValue);
                        if (isNaN(val) || val <= 0) {
                          alert("Veuillez saisir une valeur supérieure à 0.");
                          return;
                        }
                        handleBulkAction("price", {
                          priceType: bulkPriceType,
                          priceDirection: bulkPriceDirection,
                          priceValue: val
                        });
                      }}
                      className="px-3 py-1.5 bg-[#2F3CD9] hover:bg-[#202bb8] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Delete bulk action */}
            <button
              onClick={() => handleBulkAction("delete")}
              disabled={isBulkUpdating}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
