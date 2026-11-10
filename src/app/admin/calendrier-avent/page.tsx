"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Gift,
  Printer,
  Edit,
  Eye,
  Save,
  X,
  PackageCheck,
  Sparkles,
  RefreshCw,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ShoppingBag,
  Globe,
} from "lucide-react";
import { useAdminTheme } from "../AdminThemeContext";
import {
  AdventData,
  AdventObjectItem,
  ObjectProductionStatus,
  ObjectVisibilityStatus,
} from "@/types/avent";
import {
  getAdventDataAction,
  updateAdventObjectAction,
  reorderAdventObjectsAction,
  updateAdventConfigAction,
} from "@/app/actions/aventActions";

const STATUS_LABELS: Record<
  ObjectProductionStatus,
  { label: string; bg: string; text: string; icon: string }
> = {
  idee: {
    label: "Idée 💡",
    bg: "bg-slate-100 border-slate-300",
    text: "text-slate-800",
    icon: "💡",
  },
  decide: {
    label: "Décidé 🎯",
    bg: "bg-purple-50 border-purple-200",
    text: "text-purple-800",
    icon: "🎯",
  },
  stl_pret: {
    label: "STL Prêt 📐",
    bg: "bg-indigo-50 border-indigo-200",
    text: "text-indigo-800",
    icon: "📐",
  },
  prototype: {
    label: "Prototype 🧪",
    bg: "bg-amber-50 border-amber-300",
    text: "text-amber-900",
    icon: "🧪",
  },
  impression: {
    label: "En Impression 🖨️",
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-800 font-semibold",
    icon: "🖨️",
  },
  imprime: {
    label: "Imprimé 📦",
    bg: "bg-teal-50 border-teal-200",
    text: "text-teal-800",
    icon: "📦",
  },
  emballe: {
    label: "Emballé 🎁",
    bg: "bg-emerald-50 border-emerald-300",
    text: "text-emerald-800 font-bold",
    icon: "🎁",
  },
};

export default function AdminCalendrierAventPage() {
  const { cls } = useAdminTheme();
  const [data, setData] = useState<AdventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"objects" | "config">("objects");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [isPending, startTransition] = useTransition();

  // Edit Object Modal State
  const [editingObject, setEditingObject] = useState<AdventObjectItem | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // Drag and drop state for objects
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const resData = await res.json();
      if (res.ok && resData?.url) {
        setEditingObject((prev) => (prev ? { ...prev, imageUrl: resData.url } : null));
      } else {
        alert("⚠️ Échec du téléversement : " + (resData?.error || "Veuillez réessayer"));
      }
    } catch (err: any) {
      alert("⚠️ Erreur lors du téléversement : " + (err?.message || "Erreur réseau"));
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#FF5500] animate-spin" />
          <span className="text-sm text-neutral-600 font-mono">
            Chargement du Calendrier de l'Avent...
          </span>
        </div>
      </div>
    );
  }

  // Calculated Metrics
  const totalObjects = data.objects.length;
  const packagedCount = data.objects.filter((o) => o.status === "emballe").length;
  const printedCount = data.objects.filter((o) => ["imprime", "emballe"].includes(o.status)).length;
  const readyStlCount = data.objects.filter((o) =>
    ["stl_pret", "prototype", "impression", "imprime", "emballe"].includes(o.status)
  ).length;

  const handleQuickStatusChange = (obj: AdventObjectItem, newStatus: ObjectProductionStatus) => {
    const updated = { ...obj, status: newStatus };
    startTransition(async () => {
      try {
        const res = await updateAdventObjectAction(updated);
        setData(res);
      } catch (err: any) {
        console.error("Quick status error:", err);
        alert("Erreur lors de la mise à jour : " + (err?.message || "Erreur serveur"));
      }
    });
  };

  const handleSaveObject = () => {
    if (!editingObject) return;
    startTransition(async () => {
      try {
        const res = await updateAdventObjectAction(editingObject);
        setData(res);
        setEditingObject(null);
      } catch (err: any) {
        console.error("Save object error:", err);
        alert("Erreur lors de la sauvegarde : " + (err?.message || "Erreur serveur"));
      }
    });
  };

  // Drag and drop handlers for objects
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (statusFilter !== "tous") return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (statusFilter !== "tous") return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    if (statusFilter !== "tous") return;
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const sourceIndex = draggedIndex;
    const newObjects = [...data.objects];
    const [movedItem] = newObjects.splice(sourceIndex, 1);
    newObjects.splice(targetIndex, 0, movedItem);

    const reordered = newObjects.map((item, idx) => ({
      ...item,
      day: idx + 1,
    }));

    setData({ ...data, objects: reordered });
    setDraggedIndex(null);
    setDragOverIndex(null);

    startTransition(async () => {
      try {
        const res = await reorderAdventObjectsAction(reordered);
        setData(res);
      } catch (err: any) {
        console.error("Reorder error:", err);
        alert("Erreur lors de la réorganisation : " + (err?.message || "Erreur serveur"));
      }
    });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.objects.length) return;

    const newObjects = [...data.objects];
    const [movedItem] = newObjects.splice(index, 1);
    newObjects.splice(targetIndex, 0, movedItem);

    const reordered = newObjects.map((item, idx) => ({
      ...item,
      day: idx + 1,
    }));

    setData({ ...data, objects: reordered });
    startTransition(async () => {
      try {
        const res = await reorderAdventObjectsAction(reordered);
        setData(res);
      } catch (err: any) {
        console.error("Reorder error:", err);
        alert("Erreur lors du déplacement : " + (err?.message || "Erreur serveur"));
      }
    });
  };

  const filteredObjects = data.objects.filter((obj) => {
    if (statusFilter === "tous") return true;
    return obj.status === statusFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E0] pb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-2xl">🎄</span>
            <h1 className="text-2xl font-black text-[#121212] font-antonio uppercase tracking-wide">
              Gestion Calendrier de l'Avent
            </h1>
            <span className="bg-orange-50 text-[#FF5500] border border-orange-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
              Local Dev Mode
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            Gérez vos {totalObjects} créations, l'ordre des jours et les indices visibles par les clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/calendrier-avent?dev=true"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-50 text-[#121212] border border-[#E4E4E0] text-xs font-bold transition-all shadow-xs"
          >
            <Eye className="w-4 h-4 text-[#FF5500]" />
            <span>Tester la Vue Client ↗</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards (Synthèse sans coûts/logistique) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Production Progress */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold uppercase tracking-wider font-mono">
            <span>Avancement Objets</span>
            <PackageCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#121212] font-mono">
            {printedCount} / {totalObjects}
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden border border-[#E4E4E0]">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(printedCount / Math.max(1, totalObjects)) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-neutral-500 font-mono">
            {packagedCount} emballés • {readyStlCount} STL prêts
          </p>
        </div>

        {/* Card 2: Preorders */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#FF5500] font-bold uppercase tracking-wider font-mono">
            <span>Précommandes</span>
            <ShoppingBag className="w-4 h-4 text-[#FF5500]" />
          </div>
          <div className="text-2xl font-black text-[#121212] font-mono">
            {data.config.preorder?.totalSold ?? 0} / {data.config.preorder?.totalLimit || 50}
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden border border-[#E4E4E0]">
            <div
              className="bg-[#FF5500] h-2 rounded-full transition-all duration-500"
              style={{
                width: `${
                  ((data.config.preorder?.totalSold ?? 0) /
                    Math.max(1, data.config.preorder?.totalLimit || 50)) *
                  100
                }%`,
              }}
            />
          </div>
          <p className="text-[11px] text-neutral-500 font-mono">
            Tarif standard : {data.config.preorder?.tier2Price || 50} €
          </p>
        </div>

        {/* Card 3: Public Page Status */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-700 font-bold uppercase tracking-wider font-mono">
            <span>Visibilité Publique</span>
            <Globe className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-xl font-bold flex items-center gap-2">
            {data.config.isPublicActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Page en ligne
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-300">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                Page privée
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 font-mono">
            Route : /calendrier-avent
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E4E0] pb-3">
        <button
          onClick={() => setActiveTab("objects")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "objects"
              ? "bg-[#121212] text-white shadow-xs"
              : "bg-white text-neutral-600 hover:text-[#121212] border border-[#E4E4E0]"
          }`}
        >
          <Gift className="w-4 h-4 text-[#FF5500]" />
          <span>Pipeline des Objets ({totalObjects})</span>
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "config"
              ? "bg-[#121212] text-white shadow-xs"
              : "bg-white text-neutral-600 hover:text-[#121212] border border-[#E4E4E0]"
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#FF5500]" />
          <span>Configuration & Précommandes</span>
        </button>
      </div>

      {/* TAB 1: OBJECTS PIPELINE */}
      {activeTab === "objects" && (
        <div className="space-y-4">
          {/* Status Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-neutral-600 font-semibold mr-1">Filtrer par statut :</span>
              {["tous", "idee", "decide", "stl_pret", "prototype", "impression", "imprime", "emballe"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-[#121212] text-white shadow-xs"
                      : "bg-white text-neutral-700 border border-[#E4E4E0] hover:bg-neutral-50"
                  }`}
                >
                  {st === "tous" ? `Tous (${totalObjects})` : STATUS_LABELS[st as ObjectProductionStatus]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Hint Banner */}
          <div className="flex items-center justify-between text-xs text-orange-950 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-[#FF5500] shrink-0" />
              <span>
                {statusFilter === "tous"
                  ? "Glissez-déposez les cartes (poignée ⋮⋮) ou utilisez les boutons ▲ / ▼ pour réorganiser l'ordre des jours."
                  : `Filtre actif : sélectionnez "Tous (${totalObjects})" pour réorganiser les jours en glissé-déposé.`}
              </span>
            </div>
            {isPending && (
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-[#FF5500] font-bold shrink-0">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Enregistrement...
              </span>
            )}
          </div>

          {/* Objects List */}
          <div className="flex flex-col gap-2.5">
            {filteredObjects.map((obj) => {
              const realIndex = data.objects.findIndex((o) => o.day === obj.day);
              const statusCfg = STATUS_LABELS[obj.status] || STATUS_LABELS.idee;
              const isBeingDragged = draggedIndex === realIndex;
              const isDragTarget = dragOverIndex === realIndex;

              return (
                <div
                  key={obj.day}
                  draggable={statusFilter === "tous"}
                  onDragStart={(e) => handleDragStart(e, realIndex)}
                  onDragOver={(e) => handleDragOver(e, realIndex)}
                  onDrop={(e) => handleDrop(e, realIndex)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white border ${
                    isDragTarget
                      ? "border-[#FF5500] ring-2 ring-[#FF5500]/20 shadow-md bg-orange-50/30"
                      : isBeingDragged
                      ? "opacity-40 border-dashed border-[#FF5500] scale-[0.99]"
                      : "border-[#E4E4E0] hover:border-neutral-300"
                  } rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xs`}
                >
                  {/* Left: Drag Handle + Day Badge + Image + Title + Category */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-[260px]">
                    {statusFilter === "tous" && (
                      <div className="flex items-center gap-0.5 shrink-0 select-none">
                        <div
                          className="p-1 text-neutral-400 hover:text-neutral-700 cursor-grab active:cursor-grabbing rounded-lg hover:bg-neutral-100 transition-colors"
                          title="Glisser pour réorganiser"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col -space-y-0.5">
                          <button
                            type="button"
                            disabled={realIndex === 0}
                            onClick={() => handleMoveStep(realIndex, "up")}
                            className="p-0.5 text-neutral-400 hover:text-[#FF5500] disabled:opacity-20 disabled:hover:text-neutral-400 transition-colors cursor-pointer"
                            title="Monter d'un cran"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={realIndex === data.objects.length - 1}
                            onClick={() => handleMoveStep(realIndex, "down")}
                            className="p-0.5 text-neutral-400 hover:text-[#FF5500] disabled:opacity-20 disabled:hover:text-neutral-400 transition-colors cursor-pointer"
                            title="Descendre d'un cran"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    <span className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF5500] font-black text-sm flex items-center justify-center font-mono shrink-0 shadow-2xs">
                      J{obj.day}
                    </span>

                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 border border-[#E4E4E0] relative shrink-0 flex items-center justify-center">
                      {obj.imageUrl ? (
                        <Image src={obj.imageUrl} alt={obj.title} fill className="object-cover" />
                      ) : (
                        <div className="text-xl">🎁</div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-700 font-bold bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                          {obj.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#121212] leading-tight">
                        {obj.title}
                      </h3>
                    </div>
                  </div>

                  {/* Middle Left: Filament Color */}
                  {obj.filamentColor ? (
                    <div className="hidden lg:flex items-center gap-1.5 min-w-[160px] text-xs text-neutral-600 font-mono">
                      <Printer className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                      <span className="truncate max-w-[160px]" title={obj.filamentColor}>
                        {obj.filamentColor}
                      </span>
                    </div>
                  ) : null}

                  {/* Middle Right: Teaser */}
                  <div className="flex-1 min-w-[200px] hidden sm:block">
                    <div className="bg-[#FAF9F6] px-3 py-1.5 rounded-xl border border-[#E4E4E0] text-[11px] italic text-neutral-600 line-clamp-2">
                      "{obj.teaser}"
                    </div>
                  </div>

                  {/* Right: Status Dropdown & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E4E4E0]">
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
                      className="bg-white border border-[#E4E4E0] text-[#121212] text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#FF5500] cursor-pointer font-medium"
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
                      className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-[#121212] transition-colors border border-[#E4E4E0] cursor-pointer"
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

      {/* TAB 2: CONFIGURATION */}
      {activeTab === "config" && (
        <div className="bg-white border border-[#E4E4E0] rounded-3xl p-6 space-y-6 max-w-2xl shadow-xs">
          <h2 className="text-lg font-bold text-[#121212] font-antonio uppercase tracking-wide">
            Paramètres du Calendrier & Précommandes
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-700 mb-1 font-bold">Titre Public</label>
              <input
                type="text"
                value={data.config.title}
                onChange={(e) =>
                  setData({
                    ...data,
                    config: { ...data.config, title: e.target.value },
                  })
                }
                className="w-full bg-[#FAF9F6] border border-[#E4E4E0] rounded-xl px-3 py-2 text-[#121212] focus:outline-none focus:border-[#FF5500] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-neutral-700 mb-1 font-bold">Sous-titre / Description</label>
              <textarea
                rows={3}
                value={data.config.subtitle}
                onChange={(e) =>
                  setData({
                    ...data,
                    config: { ...data.config, subtitle: e.target.value },
                  })
                }
                className="w-full bg-[#FAF9F6] border border-[#E4E4E0] rounded-xl px-3 py-2 text-[#121212] focus:outline-none focus:border-[#FF5500] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-700 mb-1 font-bold">Date de Début</label>
                <input
                  type="date"
                  value={data.config.startDate}
                  onChange={(e) =>
                    setData({
                      ...data,
                      config: { ...data.config, startDate: e.target.value },
                    })
                  }
                  className="w-full bg-[#FAF9F6] border border-[#E4E4E0] rounded-xl px-3 py-2 text-[#121212] font-mono focus:outline-none focus:border-[#FF5500] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-neutral-700 mb-1 font-bold">Date de Fin</label>
                <input
                  type="date"
                  value={data.config.endDate}
                  onChange={(e) =>
                    setData({
                      ...data,
                      config: { ...data.config, endDate: e.target.value },
                    })
                  }
                  className="w-full bg-[#FAF9F6] border border-[#E4E4E0] rounded-xl px-3 py-2 text-[#121212] font-mono focus:outline-none focus:border-[#FF5500] focus:bg-white"
                />
              </div>
            </div>

            {/* Public Page Visibility Control */}
            <div className="bg-[#FAF9F6] border border-[#E4E4E0] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#121212] flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#FF5500]" />
                    <span>Visibilité de la Page Publique (/calendrier-avent)</span>
                  </h3>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {data.config.isPublicActive
                      ? "La page est active et accessible aux visiteurs."
                      : "La page est privée. Les visiteurs sont automatiquement redirigés vers l'accueil."}
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
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                  }`}
                >
                  <span>{data.config.isPublicActive ? "🟢 PAGE PUBLIQUE ACTIVE" : "🔴 PAGE PRIVÉE (Redirection /)"}</span>
                </button>
              </div>
            </div>

            {/* Preorder Batches Control */}
            <div className="bg-[#FAF9F6] border border-[#E4E4E0] rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-[#121212] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#FF5500]" />
                <span>Conditions des Précommandes ({data.config.preorder?.totalLimit || 50} Exemplaires)</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-[#E4E4E0] rounded-xl p-3 space-y-1">
                  <span className="text-emerald-800 font-bold text-[11px] block">Prix Remisé (€)</span>
                  <input
                    type="number"
                    value={data.config.preorder?.tier1Price || 45}
                    onChange={(e) =>
                      setData({
                        ...data,
                        config: {
                          ...data.config,
                          preorder: {
                            ...(data.config.preorder || { tier2Price: 50, totalLimit: 50, totalSold: 0 }),
                            tier1Price: parseFloat(e.target.value) || 45,
                          },
                        },
                      })
                    }
                    className="w-full bg-[#FAF9F6] border border-[#E4E4E0] rounded px-2 py-1 text-right font-mono text-[#121212] text-xs font-bold"
                  />
                </div>

                <div className="bg-white border border-[#E4E4E0] rounded-xl p-3 space-y-1">
                  <span className="text-neutral-700 font-bold text-[11px] block">Prix Normal (€)</span>
                  <input
                    type="number"
                    value={data.config.preorder?.tier2Price || 50}
                    onChange={(e) =>
                      setData({
                        ...data,
                        config: {
                          ...data.config,
                          preorder: {
                            ...(data.config.preorder || { tier1Price: 45, totalLimit: 50, totalSold: 0 }),
                            tier2Price: parseFloat(e.target.value) || 50,
                          },
                        },
                      })
                    }
                    className="w-full bg-[#FAF9F6] border border-[#E4E4E0] rounded px-2 py-1 text-right font-mono text-[#121212] text-xs font-bold"
                  />
                </div>

                <div className="bg-white border border-[#E4E4E0] rounded-xl p-3 space-y-1">
                  <span className="text-neutral-700 font-bold text-[11px] block">Capacité Totale</span>
                  <input
                    type="number"
                    value={data.config.preorder?.totalLimit || 50}
                    onChange={(e) =>
                      setData({
                        ...data,
                        config: {
                          ...data.config,
                          preorder: {
                            ...(data.config.preorder || { tier1Price: 45, tier2Price: 50, totalSold: 0 }),
                            totalLimit: parseInt(e.target.value) || 50,
                          },
                        },
                      })
                    }
                    className="w-full bg-[#FAF9F6] border border-[#E4E4E0] rounded px-2 py-1 text-right font-mono text-[#121212] text-xs font-bold"
                  />
                </div>

                <div className="bg-white border border-orange-200 rounded-xl p-3 space-y-1">
                  <span className="text-[#FF5500] font-bold text-[11px] block">Réservés</span>
                  <input
                    type="number"
                    value={data.config.preorder?.totalSold ?? 0}
                    onChange={(e) =>
                      setData({
                        ...data,
                        config: {
                          ...data.config,
                          preorder: {
                            ...(data.config.preorder || { tier1Price: 45, tier2Price: 50, totalLimit: 50 }),
                            totalSold: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                    className="w-full bg-[#FAF9F6] border border-orange-300 rounded px-2 py-1 text-right font-mono text-[#FF5500] font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                startTransition(async () => {
                  try {
                    const res = await updateAdventConfigAction(data.config);
                    setData(res);
                    alert("Configuration sauvegardée !");
                  } catch (err: any) {
                    console.error("Config save error:", err);
                    alert("Erreur lors de la sauvegarde : " + (err?.message || "Erreur serveur"));
                  }
                })
              }
              className="px-6 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#e04b00] text-white font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer la Configuration</span>
            </button>
          </div>
        </div>
      )}

      {/* EDIT OBJECT MODAL */}
      {editingObject && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E4E4E0] rounded-3xl p-6 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E4E4E0] pb-3">
              <h3 className="text-base font-bold text-[#121212] flex items-center gap-2 font-mono">
                <span>🎁 Éditer le Jour {editingObject.day}</span>
              </h3>
              <button
                onClick={() => setEditingObject(null)}
                className="p-1 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 mb-1 font-bold">Titre de l'Objet</label>
                <input
                  type="text"
                  value={editingObject.title}
                  onChange={(e) => setEditingObject({ ...editingObject, title: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-[#E4E4E0] rounded-xl px-3 py-2 text-[#121212] focus:outline-none focus:border-[#FF5500] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 mb-1 font-bold">Catégorie</label>
                  <input
                    type="text"
                    value={editingObject.category}
                    onChange={(e) => setEditingObject({ ...editingObject, category: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-[#E4E4E0] rounded-xl px-3 py-2 text-[#121212] focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 mb-1 font-bold">Statut Fabrication</label>
                  <select
                    value={editingObject.status}
                    onChange={(e) =>
                      setEditingObject({
                        ...editingObject,
                        status: e.target.value as ObjectProductionStatus,
                      })
                    }
                    className="w-full bg-[#FAF9F6] border border-[#E4E4E0] rounded-xl px-3 py-2 text-[#121212] focus:outline-none focus:border-[#FF5500] focus:bg-white font-medium"
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

              <div>
                <label className="block text-neutral-700 mb-1 font-bold">Couleur & Type Filament</label>
                <input
                  type="text"
                  value={editingObject.filamentColor}
                  onChange={(e) => setEditingObject({ ...editingObject, filamentColor: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-[#E4E4E0] rounded-xl px-3 py-2 text-[#121212] focus:outline-none focus:border-[#FF5500] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-orange-950 mb-1 font-bold">Indice / Teaser Avant Ouverture</label>
                <input
                  type="text"
                  value={editingObject.teaser}
                  onChange={(e) => setEditingObject({ ...editingObject, teaser: e.target.value })}
                  className="w-full bg-orange-50/60 border border-orange-200 rounded-xl px-3 py-2 text-[#121212] focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div>
                <label className="block text-neutral-700 mb-1 font-bold">Description Détaillée</label>
                <textarea
                  rows={3}
                  value={editingObject.description}
                  onChange={(e) => setEditingObject({ ...editingObject, description: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-[#E4E4E0] rounded-xl px-3 py-2 text-[#121212] focus:outline-none focus:border-[#FF5500] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-neutral-700 mb-1 font-bold">Photo de l'Objet (Uploader ou URL)</label>
                <div className="flex items-center gap-3">
                  {editingObject.imageUrl && (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden relative border border-[#E4E4E0] shrink-0 bg-neutral-100">
                      <Image src={editingObject.imageUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                      className="block w-full text-xs text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-[#FF5500] hover:file:bg-orange-100 cursor-pointer disabled:opacity-50"
                    />
                    {isUploadingImage && (
                      <div className="flex items-center gap-2 text-xs text-[#FF5500] font-mono">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Téléversement vers le serveur en cours...</span>
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Ou URL directe (ex: /images/produit.jpg)"
                      value={editingObject.imageUrl}
                      onChange={(e) => setEditingObject({ ...editingObject, imageUrl: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-[#E4E4E0] rounded-xl px-3 py-1.5 text-[#121212] font-mono text-[11px] focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E4E4E0] flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingObject(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveObject}
                disabled={isUploadingImage || isPending}
                className="px-5 py-2 rounded-xl bg-[#FF5500] hover:bg-[#e04b00] disabled:opacity-50 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isPending ? "Enregistrement..." : "Enregistrer"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
