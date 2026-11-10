"use client";

import React, { useState } from "react";
import { BazarItem, BazarZone } from "@/types/bazar";
import { formatPrice } from "@/lib/bazar/coordinates";

interface ProductHotspotProps {
  zone: BazarZone;
  item: BazarItem;
  isSelected: boolean;
  onSelect: () => void;
}

export const ProductHotspot: React.FC<ProductHotspotProps> = ({
  zone,
  item,
  isSelected,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isSold = item.status === "sold" || item.quantity <= 0;

  const left = `${zone.x * 100}%`;
  const top = `${zone.y * 100}%`;
  const width = `${zone.width * 100}%`;
  const height = `${zone.height * 100}%`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${item.name} - ${isSold ? "Vendu" : formatPrice(item.priceCents)}`}
      aria-pressed={isSelected}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        left,
        top,
        width,
        height,
      }}
      className={`absolute transition-all duration-200 cursor-pointer rounded-lg select-none outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 ${
        isSelected
          ? "border-2 border-[#FF5500] bg-[#FF5500]/25 shadow-lg z-30 ring-2 ring-[#FF5500]/50"
          : isHovered
          ? "border-2 border-[#FF5500] bg-[#FF5500]/20 z-20 shadow-md"
          : isSold
          ? "border border-dashed border-neutral-400 bg-neutral-900/10 z-10 opacity-75"
          : "border-2 border-white/70 hover:border-[#FF5500] bg-black/5 hover:bg-[#FF5500]/20 z-10 shadow-xs"
      }`}
    >
      {/* Target Pin / Price Tag Badge */}
      <div
        className={`absolute -top-3.5 left-2 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-tight shadow-md transition-all duration-200 pointer-events-none whitespace-nowrap flex items-center gap-1.5 ${
          isSold
            ? "bg-neutral-800 text-white border border-neutral-600"
            : isSelected || isHovered
            ? "bg-[#FF5500] text-white scale-105 shadow-lg"
            : "bg-white text-[#121212] border border-neutral-300 shadow-sm"
        }`}
      >
        {isSold ? (
          <span>Vendu</span>
        ) : (
          <>
            <span>{formatPrice(item.priceCents)}</span>
            {item.quantity === 1 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Pièce unique" />
            )}
          </>
        )}
      </div>

      {/* Pulsing indicator on hover / select */}
      {(isHovered || isSelected) && !isSold && (
        <span className="absolute bottom-1.5 right-1.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5500] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF5500]" />
        </span>
      )}
    </div>
  );
};
