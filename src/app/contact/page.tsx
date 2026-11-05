import type { Metadata } from "next";
import { Suspense } from "react";
import ContactClient from "./ContactClient";
import { getPageSeoMetadata } from "@/lib/seoPages";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("contact");
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafaf9]" />}>
      <ContactClient />
    </Suspense>
  );
}
