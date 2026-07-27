"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X, Sparkles } from "lucide-react";

export interface GalleryItem {
  id: number;
  src: string;
  title: string;
  caption?: string;
}

interface OrbitalImageWheelProps {
  items: GalleryItem[];
  title?: string;
  subtitle?: string;
}

export default function OrbitalImageWheel({
  items,
  title = "📷 Galerie des Clickers de la Communauté",
  subtitle = "Découvrez les créations sur-mesure imprimées en 3D et assemblées dans l'Atelier"
}: OrbitalImageWheelProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [selectedLightboxItem, setSelectedLightboxItem] = useState<GalleryItem | null>(null);

  const total = items.length;

  // Auto Rotation Timer
  useEffect(() => {
    if (!isAutoPlay || total <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlay, total]);

  const handlePrev = () => {
    setIsAutoPlay(false);
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setActiveIndex((prev) => (prev + 1) % total);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full py-12 px-4 select-none relative overflow-hidden">
      
      {/* Header Title */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Inspirations 3D</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* 3D Orbit Stage */}
      <div className="relative h-[360px] sm:h-[420px] max-w-5xl mx-auto flex items-center justify-center">
        
        {/* Central Glow Orb */}
        <div className="absolute w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#ff4f00]/20 via-purple-600/20 to-transparent blur-3xl pointer-events-none" />

        {/* Orbit Items */}
        {items.map((item, index) => {
          // Angle offset relative to current active index
          const offset = (index - activeIndex + total) % total;
          const normalizedOffset = offset > total / 2 ? offset - total : offset;

          // 3D Orbital Coordinates
          const angle = (normalizedOffset / total) * Math.PI * 2;
          const radiusX = typeof window !== "undefined" && window.innerWidth < 640 ? 140 : 280;
          const radiusY = typeof window !== "undefined" && window.innerWidth < 640 ? 30 : 60;

          const x = Math.sin(angle) * radiusX;
          const z = Math.cos(angle);
          const y = (1 - z) * radiusY;

          // Scale & Opacity based on Z depth
          const scale = 0.55 + (z + 1) * 0.225; // Scale from 0.55 to 1.0
          const opacity = 0.4 + (z + 1) * 0.3; // Opacity from 0.4 to 1.0
          const zIndex = Math.round((z + 1) * 50);
          const isActive = offset === 0;

          return (
            <motion.div
              key={item.id}
              onClick={() => {
                if (isActive) {
                  setSelectedLightboxItem(item);
                } else {
                  setIsAutoPlay(false);
                  setActiveIndex(index);
                }
              }}
              animate={{
                x,
                y,
                scale,
                opacity,
                zIndex,
              }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 24,
              }}
              style={{ position: "absolute" }}
              className={`cursor-pointer transition-all duration-300 group ${
                isActive ? "ring-2 ring-white/60 shadow-2xl scale-105" : "hover:opacity-100"
              }`}
            >
              {/* Photo Card Container */}
              <div className="w-48 sm:w-64 aspect-[4/3] rounded-2xl p-2 bg-neutral-900/90 border border-white/15 backdrop-blur-md shadow-2xl flex flex-col justify-between overflow-hidden relative group-hover:border-white/40">
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-black/60">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                      <div className="w-full flex items-center justify-between text-white">
                        <span className="text-xs font-bold truncate">{item.title}</span>
                        <Maximize2 className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Orbit Controls Bar */}
      <div className="flex items-center justify-center gap-4 mt-6 z-30 relative">
        <button
          type="button"
          onClick={handlePrev}
          className="p-3 rounded-full bg-neutral-900/80 border border-neutral-700 hover:border-white text-white transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-md"
          title="Précédent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Orbit Dots */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setIsAutoPlay(false);
                setActiveIndex(i);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeIndex === i ? "w-6 bg-white" : "w-2 bg-neutral-600 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-3 rounded-full bg-neutral-900/80 border border-neutral-700 hover:border-white text-white transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-md"
          title="Suivant"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Lightbox Fullscreen Modal */}
      <AnimatePresence>
        {selectedLightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedLightboxItem(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-neutral-900 rounded-3xl border border-white/20 p-4 sm:p-6 overflow-hidden shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>📷</span> {selectedLightboxItem.title}
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedLightboxItem(null)}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/80 flex items-center justify-center">
                <img
                  src={selectedLightboxItem.src}
                  alt={selectedLightboxItem.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {selectedLightboxItem.caption && (
                <p className="text-xs text-neutral-300 leading-relaxed font-mono bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  {selectedLightboxItem.caption}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
