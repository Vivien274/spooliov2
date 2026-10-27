import type { Metadata } from "next";
import TaxonomyAdminClient from "./TaxonomyAdminClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Taxonomie V2.1 — Spoolio Manager",
  description: "Gestion centralisée des Univers, Catégories, Collections et Tags Spoolio V2.1",
};

export default function AdminTaxonomyPage() {
  return <TaxonomyAdminClient />;
}
