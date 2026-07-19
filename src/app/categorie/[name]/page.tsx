import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import fs from "fs";
import path from "path";

interface Props {
  params: Promise<{ name: string }>;
}

function decodeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&nbsp;/g, " ");
}

function mapProduct(p: any) {
  const rawImages = p.images || [];
  const images = rawImages.map((img: any, idx: number) => ({
    id: img.id || idx,
    src: img.src || img.sourceUrl || img.source_url || "/images/figma_keychains.jpg",
    name: decodeHtml(img.name || p.name),
    alt: img.alt || p.name
  }));

  return {
    id: p.id,
    name: decodeHtml(p.name),
    slug: p.slug,
    permalink: p.permalink,
    price: p.price || "4.00",
    regular_price: p.regularPrice || p.regular_price || p.price || "4.00",
    sale_price: p.salePrice || p.sale_price || "",
    on_sale: !!(p.onSale || p.on_sale),
    categories: (p.categories || []).map((c: any) => ({
      ...c,
      name: decodeHtml(c.name || "")
    })),
    images: images.length > 0 ? images : [{ id: 1, src: "/images/figma_keychains.jpg", name: decodeHtml(p.name), alt: p.name }],
    short_description: p.shortDescription || p.short_description || "",
    description: p.description || "",
    date_created: p.dateCreated ? new Date(p.dateCreated).toISOString() : (p.date_created ? new Date(p.date_created).toISOString() : undefined),
    attributes: p.attributes ? (typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes) : []
  };
}

async function getCategoryProducts(categoryName: string) {
  // 1. Try Prisma DB first
  try {
    const dbProducts = await prisma.product.findMany({
      where: {
        categories: {
          some: {
            name: {
              equals: categoryName,
            }
          }
        },
        status: "publish"
      },
      include: {
        images: true,
        categories: true,
      },
      orderBy: {
        dateCreated: "desc",
      }
    });

    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map(mapProduct);
    }
  } catch (err: any) {
    console.error("Prisma error fetching category products:", err.message);
  }

  // 2. Try JSON file fallback
  try {
    const jsonPath = path.join(process.cwd(), "src/data/products.json");
    if (fs.existsSync(jsonPath)) {
      const fileData = fs.readFileSync(jsonPath, "utf8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter(p =>
          p.status === "publish" &&
          p.categories?.some((c: any) => c.name?.toLowerCase() === categoryName.toLowerCase())
        );
        return filtered.map(mapProduct);
      }
    }
  } catch (err: any) {
    console.error("JSON fallback error for category products:", err.message);
  }

  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  return {
    title: `${decodedName} — Boutique Spoolio`,
    description: `Découvrez tous nos produits imprimés 3D de la catégorie ${decodedName} chez Spoolio.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const products = await getCategoryProducts(decodedName);

  return (
    <div className="min-h-screen bg-spoolio-bg text-white font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-black">
      {/* Sticky Header with Glassmorphism */}
      <div className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-md border-b border-[#1f1f23]">
        <Header className="h-24 flex items-center justify-between px-6 max-w-[1200px] mx-auto w-full" />
      </div>

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-8 select-none">
          <Link href="/" className="hover:text-white transition-colors duration-200">
            Accueil
          </Link>
          <span className="text-gray-700 font-bold">/</span>
          <Link href="/boutique" className="hover:text-white transition-colors duration-200">
            Boutique
          </Link>
          <span className="text-gray-700 font-bold">/</span>
          <span className="text-white font-black">{decodedName}</span>
        </nav>

        {/* Category Header */}
        <div className="relative rounded-3xl overflow-hidden mb-12 p-8 md:p-12 bg-gradient-to-br from-[#1e1b4b]/80 via-[#0f172a]/90 to-black border border-[#1f1f29] shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="text-[#2F3CD9] text-xs font-bold uppercase tracking-widest block mb-2">Catégorie</span>
            <h1 className="text-4xl sm:text-5xl font-black font-antonio tracking-tight uppercase text-white mb-4">
              {decodedName}
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Explorez notre sélection unique d'objets et d'accessoires imprimés en 3D localement, conçus en PLA biosourcé.
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-black/20 rounded-3xl border border-[#1f1f29] px-6">
            <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-bold text-white mb-2">Aucun produit dans cette catégorie</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-md">
              Il n'y a pas encore de produits disponibles pour la catégorie « {decodedName} ».
            </p>
            <Link 
              href="/boutique" 
              className="px-6 py-3 bg-[#2F3CD9] hover:bg-[#2432c0] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#2F3CD9]/20"
            >
              Retourner à la boutique
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
