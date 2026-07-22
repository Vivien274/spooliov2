import type { Metadata } from "next";
import { Antonio, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AdminToolbar from "@/components/AdminToolbar";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import VisitorTracker from "@/components/VisitorTracker";
import CookieBanner from "@/components/CookieBanner";
import NewsletterPopup from "@/components/NewsletterPopup";

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
  title: "Spoolio | Boutique d'Objets Fun Imprimés en 3D",
  description: "Découvrez notre collection exclusive de fidgets, supports et objets insolites imprimés en 3D de haute qualité.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${antonio.variable} ${plusJakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <VisitorTracker />
          <AdminToolbar />
          <CartDrawer />
          <CookieBanner />
          <NewsletterPopup />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
