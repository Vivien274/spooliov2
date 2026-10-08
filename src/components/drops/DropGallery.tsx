"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { DropTheme, DropGalleryItem } from "@/lib/drops";
import { Camera, Maximize2, X, ChevronLeft, ChevronRight, ChevronDown, Sparkles } from "lucide-react";

interface DropGalleryProps {
  items: DropGalleryItem[];
  theme?: DropTheme;
  title?: string;
  subtitle?: string;
  badge?: string;
}

export default function DropGallery({
  items,
  theme,
  title = "L'Atelier en Détails",
  subtitle = "Clichés authentiques, textures brutes et finitions peintes à la main sous la lumière de l'atelier.",
  badge = "Galerie d'Atelier",
}: DropGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const INITIAL_LIMIT = 8;
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const dAccent = theme?.accentColor || "#ff4f00";
  const dText = theme?.textColor || "#ffffff";
  const dSubtitle = theme?.subtitleColor || "#d8b4fe";
  const dBorder = theme?.borderColor || "rgba(255, 255, 255, 0.15)";
  const dCardBg = theme?.cardBgColor || "rgba(255, 255, 255, 0.05)";
  const dBadgeBg = theme?.badgeBgColor || "rgba(255, 79, 0, 0.2)";
  const dBadgeText = theme?.badgeTextColor || dAccent;
  const dTitleFont = theme?.titleFont || "var(--font-antonio)";

  // Discover distinct categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach((item) => {
      if (item.category && item.category.trim() !== "") {
        cats.add(item.category.trim());
      }
    });
    return Array.from(cats);
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  // Visible items in the grid (limited to INITIAL_LIMIT unless expanded)
  const visibleItems = useMemo(() => {
    if (isExpanded) return filteredItems;
    return filteredItems.slice(0, INITIAL_LIMIT);
  }, [filteredItems, isExpanded]);

  // Lightbox navigation
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const showNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev + 1) % filteredItems.length;
    });
  }, [filteredItems.length]);

  const showPrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev - 1 + filteredItems.length) % filteredItems.length;
    });
  }, [filteredItems.length]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, closeLightbox, showNext, showPrev]);

  if (!items || items.length === 0) return null;

  const currentItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <section
      id="galerie-drop"
      className="w-full max-w-[1240px] px-4 sm:px-8 py-12 sm:py-16 relative z-10 scroll-mt-20 space-y-8"
    >
      {/* Section Header */}
      <div
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b"
        style={{ borderColor: dBorder }}
      >
        <div className="space-y-2">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
            style={{ backgroundColor: dBadgeBg, color: dBadgeText }}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{badge} • {items.length} Clichés</span>
          </div>

          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight"
            style={{ fontFamily: dTitleFont, color: dText }}
          >
            {title}
          </h2>

          <p className="text-xs sm:text-sm max-w-2xl font-medium" style={{ color: dSubtitle }}>
            {subtitle}
          </p>
        </div>

        {/* Category Filter Pills (if categories exist) */}
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 self-start md:self-end">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "shadow-lg scale-105"
                  : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
              }`}
              style={
                selectedCategory === "all"
                  ? { backgroundColor: dAccent, color: "#ffffff" }
                  : {}
              }
            >
              Tous ({items.length})
            </button>

            {categories.map((cat) => {
              const count = items.filter((i) => i.category === cat).length;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                    isActive
                      ? "shadow-lg scale-105"
                      : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: dAccent, color: "#ffffff" }
                      : {}
                  }
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Gallery Grid: Épuré & Équilibré */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {visibleItems.map((item, idx) => {
          const actualIndex = filteredItems.findIndex((fi) => fi.src === item.src);
          const photoIndex = actualIndex >= 0 ? actualIndex : idx;
          return (
            <button
              key={`${item.src}-${idx}`}
              type="button"
              onClick={() => openLightbox(photoIndex)}
              className="group relative aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#ff4f00]"
              style={{
                backgroundColor: dCardBg,
                borderColor: dBorder,
              }}
              aria-label={`Agrandir la photo ${photoIndex + 1}: ${item.caption || item.alt || "Vue d'atelier"}`}
            >
            {/* Image */}
            <Image
              src={item.src}
              alt={item.alt || item.caption || `Cliché atelier ${idx + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
            />

            {/* Subtle Gradient Scrim on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Top Right Expand Pill (appears on hover) */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 pointer-events-none">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-lg">
                <Maximize2 className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Bottom Caption & Category (appears on hover) */}
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
              {item.category && (
                <span
                  className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 text-white shadow-xs"
                  style={{ backgroundColor: dAccent }}
                >
                  {item.category}
                </span>
              )}
              {item.caption && (
                <p className="text-xs font-semibold text-white line-clamp-2 leading-snug drop-shadow-md">
                  {item.caption}
                </p>
              )}
            </div>
          </button>
        );
      })}
      </div>

      {/* Bouton "Charger la suite" pour afficher la grille complète */}
      {!isExpanded && filteredItems.length > INITIAL_LIMIT && (
        <div className="flex justify-center pt-2 sm:pt-4">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-xl border border-white/20 text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xl group"
            style={{
              backgroundColor: dCardBg,
              borderColor: dBorder,
              color: dText,
            }}
          >
            <span>Charger la suite (+{filteredItems.length - INITIAL_LIMIT} photos)</span>
            <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
      )}

      {isExpanded && filteredItems.length > INITIAL_LIMIT && (
        <div className="flex justify-center pt-2 sm:pt-4">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <span>Afficher moins</span>
            <ChevronDown className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
      )}

      {/* Lightbox Fullscreen Modal */}
      {lightboxIndex !== null && currentItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visionneuse de galerie photo"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/92 backdrop-blur-xl p-3 sm:p-6 select-none animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Top Bar Controls */}
          <div
            className="w-full max-w-5xl mx-auto flex items-center justify-between z-20 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photo Counter & Badge */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white font-mono text-xs font-bold">
                {lightboxIndex + 1} / {filteredItems.length}
              </span>
              {currentItem.category && (
                <span
                  className="hidden sm:inline-block px-2.5 py-1 rounded-full text-white font-mono text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: dAccent }}
                >
                  {currentItem.category}
                </span>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeLightbox}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Fermer la galerie (Échap)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Stage: Main Photo & Nav Arrows */}
          <div
            className="relative flex-1 w-full max-w-5xl mx-auto flex items-center justify-center my-3 sm:my-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Arrow */}
            {filteredItems.length > 1 && (
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-2 sm:left-4 z-30 p-2.5 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-2xl"
                aria-label="Photo précédente"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Active Image Container */}
            <div className="relative w-full h-[60vh] sm:h-[68vh] md:h-[72vh] flex items-center justify-center">
              <Image
                src={currentItem.src}
                alt={currentItem.alt || currentItem.caption || "Vue grand format"}
                fill
                priority
                className="object-contain drop-shadow-2xl rounded-xl sm:rounded-2xl"
                sizes="(max-width: 1280px) 100vw, 1200px"
              />
            </div>

            {/* Next Arrow */}
            {filteredItems.length > 1 && (
              <button
                type="button"
                onClick={showNext}
                className="absolute right-2 sm:right-4 z-30 p-2.5 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-2xl"
                aria-label="Photo suivante"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>

          {/* Bottom Bar: Caption & Thumbnails Strip */}
          <div
            className="w-full max-w-4xl mx-auto space-y-3 z-20 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Caption */}
            {currentItem.caption && (
              <p className="text-center text-xs sm:text-sm text-white/90 font-medium px-4 max-w-2xl mx-auto drop-shadow-sm">
                {currentItem.caption}
              </p>
            )}

            {/* Thumbnails row */}
            {filteredItems.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 px-2 no-scrollbar max-w-full">
                {filteredItems.map((item, thumbIdx) => {
                  const isActive = thumbIdx === lightboxIndex;
                  return (
                    <button
                      key={`thumb-${thumbIdx}`}
                      type="button"
                      onClick={() => setLightboxIndex(thumbIdx)}
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 transition-all cursor-pointer ${
                        isActive
                          ? "ring-2 ring-white scale-110 opacity-100 shadow-xl"
                          : "opacity-45 hover:opacity-85 border border-white/10"
                      }`}
                      style={isActive ? { borderColor: dAccent, boxShadow: `0 0 0 2px ${dAccent}` } : {}}
                      aria-label={`Aller à la photo ${thumbIdx + 1}`}
                    >
                      <Image
                        src={item.src}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
