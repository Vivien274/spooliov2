import type { Metadata } from "next";
import FideliteClient from "./FideliteClient";
import { getPageSeoMetadata } from "@/lib/seoPages";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("fidelite");
}

export default function FidelitePage() {
  return <FideliteClient />;
}
