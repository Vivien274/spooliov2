import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://spoolio.fr"),
  alternates: {
    canonical: "https://spoolio.fr/blog",
  },
  title: "L'Atelier Spoolio | Blog, Actualités & Secrets de l'Impression 3D",
  description: "Découvrez les coulisses de l'atelier de Spoolio. Conseils, guides sur les fidgets, secrets de fabrication et actualités sur nos objets imprimés en 3D.",
};

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

export default async function BlogPage() {
  // Load blog posts from database sorted by publication date
  const posts = await prisma.blogPost.findMany({
    where: {
      status: "publish",
    },
    orderBy: {
      date: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-spoolio-bg text-zinc-900 font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-white">
      {/* Sticky Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-28 lg:pt-32 pb-12 lg:pb-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500 mb-6 font-sans select-none">
          <Link href="/" className="hover:text-zinc-900 transition-colors duration-200">
            Accueil
          </Link>
          <span className="text-zinc-400 font-bold">/</span>
          <span className="text-zinc-900 font-black">L'Atelier (Blog)</span>
        </nav>

        {/* Hero Section */}
        <section className="mb-12 text-left border-b border-zinc-200 pb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-zinc-900 mb-3 font-antonio">
            L'Atelier Spoolio
          </h1>
          <p className="text-zinc-600 text-sm max-w-3xl leading-relaxed font-sans">
            Retrouvez ici toutes les aventures de notre atelier d'impression 3D. Astuces de concentration avec les fidgets, coulisses de fabrication avec Berthe et Claudine, et guides d'achat pour gâter vos proches avec nos créations originales.
          </p>
        </section>

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <div className="py-24 text-center text-xs text-zinc-400 font-sans">
            Aucun article de blog n'est actuellement publié.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const cleanTitle = decodeHtml(post.title);
              // Clean excerpt and strip potential HTML tags
              const rawExcerpt = post.excerpt || post.content.substring(0, 150) + "...";
              const cleanExcerpt = decodeHtml(rawExcerpt.replace(/<[^>]*>/g, ""));
              
              return (
                <article
                  key={post.id}
                  className="bg-white border border-zinc-200/90 hover:border-zinc-300 rounded-3xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col group"
                >
                  {/* Article Image Container */}
                  <Link href={`/blog/${post.slug}`} className="relative block aspect-[1.7/1] bg-zinc-100 overflow-hidden">
                    {post.featuredImageUrl ? (
                      <Image
                        src={post.featuredImageUrl}
                        alt={cleanTitle}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105 no-invert"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 select-none">
                        <span className="text-4xl">🤖</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-2 font-sans">Spoolio 3D</span>
                      </div>
                    )}
                  </Link>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-1 gap-3 font-sans">
                    <span className="text-[10px] text-[#ff4f00] font-black uppercase tracking-wider block">
                      {new Date(post.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    
                    <h2 className="text-base font-extrabold text-zinc-900 leading-snug group-hover:text-[#ff4f00] transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>
                        {cleanTitle}
                      </Link>
                    </h2>
                    
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3">
                      {cleanExcerpt}
                    </p>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-auto pt-4 text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors flex items-center gap-1.5 self-start select-none"
                    >
                      <span>Lire l'article</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
