import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import {
  Plus_Jakarta_Sans,
  DynaPuff,
  Righteous,
  Outfit,
  Permanent_Marker,
  Be_Vietnam_Pro,
  Bebas_Neue,
  Space_Grotesk,
  Fredoka,
  Cinzel,
  Syne,
  Bungee,
  Pacifico,
  Archivo_Black,
  Press_Start_2P,
} from "next/font/google";
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
import NavigationProgressBar from "@/components/NavigationProgressBar";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const antonio = localFont({
  src: "../fonts/Antonio-VariableFont_wght.woff2",
  variable: "--font-antonio",
  display: "swap",
  weight: "100 900",
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

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: ["400"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: ["400"],
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: ["400"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: ["400"],
});

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
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
      className={`${antonio.variable} ${plusJakarta.variable} ${dynapuff.variable} ${righteous.variable} ${outfit.variable} ${permanentMarker.variable} ${beVietnamPro.variable} ${bebasNeue.variable} ${spaceGrotesk.variable} ${fredoka.variable} ${cinzel.variable} ${syne.variable} ${bungee.variable} ${pacifico.variable} ${archivoBlack.variable} ${pressStart.variable} light h-full antialiased bg-white text-zinc-900`}
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
        <NavigationProgressBar />
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
