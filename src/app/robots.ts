import { MetadataRoute } from "next";
import { BUSINESS_CONFIG } from "@/lib/businessConfig";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = BUSINESS_CONFIG.siteUrl;

  const privatePaths = [
    "/admin",
    "/admin/*",
    "/api/*",
    "/suivi",
    "/suivi/*",
    "/panier",
    "/success",
    "/badges/*",
    "/sos/*",
    "/loyalty/*",
  ];

  const aiBots = [
    "GPTBot",
    "ChatGPT-User",
    "PerplexityBot",
    "ClaudeBot",
    "Claude-Web",
    "Google-Extended",
    "Applebot-Extended",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
      ...aiBots.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: privatePaths,
      })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
