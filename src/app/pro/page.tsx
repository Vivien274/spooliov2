import type { Metadata } from "next";
import ProClient from "./ProClient";
import { getPageSeoMetadata } from "@/lib/seoPages";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("pro");
}

export default function ProPage() {
  return <ProClient />;
}
