import type { Metadata } from "next";
import CalendrierAventClient from "./CalendrierAventClient";
import { getPageSeoMetadata } from "@/lib/seoPages";
import { getAdventDataAction } from "@/app/actions/aventActions";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("calendrier-avent");
}

export default async function CalendrierAventPage() {
  let initialData = null;
  try {
    initialData = await getAdventDataAction();
  } catch (e) {
    console.warn("Could not load initial advent data on server:", e);
  }
  return <CalendrierAventClient initialData={initialData} />;
}
