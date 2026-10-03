import type { Metadata } from "next";
import SuiviClient from "./SuiviClient";
import { getPageSeoMetadata } from "@/lib/seoPages";

export async function generateMetadata(): Promise<Metadata> {
  const baseMeta = await getPageSeoMetadata("suivi");
  return {
    ...baseMeta,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function SuiviPage() {
  return <SuiviClient />;
}
