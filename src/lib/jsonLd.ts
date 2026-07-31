export interface ProductLdData {
  name: string;
  description: string;
  image?: string;
  sku?: string;
  slug: string;
  price?: string | number;
  ratingValue?: number;
  reviewCount?: number;
  category?: string;
}

export function getOrganizationJsonLd() {
  const domain = "https://spoolio.fr";
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "Store"],
    "@id": `${domain}/#organization`,
    "name": "Spoolio",
    "legalName": "Spoolio",
    "url": domain,
    "logo": `${domain}/images/imported/Spoolio_Kit-Festival-16-scaled.webp`,
    "image": `${domain}/images/imported/Spoolio_Kit-Festival-16-scaled.webp`,
    "description": "Atelier de fabrication d'objets sensoriels TDAH, fidgets et créations 3D en PLA biodégradable à Comines (59).",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Comines",
      "postalCode": "59560",
      "addressCountry": "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 50.7333,
      "longitude": 3.0000
    },
    "priceRange": "€",
    "sameAs": [
      "https://www.tiktok.com/@spoolio.fr",
      "https://www.instagram.com/spoolio.fr/",
      "https://www.facebook.com/spoolio.fr"
    ]
  };
}

export function getProductJsonLd(data: ProductLdData) {
  const domain = "https://spoolio.fr";
  const productUrl = `${domain}/product/${data.slug}`;
  const imageUrl = data.image 
    ? (data.image.startsWith("http") ? data.image : `${domain}${data.image}`)
    : `${domain}/images/imported/Spoolio_Kit-Festival-16-scaled.webp`;

  const numericPrice = typeof data.price === "number" 
    ? data.price 
    : (data.price ? parseFloat(String(data.price).replace("€", "").trim()) : 5.00);

  const ratingVal = data.ratingValue || 4.9;
  const ratingCount = data.reviewCount || 48;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": data.name,
    "image": [imageUrl],
    "description": data.description,
    "sku": data.sku || data.slug,
    "mpn": data.slug,
    "brand": {
      "@type": "Brand",
      "name": "Spoolio"
    },
    "category": data.category || "Fidgets & Impression 3D",
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "EUR",
      "price": (isNaN(numericPrice) ? 5.00 : numericPrice).toFixed(2),
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "Spoolio"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingVal.toFixed(1),
      "reviewCount": ratingCount,
      "bestRating": "5",
      "worstRating": "1"
    }
  };
}

export function getFaqJsonLd(faqSections: Array<{ title: string; items: Array<{ q: string; a: string }> }>) {
  const mainEntity: any[] = [];
  
  for (const section of faqSections) {
    for (const item of section.items) {
      if (item.q && item.a) {
        mainEntity.push({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.a
          }
        });
      }
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": mainEntity
  };
}

export function getBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  const domain = "https://spoolio.fr";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${domain}${item.url}`
    }))
  };
}
