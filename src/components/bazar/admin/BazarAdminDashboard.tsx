"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BazarDataset,
  BazarItem,
  BazarScene,
  BazarZone,
} from "@/types/bazar";
import { bazarRepository } from "@/lib/bazar/repository";
import {
  Plus,
  Camera,
  Layers,
  Copy,
  Trash2,
  Eye,
  Download,
  Upload,
  RotateCcw,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Sparkles,
  Store,
  Database,
} from "lucide-react";
import Link from "next/link";
import { ImageUploadModal } from "./ImageUploadModal";
import { SceneEditor } from "./SceneEditor";
import { QuickStockManager } from "./QuickStockManager";
import { ScenePreviewModal } from "./ScenePreviewModal";
import { BazarCartProvider } from "@/context/BazarCartContext";

const BazarAdminDashboardContent: React.FC = () => {
  const [scenes, setScenes] = useState<BazarScene[]>([]);
  const [zones, setZones] = useState<BazarZone[]>([]);
  const [items, setItems] = useState<BazarItem[]>([]);
  const [activeTab, setActiveTab] = useState<"scenes" | "quick-stock">("scenes");
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewingSceneId, setPreviewingSceneId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    const result = await bazarRepository.saveToServer();
    setIsSaving(false);
    if (result.success) {
      showNotification(result.message);
    } else {
      alert(`Erreur d'enregistrement : ${result.message}`);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = async () => {
    const sc = await bazarRepository.getScenes();
    const zn = await bazarRepository.getZones();
    const it = await bazarRepository.getItems();
    setScenes(sc);
    setZones(zn);
    setItems(it);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = bazarRepository.subscribe(loadData);
    return unsubscribe;
  }, []);

  const sceneMap = useMemo(() => {
    return new Map(scenes.map((s) => [s.id, s]));
  }, [scenes]);

  // Counts per scene
  const sceneStats = useMemo(() => {
    const stats: Record<string, { total: number; available: number }> = {};
    const itemMap = new Map(items.map((i) => [i.id, i]));

    for (const sc of scenes) {
      stats[sc.id] = { total: 0, available: 0 };
    }

    for (const z of zones) {
      if (!stats[z.sceneId]) {
        stats[z.sceneId] = { total: 0, available: 0 };
      }
      stats[z.sceneId].total += 1;
      const it = itemMap.get(z.itemId);
      if (it && it.status !== "sold" && it.quantity > 0) {
        stats[z.sceneId].available += 1;
      }
    }

    return stats;
  }, [scenes, zones, items]);

  const handleCreateScene = async (
    sceneData: Omit<BazarScene, "id" | "createdAt" | "updatedAt">
  ) => {
    const newScene = await bazarRepository.createScene(sceneData);
    setIsUploadModalOpen(false);
    setEditingSceneId(newScene.id);
    showNotification("Scène créée avec succès !");
  };

  const handleDuplicateScene = async (sceneId: string) => {
    const dup = await bazarRepository.duplicateScene(sceneId);
    showNotification(`Scène dupliquée : "${dup.title}"`);
  };

  const handleDeleteScene = async (sceneId: string) => {
    if (confirm("Supprimer cette scène photographique et ses zones ?")) {
      await bazarRepository.deleteScene(sceneId);
      showNotification("Scène supprimée.");
    }
  };

  const handleExportJSON = async () => {
    const dataset = await bazarRepository.exportDataset();
    const blob = new Blob([JSON.stringify(dataset, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spoolio-bazar-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification("Données exportées au format JSON.");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const dataset = JSON.parse(evt.target?.result as string) as BazarDataset;
        await bazarRepository.importDataset(dataset);
        await bazarRepository.saveToServer();
        showNotification("Données importées et enregistrées en base avec succès !");
      } catch (err) {
        alert("Fichier JSON invalide pour Le Bazar.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleResetDemo = async () => {
    if (
      confirm(
        "Réinitialiser toutes les scènes, objets et stocks avec les données de démonstration d'origine ?"
      )
    ) {
      await bazarRepository.resetToDemoData();
      showNotification("Données de démo réinitialisées.");
    }
  };

  // If currently editing a scene in full-canvas mode
  const currentEditingScene = editingSceneId
    ? sceneMap.get(editingSceneId)
    : null;

  if (currentEditingScene) {
    const sceneZones = zones.filter((z) => z.sceneId === currentEditingScene.id);
    return (
      <div className="h-screen flex flex-col">
        <SceneEditor
          scene={currentEditingScene}
          zones={sceneZones}
          items={items}
          onBack={() => setEditingSceneId(null)}
          onSaveZone={async (zoneData, itemData) => {
            const newItem = await bazarRepository.createItem(itemData);
            await bazarRepository.createZone({
              ...zoneData,
              itemId: newItem.id,
            });
            showNotification(`"${newItem.name}" ajouté avec succès !`);
          }}
          onUpdateZone={async (zoneId, rect) => {
            await bazarRepository.updateZone(zoneId, rect);
          }}
          onUpdateItem={async (itemId, itemData) => {
            await bazarRepository.updateItem(itemId, itemData);
            showNotification("Objet mis à jour.");
          }}
          onDeleteZone={async (zoneId) => {
            await bazarRepository.deleteZone(zoneId);
            showNotification("Zone supprimée.");
          }}
          onDeleteItem={async (itemId) => {
            await bazarRepository.deleteItem(itemId);
            showNotification("Objet supprimé.");
          }}
          onUpdateSceneStatus={async (status) => {
            await bazarRepository.updateScene(currentEditingScene.id, { status });
            showNotification(`Statut mis à jour : ${status}`);
          }}
        />
      </div>
    );
  }

  const previewScene = previewingSceneId ? sceneMap.get(previewingSceneId) : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-[#121212] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#FF5500]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E4E4E0]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500]" />
            <h1 className="text-2xl sm:text-3xl font-black text-[#121212] font-righteous">
              Éditeur Le Bazar<span className="text-[#FF5500]">.</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Vente photographique directe d&apos;objets uniques, fins de séries et prototypes d&apos;atelier.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSaveToDatabase}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSaving ? "Sauvegarde..." : "Enregistrer en base"}</span>
          </button>

          <Link
            href="/le-bazar"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-[#E4E4E0] bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-800 transition-colors shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>Voir la boutique publique</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </Link>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#FF5500] hover:bg-[#e04b00] text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Créer une scène</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 p-1 bg-white border border-[#E4E4E0] rounded-2xl shadow-xs">
          <button
            onClick={() => setActiveTab("scenes")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "scenes"
                ? "bg-[#121212] text-white shadow-xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scènes Photographiques ({scenes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("quick-stock")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "quick-stock"
                ? "bg-[#121212] text-white shadow-xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            <Store className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>Gestion Rapide Braderie ({items.length})</span>
          </button>
        </div>

        {/* Data Tools */}
        <div className="flex items-center gap-2 text-xs">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportJSON}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Restaurer une sauvegarde locale"
            className="px-3 py-1.5 rounded-xl border border-[#E4E4E0] bg-white hover:bg-neutral-50 text-neutral-600 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importer</span>
          </button>

          <button
            onClick={handleExportJSON}
            title="Télécharger une archive JSON de toutes les données du Bazar"
            className="px-3 py-1.5 rounded-xl border border-[#E4E4E0] bg-white hover:bg-neutral-50 text-neutral-600 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter</span>
          </button>

          <button
            onClick={handleResetDemo}
            title="Rétablir les scènes et objets initiaux"
            className="px-3 py-1.5 rounded-xl border border-[#E4E4E0] bg-white hover:bg-neutral-50 text-neutral-600 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>Réinitialiser démo</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "scenes" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenes.map((scene) => {
            const stats = sceneStats[scene.id] || { total: 0, available: 0 };
            const isPublished = scene.status === "published";

            return (
              <div
                key={scene.id}
                className="bg-white rounded-3xl border border-[#E4E4E0] shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={scene.imageUrl}
                    alt={scene.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />

                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${
                        isPublished
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {isPublished ? "Publié" : "Brouillon"}
                    </span>
                  </div>

                  {/* Overlay Quick Edit Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setEditingSceneId(scene.id)}
                      className="px-4 py-2 rounded-2xl bg-[#FF5500] hover:bg-[#e04b00] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Ouvrir l&apos;éditeur</span>
                    </button>

                    <button
                      onClick={() => setPreviewingSceneId(scene.id)}
                      className="p-2 rounded-2xl bg-white text-[#121212] hover:bg-neutral-100 transition-colors shadow-lg cursor-pointer"
                      title="Prévisualiser comme un client"
                    >
                      <Eye className="w-4 h-4 text-[#FF5500]" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-[#121212] line-clamp-1">
                      {scene.title}
                    </h3>
                    {scene.description && (
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                        {scene.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#E4E4E0] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                      <Layers className="w-3.5 h-3.5 text-[#FF5500]" />
                      <span>{stats.total} objets ({stats.available} dispo)</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicateScene(scene.id)}
                        className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                        title="Dupliquer la scène"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteScene(scene.id)}
                        className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Supprimer la scène"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* New Scene CTA Card */}
          <div
            onClick={() => setIsUploadModalOpen(true)}
            className="border-2 border-dashed border-[#E4E4E0] hover:border-[#FF5500] rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-white/50 hover:bg-white transition-all min-h-[280px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5500] flex items-center justify-center mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#121212]">Ajouter une photographie</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs">
              Importez une photo d&apos;ensemble de votre stand ou atelier pour commencer à dessiner vos objets.
            </p>
          </div>
        </div>
      ) : (
        <QuickStockManager
          items={items}
          onAdjustStock={async (itemId, delta) => {
            await bazarRepository.quickStockAdjustment(itemId, delta);
            showNotification("Stock ajusté.");
          }}
          onToggleSold={async (itemId) => {
            await bazarRepository.toggleItemSold(itemId);
            showNotification("Disponibilité mise à jour.");
          }}
        />
      )}

      {/* Upload Scene Modal */}
      {isUploadModalOpen && (
        <ImageUploadModal
          onCreated={handleCreateScene}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}

      {/* Customer Preview Modal */}
      {previewScene && (
        <ScenePreviewModal
          scene={previewScene}
          zones={zones.filter((z) => z.sceneId === previewScene.id)}
          items={items}
          onClose={() => setPreviewingSceneId(null)}
        />
      )}
    </div>
  );
};

export const BazarAdminDashboard: React.FC = () => {
  return (
    <BazarCartProvider>
      <BazarAdminDashboardContent />
    </BazarCartProvider>
  );
};

