import { NormalizedRect } from "./coordinates";

export interface CropStyleOptions {
  paddingRatio?: number;
}

/**
 * Computes background styles or image styles for a crop.
 * Note: Never set width: 100% or height: 100% on the containerStyle
 * so parent caller classes (e.g. w-14 h-14) are strictly respected.
 */
export function getCropImageStyles(
  zone: NormalizedRect,
  options: CropStyleOptions = {}
): {
  containerStyle: React.CSSProperties;
  imageStyle: React.CSSProperties;
} {
  const paddingRatio = options.paddingRatio ?? 0.12;

  const padX = zone.width * paddingRatio;
  const padY = zone.height * paddingRatio;

  const paddedX = Math.max(0, zone.x - padX);
  const paddedY = Math.max(0, zone.y - padY);
  const paddedW = Math.min(1 - paddedX, zone.width + padX * 2);
  const paddedH = Math.min(1 - paddedY, zone.height + padY * 2);

  if (paddedW <= 0 || paddedH <= 0) {
    return {
      containerStyle: { position: "relative", overflow: "hidden" },
      imageStyle: { width: "100%", height: "100%", objectFit: "cover" },
    };
  }

  const scaleX = 1 / Math.max(0.01, paddedW);
  const scaleY = 1 / Math.max(0.01, paddedH);
  const leftPercent = -(paddedX / Math.max(0.01, paddedW)) * 100;
  const topPercent = -(paddedY / Math.max(0.01, paddedH)) * 100;

  return {
    containerStyle: {
      position: "relative",
      overflow: "hidden",
    },
    imageStyle: {
      position: "absolute",
      width: `${(scaleX * 100).toFixed(2)}%`,
      height: `${(scaleY * 100).toFixed(2)}%`,
      left: `${leftPercent.toFixed(2)}%`,
      top: `${topPercent.toFixed(2)}%`,
      maxWidth: "none",
      maxHeight: "none",
      pointerEvents: "none",
      userSelect: "none",
    },
  };
}

/**
 * Extracts a cropped PNG Data URL using an HTML5 Canvas.
 */
export async function extractCropToDataUrl(
  imageUrl: string,
  zone: NormalizedRect,
  targetSize: number = 300,
  paddingRatio: number = 0.12
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve("");
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const naturalW = img.naturalWidth;
        const naturalH = img.naturalHeight;

        const padX = zone.width * paddingRatio;
        const padY = zone.height * paddingRatio;
        const sx = Math.max(0, (zone.x - padX) * naturalW);
        const sy = Math.max(0, (zone.y - padY) * naturalH);
        const sw = Math.min(naturalW - sx, (zone.width + padX * 2) * naturalW);
        const sh = Math.min(naturalH - sy, (zone.height + padY * 2) * naturalH);

        const canvas = document.createElement("canvas");
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetSize, targetSize);
        resolve(canvas.toDataURL("image/webp", 0.9));
      } catch (err) {
        console.warn("Failed to crop canvas, falling back to full image URL", err);
        resolve(imageUrl);
      }
    };
    img.onerror = () => {
      resolve(imageUrl);
    };
    img.src = imageUrl;
  });
}
