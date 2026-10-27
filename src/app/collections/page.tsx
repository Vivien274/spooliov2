import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BUSINESS_CONFIG } from "@/lib/businessConfig";
import { generateBreadcrumbsJsonLd } from "@/lib/jsonLd";
import {
  COLLECTIONS_LIST,
  CollectionIconName,
} from "@/config/navigationConfig";
import { COLLECTION_EDITORIAL_CONFIG } from "@/config/collectionEditorialConfig";
import {
  Moon,
  MousePointerClick,
  Bot,
  Shield,
  Eye,
  Package,
  Ghost,
  Gem,
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS_CONFIG.siteUrl),
  title: "Les Collections Thématiques — Spoolio V2",
  description:
    "Découvrez les 8 collections et capsules exclusives Spoolio : Cabinet noir, Tactile Lab, Gadgetoids, Fantasy Relics et plus encore. Fabriqué en France à Comines.",
  alternates: {
    canonical: `${BUSINESS_CONFIG.siteUrl}/collections`,
  },
  openGraph: {
    title: "Les Collections Thématiques — Spoolio",
    description:
      "Explorez nos séries d'objets sculpturaux, tactiles et décoratifs imprimés en 3D en séries limitées.",
    url: `${BUSINESS_CONFIG.siteUrl}/collections`,
    siteName: BUSINESS_CONFIG.name,
    locale: "fr_FR",
    type: "website",
  },
};

const ICONS_MAP: Record<CollectionIconName, React.ComponentType<{ className?: string }>> = {
  Moon,
  MousePointerClick,
  Bot,
  Shield,
  Eye,
  Package,
  Ghost,
  Gem,
};

export default function CollectionsHubPage() {
  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: "Accueil", url: BUSINESS_CONFIG.siteUrl },
    { name: "Boutique", url: `${BUSINESS_CONFIG.siteUrl}/boutique` },
    { name: "Collections", url: `${BUSINESS_CONFIG.siteUrl}/collections` },
  ]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#121212] font-sans flex flex-col justify-between selection:bg-[#FF5500] selection:text-white">
      {/* JSON-LD Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <Header />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-28 lg:pt-32 pb-16">
        {/* Fil d'Ariane */}
        <nav
          aria-label="Fil d'Ariane"
          className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-6 font-sans select-none"
        >
          <Link href="/" className="hover:text-[#FF5500] transition-colors">
            Accueil
          </Link>
          <span className="text-zinc-300 font-bold">/</span>
          <Link href="/boutique" className="hover:text-[#FF5500] transition-colors">
            Boutique
          </Link>
          <span className="text-zinc-300 font-bold">/</span>
          <span className="text-zinc-900 font-bold">Collections</span>
        </nav>

        {/* En-tête éditorial Collections */}
        <header className="mb-12 border-b border-[#E4E4E0] pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF5500] text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SÉRIES THÉMATIQUES & CAPSULES ATELIER</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] mb-4">
            LES COLLECTIONS SPOOLIO
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base max-w-2xl leading-relaxed">
            Au-delà des 4 univers d&apos;atelier, nos créations se déclinent en séries thématiques transversales : capsules sombres, exploration haptique, robots rétros ou trompe-l&apos;œil matériels.
          </p>
        </header>

        {/* Grille des 8 Collections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-16">
          {COLLECTIONS_LIST.map((col) => {
            const IconComponent = (col.iconName && ICONS_MAP[col.iconName]) || Layers;
            const editorial = COLLECTION_EDITORIAL_CONFIG[col.id];

            return (
              <Link
                key={col.id}
                href={col.href}
                className="group flex flex-col justify-between p-5 rounded-2xl bg-white border border-[#E4E4E0] hover:border-[#FF5500] hover:shadow-lg transition-all duration-200 relative overflow-hidden"
              >
                {/* Accent top banner on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF5500] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-[#FF5500]/10 flex items-center justify-center transition-colors">
                      <IconComponent className="w-5 h-5 text-zinc-700 group-hover:text-[#FF5500] transition-colors" />
                    </div>
                    {col.badge && (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-white">
                        {col.badge}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF5500] block mb-1">
                    {editorial?.tagline || "// SÉRIE ATELIER"}
                  </span>

                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 group-hover:text-[#FF5500] transition-colors mb-2">
                    {col.label}
                  </h2>

                  <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed mb-4">
                    {editorial?.subtitle || col.tagline}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F0EFEA] flex items-center justify-between text-xs font-bold text-zinc-800 group-hover:text-[#FF5500] transition-colors mt-auto">
                  <span>Découvrir la collection</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
