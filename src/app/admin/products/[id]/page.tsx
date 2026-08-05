import type { Metadata } from "next";
import ProductFormClient from "./ProductFormClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ADMIN - Modifier Produit",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProductPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductFormClient productId={id} isNew={id === "new"} />;
}
