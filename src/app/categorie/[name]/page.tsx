import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getCategoryProducts } from "@/lib/serverProducts";
import { findCategoryConfig, CATEGORIES_CONFIG } from "@/lib/categoryConfig";
import { BUSINESS_CONFIG } from "@/lib/businessConfig";
import { generateBreadcrumbsJsonLd } from "@/lib/jsonLd";
import { ArrowRight, CheckCircle2, Compass, ShieldCheck } from "lucide-react";

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name).trim();
  const config = findCategoryConfig(decodedName);

  const title = config?.metaTitle || `${decodedName} — Créations 3D | Spoolio`;
  const description =
    config?.metaDescription ||
    `Découvrez notre sélection de créations 3D éco-responsables dans la catégorie ${decodedName}. Fabriqué en France à Comines chez Spoolio.`;
  const canonicalUrl = `${BUSINESS_CONFIG.siteUrl}/categorie/${config?.slug || decodedName.toLowerCase()}`;

  return {
    metadataBase: new URL(BUSINESS_CONFIG.siteUrl),
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: BUSINESS_CONFIG.name,
      locale: "fr_FR",
      type: "website",
      images: [
        {
          url: `${BUSINESS_CONFIG.siteUrl}/images/og-spoolio.jpg`,
          width: 1200,
          height: 630,
          alt: `${config?.name || decodedName} chez Spoolio`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BUSINESS_CONFIG.siteUrl}/images/og-spoolio.jpg`],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name).trim();
  const config = findCategoryConfig(decodedName);

  // If canonical clean slug differs from param, redirect 301 to avoid duplicate content
  if (config && name !== config.slug) {
    permanentRedirect(`/categorie/${config.slug}`);
  }

  const products = await getCategoryProducts(config?.slug || decodedName);

  // If no products and no config found, return a true 404
  if (products.length === 0 && !config) {
    notFound();
  }

  const displayName = config?.name || decodedName;
  const pageH1 = config?.h1 || `${displayName} imprimés en 3D en France`;
  const canonicalUrl = `${BUSINESS_CONFIG.siteUrl}/categorie/${config?.slug || decodedName.toLowerCase()}`;

  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: "Accueil", url: BUSINESS_CONFIG.siteUrl },
    { name: "Boutique", url: `${BUSINESS_CONFIG.siteUrl}/boutique` },
    { name: displayName, url: canonicalUrl },
  ]);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-900 font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-white">
      {/* JSON-LD Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <Header />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-28 lg:pt-32 pb-16">
        {/* Breadcrumb navigation */}
        <nav
          aria-label="Fil d'Ariane"
          className="flex items-center gap-2 text-xs font-semibold text-zinc-500 mb-6 font-sans select-none"
        >
          <Link href="/" className="hover:text-zinc-950 transition-colors">
            Accueil
          </Link>
          <span className="text-zinc-300 font-bold">/</span>
          <Link href="/boutique" className="hover:text-zinc-950 transition-colors">
            Boutique
          </Link>
          <span className="text-zinc-300 font-bold">/</span>
          <span className="text-zinc-950 font-black">{displayName}</span>
        </nav>

        {/* Category Header */}
        <header className="mb-10 text-left border-b border-zinc-200/80 pb-8">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ff4f00] mb-2 block">
            Catégorie • Fabrication Locale
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 mb-4">
            {pageH1}
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base max-w-3xl leading-relaxed">
            {config?.intro ||
              `Découvrez notre sélection exclusive d'objets imprimés en 3D dans notre atelier à Comines (59). Conçus en PLA végétal biosourcé, chaque pièce allie qualité, durabilité et éco-responsabilité.`}
          </p>

          {/* Reassurance pills */}
          <div className="flex flex-wrap items-center gap-4 mt-6 text-xs font-medium text-zinc-600">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Fabrication à Comines (Nord)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              PLA Biosourcé (Amidon de maïs)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Zéro Stock Mort • À la commande
            </span>
          </div>
        </header>

        {/* Products Grid */}
        <section aria-label={`Produits de la catégorie ${displayName}`} className="mb-16">
          <div className="text-xs text-zinc-500 mb-6 font-semibold">
            {products.length} création{products.length > 1 ? "s" : ""} disponible{products.length > 1 ? "s" : ""}
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div key={product.id} className="h-full">
                  <ProductCard product={product} priority={index < 4} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-zinc-200/90 px-6">
              <span className="text-4xl mb-3">📦</span>
              <h2 className="text-lg font-bold text-zinc-950 mb-2">Bientôt de nouveaux modèles</h2>
              <p className="text-sm text-zinc-600 mb-6 max-w-md">
                Nos artisans conçoivent actuellement de nouvelles créations pour la catégorie {displayName}.
              </p>
              <Link
                href="/boutique"
                className="px-5 py-2.5 bg-[#ff4f00] hover:bg-[#e04500] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                Explorer toute la boutique
              </Link>
            </div>
          )}
        </section>

        {/* Choice Criteria */}
        {config?.choiceCriteria && config.choiceCriteria.length > 0 && (
          <section className="mb-14 bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-950 mb-6 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#ff4f00]" />
              Comment bien choisir vos {displayName.toLowerCase()} ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {config.choiceCriteria.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70">
                  <h3 className="font-bold text-sm text-zinc-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Spoolio Advantages */}
        {config?.spoolioAdvantages && config.spoolioAdvantages.length > 0 && (
          <section className="mb-14 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-black mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#ff4f00]" />
              Les garanties de l'atelier Spoolio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {config.spoolioAdvantages.map((adv, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="font-bold text-sm text-white mb-2">{adv.title}</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">{adv.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Editorial / Internal Links */}
        {config?.editorialLinks && config.editorialLinks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-zinc-950 mb-4">À découvrir aussi chez Spoolio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {config.editorialLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="group p-4 bg-white border border-zinc-200/90 hover:border-[#ff4f00] rounded-xl transition-all shadow-2xs hover:shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-zinc-900 group-hover:text-[#ff4f00] transition-colors">
                      {link.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 group-hover:text-[#ff4f00] transition-all" />
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-snug">{link.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
