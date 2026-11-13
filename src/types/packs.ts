export interface PackComponent {
  id: string;
  productId: number;
  productSlug?: string;
  productName?: string;
  productPrice?: number;
  productImage?: string;
  variant?: string | null;
  quantity: number;
  displayOrder: number;
}

export type PackagingType = "pochette_kraft" | "boite_kraft" | "custom";

export interface Pack {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  shortDescription?: string;
  description?: string;
  image: string;
  gallery?: string[];
  price: number;
  status: "active" | "draft" | "archived";
  startDate?: string | null;
  endDate?: string | null;
  maxQuantity?: number | null;
  displayOrder: number;
  category: string; // e.g. "noel-2026", "bundles", "decouverte"
  packagingType: PackagingType;
  packagingNotes?: string;
  seoTitle?: string;
  seoDescription?: string;
  items: PackComponent[];
  createdAt?: string;
  updatedAt?: string;

  // Hydrated/computed properties
  totalComponentsValue?: number;
  savingsAmount?: number;
  savingsPercentage?: number;
  isAvailable?: boolean;
  availableStock?: number;
}

