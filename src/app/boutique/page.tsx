import type { Metadata } from "next";
import BoutiqueClient from "./BoutiqueClient";
import { getPageSeoMetadata } from "@/lib/seoPages";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("boutique");
}

export default function BoutiquePage() {
  return <BoutiqueClient />;
}
