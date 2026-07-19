import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SpoolioProductGrid from "@/components/SpoolioProductGrid";
import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";

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
  imageUrl: "/images/hero_background.jpg"
};

export default async function Home() {
  let hero = DEFAULT_HERO;
  try {
    const page = await prisma.page.findUnique({
      where: { slug: "config-hero" }
    });
    if (page) {
      const config = JSON.parse(page.content);
      hero = {
        title: config.title || DEFAULT_HERO.title,
        subtitle: config.subtitle || DEFAULT_HERO.subtitle,
        buttonText: config.buttonText || DEFAULT_HERO.buttonText,
        buttonLink: config.buttonLink || DEFAULT_HERO.buttonLink,
        imageUrl: config.imageUrl || DEFAULT_HERO.imageUrl
      };
    }
  } catch (e) {
    console.error("Failed to load homepage custom hero:", e);
  }

  return (
    <div className="min-h-screen bg-spoolio-bg text-white font-sans flex flex-col items-center selection:bg-spoolio-orange selection:text-black">

      {/* 1. Full-Width Hero Section with Absolute Header Overlay */}
      <section className="w-full relative overflow-hidden rounded-b-[60px] border-b border-[#1f1f23] mb-6">

        {/* Header Overlay */}
        <Header className="absolute top-0 left-0 right-0 h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full no-invert" />

        {/* Hero Background Panel */}
        <div 
          className="relative w-full aspect-[2.1/1] min-h-[360px] md:min-h-[500px] flex flex-col items-center justify-center text-center p-6 bg-cover bg-center no-invert"
          style={{ backgroundImage: `url('${hero.imageUrl}')` }}
        >
          {/* Dark visual overlay for contrast */}
          <div className="absolute inset-0 bg-black/35" />

          <div className="relative z-10 flex flex-col items-center gap-1.5 md:gap-3 max-w-xl mt-14">
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
          <span>maïs biosourcé 🌱 Fait main à Comines (59) 🇫🇷 Zéro surstock, zéro bullshit ⚡ /// Des objets funs imprimés en 3D avec du maïs biosourcé 🌱 Fait main à Comines (59) 🇫🇷 Zéro surstock, zéro bullshit ⚡</span>
          <span>maïs biosourcé 🌱 Fait main à Comines (59) 🇫🇷 Zéro surstock, zéro bullshit ⚡ /// Des objets funs imprimés en 3D avec du maïs biosourcé 🌱 Fait main à Comines (59) 🇫🇷 Zéro surstock, zéro bullshit ⚡</span>
          <span>maïs biosourcé 🌱 Fait main à Comines (59) 🇫🇷 Zéro surstock, zéro bullshit ⚡ /// Des objets funs imprimés en 3D avec du maïs biosourcé 🌱 Fait main à Comines (59) 🇫🇷 Zéro surstock, zéro bullshit ⚡</span>
        </div>
      </section>

      {/* 4. Bento Grid Section */}
      <section className="w-full max-w-[1200px] px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Left Block: La boussole à Fidgets (Gradient + Grid) */}
          <a href="https://boussole.spoolio.fr" target="_blank" rel="noopener noreferrer" className="md:col-span-2 relative h-[220px] rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 border border-spoolio-border p-6 flex flex-col justify-between group cursor-pointer transition-transform duration-300 hover:scale-[0.995] no-invert">
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
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                La boussole à Fidgets
              </h2>
              <p className="text-xs text-white/80 mt-1 font-medium flex items-center gap-1.5">
                Trouvez votre fidget idéal en 1 clic <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </p>
            </div>
          </a>

          {/* Right Stack: stacked vertical blocks */}
          <div className="md:col-span-1 flex flex-col gap-4">

            {/* Top Right: Pour les pros (Solid Orange) */}
            <Link href="/pro" className="h-[102px] rounded-2xl bg-[#ff9f1c] p-4 flex flex-col justify-between group cursor-pointer transition-transform duration-300 hover:scale-[0.99] no-invert">
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
            <Link href="/blog" className="h-[102px] rounded-2xl bg-[#005cff] p-4 flex flex-col justify-between group cursor-pointer transition-transform duration-300 hover:scale-[0.99] no-invert">
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
      <section className="w-full max-w-[1200px] px-4 py-8">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-white font-antonio">
            Les objets Spoolio
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {["TOUT", "Accessoires", "Boussole Sensorielle", "Objets du quotidien", "Fidgets", "Porte-clés connectés"].map((tag, idx) => (
            <button
              key={tag}
              className={`px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all border cursor-pointer ${idx === 0
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-gray-400 border-[#1f1f23] hover:text-white hover:border-gray-500"
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="mb-10">
          <SpoolioProductGrid />
        </div>

        {/* Large Blue Application Button */}
        <div className="flex justify-center mb-20">
          <button className="w-full max-w-lg py-4 px-6 inline-flex items-center justify-center gap-2.5 bg-[#005cff] hover:bg-[#004ecc] text-white font-bold text-xs tracking-wider rounded-xl transition-all shadow-xl shadow-[#005cff]/15 cursor-pointer no-invert">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h16a1 1 0 011 1v8zM3 10h18M5 14v7a1 1 0 001 1h12a1 1 0 001-1v-7M9 14v4a1 1 0 001 1h4a1 1 0 001-1v-4" />
            </svg>
            VOIR TOUTE LA BOUTIQUE
          </button>
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
                <span className="text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                  3D PRINT
                </span>
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
      <section className="w-full max-w-[1200px] px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Block (2 columns width, orange container, review cards) */}
          <div className="md:col-span-2 rounded-3xl bg-[#ff4f00] p-6 md:p-8 flex flex-col justify-start gap-6">
            <h3 className="text-xl md:text-2xl font-bold text-white font-sans">
              Nos clients adorent :
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(null).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white text-black p-5 rounded-[20px] shadow-lg flex flex-col justify-between h-full select-none"
                >
                  <p className="text-[13px] text-gray-800 leading-normal font-medium">
                    "Petit cactus anti stress est désormais bien placé sur mon bureau 🤩 Super produit très résistants et surtout coup de cœur garanti !"
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[13px] font-semibold text-gray-500 font-sans">
                      Amandine
                    </span>
                    <span className="text-[13px] text-[#ffae19] font-sans tracking-wide">
                      ★★★★★
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Block (1 column width, dark brown material info block) */}
          <div className="md:col-span-1 rounded-3xl bg-[#230f06] border border-[#ff4f00]/25 p-6 md:p-8 flex flex-col justify-between gap-6">
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

      {/* Footer Section */}
      <footer className="w-full border-t border-[#1f1f23] bg-spoolio-bg py-8 text-xs text-gray-500">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-[#ff4f00] flex items-center justify-center text-white font-extrabold text-[10px]">
              S
            </div>
            <span className="font-bold text-gray-300">Spoolio</span>
            <span>&copy; {new Date().getFullYear()} - Tous droits réservés.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/pro" className="hover:text-[#ff4f00] transition-colors">Espace Pro</Link>
            <Link href="/contact" className="hover:text-[#ff4f00] transition-colors">Contact</Link>
            <Link href="#" className="hover:text-[#ff4f00] transition-colors">Mentions Légales</Link>
            <Link href="#" className="hover:text-[#ff4f00] transition-colors">CGV</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
