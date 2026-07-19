import type { Metadata } from "next";
import ProductFormClient from "../[id]/ProductFormClient";

export const metadata: Metadata = {
  title: "Nouveau produit — Admin | Spoolio",
};

export default function NewProductPage() {
  return <ProductFormClient product={null} isNew={true} />;
}
