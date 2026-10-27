"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  Tag,
  Layers,
  Search,
  X,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import type { CatalogTaxonomyItem, SaveProductTaxonomyPayload } from "@/types/taxonomy";

interface ProductTaxonomyV2CardProps {
  productId: number | string;
  isNew: boolean;
  productStatus?: string;
  cls: {
    cardBg: string;
    border: string;
    textMain: string;
    textMuted: string;
    inputBg: string;
  };
  onTaxonomyChange?: (payload: SaveProductTaxonomyPayload) => void;
}

export default function ProductTaxonomyV2Card({
  productId,
  isNew,
  productStatus = "publish",
  cls,
  onTaxonomyChange,
}: ProductTaxonomyV2CardProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    success: boolean;
    message: string;
    dryRun?: boolean;
    simulatedRows?: any[];
  } | null>(null);

  const [taxonomies, setTaxonomies] = useState<CatalogTaxonomyItem[]>([]);
  const [universeId, setUniverseId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [collectionIds, setCollectionIds] = useState<number[]>([]);
  const [tagIds, setTagIds] = useState<number[]>([]);

  const [tagSearch, setTagSearch] = useState("");
  const [showPayloadDetails, setShowPayloadDetails] = useState(false);

  // Charger la liste des taxonomies et le mapping du produit
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Récupérer toutes les taxonomies
      const taxRes = await fetch("/api/admin/taxonomy");
      const taxData = await taxRes.json();
      const allItems: CatalogTaxonomyItem[] = taxData.items || [];
      setTaxonomies(allItems);

      // 2. Si produit existant, récupérer son mapping
      if (!isNew && productId && productId !== "new") {
        const numId = typeof productId === "string" ? parseInt(productId, 10) : productId;
        if (!isNaN(numId)) {
          const mapRes = await fetch(`/api/admin/taxonomy/product/${numId}`);
          if (mapRes.ok) {
            const mapData = await mapRes.json();
            if (mapData.mapping) {
              setUniverseId(mapData.mapping.universeId);
              setCategoryId(mapData.mapping.categoryId);
              setCollectionIds(mapData.mapping.collectionIds || []);
              setTagIds(mapData.mapping.tagIds || []);
            }
          }
        }
      }
    } catch (err) {
      console.error("Erreur chargement taxonomie V2.1:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [productId, isNew]);

  // Informer le parent en cas de changement
  useEffect(() => {
    if (onTaxonomyChange) {
      onTaxonomyChange({
        universeId,
        categoryId,
        collectionIds,
        tagIds,
      });
    }
  }, [universeId, categoryId, collectionIds, tagIds, onTaxonomyChange]);

  // Séparation par type
  const universes = useMemo(
    () => taxonomies.filter((t) => t.type === "universe" && t.is_active),
    [taxonomies]
  );

  const availableCategories = useMemo(() => {
    if (!universeId) return [];
    return taxonomies.filter(
      (t) => t.type === "category" && t.parent_id === universeId && t.is_active
    );
  }, [taxonomies, universeId]);

  const collections = useMemo(
    () => taxonomies.filter((t) => t.type === "collection" && t.is_active),
    [taxonomies]
  );

  const allTags = useMemo(
    () => taxonomies.filter((t) => t.type === "tag"),
    [taxonomies]
  );

  // Recherche dans les tags
  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return [];
    const query = tagSearch.toLowerCase();
    return allTags
      .filter((t) => !tagIds.includes(t.id) && t.name.toLowerCase().includes(query))
      .slice(0, 15);
  }, [allTags, tagSearch, tagIds]);

  // Objets sélectionnés
  const selectedUniverse = useMemo(
    () => universes.find((u) => u.id === universeId),
    [universes, universeId]
  );
  const selectedCategory = useMemo(
    () => taxonomies.find((c) => c.id === categoryId),
    [taxonomies, categoryId]
  );
  const selectedCollections = useMemo(
    () => collections.filter((c) => collectionIds.includes(c.id)),
    [collections, collectionIds]
  );
  const selectedTags = useMemo(
    () => allTags.filter((t) => tagIds.includes(t.id)),
    [allTags, tagIds]
  );

  // Cohérence de la catégorie avec l'univers
  const isCategoryConsistent = useMemo(() => {
    if (!categoryId || !universeId) return true;
    return selectedCategory ? selectedCategory.parent_id === universeId : false;
  }, [categoryId, universeId, selectedCategory]);

  // Changement d'univers : réinitialise la catégorie si incompatible
  const handleUniverseChange = (newUnivId: number | null) => {
    setUniverseId(newUnivId);
    if (newUnivId && categoryId) {
      const currentCat = taxonomies.find((t) => t.id === categoryId);
      if (currentCat && currentCat.parent_id !== newUnivId) {
        setCategoryId(null);
      }
    }
  };

  const toggleCollection = (id: number) => {
    setCollectionIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const addTag = (id: number) => {
    if (!tagIds.includes(id)) {
      setTagIds((prev) => [...prev, id]);
    }
    setTagSearch("");
  };

  const removeTag = (id: number) => {
    setTagIds((prev) => prev.filter((tId) => tId !== id));
  };

  // Validation
  const hasUniverse = universeId !== null;
  const hasCategory = categoryId !== null;
  const isValid = hasUniverse && hasCategory && isCategoryConsistent;

  // Sauvegarde
  const handleSaveTaxonomy = async () => {
    const numId = typeof productId === "string" ? parseInt(productId, 10) : productId;
    if (isNaN(numId)) {
      alert("Enregistrez d'abord le produit pour générer son identifiant avant de lier sa taxonomie.");
      return;
    }

    setSaving(true);
    setSaveFeedback(null);

    try {
      const res = await fetch(`/api/admin/taxonomy/product/${numId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universeId,
          categoryId,
          collectionIds,
          tagIds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveFeedback({
          success: true,
          message: data.message,
          dryRun: data.dryRun,
          simulatedRows: data.simulatedRows,
        });
      } else {
        setSaveFeedback({
          success: false,
          message: data.error || "Erreur de sauvegarde",
        });
      }
    } catch (err: any) {
      setSaveFeedback({
        success: false,
        message: `Erreur réseau : ${err.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 transition-colors`}>
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-[#ff4f00] animate-spin" />
          <span className={`text-xs ${cls.textMuted} font-bold uppercase tracking-wider`}>
            Chargement de la taxonomie V2.1...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 flex flex-col gap-6 transition-colors shadow-xs`}>
      {/* HEADER SECTION */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${cls.border}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ff4f00]/10 flex items-center justify-center text-[#ff4f00] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-bold ${cls.textMain} uppercase tracking-widest font-antonio`}>
                Catalogue V2.1
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#ff4f00]/15 text-[#ff4f00] border border-[#ff4f00]/30">
                Spoolio Architecture
              </span>
            </div>
            <p className={`text-xs ${cls.textMuted} mt-0.5`}>
              Univers, Catégorie principale, Collections et Tags pour la boutique contemporaine.
            </p>
          </div>
        </div>

        {/* Badge Mode de Sauvegarde */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mode Local Sécurisé (Dry Run)</span>
          </span>
        </div>
      </div>

      {/* RAPPEL COMPATIBILITÉ V1 */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Indépendance des taxonomies :</span> Les sélections V2.1 ci-dessous alimentent exclusivement les nouvelles pages boutique. L&apos;ancienne catégorie historique (champ &quot;Catégorie&quot; ci-dessus) est conservée intacte pour assurer la rétrocompatibilité des commandes et de WooCommerce.
        </div>
      </div>

      {/* BLOC ÉTAT DE VALIDATION */}
      {isValid ? (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Catalogue V2.1 Validé pour la Boutique</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-xs font-medium">
            <div className="p-2 rounded-xl bg-white/70 border border-emerald-200/80">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">✓ Univers</span>
              <span className="font-bold text-zinc-900">{selectedUniverse?.name}</span>
            </div>
            <div className="p-2 rounded-xl bg-white/70 border border-emerald-200/80">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">✓ Catégorie</span>
              <span className="font-bold text-zinc-900">{selectedCategory?.name}</span>
            </div>
            <div className="p-2 rounded-xl bg-white/70 border border-emerald-200/80">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">✓ Collection(s)</span>
              <span className="font-bold text-zinc-900 truncate block">
                {selectedCollections.length > 0
                  ? selectedCollections.map((c) => c.name).join(", ")
                  : "Aucune"}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/70 border border-emerald-200/80">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">✓ Tags ({selectedTags.length})</span>
              <span className="font-bold text-zinc-900 truncate block">
                {selectedTags.length > 0
                  ? selectedTags.map((t) => t.name).join(", ")
                  : "Aucun"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-950 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-red-700 uppercase tracking-wider font-mono">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Configuration V2.1 Incomplète pour la boutique</span>
          </div>
          <ul className="space-y-1 pl-6 list-disc text-zinc-700 mt-1">
            {!hasUniverse && (
              <li><strong className="text-red-700">Aucun univers défini :</strong> Choisissez un des 4 univers Spoolio V2.1.</li>
            )}
            {!hasCategory && (
              <li><strong className="text-red-700">Aucune catégorie principale définie :</strong> Une catégorie est requise pour le filtrage boutique.</li>
            )}
            {!isCategoryConsistent && (
              <li><strong className="text-red-700">Incohérence :</strong> La catégorie sélectionnée n&apos;appartient pas à l&apos;univers choisi.</li>
            )}
          </ul>
          <p className="text-[11px] text-zinc-500 italic mt-1">
            Note : Si ce produit est archivé ou hors-catalogue, vous pouvez ignorer cet avertissement.
          </p>
        </div>
      )}

      {/* CHAMPS DE FORMULAIRE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. UNIVERS */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className={`text-xs font-semibold ${cls.textMuted} uppercase tracking-wider flex items-center gap-1.5`}>
              <FolderTree className="w-3.5 h-3.5 text-[#ff4f00]" />
              <span>Univers V2.1</span>
              <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-zinc-400 font-mono">1 seul autorisé</span>
          </div>
          <select
            value={universeId ?? ""}
            onChange={(e) =>
              handleUniverseChange(e.target.value ? parseInt(e.target.value, 10) : null)
            }
            className={`${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-sm ${cls.textMain} focus:outline-none focus:border-[#ff4f00] transition-colors cursor-pointer`}
          >
            <option value="">— Sélectionner un Univers —</option>
            {universes.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Structure le parcours visiteur sur la boutique (Art Toys, Tactile &amp; Focus, Objets &amp; Déco, Tabletop).
          </p>
        </div>

        {/* 2. CATÉGORIE PRINCIPALE */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className={`text-xs font-semibold ${cls.textMuted} uppercase tracking-wider flex items-center gap-1.5`}>
              <Layers className="w-3.5 h-3.5 text-[#ff4f00]" />
              <span>Catégorie Principale</span>
              <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-zinc-400 font-mono">is_primary = true</span>
          </div>
          <select
            value={categoryId ?? ""}
            disabled={!universeId}
            onChange={(e) =>
              setCategoryId(e.target.value ? parseInt(e.target.value, 10) : null)
            }
            className={`${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-sm ${cls.textMain} focus:outline-none focus:border-[#ff4f00] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">
              {universeId
                ? "— Sélectionner une Catégorie Principale —"
                : "— Choisissez d'abord un Univers —"}
            </option>
            {availableCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Filtrée automatiquement selon l&apos;univers parent choisi. Une seule catégorie principale par produit.
          </p>
        </div>
      </div>

      {/* 3. COLLECTIONS */}
      <div className="flex flex-col gap-2.5 pt-2 border-t border-zinc-100">
        <div className="flex items-center justify-between">
          <label className={`text-xs font-semibold ${cls.textMuted} uppercase tracking-wider flex items-center gap-1.5`}>
            <Sparkles className="w-3.5 h-3.5 text-[#ff4f00]" />
            <span>Collections Thématiques &amp; Capsules</span>
          </label>
          <span className="text-[10px] text-zinc-400 font-mono">Facultatif • 0 à N</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {collections.map((col) => {
            const isSelected = collectionIds.includes(col.id);
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => toggleCollection(col.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#ff4f00] text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200/80"
                }`}
              >
                <span>{col.name}</span>
                {isSelected && <X className="w-3 h-3 opacity-80" />}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-zinc-400">
          Permet d&apos;inclure ce produit dans une ou plusieurs séries artistiques (Tactile Lab, Cabinet noir, Gadgetoids...).
        </p>
      </div>

      {/* 4. TAGS */}
      <div className="flex flex-col gap-3 pt-2 border-t border-zinc-100">
        <div className="flex items-center justify-between">
          <label className={`text-xs font-semibold ${cls.textMuted} uppercase tracking-wider flex items-center gap-1.5`}>
            <Tag className="w-3.5 h-3.5 text-[#ff4f00]" />
            <span>Tags V2.1</span>
          </label>
          <span className="text-[10px] text-zinc-400 font-mono">{tagIds.length} sélectionné(s)</span>
        </div>

        {/* Selected tags badges */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
            {selectedTags.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-zinc-800 border border-zinc-200 shadow-2xs"
              >
                <span>{t.name}</span>
                <button
                  type="button"
                  onClick={() => removeTag(t.id)}
                  className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Retirer ce tag"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tag search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            placeholder="Rechercher un tag existant (ex: Click, Magnétique, Articulé, Porte-clé...)"
            className={`${cls.inputBg} border ${cls.border} rounded-xl pl-9 pr-4 py-2.5 text-xs ${cls.textMain} placeholder-zinc-400 focus:outline-none focus:border-[#ff4f00] transition-colors w-full`}
          />
        </div>

        {/* Suggestions dropdown */}
        {tagSearch.trim() && (
          <div className="p-2 rounded-xl bg-white border border-zinc-200 shadow-lg flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {filteredTags.length > 0 ? (
              filteredTags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => addTag(t.id)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-zinc-100 hover:bg-[#ff4f00] hover:text-white text-zinc-800 transition-colors cursor-pointer"
                >
                  + {t.name}
                </button>
              ))
            ) : (
              <span className="text-xs text-zinc-400 p-2">
                Aucun tag existant ne correspond à &quot;{tagSearch}&quot;.
              </span>
            )}
          </div>
        )}
      </div>

      {/* FEEDBACK DE SAUVEGARDE */}
      {saveFeedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex flex-col gap-1 ${
            saveFeedback.success
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {saveFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{saveFeedback.message}</span>
          </div>

          {saveFeedback.dryRun && saveFeedback.simulatedRows && (
            <div className="mt-1 pt-1 border-t border-emerald-200/60">
              <button
                type="button"
                onClick={() => setShowPayloadDetails(!showPayloadDetails)}
                className="text-[11px] font-mono text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Détail des {saveFeedback.simulatedRows.length} relations simulées</span>
                {showPayloadDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showPayloadDetails && (
                <pre className="mt-2 p-2 rounded-lg bg-emerald-950 text-emerald-200 text-[10px] font-mono overflow-x-auto">
                  {JSON.stringify(saveFeedback.simulatedRows, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* ACTION BAR */}
      <div className={`pt-4 border-t ${cls.border} flex flex-col sm:flex-row items-center justify-between gap-3`}>
        <div className="text-[11px] text-zinc-500 font-mono">
          Table cible : <span className="text-zinc-900 font-semibold">public.product_taxonomy</span>
        </div>

        <button
          type="button"
          onClick={handleSaveTaxonomy}
          disabled={saving}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-[#ff4f00] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
        >
          {saving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Simulation en cours...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enregistrer la Taxonomie V2.1</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
