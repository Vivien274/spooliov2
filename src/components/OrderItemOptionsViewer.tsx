"use client";

import React from "react";

interface KeyDetail {
  keyNum: number;
  label: string;
  color?: string;
  type?: string;
  val?: string;
  rawText: string;
}

interface OrderItemOptionsViewerProps {
  options: string[];
}

export function parseClickerOptions(options: string[]) {
  const specs: { key: string; val: string; isComposition?: boolean }[] = [];
  const keys: KeyDetail[] = [];

  options.forEach((opt) => {
    // Check if this option contains Touche #X or Touche X
    const toucheMatches = [...opt.matchAll(/Touche\s*#?(\d+)\s*\(([^)]+)\)/gi)];
    
    if (toucheMatches.length > 0) {
      toucheMatches.forEach((m) => {
        const kNum = parseInt(m[1], 10);
        const detailStr = m[2].trim(); // e.g. "Rose Néon - Mot 'PLAY'"
        const dashIdx = detailStr.indexOf("-");
        
        let color = "";
        let val = detailStr;
        if (dashIdx !== -1) {
          color = detailStr.substring(0, dashIdx).trim();
          val = detailStr.substring(dashIdx + 1).trim();
        }

        keys.push({
          keyNum: kNum,
          label: `Touche #${kNum}`,
          color,
          val,
          rawText: detailStr,
        });
      });
    } else if (opt.includes("Touche #") || opt.includes("Touche ")) {
      // Single key option fallback, e.g. "Touche #1: Rose Néon - Mot 'PLAY'"
      const match = opt.match(/Touche\s*#?(\d+)\s*:\s*(.+)/i);
      if (match) {
        const kNum = parseInt(match[1], 10);
        const detailStr = match[2].trim();
        const dashIdx = detailStr.indexOf("-");
        let color = "";
        let val = detailStr;
        if (dashIdx !== -1) {
          color = detailStr.substring(0, dashIdx).trim();
          val = detailStr.substring(dashIdx + 1).trim();
        }
        keys.push({
          keyNum: kNum,
          label: `Touche #${kNum}`,
          color,
          val,
          rawText: detailStr,
        });
      } else {
        const colonIdx = opt.indexOf(":");
        if (colonIdx !== -1) {
          specs.push({
            key: opt.substring(0, colonIdx).trim(),
            val: opt.substring(colonIdx + 1).trim(),
          });
        } else {
          specs.push({ key: "Option", val: opt });
        }
      }
    } else {
      // Standard key:val option
      const colonIdx = opt.indexOf(":");
      if (colonIdx !== -1) {
        const k = opt.substring(0, colonIdx).trim();
        const v = opt.substring(colonIdx + 1).trim();
        specs.push({
          key: k,
          val: v,
          isComposition: k === "Composition",
        });
      } else {
        specs.push({ key: "", val: opt });
      }
    }
  });

  // Sort keys by key number ascending
  keys.sort((a, b) => a.keyNum - b.keyNum);

  return { specs, keys };
}

export default function OrderItemOptionsViewer({ options }: OrderItemOptionsViewerProps) {
  if (!options || options.length === 0) return null;

  const { specs, keys } = parseClickerOptions(options);

  return (
    <div className="space-y-2 mt-1">
      {/* 1. General Product Specs Badges */}
      {specs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {specs.map((item, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-lg border ${
                item.isComposition
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-200"
                  : "bg-black/60 border-white/15 text-gray-200"
              }`}
            >
              {item.key ? (
                <>
                  <span className={item.isComposition ? "text-purple-300 font-bold" : "text-gray-400 font-semibold"}>
                    {item.isComposition ? "🎁 " : ""}
                    {item.key === "Couleur Boîtier" || item.key === "Couleur"
                      ? "🎨 Boîtier"
                      : item.key === "Switchs" || item.key === "Switch"
                      ? "🔊 Switchs"
                      : item.key === "Attache"
                      ? "🔗 Attache"
                      : item.key === "Forme"
                      ? "⏹️ Forme"
                      : item.key}
                    :
                  </span>
                  <span className="text-white font-bold">{item.val}</span>
                </>
              ) : (
                <span className="text-gray-200">{item.val}</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* 2. Structured Keycaps Customization Grid for Clickers */}
      {keys.length > 0 && (
        <div className="bg-[#121216] border border-[#ff4f00]/30 rounded-xl p-3 shadow-inner space-y-2 mt-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#ff4f00] flex items-center gap-1.5">
              <span>⌨️</span> Personnalisation des Touches ({keys.length} touche{keys.length > 1 ? "s" : ""})
            </span>
            <span className="text-[9px] font-mono font-bold bg-[#ff4f00]/15 text-[#ff4f00] px-2 py-0.5 rounded-md border border-[#ff4f00]/30">
              ARTISAN 3D
            </span>
          </div>

          <div
            className={`grid gap-2 ${
              keys.length >= 6
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : keys.length >= 3
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {keys.map((k) => (
              <div
                key={k.keyNum}
                className="bg-black/50 border border-white/10 hover:border-[#ff4f00]/40 rounded-lg p-2 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="bg-[#ff4f00]/20 text-[#ff4f00] border border-[#ff4f00]/30 text-[10px] font-black px-1.5 py-0.5 rounded shrink-0 font-mono">
                    #{k.keyNum}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-white font-bold truncate text-[11px] leading-tight">
                      {k.val}
                    </span>
                    {k.color && (
                      <span className="text-[9px] text-amber-300 font-semibold flex items-center gap-1 leading-tight">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block shrink-0" />
                        {k.color}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
