"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  BazarItem,
  BazarScene,
  BazarZone,
} from "@/types/bazar";
import {
  NormalizedRect,
  normalizeRect,
  formatPrice,
} from "@/lib/bazar/coordinates";
import {
  Plus,
  MousePointer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Trash2,
  Check,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { RectangleHandles } from "./RectangleHandles";
import { QuickItemForm } from "./QuickItemForm";
import { ScenePreviewModal } from "./ScenePreviewModal";

interface SceneEditorProps {
  scene: BazarScene;
  zones: BazarZone[];
  items: BazarItem[];
  onBack: () => void;
  onSaveZone: (zone: Omit<BazarZone, "id">, itemData: Omit<BazarItem, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onUpdateZone: (zoneId: string, rect: NormalizedRect) => Promise<void>;
  onUpdateItem: (itemId: string, itemData: Partial<BazarItem>) => Promise<void>;
  onDeleteZone: (zoneId: string) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onUpdateSceneStatus: (status: "draft" | "published" | "archived") => Promise<void>;
}

export const SceneEditor: React.FC<SceneEditorProps> = ({
  scene,
  zones,
  items,
  onBack,
  onSaveZone,
  onUpdateZone,
  onUpdateItem,
  onDeleteZone,
  onDeleteItem,
  onUpdateSceneStatus,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"select" | "draw">("draw");
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDrawRect, setCurrentDrawRect] = useState<NormalizedRect | null>(null);
  const [editingZone, setEditingZone] = useState<BazarZone | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [scale, setScale] = useState(1);

  const itemMap = new Map(items.map((i) => [i.id, i]));

  // Drawing mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== "draw" || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setIsDrawing(true);
    setDrawStart({ x: startX, y: startY });
    setCurrentDrawRect({
      x: startX / rect.width,
      y: startY / rect.height,
      width: 0,
      height: 0,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const pixelRect = {
      x: drawStart.x,
      y: drawStart.y,
      width: currentX - drawStart.x,
      height: currentY - drawStart.y,
    };

    const norm = normalizeRect(pixelRect, rect.width, rect.height, 0.01);
    setCurrentDrawRect(norm);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentDrawRect) {
      setIsDrawing(false);
      return;
    }

    setIsDrawing(false);
    setDrawStart(null);

    // Minimum size threshold: ignore tiny accidental clicks (< 2% of area)
    if (currentDrawRect.width < 0.03 || currentDrawRect.height < 0.03) {
      setCurrentDrawRect(null);
      return;
    }

    // Create temporary zone and open form immediately
    const tempZone: BazarZone = {
      id: "temp-zone",
      sceneId: scene.id,
      itemId: "",
      x: currentDrawRect.x,
      y: currentDrawRect.y,
      width: currentDrawRect.width,
      height: currentDrawRect.height,
    };

    setEditingZone(tempZone);
    setSelectedZoneId("temp-zone");
    setCurrentDrawRect(null);
  };

  const handleSelectZone = (zone: BazarZone) => {
    setSelectedZoneId(zone.id);
    setEditingZone(zone);
    setMode("select");
  };

  const handleFormSave = async (itemData: Omit<BazarItem, "id" | "createdAt" | "updatedAt">) => {
    if (!editingZone) return;

    if (editingZone.id === "temp-zone") {
      await onSaveZone(
        {
          sceneId: scene.id,
          itemId: "",
          x: editingZone.x,
          y: editingZone.y,
          width: editingZone.width,
          height: editingZone.height,
        },
        itemData
      );
    } else {
      await onUpdateItem(editingZone.itemId, itemData);
    }

    setEditingZone(null);
    setSelectedZoneId(null);
  };

  const handleFormSaveAndNext = async (itemData: Omit<BazarItem, "id" | "createdAt" | "updatedAt">) => {
    await handleFormSave(itemData);
    // Automatically re-arm drawing mode so seller can draw the next item!
    setMode("draw");
  };

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || (editingZone?.id === "temp-zone" ? editingZone : null);
  const selectedItem = selectedZone?.itemId ? itemMap.get(selectedZone.itemId) : null;

  const containerW = containerRef.current?.clientWidth || 800;
  const containerH = containerRef.current?.clientHeight || 600;

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6]">
      {/* Top Editor Toolbar */}
      <div className="p-4 bg-white border-b border-[#E4E4E0] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-600 hover:text-black transition-colors cursor-pointer"
            title="Retour à la liste des scènes"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#121212]">{scene.title}</h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  scene.status === "published"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {scene.status === "published" ? "Publié" : "Brouillon"}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              {zones.length} {zones.length > 1 ? "zones dessinées" : "zone dessinée"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="bg-[#FAF9F6] p-1 rounded-2xl border border-[#E4E4E0] flex items-center gap-1">
            <button
              onClick={() => {
                setMode("draw");
                setSelectedZoneId(null);
                setEditingZone(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === "draw"
                  ? "bg-[#FF5500] text-white shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Dessiner un objet</span>
            </button>

            <button
              onClick={() => setMode("select")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === "select"
                  ? "bg-[#121212] text-white shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Sélectionner / Modifier</span>
            </button>
          </div>

          {/* Status toggle */}
          <button
            onClick={() =>
              onUpdateSceneStatus(scene.status === "published" ? "draft" : "published")
            }
            className="px-3 py-2 rounded-xl border border-[#E4E4E0] bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors cursor-pointer"
          >
            {scene.status === "published" ? "Passer en brouillon" : "Publier dans la démo"}
          </button>

          {/* Preview like a customer */}
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#121212] hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>Prévisualiser client</span>
          </button>
        </div>
      </div>

      {/* Editor Main Canvas Area */}
      <div className="flex-1 relative overflow-auto p-4 md:p-8 flex items-center justify-center select-none bg-neutral-900/5">
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            aspectRatio: `${scene.imageWidth} / ${scene.imageHeight}`,
            maxWidth: "100%",
            maxHeight: "80vh",
          }}
          className={`relative rounded-2xl shadow-xl overflow-hidden border border-[#E4E4E0] bg-white ${
            mode === "draw" ? "cursor-crosshair" : "cursor-default"
          }`}
        >
          {/* Main Photo Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={scene.imageUrl}
            alt={scene.title}
            className="w-full h-full object-contain pointer-events-none select-none block"
            draggable={false}
          />

          {/* Existing Saved Zones */}
          {zones.map((zone) => {
            const isSelected = selectedZoneId === zone.id;
            const item = itemMap.get(zone.itemId);

            return (
              <div
                key={zone.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectZone(zone);
                }}
                style={{
                  left: `${zone.x * 100}%`,
                  top: `${zone.y * 100}%`,
                  width: `${zone.width * 100}%`,
                  height: `${zone.height * 100}%`,
                }}
                className={`absolute rounded-lg transition-colors select-none ${
                  isSelected
                    ? "border-2 border-[#FF5500] bg-[#FF5500]/20 z-30 ring-2 ring-[#FF5500]/50"
                    : "border-2 border-white/80 hover:border-[#FF5500] bg-black/10 hover:bg-[#FF5500]/15 z-10 cursor-pointer"
                }`}
              >
                {/* Zone Label */}
                <div
                  className={`absolute -top-3.5 left-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight shadow-sm pointer-events-none whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? "bg-[#FF5500] text-white shadow-md scale-105 ring-2 ring-[#FF5500]/30"
                      : "bg-white text-[#121212] border border-[#E4E4E0]"
                  }`}
                >
                  <span className={isSelected ? "text-white" : "text-[#121212]"}>
                    {item ? item.name : "Objet"}
                  </span>
                  {item && (
                    <span className={isSelected ? "text-white/90 font-extrabold" : "text-[#FF5500] font-extrabold"}>
                      • {formatPrice(item.priceCents)}
                    </span>
                  )}
                </div>

                {/* Handles when selected */}
                {isSelected && (
                  <RectangleHandles
                    rect={zone}
                    containerWidth={containerW}
                    containerHeight={containerH}
                    onChange={(newRect) => onUpdateZone(zone.id, newRect)}
                  />
                )}
              </div>
            );
          })}

          {/* Active drawing ghost rectangle */}
          {currentDrawRect && (
            <div
              style={{
                left: `${currentDrawRect.x * 100}%`,
                top: `${currentDrawRect.y * 100}%`,
                width: `${currentDrawRect.width * 100}%`,
                height: `${currentDrawRect.height * 100}%`,
              }}
              className="absolute border-2 border-dashed border-[#FF5500] bg-[#FF5500]/20 rounded-lg pointer-events-none z-40 animate-pulse"
            />
          )}

          {/* Temp Zone before save */}
          {editingZone?.id === "temp-zone" && (
            <div
              style={{
                left: `${editingZone.x * 100}%`,
                top: `${editingZone.y * 100}%`,
                width: `${editingZone.width * 100}%`,
                height: `${editingZone.height * 100}%`,
              }}
              className="absolute border-2 border-[#FF5500] bg-[#FF5500]/25 rounded-lg z-40 ring-2 ring-[#FF5500]/40"
            >
              <div className="absolute -top-3.5 left-2 px-2.5 py-0.5 rounded-full bg-[#FF5500] text-white text-[11px] font-bold shadow-md">
                Nouveau rectangle
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawing mode guide banner */}
      <div className="p-3 bg-white border-t border-[#E4E4E0] text-center text-xs text-neutral-500">
        {mode === "draw" ? (
          <span>
            💡 <strong className="text-[#121212]">Mode Dessin actif :</strong> Cliquez et glissez sur un objet de la photo pour définir son rectangle.
          </span>
        ) : (
          <span>
            👆 <strong className="text-[#121212]">Mode Sélection :</strong> Cliquez sur un rectangle existant pour déplacer ses poignées ou modifier son prix.
          </span>
        )}
      </div>

      {/* Quick Item Form Drawer */}
      {editingZone && (
        <QuickItemForm
          scene={scene}
          zone={editingZone}
          existingItem={selectedItem}
          onSave={handleFormSave}
          onSaveAndNext={handleFormSaveAndNext}
          onDeleteZone={async () => {
            if (editingZone.id !== "temp-zone") {
              await onDeleteZone(editingZone.id);
            }
            setEditingZone(null);
            setSelectedZoneId(null);
          }}
          onDeleteItem={
            selectedItem
              ? async () => {
                  await onDeleteItem(selectedItem.id);
                  setEditingZone(null);
                  setSelectedZoneId(null);
                }
              : undefined
          }
          onClose={() => {
            setEditingZone(null);
            setSelectedZoneId(null);
          }}
        />
      )}

      {/* Preview Modal */}
      {isPreviewOpen && (
        <ScenePreviewModal
          scene={scene}
          zones={zones}
          items={items}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
};

