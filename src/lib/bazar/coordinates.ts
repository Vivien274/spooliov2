import { BazarItemCondition, BazarZone } from "@/types/bazar";

export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NormalizedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Clamps a number between min and max
 */
export function clamp(val: number, min: number = 0, max: number = 1): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Normalizes pixel coordinates to 0..1 values based on container dimensions
 */
export function normalizeRect(
  rect: PixelRect,
  containerWidth: number,
  containerHeight: number,
  minDimension: number = 0.015
): NormalizedRect {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  // Handle negative width / height when dragging backwards
  let rawX = rect.width < 0 ? rect.x + rect.width : rect.x;
  let rawY = rect.height < 0 ? rect.y + rect.height : rect.y;
  let rawW = Math.abs(rect.width);
  let rawH = Math.abs(rect.height);

  let normX = clamp(rawX / containerWidth, 0, 1);
  let normY = clamp(rawY / containerHeight, 0, 1);
  let normW = clamp(rawW / containerWidth, minDimension, 1 - normX);
  let normH = clamp(rawH / containerHeight, minDimension, 1 - normY);

  return {
    x: Number(normX.toFixed(4)),
    y: Number(normY.toFixed(4)),
    width: Number(normW.toFixed(4)),
    height: Number(normH.toFixed(4)),
  };
}

/**
 * Denormalizes 0..1 coordinates to pixels
 */
export function denormalizeRect(
  rect: NormalizedRect,
  containerWidth: number,
  containerHeight: number
): PixelRect {
  return {
    x: rect.x * containerWidth,
    y: rect.y * containerHeight,
    width: rect.width * containerWidth,
    height: rect.height * containerHeight,
  };
}

/**
 * Checks if a point (normalized 0..1) is inside a normalized rect
 */
export function isPointInNormalizedRect(
  px: number,
  py: number,
  rect: NormalizedRect
): boolean {
  return (
    px >= rect.x &&
    px <= rect.x + rect.width &&
    py >= rect.y &&
    py <= rect.y + rect.height
  );
}

/**
 * Resolves overlapping zones:
 * Selects the smallest area zone containing the target point (most specific item)
 */
export function findBestMatchingZone(
  px: number,
  py: number,
  zones: BazarZone[]
): BazarZone | null {
  const matching = zones.filter((z) => isPointInNormalizedRect(px, py, z));
  if (matching.length === 0) return null;
  if (matching.length === 1) return matching[0];

  // Sort by area ascending so smaller/more specific zone is picked
  matching.sort((a, b) => a.width * a.height - b.width * b.height);
  return matching[0];
}

/**
 * Formats price in cents into a clean French currency string
 * e.g. 300 -> "3 €", 350 -> "3,50 €"
 */
export function formatPrice(priceCents: number): string {
  const euros = priceCents / 100;
  if (Number.isInteger(euros)) {
    return `${euros} €`;
  }
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(euros);
}

/**
 * Human-friendly labels for conditions
 */
export function getConditionLabel(condition: BazarItemCondition): string {
  switch (condition) {
    case "prototype":
      return "Prototype";
    case "end_of_series":
      return "Fin de série";
    case "color_test":
      return "Essai de couleur";
    case "minor_defect":
      return "Petit défaut";
    case "other":
    default:
      return "Pièce unique";
  }
}

/**
 * Accessible badges styling in strict Light Theme
 */
export function getConditionBadgeStyle(condition: BazarItemCondition): {
  bg: string;
  text: string;
  border: string;
} {
  switch (condition) {
    case "prototype":
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
      };
    case "end_of_series":
      return {
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200",
      };
    case "color_test":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      };
    case "minor_defect":
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
      };
    case "other":
    default:
      return {
        bg: "bg-stone-100",
        text: "text-stone-700",
        border: "border-stone-200",
      };
  }
}

