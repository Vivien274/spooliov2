import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SpoolioProductGrid from "@/components/SpoolioProductGrid";
import AnimatedHero from "@/components/AnimatedHero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewsSection from "@/components/ReviewsSection";
import HomeLoader from "@/components/HomeLoader";
import CurvedTextScrollAnimation from "@/components/CurvedTextScrollAnimation";
import SpotlightMarqueeBanner from "@/components/SpotlightMarqueeBanner";
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

  let hero = DEFAULT_HERO;
  try {
    const page = (await Promise.race([
      prisma.page.findUnique({
        where: { slug: "config-hero" }
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Hero DB Timeout")), 2000))
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
        take: 3,
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
    <div className="relative min-h-screen bg-spoolio-bg text-white font-sans flex flex-col items-center selection:bg-spoolio-orange selection:text-black overflow-x-hidden">
      {/* React Home Loading Screen */}
      <HomeLoader />

      {/* Background Decorative Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ backgroundColor: "rgba(255, 85, 0, 0.08)", filter: "blur(140px)" }}
        />
        <div
          className="absolute top-[30%] right-[-10%] w-[550px] h-[550px] rounded-full"
          style={{ backgroundColor: "rgba(0, 240, 255, 0.07)", filter: "blur(140px)" }}
        />
        <div
          className="absolute top-[65%] left-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ backgroundColor: "rgba(16, 185, 129, 0.06)", filter: "blur(140px)" }}
        />
      </div>

      {/* 1. Full-Width Animated Hero Section */}
      <AnimatedHero {...(hero as any)} />

      {/* 2. Sleek Minimalist Text Marquee */}
      <section className="hero-marquee-section w-full bg-transparent py-4 overflow-hidden text-gray-900 dark:text-white select-none">
        <div className="flex whitespace-nowrap animate-marquee text-xs uppercase tracking-widest text-gray-900 dark:text-white font-extrabold gap-8 select-none font-sans items-center">
          {[1, 2, 3].map((loop) => (
            <div key={loop} className="flex items-center gap-8 shrink-0">
              <span className="flex items-center gap-2 text-gray-900 dark:text-white">
                <span>🚚</span>
                <span>{lang === "en" ? "FREE SHIPPING OVER €40" : "LIVRAISON OFFERTE DÈS 40€"}</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f00]" />

              <span className="flex items-center gap-2 text-gray-900 dark:text-white">
                <span>🌱</span>
                <span>{lang === "en" ? "BIO-SOURCED PLA PLASTIC" : "PLA BIOSOURCÉ"}</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f00]" />

              <span className="flex items-center gap-2 text-gray-900 dark:text-white">
                <span>⚡</span>
                <span>{lang === "en" ? "ZERO OVERSTOCK • MADE TO ORDER" : "ZÉRO SURSTOCK • FABRICATION À LA COMMANDE"}</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f00]" />

              <span className="flex items-center gap-2 text-gray-900 dark:text-white">
                <span>🇫🇷</span>
                <span>{lang === "en" ? "HANDMADE IN COMINES (FRANCE)" : "FAIT MAIN À COMINES (NORD)"}</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f00]" />

              <span className="flex items-center gap-2 text-gray-900 dark:text-white">
                <span>⌨️</span>
                <span>{lang === "en" ? "CUSTOMIZABLE 3D CLICKERS" : "CLICKERS 3D CUSTOMISABLES"}</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f00]" />

              <span className="flex items-center gap-2 text-gray-900 dark:text-white">
                <span>🎁</span>
                <span>{lang === "en" ? "SURPRISE PACKS FROM €10.00" : "POCHETTES SURPRISE DÈS 10.00€"}</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f00]" />
            </div>
          ))}
        </div>
      </section>

      {/* 3. Discreet Bento Reassurance Grid (Directly below Marquee) */}
      <section className="w-full max-w-[1200px] mx-auto px-4 my-6 select-none">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bento-reassurance-item flex items-center gap-3 p-3 sm:py-3.5 sm:px-4 rounded-2xl bg-white/70 dark:bg-[#0e0e12]/80 backdrop-blur-md border border-gray-200/70 dark:border-neutral-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:shadow-md transition-all duration-300 group">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform">
              🌱
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-mono text-gray-500 dark:text-gray-400 font-semibold">{t("home.bento.eco_label")}</span>
              <strong className="text-xs sm:text-xs font-bold text-gray-900 dark:text-white truncate">{t("home.bento.eco_val")}</strong>
            </div>
          </div>

          <div className="bento-reassurance-item flex items-center gap-3 p-3 sm:py-3.5 sm:px-4 rounded-2xl bg-white/70 dark:bg-[#0e0e12]/80 backdrop-blur-md border border-gray-200/70 dark:border-neutral-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:shadow-md transition-all duration-300 group">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform">
              🇫🇷
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-mono text-gray-500 dark:text-gray-400 font-semibold">{t("home.bento.artisan_label")}</span>
              <strong className="text-xs sm:text-xs font-bold text-gray-900 dark:text-white truncate">{t("home.bento.artisan_val")}</strong>
            </div>
          </div>

          <div className="bento-reassurance-item flex items-center gap-3 p-3 sm:py-3.5 sm:px-4 rounded-2xl bg-white/70 dark:bg-[#0e0e12]/80 backdrop-blur-md border border-gray-200/70 dark:border-neutral-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-orange-500/30 dark:hover:border-orange-500/30 hover:shadow-md transition-all duration-300 group">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform">
              🚚
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-mono text-gray-500 dark:text-gray-400 font-semibold">{t("home.bento.shipping_label")}</span>
              <strong className="text-xs sm:text-xs font-bold text-gray-900 dark:text-white truncate">{t("home.bento.shipping_val")}</strong>
            </div>
          </div>

          <div className="bento-reassurance-item flex items-center gap-3 p-3 sm:py-3.5 sm:px-4 rounded-2xl bg-white/70 dark:bg-[#0e0e12]/80 backdrop-blur-md border border-gray-200/70 dark:border-neutral-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-amber-500/30 dark:hover:border-amber-500/30 hover:shadow-md transition-all duration-300 group">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform">
              ⭐
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-mono text-amber-500 font-bold flex items-center gap-1">
                <span>★★★★★</span>
              </span>
              <strong className="text-xs sm:text-xs font-bold text-gray-900 dark:text-white truncate">{t("home.bento.reviews_val")}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Product Grid Header & List */}
      <section className="w-full max-w-[1200px] px-4 py-12 relative z-10 flex flex-col gap-16">
        {/* Title Block */}
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight font-antonio text-neon-flow">
            {t("home.collection.title")}
          </h2>
          <p className="text-xs md:text-sm text-gray-400 font-sans mt-2 max-w-md mx-auto leading-relaxed">
            {t("home.collection.subtitle")}
          </p>
        </div>

        {/* Section 1: Derniers Ajouts */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5 font-sans">
            <span className="text-xl">🌱</span>
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                {t("home.grid.latest_title")}
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">{t("home.grid.latest_sub")}</p>
            </div>
          </div>
          <SpoolioProductGrid filterType="latest" limit={3} showFilters={false} compact={true} />
        </div>

        {/* Section 2: Best Of */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5 font-sans">
            <span className="text-xl">✨</span>
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                {t("home.grid.favorites_title")}
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">{t("home.grid.favorites_sub")}</p>
            </div>
          </div>
          <SpoolioProductGrid filterType="best-of" limit={3} showFilters={false} compact={true} />
        </div>

        {/* Donation Call-to-action Ribbon (Voyant & Premium) */}
        <div className="relative rounded-3xl p-8 bg-gradient-to-r from-[#cf3b00] to-[#b03200] border border-[#cf3b00]/30 dark:bg-gradient-to-r dark:from-[#ff4f00]/10 dark:via-[#131316]/90 dark:to-[#131316]/90 dark:border-[#ff4f00]/30 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(207,59,0,0.15)] dark:shadow-[0_0_30px_rgba(255,79,0,0.1)] backdrop-blur-md font-sans group hover:border-[#cf3b00]/50 dark:hover:border-[#ff4f00]/50 transition-all duration-500">
          {/* Permanent Glow in Background (only dark mode) */}
          <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-[#ff4f00]/15 blur-3xl pointer-events-none animate-pulse hidden dark:block" />
          <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-[#ff4f00]/10 blur-3xl pointer-events-none hidden dark:block" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-white/20 dark:bg-gradient-to-br dark:from-[#ff4f00] dark:to-[#e04500] flex items-center justify-center shrink-0 shadow-lg shadow-black/10 dark:shadow-[#ff4f00]/20 select-none animate-bounce">
              <span className="text-2xl">🧡</span>
            </div>
            <div className="space-y-1.5 max-w-xl">
              <h4 className="text-[23px] font-black text-white tracking-wide uppercase font-antonio flex flex-wrap items-center justify-center md:justify-start gap-2 leading-none no-invert">
                <span>{t("home.donation.title")}</span>
                <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest bg-white/20 text-white border border-white/30 dark:bg-[#ff4f00]/20 dark:text-[#ff4f00] dark:border-[#ff4f00]/30 animate-pulse no-invert">{t("home.donation.badge")}</span>
              </h4>
              <p className="text-xs text-white/90 dark:text-gray-400 leading-relaxed font-sans font-medium">
                {t("home.donation.description")}
              </p>
            </div>
          </div>

          <Link
            href="/don"
            className="relative z-10 shrink-0 h-13 px-8 rounded-xl bg-white text-[#cf3b00] hover:bg-white/95 dark:bg-[#cf3b00] dark:text-white dark:hover:bg-[#b03200] font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-black/10 dark:shadow-[#cf3b00]/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{t("home.donation.button")}</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1 text-sm">&rarr;</span>
          </Link>
        </div>

        {/* Curved Text Path Scroll Animation (CodeFronts style) */}
        <CurvedTextScrollAnimation />

        {/* Section 3: Tout le Catalogue */}
        <div className="flex flex-col gap-6 font-sans">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5">
            <span className="text-xl">🧩</span>
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                {t("home.grid.explore_title")}
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">{t("home.grid.explore_sub")}</p>
            </div>
          </div>
          <SpoolioProductGrid filterType="all" limit={9} showFilters={true} />
        </div>

        {/* Large Blue Application Link */}
        <div className="flex justify-center mt-4">
          <Link href="/boutique" className="w-full max-w-lg py-4 px-6 inline-flex items-center justify-center gap-2.5 bg-[#005cff] hover:bg-[#004ecc] text-white font-bold text-xs tracking-wider rounded-xl transition-all shadow-xl shadow-[#005cff]/15 cursor-pointer no-invert text-center uppercase">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h16a1 1 0 011 1v8zM3 10h18M5 14v7a1 1 0 001 1h12a1 1 0 001-1v-7M9 14v4a1 1 0 001 1h4a1 1 0 001-1v-4" />
            </svg>
            {t("nav_menu.see_all_shop")}
          </Link>
        </div>
      </section>

      {/* 5. PLA Storytelling Timeline Section */}
      <section className="w-full max-w-[1200px] px-4 py-12 relative z-10 border-t border-white/5">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-white font-antonio">
            {t("home.timeline.title")} 🌾
          </h2>
          <p className="text-xs text-gray-400 font-sans mt-2 max-w-md mx-auto leading-relaxed">
            {t("home.timeline.subtitle")}
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 mt-8 font-sans">
          {/* Timeline Connector Line (only visible on desktop) */}
          <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-[#cf3b00]/40 via-indigo-500/20 to-emerald-500/20 z-0" />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center text-center p-5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-black/10 hover:bg-black/[0.03] dark:hover:border-white/10 dark:hover:bg-white/[0.04] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-full bg-spoolio-bg text-[#cf3b00] border border-[#cf3b00]/30 flex items-center justify-center font-black text-sm mb-4 shrink-0 group-hover:scale-110 transition-transform duration-300">
              1
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">{t("home.timeline.step1.title")}</h4>
            <p className="text-xs text-white/80 leading-relaxed font-medium">
              {t("home.timeline.step1.description")}
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center text-center p-5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-black/10 hover:bg-black/[0.03] dark:hover:border-white/10 dark:hover:bg-white/[0.04] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-full bg-spoolio-bg text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-sm mb-4 shrink-0 group-hover:scale-110 transition-transform duration-300">
              2
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">{t("home.timeline.step2.title")}</h4>
            <p className="text-xs text-white/80 leading-relaxed font-medium">
              {t("home.timeline.step2.description")}
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center text-center p-5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-black/10 hover:bg-black/[0.03] dark:hover:border-white/10 dark:hover:bg-white/[0.04] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-full bg-spoolio-bg text-purple-400 border border-purple-500/30 flex items-center justify-center font-black text-sm mb-4 shrink-0 group-hover:scale-110 transition-transform duration-300">
              3
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">{t("home.timeline.step3.title")}</h4>
            <p className="text-xs text-white/80 leading-relaxed font-medium">
              {t("home.timeline.step3.description")}
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative z-10 flex flex-col items-center text-center p-5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-black/10 hover:bg-black/[0.03] dark:hover:border-white/10 dark:hover:bg-white/[0.04] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-full bg-spoolio-bg text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-sm mb-4 shrink-0 group-hover:scale-110 transition-transform duration-300">
              4
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">{t("home.timeline.step4.title")}</h4>
            <p className="text-xs text-white/80 leading-relaxed font-medium">
              {t("home.timeline.step4.description")}
            </p>
          </div>

          {/* Step 5 */}
          <div className="relative z-10 flex flex-col items-center text-center p-5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-black/10 hover:bg-black/[0.03] dark:hover:border-white/10 dark:hover:bg-white/[0.04] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-full bg-spoolio-bg text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm mb-4 shrink-0 group-hover:scale-110 transition-transform duration-300">
              5
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">{t("home.timeline.step5.title")}</h4>
            <p className="text-xs text-white/80 leading-relaxed font-medium">
              {t("home.timeline.step5.description")}
            </p>
          </div>
        </div>
      </section>

      {/* 5.5. Atelier Machines Section (Nos Artisanes de l'Ombre + Filaments & Machines) */}
      <section className="w-full max-w-[1200px] px-4 py-8 mb-12 flex flex-col gap-10">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-white font-antonio">
            {t("home.printers.title")}
          </h2>
          <p className="text-xs text-gray-400 font-sans mt-2 max-w-md mx-auto leading-relaxed">
            {t("home.printers.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(() => {
            const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
            return dbPrinters.map((p, idx) => {
              let task = "";
              let statusText: string = p.status === "Active" ? t("home.printers.active") : p.status === "En veille" ? t("home.printers.standby") : t("home.printers.broken");
              let colorClass = "";
              let glowClass = "";

              const baseColors: any = {
                "Berthe": { active: "border-blue-500/30 hover:border-blue-500/80 hover:bg-blue-500/5", glow: "bg-blue-400" },
                "Philomène": { active: "border-emerald-500/30 hover:border-emerald-500/80 hover:bg-emerald-500/5", glow: "bg-emerald-400" },
                "Ursule": { active: "border-orange-500/30 hover:border-orange-500/80 hover:bg-orange-500/5", glow: "bg-orange-400" },
                "Godelaine": { active: "border-purple-500/30 hover:border-purple-500/80 hover:bg-purple-500/5", glow: "bg-purple-400" },
                "Claudine": { active: "border-pink-500/30 hover:border-pink-500/80 hover:bg-pink-500/5", glow: "bg-pink-400" }
              };

              const cfg = baseColors[p.name] || { active: "border-gray-500/30 hover:border-gray-500/80 hover:bg-gray-500/5", glow: "bg-gray-400" };

              if (p.status === "Active") {
                const productName = getSeededProduct(activeProducts, currentHour + idx);
                task = t("home.printers.printing", { name: productName });
                colorClass = cfg.active;
                glowClass = `${cfg.glow} animate-pulse`;
              } else if (p.status === "En veille") {
                task = t("home.printers.standby_temp");
                colorClass = "border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/5 bg-purple-950/5";
                glowClass = "bg-purple-400/40";
              } else if (p.status === "En panne") {
                task = t("home.printers.out_of_service");
                statusText = t("home.printers.broken");
                colorClass = "border-red-500/40 bg-red-950/15 hover:border-red-500/70 hover:bg-red-500/5";
                glowClass = "bg-red-500 animate-ping";
              }

              return (
                <div
                  key={p.name}
                  className={`p-5 rounded-2xl bg-spoolio-card border transition-all duration-300 flex flex-col justify-between h-[150px] font-sans ${colorClass}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-white">{p.name}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className={`w-2 h-2 rounded-full ${glowClass}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${p.status === "En panne" ? "text-red-400" : "text-gray-300"}`}>
                        {statusText}
                      </span>
                    </div>
                    <p className={`text-[11px] font-medium leading-tight ${p.status === "En panne" ? "text-red-400/80" : "text-gray-500"}`}>
                      {task}
                    </p>
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* Live Social Proof Counter Ribbon (Monthly Progressive Counter) */}
        {(() => {
          const now = new Date();
          const dayOfMonth = now.getDate();
          const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          const monthlyTarget = 105;
          const monthlyCount = Math.max(8, Math.floor((dayOfMonth / totalDaysInMonth) * monthlyTarget) + (dayOfMonth % 4));

          return (
            <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#ff4f00]/10 via-[#0d0d10] to-[#ff4f00]/10 border border-[#ff4f00]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left font-sans shadow-lg">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff4f00] animate-ping shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm font-black text-white uppercase font-antonio tracking-wide">
                    🔥 {t("home.printers.live_ribbon", { count: monthlyCount })}
                  </span>
                  <span className="hidden sm:inline text-neutral-500">•</span>
                  <span className="text-[11px] text-neutral-300 font-medium">{t("home.printers.zero_overstock")}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full shrink-0">
                {t("home.printers.live_badge")}
              </span>
            </div>
          );
        })()}

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
          <div className="md:col-span-1 rounded-3xl bg-[#141418] border border-[#ff4f00]/30 p-6 flex flex-col justify-between gap-5 font-sans shadow-xl backdrop-blur-md">
            <div className="flex flex-col gap-4">
              {/* Title Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  <h4 className="text-base font-extrabold text-white tracking-tight uppercase font-antonio">
                    L'Atelier Spoolio • Blog
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#ff4f00] bg-[#ff4f00]/10 border border-[#ff4f00]/30 px-2 py-0.5 rounded-full">
                  Derniers Articles
                </span>
              </div>

              {/* List of Latest Articles */}
              <div className="space-y-3">
                {recentBlogPosts.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic py-4 text-center">
                    Aucun article disponible pour le moment.
                  </p>
                ) : (
                  recentBlogPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group flex gap-3 items-center p-2.5 rounded-2xl bg-white/[0.03] hover:bg-[#ff4f00]/10 border border-white/5 hover:border-[#ff4f00]/30 transition-all duration-300"
                    >
                      {post.featuredImageUrl ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black/40 border border-white/10">
                          <Image
                            src={post.featuredImageUrl}
                            alt={post.title}
                            fill
                            sizes="48px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300 no-invert"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0 border border-white/10">
                          🤖
                        </div>
                      )}
                      <div className="flex flex-col min-w-0 space-y-0.5">
                        <span className="text-[9px] text-[#ff4f00] font-bold uppercase tracking-wider">
                          {new Date(post.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </span>
                        <h5 className="text-xs font-bold text-white group-hover:text-[#ff4f00] transition-colors line-clamp-2 leading-tight">
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
              className="w-full py-3 px-4 rounded-xl bg-[#ff4f00] hover:bg-[#ff6600] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#ff4f00]/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer text-center no-invert"
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
