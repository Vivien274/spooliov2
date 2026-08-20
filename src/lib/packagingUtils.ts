export type PackagingType = "SAC_KRAFT" | "CARTON_S" | "CARTON_M" | "CARTON_L";

export interface PackagingRecommendation {
  type: PackagingType;
  label: string;
  badgeTitle: string;
  dimensions: string;
  icon: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  description: string;
}

export function recommendPackaging(
  rawItems: any,
  shippingMethod?: string
): PackagingRecommendation {
  // If order is pickup at workshop -> recommend Kraft Bag
  if (shippingMethod === "pickup") {
    return {
      type: "SAC_KRAFT",
      label: "Sac Kraft (Main Propre)",
      badgeTitle: "🛍️ Sac Kraft Atelier",
      dimensions: "Format Sac Main Propre",
      icon: "🛍️",
      bgClass: "bg-amber-500/10",
      borderClass: "border-amber-500/30",
      textClass: "text-amber-400",
      description: "Commande à retirer en main propre à l'atelier.",
    };
  }

  // Parse items array
  let items: any[] = [];
  if (typeof rawItems === "string") {
    try {
      items = JSON.parse(rawItems);
    } catch {
      items = [];
    }
  } else if (Array.isArray(rawItems)) {
    items = rawItems;
  }

  // Calculate volume score
  let totalQuantity = 0;
  let totalVolumeScore = 0;

  for (const item of items) {
    const qty = typeof item.quantity === "number" ? item.quantity : 1;
    totalQuantity += qty;

    const name = (item.name || "").toLowerCase();

    // Determine unit score based on product type keywords
    let unitScore = 1; // Default small fidget / clicker
    if (name.includes("pack") || name.includes("pochette") || name.includes("boite") || name.includes("boîte") || name.includes("support")) {
      unitScore = 3;
    } else if (name.includes("mega") || name.includes("dragon") || name.includes("grand") || name.includes("tombola")) {
      unitScore = 5;
    }

    totalVolumeScore += unitScore * qty;
  }

  if (totalVolumeScore <= 4 || totalQuantity <= 3) {
    return {
      type: "CARTON_S",
      label: "Carton Petit - Format S",
      badgeTitle: "📦 Format S (Petit)",
      dimensions: "16x11x5 cm",
      icon: "📦",
      bgClass: "bg-blue-500/10",
      borderClass: "border-blue-500/30",
      textClass: "text-blue-400",
      description: "Ideal pour 1 à 3 petits objets ou clickers.",
    };
  }

  if (totalVolumeScore <= 15 || totalQuantity <= 8) {
    return {
      type: "CARTON_M",
      label: "Carton Moyen - Format M",
      badgeTitle: "📦 Format M (Moyen)",
      dimensions: "22x15x10 cm",
      icon: "📦",
      bgClass: "bg-purple-500/10",
      borderClass: "border-purple-500/30",
      textClass: "text-purple-400",
      description: "Idéal pour 4 à 8 objets ou boîtes/pochettes.",
    };
  }

  return {
    type: "CARTON_L",
    label: "Carton Grand - Format L",
    badgeTitle: "📦 Format L (Grand)",
    dimensions: "30x20x15 cm",
    icon: "📦",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
    textClass: "text-emerald-400",
    description: "Idéal pour grands packs ou commandes volumineuses (>8 objets).",
  };
}
