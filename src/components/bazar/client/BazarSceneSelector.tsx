"use client";

import React from "react";
import { BazarScene } from "@/types/bazar";
import { Camera } from "lucide-react";

interface BazarSceneSelectorProps {
  scenes: BazarScene[];
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
  zoneCountsByScene: Record<string, number>;
}

export const BazarSceneSelector: React.FC<BazarSceneSelectorProps> = ({
  scenes,
  activeSceneId,
  onSelectScene,
  zoneCountsByScene,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#FF5500]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Photographies de l&apos;atelier
          </h2>
        </div>
        <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline">
          {scenes.length} scènes disponibles
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {scenes.map((scene) => {
          const isActive = scene.id === activeSceneId;
          const count = zoneCountsByScene[scene.id] || 0;

          return (
            <button
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              className={`flex items-center gap-2.5 p-2 rounded-xl text-left border transition-all cursor-pointer ${
                isActive
                  ? "bg-white border-[#FF5500] shadow-sm ring-1 ring-[#FF5500]"
                  : "bg-white hover:bg-neutral-50 border-[#E4E4E0] shadow-2xs"
              }`}
            >
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-neutral-100 border border-[#E4E4E0] shrink-0 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={scene.imageUrl}
                  alt={scene.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#121212] truncate">
                  {scene.title}
                </div>
                <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#FF5500]" : "bg-neutral-300"}`} />
                  <span>{count} objets</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
