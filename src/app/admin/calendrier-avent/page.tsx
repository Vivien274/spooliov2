"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Box,
  Gift,
  CheckCircle2,
  Clock,
  Euro,
  Printer,
  Edit,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Eye,
  Save,
  X,
  PackageCheck,
  Layers,
  HelpCircle,
  FileCode,
  Tag,
  RefreshCw,
} from "lucide-react";
import { useAdminTheme } from "../AdminThemeContext";
import {
  AdventData,
  AdventObjectItem,
  PackagingItem,
  ObjectProductionStatus,
  PackagingStatus,
  ObjectVisibilityStatus,
} from "@/types/avent";
import {
  getAdventDataAction,
  updateAdventObjectAction,
  savePackagingItemAction,
  deletePackagingItemAction,
  updateAdventConfigAction,
} from "@/app/actions/aventActions";

const STATUS_LABELS: Record<ObjectProductionStatus, { label: string; bg: string; text: string; icon: string }> = {
  idee: { label: "Idée 💡", bg: "bg-slate-500/10 border-slate-500/20", text: "text-slate-400", icon: "💡" },
  decide: { label: "Décidé 🎯", bg: "bg-purple-500/10 border-purple-500/20", text: "text-purple-400", icon: "🎯" },
  stl_pret: { label: "STL Prêt 📐", bg: "bg-indigo-500/10 border-indigo-500/20", text: "text-indigo-400", icon: "📐" },
  prototype: { label: "Prototype 🧪", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400", icon: "🧪" },
  impression: { label: "En Impression 🖨️", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400 animate-pulse", icon: "🖨️" },
  imprime: { label: "Imprimé 📦", bg: "bg-teal-500/10 border-teal-500/20", text: "text-teal-400", icon: "📦" },
  emballe: { label: "Emballé 🎁", bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400 font-bold", icon: "🎁" },
};

const PACKAGING_STATUS_LABELS: Record<PackagingStatus, { label: string; bg: string; text: string }> = {
  a_commander: { label: "À Commander 🛒", bg: "bg-rose-500/10 border-rose-500/20", text: "text-rose-400" },
  commande: { label: "Commandé 🚚", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
  recu: { label: "Reçu 📦", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400" },
  en_stock: { label: "En Stock ✅", bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400" },
};

export default function AdminCalendrierAventPage() {
  const { cls } = useAdminTheme();
  const [data, setData] = useState<AdventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"objects" | "packaging" | "config">("objects");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [isPending, startTransition] = useTransition();

  // Edit Object Modal State
  const [editingObject, setEditingObject] = useState<AdventObjectItem | null>(null);

  // Edit Packaging Modal State
  const [editingPackaging, setEditingPackaging] = useState<PackagingItem | null>(null);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAdventDataAction();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
          <span className={`text-sm ${cls.textMuted} font-mono`}>Chargement du Calendrier de l'Avent...</span>
        </div>
      </div>
    );
  }

  // Calculated Metrics
  const totalObjects = data.objects.length;
  const packagedCount = data.objects.filter((o) => o.status === "emballe").length;
  const printedCount = data.objects.filter((o) => ["imprime", "emballe"].includes(o.status)).length;
  const totalPrintTimeMinutes = data.objects.reduce((acc, o) => acc + (o.printTimeMinutes || 0), 0);
  const totalFilamentWeight = data.objects.reduce((acc, o) => acc + (o.weightGrams || 0), 0);
  const totalFilamentCost = data.objects.reduce((acc, o) => acc + (o.estimatedCost || 0), 0);

  const packagingCostPerCalendar = data.packaging.reduce(
    (acc, p) => acc + p.unitPrice * p.quantityNeededPerCalendar,
    0
  );
  const totalEstimatedCostPerCalendar = packagingCostPerCalendar + totalFilamentCost;

  // Handlers
  const handleQuickStatusChange = (obj: AdventObjectItem, newStatus: ObjectProductionStatus) => {
    const updated = { ...obj, status: newStatus };
    startTransition(async () => {
      const res = await updateAdventObjectAction(updated);
      setData(res);
    });
  };

  const handleSaveObject = () => {
    if (!editingObject) return;
    startTransition(async () => {
      const res = await updateAdventObjectAction(editingObject);
      setData(res);
      setEditingObject(null);
    });
  };

  const handleSavePackaging = () => {
    if (!editingPackaging) return;
    startTransition(async () => {
      const res = await savePackagingItemAction(editingPackaging);
      setData(res);
      setEditingPackaging(null);
    });
  };

  const handleDeletePackaging = (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet article de packaging ?")) return;
    startTransition(async () => {
      const res = await deletePackagingItemAction(id);
      setData(res);
    });
  };

  const filteredObjects = data.objects.filter((obj) => {
    if (statusFilter === "tous") return true;
    return obj.status === statusFilter;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎄</span>
            <h1 className={`text-2xl font-black ${cls.textMain} font-antonio uppercase tracking-wide`}>
              Gestion Calendrier de l'Avent
            </h1>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
              Local Dev Mode
            </span>
          </div>
          <p className={`text-xs ${cls.textMuted} mt-1`}>
            Préparez vos 24 créations 3D, gérez votre stock packaging et contrôlez la vue client.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/calendrier-avent"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-md"
          >
            <Eye className="w-4 h-4" />
            <span>Tester la Vue Client ↗</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Production Progress */}
        <div className={`${cls.cardBg} border border-white/10 rounded-3xl p-5 shadow-sm space-y-2`}>
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase tracking-wider font-mono">
            <span>Avancement Prod</span>
            <PackageCheck className="w-4 h-4" />
          </div>
          <div className={`text-2xl font-black ${cls.textMain} font-mono`}>
            {packagedCount} / {totalObjects}
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(packagedCount / totalObjects) * 100}%` }}
            />
          </div>
          <p className={`text-[10px] ${cls.textMuted} font-mono`}>
            {printedCount} objets imprimés sur {totalObjects} ({Math.round((printedCount / totalObjects) * 100)}%)
          </p>
        </div>

        {/* Card 2: Total Print Time */}
        <div className={`${cls.cardBg} border border-white/10 rounded-3xl p-5 shadow-sm space-y-2`}>
          <div className="flex items-center justify-between text-xs text-blue-400 font-bold uppercase tracking-wider font-mono">
            <span>Temps d'Impression</span>
            <Printer className="w-4 h-4" />
          </div>
          <div className={`text-2xl font-black ${cls.textMain} font-mono`}>
            {Math.floor(totalPrintTimeMinutes / 60)}h {totalPrintTimeMinutes % 60}m
          </div>
          <p className={`text-[10px] ${cls.textMuted} font-mono`}>
            Poids filament total : <strong className="text-white">{totalFilamentWeight}g</strong>
          </p>
        </div>

        {/* Card 3: Cost per Calendar */}
        <div className={`${cls.cardBg} border border-white/10 rounded-3xl p-5 shadow-sm space-y-2`}>
          <div className="flex items-center justify-between text-xs text-purple-400 font-bold uppercase tracking-wider font-mono">
            <span>Coût Fab / Unité</span>
            <Euro className="w-4 h-4" />
          </div>
          <div className={`text-2xl font-black ${cls.textMain} font-mono`}>
            {totalEstimatedCostPerCalendar.toFixed(2)}€
          </div>
          <p className={`text-[10px] ${cls.textMuted} font-mono`}>
            Pkg: {packagingCostPerCalendar.toFixed(2)}€ | Filament: {totalFilamentCost.toFixed(2)}€
          </p>
        </div>

        {/* Card 4: Estimated Margin */}
        <div className={`${cls.cardBg} border border-white/10 rounded-3xl p-5 shadow-sm space-y-2`}>
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase tracking-wider font-mono">
            <span>Prix Public Vente</span>
            <Tag className="w-4 h-4" />
          </div>
          <div className={`text-2xl font-black ${cls.textMain} font-mono`}>
            {data.config.estimatedPublicPrice.toFixed(2)}€
          </div>
          <p className={`text-[10px] ${cls.textMuted} font-mono`}>
            Marge brute estimée : <strong className="text-emerald-400">{(data.config.estimatedPublicPrice - totalEstimatedCostPerCalendar).toFixed(2)}€</strong>
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("objects")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "objects"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : `${cls.cardBg} ${cls.textMuted} hover:text-white border border-white/5`
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Pipeline des 24 Objets ({totalObjects})</span>
        </button>

        <button
          onClick={() => setActiveTab("packaging")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "packaging"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : `${cls.cardBg} ${cls.textMuted} hover:text-white border border-white/5`
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Packaging & Fournitures ({data.packaging.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "config"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : `${cls.cardBg} ${cls.textMuted} hover:text-white border border-white/5`
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Configuration & Tarifs</span>
        </button>
      </div>

      {/* TAB 1: OBJECTS PIPELINE */}
      {activeTab === "objects" && (
        <div className="space-y-6">
          {/* Status Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs ${cls.textMuted} font-mono mr-1`}>Filtrer par statut :</span>
              {["tous", "idee", "decide", "stl_pret", "prototype", "impression", "imprime", "emballe"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                    statusFilter === st
                      ? "bg-white text-black font-extrabold"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {st === "tous" ? "Tous (24)" : STATUS_LABELS[st as ObjectProductionStatus]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Objects List (Vertical List) */}
          <div className="flex flex-col gap-3">
            {filteredObjects.map((obj) => {
              const statusCfg = STATUS_LABELS[obj.status] || STATUS_LABELS.idee;
              return (
                <div
                  key={obj.day}
                  className={`${cls.cardBg} border border-white/10 hover:border-white/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-sm`}
                >
                  {/* Left: Day + Image + Title + Category */}
                  <div className="flex items-center gap-4 flex-1 min-w-[260px]">
                    <span className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-sm flex items-center justify-center font-mono shrink-0 shadow-inner">
                      J{obj.day}
                    </span>

                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/50 border border-white/10 relative shrink-0">
                      {obj.imageUrl ? (
                        <Image src={obj.imageUrl} alt={obj.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">🎁</div>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {obj.category}
                        </span>
                      </div>
                      <h3 className={`text-sm font-bold ${cls.textMain} leading-tight`}>
                        {obj.title}
                      </h3>
                    </div>
                  </div>

                  {/* Middle Left: Filament & Specs */}
                  <div className="hidden lg:flex flex-col justify-center min-w-[180px] text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-white/80">
                      <Printer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate max-w-[160px]" title={obj.filamentColor}>{obj.filamentColor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-white/60 font-mono">
                      <span>⏱️ {obj.printTimeMinutes}m</span>
                      <span>⚖️ {obj.weightGrams}g</span>
                      <span>💰 {obj.estimatedCost.toFixed(2)}€</span>
                    </div>
                  </div>

                  {/* Middle Right: Teaser */}
                  <div className="flex-1 min-w-[200px] hidden sm:block">
                    <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/5 text-[11px] italic text-amber-200/80 line-clamp-2">
                      "{obj.teaser}"
                    </div>
                  </div>

                  {/* Right: Status Dropdown & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl border ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      {statusCfg.label}
                    </span>

                    <select
                      value={obj.status}
                      onChange={(e) =>
                        handleQuickStatusChange(obj, e.target.value as ObjectProductionStatus)
                      }
                      className="bg-black/60 border border-white/20 text-white text-[11px] rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer font-mono"
                    >
                      <option value="idee">💡 Idée</option>
                      <option value="decide">🎯 Décidé</option>
                      <option value="stl_pret">📐 STL Prêt</option>
                      <option value="prototype">🧪 Prototype</option>
                      <option value="impression">🖨️ En Impression</option>
                      <option value="imprime">📦 Imprimé</option>
                      <option value="emballe">🎁 Emballé</option>
                    </select>

                    <button
                      onClick={() => setEditingObject(obj)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors border border-white/10"
                      title="Modifier cet objet"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PACKAGING */}
      {activeTab === "packaging" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className={`text-base font-bold ${cls.textMain} font-antonio uppercase tracking-wide`}>
              Matériel & Packaging ({data.packaging.length} références)
            </h2>

            <button
              onClick={() =>
                setEditingPackaging({
                  id: `pack-${Date.now()}`,
                  name: "",
                  category: "boite",
                  supplier: "",
                  supplierUrl: "",
                  unitPrice: 0,
                  quantityNeededPerCalendar: 1,
                  quantityInStock: 0,
                  status: "a_commander",
                })
              }
              className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all flex items-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un Article Packaging</span>
            </button>
          </div>

          <div className={`${cls.cardBg} border border-white/10 rounded-3xl overflow-hidden shadow-md`}>
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/60 font-mono uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Fournisseur</th>
                  <th className="py-3 px-4">Prix Unit.</th>
                  <th className="py-3 px-4">Qté / Cal.</th>
                  <th className="py-3 px-4">Coût / Cal.</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.packaging.map((pack) => {
                  const statusCfg = PACKAGING_STATUS_LABELS[pack.status] || PACKAGING_STATUS_LABELS.a_commander;
                  const totalCostItem = pack.unitPrice * pack.quantityNeededPerCalendar;
                  return (
                    <tr key={pack.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{pack.name}</div>
                        <div className="text-[10px] text-white/50">{pack.category}</div>
                      </td>
                      <td className="py-3.5 px-4 text-white/80">
                        {pack.supplierUrl ? (
                          <a
                            href={pack.supplierUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:text-amber-300 flex items-center gap-1"
                          >
                            <span>{pack.supplier}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          pack.supplier || "-"
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">{pack.unitPrice.toFixed(2)}€</td>
                      <td className="py-3.5 px-4 font-mono">{pack.quantityNeededPerCalendar}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                        {totalCostItem.toFixed(2)}€
                      </td>
                      <td className="py-3.5 px-4 font-mono">{pack.quantityInStock}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.text}`}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingPackaging(pack)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePackaging(pack.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* TAB 3: CONFIGURATION */}
      {activeTab === "config" && (
        <div className={`${cls.cardBg} border border-white/10 rounded-3xl p-6 space-y-6 max-w-2xl`}>
          <h2 className={`text-lg font-bold ${cls.textMain} font-antonio uppercase tracking-wide`}>
            Paramètres du Calendrier de l'Avent
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-white/70 mb-1 font-bold">Titre Public</label>
              <input
                type="text"
                value={data.config.title}
                onChange={(e) =>
                  setData({
                    ...data,
                    config: { ...data.config, title: e.target.value },
                  })
                }
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1 font-bold">Sous-titre / Description</label>
              <textarea
                rows={3}
                value={data.config.subtitle}
                onChange={(e) =>
                  setData({
                    ...data,
                    config: { ...data.config, subtitle: e.target.value },
                  })
                }
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 mb-1 font-bold">Prix Vente Estime (€)</label>
                <input
                  type="number"
                  step="0.10"
                  value={data.config.estimatedPublicPrice}
                  onChange={(e) =>
                    setData({
                      ...data,
                      config: {
                        ...data.config,
                        estimatedPublicPrice: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-bold">Date de Début</label>
                <input
                  type="date"
                  value={data.config.startDate}
                  onChange={(e) =>
                    setData({
                      ...data,
                      config: { ...data.config, startDate: e.target.value },
                    })
                  }
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Public Page Visibility Control */}
            <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <span>🌐 Visibilité de la Page Publique (/calendrier-avent)</span>
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    {data.config.isPublicActive
                      ? "✅ La page est active et accessible sur le web."
                      : "🔒 La page est privée. Tout visiteur externe est automatiquement redirigé vers l'accueil."
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      config: {
                        ...data.config,
                        isPublicActive: !data.config.isPublicActive,
                      },
                    })
                  }
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                    data.config.isPublicActive
                      ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                  }`}
                >
                  <span>{data.config.isPublicActive ? "🟢 PAGE PUBLIQUE ACTIVE" : "🔴 PAGE PRIVÉE (Redirection /)"}</span>
                </button>
              </div>
            </div>

            {/* Preorder Batches Control */}
            <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <span>⚡ Gestion des Précommandes (Offre Vagues)</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Vague 1 Early Bird */}
                <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-3 space-y-2">
                  <span className="text-emerald-400 font-bold text-xs block">Vague 1 (Early Bird - 45€)</span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">Prix :</span>
                    <input
                      type="number"
                      value={data.config.preorder?.tier1Price || 45}
                      onChange={(e) =>
                        setData({
                          ...data,
                          config: {
                            ...data.config,
                            preorder: {
                              ...(data.config.preorder || { tier1Limit: 25, tier1Sold: 0, tier2Price: 50, tier2Limit: 25, tier2Sold: 0 }),
                              tier1Price: parseFloat(e.target.value) || 45,
                            },
                          },
                        })
                      }
                      className="w-16 bg-black border border-white/20 rounded px-1.5 py-0.5 text-right font-mono text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">Vendus (Max 25) :</span>
                    <input
                      type="number"
                      value={data.config.preorder?.tier1Sold || 0}
                      onChange={(e) =>
                        setData({
                          ...data,
                          config: {
                            ...data.config,
                            preorder: {
                              ...(data.config.preorder || { tier1Price: 45, tier1Limit: 25, tier2Price: 50, tier2Limit: 25, tier2Sold: 0 }),
                              tier1Sold: parseInt(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="w-16 bg-black border border-white/20 rounded px-1.5 py-0.5 text-right font-mono text-emerald-400 font-bold"
                    />
                  </div>
                </div>

                {/* Vague 2 Standard */}
                <div className="bg-black/40 border border-purple-500/30 rounded-xl p-3 space-y-2">
                  <span className="text-purple-400 font-bold text-xs block">Vague 2 (Standard - 50€)</span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">Prix :</span>
                    <input
                      type="number"
                      value={data.config.preorder?.tier2Price || 50}
                      onChange={(e) =>
                        setData({
                          ...data,
                          config: {
                            ...data.config,
                            preorder: {
                              ...(data.config.preorder || { tier1Price: 45, tier1Limit: 25, tier1Sold: 0, tier2Limit: 25, tier2Sold: 0 }),
                              tier2Price: parseFloat(e.target.value) || 50,
                            },
                          },
                        })
                      }
                      className="w-16 bg-black border border-white/20 rounded px-1.5 py-0.5 text-right font-mono text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">Vendus (Max 25) :</span>
                    <input
                      type="number"
                      value={data.config.preorder?.tier2Sold || 0}
                      onChange={(e) =>
                        setData({
                          ...data,
                          config: {
                            ...data.config,
                            preorder: {
                              ...(data.config.preorder || { tier1Price: 45, tier1Limit: 25, tier1Sold: 0, tier2Price: 50, tier2Limit: 25 }),
                              tier2Sold: parseInt(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="w-16 bg-black border border-white/20 rounded px-1.5 py-0.5 text-right font-mono text-purple-400 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                startTransition(async () => {
                  const res = await updateAdventConfigAction(data.config);
                  setData(res);
                  alert("Configuration et précommandes sauvegardées !");
                })
              }
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-2 transition-all shadow"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer la Configuration & Précommandes</span>
            </button>
          </div>
        </div>
      )}

      {/* EDIT OBJECT MODAL */}
      {editingObject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`${cls.cardBg} border border-white/20 rounded-3xl p-6 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto relative shadow-2xl`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                <span>🎁 Éditer le Jour {editingObject.day}</span>
              </h3>
              <button
                onClick={() => setEditingObject(null)}
                className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 mb-1 font-bold">Titre de l'Objet</label>
                <input
                  type="text"
                  value={editingObject.title}
                  onChange={(e) => setEditingObject({ ...editingObject, title: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Catégorie</label>
                  <input
                    type="text"
                    value={editingObject.category}
                    onChange={(e) => setEditingObject({ ...editingObject, category: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-bold">Statut Fabrication</label>
                  <select
                    value={editingObject.status}
                    onChange={(e) =>
                      setEditingObject({
                        ...editingObject,
                        status: e.target.value as ObjectProductionStatus,
                      })
                    }
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="idee">💡 Idée</option>
                    <option value="decide">🎯 Décidé</option>
                    <option value="stl_pret">📐 STL Prêt</option>
                    <option value="prototype">🧪 Prototype</option>
                    <option value="impression">🖨️ En Impression</option>
                    <option value="imprime">📦 Imprimé</option>
                    <option value="emballe">🎁 Emballé</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Temps (min)</label>
                  <input
                    type="number"
                    value={editingObject.printTimeMinutes}
                    onChange={(e) =>
                      setEditingObject({
                        ...editingObject,
                        printTimeMinutes: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-bold">Poids (g)</label>
                  <input
                    type="number"
                    value={editingObject.weightGrams}
                    onChange={(e) =>
                      setEditingObject({
                        ...editingObject,
                        weightGrams: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-bold">Coût Est. (€)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={editingObject.estimatedCost}
                    onChange={(e) =>
                      setEditingObject({
                        ...editingObject,
                        estimatedCost: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-bold">Couleur & Type Filament</label>
                <input
                  type="text"
                  value={editingObject.filamentColor}
                  onChange={(e) => setEditingObject({ ...editingObject, filamentColor: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-amber-300 mb-1 font-bold">Indice / Teaser Avant Ouverture</label>
                <input
                  type="text"
                  value={editingObject.teaser}
                  onChange={(e) => setEditingObject({ ...editingObject, teaser: e.target.value })}
                  className="w-full bg-black/60 border border-amber-500/30 rounded-xl px-3 py-2 text-amber-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-bold">Description Détaillée</label>
                <textarea
                  rows={3}
                  value={editingObject.description}
                  onChange={(e) => setEditingObject({ ...editingObject, description: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-amber-300 mb-1 font-bold">Photo de l'Objet (Uploader ou URL)</label>
                <div className="flex items-center gap-3">
                  {editingObject.imageUrl && (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden relative border border-amber-500/40 shrink-0 bg-black/60">
                      <Image src={editingObject.imageUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const base64 = event.target?.result as string;
                            setEditingObject({ ...editingObject, imageUrl: base64 });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-xs text-white/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Ou URL directe (ex: /images/produit.jpg)"
                      value={editingObject.imageUrl}
                      onChange={(e) => setEditingObject({ ...editingObject, imageUrl: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingObject(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 font-bold"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveObject}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PACKAGING MODAL */}
      {editingPackaging && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${cls.cardBg} border border-white/20 rounded-3xl p-6 max-w-lg w-full space-y-4 relative shadow-2xl`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                <span>📦 Article Packaging</span>
              </h3>
              <button
                onClick={() => setEditingPackaging(null)}
                className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 mb-1 font-bold">Nom de l'article</label>
                <input
                  type="text"
                  value={editingPackaging.name}
                  onChange={(e) =>
                    setEditingPackaging({ ...editingPackaging, name: e.target.value })
                  }
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Fournisseur</label>
                  <input
                    type="text"
                    value={editingPackaging.supplier}
                    onChange={(e) =>
                      setEditingPackaging({ ...editingPackaging, supplier: e.target.value })
                    }
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-bold">Statut Stock</label>
                  <select
                    value={editingPackaging.status}
                    onChange={(e) =>
                      setEditingPackaging({
                        ...editingPackaging,
                        status: e.target.value as PackagingStatus,
                      })
                    }
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="a_commander">🛒 À Commander</option>
                    <option value="commande">🚚 Commandé</option>
                    <option value="recu">📦 Reçu</option>
                    <option value="en_stock">✅ En Stock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Prix Unit. (€)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={editingPackaging.unitPrice}
                    onChange={(e) =>
                      setEditingPackaging({
                        ...editingPackaging,
                        unitPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-bold">Qté / Cal.</label>
                  <input
                    type="number"
                    value={editingPackaging.quantityNeededPerCalendar}
                    onChange={(e) =>
                      setEditingPackaging({
                        ...editingPackaging,
                        quantityNeededPerCalendar: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-bold">Stock dispo</label>
                  <input
                    type="number"
                    value={editingPackaging.quantityInStock}
                    onChange={(e) =>
                      setEditingPackaging({
                        ...editingPackaging,
                        quantityInStock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-bold">URL Fournisseur</label>
                <input
                  type="text"
                  value={editingPackaging.supplierUrl || ""}
                  onChange={(e) =>
                    setEditingPackaging({ ...editingPackaging, supplierUrl: e.target.value })
                  }
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingPackaging(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 font-bold"
              >
                Annuler
              </button>
              <button
                onClick={handleSavePackaging}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
