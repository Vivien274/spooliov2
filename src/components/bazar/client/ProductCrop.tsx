"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { NormalizedRect } from "@/lib/bazar/coordinates";

interface ProductCropProps {
  imageUrl: string;
  zone?: NormalizedRect;
  alt?: string;
  className?: string;
  paddingRatio?: number;
}

export const ProductCrop: React.FC<ProductCropProps> = ({
  imageUrl,
  zone,
  alt = "Miniature objet",
  className = "w-16 h-16 rounded-xl",
  paddingRatio = 0.12,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCanvasDrawn, setHasCanvasDrawn] = useState(false);

  // Synchronous CSS background preview to guarantee immediate display with zero blank frame
  const bgStyles = useMemo(() => {
    if (!zone || zone.width <= 0 || zone.height <= 0) {
      return {
        backgroundImage: `url("${imageUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
      };
    }

    const pad = paddingRatio;
    const padX = zone.width * pad;
    const padY = zone.height * pad;

    const cropX = Math.max(0, zone.x - padX);
    const cropY = Math.max(0, zone.y - padY);
    const cropW = Math.min(1 - cropX, zone.width + padX * 2);
    const cropH = Math.min(1 - cropY, zone.height + padY * 2);

    const sizeX = (1 / Math.max(0.01, cropW)) * 100;
    const sizeY = (1 / Math.max(0.01, cropH)) * 100;

    const posX = cropW >= 0.999 ? 50 : Math.max(0, Math.min(100, (cropX / (1 - cropW)) * 100));
    const posY = cropH >= 0.999 ? 50 : Math.max(0, Math.min(100, (cropY / (1 - cropH)) * 100));

    return {
      backgroundImage: `url("${imageUrl}")`,
      backgroundSize: `${sizeX.toFixed(2)}% ${sizeY.toFixed(2)}%`,
      backgroundPosition: `${posX.toFixed(2)}% ${posY.toFixed(2)}%`,
      backgroundRepeat: "no-repeat",
    };
  }, [imageUrl, zone, paddingRatio]);

  // High-fidelity Canvas draw
  useEffect(() => {
    if (!imageUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (!isMounted) return;
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;

      canvas.width = 160;
      canvas.height = 160;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      if (!zone || zone.width <= 0 || zone.height <= 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasCanvasDrawn(true);
        return;
      }

      const pad = paddingRatio;
      const padX = zone.width * pad;
      const padY = zone.height * pad;

      const cropX = Math.max(0, zone.x - padX);
      const cropY = Math.max(0, zone.y - padY);
      const cropW = Math.min(1 - cropX, zone.width + padX * 2);
      const cropH = Math.min(1 - cropY, zone.height + padY * 2);

      const sx = Math.max(0, cropX * nw);
      const sy = Math.max(0, cropY * nh);
      const sw = Math.min(nw - sx, cropW * nw);
      const sh = Math.min(nh - sy, cropH * nh);

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      setHasCanvasDrawn(true);
    };

    img.src = imageUrl;

    return () => {
      isMounted = false;
    };
  }, [imageUrl, zone?.x, zone?.y, zone?.width, zone?.height, paddingRatio]);

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative overflow-hidden bg-neutral-100 border border-[#E4E4E0] shrink-0 ${className}`}
      style={bgStyles}
    >
      <canvas
        ref={canvasRef}
        width={160}
        height={160}
        className={`w-full h-full object-cover block rounded-[inherit] transition-opacity duration-200 ${
          hasCanvasDrawn ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};
