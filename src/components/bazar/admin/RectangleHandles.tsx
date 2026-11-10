"use client";

import React, { useState, useEffect, useRef } from "react";
import { NormalizedRect, clamp } from "@/lib/bazar/coordinates";

interface RectangleHandlesProps {
  rect: NormalizedRect;
  containerWidth: number;
  containerHeight: number;
  onChange: (newRect: NormalizedRect) => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

type HandleDirection = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "move";

export const RectangleHandles: React.FC<RectangleHandlesProps> = ({
  rect,
  containerWidth,
  containerHeight,
  onChange,
  onDelete,
  readOnly = false,
}) => {
  const [activeHandle, setActiveHandle] = useState<HandleDirection | null>(null);
  const startDragRef = useRef<{
    startX: number;
    startY: number;
    origRect: NormalizedRect;
  } | null>(null);

  useEffect(() => {
    if (!activeHandle || containerWidth <= 0 || containerHeight <= 0) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!startDragRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = (clientX - startDragRef.current.startX) / containerWidth;
      const deltaY = (clientY - startDragRef.current.startY) / containerHeight;
      const orig = startDragRef.current.origRect;

      let newX = orig.x;
      let newY = orig.y;
      let newW = orig.width;
      let newH = orig.height;

      const MIN_SIZE = 0.02;

      switch (activeHandle) {
        case "move":
          newX = clamp(orig.x + deltaX, 0, 1 - orig.width);
          newY = clamp(orig.y + deltaY, 0, 1 - orig.height);
          break;
        case "e":
          newW = clamp(orig.width + deltaX, MIN_SIZE, 1 - orig.x);
          break;
        case "w": {
          const maxLeftDelta = orig.width - MIN_SIZE;
          const clampedDeltaX = Math.min(deltaX, maxLeftDelta);
          newX = clamp(orig.x + clampedDeltaX, 0, orig.x + maxLeftDelta);
          newW = orig.width - (newX - orig.x);
          break;
        }
        case "s":
          newH = clamp(orig.height + deltaY, MIN_SIZE, 1 - orig.y);
          break;
        case "n": {
          const maxTopDelta = orig.height - MIN_SIZE;
          const clampedDeltaY = Math.min(deltaY, maxTopDelta);
          newY = clamp(orig.y + clampedDeltaY, 0, orig.y + maxTopDelta);
          newH = orig.height - (newY - orig.y);
          break;
        }
        case "se":
          newW = clamp(orig.width + deltaX, MIN_SIZE, 1 - orig.x);
          newH = clamp(orig.height + deltaY, MIN_SIZE, 1 - orig.y);
          break;
        case "nw": {
          const maxLeftDelta = orig.width - MIN_SIZE;
          const clampedDeltaX = Math.min(deltaX, maxLeftDelta);
          newX = clamp(orig.x + clampedDeltaX, 0, orig.x + maxLeftDelta);
          newW = orig.width - (newX - orig.x);

          const maxTopDelta = orig.height - MIN_SIZE;
          const clampedDeltaY = Math.min(deltaY, maxTopDelta);
          newY = clamp(orig.y + clampedDeltaY, 0, orig.y + maxTopDelta);
          newH = orig.height - (newY - orig.y);
          break;
        }
        case "ne": {
          newW = clamp(orig.width + deltaX, MIN_SIZE, 1 - orig.x);
          const maxTopDelta = orig.height - MIN_SIZE;
          const clampedDeltaY = Math.min(deltaY, maxTopDelta);
          newY = clamp(orig.y + clampedDeltaY, 0, orig.y + maxTopDelta);
          newH = orig.height - (newY - orig.y);
          break;
        }
        case "sw": {
          const maxLeftDelta = orig.width - MIN_SIZE;
          const clampedDeltaX = Math.min(deltaX, maxLeftDelta);
          newX = clamp(orig.x + clampedDeltaX, 0, orig.x + maxLeftDelta);
          newW = orig.width - (newX - orig.x);
          newH = clamp(orig.height + deltaY, MIN_SIZE, 1 - orig.y);
          break;
        }
      }

      onChange({
        x: Number(newX.toFixed(4)),
        y: Number(newY.toFixed(4)),
        width: Number(newW.toFixed(4)),
        height: Number(newH.toFixed(4)),
      });
    };

    const handlePointerUp = () => {
      setActiveHandle(null);
      startDragRef.current = null;
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove);
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [activeHandle, containerWidth, containerHeight, onChange]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent, dir: HandleDirection) => {
    e.stopPropagation();
    if (readOnly) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    startDragRef.current = {
      startX: clientX,
      startY: clientY,
      origRect: { ...rect },
    };
    setActiveHandle(dir);
  };

  const handles: { dir: HandleDirection; posClass: string; cursor: string }[] = [
    { dir: "nw", posClass: "-top-2 -left-2", cursor: "nwse-resize" },
    { dir: "n", posClass: "-top-2 left-1/2 -translate-x-1/2", cursor: "ns-resize" },
    { dir: "ne", posClass: "-top-2 -right-2", cursor: "nesw-resize" },
    { dir: "e", posClass: "top-1/2 -right-2 -translate-y-1/2", cursor: "ew-resize" },
    { dir: "se", posClass: "-bottom-2 -right-2", cursor: "nwse-resize" },
    { dir: "s", posClass: "-bottom-2 left-1/2 -translate-x-1/2", cursor: "ns-resize" },
    { dir: "sw", posClass: "-bottom-2 -left-2", cursor: "nesw-resize" },
    { dir: "w", posClass: "top-1/2 -left-2 -translate-y-1/2", cursor: "ew-resize" },
  ];

  return (
    <>
      {/* Draggable move body */}
      <div
        onMouseDown={(e) => startDrag(e, "move")}
        onTouchStart={(e) => startDrag(e, "move")}
        className="absolute inset-0 cursor-move bg-[#FF5500]/10 hover:bg-[#FF5500]/20"
      />

      {/* Resize corner and edge handles */}
      {!readOnly &&
        handles.map((h) => (
          <div
            key={h.dir}
            onMouseDown={(e) => startDrag(e, h.dir)}
            onTouchStart={(e) => startDrag(e, h.dir)}
            style={{ cursor: h.cursor }}
            className={`absolute w-3.5 h-3.5 bg-white border-2 border-[#FF5500] rounded-xs shadow-md z-40 hover:scale-125 transition-transform ${h.posClass}`}
          />
        ))}
    </>
  );
};

