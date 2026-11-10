"use client";

import React, { useRef, useState, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Hand } from "lucide-react";
import { BazarItem, BazarScene, BazarZone } from "@/types/bazar";
import { findBestMatchingZone } from "@/lib/bazar/coordinates";
import { ProductHotspot } from "./ProductHotspot";

interface InteractivePhotoProps {
  scene: BazarScene;
  zones: BazarZone[];
  items: BazarItem[];
  selectedItemId: string | null;
  onSelectItem: (item: BazarItem, zone: BazarZone) => void;
}

export const InteractivePhoto: React.FC<InteractivePhotoProps> = ({
  scene,
  zones,
  items,
  selectedItemId,
  onSelectItem,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const itemMap = new Map(items.map((i) => [i.id, i]));

  // Reset zoom on scene change
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [scene.id]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.35, 3.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.35, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse pan handlers when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || scale <= 1 || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Direct click on photo container to resolve overlapping hotspots
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate normalized point clicked
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    const matchedZone = findBestMatchingZone(clickX, clickY, zones);
    if (matchedZone) {
      const item = itemMap.get(matchedZone.itemId);
      if (item) {
        onSelectItem(item, matchedZone);
      }
    }
  };

  return (
    <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-neutral-900 border border-[#E4E4E0] shadow-sm select-none">
      {/* Zoom / Navigation Controls Toolbar */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-1 p-1 rounded-2xl bg-white border border-[#E4E4E0] shadow-lg">
        <button
          onClick={handleZoomIn}
          title="Zoomer (+)"
          aria-label="Zoomer"
          className="p-2 rounded-xl text-neutral-800 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4 text-[#121212]" />
        </button>

        <button
          onClick={handleZoomOut}
          disabled={scale <= 1}
          title="Dézoomer (-)"
          aria-label="Dézoomer"
          className="p-2 rounded-xl text-neutral-800 hover:text-black hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4 text-[#121212]" />
        </button>

        {scale > 1 && (
          <button
            onClick={handleResetZoom}
            title="Réinitialiser le zoom"
            aria-label="Réinitialiser le zoom"
            className="p-2 rounded-xl text-neutral-800 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#FF5500]" />
          </button>
        )}
      </div>

      {/* Touch Pan Hint when zoomed */}
      {scale > 1 && (
        <div className="absolute top-4 left-4 z-40 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 pointer-events-none shadow-md">
          <Hand className="w-3.5 h-3.5 text-[#FF5500]" />
          <span>Glissez pour vous déplacer dans la photo</span>
        </div>
      )}

      {/* Main Viewport Container */}
      <div
        className="w-full relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={containerRef}
          onClick={handleContainerClick}
          style={{
            aspectRatio: `${scene.imageWidth} / ${scene.imageHeight}`,
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
          className="relative w-full max-h-[75vh] object-contain flex items-center justify-center"
        >
          {/* Main Photo Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={scene.imageUrl}
            alt={scene.title}
            className="w-full h-full object-contain pointer-events-none select-none block"
            draggable={false}
          />

          {/* Zones Overlay */}
          <div className="absolute inset-0 pointer-events-auto">
            {zones.map((zone) => {
              const item = itemMap.get(zone.itemId);
              if (!item) return null;

              return (
                <ProductHotspot
                  key={zone.id}
                  zone={zone}
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => onSelectItem(item, zone)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
