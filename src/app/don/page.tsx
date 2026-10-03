import { Metadata } from "next";
import DonationClient from "./DonationClient";
import { createPageMetadata } from "@/lib/seoMetadata";

export const metadata: Metadata = createPageMetadata({
  title: "Soutenir l'Atelier Spoolio | Impression 3D Locale",
  description: "Soutenez l'atelier artisanal Spoolio pour l'achat de filaments biosourcés et l'entretien de nos imprimantes 3D à Comines.",
  canonicalPath: "/don",
});

export default function DonationPage() {
  return <DonationClient />;
}
