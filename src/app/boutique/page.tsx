import type { Metadata } from "next";
import BoutiqueClient from "./BoutiqueClient";

export const metadata: Metadata = {
  title: "La Boutique Spoolio | Objets Fun & Utiles Imprimés en 3D",
  description: "Parcourez notre collection d'objets uniques imprimés en 3D de haute qualité. Fidgets, décoration insolite et gadgets fun fabriqués localement en PLA biodégradable.",
};

export default function BoutiquePage() {
  return <BoutiqueClient />;
}
