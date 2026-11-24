import ProductDetailClient from "./ProductDetailClient";
import { notFound, redirect } from "next/navigation";
import { isPreprodEnv } from "@/lib/env";
import { getProductBySlug, getRelatedProducts } from "@/lib/serverProducts";
import { getPackBySlug } from "@/lib/serverPacks";
import { formatDescription } from "@/lib/seoMetadata";
import JsonLdScript from "@/components/JsonLdScript";
import { getProductJsonLd, getBreadcrumbJsonLd } from "@/lib/jsonLd";
import { prisma } from "@/lib/prisma";
import { getAllDrops } from "@/lib/serverDrops";
import { getProductTaxonomy } from "@/services/taxonomyService";

function resolveFallbackBreadcrumbTaxonomy(categoryName?: string) {
  if (!categoryName) return null;
  const lower = categoryName.toLowerCase();
  if (lower.includes("clicker") || lower.includes("cliqueur")) {
    return {
      universe: { name: "Tactile & Focus", slug: "tactile" },
      category: { name: "Clickers", slug: "clickers" },
    };
  }
  if (lower.includes("fidget") || lower.includes("anti-stress") || lower.includes("sensoriel")) {
    return {
      universe: { name: "Tactile & Focus", slug: "tactile" },
      category: { name: "Fidgets", slug: "fidgets" },
    };
  }
  if (lower.includes("mécanisme") || lower.includes("mecanisme") || lower.includes("engrenage")) {
    return {
      universe: { name: "Tactile & Focus", slug: "tactile" },
      category: { name: "Mécanismes", slug: "mecanismes" },
    };
  }
  if (lower.includes("bureau") || lower.includes("support")) {
    return {
      universe: { name: "Objets & Déco", slug: "objets-deco" },
      category: { name: "Bureau", slug: "bureau" },
    };
  }
  if (lower.includes("déco") || lower.includes("deco") || lower.includes("vase") || lower.includes("lampe")) {
    return {
      universe: { name: "Objets & Déco", slug: "objets-deco" },
      category: { name: "Décoration", slug: "decoration" },
    };
  }
  if (lower.includes("jeu") || lower.includes("dés") || lower.includes("tour")) {
    return {
      universe: { name: "Tabletop & Jeux", slug: "tabletop" },
      category: { name: "Accessoires Jeux", slug: "accessoires" },
    };
  }
  if (lower.includes("art toy") || lower.includes("figurine") || lower.includes("créature") || lower.includes("creature")) {
    return {
      universe: { name: "Art Toys & Figurines", slug: "art-toys" },
      category: { name: "Créatures & Curiosités", slug: "creatures-curiosites" },
    };
  }
  return null;
}

function sanitizeHtmlHeadings(html: string): string {
  if (!html) return "";
  return html.replace(/<h1(\s[^>]*)?>/gi, "<h2$1>").replace(/<\/h1>/gi, "</h2>");
}

export async function renderProductDetailPage(slug: string, allowDraftPreview = false) {
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

  const isPreprod = isPreprodEnv();
  const canViewDraft = allowDraftPreview || isPreprod;

  // Fetch full product directly on server (en synchronisant les drops JIT)
  await getAllDrops();
  let product = await getProductBySlug(slug);

  if (!product) {
    const pack = await getPackBySlug(slug);
    if (pack) {
      product = {
        id: -2000 - (pack.displayOrder || 1),
        name: pack.name,
        slug: pack.slug,
        permalink: `/product/${pack.slug}`,
        price: pack.price.toString(),
        regular_price: (pack.totalComponentsValue || pack.price).toString(),
        sale_price: pack.savingsAmount && pack.savingsAmount > 0 ? pack.price.toString() : "",
        on_sale: Boolean(pack.savingsAmount && pack.savingsAmount > 0),
        productType: "pack",
        status: pack.status === "active" ? "publish" : "draft",
        categories: [
          {
            id: 9999,
            name: pack.category === "noel-2026" ? "Noël 2026" : "Coffrets & Packs",
            slug: pack.category,
          },
        ],
        images: [
          { id: 1, src: pack.image, name: pack.name, alt: pack.name },
          ...(pack.gallery || []).map((img, i) => ({
            id: i + 2,
            src: img,
            name: pack.name,
            alt: pack.name,
          })),
        ],
        short_description: pack.shortDescription || pack.tagline || "",
        description: pack.description || "",
        attributes: {
          isPack: true,
          pack: pack,
          template: "pack",
        },
        stock: pack.availableStock ?? 999,
      };
    }
  }

  if (!product) {
    notFound();
  }

  if (product.description) {
    product.description = sanitizeHtmlHeadings(product.description);
  }
  if (product.short_description) {
    product.short_description = sanitizeHtmlHeadings(product.short_description);
  }

  if (product.status !== "publish" && !canViewDraft) {
    notFound();
  }

  const isDraftPreview = product.status !== "publish" && canViewDraft;
  const primaryCategory = product.categories?.[0];
  const relatedProducts = await getRelatedProducts(slug, primaryCategory?.id);

  let realRatingValue: number | undefined = undefined;
  let realReviewCount: number | undefined = undefined;
  let initialReviews: any[] = [];

  try {
    const reviews = await prisma.review.findMany({
      where: {
        productId: product.id,
        approved: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      realRatingValue = Number((sum / reviews.length).toFixed(1));
      realReviewCount = reviews.length;
      initialReviews = reviews.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
  } catch {
    // Silent fallback
  }

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

  const taxonomy = await getProductTaxonomy(product.id).catch(() => null);
  const universe = taxonomy?.universe;
  const category = taxonomy?.category;

  const breadcrumbItems: { name: string; url: string }[] = [
    { name: "Accueil", url: "/" },
    { name: "Boutique", url: "/boutique" },
  ];

  if (universe) {
    breadcrumbItems.push({
      name: universe.name,
      url: `/${universe.slug}`,
    });
    if (category) {
      breadcrumbItems.push({
        name: category.name,
        url: `/${universe.slug}/${category.slug}`,
      });
    }
  } else {
    const fallback = resolveFallbackBreadcrumbTaxonomy(primaryCategory?.name);
    if (fallback) {
      breadcrumbItems.push({
        name: fallback.universe.name,
        url: `/${fallback.universe.slug}`,
      });
      breadcrumbItems.push({
        name: fallback.category.name,
        url: `/${fallback.universe.slug}/${fallback.category.slug}`,
      });
    } else if (primaryCategory) {
      breadcrumbItems.push({
        name: primaryCategory.name,
        url: "/boutique",
      });
    }
  }

  breadcrumbItems.push({
    name: product.name,
    url: `/product/${slug}`,
  });

  const breadcrumbLd = getBreadcrumbJsonLd(breadcrumbItems);

  let initialUnavailableColors: string[] = [];
  try {
    const unavailColors = await prisma.color.findMany({
      where: { isAvailable: false },
      select: { name: true },
    });
    initialUnavailableColors = unavailColors.map((c: { name: string }) => c.name);
  } catch {
    initialUnavailableColors = [];
  }

  return (
    <>
      <JsonLdScript data={productLd} id={`product-jsonld-${slug}`} />
      <JsonLdScript data={breadcrumbLd} id={`breadcrumb-jsonld-${slug}`} />
      <ProductDetailClient
        slug={slug}
        isDraftPreview={isDraftPreview}
        initialProduct={product}
        initialRelatedProducts={relatedProducts}
        initialReviews={initialReviews}
        breadcrumbItems={breadcrumbItems}
        initialUnavailableColors={initialUnavailableColors}
      />
    </>
  );
}
