import type { Metadata } from "next";
import CarteCadeauClient from "./CarteCadeauClient";
import { getPageSeoMetadata } from "@/lib/seoPages";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("carte-cadeau");
}

export default async function CarteCadeauPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; code?: string; amount?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  return <CarteCadeauClient initialSearchParams={resolvedParams} />;
}
