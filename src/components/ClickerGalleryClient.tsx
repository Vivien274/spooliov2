"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export interface GalleryItem {
  id: number;
  src: string;
  title: string;
  caption: string;
}

export default function ClickerGalleryClient({ initialItems = [] }: { initialItems?: GalleryItem[] }) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetch("/api/admin/clicker-gallery")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch((e) => console.error("Error fetching clicker gallery:", e));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="w-full max-w-[1200px] mt-16 pt-12 border-t border-neutral-800 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full">
          📷 GALERIE CRÉATIONS CLIENTS
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white font-[family-name:var(--font-antonio)]">
          Exemples de Clickers Fabriqués en Atelier 🛠️
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400">
          Inspirez-vous des combinaisons de couleurs, formes et motifs gravés réalisés sur-mesure pour notre communauté.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="group relative bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-neutral-700 hover:scale-[1.02] flex flex-col justify-between"
          >
            {/* Image Container */}
            <div className="relative aspect-4/3 w-full bg-neutral-950 overflow-hidden">
              <img
                src={item.src}
                alt="Création Clicker Spoolio 3D"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
              
              <span className="absolute bottom-2.5 right-2.5 text-[11px] font-bold text-white bg-black/70 backdrop-blur border border-white/10 px-2.5 py-1 rounded-xl opacity-80 group-hover:opacity-100 transition-all group-hover:scale-105">
                🔍 Agrandir
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-lg font-bold bg-black/60 w-8 h-8 rounded-full flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Image */}
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-black">
              <img
                src={activeItem.src}
                alt={activeItem.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Meta */}
            <div className="space-y-1 pt-2">
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-antonio)]">
                {activeItem.title}
              </h3>
              <p className="text-xs text-neutral-300">
                {activeItem.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
