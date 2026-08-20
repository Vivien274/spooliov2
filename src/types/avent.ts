export type PackagingStatus = "a_commander" | "commande" | "recu" | "en_stock";

export interface PackagingItem {
  id: string;
  name: string;
  category: "boite" | "sachet" | "ruban" | "sticker" | "calage" | "autre";
  supplier: string;
  supplierUrl?: string;
  unitPrice: number; // in Euros
  quantityNeededPerCalendar: number;
  quantityInStock: number;
  status: PackagingStatus;
  notes?: string;
}

export type ObjectProductionStatus =
  | "idee"
  | "decide"
  | "stl_pret"
  | "prototype"
  | "impression"
  | "imprime"
  | "emballe";

export type ObjectVisibilityStatus = "auto_date" | "devoile_manuel" | "masque";

export interface AdventObjectItem {
  day: number; // 1 to 24 (or 25)
  title: string;
  category: string; // e.g. "Fidget", "Porte-clé", "Décoration", "Accessoire", "Mini-Jeu"
  stlUrl?: string;
  filamentColor: string; // e.g. "PLA Soie Or & Rouge"
  printTimeMinutes: number;
  weightGrams: number;
  estimatedCost: number; // in Euros
  status: ObjectProductionStatus;
  visibility: ObjectVisibilityStatus;
  teaser: string; // Indice avant ouverture
  description: string; // Description complète pour le client
  imageUrl: string;
  funFact?: string; // Petite histoire ou anecdote 3D
  likesCount?: number; // Compteur de J'aime
}

export interface PreorderConfig {
  tier1Price: number; // 45 €
  tier1Limit: number; // 25
  tier1Sold: number; // e.g. 0
  tier2Price: number; // 50 €
  tier2Limit: number; // 25
  tier2Sold: number; // e.g. 0
}

export interface AdventConfig {
  id: string;
  title: string;
  subtitle: string;
  startDate: string; // ISO date string e.g. "2026-12-01"
  endDate: string; // ISO date string e.g. "2026-12-24"
  estimatedPublicPrice: number;
  isDraftLocal: boolean;
  isPublicActive?: boolean;
  preorder: PreorderConfig;
}

export interface AdventData {
  config: AdventConfig;
  packaging: PackagingItem[];
  objects: AdventObjectItem[];
}
