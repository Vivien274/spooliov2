import fs from "fs";
import path from "path";
import { Metadata } from "next";
import { PageSeoConfig, DEFAULT_PAGES_SEO } from "./seoPagesTypes";

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
    description: "Créations 3D et fidgets sensoriels fabriqués en France."
  };

  const domain = "https://spoolio.fr";
  const ogImg = config.ogImage 
    ? (config.ogImage.startsWith("http") ? config.ogImage : `${domain}${config.ogImage}`)
    : `${domain}/images/imported/Spoolio_Kit-Festival-16-scaled.webp`;

  const canonicalUrl = pageKey === 'home' ? domain : `${domain}/${pageKey}`;

  return {
    metadataBase: new URL(domain),
    alternates: {
      canonical: canonicalUrl,
    },
    title: config.title,
    description: config.description,
    keywords: config.keywords ? config.keywords.split(",").map(k => k.trim()) : undefined,
    robots: config.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: config.title,
      description: config.description,
      url: canonicalUrl,
      siteName: "Spoolio",
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: config.title,
        }
      ],
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: [ogImg],
    }
  };
}
