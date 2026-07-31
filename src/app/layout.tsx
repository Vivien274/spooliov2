import type { Metadata } from "next";
import Script from "next/script";
import { Antonio, Plus_Jakarta_Sans } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import VisitorTracker from "@/components/VisitorTracker";

// Dynamic imports for secondary interactive components to optimize client JS bundle
const AdminToolbar = dynamic(() => import("@/components/AdminToolbar"));
const CartDrawer = dynamic(() => import("@/components/CartDrawer"));
const CookieBanner = dynamic(() => import("@/components/CookieBanner"));
const NewsletterPopup = dynamic(() => import("@/components/NewsletterPopup"));
const TombolaFloatingBanner = dynamic(() => import("@/components/TombolaFloatingBanner"));

const antonio = Antonio({
  variable: "--font-antonio",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spoolio.fr"),
  title: "Spoolio | Objets funs & Fidgets en Impression 3D Biosourcée",
  description:
    "Découvre Spoolio : objets funs, fidgets sensoriels TDAH et porte-clés NFC personnalisés, fabriqués en France à Comines en plastique biosourcé.",
  keywords: [
    "Spoolio",
    "fidgets TDAH",
    "impression 3D France",
    "porte-clés NFC",
    "plastique biosourcé",
    "objets 3D Comines",
    "fidgets sensoriels",
  ],
  openGraph: {
    title: "Spoolio | Objets funs & Fidgets en Impression 3D Biosourcée",
    description:
      "Découvre Spoolio : objets funs, fidgets sensoriels TDAH et porte-clés NFC personnalisés, fabriqués en France à Comines en plastique biosourcé.",
    url: "https://spoolio.fr",
    siteName: "Spoolio",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
        width: 1200,
        height: 630,
        alt: "Spoolio - Objets funs & Fidgets en Impression 3D Biosourcée",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spoolio | Objets funs & Fidgets en Impression 3D Biosourcée",
    description:
      "Découvre Spoolio : objets funs, fidgets sensoriels TDAH et porte-clés NFC personnalisés, fabriqués en France à Comines en plastique biosourcé.",
    images: ["/images/imported/Spoolio_Kit-Festival-16-scaled.webp"],
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

  return (
    <html
      lang="fr"
      className={`${antonio.variable} ${plusJakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <JsonLdScript data={organizationLd} id="spoolio-organization-jsonld" />
      </head>
      <body className="min-h-full flex flex-col">
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
        <LanguageProvider>
          <CartProvider>
            <VisitorTracker />
            <AdminToolbar />
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
