import { Metadata } from "next";
import DonationClient from "./DonationClient";

export const metadata: Metadata = {
  title: "Soutenir l'Atelier Spoolio 🧡 | Impression 3D Éco-responsable",
  description: "Faites un don à l'atelier Spoolio pour soutenir la fabrication locale, l'achat de filaments biosourcés et la maintenance de nos imprimantes 3D.",
};

export default function DonationPage() {
  return <DonationClient />;
}
