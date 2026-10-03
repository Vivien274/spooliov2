import type { Metadata } from "next";
import RetoursClient from "./RetoursClient";
import { getPageSeoMetadata } from "@/lib/seoPages";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("retours");
}

export default function RetoursPage() {
  return <RetoursClient />;
}
