import { Product } from "@/components/ProductCard";

export interface DropTheme {
  bgColor?: string;
  cardBgColor?: string;
  borderColor?: string;
  textColor?: string;
  subtitleColor?: string;
  accentColor?: string;
  titleFont?: string;
  titleSize?: "sm" | "md" | "lg" | "xl" | "2xl" | string;
  bodySize?: "sm" | "md" | "lg" | string;
  bodyFont?: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

export function getDropTitleScale(size?: string): number {
  switch (size) {
    case "sm":
      return 0.8;
    case "lg":
      return 1.25;
    case "xl":
      return 1.5;
    case "2xl":
      return 1.8;
    case "md":
    default:
      if (size && !isNaN(Number(size))) return Number(size);
      return 1.0;
  }
}

export function getDropBodyScale(size?: string): number {
  switch (size) {
    case "sm":
      return 0.9;
    case "lg":
      return 1.15;
    case "md":
    default:
      if (size && !isNaN(Number(size))) return Number(size);
      return 1.0;
  }
}

export interface DropGalleryItem {
  src: string;
  alt?: string;
  caption?: string;
  category?: string;
}

export interface Drop {
  id: string;
  slug: string;
  dropNumber?: string;
  dropName?: string;
  title: string;
  tagline: string;
  quote?: string;
  description: string;
  status: "upcoming" | "live" | "ended";
  startDate: string;
  endDate?: string;
  bannerImage: string;
  bannerVideo?: string;
  badge: string;
  themeColor?: string;
  theme?: DropTheme;
  editionSize?: number;
  productIds: number[];
  products?: Product[];
  gallery?: (string | DropGalleryItem)[];
}
