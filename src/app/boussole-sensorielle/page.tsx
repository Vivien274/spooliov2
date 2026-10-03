import type { Metadata } from "next";
import BoussoleSensorielleClient from "./BoussoleSensorielleClient";
import { getPageSeoMetadata } from "@/lib/seoPages";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("boussole-sensorielle");
}

export default function BoussoleSensoriellePage() {
  return <BoussoleSensorielleClient />;
}
