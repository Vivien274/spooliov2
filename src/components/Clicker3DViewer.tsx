"use client";

import React, { useEffect, useRef, useState } from "react";

interface ColorOption {
  id: string;
  name: string;
  hex: string;
  textColor: string;
  isGlow?: boolean;
}

interface KeyConfig {
  type: "blank" | "letter" | "word" | "symbol" | "texture";
  value: string;
  color: string;
}

interface Clicker3DViewerProps {
  shapeId: string;
  keyCount: number;
  caseColor: ColorOption;
  switchType: "blue" | "brown" | "red";
  keyconfigs: Record<number, KeyConfig>;
  keycapMode: "all" | "custom";
  globalKeycapColor: ColorOption;
  keycapColorsList: ColorOption[];
  className?: string;
}

export default function Clicker3DViewer({
  shapeId,
  keyCount,
  caseColor,
  switchType,
  keyconfigs,
  keycapMode,
  globalKeycapColor,
  keycapColorsList,
  className = "",
}: Clicker3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotationX, setRotationX] = useState<number>(25);
  const [rotationY, setRotationY] = useState<number>(-35);
  const isDraggingRef = useRef<boolean>(false);
  const startMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculate layout grid & shape parameters for 3D Keycaps
  let cols = 1;
  let rows = 1;
  let layoutSlots: { slotIdx: number; keyIdx: number | null }[] = [];
  let keySize = 72; // default keycap size in px

  if (shapeId === "mono") {
    cols = 1;
    rows = 1;
    layoutSlots = [{ slotIdx: 0, keyIdx: 0 }];
  } else if (shapeId === "duo") {
    cols = 2;
    rows = 1;
    layoutSlots = [
      { slotIdx: 0, keyIdx: 0 },
      { slotIdx: 1, keyIdx: 1 },
    ];
  } else if (shapeId === "trio") {
    cols = 3;
    rows = 1;
    layoutSlots = [
      { slotIdx: 0, keyIdx: 0 },
      { slotIdx: 1, keyIdx: 1 },
      { slotIdx: 2, keyIdx: 2 },
    ];
  } else if (shapeId === "line_4") {
    cols = 4;
    rows = 1;
    keySize = 64;
    layoutSlots = [
      { slotIdx: 0, keyIdx: 0 },
      { slotIdx: 1, keyIdx: 1 },
      { slotIdx: 2, keyIdx: 2 },
      { slotIdx: 3, keyIdx: 3 },
    ];
  } else if (shapeId === "square_2x2") {
    cols = 2;
    rows = 2;
    keySize = 70;
    layoutSlots = [
      { slotIdx: 0, keyIdx: 0 },
      { slotIdx: 1, keyIdx: 1 },
      { slotIdx: 2, keyIdx: 2 },
      { slotIdx: 3, keyIdx: 3 },
    ];
  } else if (shapeId === "shape_t") {
    cols = 3;
    rows = 2;
    keySize = 64;
    // WASD / T shape layout:
    // Row 1: [empty, Slot 1 (W), empty]
    // Row 2: [Slot 3 (A), Slot 4 (S), Slot 5 (D)]
    layoutSlots = [
      { slotIdx: 0, keyIdx: null },
      { slotIdx: 1, keyIdx: 1 },
      { slotIdx: 2, keyIdx: null },
      { slotIdx: 3, keyIdx: 3 },
      { slotIdx: 4, keyIdx: 4 },
      { slotIdx: 5, keyIdx: 5 },
    ];
  } else if (shapeId === "line_7") {
    cols = 7;
    rows = 1;
    keySize = 46;
    layoutSlots = Array.from({ length: 7 }, (_, i) => ({ slotIdx: i, keyIdx: i }));
  } else if (shapeId === "grid_3x3") {
    cols = 3;
    rows = 3;
    keySize = 58;
    layoutSlots = Array.from({ length: 9 }, (_, i) => ({ slotIdx: i, keyIdx: i }));
  } else {
    cols = keyCount === 4 ? 2 : keyCount <= 3 ? keyCount : keyCount;
    rows = keyCount === 4 ? 2 : 1;
    layoutSlots = Array.from({ length: keyCount }, (_, i) => ({ slotIdx: i, keyIdx: i }));
  }

  // Drag rotation handlers
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    startMouseRef.current = { x: clientX, y: clientY };
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const deltaX = clientX - startMouseRef.current.x;
    const deltaY = clientY - startMouseRef.current.y;

    setRotationY((prev) => prev + deltaX * 0.5);
    setRotationX((prev) => Math.max(-60, Math.min(60, prev - deltaY * 0.5)));
    startMouseRef.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => handleMouseMove(e);
    const onUp = () => handleMouseUp();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  // Switch Stem Color Helper
  const switchStemColor = switchType === "blue" ? "#3b82f6" : switchType === "brown" ? "#92400e" : "#ef4444";

  const caseWidth = cols * (keySize + 14) + 26;
  const caseHeight = rows * (keySize + 14) + 26;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      className={`relative w-full h-[380px] sm:h-[420px] rounded-3xl bg-gradient-to-b from-neutral-900/90 to-black border border-neutral-800 shadow-2xl flex flex-col items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      {/* Top Banner Tag */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-neutral-900/80 backdrop-blur border border-neutral-700/80 px-3 py-1.5 rounded-full text-xs text-neutral-300 font-mono font-bold">
        <span className="w-2 h-2 rounded-full bg-[#ff4f00] animate-ping" />
        <span>STUDIO 3D TEMPS RÉEL 🕹️</span>
      </div>

      <div className="absolute top-4 right-4 z-20 text-[11px] font-mono text-neutral-400 bg-neutral-900/60 backdrop-blur px-2.5 py-1 rounded-full border border-neutral-800">
        🖱️ Glisser pour pivoter à 360°
      </div>

      {/* 3D Canvas Stage */}
      <div
        className="relative transition-transform duration-75 ease-out flex items-center justify-center"
        style={{
          transformStyle: "preserve-3d",
          transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
        }}
      >
        {/* 3D CLICKER CASE BODY */}
        <div
          className="relative rounded-3xl p-3 sm:p-4 shadow-2xl transition-all duration-300 flex flex-col justify-center items-center"
          style={{
            transformStyle: "preserve-3d",
            backgroundColor: caseColor.hex,
            boxShadow: `
              0 20px 40px rgba(0,0,0,0.8),
              inset 0 2px 4px rgba(255,255,255,0.25),
              inset 0 -8px 12px rgba(0,0,0,0.6),
              0 0 35px ${caseColor.isGlow ? "#a3e63588" : caseColor.hex + "44"}
            `,
            width: `${caseWidth}px`,
            height: `${caseHeight}px`,
          }}
        >
          {/* Bevelled Side Walls Simulation for Case Body */}
          <div
            className="absolute top-0 inset-x-0 h-6 rounded-t-3xl origin-top pointer-events-none"
            style={{ backgroundColor: caseColor.hex, filter: "brightness(1.15)", transform: "rotateX(-90deg)" }}
          />
          <div
            className="absolute bottom-0 inset-x-0 h-6 rounded-b-3xl origin-bottom pointer-events-none"
            style={{ backgroundColor: caseColor.hex, filter: "brightness(0.6)", transform: "rotateX(90deg)" }}
          />
          <div
            className="absolute left-0 inset-y-0 w-6 rounded-l-3xl origin-left pointer-events-none"
            style={{ backgroundColor: caseColor.hex, filter: "brightness(0.85)", transform: "rotateY(90deg)" }}
          />
          <div
            className="absolute right-0 inset-y-0 w-6 rounded-r-3xl origin-right pointer-events-none"
            style={{ backgroundColor: caseColor.hex, filter: "brightness(0.7)", transform: "rotateY(-90deg)" }}
          />
          <div
            className="absolute inset-0 rounded-3xl border-2 border-white/20 pointer-events-none"
            style={{ transform: "translateZ(-24px)", backgroundColor: caseColor.hex, filter: "brightness(0.5)" }}
          />

          {/* Keycaps Grid Layout */}
          <div
            className="grid gap-3.5 relative z-10"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              transformStyle: "preserve-3d",
            }}
          >
            {layoutSlots.map((slot, slotIndex) => {
              if (slot.keyIdx === null) {
                return (
                  <div
                    key={`empty-${slotIndex}`}
                    className="opacity-0 pointer-events-none"
                    style={{ width: `${keySize}px`, height: `${keySize}px` }}
                  />
                );
              }

              const actualKeyIdx = slot.keyIdx;
              const keyConfig = keyconfigs[actualKeyIdx] || { type: "blank", value: "", color: globalKeycapColor.id };

              // Find matching color object
              let capColorObj = globalKeycapColor;
              if (keycapMode === "custom") {
                const found = keycapColorsList.find((c) => c.id === keyConfig.color);
                if (found) capColorObj = found;
              }

              return (
                <div
                  key={`key-${actualKeyIdx}`}
                  className="relative group transition-all duration-200"
                  style={{
                    width: `${keySize}px`,
                    height: `${keySize}px`,
                    transformStyle: "preserve-3d",
                    transform: "translateZ(28px)",
                  }}
                >
                  {/* Switch Base & Stem under keycap */}
                  <div
                    className="absolute inset-0 m-auto w-7 h-7 rounded-md border border-neutral-700 bg-neutral-900 flex items-center justify-center shadow-inner"
                    style={{ transform: "translateZ(-14px)" }}
                  >
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: switchStemColor }} />
                  </div>

                  {/* 3D Keycap Box */}
                  <div
                    className="w-full h-full rounded-2xl flex flex-col items-center justify-center relative shadow-2xl font-bold transition-transform duration-150 active:translate-z-2"
                    style={{
                      transformStyle: "preserve-3d",
                      backgroundColor: capColorObj.hex,
                      color: capColorObj.textColor,
                      boxShadow: `
                        0 8px 16px rgba(0,0,0,0.5),
                        inset 0 3px 6px rgba(255,255,255,0.4),
                        inset 0 -5px 8px rgba(0,0,0,0.4),
                        0 0 15px ${capColorObj.isGlow ? "#a3e63566" : "transparent"}
                      `,
                    }}
                  >
                    {/* Keycap Volumetric Side Walls */}
                    <div
                      className="absolute top-0 inset-x-0 h-3 rounded-t-xl origin-top pointer-events-none"
                      style={{ backgroundColor: capColorObj.hex, filter: "brightness(1.2)", transform: "rotateX(-90deg)" }}
                    />
                    <div
                      className="absolute bottom-0 inset-x-0 h-3 rounded-b-xl origin-bottom pointer-events-none"
                      style={{ backgroundColor: capColorObj.hex, filter: "brightness(0.65)", transform: "rotateX(90deg)" }}
                    />
                    <div
                      className="absolute left-0 inset-y-0 w-3 rounded-l-xl origin-left pointer-events-none"
                      style={{ backgroundColor: capColorObj.hex, filter: "brightness(0.85)", transform: "rotateY(90deg)" }}
                    />
                    <div
                      className="absolute right-0 inset-y-0 w-3 rounded-r-xl origin-right pointer-events-none"
                      style={{ backgroundColor: capColorObj.hex, filter: "brightness(0.75)", transform: "rotateY(-90deg)" }}
                    />
                    <div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ backgroundColor: capColorObj.hex, filter: "brightness(0.5)", transform: "translateZ(-14px)" }}
                    />

                    {/* Keycap Key Number Badge */}
                    <span className="absolute top-1 left-1.5 text-[8px] font-mono opacity-40 font-black z-10">
                      #{actualKeyIdx + 1}
                    </span>

                    {/* Keycap Engraved Custom Content */}
                    <div className="text-center px-1 font-black text-xs sm:text-sm uppercase tracking-tight flex flex-col items-center justify-center z-10">
                      {keyConfig.type === "letter" && (
                        <span className="text-lg sm:text-xl font-mono tracking-widest">{keyConfig.value || "A"}</span>
                      )}
                      {keyConfig.type === "word" && (
                        <span className="text-[10px] sm:text-xs font-extrabold">{keyConfig.value || "SPOOLIO"}</span>
                      )}
                      {keyConfig.type === "symbol" && (
                        <span className="text-base sm:text-lg">{keyConfig.value || "⚡"}</span>
                      )}
                      {keyConfig.type === "texture" && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transformStyle: "preserve-3d" }}>
                          {/* LEGO 3D STUDS */}
                          {(keyConfig.value?.toLowerCase().includes("lego") || !keyConfig.value) && (
                            <div className="grid grid-cols-2 gap-2 p-3" style={{ transformStyle: "preserve-3d" }}>
                              {[0, 1, 2, 3].map((studIdx) => (
                                <div
                                  key={studIdx}
                                  className="w-5 h-5 rounded-full border border-black/20 relative shadow-lg flex items-center justify-center"
                                  style={{
                                    transformStyle: "preserve-3d",
                                    transform: "translateZ(8px)",
                                    backgroundColor: capColorObj.hex,
                                    boxShadow: "0 4px 8px rgba(0,0,0,0.5), inset 0 2px 3px rgba(255,255,255,0.4)",
                                  }}
                                >
                                  <span className="text-[5px] font-black opacity-40 tracking-tighter">LEGO</span>
                                  <div
                                    className="absolute inset-0 rounded-full border border-black/30 pointer-events-none"
                                    style={{ transform: "translateZ(-4px)", backgroundColor: capColorObj.hex, filter: "brightness(0.8)" }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* CHEESE / FROMAGE 3D HOLES */}
                          {keyConfig.value?.toLowerCase().includes("fromage") && (
                            <div className="absolute inset-0 p-2 overflow-hidden rounded-2xl">
                              <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-amber-950/60 border border-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
                              <div className="absolute bottom-3 right-2 w-6 h-6 rounded-full bg-amber-950/60 border border-black/40 shadow-[inset_0_3px_5px_rgba(0,0,0,0.8)]" />
                              <div className="absolute top-5 right-3 w-3.5 h-3.5 rounded-full bg-amber-950/60 border border-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
                              <div className="absolute bottom-2 left-4 w-5 h-5 rounded-full bg-amber-950/60 border border-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
                            </div>
                          )}

                          {/* WOODEN CRATE / CAISSE EN BOIS 3D TEXTURE */}
                          {(keyConfig.value?.toLowerCase().includes("caisse") || keyConfig.value?.toLowerCase().includes("bois")) && (
                            <div
                              className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none flex flex-col justify-between p-1"
                              style={{
                                transformStyle: "preserve-3d",
                              }}
                            >
                              {/* Background Wood Slat Grooves */}
                              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                                <div className="w-full h-[1px] bg-black my-auto" />
                                <div className="w-full h-[1px] bg-black my-auto" />
                                <div className="w-full h-[1px] bg-black my-auto" />
                              </div>

                              {/* Raised Wood Outer Border Planks */}
                              <div
                                className="absolute inset-0 rounded-2xl border-[5px] border-amber-950/80 shadow-md"
                                style={{
                                  transform: "translateZ(3px)",
                                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.7)",
                                }}
                              />

                              {/* Big Diagonal X-Brace Planks with 3D Depth */}
                              <div
                                className="absolute inset-0 m-auto w-[120%] h-3 bg-amber-950/85 border-y border-black/60 shadow-lg flex items-center justify-between px-2"
                                style={{
                                  transform: "rotate(45deg) translateZ(6px)",
                                }}
                              />
                              <div
                                className="absolute inset-0 m-auto w-[120%] h-3 bg-amber-950/85 border-y border-black/60 shadow-lg flex items-center justify-between px-2"
                                style={{
                                  transform: "rotate(-45deg) translateZ(6px)",
                                }}
                              />

                              {/* 4 Corner Iron Brackets with Metallic Nails */}
                              <div
                                className="absolute top-0.5 left-0.5 w-4 h-4 border-t-2 border-l-2 border-stone-900 bg-stone-800/80 flex items-start justify-start p-0.5 shadow-sm"
                                style={{ transform: "translateZ(8px)" }}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-200 border border-black shadow-inner" />
                              </div>
                              <div
                                className="absolute top-0.5 right-0.5 w-4 h-4 border-t-2 border-r-2 border-stone-900 bg-stone-800/80 flex items-start justify-end p-0.5 shadow-sm"
                                style={{ transform: "translateZ(8px)" }}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-200 border border-black shadow-inner" />
                              </div>
                              <div
                                className="absolute bottom-0.5 left-0.5 w-4 h-4 border-b-2 border-l-2 border-stone-900 bg-stone-800/80 flex items-end justify-start p-0.5 shadow-sm"
                                style={{ transform: "translateZ(8px)" }}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-200 border border-black shadow-inner" />
                              </div>
                              <div
                                className="absolute bottom-0.5 right-0.5 w-4 h-4 border-b-2 border-r-2 border-stone-900 bg-stone-800/80 flex items-end justify-end p-0.5 shadow-sm"
                                style={{ transform: "translateZ(8px)" }}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-200 border border-black shadow-inner" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {keyConfig.type === "blank" && (
                        <span className="w-2 h-2 rounded-full bg-current opacity-30" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Spec Bar Footer */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-2 bg-neutral-900/80 backdrop-blur border border-neutral-800 px-4 py-2 rounded-2xl text-xs">
        <div className="flex items-center gap-3 font-mono">
          <span className="text-neutral-400">Boîtier : <strong className="text-white">{caseColor.name}</strong></span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-400">Switch : <strong className="text-white capitalize">{switchType}</strong></span>
        </div>
        <button
          type="button"
          onClick={() => { setRotationX(25); setRotationY(-35); }}
          className="text-[11px] font-bold text-[#ff4f00] hover:underline cursor-pointer"
        >
          🔄 Réinitialiser la vue
        </button>
      </div>
    </div>
  );
}
