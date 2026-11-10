"use client";

import React, { useState } from "react";
import { X, Eye, Sparkles } from "lucide-react";
import { BazarItem, BazarScene, BazarZone } from "@/types/bazar";
import { InteractivePhoto } from "../client/InteractivePhoto";
import { SceneProductList } from "../client/SceneProductList";
import { ProductQuickView } from "../client/ProductQuickView";

interface ScenePreviewModalProps {
  scene: BazarScene;
  zones: BazarZone[];
  items: BazarItem[];
  onClose: () => void;
}

export const ScenePreviewModal: React.FC<ScenePreviewModalProps> = ({
  scene,
  zones,
  items,
  onClose,
}) => {
  const [selectedItem, setSelectedItem] = useState<BazarItem | null>(null);
  const [selectedZone, setSelectedZone] = useState<BazarZone | undefined>(undefined);

  const handleSelectItem = (item: BazarItem, zone?: BazarZone) => {
    setSelectedItem(item);
    setSelectedZone(zone || zones.find((z) => z.itemId === item.id));
  };

  const sceneItems = items.filter((it) =>
    zones.some((z) => z.itemId === it.id)
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-labelledby="preview-modal-title"
        aria-modal="true"
        className="bg-[#FAF9F6] rounded-3xl border border-[#E4E4E0] shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Top bar */}
        <div className="px-6 py-4 bg-white border-b border-[#E4E4E0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 text-[#FF5500]">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h2 id="preview-modal-title" className="text-base font-extrabold text-[#121212]">
                Prévisualisation client : {scene.title}
              </h2>
              <p className="text-xs text-neutral-500">
                Voici exactement ce que vos visiteurs verront et expérimenteront sur /le-bazar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <InteractivePhoto
                scene={scene}
                zones={zones}
                items={items}
                selectedItemId={selectedItem?.id || null}
                onSelectItem={handleSelectItem}
              />
            </div>

            <div className="lg:col-span-4">
              <SceneProductList
                scene={scene}
                zones={zones}
                items={sceneItems}
                selectedItemId={selectedItem?.id || null}
                onSelectItem={handleSelectItem}
              />
            </div>
          </div>
        </div>

        {/* Floating Quick View */}
        <ProductQuickView
          item={selectedItem}
          zone={selectedZone}
          scene={scene}
          onClose={() => setSelectedItem(null)}
        />
      </div>
    </div>
  );
};

