export type BazarItemStatus = "available" | "reserved" | "sold";

export type BazarItemCondition =
  | "prototype"
  | "end_of_series"
  | "color_test"
  | "minor_defect"
  | "other";

export interface BazarItem {
  id: string;
  name: string;
  priceCents: number; // Stored in cents (e.g. 300 = 3,00 €)
  quantity: number;
  status: BazarItemStatus;
  condition: BazarItemCondition;
  description?: string;
  conditionNotes?: string;
  additionalImages?: string[]; // Extra detail photos (URLs or DataURLs)
  linkedProductSlug?: string;  // Slug of standard shop product (e.g. "cameleon-aimante")
  linkedProductName?: string;  // Name of standard shop product (e.g. "Caméléon aimanté")
  linkedProductPrice?: string; // Standard price in regular shop (e.g. "8.00")
  createdAt: string;
  updatedAt: string;
}

export interface BazarZone {
  id: string;
  sceneId: string;
  itemId: string;
  x: number;      // 0 to 1 normalized relative to image natural width
  y: number;      // 0 to 1 normalized relative to image natural height
  width: number;  // 0 to 1 normalized
  height: number; // 0 to 1 normalized
}

export interface BazarScene {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;      // Public path, blob URL or base64
  imageWidth: number;
  imageHeight: number;
  status: "draft" | "published" | "archived";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BazarCartItem {
  item: BazarItem;
  quantity: number;
  zone?: BazarZone;
  scene?: BazarScene;
}

export interface BazarDataset {
  scenes: BazarScene[];
  items: BazarItem[];
  zones: BazarZone[];
  version: string;
  exportedAt: string;
}
