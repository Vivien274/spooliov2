import fs from "fs";
import path from "path";
import { Metadata } from "next";
import { PageSeoConfig, DEFAULT_PAGES_SEO } from "./seoPagesTypes";
import { buildPageMetadata } from "./seoMetadata";

export { DEFAULT_PAGES_SEO };
export type { PageSeoConfig };

export function getAllPagesSeoConfig(): Record<string, PageSeoConfig> {
  const filePath = path.join(process.cwd(), "src/data/pages-seo.json");
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(data);
      return { ...DEFAULT_PAGES_SEO, ...parsed };
    }
  } catch (e) {
    console.warn("Could not read pages-seo.json, fallback to defaults");
  }
  return DEFAULT_PAGES_SEO;
}

export function getPageSeoMetadata(pageKey: string): Metadata {
  const allConfigs = getAllPagesSeoConfig();
  const config = allConfigs[pageKey] || DEFAULT_PAGES_SEO[pageKey] || {
    title: "Spoolio | Impression 3D & Fidgets Sensoriels",
    description: "Créations 3D et fidgets sensoriels fabriqués en France à Comines en polymère biosourcé.",
  };

  const path = pageKey === "home" ? "/" : `/${pageKey}`;
  const keywords = config.keywords
    ? config.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : undefined;

  return buildPageMetadata({
    title: config.title,
    description: config.description,
    path,
    ogImage: config.ogImage,
    noIndex: config.noIndex,
    keywords,
  });
}
