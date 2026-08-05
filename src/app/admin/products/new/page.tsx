import type { Metadata } from "next";
import ProductFormClient from "../[id]/ProductFormClient";

export const metadata: Metadata = {
  title: "ADMIN - Nouveau Produit",
};

export default function NewProductPage() {
  return <ProductFormClient productId="new" isNew={true} />;
}
