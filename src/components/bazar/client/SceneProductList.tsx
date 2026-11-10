"use client";

import React, { useRef, useEffect } from "react";
import { BazarItem, BazarScene, BazarZone } from "@/types/bazar";
import { formatPrice, getConditionBadgeStyle, getConditionLabel } from "@/lib/bazar/coordinates";
import { ProductCrop } from "./ProductCrop";
import { ChevronRight, Layers, Sparkles } from "lucide-react";

interface SceneProductListProps {
  scene: BazarScene;
  zones: BazarZone[];
  items: BazarItem[];
  selectedItemId: string | null;
  onSelectItem: (item: BazarItem, zone?: BazarZone) => void;
}

export const SceneProductList: React.FC<SceneProductListProps> = ({
  scene,
  zones,
  items,
  selectedItemId,
  onSelectItem,
}) => {
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Build map of itemId to its first zone in this scene
  const itemZoneMap = new Map<string, BazarZone>();
  zones.forEach((z) => {
    if (!itemZoneMap.has(z.itemId)) {
      itemZoneMap.set(z.itemId, z);
    }
  });

  // Scroll active item into view inside list when selected via photo
  useEffect(() => {
    if (selectedItemId) {
      const el = itemRefs.current.get(selectedItemId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedItemId]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl md:rounded-3xl border border-[#E4E4E0] shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#E4E4E0] bg-[#FAF9F6] flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-[#FF5500] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Objets de la scène</span>
          </div>
          <h3 className="text-sm font-semibold text-[#121212] mt-0.5 line-clamp-1">
            {scene.title}
          </h3>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-white border border-[#E4E4E0] text-xs font-bold text-neutral-700 shadow-xs">
          {items.length} {items.length > 1 ? "pièces" : "pièce"}
        </span>
      </div>

      {/* Items Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E4E4E0] max-h-[500px] md:max-h-[600px] p-2 space-y-1">
        {items.map((item) => {
          const isSelected = selectedItemId === item.id;
          const isSold = item.status === "sold" || item.quantity <= 0;
          const zone = itemZoneMap.get(item.id);
          const badge = getConditionBadgeStyle(item.condition);

          return (
            <div
              key={item.id}
              ref={(el) => {
                if (el) itemRefs.current.set(item.id, el);
                else itemRefs.current.delete(item.id);
              }}
              role="button"
              tabIndex={0}
              onClick={() => onSelectItem(item, zone)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectItem(item, zone);
                }
              }}
              className={`group flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                isSelected
                  ? "bg-orange-50/80 border-2 border-[#FF5500] shadow-sm"
                  : isSold
                  ? "hover:bg-neutral-50 opacity-60 border border-transparent"
                  : "hover:bg-neutral-50 border border-transparent"
              }`}
            >
              {/* Thumbnail with auto-crop */}
              <ProductCrop
                imageUrl={scene.imageUrl}
                zone={zone}
                alt={item.name}
                className="w-14 h-14 rounded-xl border border-[#E4E4E0] shrink-0"
                paddingRatio={0.12}
              />

              {/* Information */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {getConditionLabel(item.condition)}
                  </span>

                  {isSold && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-neutral-200 text-neutral-600">
                      Vendu
                    </span>
                  )}
                </div>

                <div className="text-xs sm:text-sm font-bold text-[#121212] truncate mt-1 group-hover:text-[#FF5500] transition-colors">
                  {item.name}
                </div>

                <div className="flex items-center justify-between mt-1 text-xs text-neutral-500">
                  <span className="font-extrabold text-[#FF5500] text-sm">
                    {formatPrice(item.priceCents)}
                  </span>
                  <span>
                    {isSold ? "Épuisé" : `${item.quantity} en stock`}
                  </span>
                </div>
              </div>

              {/* Arrow Indicator */}
              <ChevronRight
                className={`w-4 h-4 text-neutral-400 transition-transform group-hover:translate-x-0.5 ${
                  isSelected ? "text-[#FF5500] translate-x-0.5" : ""
                }`}
              />
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="p-8 text-center text-neutral-400 text-xs">
            Aucun objet associé à cette scène pour l&apos;instant.
          </div>
        )}
      </div>
    </div>
  );
};

