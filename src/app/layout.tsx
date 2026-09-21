import type { Metadata } from "next";
import Script from "next/script";
import { Antonio, Plus_Jakarta_Sans, DynaPuff, Righteous, Outfit, Permanent_Marker, Sedgwick_Ave_Display } from "next/font/google";
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
const SpoolioBotMascot = dynamic(() => import("@/components/SpoolioBotMascot"));

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

const dynapuff = DynaPuff({
  variable: "--font-dynapuff",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const righteous = Righteous({
  variable: "--font-righteous",
  subsets: ["latin"],
  weight: ["400"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-permanent-marker",
  subsets: ["latin"],
  weight: ["400"],
});

const sedgwickAve = Sedgwick_Ave_Display({
  variable: "--font-sedgwick",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spoolio.fr"),
  alternates: {
    canonical: "https://spoolio.fr",
  },
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
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html
      lang="fr"
      className={`${antonio.variable} ${plusJakarta.variable} ${dynapuff.variable} ${righteous.variable} ${outfit.variable} ${permanentMarker.variable} ${sedgwickAve.variable} light h-full antialiased bg-white text-zinc-900`}
      suppressHydrationWarning
    >
      <head>
        <JsonLdScript data={organizationLd} id="spoolio-organization-jsonld" />
        <script
          id="theme-initializer"
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
      </head>
      <body className="min-h-full flex flex-col bg-white text-zinc-900 selection:bg-[#ff4f00] selection:text-white">
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <LanguageProvider>
          <CartProvider>
            <VisitorTracker />
            <CartDrawer />
            <CookieBanner />
            <NewsletterPopup />
            <TombolaFloatingBanner />
            <SpoolioBotMascot />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
