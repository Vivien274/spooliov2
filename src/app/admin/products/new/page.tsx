import type { Metadata } from "next";
import ProductFormClient from "../[id]/ProductFormClient";

export const metadata: Metadata = {
  title: "Produit - Nouveau",
};

export default function NewProductPage() {
  return <ProductFormClient productId="new" isNew={true} />;
}
