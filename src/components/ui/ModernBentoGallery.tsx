"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, Sparkles, Camera } from "lucide-react";

export interface GalleryItem {
  id: number;
  src: string;
  title: string;
  caption?: string;
}

interface ModernBentoGalleryProps {
  items: GalleryItem[];
  title?: string;
  subtitle?: string;
}

export default function ModernBentoGallery({
  items,
  title = "Inspirations & Créations Client",
  subtitle = "Découvrez quelques-uns des clickers sur-mesure confectionnés dans notre Atelier"
}: ModernBentoGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full py-12 px-4 select-none">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 max-w-6xl mx-auto border-b border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff4f00]/10 border border-[#ff4f00]/20 text-[#ff4f00] text-xs font-bold uppercase tracking-wider mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>Galerie Photo</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed mt-1">
            {subtitle}
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl shrink-0">
          {items.length} {items.length > 1 ? "modèles exposés" : "modèle exposé"}
        </div>
      </div>

      {/* Modern Bento Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, idx) => {
          // Highlight first card as larger featured item if more than 3 items
          const isFeatured = idx === 0 && items.length >= 3;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => setSelectedItem(item)}
              className={`group relative rounded-3xl bg-neutral-900/80 border border-white/10 hover:border-[#ff4f00]/50 overflow-hidden cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-[#ff4f00]/10 ${
                isFeatured ? "sm:col-span-2 sm:row-span-2 min-h-[340px]" : "min-h-[220px]"
              }`}
            >
              {/* Image with zoom effect on hover */}
              <div className="absolute inset-0 bg-neutral-950">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
              </div>

              {/* Top Badge Tag */}
              <div className="absolute top-3 left-3 z-10">
                <span className="text-[10px] font-extrabold bg-black/60 backdrop-blur-md text-white border border-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Exemple #{idx + 1}
                </span>
              </div>

              {/* Bottom Details Bar */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10 flex items-end justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-bold text-white leading-snug group-hover:text-[#ff4f00] transition-colors">
                    {item.title}
                  </h4>
                  {item.caption && (
                    <p className="text-xs text-neutral-300 line-clamp-1 font-medium opacity-90">
                      {item.caption}
                    </p>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-white/10 group-hover:bg-[#ff4f00] text-white transition-all transform group-hover:scale-110 shrink-0 backdrop-blur-md">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="relative max-w-4xl w-full bg-neutral-900 rounded-3xl border border-white/20 p-4 sm:p-6 overflow-hidden shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#ff4f00]/20 text-[#ff4f00]">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h4 className="text-base font-bold text-white">
                    {selectedItem.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/90 flex items-center justify-center">
                <img
                  src={selectedItem.src}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {selectedItem.caption && (
                <div className="text-xs text-neutral-300 leading-relaxed font-medium bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-start gap-2">
                  <span className="text-[#ff4f00] font-bold">ℹ️</span>
                  <span>{selectedItem.caption}</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
