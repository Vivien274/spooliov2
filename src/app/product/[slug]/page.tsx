import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { isPreprodEnv } from "@/lib/env";
import { getProductBySlug, getRelatedProducts } from "@/lib/serverProducts";
import { buildPageMetadata, formatDescription } from "@/lib/seoMetadata";
import JsonLdScript from "@/components/JsonLdScript";
import { getProductJsonLd, getBreadcrumbJsonLd } from "@/lib/jsonLd";
import { BUSINESS_CONFIG } from "@/lib/businessConfig";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "clicker-mecanique-sur-mesure") {
    return buildPageMetadata({
      title: "Créateur de Clicker 3D Sur-Mesure | Spoolio",
      description: "Personnalisez votre clicker mécanique 3D sur-mesure avec vos couleurs, formes, switches et symboles gravés.",
      path: "/createur-cliqueur",
    });
  }

  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produit introuvable | Spoolio",
      robots: { index: false, follow: false },
    };
  }

  const isPreprod = isPreprodEnv();
  if (product.status !== "publish" && !isPreprod) {
    return {
      title: "Produit non disponible | Spoolio",
      robots: { index: false, follow: false },
    };
  }

  const primaryCategory = product.categories?.[0]?.name || "Fidgets & Impression 3D";
  const rawDesc = (product as any).metaDescription || product.short_description || product.description;
  const fallbackDesc = `Découvrez ${product.name} conçu et imprimé en 3D à Comines en PLA végétal biosourcé. Finitions d'atelier soignées et expédition rapide.`;
  const baseDesc = rawDesc || fallbackDesc;
  const prefixedDesc = baseDesc.toLowerCase().includes(product.name.toLowerCase().slice(0, 15))
    ? baseDesc
    : `${product.name} : ${baseDesc}`;
  const cleanDesc = formatDescription(prefixedDesc, fallbackDesc);

  const titleBase = (product as any).metaTitle || product.name;
  const cleanTitle = titleBase.length < 35
    ? `${titleBase} — ${primaryCategory} 3D | Spoolio`
    : `${titleBase} | Spoolio`;

  return buildPageMetadata({
    title: cleanTitle,
    description: cleanDesc,
    path: `/product/${slug}`,
    ogImage: product.images?.[0]?.src,
  });
}

function sanitizeHtmlHeadings(html?: string | null): string {
  if (!html) return "";
  return html.replace(/<h1(\s[^>]*)?>/gi, "<h2$1>").replace(/<\/h1>/gi, "</h2>");
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  // Specific semantic 301 redirects for legacy or modified product slugs
  if (slug === "clicker-mecanique-sur-mesure") {
    redirect("/createur-cliqueur");
  }
  if (slug === "oeuf-de-serpent-dragon" || slug === "oeuf-de-serpent-/-dragon") {
    redirect("/product/oeuf-serpent-dinosaure-petit");
  }
  if (
    slug === "boucles-doreilles-feuilles-ete" ||
    slug.startsWith("boucles-d'oreilles") ||
    slug.includes("feuilles-ete")
  ) {
    redirect("/categorie/bijoux");
  }

  // 1. Verify if user is an authenticated admin
  const cookieStore = await cookies();
  const token = cookieStore.get("spoolio_admin_session")?.value;
  const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";
  const isAdmin = token ? await verifySession(token, secret) : false;
  const isPreprod = isPreprodEnv();
  const canViewDraft = isAdmin || isPreprod;

  // 2. Fetch full product directly on server
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Ensure no embedded <h1> in descriptions compromises the page's unique H1
  if (product.description) {
    product.description = sanitizeHtmlHeadings(product.description);
  }
  if (product.short_description) {
    product.short_description = sanitizeHtmlHeadings(product.short_description);
  }

  // If found and it's a draft, only allowed for admin or preview
  if (product.status !== "publish" && !canViewDraft) {
    notFound();
  }

  const isDraftPreview = product.status !== "publish" && canViewDraft;
  const primaryCategory = product.categories?.[0];

  // 3. Fetch related products for server rendering
  const relatedProducts = await getRelatedProducts(slug, primaryCategory?.id);

  // 4. Fetch real approved reviews for this product to compute verified rating (no fake rating!)
  let realRatingValue: number | undefined = undefined;
  let realReviewCount: number | undefined = undefined;

  try {
    const reviews = await prisma.review.findMany({
      where: {
        productId: product.id,
        approved: true,
      },
      select: { rating: true },
    });

    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      realRatingValue = Number((sum / reviews.length).toFixed(1));
      realReviewCount = reviews.length;
    }
  } catch (err) {
    // Silent fallback: no aggregate rating if reviews cannot be computed
  }

  // 5. Build structured data JSON-LD (Strictly canonical URL on www.spoolio.fr)
  const productLd = getProductJsonLd({
    name: product.name,
    description: formatDescription(
      product.description || product.short_description || "",
      `Découvrez ${product.name} imprimé en 3D avec soin dans notre atelier à Comines.`
    ),
    slug: slug,
    sku: String(product.id),
    price: product.price,
    inStock: product.stock !== 0 && product.stock !== -2,
    category: primaryCategory?.name || "Fidgets & Impression 3D",
    image: product.images?.[0]?.src,
    ratingValue: realRatingValue,
    reviewCount: realReviewCount,
  });

  const breadcrumbItems = [
    { name: "Accueil", url: "/" },
    { name: "Boutique", url: "/boutique" },
  ];

  if (primaryCategory) {
    breadcrumbItems.push({
      name: primaryCategory.name,
      url: `/categorie/${primaryCategory.slug || primaryCategory.name.toLowerCase().replace(/\s+/g, "-")}`,
    });
  }

  breadcrumbItems.push({
    name: product.name,
    url: `/product/${slug}`,
  });

  const breadcrumbLd = getBreadcrumbJsonLd(breadcrumbItems);

  return (
    <>
      <JsonLdScript data={productLd} id={`product-jsonld-${slug}`} />
      <JsonLdScript data={breadcrumbLd} id={`breadcrumb-jsonld-${slug}`} />
      <ProductDetailClient
        slug={slug}
        isDraftPreview={isDraftPreview}
        initialProduct={product}
        initialRelatedProducts={relatedProducts}
      />
    </>
  );
}
