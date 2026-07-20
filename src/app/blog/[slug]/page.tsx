import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  const cleanExcerpt = decodeHtml((post.excerpt || post.content).substring(0, 150) + "...");

  return {
    title: `${cleanTitle} | L'Atelier Spoolio`,
    description: cleanExcerpt.replace(/<[^>]*>/g, ""),
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
  const decodedContent = decodeHtml(post.content);

  return (
    <div className="min-h-screen bg-spoolio-bg text-white font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-black">
      {/* Sticky Header with Glassmorphism */}
      <div className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-md border-b border-[#1f1f23]">
        <Header className="h-24 flex items-center justify-between px-6 max-w-[1200px] mx-auto w-full" />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-[800px] w-full mx-auto px-6 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-8 font-sans select-none">
          <Link href="/" className="hover:text-white transition-colors duration-200">
            Accueil
          </Link>
          <span className="text-gray-700 font-bold">/</span>
          <Link href="/blog" className="hover:text-white transition-colors duration-200">
            L'Atelier
          </Link>
          <span className="text-gray-700 font-bold">/</span>
          <span className="text-white font-black truncate max-w-[200px] sm:max-w-none">
            {cleanTitle}
          </span>
        </nav>

        {/* Article Meta Header */}
        <header className="mb-8">
          <span className="text-xs text-blue-400 font-black uppercase tracking-wider block mb-2 font-sans">
            Publié le {new Date(post.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight font-antonio mb-4">
            {cleanTitle}
          </h1>
        </header>

        {/* Featured Image Cover */}
        {post.featuredImageUrl && (
          <div className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden border border-spoolio-border mb-10 bg-black/40">
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
        <article className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed font-sans blog-content-prose">
          <div dangerouslySetInnerHTML={{ __html: decodedContent }} />
        </article>

        {/* Bottom Actions Area */}
        <div className="mt-12 pt-8 border-t border-spoolio-border/40 flex items-center justify-between font-sans select-none">
          <Link
            href="/blog"
            className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>&larr;</span>
            <span>Retour à l'Atelier</span>
          </Link>
          <span className="text-[10px] text-gray-500 font-black tracking-widest uppercase">
            Spoolio 3D
          </span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
