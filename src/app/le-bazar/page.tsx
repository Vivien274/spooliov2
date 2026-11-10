"use client";

import React, { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BazarScene, BazarItem, BazarZone } from "@/types/bazar";
import { bazarRepository } from "@/lib/bazar/repository";
import { INITIAL_BAZAR_ITEMS, INITIAL_BAZAR_SCENES, INITIAL_BAZAR_ZONES } from "@/lib/bazar/mockData";
import { BazarCartProvider, useBazarCart } from "@/context/BazarCartContext";
import { BazarHero } from "@/components/bazar/client/BazarHero";
import { BazarSceneSelector } from "@/components/bazar/client/BazarSceneSelector";
import { InteractivePhoto } from "@/components/bazar/client/InteractivePhoto";
import { SceneProductList } from "@/components/bazar/client/SceneProductList";
import { ProductQuickView } from "@/components/bazar/client/ProductQuickView";
import { BazarCartDrawer } from "@/components/bazar/client/BazarCartDrawer";
import { RotateCcw, ListFilter, Camera } from "lucide-react";

function BazarClientContent() {
  const [scenes, setScenes] = useState<BazarScene[]>(INITIAL_BAZAR_SCENES);
  const [activeSceneId, setActiveSceneId] = useState<string>(INITIAL_BAZAR_SCENES[0].id);
  const [zones, setZones] = useState<BazarZone[]>(INITIAL_BAZAR_ZONES);
  const [items, setItems] = useState<BazarItem[]>(INITIAL_BAZAR_ITEMS);
  const [selectedItem, setSelectedItem] = useState<BazarItem | null>(null);
  const [selectedZone, setSelectedZone] = useState<BazarZone | undefined>(undefined);
  const [mobileTab, setMobileTab] = useState<"photo" | "list">("photo");
  const { resetDemoData } = useBazarCart();

  // Load published scenes, zones and items
  const loadData = async () => {
    const published = await bazarRepository.getPublishedScenes();
    const allZones = await bazarRepository.getZones();
    const allItems = await bazarRepository.getItems();

    setScenes(published);
    setZones(allZones);
    setItems(allItems);

    if (published.length > 0 && (!activeSceneId || !published.some((s) => s.id === activeSceneId))) {
      setActiveSceneId(published[0].id);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = bazarRepository.subscribe(loadData);
    return unsubscribe;
  }, []);

  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0];

  // Filter zones and items for the active scene
  const activeZones = useMemo(() => {
    if (!activeScene) return [];
    return zones.filter((z) => z.sceneId === activeScene.id);
  }, [activeScene, zones]);

  const activeItems = useMemo(() => {
    const itemIds = new Set(activeZones.map((z) => z.itemId));
    return items.filter((it) => itemIds.has(it.id));
  }, [activeZones, items]);

  // Counts of zones per scene for the selector
  const zoneCountsByScene = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const z of zones) {
      counts[z.sceneId] = (counts[z.sceneId] || 0) + 1;
    }
    return counts;
  }, [zones]);

  // Total available pieces across all published scenes
  const totalAvailablePieces = useMemo(() => {
    return items.filter((i) => i.status !== "sold" && i.quantity > 0).reduce((sum, i) => sum + i.quantity, 0);
  }, [items]);

  const handleSelectItem = (item: BazarItem, zone?: BazarZone) => {
    setSelectedItem(item);
    setSelectedZone(zone || activeZones.find((z) => z.itemId === item.id));
  };

  if (!activeScene) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-[#FF5500] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#121212]">Chargement du Bazar...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#121212] flex flex-col font-sans">
      <Header />

      <main className="flex-1 pt-28 sm:pt-32 lg:pt-36">
        {/* Editorial Hero */}
        <BazarHero
          totalAvailablePieces={totalAvailablePieces}
          scenesCount={scenes.length}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Scene Switcher */}
          <BazarSceneSelector
            scenes={scenes}
            activeSceneId={activeScene.id}
            onSelectScene={(id) => {
              setActiveSceneId(id);
              setSelectedItem(null);
            }}
            zoneCountsByScene={zoneCountsByScene}
          />

          {/* Mobile Tab Toggle (Photo vs Liste) */}
          <div className="flex md:hidden bg-white p-1 rounded-2xl border border-[#E4E4E0] shadow-xs">
            <button
              onClick={() => setMobileTab("photo")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                mobileTab === "photo"
                  ? "bg-[#FF5500] text-white shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photographie</span>
            </button>
            <button
              onClick={() => setMobileTab("list")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                mobileTab === "list"
                  ? "bg-[#FF5500] text-white shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Liste des objets ({activeItems.length})</span>
            </button>
          </div>

          {/* Main Showcase Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Interactive Photo (Column 1 - 8 cols on desktop) */}
            <div
              className={`lg:col-span-8 ${
                mobileTab === "photo" ? "block" : "hidden md:block"
              }`}
            >
              <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700">
                  {activeScene.title}
                </span>
                <span>Astuce : Touchez ou survolez un objet</span>
              </div>

              <InteractivePhoto
                scene={activeScene}
                zones={activeZones}
                items={items}
                selectedItemId={selectedItem?.id || null}
                onSelectItem={handleSelectItem}
              />
            </div>

            {/* Synchronized Product List (Column 2 - 4 cols on desktop) */}
            <div
              className={`lg:col-span-4 ${
                mobileTab === "list" ? "block" : "hidden md:block"
              }`}
            >
              <SceneProductList
                scene={activeScene}
                zones={activeZones}
                items={activeItems}
                selectedItemId={selectedItem?.id || null}
                onSelectItem={handleSelectItem}
              />
            </div>
          </div>
        </div>

        {/* Floating Quick View Modal / Sheet */}
        <ProductQuickView
          item={selectedItem}
          zone={selectedZone}
          scene={activeScene}
          onClose={() => setSelectedItem(null)}
        />

        {/* Local Cart Drawer & Simulated Checkout */}
        <BazarCartDrawer />

        {/* Bottom Local Demo Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-[#E4E4E0] my-8 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            <strong className="text-neutral-700 font-semibold">Le Bazar de Spoolio</strong> — Prototype photographique interactif local.
          </div>

          <button
            onClick={resetDemoData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4E4E0] bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>Réinitialiser les stocks de démo</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LeBazarPage() {
  return (
    <BazarCartProvider>
      <BazarClientContent />
    </BazarCartProvider>
  );
}

