import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLdScript from "@/components/JsonLdScript";
import { getBlogPostingJsonLd, generateBreadcrumbsJsonLd } from "@/lib/jsonLd";
import { BUSINESS_CONFIG } from "@/lib/businessConfig";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
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

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) {
    return {
      title: "Article introuvable | Spoolio",
    };
  }

  const cleanTitle = decodeHtml(post.title);
  const rawExcerpt = (post.excerpt || post.content || "").replace(/<[^>]*>/g, "").trim();
  const cleanExcerpt =
    rawExcerpt.length > 155 ? `${rawExcerpt.substring(0, 152).trim()}...` : rawExcerpt;
  const canonicalUrl = `${BUSINESS_CONFIG.siteUrl}/blog/${slug}`;

  return {
    metadataBase: new URL(BUSINESS_CONFIG.siteUrl),
    title: `${cleanTitle} | L'Atelier Spoolio`,
    description: cleanExcerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${cleanTitle} | L'Atelier Spoolio`,
      description: cleanExcerpt,
      url: canonicalUrl,
      type: "article",
      siteName: BUSINESS_CONFIG.name,
      locale: "fr_FR",
      publishedTime: post.date ? new Date(post.date).toISOString() : undefined,
      images: post.featuredImageUrl
        ? [
            {
              url: post.featuredImageUrl.startsWith("http")
                ? post.featuredImageUrl
                : `${BUSINESS_CONFIG.siteUrl}${post.featuredImageUrl}`,
              width: 1200,
              height: 630,
              alt: cleanTitle,
            },
          ]
        : [
            {
              url: `${BUSINESS_CONFIG.siteUrl}/images/og-spoolio.jpg`,
              width: 1200,
              height: 630,
              alt: cleanTitle,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${cleanTitle} | L'Atelier Spoolio`,
      description: cleanExcerpt,
      images: [
        post.featuredImageUrl && post.featuredImageUrl.startsWith("http")
          ? post.featuredImageUrl
          : `${BUSINESS_CONFIG.siteUrl}/images/og-spoolio.jpg`,
      ],
    },
  };
}

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post || post.status !== "publish") {
    notFound();
  }

  const cleanTitle = decodeHtml(post.title);
  // Ensure that no internal h1 tags exist inside rich body content to guarantee a single H1 per page
  const decodedContent = decodeHtml(post.content)
    .replace(/<h1(\s+[^>]*)?>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>");

  const canonicalUrl = `${BUSINESS_CONFIG.siteUrl}/blog/${post.slug}`;

  const blogLd = getBlogPostingJsonLd({
    title: cleanTitle,
    description: (post.excerpt || post.content).replace(/<[^>]*>/g, "").substring(0, 160),
    slug: post.slug,
    datePublished: post.date ? new Date(post.date).toISOString() : undefined,
    image: post.featuredImageUrl || undefined,
  });

  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: "Accueil", url: BUSINESS_CONFIG.siteUrl },
    { name: "L'Atelier Spoolio", url: `${BUSINESS_CONFIG.siteUrl}/blog` },
    { name: cleanTitle, url: canonicalUrl },
  ]);

  return (
    <div className="min-h-screen bg-spoolio-bg text-zinc-900 font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-white">
      <JsonLdScript data={blogLd} id={`blog-post-ld-${post.id}`} />
      <JsonLdScript data={breadcrumbsJsonLd} id={`blog-post-breadcrumbs-${post.id}`} />

      {/* Sticky Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-[800px] w-full mx-auto px-6 pt-28 lg:pt-32 pb-12 lg:pb-16">
        {/* Breadcrumbs */}
        <nav
          aria-label="Fil d'Ariane"
          className="flex items-center gap-2 text-xs font-semibold text-zinc-500 mb-8 font-sans select-none"
        >
          <Link href="/" className="hover:text-zinc-900 transition-colors duration-200">
            Accueil
          </Link>
          <span className="text-zinc-400 font-bold">/</span>
          <Link href="/blog" className="hover:text-zinc-900 transition-colors duration-200">
            L'Atelier
          </Link>
          <span className="text-zinc-400 font-bold">/</span>
          <span className="text-zinc-900 font-black truncate max-w-[200px] sm:max-w-none">
            {cleanTitle}
          </span>
        </nav>

        {/* Article Meta Header */}
        <header className="mb-8">
          <span className="text-xs text-[#ff4f00] font-black uppercase tracking-wider block mb-2 font-sans">
            Publié le{" "}
            {new Date(post.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-zinc-900 leading-tight font-antonio mb-4">
            {cleanTitle}
          </h1>
        </header>

        {/* Featured Image Cover */}
        {post.featuredImageUrl && (
          <div className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden border border-zinc-200 shadow-md mb-10 bg-zinc-100">
            <Image
              src={post.featuredImageUrl}
              alt={cleanTitle}
              fill
              sizes="(max-width: 800px) 100vw, 800px"
              className="object-cover no-invert"
              priority
            />
          </div>
        )}

        {/* Blog Rich HTML Body Content */}
        <article className="prose max-w-none text-zinc-700 text-sm sm:text-base leading-relaxed font-sans blog-content-prose">
          <div dangerouslySetInnerHTML={{ __html: decodedContent }} />
        </article>

        {/* Bottom Actions Area */}
        <div className="mt-12 pt-8 border-t border-zinc-200 flex items-center justify-between font-sans select-none">
          <Link
            href="/blog"
            className="text-xs font-bold text-zinc-600 hover:text-[#ff4f00] transition-colors flex items-center gap-1.5"
          >
            <span>&larr;</span>
            <span>Retour à l'Atelier</span>
          </Link>
          <span className="text-[10px] text-zinc-400 font-black tracking-widest uppercase">
            Spoolio 3D
          </span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
