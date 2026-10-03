import { BUSINESS_CONFIG } from "./businessConfig";

export interface ProductLdData {
  name: string;
  description: string;
  image?: string;
  sku?: string;
  slug: string;
  pageUrl?: string;
  offerUrl?: string;
  price?: string | number;
  inStock?: boolean;
  ratingValue?: number;
  reviewCount?: number;
  category?: string;
}

export function getOrganizationJsonLd() {
  const domain = BUSINESS_CONFIG.siteUrl;
  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "Store"],
    "@id": `${domain}/#organization`,
    "name": BUSINESS_CONFIG.name,
    "legalName": BUSINESS_CONFIG.legalName,
    "url": domain,
    "logo": `${domain}/images/imported/Spoolio_Kit-Festival-16-scaled.webp`,
    "image": `${domain}/images/imported/Spoolio_Kit-Festival-16-scaled.webp`,
    "description": "Atelier artisanal de fabrication de fidgets sensoriels, accessoires et objets imprimés en 3D à Comines (Nord).",
    "telephone": BUSINESS_CONFIG.phone,
    "email": BUSINESS_CONFIG.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": BUSINESS_CONFIG.address,
      "addressLocality": BUSINESS_CONFIG.city,
      "postalCode": BUSINESS_CONFIG.postalCode,
      "addressCountry": BUSINESS_CONFIG.countryCode,
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": BUSINESS_CONFIG.geo.latitude,
      "longitude": BUSINESS_CONFIG.geo.longitude,
    },
    "priceRange": "€",
    "sameAs": [
      BUSINESS_CONFIG.socials.tiktok,
      BUSINESS_CONFIG.socials.instagram,
      BUSINESS_CONFIG.socials.facebook,
    ],
  };

  // N'émettre les horaires QUE si explicitement confirmés par l'artisan
  if (BUSINESS_CONFIG.openingHoursConfirmed && BUSINESS_CONFIG.openingHoursSpecification.length > 0) {
    org.openingHoursSpecification = BUSINESS_CONFIG.openingHoursSpecification.map((oh) => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": oh.dayOfWeek,
      "opens": oh.opens,
      "closes": oh.closes,
    }));
  }

  return org;
}

export function getProductJsonLd(data: ProductLdData) {
  const domain = BUSINESS_CONFIG.siteUrl;
  const canonicalPageUrl = data.pageUrl
    ? (data.pageUrl.startsWith("http") ? data.pageUrl : `${domain}${data.pageUrl.startsWith('/') ? '' : '/'}${data.pageUrl}`)
    : `${domain}/product/${data.slug}`;

  const offerUrl = data.offerUrl
    ? (data.offerUrl.startsWith("http") ? data.offerUrl : `${domain}${data.offerUrl.startsWith('/') ? '' : '/'}${data.offerUrl}`)
    : canonicalPageUrl;

  const imageUrl = data.image
    ? (data.image.startsWith("http") ? data.image : `${domain}${data.image.startsWith('/') ? '' : '/'}${data.image}`)
    : `${domain}/images/imported/Spoolio_Kit-Festival-16-scaled.webp`;

  const rawNumeric = typeof data.price === "number"
    ? data.price
    : (data.price ? parseFloat(String(data.price).replace("€", "").trim()) : NaN);

  const hasValidPrice = !isNaN(rawNumeric) && rawNumeric > 0;

  const availability = data.inStock === false
    ? "https://schema.org/OutOfStock"
    : "https://schema.org/InStock";

  const productObj: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": data.name,
    "url": canonicalPageUrl,
    "image": [imageUrl],
    "description": data.description,
    "sku": data.sku || data.slug,
    "mpn": data.sku || data.slug,
    "brand": {
      "@type": "Brand",
      "name": "Spoolio",
    },
    "category": data.category || "Fidgets & Impression 3D",
  };

  // Ne jamais inventer de prix : n'ajouter "offers" que si un prix réel positif existe
  if (hasValidPrice) {
    productObj.offers = {
      "@type": "Offer",
      "url": offerUrl,
      "priceCurrency": "EUR",
      "price": rawNumeric.toFixed(2),
      "availability": availability,
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "Spoolio",
      },
    };
  }

  // NOTE SEO : N'ajouter AggregateRating QUE si des avis réels vérifiés existent pour ce produit précis.
  // La note globale 4.9/5 sur 48 avis n'est plus injectée artificiellement.
  if (
    typeof data.ratingValue === "number" &&
    data.ratingValue > 0 &&
    typeof data.reviewCount === "number" &&
    data.reviewCount > 0
  ) {
    productObj.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": data.ratingValue.toFixed(1),
      "reviewCount": data.reviewCount,
      "bestRating": "5",
      "worstRating": "1",
    };
  }

  return productObj;
}

export function getFaqJsonLd(faqSections: Array<{ title: string; items: Array<{ q: string; a: string }> }>) {
  const mainEntity: Array<Record<string, unknown>> = [];

  for (const section of faqSections) {
    for (const item of section.items) {
      if (item.q && item.a) {
        mainEntity.push({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.a,
          },
        });
      }
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": mainEntity,
  };
}

export function getBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  const domain = BUSINESS_CONFIG.siteUrl;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${domain}${item.url.startsWith('/') ? '' : '/'}${item.url}`,
    })),
  };
}

export const generateBreadcrumbsJsonLd = getBreadcrumbJsonLd;

export function getBlogPostingJsonLd(data: {
  title: string;
  description: string;
  slug: string;
  datePublished?: string;
  image?: string;
}) {
  const domain = BUSINESS_CONFIG.siteUrl;
  const postUrl = `${domain}/blog/${data.slug}`;
  const imageUrl = data.image
    ? (data.image.startsWith("http") ? data.image : `${domain}${data.image.startsWith('/') ? '' : '/'}${data.image}`)
    : `${domain}/images/imported/Spoolio_Kit-Festival-16-scaled.webp`;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": data.title,
    "description": data.description,
    "url": postUrl,
    "image": [imageUrl],
    "author": {
      "@type": "Organization",
      "name": "Spoolio",
      "url": domain,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Spoolio",
      "logo": {
        "@type": "ImageObject",
        "url": `${domain}/images/imported/Spoolio_Kit-Festival-16-scaled.webp`,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postUrl,
    },
  };

  // Ne jamais inventer une date courante (new Date()) : n'émettre datePublished que si une date réelle vérifiable existe
  if (data.datePublished && typeof data.datePublished === "string" && data.datePublished.trim() !== "") {
    schema.datePublished = data.datePublished;
  }

  return schema;
}
