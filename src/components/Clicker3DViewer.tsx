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
  onKeyClick?: (keyIdx: number) => void;
  activeKeyIndex?: number;
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
  onKeyClick,
  activeKeyIndex,
}: Clicker3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotationX, setRotationX] = useState<number>(22);
  const [rotationY, setRotationY] = useState<number>(-28);
  const [pressedKey, setPressedKey] = useState<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);

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
    hasDraggedRef.current = false;
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

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      hasDraggedRef.current = true;
    }

    setRotationY((prev) => prev + deltaX * 0.45);
    setRotationX((prev) => Math.max(-55, Math.min(55, prev - deltaY * 0.45)));
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
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  // Switch Stem Color Helper
  const switchStemColor = switchType === "blue" ? "#2563eb" : switchType === "brown" ? "#78350f" : "#dc2626";

  const caseWidth = cols * (keySize + 14) + 26;
  const caseHeight = rows * (keySize + 14) + 26;

  const handleKeyClick = (keyIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasDraggedRef.current) return;
    setPressedKey(keyIdx);
    onKeyClick?.(keyIdx);
    setTimeout(() => setPressedKey(null), 140);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      className={`relative w-full h-[400px] sm:h-[460px] lg:h-[500px] rounded-2xl bg-[#F6F5F1] border border-[#E4E3DD] shadow-xs flex flex-col items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none ${className}`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(255, 85, 0, 0.03) 0%, transparent 60%),
          radial-gradient(circle at 50% 45%, rgba(0, 0, 0, 0.02) 0%, transparent 70%)
        `,
      }}
    >
      {/* Precision Crosshair Markers in Light Mode */}
      <span className="absolute top-3.5 left-3.5 text-[11px] font-mono text-[#BBBBB5] select-none pointer-events-none">+</span>
      <span className="absolute top-3.5 right-3.5 text-[11px] font-mono text-[#BBBBB5] select-none pointer-events-none">+</span>
      <span className="absolute bottom-3.5 left-3.5 text-[11px] font-mono text-[#BBBBB5] select-none pointer-events-none">+</span>
      <span className="absolute bottom-3.5 right-3.5 text-[11px] font-mono text-[#BBBBB5] select-none pointer-events-none">+</span>

      {/* Top Bar Header */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#E0DFD8] px-3 py-1 rounded-full shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#18181B] uppercase">
            STUDIO 3D // INTERACTIF
          </span>
        </div>

        <div className="text-[10px] font-mono tracking-wider text-[#666663] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#E0DFD8] shadow-2xs">
          GLISSER POUR PIVOTER
        </div>
      </div>

      {/* 3D Canvas Stage */}
      <div
        className="relative transition-transform duration-75 ease-out flex items-center justify-center"
        style={{
          transformStyle: "preserve-3d",
          transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
        }}
      >
        {/* Soft Realistic Contact Shadow on Floor in Light Studio */}
        <div
          className="absolute rounded-full pointer-events-none filter blur-xl opacity-25"
          style={{
            transform: "translateZ(-48px) rotateX(90deg)",
            backgroundColor: "#000000",
            width: `${caseWidth * 1.15}px`,
            height: `${caseHeight * 1.15}px`,
          }}
        />

        {/* 3D CLICKER CASE BODY */}
        <div
          className="relative rounded-2xl p-3 sm:p-4 shadow-xl transition-all duration-300 flex flex-col justify-center items-center"
          style={{
            transformStyle: "preserve-3d",
            backgroundColor: caseColor.hex,
            boxShadow: `
              0 20px 40px rgba(0,0,0,0.18),
              inset 0 1px 2px rgba(255,255,255,0.4),
              inset 0 -6px 10px rgba(0,0,0,0.25),
              0 0 30px ${caseColor.isGlow ? "#a3e63566" : "transparent"}
            `,
            width: `${caseWidth}px`,
            height: `${caseHeight}px`,
          }}
        >
          {/* Bevelled Side Walls Simulation for Case Body */}
          <div
            className="absolute top-0 inset-x-0 h-6 rounded-t-2xl origin-top pointer-events-none"
            style={{ backgroundColor: caseColor.hex, filter: "brightness(1.12)", transform: "rotateX(-90deg)" }}
          />
          <div
            className="absolute bottom-0 inset-x-0 h-6 rounded-b-2xl origin-bottom pointer-events-none"
            style={{ backgroundColor: caseColor.hex, filter: "brightness(0.7)", transform: "rotateX(90deg)" }}
          />
          <div
            className="absolute left-0 inset-y-0 w-6 rounded-l-2xl origin-left pointer-events-none"
            style={{ backgroundColor: caseColor.hex, filter: "brightness(0.88)", transform: "rotateY(90deg)" }}
          />
          <div
            className="absolute right-0 inset-y-0 w-6 rounded-r-2xl origin-right pointer-events-none"
            style={{ backgroundColor: caseColor.hex, filter: "brightness(0.76)", transform: "rotateY(-90deg)" }}
          />
          <div
            className="absolute inset-0 rounded-2xl border border-black/10 pointer-events-none"
            style={{ transform: "translateZ(-24px)", backgroundColor: caseColor.hex, filter: "brightness(0.6)" }}
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

              const isKeyActive = keycapMode === "custom" && activeKeyIndex === actualKeyIdx;
              const isKeyPressed = pressedKey === actualKeyIdx;

              return (
                <div
                  key={`key-${actualKeyIdx}`}
                  onClick={(e) => handleKeyClick(actualKeyIdx, e)}
                  className="relative group transition-all duration-150 cursor-pointer"
                  style={{
                    width: `${keySize}px`,
                    height: `${keySize}px`,
                    transformStyle: "preserve-3d",
                    transform: isKeyPressed ? "translateZ(20px)" : "translateZ(28px)",
                  }}
                  title={`Touche #${actualKeyIdx + 1} • Cliquer pour tester`}
                >
                  {/* Switch Base & Stem under keycap */}
                  <div
                    className="absolute inset-0 m-auto w-7 h-7 rounded-md border border-[#D5D5CF] bg-[#E8E8E2] flex items-center justify-center shadow-inner pointer-events-none"
                    style={{ transform: "translateZ(-14px)" }}
                  >
                    <div className="w-3 h-3 rounded-xs" style={{ backgroundColor: switchStemColor }} />
                  </div>

                  {/* 3D Keycap Box */}
                  <div
                    className={`w-full h-full rounded-xl flex flex-col items-center justify-center relative shadow-lg font-bold transition-all duration-150 ${
                      isKeyActive
                        ? "ring-2 ring-[#FF5500] ring-offset-2 ring-offset-white scale-102"
                        : "group-hover:scale-102"
                    }`}
                    style={{
                      transformStyle: "preserve-3d",
                      backgroundColor: capColorObj.hex,
                      color: capColorObj.textColor,
                      boxShadow: `
                        0 6px 14px rgba(0,0,0,0.18),
                        inset 0 2px 4px rgba(255,255,255,0.45),
                        inset 0 -4px 6px rgba(0,0,0,0.2),
                        0 0 16px ${capColorObj.isGlow ? "#a3e63566" : "transparent"}
                      `,
                    }}
                  >
                    {/* Keycap Volumetric Side Walls */}
                    <div
                      className="absolute top-0 inset-x-0 h-3 rounded-t-lg origin-top pointer-events-none"
                      style={{ backgroundColor: capColorObj.hex, filter: "brightness(1.18)", transform: "rotateX(-90deg)" }}
                    />
                    <div
                      className="absolute bottom-0 inset-x-0 h-3 rounded-b-lg origin-bottom pointer-events-none"
                      style={{ backgroundColor: capColorObj.hex, filter: "brightness(0.72)", transform: "rotateX(90deg)" }}
                    />
                    <div
                      className="absolute left-0 inset-y-0 w-3 rounded-l-lg origin-left pointer-events-none"
                      style={{ backgroundColor: capColorObj.hex, filter: "brightness(0.9)", transform: "rotateY(90deg)" }}
                    />
                    <div
                      className="absolute right-0 inset-y-0 w-3 rounded-r-lg origin-right pointer-events-none"
                      style={{ backgroundColor: capColorObj.hex, filter: "brightness(0.78)", transform: "rotateY(-90deg)" }}
                    />
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ backgroundColor: capColorObj.hex, filter: "brightness(0.6)", transform: "translateZ(-14px)" }}
                    />

                    {/* Keycap Key Number Badge */}
                    <span className="absolute top-1 left-1.5 text-[8px] font-mono opacity-50 font-bold z-10 select-none">
                      #{actualKeyIdx + 1}
                    </span>

                    {/* Keycap Engraved Custom Content */}
                    <div className="text-center px-1 font-black text-xs sm:text-sm uppercase tracking-tight flex flex-col items-center justify-center z-10 pointer-events-none">
                      {keyConfig.type === "letter" && (
                        <span className="text-lg sm:text-xl font-mono tracking-widest">{keyConfig.value || "A"}</span>
                      )}
                      {keyConfig.type === "word" && (
                        <span className="text-[10px] sm:text-xs font-mono font-bold tracking-tight">{keyConfig.value || "SPOOLIO"}</span>
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
                                  className="w-5 h-5 rounded-full border border-black/15 relative shadow-md flex items-center justify-center"
                                  style={{
                                    transformStyle: "preserve-3d",
                                    transform: "translateZ(8px)",
                                    backgroundColor: capColorObj.hex,
                                    boxShadow: "0 3px 6px rgba(0,0,0,0.2), inset 0 2px 3px rgba(255,255,255,0.5)",
                                  }}
                                >
                                  <span className="text-[5px] font-black opacity-40 tracking-tighter">LEGO</span>
                                  <div
                                    className="absolute inset-0 rounded-full border border-black/20 pointer-events-none"
                                    style={{ transform: "translateZ(-4px)", backgroundColor: capColorObj.hex, filter: "brightness(0.85)" }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* CHEESE / FROMAGE 3D HOLES */}
                          {keyConfig.value?.toLowerCase().includes("fromage") && (
                            <div className="absolute inset-0 p-2 overflow-hidden rounded-xl">
                              <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-amber-950/40 border border-black/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
                              <div className="absolute bottom-3 right-2 w-6 h-6 rounded-full bg-amber-950/40 border border-black/30 shadow-[inset_0_3px_5px_rgba(0,0,0,0.5)]" />
                              <div className="absolute top-5 right-3 w-3.5 h-3.5 rounded-full bg-amber-950/40 border border-black/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
                              <div className="absolute bottom-2 left-4 w-5 h-5 rounded-full bg-amber-950/40 border border-black/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
                            </div>
                          )}

                          {/* WOODEN CRATE / CAISSE EN BOIS 3D TEXTURE */}
                          {(keyConfig.value?.toLowerCase().includes("caisse") || keyConfig.value?.toLowerCase().includes("bois")) && (
                            <div
                              className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none flex flex-col justify-between p-1"
                              style={{ transformStyle: "preserve-3d" }}
                            >
                              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                                <div className="w-full h-[1px] bg-black my-auto" />
                                <div className="w-full h-[1px] bg-black my-auto" />
                                <div className="w-full h-[1px] bg-black my-auto" />
                              </div>

                              <div
                                className="absolute inset-0 rounded-xl border-[4px] border-amber-950/70 shadow-xs"
                                style={{ transform: "translateZ(3px)", boxShadow: "inset 0 0 8px rgba(0,0,0,0.4)" }}
                              />

                              <div
                                className="absolute inset-0 m-auto w-[120%] h-3 bg-amber-950/75 border-y border-black/40 shadow-xs flex items-center justify-between px-2"
                                style={{ transform: "rotate(45deg) translateZ(6px)" }}
                              />
                              <div
                                className="absolute inset-0 m-auto w-[120%] h-3 bg-amber-950/75 border-y border-black/40 shadow-xs flex items-center justify-between px-2"
                                style={{ transform: "rotate(-45deg) translateZ(6px)" }}
                              />

                              <div className="absolute top-0.5 left-0.5 w-3.5 h-3.5 border-t-2 border-l-2 border-stone-800 bg-stone-700/60 p-0.5" style={{ transform: "translateZ(8px)" }}>
                                <div className="w-1 h-1 rounded-full bg-amber-100 border border-black/40" />
                              </div>
                              <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 border-t-2 border-r-2 border-stone-800 bg-stone-700/60 p-0.5" style={{ transform: "translateZ(8px)" }}>
                                <div className="w-1 h-1 rounded-full bg-amber-100 border border-black/40" />
                              </div>
                              <div className="absolute bottom-0.5 left-0.5 w-3.5 h-3.5 border-b-2 border-l-2 border-stone-800 bg-stone-700/60 p-0.5" style={{ transform: "translateZ(8px)" }}>
                                <div className="w-1 h-1 rounded-full bg-amber-100 border border-black/40" />
                              </div>
                              <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 border-b-2 border-r-2 border-stone-800 bg-stone-700/60 p-0.5" style={{ transform: "translateZ(8px)" }}>
                                <div className="w-1 h-1 rounded-full bg-amber-100 border border-black/40" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {keyConfig.type === "blank" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />
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
      <div className="absolute bottom-3 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-2 bg-white/95 backdrop-blur-md border border-[#E0DFD8] px-3.5 py-2 rounded-xl text-xs shadow-2xs">
        <div className="flex items-center gap-2.5 font-mono text-[11px] text-[#666663]">
          <span>BOÎTIER <strong className="text-[#18181B]">{caseColor.name.toUpperCase()}</strong></span>
          <span className="text-[#D0CFCA]">•</span>
          <span>SWITCH <strong className="text-[#18181B]">{switchType === "blue" ? "CLICKY" : switchType === "brown" ? "TACTILE" : "LINÉAIRE"}</strong></span>
        </div>
        <button
          type="button"
          onClick={() => { setRotationX(22); setRotationY(-28); }}
          className="text-[10px] font-mono font-bold tracking-wider text-[#666663] hover:text-[#FF5500] transition-colors cursor-pointer flex items-center gap-1 uppercase"
        >
          <span>⟲ RECENTRER LA VUE</span>
        </button>
      </div>
    </div>
  );
}
