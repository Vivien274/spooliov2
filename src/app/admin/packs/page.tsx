"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdminTheme } from "../AdminThemeContext";
import { Pack, PackagingType } from "@/types/packs";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  AlertTriangle,
  Search,
  ArrowUp,
  ArrowDown,
  X,
  Sparkles,
  Info,
} from "lucide-react";

interface CatalogProductSummary {
  id: number;
  name: string;
  slug: string;
  price: string;
  image: string;
  stock?: number;
  attributes?: unknown;
  categories?: { id: number; name: string; slug: string }[];
}

export default function AdminPacksPage() {
  const { cls } = useAdminTheme();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProductSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPack, setEditingPack] = useState<Partial<Pack> | null>(null);
  const [savingLoading, setSavingLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Component search state inside modal
  const [productSearch, setProductSearch] = useState<string>("");

  const fetchPacksData = async () => {
    try {
      const res = await fetch("/api/admin/packs");
      const data = await res.json();
      if (data.success) {
        setPacks(data.packs || []);
        setCatalogProducts(data.products || []);
      }
    } catch (e) {
      console.error("Error fetching packs data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    fetch("/api/admin/packs")
      .then((res) => res.json())
      .then((data) => {
        if (isSubscribed && data.success) {
          setPacks(data.packs || []);
          setCatalogProducts(data.products || []);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (isSubscribed) {
          console.error("Error fetching packs:", e);
          setLoading(false);
        }
      });
    return () => {
      isSubscribed = false;
    };
  }, []);

  const filteredPacks = useMemo(() => {
    return packs.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tagline && p.tagline.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.status === "active") ||
        (statusFilter === "draft" && p.status !== "active");

      const matchCategory =
        categoryFilter === "all" || p.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [packs, searchQuery, statusFilter, categoryFilter]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    packs.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [packs]);

  const handleOpenCreateModal = () => {
    setEditingPack({
      name: "",
      slug: "",
      tagline: "",
      shortDescription: "",
      description: "",
      price: 15.0,
      status: "active",
      category: "noel-2026",
      packagingType: "boite_kraft",
      packagingNotes: "Boîte kraft Spoolio, sticker offert, carte personnalisée.",
      displayOrder: packs.length + 1,
      image: "",
      gallery: [],
      items: [],
    });
    setFormError(null);
    setActiveTab("edit");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pack: Pack) => {
    setEditingPack({ ...pack });
    setFormError(null);
    setActiveTab("edit");
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (pack: Pack) => {
    const newStatus = pack.status === "active" ? "draft" : "active";
    try {
      const res = await fetch("/api/admin/packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pack, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setPacks((prev) =>
          prev.map((p) => (p.id === pack.id ? { ...p, status: newStatus } : p))
        );
      }
    } catch (e) {
      console.error("Error toggling pack status:", e);
    }
  };

  const handleDeletePack = async (pack: Pack) => {
    if (!confirm(`Supprimer définitivement le pack "${pack.name}" ?`)) return;
    try {
      const res = await fetch(`/api/admin/packs?id=${pack.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setPacks((prev) => prev.filter((p) => p.id !== pack.id));
      }
    } catch (e) {
      console.error("Error deleting pack:", e);
    }
  };

  // Helper calculations for editingPack
  const editingStats = useMemo(() => {
    if (!editingPack || !editingPack.items) {
      return { totalValue: 0, savings: 0, savingsPercent: 0, minStock: Infinity, hasStockIssue: false };
    }

    let total = 0;
    let minStock = Infinity;
    let hasStockIssue = false;

    editingPack.items.forEach((item) => {
      const prod = catalogProducts.find((p) => p.id === item.productId);
      const price = prod && prod.price ? parseFloat(prod.price) : 0;
      total += price * (item.quantity || 1);

      if (prod && typeof prod.stock === "number" && prod.stock >= 0) {
        const canMake = Math.floor(prod.stock / (item.quantity || 1));
        if (canMake < minStock) minStock = canMake;
        if (prod.stock <= 0) hasStockIssue = true;
      }
    });

    const roundedTotal = Math.round(total * 100) / 100;
    const packPrice = typeof editingPack.price === "number" ? editingPack.price : 0;
    const savings = Math.max(0, Math.round((roundedTotal - packPrice) * 100) / 100);
    const savingsPercent = roundedTotal > 0 ? Math.round((savings / roundedTotal) * 100) : 0;

    return {
      totalValue: roundedTotal,
      savings,
      savingsPercent,
      minStock: minStock === Infinity ? 999 : minStock,
      hasStockIssue,
    };
  }, [editingPack, catalogProducts]);

  const handleAddComponent = (product: CatalogProductSummary) => {
    if (!editingPack) return;
    const items = [...(editingPack.items || [])];

    // If already present, increment quantity
    const existingIdx = items.findIndex((i) => i.productId === product.id);
    if (existingIdx >= 0) {
      items[existingIdx].quantity += 1;
    } else {
      items.push({
        id: `comp_${product.id}_${items.length + 1}`,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productPrice: parseFloat(product.price) || 0,
        productImage: product.image,
        quantity: 1,
        variant: null,
        displayOrder: items.length + 1,
      });
    }

    // Auto set primary pack image if not set yet
    let newImage = editingPack.image;
    if (!newImage && product.image) {
      newImage = product.image;
    }

    setEditingPack({ ...editingPack, items, image: newImage });
    setProductSearch("");
  };

  const handleUpdateComponentQty = (index: number, newQty: number) => {
    if (!editingPack || !editingPack.items) return;
    const items = [...editingPack.items];
    if (newQty <= 0) {
      items.splice(index, 1);
    } else {
      items[index] = { ...items[index], quantity: newQty };
    }
    setEditingPack({ ...editingPack, items });
  };

  const handleUpdateComponentVariant = (index: number, variant: string) => {
    if (!editingPack || !editingPack.items) return;
    const items = [...editingPack.items];
    items[index] = { ...items[index], variant: variant.trim() || null };
    setEditingPack({ ...editingPack, items });
  };

  const handleMoveComponent = (index: number, direction: "up" | "down") => {
    if (!editingPack || !editingPack.items) return;
    const items = [...editingPack.items];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    // reindex displayOrder
    items.forEach((it, idx) => (it.displayOrder = idx + 1));
    setEditingPack({ ...editingPack, items });
  };

  const handleRemoveComponent = (index: number) => {
    if (!editingPack || !editingPack.items) return;
    const items = [...editingPack.items];
    items.splice(index, 1);
    items.forEach((it, idx) => (it.displayOrder = idx + 1));
    setEditingPack({ ...editingPack, items });
  };

  const handleSavePackForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPack) return;

    if (!editingPack.name || !editingPack.name.trim()) {
      setFormError("Veuillez renseigner un nom pour le pack.");
      return;
    }

    if (!editingPack.items || editingPack.items.length === 0) {
      setFormError("Veuillez ajouter au moins un produit composant au pack.");
      return;
    }

    if (typeof editingPack.price !== "number" || editingPack.price < 0) {
      setFormError("Veuillez définir un prix de vente valide.");
      return;
    }

    setSavingLoading(true);
    setFormError(null);

    try {
      const res = await fetch("/api/admin/packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPack),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur de sauvegarde");
      }

      setIsModalOpen(false);
      setEditingPack(null);
      await fetchPacksData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSavingLoading(false);
    }
  };

  return (
    <div className={`p-6 max-w-7xl mx-auto space-y-6 ${cls.pageBg}`}>
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            <h1 className="text-2xl font-black tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] uppercase">
              Système de Packs & Coffrets
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#FF5500] border border-orange-200">
              {packs.length} pack{packs.length > 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-1">
            Gérez vos coffrets et bundles multi-produits avec calcul automatique des économies et respect des stocks unitaires.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/noel"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 transition-colors"
          >
            <span>Voir /noel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-[#FF5500] hover:bg-[#e04b00] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Pack</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, slug, accroche..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "draft")}
            className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-[#FF5500]"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs uniquement</option>
            <option value="draft">Brouillons / Inactifs</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-[#FF5500]"
          >
            <option value="all">Toutes les opérations</option>
            {uniqueCategories.map((c) => (
              <option key={c} value={c}>
                {c === "noel-2026" ? "Campagne Noël 2026" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PACKS TABLE / LIST */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200">
          <div className="w-8 h-8 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-500 font-mono">Chargement des packs...</p>
        </div>
      ) : filteredPacks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200 space-y-3">
          <Package className="w-12 h-12 text-zinc-300 mx-auto" />
          <p className="text-sm font-bold text-zinc-700">Aucun pack ne correspond aux critères.</p>
          <button
            onClick={handleOpenCreateModal}
            className="text-xs font-bold text-[#FF5500] hover:underline"
          >
            Créer votre premier pack
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Pack</th>
                  <th className="py-3 px-4">Opération / Tag</th>
                  <th className="py-3 px-4">Composants</th>
                  <th className="py-3 px-4">Prix de vente</th>
                  <th className="py-3 px-4">Valeur réelle</th>
                  <th className="py-3 px-4">Économie</th>
                  <th className="py-3 px-4">Disponibilité</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredPacks.map((pack) => {
                  const hasStockWarning = pack.items.some((it) => {
                    const prod = catalogProducts.find((p) => p.id === it.productId);
                    return prod && typeof prod.stock === "number" && prod.stock <= 0;
                  });

                  return (
                    <tr
                      key={pack.id}
                      className="hover:bg-zinc-50/60 transition-colors group"
                    >
                      {/* PACK INFO */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                            {pack.image ? (
                              <Image
                                src={pack.image}
                                alt={pack.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-zinc-950 text-sm truncate max-w-[200px]">
                              {pack.name}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-500 truncate max-w-[200px]">
                              /{pack.slug}
                            </div>
                            {pack.tagline && (
                              <div className="text-[11px] text-zinc-600 italic truncate max-w-[220px]">
                                « {pack.tagline} »
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {pack.category === "noel-2026" ? "🎄 Noël 2026" : pack.category}
                        </span>
                      </td>

                      {/* COMPONENTS */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-bold text-zinc-800">
                            {pack.items.length} article{pack.items.length > 1 ? "s" : ""}
                          </span>
                          <div className="flex items-center -space-x-2">
                            {pack.items.slice(0, 4).map((it, idx) => (
                              <div
                                key={idx}
                                className="w-6 h-6 rounded-full border border-white bg-zinc-200 overflow-hidden relative shadow-2xs"
                                title={`${it.productName || "Article"} x${it.quantity}`}
                              >
                                {it.productImage && (
                                  <Image
                                    src={it.productImage}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="24px"
                                  />
                                )}
                              </div>
                            ))}
                            {pack.items.length > 4 && (
                              <span className="text-[10px] font-bold text-zinc-500 pl-3">
                                +{pack.items.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* PRICE */}
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-zinc-950">
                        {pack.price.toFixed(2)} €
                      </td>

                      {/* CUMULATIVE VALUE */}
                      <td className="py-3.5 px-4 font-mono text-zinc-500 line-through">
                        {pack.totalComponentsValue ? `${pack.totalComponentsValue.toFixed(2)} €` : "—"}
                      </td>

                      {/* SAVINGS */}
                      <td className="py-3.5 px-4">
                        {pack.savingsAmount && pack.savingsAmount > 0 ? (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-xs">
                            -{pack.savingsAmount.toFixed(2)} € ({pack.savingsPercentage}%)
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-mono text-[11px]">Prix égal</span>
                        )}
                      </td>

                      {/* STOCK / DISPONIBILITÉ */}
                      <td className="py-3.5 px-4">
                        {hasStockWarning ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Rupture composant
                          </span>
                        ) : pack.isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            {pack.availableStock && pack.availableStock < 999
                              ? `${pack.availableStock} dispo`
                              : "En stock / Atelier"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-600">
                            Indisponible
                          </span>
                        )}
                      </td>

                      {/* STATUT */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(pack)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                            pack.status === "active"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                          }`}
                        >
                          {pack.status === "active" ? "Actif ✓" : "Inactif"}
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/product/${pack.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                            title="Voir sur le site"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(pack)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-[#FF5500] hover:bg-orange-50 transition-colors cursor-pointer"
                            title="Modifier le pack"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePack(pack)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && editingPack && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-zinc-200 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-[#FF5500]">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-950 font-[family-name:var(--font-antonio)] uppercase">
                    {editingPack.id ? "Modifier le Pack" : "Créer un nouveau Pack"}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Définissez la composition, le tarif promotionnel et le packaging.
                  </p>
                </div>
              </div>

              {/* TABS: EDIT / PREVIEW */}
              <div className="flex items-center gap-2">
                <div className="flex bg-zinc-200 p-0.5 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === "edit" ? "bg-white text-zinc-950 shadow-2xs" : "text-zinc-600"
                    }`}
                  >
                    Édition
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === "preview" ? "bg-white text-zinc-950 shadow-2xs" : "text-zinc-600"
                    }`}
                  >
                    Aperçu
                  </button>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {activeTab === "edit" ? (
                <form id="pack-form" onSubmit={handleSavePackForm} className="space-y-6">
                  {/* BASIC INFOS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                        Nom du Pack *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingPack.name || ""}
                        onChange={(e) => {
                          const name = e.target.value;
                          const slug = name
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-+|-+$/g, "");
                          setEditingPack({
                            ...editingPack,
                            name,
                            slug: editingPack.id ? editingPack.slug : slug,
                          });
                        }}
                        placeholder="Ex: Le kit anti-réunion"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                        Slug URL *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingPack.slug || ""}
                        onChange={(e) => setEditingPack({ ...editingPack, slug: e.target.value })}
                        placeholder="Ex: le-kit-anti-reunion"
                        className="w-full px-3 py-2 text-xs rounded-xl font-mono border border-zinc-300 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                      Accroche courte (Punchline)
                    </label>
                    <input
                      type="text"
                      value={editingPack.tagline || ""}
                      onChange={(e) => setEditingPack({ ...editingPack, tagline: e.target.value })}
                      placeholder="Ex: Pour survivre à une réunion qui aurait pu être un e-mail."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                      Description complète
                    </label>
                    <textarea
                      rows={3}
                      value={editingPack.description || ""}
                      onChange={(e) => setEditingPack({ ...editingPack, description: e.target.value })}
                      placeholder="Présentation du coffret, ambiance, contexte d'usage..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>

                  {/* PRICING & ECONOMIC ENGINE (SECTION CRITIQUE) */}
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#FF5500]" />
                        Moteur Tarifaire & Calcul des Économies
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {editingPack.items?.length || 0} composant(s)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700">
                          Prix de Vente Pack (€) *
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          required
                          value={editingPack.price ?? 0}
                          onChange={(e) =>
                            setEditingPack({
                              ...editingPack,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#FF5500]"
                        />
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200 flex flex-col justify-center">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                          Valeur cumulée composants
                        </span>
                        <span className="text-sm font-mono font-bold text-zinc-800">
                          {editingStats.totalValue.toFixed(2)} €
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200 flex flex-col justify-center">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                          Économie Réelle Client
                        </span>
                        {editingStats.savings > 0 ? (
                          <span className="text-sm font-mono font-black text-emerald-600">
                            -{editingStats.savings.toFixed(2)} € ({editingStats.savingsPercent}%)
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-amber-600">
                            Pas d&apos;économie (Prix ≥ Cumul)
                          </span>
                        )}
                      </div>
                    </div>

                    {typeof editingPack.price === "number" &&
                      editingPack.price > editingStats.totalValue &&
                      editingStats.totalValue > 0 && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            Attention : Le prix du pack ({editingPack.price} €) est supérieur à la somme des composants ({editingStats.totalValue} €).
                          </span>
                        </div>
                      )}
                  </div>

                  {/* COMPONENT BUILDER */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                        Composants du Pack ({editingPack.items?.length || 0})
                      </label>
                      <span className="text-[11px] text-zinc-500">
                        Composition fixe recommandée pour Noël 2026
                      </span>
                    </div>

                    {/* Component Search Dropdown */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un produit du catalogue à ajouter au pack..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-white border border-zinc-300 focus:outline-none focus:border-[#FF5500]"
                      />

                      {productSearch.trim().length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-zinc-200 rounded-xl shadow-xl z-20 divide-y divide-zinc-100">
                          {catalogProducts
                            .filter(
                              (p) =>
                                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                                p.slug.toLowerCase().includes(productSearch.toLowerCase())
                            )
                            .slice(0, 8)
                            .map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleAddComponent(p)}
                                className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden relative shrink-0">
                                    {p.image && (
                                      <Image
                                        src={p.image}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        sizes="32px"
                                      />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-xs text-zinc-900 truncate">
                                      {p.name}
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-500">
                                      {p.price} € {p.stock !== undefined ? `• Stock : ${p.stock}` : ""}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-[#FF5500] shrink-0">
                                  + Ajouter
                                </span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Component Items List */}
                    {(!editingPack.items || editingPack.items.length === 0) ? (
                      <div className="p-6 text-center border-2 border-dashed border-zinc-200 rounded-2xl text-xs text-zinc-400">
                        Aucun produit dans ce pack. Utilisez la recherche ci-dessus pour ajouter des composants.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {editingPack.items.map((item, idx) => {
                          const prod = catalogProducts.find((p) => p.id === item.productId);
                          const isOutOfStock = prod && typeof prod.stock === "number" && prod.stock <= 0;

                          return (
                            <div
                              key={item.id || idx}
                              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                isOutOfStock ? "bg-rose-50/70 border-rose-200" : "bg-zinc-50 border-zinc-200"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 overflow-hidden relative shrink-0">
                                  {item.productImage && (
                                    <Image
                                      src={item.productImage}
                                      alt=""
                                      fill
                                      className="object-cover"
                                      sizes="40px"
                                    />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-xs text-zinc-950 truncate">
                                    {item.productName || (prod ? prod.name : `Produit #${item.productId}`)}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                                    <span>Prix unitaire : {prod ? prod.price : item.productPrice} €</span>
                                    {isOutOfStock && (
                                      <span className="text-rose-600 font-bold">
                                        ⚠️ Rupture de stock ({prod?.stock})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Variant option override */}
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Variante fixe (ex: Couleur: Orange)"
                                  value={item.variant || ""}
                                  onChange={(e) => handleUpdateComponentVariant(idx, e.target.value)}
                                  className="px-2 py-1 text-[11px] rounded-lg bg-white border border-zinc-200 w-36"
                                />

                                {/* Quantity +/- */}
                                <div className="flex items-center border border-zinc-300 rounded-lg bg-white">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateComponentQty(idx, item.quantity - 1)}
                                    className="px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 text-xs font-mono font-bold">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateComponentQty(idx, item.quantity + 1)}
                                    className="px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Order & Delete */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveComponent(idx, "up")}
                                    disabled={idx === 0}
                                    className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveComponent(idx, "down")}
                                    disabled={idx === editingPack.items!.length - 1}
                                    className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveComponent(idx)}
                                    className="p-1 text-zinc-400 hover:text-rose-600"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* PACKAGING & LOGISTICS CONFIG */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-200 pt-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                        Modalité de Packaging
                      </label>
                      <select
                        value={editingPack.packagingType || "boite_kraft"}
                        onChange={(e) =>
                          setEditingPack({
                            ...editingPack,
                            packagingType: e.target.value as PackagingType,
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 focus:outline-none focus:border-[#FF5500]"
                      >
                        <option value="pochette_kraft">Pochette Kraft (recommandé 12€)</option>
                        <option value="boite_kraft">Boîte Kraft rigide (recommandé 19€ et 29€)</option>
                        <option value="custom">Format Spécial / Sur-mesure</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                        Catégorie / Opération commerciale
                      </label>
                      <input
                        type="text"
                        value={editingPack.category || "noel-2026"}
                        onChange={(e) => setEditingPack({ ...editingPack, category: e.target.value })}
                        placeholder="Ex: noel-2026, bundles, decouverte"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                        Notes d&apos;emballage pour l&apos;atelier
                      </label>
                      <input
                        type="text"
                        value={editingPack.packagingNotes || ""}
                        onChange={(e) =>
                          setEditingPack({ ...editingPack, packagingNotes: e.target.value })
                        }
                        placeholder="Ex: Pochette kraft avec sticker Spoolio et carte personnalisée..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>
                  </div>

                  {/* IMAGES & SEO */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-200 pt-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                        Image Principale (URL)
                      </label>
                      <input
                        type="text"
                        value={editingPack.image || ""}
                        onChange={(e) => setEditingPack({ ...editingPack, image: e.target.value })}
                        placeholder="https://... ou /images/..."
                        className="w-full px-3 py-2 text-xs rounded-xl font-mono border border-zinc-300 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                        Statut
                      </label>
                      <select
                        value={editingPack.status || "active"}
                        onChange={(e) =>
                          setEditingPack({ ...editingPack, status: e.target.value as "active" | "draft" | "archived" })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 focus:outline-none focus:border-[#FF5500]"
                      >
                        <option value="active">Actif (En ligne)</option>
                        <option value="draft">Brouillon (Non visible)</option>
                        <option value="archived">Archivé</option>
                      </select>
                    </div>
                  </div>
                </form>
              ) : (
                /* LIVE PREVIEW TAB */
                <div className="space-y-6">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3">
                    <Info className="w-5 h-5 text-[#FF5500] shrink-0" />
                    <p className="text-xs text-orange-900">
                      Prévisualisation fidèle de la carte pack telle qu&apos;elle apparaîtra sur <strong>/noel</strong> et dans la boutique.
                    </p>
                  </div>

                  <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#E4E4E0] overflow-hidden shadow-sm p-5 space-y-4">
                    <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
                      {editingPack.image ? (
                        <Image
                          src={editingPack.image}
                          alt={editingPack.name || ""}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                          <Package className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-zinc-950 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {editingPack.category === "noel-2026" ? "Coffret Noël 2026" : "Coffret Spoolio"}
                      </div>
                      {editingStats.savings > 0 && (
                        <div className="absolute top-3 right-3 bg-[#FF5500] text-white font-mono text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                          -{editingStats.savings.toFixed(2)} €
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-zinc-950 font-[family-name:var(--font-antonio)] uppercase">
                        {editingPack.name || "Titre du Pack"}
                      </h3>
                      {editingPack.tagline && (
                        <p className="text-xs text-zinc-600 italic mt-0.5">
                          « {editingPack.tagline} »
                        </p>
                      )}
                    </div>

                    {/* Contenu détaillé du coffret */}
                    <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                      <div className="text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-wider">
                        Ce coffret contient :
                      </div>
                      <div className="space-y-1.5">
                        {editingPack.items?.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-zinc-800">
                            <span className="font-mono font-bold text-[#FF5500]">x{it.quantity}</span>
                            <span className="font-semibold truncate">{it.productName || "Article"}</span>
                            {it.variant && (
                              <span className="text-[10px] text-zinc-500">({it.variant})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black font-mono text-zinc-950">
                            {editingPack.price?.toFixed(2)} €
                          </span>
                          {editingStats.totalValue > (editingPack.price || 0) && (
                            <span className="text-xs font-mono text-zinc-400 line-through">
                              {editingStats.totalValue.toFixed(2)} €
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled
                        className="px-4 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider bg-[#FF5500] text-white opacity-90 cursor-not-allowed shadow-sm"
                      >
                        Ajouter au panier
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-end gap-3 bg-zinc-50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Annuler
              </button>
              <button
                form="pack-form"
                type="submit"
                disabled={savingLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-[#FF5500] hover:bg-[#e04b00] disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {savingLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Enregistrer le Pack</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
