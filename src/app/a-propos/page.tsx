import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "À Propos de Spoolio | L'Histoire & Nos Valeurs",
  description: "Découvrez l'aventure de Spoolio, notre atelier 3D à Comines, notre équipe familiale et nos valeurs écoresponsables.",
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-spoolio-bg text-white font-sans flex flex-col items-center selection:bg-spoolio-orange selection:text-black overflow-x-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blob-orange" style={{ backgroundColor: 'rgba(255, 79, 0, 0.15)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-[10%] left-[-15%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blob-indigo" style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', filter: 'blur(100px)' }} />
      </div>

      <Header className="relative h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full no-invert" />

      <main className="w-full max-w-[800px] px-6 py-12 relative z-10 flex-grow">
        <div className="animate-reveal">
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight font-antonio text-neon-flow mb-4 text-center">
            À Propos de Spoolio
          </h1>
          <p className="text-sm md:text-base text-gray-400 text-center max-w-lg mx-auto font-sans leading-relaxed">
            Où l'innovation de l'impression 3D donne le sourire à tous les enfants que nous sommes.
          </p>
        </div>

        {/* Narrative Box */}
        <div className="mt-12 p-6 md:p-10 rounded-[32px] bg-spoolio-card border border-spoolio-border text-gray-300 space-y-8 text-sm md:text-base leading-relaxed animate-reveal delay-100 font-sans shadow-2xl">
          
          {/* Section 1: Intro */}
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-black font-antonio uppercase tracking-tight text-white flex items-center gap-2.5">
              <span>🚀</span> L'Esprit Spoolio
            </h2>
            <p>
              Spoolio a pour objectif de transmettre du sourire, du plaisir et de l'amusement. Nous croyons que la technologie de pointe, comme l'impression 3D (ou fabrication additive), ne doit pas seulement être industrielle : elle peut aussi être ludique, colorée et merveilleuse.
            </p>
          </div>

          {/* Section 2: Vivien & The Family */}
          <div className="space-y-4 border-t border-spoolio-border pt-8">
            <h2 className="text-xl md:text-2xl font-black font-antonio uppercase tracking-tight text-white flex items-center gap-2.5">
              <span>👨‍👩‍👦</span> Une Aventure Familiale
            </h2>
            <p className="font-semibold text-white/90">
              Spoolio, c'est mon histoire, mon aventure, à moi, Vivien Bocquelet.
            </p>
            <p>
              Toutefois, je ne suis pas vraiment seul dans l'atelier... Je suis épaulé par mon épouse, <strong>Stéphanie</strong>. Consultante en digitalisation des entreprises, elle apporte toujours le petit filon sympa et l'idée stratégique qui fait toute la différence.
            </p>
            
            {/* The Tester block highlight */}
            <div className="p-5 rounded-2xl bg-black/40 border border-[#ff4f00]/25 flex flex-col sm:flex-row items-start gap-4">
              <span className="text-3xl sm:text-4xl">🧒</span>
              <div className="space-y-1">
                <span className="text-xs font-black text-[#ff4f00] uppercase tracking-wider block">Le Garant Contractuel du Fun</span>
                <strong className="text-white text-sm block">Notre Testeur Officiel (6 ans)</strong>
                <p className="text-xs text-gray-400 leading-normal">
                  Il est notre expert à domicile. Du haut de ses 6 ans, il est pleinement capable de décréter si un fidget ou une figurine articulée est amusante ou s'il faut la rejeter. Évidemment, comme vous vous en doutez, chaque impression 3D se voit prélevée d'une rigoureuse <em>"taxe de testeur"</em> à la maison !
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Eco & Production Values */}
          <div className="space-y-4 border-t border-spoolio-border pt-8">
            <h2 className="text-xl md:text-2xl font-black font-antonio uppercase tracking-tight text-white flex items-center gap-2.5">
              <span>🌱</span> Nos Engagements & Production Locale
            </h2>
            <p>
              Toutes nos créations (fidgets, figurines articulées, boîtes Kawaii, tours à dés) sont fabriquées localement dans notre atelier de <strong>Comines, dans le Nord de la France</strong>.
            </p>
            <p>
              Nous mettons un point d'honneur à utiliser du <strong>PLA (Acide Polylactique)</strong>, un thermoplastique d'origine végétale (généralement issu d'amidon de maïs ou de canne à sucre), biodégradable dans des conditions industrielles. C'est notre façon de vous proposer des jouets durables et respectueux de l'environnement.
            </p>
          </div>

          {/* Section 4: Address */}
          <div className="p-6 rounded-2xl bg-black/20 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Notre Atelier</span>
              <span className="text-white font-bold block">Spoolio 3D</span>
              <span className="text-gray-400 block">40 rue du Hoccart</span>
              <span className="text-gray-400 block">59560 Comines, France</span>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Contact</span>
              <span className="text-[#ff4f00] font-bold block">contact@spoolio.fr</span>
              <span className="text-gray-400 block">Lundi au Samedi — 10h à 18h</span>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
