"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FolderTree,
  Layers,
  Sparkles,
  Tag,
  ShieldCheck,
  Search,
  Plus,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Info,
  RefreshCw,
  Power,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Package,
} from "lucide-react";
import { useAdminTheme } from "../AdminThemeContext";
import { CatalogTaxonomyItem, TaxonomyType, normalizeSlug } from "@/types/taxonomy";

export default function TaxonomyAdminClient() {
  const { cls } = useAdminTheme();

  const [activeTab, setActiveTab] = useState<TaxonomyType>("universe");
  const [items, setItems] = useState<CatalogTaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Migration Google Sheet state
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const handleImportSheet = async (force: boolean) => {
    setImportLoading(true);
    setImportResult(null);
    try {
      const res = await fetch(`/api/admin/taxonomy/import-sheet${force ? "?force=true" : ""}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setImportResult(data);
        setFeedback({
          type: "success",
          text: data.message || "Opération réussie.",
        });
        fetchTaxonomies();
      } else {
        setFeedback({
          type: "error",
          text: data.error || data.details || "Erreur lors de l'import.",
        });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: `Erreur réseau : ${err.message}` });
    } finally {
      setImportLoading(false);
    }
  };

  // Filtre univers pour l'onglet catégories
  const [selectedUniverseFilter, setSelectedUniverseFilter] = useState<number | "all">("all");

  // Recherche dans les tags
  const [tagSearch, setTagSearch] = useState("");

  // Modal d'édition/création
  const [editingItem, setEditingItem] = useState<CatalogTaxonomyItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [creationType, setCreationType] = useState<TaxonomyType>("tag");

  // Formulaire d'édition
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    parent_id: number | null;
    subtitle: string;
    description: string;
    seo_title: string;
    seo_description: string;
    sort_order: number;
    is_active: boolean;
    is_indexable: boolean;
  }>({
    name: "",
    slug: "",
    parent_id: null,
    subtitle: "",
    description: "",
    seo_title: "",
    seo_description: "",
    sort_order: 10,
    is_active: true,
    is_indexable: true,
  });

  // Modal spécifique pour la création d'univers (délibérée)
  const [showUniverseCreateModal, setShowUniverseCreateModal] = useState(false);

  // Charger les taxonomies
  const fetchTaxonomies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/taxonomy");
      const data = await res.json();
      if (res.ok && data.items) {
        setItems(data.items);
      } else {
        setFeedback({ type: "error", text: data.error || "Erreur de chargement." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: `Erreur réseau : ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxonomies();
  }, []);

  // Découpage par type
  const universes = useMemo(() => items.filter((i) => i.type === "universe"), [items]);
  const categories = useMemo(() => items.filter((i) => i.type === "category"), [items]);
  const collections = useMemo(() => items.filter((i) => i.type === "collection"), [items]);
  const tags = useMemo(() => items.filter((i) => i.type === "tag"), [items]);

  // Catégories filtrées par univers
  const filteredCategories = useMemo(() => {
    if (selectedUniverseFilter === "all") return categories;
    return categories.filter((c) => c.parent_id === selectedUniverseFilter);
  }, [categories, selectedUniverseFilter]);

  // Tags filtrés par recherche
  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return tags;
    const q = tagSearch.toLowerCase().trim();
    return tags.filter((t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q));
  }, [tags, tagSearch]);

  // Ouvrir l'éditeur pour un item existant
  const handleOpenEdit = (item: CatalogTaxonomyItem) => {
    setEditingItem(item);
    setIsCreating(false);
    setFormData({
      name: item.name,
      slug: item.slug,
      parent_id: item.parent_id,
      subtitle: item.subtitle || "",
      description: item.description || "",
      seo_title: item.seo_title || "",
      seo_description: item.seo_description || "",
      sort_order: item.sort_order ?? 10,
      is_active: item.is_active ?? true,
      is_indexable: item.is_indexable ?? true,
    });
  };

  // Ouvrir l'éditeur pour une création
  const handleOpenCreate = (type: TaxonomyType) => {
    if (type === "universe") {
      setShowUniverseCreateModal(true);
      return;
    }
    setEditingItem(null);
    setIsCreating(true);
    setCreationType(type);
    setFormData({
      name: "",
      slug: "",
      parent_id: type === "category" ? (universes[0]?.id || null) : null,
      subtitle: "",
      description: "",
      seo_title: "",
      seo_description: "",
      sort_order: 10,
      is_active: true,
      is_indexable: type !== "tag",
    });
  };

  // Fermer la modale
  const handleCloseModal = () => {
    setEditingItem(null);
    setIsCreating(false);
    setShowUniverseCreateModal(false);
  };

  // Sauvegarde d'un élément
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Le nom est obligatoire.");
      return;
    }

    const type = isCreating ? creationType : editingItem!.type;
    const slug = formData.slug.trim() || normalizeSlug(formData.name);

    // Validation doublons tags (fidget vs fidgets vs Fidget)
    if (type === "tag") {
      const normalizedQuery = normalizeSlug(formData.name);
      const duplicate = tags.find(
        (t) =>
          (editingItem ? t.id !== editingItem.id : true) &&
          (normalizeSlug(t.name) === normalizedQuery || t.slug === slug)
      );
      if (duplicate) {
        alert(`Attention : Un tag très similaire existe déjà ("${duplicate.name}" - slug: "${duplicate.slug}"). Évitez les doublons de pluriels ou de casse.`);
        return;
      }
    }

    setActionLoading(true);
    setFeedback(null);

    const payload = {
      type,
      name: formData.name.trim(),
      slug,
      parent_id: type === "category" ? formData.parent_id : null,
      subtitle: formData.subtitle.trim() || null,
      description: formData.description.trim() || null,
      seo_title: formData.seo_title.trim() || null,
      seo_description: formData.seo_description.trim() || null,
      sort_order: Number(formData.sort_order),
      is_active: formData.is_active,
      is_indexable: formData.is_indexable,
    };

    try {
      const url = isCreating ? "/api/admin/taxonomy" : `/api/admin/taxonomy/${editingItem!.id}`;
      const method = isCreating ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: "success",
          text: data.message || "Opération réussie (Mode local protégé).",
        });

        // Mettre à jour la liste locale
        if (isCreating && data.item) {
          setItems((prev) => [...prev, data.item]);
        } else if (data.item) {
          setItems((prev) => prev.map((it) => (it.id === data.item.id ? { ...it, ...data.item } : it)));
        }

        handleCloseModal();
      } else {
        alert(data.error || "Erreur lors de la sauvegarde.");
      }
    } catch (err: any) {
      alert(`Erreur réseau : ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle rapide actif/inactif
  const handleToggleActive = async (item: CatalogTaxonomyItem) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/taxonomy/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          is_active: !item.is_active,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, is_active: !it.is_active } : it))
        );
        setFeedback({
          type: "success",
          text: `Statut de "${item.name}" mis à jour : ${!item.is_active ? "Actif" : "Inactif"}.`,
        });
      }
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${cls.pageBg} p-6 sm:p-8 font-sans transition-colors`}>
      {/* HEADER PRINCIPAL */}
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#ff4f00] tracking-wider mb-1">
              <span>// Spoolio Architecture</span>
              <span>•</span>
              <span>Back-Office V2.1</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 font-outfit tracking-tight flex items-center gap-3">
              <span>Taxonomie du Catalogue</span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                Supabase V2.1
              </span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
              Gérez les 4 niveaux de la taxonomie contemporaine Spoolio : Univers racines, Catégories, Collections thématiques et Tags.
            </p>
          </div>

          {/* Badge Sécurisé Dry-Run */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex flex-col">
                <span>Mode Local Sécurisé</span>
                <span className="text-[10px] text-emerald-600 font-normal">Dry Run — Aucune écriture distante</span>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchTaxonomies}
              disabled={loading}
              className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer"
              title="Rafraîchir les données"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#ff4f00]" : ""}`} />
            </button>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-red-50 text-red-900 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {feedback.type === "success" ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* BANNIÈRE MIGRATION GOOGLE SHEET */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-50/80 via-white to-amber-50/60 border border-orange-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ff4f00] bg-white px-2 py-0.5 rounded-full border border-orange-200">
                Migration Catalogue V2.1
              </span>
              <span className="text-xs text-zinc-500 font-medium">Source Google Sheet</span>
            </div>
            <h3 className="text-base font-black text-zinc-950 font-antonio tracking-wide uppercase">
              199 PRODUITS ANALYSÉS &bull; 134 ACTIFS RÉSOLUS À 100%
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              La classification V2.1 issue de votre feuille d&apos;audit est prête : 14 Hero, 35 Keep, 85 Rework et 65 Archives. 
              Chaque produit actif dispose de son Univers, sa Catégorie et ses Collections.
            </p>
            {importResult && (
              <div className="pt-2 text-xs font-mono font-semibold text-[#ff4f00]">
                {importResult.message}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="https://docs.google.com/spreadsheets/d/1ZPq9G1L-9B4BAhvS4pTSe3vzgq8ySd0YSed1l72l5Dc/edit?gid=1100007310"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>Voir le Sheet</span>
            </a>

            <button
              type="button"
              onClick={() => handleImportSheet(false)}
              disabled={importLoading}
              className="px-4 py-2 rounded-xl border border-orange-200 bg-orange-100/70 hover:bg-orange-100 text-orange-950 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#ff4f00] ${importLoading ? "animate-spin" : ""}`} />
              <span>Tester (Dry Run)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm("Confirmez-vous l'application de la classification V2.1 aux 134 produits du catalogue ?")) {
                  handleImportSheet(true);
                }
              }}
              disabled={importLoading}
              className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-[#ff4f00] text-white text-xs font-black transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Appliquer aux 134 produits</span>
            </button>
          </div>
        </div>

        {/* STATS RAPIDES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={() => setActiveTab("universe")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === "universe"
                ? "bg-white border-[#ff4f00] ring-2 ring-[#ff4f00]/20 shadow-xs"
                : "bg-white/80 border-zinc-200/90 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-mono font-bold uppercase">Univers</span>
              <FolderTree className="w-4 h-4 text-[#ff4f00]" />
            </div>
            <div className="text-2xl font-black text-zinc-950 font-outfit">{universes.length}</div>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">Grandes portes d&apos;entrée</span>
          </div>

          <div
            onClick={() => setActiveTab("category")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === "category"
                ? "bg-white border-[#ff4f00] ring-2 ring-[#ff4f00]/20 shadow-xs"
                : "bg-white/80 border-zinc-200/90 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-mono font-bold uppercase">Catégories</span>
              <Layers className="w-4 h-4 text-[#ff4f00]" />
            </div>
            <div className="text-2xl font-black text-zinc-950 font-outfit">{categories.length}</div>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">Sous-groupes typologiques</span>
          </div>

          <div
            onClick={() => setActiveTab("collection")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === "collection"
                ? "bg-white border-[#ff4f00] ring-2 ring-[#ff4f00]/20 shadow-xs"
                : "bg-white/80 border-zinc-200/90 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-mono font-bold uppercase">Collections</span>
              <Sparkles className="w-4 h-4 text-[#ff4f00]" />
            </div>
            <div className="text-2xl font-black text-zinc-950 font-outfit">{collections.length}</div>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">Séries artistiques &amp; capsules</span>
          </div>

          <div
            onClick={() => setActiveTab("tag")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === "tag"
                ? "bg-white border-[#ff4f00] ring-2 ring-[#ff4f00]/20 shadow-xs"
                : "bg-white/80 border-zinc-200/90 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-mono font-bold uppercase">Tags</span>
              <Tag className="w-4 h-4 text-[#ff4f00]" />
            </div>
            <div className="text-2xl font-black text-zinc-950 font-outfit">{tags.length}</div>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">Mots-clés sensoriels &amp; filtres</span>
          </div>
        </div>

        {/* ONGLETS PRINCIPAUX */}
        <div className="flex items-center justify-between border-b border-zinc-200">
          <div className="flex gap-2">
            {[
              { id: "universe", label: "Univers", count: universes.length, icon: FolderTree },
              { id: "category", label: "Catégories", count: categories.length, icon: Layers },
              { id: "collection", label: "Collections", count: collections.length, icon: Sparkles },
              { id: "tag", label: "Tags", count: tags.length, icon: Tag },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TaxonomyType)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? "border-[#ff4f00] text-[#ff4f00]"
                      : "border-transparent text-zinc-500 hover:text-zinc-950"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? "bg-[#ff4f00]/15 text-[#ff4f00]" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bouton d'action selon l'onglet */}
          <div className="pb-2">
            {activeTab === "universe" && (
              <button
                type="button"
                onClick={() => handleOpenCreate("universe")}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-[#ff4f00] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvel Univers</span>
              </button>
            )}

            {activeTab === "category" && (
              <button
                type="button"
                onClick={() => handleOpenCreate("category")}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-[#ff4f00] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle Catégorie</span>
              </button>
            )}

            {activeTab === "collection" && (
              <button
                type="button"
                onClick={() => handleOpenCreate("collection")}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-[#ff4f00] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle Collection</span>
              </button>
            )}

            {activeTab === "tag" && (
              <button
                type="button"
                onClick={() => handleOpenCreate("tag")}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-[#ff4f00] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Créer un Tag</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 1. SECTION UNIVERS                                             */}
        {/* ============================================================== */}
        {activeTab === "universe" && (
          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-widest font-antonio">
                  Les 4 Univers Fondateurs
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Les univers constituent le sommet de la hiérarchie du catalogue. Leur création est restreinte et délibérée.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {universes.map((u) => {
                const childCatCount = categories.filter((c) => c.parent_id === u.id).length;
                return (
                  <div
                    key={u.id}
                    className="p-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 hover:bg-zinc-50 hover:border-zinc-300 transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-zinc-950 group-hover:text-[#ff4f00] transition-colors">
                            {u.name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700">
                            Ordre : {u.sort_order}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-zinc-500 mt-1">
                          /{u.slug}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-zinc-200 text-zinc-600"
                          }`}
                        >
                          {u.is_active ? "Actif" : "Inactif"}
                        </span>
                        {u.is_indexable && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700" title="Indexable SEO">
                            SEO
                          </span>
                        )}
                      </div>
                    </div>

                    {u.subtitle && (
                      <p className="text-xs text-zinc-600 italic">
                        &quot;{u.subtitle}&quot;
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-200/70 text-xs text-zinc-500">
                      <span className="font-mono text-[11px]">
                        {childCatCount} catégorie(s) rattachée(s)
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. SECTION CATÉGORIES                                          */}
        {/* ============================================================== */}
        {activeTab === "category" && (
          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
              <div>
                <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-widest font-antonio">
                  Catégories V2.1
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Chaque catégorie doit obligatoirement être rattachée à un Univers parent (`parent_id`).
                </p>
              </div>

              {/* Filtre par univers */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-semibold">Filtrer par univers :</span>
                <select
                  value={selectedUniverseFilter}
                  onChange={(e) =>
                    setSelectedUniverseFilter(e.target.value === "all" ? "all" : parseInt(e.target.value, 10))
                  }
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs bg-zinc-50 font-medium text-zinc-800 cursor-pointer focus:outline-none focus:border-[#ff4f00]"
                >
                  <option value="all">Tous les univers ({categories.length})</option>
                  {universes.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({categories.filter((c) => c.parent_id === u.id).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table des catégories */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3">Nom</th>
                    <th className="py-2.5 px-3">Univers Parent</th>
                    <th className="py-2.5 px-3">Slug</th>
                    <th className="py-2.5 px-3">Ordre</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 px-3">SEO</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-3 font-bold text-zinc-950">
                        {cat.name}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#ff4f00]/10 text-[#ff4f00] border border-[#ff4f00]/20">
                          <FolderTree className="w-3 h-3" />
                          <span>{cat.parent_name || "Sans univers"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-500">
                        /{cat.slug}
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-600">
                        {cat.sort_order}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cat.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-zinc-200 text-zinc-600"
                          }`}
                        >
                          {cat.is_active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {cat.is_indexable ? (
                          <span className="text-[10px] font-mono text-emerald-600 font-bold">Indexable</span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-400">Noindex</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold cursor-pointer"
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. SECTION COLLECTIONS                                         */}
        {/* ============================================================== */}
        {activeTab === "collection" && (
          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-widest font-antonio">
                  Collections &amp; Séries Thématiques ({collections.length})
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Éditions capsules, séries limitées et univers créatifs. Vous pouvez mettre en pause une collection saisonnière en un clic.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((col) => (
                <div
                  key={col.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    col.is_active
                      ? "bg-zinc-50/70 border-zinc-200 hover:border-zinc-300"
                      : "bg-zinc-100/50 border-zinc-200/60 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-zinc-950 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#ff4f00]" />
                        <span>{col.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400">/{col.slug}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700 font-bold">
                        {col.product_count ?? 0} prod.
                      </span>
                    </div>
                  </div>

                  {col.subtitle || col.description ? (
                    <p className="text-xs text-zinc-600 line-clamp-2">
                      {col.subtitle || col.description}
                    </p>
                  ) : null}

                  <div className="pt-3 border-t border-zinc-200/70 flex items-center justify-between gap-2">
                    {/* Toggle activation rapide */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(col)}
                      disabled={actionLoading}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        col.is_active
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{col.is_active ? "En ligne" : "En pause"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(col)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Modifier</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. SECTION TAGS                                                */}
        {/* ============================================================== */}
        {activeTab === "tag" && (
          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
              <div>
                <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-widest font-antonio">
                  Tags &amp; Mots-Clés ({tags.length})
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Facilitent la recherche et les filtres. Les tags sont non indexables par défaut. Détection anti-doublon active.
                </p>
              </div>

              {/* Recherche instantanée */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder="Rechercher un tag..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-xs bg-zinc-50 focus:outline-none focus:border-[#ff4f00]"
                />
              </div>
            </div>

            {/* Nuage / Grille de tags */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[560px] overflow-y-auto p-1">
              {filteredTags.map((tagItem) => (
                <div
                  key={tagItem.id}
                  className="p-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 transition-all flex flex-col justify-between gap-1.5 group"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-xs text-zinc-900 group-hover:text-[#ff4f00] truncate">
                      {tagItem.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200/80 text-zinc-600 shrink-0">
                      {tagItem.product_count ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-[10px]">
                    <span className="font-mono text-zinc-400 truncate">/{tagItem.slug}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(tagItem)}
                      className="text-zinc-500 hover:text-zinc-950 p-1 cursor-pointer"
                      title="Renommer / Modifier"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL D'ÉDITION / CRÉATION                                      */}
      {/* ============================================================== */}
      {(editingItem || isCreating) && (
        <div className="fixed inset-0 z-[999999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-zinc-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#ff4f00] tracking-wider">
                  {isCreating ? "Création" : "Modification"} • {isCreating ? creationType : editingItem?.type}
                </span>
                <h3 className="text-lg font-black text-zinc-950 font-outfit">
                  {isCreating ? `Nouveau ${creationType}` : editingItem?.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSaveItem} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nom */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-zinc-700 uppercase">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name: newName,
                        slug: isCreating ? normalizeSlug(newName) : prev.slug,
                      }));
                    }}
                    placeholder="Ex: Fidgets de poche"
                    required
                    className="p-2.5 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-none focus:border-[#ff4f00]"
                  />
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-zinc-700 uppercase">Slug URL</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: normalizeSlug(e.target.value) }))}
                    placeholder="fidgets-de-poche"
                    className="p-2.5 rounded-xl border border-zinc-200 font-mono text-zinc-900 focus:outline-none focus:border-[#ff4f00]"
                  />
                </div>
              </div>

              {/* Univers Parent (pour les catégories) */}
              {(isCreating ? creationType === "category" : editingItem?.type === "category") && (
                <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <label className="font-bold text-amber-900 uppercase flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-[#ff4f00]" />
                    <span>Univers Parent Obligatoire</span>
                  </label>
                  <select
                    value={formData.parent_id ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        parent_id: e.target.value ? parseInt(e.target.value, 10) : null,
                      }))
                    }
                    required
                    className="p-2.5 rounded-xl border border-zinc-200 text-zinc-900 bg-white cursor-pointer"
                  >
                    <option value="">— Choisir l&apos;Univers parent —</option>
                    {universes.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Champs éditoriaux avancés (pour univers, catégorie, collection) */}
              {(isCreating ? creationType !== "tag" : editingItem?.type !== "tag") && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-zinc-700 uppercase">Sous-titre / Accroche</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Phrase courte de présentation..."
                      className="p-2.5 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-none focus:border-[#ff4f00]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-zinc-700 uppercase">Description Éditioriale</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Texte de présentation affiché sur les pages d'archives..."
                      className="p-2.5 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-none focus:border-[#ff4f00]"
                    />
                  </div>

                  {/* Bloc SEO */}
                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col gap-3">
                    <span className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                      Métadonnées Référencement (SEO)
                    </span>
                    <div className="grid grid-cols-1 gap-2.5">
                      <input
                        type="text"
                        value={formData.seo_title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, seo_title: e.target.value }))}
                        placeholder="Balise Title (laisser vide pour titre par défaut)"
                        className="p-2 rounded-lg border border-zinc-200 text-xs bg-white"
                      />
                      <input
                        type="text"
                        value={formData.seo_description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, seo_description: e.target.value }))}
                        placeholder="Meta Description..."
                        className="p-2 rounded-lg border border-zinc-200 text-xs bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Paramètres & Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-700 uppercase">Ordre d&apos;affichage</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: parseInt(e.target.value, 10) || 0 }))}
                    className="p-2 rounded-xl border border-zinc-200 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="is_active_toggle"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 accent-[#ff4f00]"
                  />
                  <label htmlFor="is_active_toggle" className="font-bold text-zinc-800 cursor-pointer">
                    Élément Actif
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="is_indexable_toggle"
                    checked={formData.is_indexable}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_indexable: e.target.checked }))}
                    className="w-4 h-4 accent-[#ff4f00]"
                  />
                  <label htmlFor="is_indexable_toggle" className="font-bold text-zinc-800 cursor-pointer">
                    Indexable SEO
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-bold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-[#ff4f00] text-white font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {actionLoading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL CRÉATION UNIVERS DÉLIBÉRÉE                               */}
      {/* ============================================================== */}
      {showUniverseCreateModal && (
        <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 flex flex-col gap-5 text-zinc-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-zinc-950 font-outfit">
                Création délibérée d&apos;un Univers Racine
              </h3>
              <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                Les Univers (ex: <em>Art Toys, Tactile &amp; Focus, Objets &amp; Déco, Tabletop</em>) structurent la navigation de tout le site Spoolio. Créer un nouvel univers ajoute une branche majeure au méga-menu et à l&apos;arborescence globale.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-700">
              Souhaitez-vous réellement ouvrir le formulaire de création d&apos;un 5<sup>ème</sup> univers ?
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUniverseCreateModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-bold text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUniverseCreateModal(false);
                  setIsCreating(true);
                  setCreationType("universe");
                  setEditingItem(null);
                  setFormData({
                    name: "",
                    slug: "",
                    parent_id: null,
                    subtitle: "",
                    description: "",
                    seo_title: "",
                    seo_description: "",
                    sort_order: (universes.length + 1) * 10,
                    is_active: true,
                    is_indexable: true,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-[#ff4f00] text-white font-bold text-xs uppercase"
              >
                Confirmer &amp; Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
