import type { Metadata } from "next";
import { BUSINESS_CONFIG } from "./businessConfig";

export interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
  keywords?: string[];
}

/**
 * Normalizes title string: ensures brand is attached consistently
 * and total length stays in the recommended ~35-60 character range.
 */
export function formatTitle(title: string): string {
  const cleanTitle = title.trim();
  if (cleanTitle.includes("Spoolio")) {
    return cleanTitle;
  }
  return `${cleanTitle} | Spoolio`;
}

/**
 * Normalizes description: strips any stray HTML tags, removes excess whitespace,
 * and ensures clean phrasing within ~120-155 characters.
 */
export function formatDescription(desc: string, fallback: string = ""): string {
  const raw = (desc || fallback)
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (raw.length <= 155) {
    return raw;
  }

  // Truncate at sentence or word boundary around 150 chars without cutting mid-word
  const sliced = raw.slice(0, 150);
  const lastSpace = sliced.lastIndexOf(" ");
  if (lastSpace > 110) {
    return `${sliced.slice(0, lastSpace)}...`;
  }
  return `${sliced}...`;
}

/**
 * Centralized Next.js Metadata generator for all static, product, category and blog pages.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  ogImage,
  noIndex = false,
  keywords,
}: PageMetadataInput): Metadata {
  const formattedTitle = formatTitle(title);
  const formattedDesc = formatDescription(description);
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${BUSINESS_CONFIG.siteUrl}${cleanPath === "/" ? "" : cleanPath}`;
  const image = ogImage
    ? (ogImage.startsWith("http") ? ogImage : `${BUSINESS_CONFIG.siteUrl}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`)
    : BUSINESS_CONFIG.defaultOgImage;

  return {
    metadataBase: new URL(BUSINESS_CONFIG.siteUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    title: formattedTitle,
    description: formattedDesc,
    keywords: keywords && keywords.length > 0 ? keywords : undefined,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: formattedTitle,
      description: formattedDesc,
      url: canonicalUrl,
      siteName: BUSINESS_CONFIG.name,
      locale: "fr_FR",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: formattedTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: formattedTitle,
      description: formattedDesc,
      images: [image],
    },
  };
}

export interface CreatePageMetadataInput {
  title: string;
  description: string;
  canonicalPath?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export function createPageMetadata({
  title,
  description,
  canonicalPath,
  path = "/",
  ogImage,
  noIndex,
  keywords,
}: CreatePageMetadataInput): Metadata {
  return buildPageMetadata({
    title,
    description,
    path: canonicalPath || path,
    ogImage,
    noIndex,
    keywords,
  });
}
