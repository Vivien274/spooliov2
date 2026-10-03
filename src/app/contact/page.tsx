import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { getPageSeoMetadata } from "@/lib/seoPages";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("contact");
}

export default function ContactPage() {
  return <ContactClient />;
}
