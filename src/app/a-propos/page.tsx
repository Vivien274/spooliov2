import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPageSeoMetadata } from "@/lib/seoPages";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("a-propos");
}

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#fafaf9] text-zinc-900 font-sans flex flex-col items-center selection:bg-[#ff4f00] selection:text-white overflow-x-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full" style={{ backgroundColor: 'rgba(255, 79, 0, 0.05)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-[10%] left-[-15%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full" style={{ backgroundColor: 'rgba(251, 191, 36, 0.06)', filter: 'blur(120px)' }} />
      </div>

      <Header />

      <main className="w-full max-w-[800px] px-6 pt-28 lg:pt-32 pb-12 relative z-10 flex-grow">
        <div className="text-center animate-reveal">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-xs font-semibold text-orange-700 mb-4">
            <span>🇫🇷</span>
            <span>Atelier Artisanal Français • Comines (59)</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-righteous text-zinc-950 mb-4 leading-tight">
            À Propos de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f00] via-amber-500 to-[#ff4f00]">
              Spoolio
            </span>
          </h1>
          <p className="text-sm md:text-base text-zinc-600 text-center max-w-lg mx-auto font-sans leading-relaxed">
            Où l&apos;innovation de l&apos;impression 3D donne le sourire à tous les enfants que nous sommes.
          </p>
        </div>

        {/* Narrative Box */}
        <div className="mt-12 p-6 md:p-10 rounded-[32px] bg-white border border-zinc-200/90 text-zinc-700 space-y-8 text-sm md:text-base leading-relaxed animate-reveal delay-100 font-sans shadow-xs">
          
          {/* Section 1: Intro */}
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold font-righteous tracking-tight text-zinc-950 flex items-center gap-2.5">
              <span>🚀</span> L&apos;Esprit Spoolio
            </h2>
            <p className="leading-relaxed">
              Spoolio a pour objectif de transmettre du sourire, du plaisir et de l&apos;amusement. Nous croyons que la technologie de pointe, comme l&apos;impression 3D (ou fabrication additive), ne doit pas seulement être industrielle : elle peut aussi être ludique, colorée et merveilleuse.
            </p>
          </div>

          {/* Section 2: Vivien & The Family */}
          <div className="space-y-6 border-t border-zinc-100 pt-8">
            <h2 className="text-xl md:text-2xl font-bold font-righteous tracking-tight text-zinc-950 flex items-center gap-2.5">
              <span>👨‍👩‍👦</span> Une Aventure Familiale
            </h2>
            
            {/* Vivien Creator Avatar Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 border border-zinc-200/90 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-xs">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1 border-2 border-[#ff4f00] shrink-0 shadow-xs overflow-hidden hover:scale-105 transition-transform">
                <Image
                  src="/images/vivien-avatar.png"
                  alt="Vivien Bocquelet - Fondateur Spoolio"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg font-bold text-zinc-950 font-outfit">Vivien Bocquelet</h3>
                  <span className="text-[10px] font-mono font-bold text-[#ff4f00] px-2.5 py-0.5 rounded-full bg-[#ff4f00]/10 border border-[#ff4f00]/20 uppercase">Fondateur &amp; Artisan 3D</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  Spoolio, c&apos;est mon histoire et ma passion. C&apos;est moi qui conçois, règle les imprimantes 3D et prépare avec soin chaque commande dans notre atelier !
                </p>
              </div>
            </div>

            <p className="leading-relaxed">
              Toutefois, je ne suis pas vraiment seul dans l&apos;atelier... Je suis épaulé par mon épouse, <strong>Stéphanie</strong>. Consultante en digitalisation des entreprises, elle apporte toujours le petit filon sympa et l&apos;idée stratégique qui fait toute la différence.
            </p>
            
            {/* The Tester block highlight */}
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row items-start gap-4">
              <span className="text-3xl sm:text-4xl">🧒</span>
              <div className="space-y-1">
                <span className="text-xs font-black text-[#ff4f00] uppercase tracking-wider block">Le Garant Contractuel du Fun</span>
                <strong className="text-zinc-950 text-sm block font-outfit">Notre Testeur Officiel (6 ans)</strong>
                <p className="text-xs text-zinc-700 leading-normal font-sans">
                  Il est notre expert à domicile. Du haut de ses 6 ans, il est pleinement capable de décréter si un fidget ou une figurine articulée est amusante ou s&apos;il faut la rejeter. Évidemment, comme vous vous en doutez, chaque impression 3D se voit prélevée d&apos;une rigoureuse <em>&ldquo;taxe de testeur&rdquo;</em> à la maison !
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Eco & Production Values */}
          <div className="space-y-4 border-t border-zinc-100 pt-8">
            <h2 className="text-xl md:text-2xl font-bold font-righteous tracking-tight text-zinc-950 flex items-center gap-2.5">
              <span>🌱</span> Nos Engagements &amp; Production Locale
            </h2>
            <p className="leading-relaxed">
              Toutes nos créations (fidgets, figurines articulées, boîtes Kawaii, tours à dés) sont fabriquées localement dans notre atelier de <strong>Comines, dans le Nord de la France</strong>.
            </p>
            <p className="leading-relaxed">
              Nous mettons un point d&apos;honneur à utiliser du <strong>PLA (Acide Polylactique)</strong>, un thermoplastique d&apos;origine végétale (généralement issu d&apos;amidon de maïs ou de canne à sucre), biodégradable dans des conditions industrielles. C&apos;est notre façon de vous proposer des créations durables et respectueuses de l&apos;environnement.
            </p>
          </div>

          {/* Section 4: Address */}
          <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">Notre Atelier</span>
              <span className="text-zinc-950 font-bold block">Spoolio 3D</span>
              <span className="text-zinc-600 block">40 rue du Hoccart</span>
              <span className="text-zinc-600 block">59560 Comines, France</span>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">Contact</span>
              <span className="text-[#ff4f00] font-bold block">contact@spoolio.fr</span>
              <span className="text-zinc-600 block">Lundi au Samedi — 10h à 18h</span>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
