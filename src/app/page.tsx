import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SpoolioProductGrid from "@/components/SpoolioProductGrid";
import HomeTabbedProductGrid from "@/components/HomeTabbedProductGrid";
import AnimatedHero from "@/components/AnimatedHero";
import LatestDropBanner from "@/components/LatestDropBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewsSection from "@/components/ReviewsSection";
import HomeEnjeuBanner from "@/components/HomeEnjeuBanner";
import SpotlightMarqueeBanner from "@/components/SpotlightMarqueeBanner";
import BoutiqueCTAButton from "@/components/BoutiqueCTAButton";
import ThemeRibbon from "@/components/ThemeRibbon";
import { Sparkles, Keyboard, Shapes, Gift, Heart, Sprout, FlaskConical, Recycle, Printer, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import fr from "@/locales/fr.json";
import en from "@/locales/en.json";
import { getPageSeoMetadata } from "@/lib/seoPages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("home");
}

const DEFAULT_HERO = {
  title: "La Capsule été",
  subtitle: "Elle est sortie, elle est tout belle !",
  buttonText: "VOIR LA CAPSULE",
  buttonLink: "/boutique",
  imageUrl: "/images/hero_background.jpg",
  imagePosition: "center center"
};

export interface PrinterItem {
  id?: number;
  name: string;
  status: "Active" | "En veille" | "En panne";
}

export interface ReviewItem {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  createdAt?: string;
  product?: {
    name: string;
    slug: string;
  } | null;
}

// Fallback Google reviews
const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 1,
    customerName: "Camille R.",
    rating: 5,
    comment: "La boîte magique est incroyable ! Reçue rapidement avec un petit mot hyper sympa. La finition de l'impression 3D est au top.",
    createdAt: "Il y a 3 jours",
    product: {
      slug: "boite-magique-anti-lendemain",
      name: "La Boîte Magique",
    },
  },
  {
    id: 2,
    customerName: "Julien M.",
    rating: 5,
    comment: "Le dragon articulé a fait sensation pour l'anniversaire de mon neveu. Matière bio au top, on adore la démarche écoresponsable !",
    createdAt: "Il y a 1 semaine",
    product: {
      slug: "dragon-articyle-flexi",
      name: "Dragon Articulé Flexi",
    },
  },
  {
    id: 3,
    customerName: "Sophie L.",
    rating: 5,
    comment: "Commande retirée en Click & Collect à Comines. Accueil très chaleureux, et le fidget clavier est parfait pour le bureau.",
    createdAt: "Il y a 2 semaines",
    product: {
      slug: "fidget-key-clicker",
      name: "Key Clicker Fidget",
    },
  },
];

// Helper deterministic seeded selector for active product names
function getSeededProduct(products: string[], seed: number) {
  if (!products || products.length === 0) return "Objet sensoriel 3D";
  const index = Math.abs(seed) % products.length;
  return products[index];
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("spoolio_locale")?.value || cookieStore.get("NEXT_LOCALE")?.value || "fr";
  const translations = lang === "en" ? en : fr;

  const t = (key: string, replacements?: Record<string, string | number>) => {
    let text = key.split(".").reduce((obj: any, i) => obj?.[i], translations) || key;
    if (typeof text === "string" && replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(new RegExp(`{${placeholder}}`, "g"), String(value));
      });
    }
    return text;
  };

  let hero: any = null;
  try {
    const isPreprod =
      process.env.VERCEL_GIT_COMMIT_REF === "preprod" ||
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";
    const heroSlug = isPreprod ? "config-hero-preprod" : "config-hero";

    const page = (await Promise.race([
      prisma.page.findUnique({
        where: { slug: heroSlug },
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Hero DB Timeout")), 2000)),
    ])) as any;

    if (page) {
      const config = JSON.parse(page.content);
      hero = { ...DEFAULT_HERO, ...config };
    }
  } catch (e) {
    // Silent fallback
  }

  // Fetch real reviews from DB or fallback
  let displayReviews: ReviewItem[] = DEFAULT_REVIEWS;
  try {
    const dbReviews = (await Promise.race([
      prisma.review.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Reviews DB Timeout")), 2000))
    ])) as any[];

    if (dbReviews && dbReviews.length > 0) {
      displayReviews = dbReviews.map((r) => ({
        id: r.id,
        customerName: r.customerName,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : undefined,
        product: null,
      }));
    }
  } catch (err) {
    // Silent fallback to DEFAULT_REVIEWS
  }

  // Fetch real printers from DB
  let dbPrinters: PrinterItem[] = [
    { name: "Berthe", status: "Active" },
    { name: "Philomène", status: "Active" },
    { name: "Ursule", status: "Active" },
    { name: "Godelaine", status: "Active" },
    { name: "Claudine", status: "En veille" },
  ];

  try {
    const fetched = (await Promise.race([
      prisma.printer.findMany({
        orderBy: { name: "asc" },
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Printers DB Timeout")), 2000))
    ])) as any[];
    if (fetched && fetched.length > 0) {
      dbPrinters = fetched.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status as any,
      }));
    }
  } catch (e) {
    // Silent fallback
  }

  // Fetch active WooCommerce catalog product names for printer tasks
  let activeProducts: string[] = [
    "La Boîte Magique",
    "Dragon Articulé Flexi",
    "Key Clicker Fidget",
    "Porte-Clé Mini Piston",
    "Grenouille Articulée",
  ];

  try {
    const dbProducts = (await Promise.race([
      prisma.product.findMany({
        where: { status: "publish" },
        select: { name: true },
        take: 20,
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Products DB Timeout")), 2000))
    ])) as any[];
    if (dbProducts && dbProducts.length > 0) {
      activeProducts = dbProducts.map((p) => p.name).filter(Boolean);
    }
  } catch (e) {
    // Silent fallback
  }

  let recentBlogPosts: any[] = [];
  try {
    const dbBlogPosts = (await Promise.race([
      prisma.blogPost.findMany({
        where: { status: "publish" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImageUrl: true,
          date: true,
        },
        orderBy: { date: "desc" },
        take: 4,
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Blog DB Timeout")), 2000)),
    ])) as any[];
    if (dbBlogPosts && dbBlogPosts.length > 0) {
      recentBlogPosts = dbBlogPosts;
    }
  } catch (e) {
    // Silent fallback
  }

  return (
    <div className="relative min-h-screen bg-white text-zinc-900 font-sans flex flex-col items-center selection:bg-[#ff4f00] selection:text-white overflow-x-hidden">
      {/* 1. Full-Width Animated Hero Section */}
      <AnimatedHero {...(hero as any)} />

      {/* 2. Full-Width Dedicated Latest Drop Banner: "Curb Monsters" */}
      <LatestDropBanner />

      {/* 5. Tabbed Product Showcase & 2-Column Banner */}
      <section className="w-full max-w-[1200px] px-4 py-8 relative z-10 flex flex-col gap-10">
        {/* Tabbed Product Showcase (Art Toys, Jeux de société, Tout le catalogue) */}
        <HomeTabbedProductGrid />

        {/* 2-Column Balanced Section: Aider l'Atelier + App Enjeu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 items-stretch font-sans">
          {/* Left Column: Aider l'Atelier (Donation) */}
          <div className="h-full relative rounded-3xl p-6 sm:p-8 bg-zinc-50 border border-zinc-200 overflow-hidden flex flex-col justify-between gap-6 shadow-sm group hover:border-zinc-400 transition-all duration-300">
            <div className="relative z-10 flex flex-col items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#ff4f00]/10 border border-[#ff4f00]/20 flex items-center justify-center shrink-0 shadow-xs select-none">
                  <Heart className="w-6 h-6 text-[#ff4f00] fill-[#ff4f00]/20" />
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#ff4f00]/10 text-[#ff4f00] border border-[#ff4f00]/20 no-invert">
                  {t("home.donation.badge")}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight uppercase font-outfit leading-tight no-invert">
                  {t("home.donation.title")}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                  {t("home.donation.description")}
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-2">
              <Link
                href="/don"
                className="w-full h-12 px-6 rounded-xl bg-zinc-950 hover:bg-[#ff4f00] text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t("home.donation.button")}</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1 text-sm">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Right Column: App Enjeu */}
          <HomeEnjeuBanner className="h-full my-0" />
        </div>
      </section>

      {/* 5. PLA Storytelling Timeline Section */}
      <section className="w-full max-w-[1200px] px-4 py-14 relative z-10 border-t border-zinc-200">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 text-xs font-black uppercase tracking-wider mb-3">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Matière 100% Végétale</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-normal uppercase tracking-wide text-zinc-900 font-righteous">
            {t("home.timeline.title")}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-sans mt-2.5 max-w-lg mx-auto leading-relaxed font-medium">
            {t("home.timeline.subtitle")}
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 mt-8 font-sans">
          {/* Timeline Connector Line (Dashed guide line behind circles) */}
          <div className="hidden md:block absolute top-[48px] left-[10%] right-[10%] border-t-2 border-dashed border-neutral-300 z-0 pointer-events-none" />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
            <div className="relative w-14 h-14 rounded-2xl bg-zinc-950 group-hover:bg-[#ff4f00] text-white flex items-center justify-center mb-4 shrink-0 ring-4 ring-zinc-50 shadow-md transition-all duration-300 group-hover:scale-105">
              <Sprout className="w-6 h-6 text-emerald-400 group-hover:text-white transition-colors" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-zinc-950 text-[10px] font-black flex items-center justify-center border border-zinc-200 shadow-xs">
                1
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight mb-2 font-outfit leading-tight text-center">{t("home.timeline.step1.title")}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              {t("home.timeline.step1.description")}
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
            <div className="relative w-14 h-14 rounded-2xl bg-zinc-950 group-hover:bg-[#ff4f00] text-white flex items-center justify-center mb-4 shrink-0 ring-4 ring-zinc-50 shadow-md transition-all duration-300 group-hover:scale-105">
              <FlaskConical className="w-6 h-6 text-amber-300 group-hover:text-white transition-colors" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-zinc-950 text-[10px] font-black flex items-center justify-center border border-zinc-200 shadow-xs">
                2
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight mb-2 font-outfit leading-tight text-center">{t("home.timeline.step2.title")}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              {t("home.timeline.step2.description")}
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
            <div className="relative w-14 h-14 rounded-2xl bg-zinc-950 group-hover:bg-[#ff4f00] text-white flex items-center justify-center mb-4 shrink-0 ring-4 ring-zinc-50 shadow-md transition-all duration-300 group-hover:scale-105">
              <Recycle className="w-6 h-6 text-emerald-400 group-hover:text-white transition-colors" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-zinc-950 text-[10px] font-black flex items-center justify-center border border-zinc-200 shadow-xs">
                3
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight mb-2 font-outfit leading-tight text-center">{t("home.timeline.step3.title")}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              {t("home.timeline.step3.description")}
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative z-10 flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
            <div className="relative w-14 h-14 rounded-2xl bg-zinc-950 group-hover:bg-[#ff4f00] text-white flex items-center justify-center mb-4 shrink-0 ring-4 ring-zinc-50 shadow-md transition-all duration-300 group-hover:scale-105">
              <Printer className="w-6 h-6 text-[#ff4f00] group-hover:text-white transition-colors" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-zinc-950 text-[10px] font-black flex items-center justify-center border border-zinc-200 shadow-xs">
                4
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight mb-2 font-outfit leading-tight text-center">{t("home.timeline.step4.title")}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              {t("home.timeline.step4.description")}
            </p>
          </div>

          {/* Step 5 */}
          <div className="relative z-10 flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
            <div className="relative w-14 h-14 rounded-2xl bg-zinc-950 group-hover:bg-[#ff4f00] text-white flex items-center justify-center mb-4 shrink-0 ring-4 ring-zinc-50 shadow-md transition-all duration-300 group-hover:scale-105">
              <Sparkles className="w-6 h-6 text-amber-300 group-hover:text-white transition-colors" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-zinc-950 text-[10px] font-black flex items-center justify-center border border-zinc-200 shadow-xs">
                5
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight mb-2 font-outfit leading-tight text-center">{t("home.timeline.step5.title")}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              {t("home.timeline.step5.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Spotlight Marquee Banner */}
      <section className="w-full max-w-[1200px] px-4 relative z-10">
        <SpotlightMarqueeBanner />
      </section>

      {/* 6. Bottom Showcase Cards */}
      <section className="w-full max-w-[1200px] px-4 pb-20 relative z-10 animate-reveal delay-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Block (2 columns width, reviews grid + modal details) */}
          <ReviewsSection displayReviews={displayReviews} />

          {/* Right Block (1 column width, latest blog posts list) */}
          <div className="md:col-span-1 rounded-3xl bg-zinc-50 border border-zinc-200 p-6 flex flex-col justify-between gap-5 font-sans shadow-sm">
            <div className="flex flex-col gap-4">
              {/* Title Header */}
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#ff4f00]" />
                  <h4 className="text-base font-extrabold text-zinc-900 tracking-tight uppercase font-outfit">
                    Spoolio • Le blog
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#ff4f00] bg-[#ff4f00]/10 border border-[#ff4f00]/20 px-2 py-0.5 rounded-full">
                  Derniers Articles
                </span>
              </div>

              {/* List of Latest Articles */}
              <div className="space-y-3">
                {recentBlogPosts.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic py-4 text-center">
                    Aucun article disponible pour le moment.
                  </p>
                ) : (
                  recentBlogPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group flex gap-3 items-center p-2.5 rounded-2xl bg-white hover:bg-zinc-100 border border-zinc-200 transition-all duration-200 shadow-xs"
                    >
                      {post.featuredImageUrl ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-100 border border-zinc-200">
                          <Image
                            src={post.featuredImageUrl}
                            alt={post.title}
                            fill
                            sizes="48px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300 no-invert"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200 text-zinc-400">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex flex-col min-w-0 space-y-0.5">
                        <span className="text-[9px] text-[#ff4f00] font-bold uppercase tracking-wider">
                          {new Date(post.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </span>
                        <h5 className="text-xs font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors line-clamp-2 leading-tight">
                          {post.title}
                        </h5>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* View Blog Button */}
            <Link
              href="/blog"
              className="w-full py-3 px-4 rounded-xl bg-zinc-950 hover:bg-[#ff4f00] text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer text-center no-invert"
            >
              <span>Voir le blog</span>
              <span className="group-hover:translate-x-1 transition-transform text-sm">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
