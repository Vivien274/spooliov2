import type { Metadata } from "next";
import Script from "next/script";
import { Antonio, Plus_Jakarta_Sans, DynaPuff, Righteous, Outfit, Permanent_Marker, Be_Vietnam_Pro } from "next/font/google";
import dynamic from "next/dynamic";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import VisitorTracker from "@/components/VisitorTracker";

// Dynamic imports for secondary interactive components to optimize client JS bundle
const CartDrawer = dynamic(() => import("@/components/CartDrawer"));
const CookieBanner = dynamic(() => import("@/components/CookieBanner"));
const NewsletterPopup = dynamic(() => import("@/components/NewsletterPopup"));
const TombolaFloatingBanner = dynamic(() => import("@/components/TombolaFloatingBanner"));
import AdminToolbarLoader from "@/components/AdminToolbarLoader";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const antonio = Antonio({
  variable: "--font-antonio",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const dynapuff = DynaPuff({
  variable: "--font-dynapuff",
  subsets: ["latin"],
});

const righteous = Righteous({
  variable: "--font-righteous",
  subsets: ["latin"],
  weight: ["400"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-permanent-marker",
  subsets: ["latin"],
  weight: ["400"],
});

import { BUSINESS_CONFIG } from "@/lib/businessConfig";

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS_CONFIG.siteUrl),
  alternates: {
    canonical: BUSINESS_CONFIG.siteUrl,
  },
  title: "Fidgets Sensoriels & Objets 3D Biosourcés | Spoolio",
  description:
    "Boutique française de fidgets sensoriels, accessoires et objets imprimés en 3D à Comines en PLA biosourcé. Fabrication artisanale à la commande.",
  keywords: [
    "Spoolio",
    "fidgets sensoriels",
    "impression 3D France",
    "porte-clés personnalisés",
    "PLA biosourcé",
    "objets 3D Comines",
    "atelier impression 3D",
  ],
  openGraph: {
    title: "Fidgets Sensoriels & Objets 3D Biosourcés | Spoolio",
    description:
      "Boutique française de fidgets sensoriels, accessoires et objets imprimés en 3D à Comines en PLA biosourcé. Fabrication artisanale à la commande.",
    url: BUSINESS_CONFIG.siteUrl,
    siteName: "Spoolio",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: `${BUSINESS_CONFIG.siteUrl}/images/imported/Spoolio_Kit-Festival-16-scaled.webp`,
        width: 1200,
        height: 630,
        alt: "Spoolio - Fidgets Sensoriels & Objets 3D Biosourcés",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fidgets Sensoriels & Objets 3D Biosourcés | Spoolio",
    description:
      "Boutique française de fidgets sensoriels, accessoires et objets imprimés en 3D à Comines en PLA biosourcé. Fabrication artisanale à la commande.",
    images: [`${BUSINESS_CONFIG.siteUrl}/images/imported/Spoolio_Kit-Festival-16-scaled.webp`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import JsonLdScript from "@/components/JsonLdScript";
import { getOrganizationJsonLd } from "@/lib/jsonLd";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationLd = getOrganizationJsonLd();
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html
      lang="fr"
      className={`${antonio.variable} ${plusJakarta.variable} ${dynapuff.variable} ${righteous.variable} ${outfit.variable} ${permanentMarker.variable} ${beVietnamPro.variable} light h-full antialiased bg-white text-zinc-900`}
      suppressHydrationWarning
    >
      <head>
        <JsonLdScript data={organizationLd} id="spoolio-organization-jsonld" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-zinc-900 selection:bg-[#ff4f00] selection:text-white">
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                  if (localStorage.getItem('theme') === 'dark') {
                    localStorage.setItem('theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <LanguageProvider>
          <CartProvider>
            <VisitorTracker />
            <AdminToolbarLoader />
            <CartDrawer />
            <CookieBanner />
            <NewsletterPopup />
            <TombolaFloatingBanner />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
