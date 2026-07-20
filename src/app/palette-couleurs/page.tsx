import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Palette de couleurs disponibles | Spoolio",
  description: "Découvrez notre palette complète de filaments PLA (bicolores, pailletés, phosphorescents, unis) pour personnaliser vos créations imprimées en 3D.",
};

// Filament Color details
interface ColorItem {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  description: string;
}

const BICOLORS_DEGRADES: ColorItem[] = [
  {
    name: "Arc en ciel",
    className: "swatch-rainbow",
    description: "Chaque pièce est unique ! Le filament change de couleur tout au long de l'impression pour un effet multicolore magique."
  },
  {
    name: "Bicolore Bleu clair – Rose",
    style: { background: "linear-gradient(135deg, #58a6ff 50%, #ff66cc 50%)" },
    description: "Deux couleurs extrudées en même temps. La couleur change selon l'angle sous lequel vous regardez l'objet !"
  },
  {
    name: "Bicolore Bleu-Vert",
    style: { background: "linear-gradient(135deg, #2563eb 50%, #2ebd59 50%)" },
    description: "Un effet changeant saisissant entre un bleu électrique et un vert vif."
  },
  {
    name: "Bicolore Bleu-Violet",
    style: { background: "linear-gradient(135deg, #00c6ff 50%, #a32eff 50%)" },
    description: "Un magnifique rendu iridescent rappelant les reflets de la nuit."
  },
  {
    name: "Bicolore Bleu-Violet Mat",
    style: { background: "linear-gradient(135deg, #2c3e50 50%, #8e44ad 50%)", filter: "saturate(0.7) contrast(1.1)" },
    description: "Le même effet bicolore mystique mais avec un fini mat très soyeux et anti-reflets."
  },
  {
    name: "Rouge feu (dégradé)",
    style: { background: "linear-gradient(to bottom, #ff4f00, #dc2626)" },
    description: "Un dégradé chaleureux évoquant les flammes, passant d'un orange vif à un rouge profond."
  },
  {
    name: "Feu",
    style: { background: "radial-gradient(circle, #facc15 0%, #f97316 60%, #dc2626 100%)" },
    description: "Un mélange de couleurs chaudes imitant l'intensité du feu."
  },
];

const SPECIALS_TEXTURES: ColorItem[] = [
  {
    name: "Noir Pailleté",
    className: "swatch-paillette",
    style: { background: "#151518", backgroundImage: "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "4px 4px" },
    description: "Un noir mat profond constellé de micro-paillettes argentées pour un effet ciel étoilé."
  },
  {
    name: "Gris Pailleté",
    className: "swatch-paillette",
    style: { background: "#7f8c8d", backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "4px 4px" },
    description: "Un gris sidéral satiné orné d'étincelles argentées."
  },
  {
    name: "Vert foncé Pailleté",
    className: "swatch-paillette",
    style: { background: "#114220", backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "4px 4px" },
    description: "Un magnifique vert forêt orné de reflets scintillants."
  },
  {
    name: "Argenté (reflets métal)",
    style: { background: "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)", boxShadow: "inset 0 0 10px rgba(255,255,255,0.2)" },
    description: "Un filament chargé en particules métalliques pour un rendu argent satiné réaliste."
  },
  {
    name: "Bois (imitation chêne)",
    className: "swatch-bois",
    description: "Contient de vraies fibres de bois ! Donne un fini mat texturé brun clair, ponçable et odorant."
  },
  {
    name: "Imitation Roche",
    className: "swatch-roche",
    description: "Rendu mat moucheté dans les tons sable, idéal pour les figurines de monstres, décors ou pots."
  },
  {
    name: "Marbre",
    className: "swatch-marbre",
    description: "Un blanc cassé élégant parsemé de fins éclats sombres pour imiter à la perfection la pierre de marbre."
  },
  {
    name: "Phosphorescent",
    className: "swatch-phospho",
    description: "Blanc-vert translucide le jour, il brille d'une intense lueur verte phosphorescente dans le noir !"
  },
  {
    name: "Transparent",
    className: "swatch-transparent",
    description: "Laisse passer la lumière. L'effet de transparence s'accentue sur les parois fines de l'objet."
  },
];

const UNIS: ColorItem[] = [
  { name: "Blanc", style: { background: "#ffffff", border: "1px solid rgba(255,255,255,0.15)" }, description: "Un blanc pur, propre et très net." },
  { name: "Noir", style: { background: "#121214" }, description: "Un noir profond, élégant et intemporel." },
  { name: "Gris", style: { background: "#7f8c8d" }, description: "Un gris neutre idéal pour faire ressortir les détails géométriques." },
  { name: "Beige (cacahuète)", style: { background: "#c8a87a" }, description: "Un beige chaud et naturel." },
  { name: "Jaune", style: { background: "#facc15" }, description: "Jaune canari vif et joyeux." },
  { name: "Jaune soleil", style: { background: "#f59e0b" }, description: "Un jaune chaud tirant légèrement sur l'ambre." },
  { name: "Orange", style: { background: "#ff4f00" }, description: "Le orange signature Spoolio, ultra-pétant et énergique." },
  { name: "Orange pêche", style: { background: "#ffb085" }, description: "Une nuance douce et fruitée, très pastel." },
  { name: "Orange translucide", style: { background: "rgba(249, 115, 22, 0.4)", border: "1px solid rgba(249, 115, 22, 0.6)" }, description: "Un orange vitreux laissant passer la lumière." },
  { name: "Rose pâle", style: { background: "#ffd1dc" }, description: "Un rose pastel tout doux." },
  { name: "Rose poudré", style: { background: "#ffb7c5" }, description: "Un rose subtil et élégant." },
  { name: "Rouge", style: { background: "#ff2a2a" }, description: "Un rouge cerise vif et saisissant." },
  { name: "Rouge Brique", style: { background: "#9b2335" }, description: "Un rouge bordeaux mat très chaleureux." },
  { name: "Vert fluo / pomme", style: { background: "#66ff33" }, description: "Un vert acide très dynamique." },
  { name: "Vert foncé", style: { background: "#134e1e" }, description: "Un vert sapin élégant et boisé." },
  { name: "Vert pâle", style: { background: "#86efac" }, description: "Un vert menthe d'eau pastel." },
  { name: "Violet", style: { background: "#a32eff" }, description: "Un violet électrique profond." },
  { name: "Bleu", style: { background: "#005cff" }, description: "Un bleu roi vif classique." },
  { name: "Bleu canard", style: { background: "#008080" }, description: "Un turquoise foncé tirant sur le vert paon." },
  { name: "Bleu marine", style: { background: "#0d1b2a" }, description: "Un bleu sombre très classe." },
  { name: "Bleu turquoise", style: { background: "#06b6d4" }, description: "Un bleu lagon exotique et lumineux." },
  { name: "Marron clair", style: { background: "#a0785a" }, description: "Teinte caramel douce." },
  { name: "Marron moyen", style: { background: "#7d4f35" }, description: "Brun chocolat au lait." },
  { name: "Marron foncé", style: { background: "#5c3d2e" }, description: "Un marron expresso intense." },
];

export default function ColorPalettePage() {
  return (
    <div className="relative min-h-screen bg-spoolio-bg text-white font-sans flex flex-col items-center selection:bg-spoolio-orange selection:text-black overflow-x-hidden">
      
      {/* Custom styles for complex swatches */}
      <style dangerouslySetInnerHTML={{ __html: `
        .swatch-spool {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 9999px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 25px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1);
          overflow: hidden;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .swatch-spool::before {
          content: '';
          position: absolute;
          inset: 28%;
          border-radius: 9999px;
          background: #121214;
          border: 2px solid rgba(0, 0, 0, 0.5);
          box-shadow: inset 0 2px 5px rgba(0,0,0,0.8), 0 2px 4px rgba(255,255,255,0.05);
          z-index: 10;
        }
        .swatch-spool::after {
          content: '';
          position: absolute;
          inset: 38%;
          border-radius: 9999px;
          background: #000;
          z-index: 11;
        }
        .swatch-rainbow {
          background: conic-gradient(
            #ff0000 0deg, #ff7f00 45deg, #ffff00 90deg, 
            #00ff00 135deg, #0000ff 180deg, #4b0082 225deg, 
            #8b00ff 270deg, #ff0000 360deg
          );
        }
        .swatch-phospho {
          background: #e0ffe0;
          box-shadow: 0 0 15px rgba(160, 255, 160, 0.6), inset 0 2px 4px rgba(255,255,255,0.2);
          animation: phospho-glow 3s infinite ease-in-out;
        }
        @keyframes phospho-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(160, 255, 160, 0.4); background: #d0ffd0; }
          50% { box-shadow: 0 0 25px rgba(160, 255, 160, 0.9); background: #a8ffa8; }
        }
        .swatch-bois {
          background: #a0785a;
          background-image: repeating-linear-gradient(
            45deg,
            #8e6749 0px,
            #8e6749 2px,
            #a0785a 2px,
            #a0785a 10px
          );
        }
        .swatch-roche {
          background: #8c8c82;
          background-image: 
            radial-gradient(circle at 20% 30%, #5a5a50 1px, transparent 1px),
            radial-gradient(circle at 75% 60%, #b3b3a3 2px, transparent 2px),
            radial-gradient(circle at 40% 80%, #3d3d37 1px, transparent 1px);
          background-size: 15px 15px;
        }
        .swatch-marbre {
          background: #f5f6f8;
          background-image: 
            radial-gradient(circle at 10% 20%, rgba(0,0,0,0.06) 1px, transparent 1px),
            linear-gradient(35deg, transparent 45%, rgba(0,0,0,0.12) 48%, rgba(0,0,0,0.12) 52%, transparent 55%),
            linear-gradient(125deg, transparent 40%, rgba(0,0,0,0.08) 43%, rgba(0,0,0,0.08) 47%, transparent 50%);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .swatch-transparent {
          background-color: rgba(255, 255, 255, 0.15);
          background-image: 
            linear-gradient(45deg, rgba(0,0,0,0.08) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.08) 75%),
            linear-gradient(45deg, rgba(0,0,0,0.08) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.08) 75%);
          background-size: 10px 10px;
          background-position: 0 0, 5px 5px;
          backdrop-filter: blur(1px);
        }
        .color-card-item:hover .swatch-spool {
          transform: rotate(45deg) scale(1.05);
        }
      ` }} />

      {/* Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[5%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full" style={{ backgroundColor: 'rgba(255, 79, 0, 0.12)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-[20%] left-[-15%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', filter: 'blur(120px)' }} />
      </div>

      <Header className="relative h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full" />

      <main className="w-full max-w-[1100px] px-6 py-12 relative z-10 flex-grow">
        
        {/* Banner Title */}
        <div className="text-center mb-16">
          <span className="text-xs font-black text-[#ff4f00] uppercase tracking-widest bg-[#ff4f00]/10 px-4.5 py-1.5 rounded-full border border-[#ff4f00]/20 inline-block mb-4">
            Impression 3D Responsable 🌿
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight font-antonio text-white mb-4">
            Notre Palette de <span className="text-[#ff4f00]">Couleurs</span> 🎨
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto font-sans leading-relaxed">
            Retrouvez toutes les teintes et textures de filaments PLA biosourcés disponibles pour personnaliser vos produits Spoolio.
          </p>
          <div className="mt-4 text-xs text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/20 max-w-md mx-auto px-4 py-2.5 rounded-2xl font-sans">
            ⚠️ Attention : le rendu des couleurs peut légèrement varier selon les écrans (~90% de fidélité par rapport à la réalité).
          </div>
        </div>

        {/* SECTION 1: BICOLORES & DEGRADES */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8 border-b border-spoolio-border/40 pb-4">
            <span className="text-2xl">🌈</span>
            <h2 className="text-2xl font-black font-antonio uppercase tracking-wide text-white">
              Bicolores & Dégradés
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BICOLORS_DEGRADES.map((color) => (
              <div key={color.name} className="color-card-item p-5 rounded-[24px] bg-spoolio-card border border-spoolio-border flex gap-4 items-center transition-all hover:border-[#ff4f00]/30 hover:shadow-xl">
                <div className={`swatch-spool ${color.className || ""}`} style={color.style} />
                <div className="flex flex-col gap-1 font-sans">
                  <h3 className="font-bold text-white text-base leading-tight">{color.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mt-1">{color.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: EFFETS SPECIAUX & TEXTURES */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8 border-b border-spoolio-border/40 pb-4">
            <span className="text-2xl">✨</span>
            <h2 className="text-2xl font-black font-antonio uppercase tracking-wide text-white">
              Matières & Effets Spéciaux
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPECIALS_TEXTURES.map((color) => (
              <div key={color.name} className="color-card-item p-5 rounded-[24px] bg-spoolio-card border border-spoolio-border flex gap-4 items-center transition-all hover:border-[#ff4f00]/30 hover:shadow-xl">
                <div className={`swatch-spool ${color.className || ""}`} style={color.style} />
                <div className="flex flex-col gap-1 font-sans">
                  <h3 className="font-bold text-white text-base leading-tight">{color.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mt-1">{color.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: COULEURS UNIES */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8 border-b border-spoolio-border/40 pb-4">
            <span className="text-2xl">🎨</span>
            <h2 className="text-2xl font-black font-antonio uppercase tracking-wide text-white">
              Couleurs Unies Classiques
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {UNIS.map((color) => (
              <div key={color.name} className="color-card-item p-5 rounded-[24px] bg-spoolio-card border border-spoolio-border flex gap-4 items-center transition-all hover:border-[#ff4f00]/30 hover:shadow-xl">
                <div className={`swatch-spool ${color.className || ""}`} style={color.style} />
                <div className="flex flex-col gap-1 font-sans">
                  <h3 className="font-bold text-white text-base leading-tight">{color.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mt-1">{color.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BOTTOM BLOCK */}
        <div className="p-8 rounded-[32px] bg-spoolio-card border border-spoolio-border text-center space-y-6 max-w-xl mx-auto shadow-2xl relative overflow-hidden font-sans">
          <div className="absolute -right-12 -top-12 w-28 h-28 bg-[#ff4f00]/10 rounded-full blur-xl pointer-events-none" />
          <h3 className="text-xl md:text-2xl font-black font-antonio uppercase tracking-tight text-white">
            Une couleur manque à l'appel ? 🛠️
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
            Nous renouvelons régulièrement nos stocks de filaments. Si vous cherchez un coloris bien particulier, écrivez-nous !
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="px-6 py-3 font-bold text-black bg-spoolio-orange hover:bg-spoolio-orange/90 rounded-xl transition-all shadow-lg shadow-spoolio-orange/20 w-full sm:w-auto">
              Nous Contacter
            </Link>
            <Link href="/boutique" className="px-6 py-3 font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all w-full sm:w-auto">
              Retourner à la boutique
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
