import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SpoolioProductGrid from "@/components/SpoolioProductGrid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewsSection from "@/components/ReviewsSection";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Spoolio | Boutique d'Objets Fun Imprimés en 3D",
  description: "Découvrez notre collection de fidgets, supports et accessoires au pixel près selon la charte graphique Spoolio V2.",
};

const DEFAULT_HERO = {
  title: "La Capsule été",
  subtitle: "Elle est sortie, elle est tout belle !",
  buttonText: "VOIR LA CAPSULE",
  buttonLink: "/boutique",
  imageUrl: "/images/hero_background.jpg",
  imagePosition: "center center"
};

export default async function Home() {
  let hero = DEFAULT_HERO;
  let dbReviews: any[] = [];

  try {
    const heroPromise = prisma.page.findUnique({
      where: { slug: "config-hero" }
    });
    const reviewsPromise = prisma.review.findMany({
      where: { approved: true, showOnHome: true },
      take: 6,
      orderBy: { createdAt: "desc" }
    });

    let timeoutId: any;
    const timeoutPromise = new Promise<[null, any[]]>((resolve) => {
      timeoutId = setTimeout(() => {
        console.warn("Prisma Query Timeout (2500ms) triggered on home load");
        resolve([null, []]);
      }, 2500);
    });

    // Query both hero config and approved reviews in parallel
    const [page, fetchedReviews] = await Promise.race([
      Promise.all([heroPromise, reviewsPromise]),
      timeoutPromise
    ]) as [any, any[]];

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (page) {
      const config = JSON.parse(page.content);
      hero = {
        title: config.title || DEFAULT_HERO.title,
        subtitle: config.subtitle || DEFAULT_HERO.subtitle,
        buttonText: config.buttonText || DEFAULT_HERO.buttonText,
        buttonLink: config.buttonLink || DEFAULT_HERO.buttonLink,
        imageUrl: config.imageUrl || DEFAULT_HERO.imageUrl,
        imagePosition: config.imagePosition || DEFAULT_HERO.imagePosition
      };
    }
    dbReviews = fetchedReviews || [];

    // Fallback: If DB query returned no reviews (e.g. database empty or columns mismatch in production),
    // load approved reviews from local cache reviews.json
    if (dbReviews.length === 0) {
      try {
        const jsonPath = path.join(process.cwd(), 'src/data/reviews.json');
        if (fs.existsSync(jsonPath)) {
          const fileData = fs.readFileSync(jsonPath, 'utf8');
          const parsed = JSON.parse(fileData || "[]");
          if (Array.isArray(parsed)) {
            // Priority 1: approved and showOnHome
            let localReviews = parsed.filter((r: any) => r.approved === true && r.showOnHome === true);
            // Priority 2: just approved if none marked for home
            if (localReviews.length === 0) {
              localReviews = parsed.filter((r: any) => r.approved === true);
            }
            dbReviews = localReviews.slice(0, 6);
            console.log(`Loaded ${dbReviews.length} reviews from local reviews.json cache fallback on home`);
          }
        }
      } catch (jsonErr: any) {
        console.warn("Failed to load local reviews.json fallback on home:", jsonErr.message);
      }
    }
  } catch (e) {
    console.error("Failed to load homepage assets:", e);
  }

  const displayReviews = dbReviews;

  return (
    <div className="relative min-h-screen bg-spoolio-bg text-white font-sans flex flex-col items-center selection:bg-spoolio-orange selection:text-black overflow-x-hidden">

      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Blob Orange - Top Right */}
        <div
          className="absolute top-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blob-orange"
          style={{ backgroundColor: 'rgba(255, 79, 0, 0.22)', filter: 'blur(90px)' }}
        />
        {/* Blob Indigo - Mid Left */}
        <div
          className="absolute top-[35%] left-[-15%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blob-indigo"
          style={{ backgroundColor: 'rgba(99, 102, 241, 0.18)', filter: 'blur(90px)' }}
        />
        {/* Blob Yellow - Bottom Right */}
        <div
          className="absolute bottom-[20%] right-[-10%] w-[250px] md:w-[450px] h-[250px] md:h-[450px] rounded-full blob-yellow"
          style={{ backgroundColor: 'rgba(247, 235, 18, 0.14)', filter: 'blur(90px)' }}
        />
        {/* Extra Blob Indigo/Purple - Bottom Left */}
        <div
          className="absolute bottom-[5%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blob-indigo"
          style={{ backgroundColor: 'rgba(168, 85, 247, 0.14)', filter: 'blur(90px)' }}
        />
      </div>

      {/* 1. Full-Width Hero Section with Absolute Header Overlay */}
      <section className="w-full relative overflow-hidden rounded-b-[60px] border-b border-[#1f1f23] mb-6 z-10">

        {/* Header Overlay */}
        <Header className="absolute top-0 left-0 right-0 h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full no-invert" />

        {/* Hero Background Panel */}
        <div
          className="relative w-full aspect-[2.1/1] min-h-[360px] md:min-h-[500px] flex flex-col items-center justify-center text-center p-6 bg-cover no-invert"
          style={{ backgroundImage: `url('${hero.imageUrl}')`, backgroundPosition: hero.imagePosition || 'center center' }}
        >
          {/* Dark visual overlay for contrast */}
          <div className="absolute inset-0 bg-black/35" />

          <div className="relative z-10 flex flex-col items-center gap-1.5 md:gap-3 max-w-xl mt-14 animate-reveal">
            <h1 className="text-4xl sm:text-5xl md:text-[64px] font-extrabold uppercase tracking-tight text-white font-antonio leading-none home-hero-text">
              {hero.title}
            </h1>
            {hero.subtitle && (
              <p className="text-[14px] sm:text-sm md:text-base text-gray-100 font-sans tracking-wide home-hero-text">
                {hero.subtitle}
              </p>
            )}
            <Link
              href={hero.buttonLink}
              className="mt-4 px-8 py-3 bg-[#ff4f00] hover:bg-[#e04500] text-white font-bold text-[10px] md:text-xs tracking-wider rounded-full uppercase transition-all duration-300 shadow-lg shadow-[#ff4f00]/25 hover:scale-[1.02] cursor-pointer"
            >
              {hero.buttonText}
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Ticker Marquee (White text, custom content) */}
      <section className="w-full bg-spoolio-bg py-3 overflow-hidden border-y border-[#1f1f23]">
        <div className="flex whitespace-nowrap animate-marquee text-[10px] tracking-widest text-white font-semibold gap-8 select-none">
          <span>Plastique fait à partir de maïs biosourcé 🌱 Fait artisanalement à Comines (59) 🇫🇷 Zéro surstock, zéro bullshit ⚡ /// Des objets funs imprimés en 3D avec du maïs biosourcé 🌱 Fait main à Comines (59) 🇫🇷 Zéro surstock, zéro bullshit ⚡</span>
          <span>Plastique fait à partir de maïs biosourcé 🌱 Fait artisanalement à Comines (59) 🇫🇷 Zéro surstock, zéro bullshit ⚡ /// Des objets funs imprimés en 3D avec du maïs biosourcé 🌱 Fait main à Comines (59) 🇫🇷 Zéro surstock, zéro bullshit ⚡</span>
          <span>Plastique fait à partir de maïs biosourcé 🌱 Fait artisanalement à Comines (59) 🇫🇷 Zéro surstock, zéro bullshit ⚡ /// Des objets funs imprimés en 3D avec du maïs biosourcé 🌱 Fait main à Comines (59) 🇫🇷 Zéro surstock, zéro bullshit ⚡</span>
        </div>
      </section>

      {/* 4. Bento Grid Section */}
      <section className="w-full max-w-[1200px] px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Left Block: Réseaux Sociaux (Hype community card) */}
          <div className="md:col-span-1 relative h-[220px] rounded-2xl border border-spoolio-border p-6 flex flex-col justify-between bg-spoolio-card overflow-hidden group bento-card-glow animate-reveal delay-75">
            {/* Ambient colorful lighting behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-tr from-pink-600/10 via-purple-600/10 to-blue-600/10 filter blur-[40px] pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between font-sans">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Communauté Spoolio
              </span>
              {/* Heart animated pulse */}
              <span className="text-red-500 text-sm animate-pulse">❤️</span>
            </div>

            {/* Social Buttons Row */}
            <div className="relative z-10 flex justify-center gap-4 py-2">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/spoolio.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-white transition-all duration-300 hover:scale-110 hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-pink-500 hover:to-purple-500 hover:border-transparent group/insta"
                title="Instagram"
              >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover/insta:rotate-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@spoolio.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-white transition-all duration-300 hover:scale-110 hover:bg-black hover:border-cyan-400 group/tiktok shadow-[0_0_15px_rgba(37,244,238,0)] hover:shadow-[0_0_15px_rgba(37,244,238,0.3)]"
                title="TikTok"
              >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover/tiktok:-rotate-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.21-.42-.45-.6-.7-.03 3.68-.01 7.35-.02 11.03-.09 1.58-.69 3.19-1.87 4.26-1.52 1.41-3.79 2.05-5.83 1.65-2.61-.43-4.83-2.58-5.23-5.22-.59-3.23 1.43-6.52 4.62-7.05.69-.13 1.4-.15 2.1-.06v4.08c-.76-.17-1.57-.04-2.22.38-.85.5-1.34 1.51-1.22 2.49.12 1.34 1.28 2.44 2.63 2.44 1.31.06 2.53-.94 2.65-2.24.03-3.41.01-6.83.02-10.24-.02-4.22-.01-8.43-.02-12.65z" />
                </svg>
              </a>

              <a
                href="https://www.facebook.com/spoolio.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-white transition-all duration-300 hover:scale-110 hover:bg-[#1877f2] hover:border-transparent group/fb"
                title="Facebook"
              >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover/fb:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>

            {/* Footer Text */}
            <div className="relative z-10 font-sans">
              <p className="text-[10px] text-gray-400 font-medium">
                Coulisses, nouveautés & bêtisier de l'atelier en vidéo.
              </p>
            </div>
          </div>

          {/* Middle Block: La boussole à Fidgets (Reduced to col-span-1) */}
          <a href="https://boussole.spoolio.fr" target="_blank" rel="noopener noreferrer" className="md:col-span-1 relative h-[220px] rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 border border-spoolio-border p-6 flex flex-col justify-between group cursor-pointer transition-transform duration-300 hover:scale-[0.995] no-invert bento-card-glow-blue animate-reveal delay-100">
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:30px_30px] opacity-100 pointer-events-none" />

            {/* Compass Icon */}
            <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm self-start">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>

            {/* Bottom Title */}
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
                La boussole à Fidgets
              </h2>
              <p className="text-xs text-white/80 mt-1 font-medium flex items-center gap-1.5">
                Trouve ton fidget idéal <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </p>
            </div>
          </a>

          {/* Right Stack: stacked vertical blocks */}
          <div className="md:col-span-1 flex flex-col gap-4">

            {/* Top Right: Pour les pros (Solid Orange) */}
            <Link href="/pro" className="h-[102px] rounded-2xl bg-[#ff9f1c] p-4 flex flex-col justify-between group cursor-pointer transition-transform duration-300 hover:scale-[0.99] no-invert bento-card-glow animate-reveal delay-200">
              {/* Tag Icon */}
              <div className="w-7 h-7 rounded-full border border-white/25 flex items-center justify-center bg-white/10 self-start">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">Pour les pros</h3>
                <p className="text-[10px] text-white/90 font-medium leading-normal flex items-center gap-1">
                  Goodies, cadeaux d'entreprises, solutions sur mesure <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                </p>
              </div>
            </Link>

            {/* Bottom Right: L'atelier (Solid Blue) */}
            <Link href="/blog" className="h-[102px] rounded-2xl bg-[#005cff] p-4 flex flex-col justify-between group cursor-pointer transition-transform duration-300 hover:scale-[0.99] no-invert bento-card-glow-blue animate-reveal delay-300">
              {/* Tools Icon */}
              <div className="w-7 h-7 rounded-full border border-white/25 flex items-center justify-center bg-white/10 self-start">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">L'atelier</h3>
                <p className="text-[10px] text-white/90 font-medium leading-normal flex items-center gap-1">
                  Des idées, des envies de personnalisation ? <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                </p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* 5. Product Grid Header & List */}
      <section className="w-full max-w-[1200px] px-4 py-8 relative z-10">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight font-antonio text-neon-flow">
            Les objets Spoolio
          </h2>
        </div>

        {/* Product Grid */}
        <div className="mb-10">
          <SpoolioProductGrid />
        </div>

        {/* Large Blue Application Link */}
        <div className="flex justify-center mb-20">
          <Link href="/boutique" className="w-full max-w-lg py-4 px-6 inline-flex items-center justify-center gap-2.5 bg-[#005cff] hover:bg-[#004ecc] text-white font-bold text-xs tracking-wider rounded-xl transition-all shadow-xl shadow-[#005cff]/15 cursor-pointer no-invert text-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h16a1 1 0 011 1v8zM3 10h18M5 14v7a1 1 0 001 1h12a1 1 0 001-1v-7M9 14v4a1 1 0 001 1h4a1 1 0 001-1v-4" />
            </svg>
            VOIR TOUTE LA BOUTIQUE
          </Link>
        </div>
      </section>

      {/* 5.5. Atelier Machines Section */}
      <section className="w-full max-w-[1200px] px-4 py-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-white font-antonio">
            Nos Artisanes de l'Ombre 🤖
          </h2>
          <p className="text-xs text-gray-400 font-sans mt-2 max-w-md mx-auto leading-relaxed">
            Voici les 5 imprimantes 3D de l'atelier qui façonnent vos fidgets et accessoires couche par couche avec une précision chirurgicale.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: "Berthe", status: "Active", task: "Imprime : Chat Goofy", color: "border-blue-500/30 hover:border-blue-500/80 hover:bg-blue-500/5", glow: "bg-blue-400" },
            { name: "Philomène", status: "Active", task: "Imprime : Octopus Fidget", color: "border-emerald-500/30 hover:border-emerald-500/80 hover:bg-emerald-500/5", glow: "bg-emerald-400" },
            { name: "Ursule", status: "Active", task: "Imprime : Keychain NFC", color: "border-orange-500/30 hover:border-orange-500/80 hover:bg-orange-500/5", glow: "bg-orange-400" },
            { name: "Godelaine", status: "En veille", task: "Température : 25°C", color: "border-purple-500/30 hover:border-purple-500/80 hover:bg-purple-500/5", glow: "bg-purple-400/50" },
            { name: "Claudine", status: "Active", task: "Imprime : Cactus Anti-stress", color: "border-pink-500/30 hover:border-pink-500/80 hover:bg-pink-500/5", glow: "bg-pink-400" },
          ].map((m) => (
            <div
              key={m.name}
              className={`p-5 rounded-2xl bg-spoolio-card border transition-all duration-300 flex flex-col justify-between h-[150px] font-sans ${m.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-white">{m.name}</span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`w-2 h-2 rounded-full ${m.glow} ${m.status === "Active" ? "animate-pulse" : ""}`} />
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                    {m.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium leading-tight">
                  {m.task}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Bottom Showcase Cards */}
      <section className="w-full max-w-[1200px] px-4 pb-20 relative z-10 animate-reveal delay-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Block (2 columns width, reviews grid + modal details) */}
          <ReviewsSection displayReviews={displayReviews} />

          {/* Right Block (1 column width, dark brown material info block) */}
          <div className="md:col-span-1 rounded-3xl bg-[#230f06] border border-[#ff4f00]/25 p-6 md:p-8 flex flex-col justify-between gap-6 no-invert">
            <div className="flex flex-col gap-5">
              {/* Title */}
              <h4 className="text-[17px] font-bold text-white tracking-tight uppercase leading-snug font-sans">
                Matière première // <br />
                PLA Biosourcé 🌱
              </h4>

              {/* Description Paragraphs */}
              <p className="text-[14px] text-white/80 leading-relaxed font-sans">
                Chez Spoolio, on imprime du fun, pas de la pollution. Nos objets ne sortent pas d'une usine pétrochimique à l'autre bout du monde : ils prennent vie à Comines, couche par couche, à partir de PLA biosourcé.
              </p>

              <p className="text-[14px] text-white/80 leading-relaxed font-sans">
                C'est un plastique d'origine végétale conçu à partir d'amidon de maïs. Zéro pétrole, zéro surstock, zéro salade. Juste de la tech locale et écoresponsable.
              </p>

              {/* Warning Notice */}
              <div className="flex gap-2 text-[14px] text-white/85 italic leading-relaxed font-sans mt-2">
                <svg className="w-4 h-4 text-yellow-500 shrink-0 select-none mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>
                  <span className="font-semibold">Note de l'atelier :</span> Comme tout bon maïs, il adore le confort de ton intérieur mais déteste être oublié en plein soleil sur le tableau de bord d'une voiture à 60°C.
                </p>
              </div>
            </div>

            {/* Link button at the bottom */}
            <a href="#" className="flex items-center gap-2 text-[14px] font-bold text-white hover:text-[#ff4f00] transition-colors mt-auto self-start">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Lire l'article
            </a>
          </div>
        </div>
      </section>

      {/* Social Networks Community Banner */}
      <section className="w-full max-w-[1200px] px-4 pb-20 relative z-10 animate-reveal delay-300">
        <div className="relative rounded-[32px] overflow-hidden bg-spoolio-card border border-spoolio-border p-8 md:p-12 text-center flex flex-col items-center gap-8 shadow-2xl">
          {/* Decorative neon gradient glow in background */}
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#ff4f00]/10 filter blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#2F3CD9]/15 filter blur-[80px] pointer-events-none" />

          <div className="max-w-xl space-y-3 relative z-10">
            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#ff4f00] px-3 py-1 rounded-full bg-[#ff4f00]/10 border border-[#ff4f00]/20 font-sans">
              Rejoins la commu 🚀
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight font-antonio text-white">
              Suis nos coulisses au quotidien
            </h2>
            <p className="text-xs md:text-sm text-gray-400 font-sans leading-relaxed">
              Vidéos d'impression 3D en cours, bêtisiers de l'atelier, lancements de nouveaux produits et coulisses de fabrication : on te partage tout sur nos réseaux !
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl relative z-10">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/spoolio.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-gradient-to-tr hover:from-yellow-500/10 hover:via-pink-500/10 hover:to-purple-500/10 transition-all duration-300 hover:scale-[1.03] group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 flex items-center justify-center text-white no-invert shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white mt-4 font-sans">Instagram</span>
              <span className="text-[10px] text-gray-500 mt-1 font-medium font-sans">@spoolio.fr</span>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@spoolio.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-black/40 transition-all duration-300 hover:scale-[1.03] group"
            >
              <div className="w-12 h-12 rounded-xl bg-black border border-cyan-400/30 flex items-center justify-center text-white no-invert shadow-lg shadow-cyan-400/10 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.21-.42-.45-.6-.7-.03 3.68-.01 7.35-.02 11.03-.09 1.58-.69 3.19-1.87 4.26-1.52 1.41-3.79 2.05-5.83 1.65-2.61-.43-4.83-2.58-5.23-5.22-.59-3.23 1.43-6.52 4.62-7.05.69-.13 1.4-.15 2.1-.06v4.08c-.76-.17-1.57-.04-2.22.38-.85.5-1.34 1.51-1.22 2.49.12 1.34 1.28 2.44 2.63 2.44 1.31.06 2.53-.94 2.65-2.24.03-3.41.01-6.83.02-10.24-.02-4.22-.01-8.43-.02-12.65z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white mt-4 font-sans">TikTok</span>
              <span className="text-[10px] text-gray-500 mt-1 font-medium font-sans">@spoolio.fr</span>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/spoolio.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-[#1877f2]/10 transition-all duration-300 hover:scale-[1.03] group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1877f2] flex items-center justify-center text-white no-invert shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white mt-4 font-sans">Facebook</span>
              <span className="text-[10px] text-gray-500 mt-1 font-medium font-sans">Spoolio</span>
            </a>

            {/* Email Contact */}
            <Link
              href="/contact"
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-[#ff4f00]/10 transition-all duration-300 hover:scale-[1.03] group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#ff4f00] flex items-center justify-center text-white no-invert shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white mt-4 font-sans">Contact</span>
              <span className="text-[10px] text-gray-500 mt-1 font-medium font-sans">Une question ?</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <Footer />

    </div>
  );
}
