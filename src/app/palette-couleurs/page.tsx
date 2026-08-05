import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DEFAULT_COLORS } from "@/lib/defaultColors";

export const metadata: Metadata = {
  metadataBase: new URL("https://spoolio.fr"),
  alternates: {
    canonical: "https://spoolio.fr/palette-couleurs",
  },
  title: "Palette de couleurs disponibles | Spoolio",
  description: "Découvrez notre palette complète de filaments PLA (bicolores, pailletés, phosphorescents, unis) pour personnaliser vos créations imprimées en 3D.",
};

// Revalidate every 60 seconds
export const revalidate = 60;

interface ColorItemDB {
  id: number;
  name: string;
  category: string;
  className?: string | null;
  style?: string | null;
  description?: string | null;
  isAvailable: boolean;
  position: number;
}

const getStyleObject = (styleString?: string | null): React.CSSProperties => {
  if (!styleString) return {};
  try {
    const stylesObj: React.CSSProperties = {};
    const pairs = styleString.split(";");
    for (const pair of pairs) {
      const [key, value] = pair.split(":");
      if (key && value) {
        const camelKey = key.trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        (stylesObj as any)[camelKey] = value.trim();
      }
    }
    return stylesObj;
  } catch (e) {
    return {};
  }
};

function getPrismaClient() {
  if (prisma && (prisma as any).color) return prisma;
  const { PrismaClient } = require("@prisma/client");
  return new PrismaClient();
}

async function getColors(): Promise<ColorItemDB[]> {
  try {
    const db = getPrismaClient();
    let dbColors = await db.color.findMany({
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });

    if (dbColors.length === 0) {
      await prisma.color.createMany({
        data: DEFAULT_COLORS.map((c) => ({
          name: c.name,
          category: c.category,
          className: c.className || null,
          style: c.style || null,
          description: c.description,
          isAvailable: c.isAvailable,
          position: c.position,
        })),
        skipDuplicates: true,
      });

      dbColors = await prisma.color.findMany({
        orderBy: [{ position: "asc" }, { id: "asc" }],
      });
    }

    return dbColors;
  } catch (e) {
    console.error("Error loading colors for palette page:", e);
    return DEFAULT_COLORS.map((c, i) => ({
      id: i + 1,
      name: c.name,
      category: c.category,
      className: c.className || null,
      style: c.style || null,
      description: c.description,
      isAvailable: c.isAvailable,
      position: c.position,
    }));
  }
}

export default async function ColorPalettePage() {
  const colors = await getColors();

  const bicolors = colors.filter((c) => c.category === "BICOLORS_DEGRADES");
  const specials = colors.filter((c) => c.category === "SPECIALS_TEXTURES");
  const unis = colors.filter((c) => c.category === "UNIS");

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
        {bicolors.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8 border-b border-spoolio-border/40 pb-4">
              <span className="text-2xl">🌈</span>
              <h2 className="text-2xl font-black font-antonio uppercase tracking-wide text-white">
                Bicolores & Dégradés
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bicolors.map((color) => (
                <div
                  key={color.id}
                  className={`color-card-item p-5 rounded-[24px] bg-spoolio-card border flex gap-4 items-center transition-all ${
                    color.isAvailable
                      ? "border-spoolio-border hover:border-[#ff4f00]/30 hover:shadow-xl"
                      : "border-amber-500/30 opacity-70 bg-amber-500/5"
                  }`}
                >
                  <div className={`swatch-spool ${color.className || ""}`} style={getStyleObject(color.style)} />
                  <div className="flex flex-col gap-1 font-sans flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-white text-base leading-tight">{color.name}</h3>
                      {!color.isAvailable && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                          Indisponible
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mt-1">{color.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: EFFETS SPECIAUX & TEXTURES */}
        {specials.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8 border-b border-spoolio-border/40 pb-4">
              <span className="text-2xl">✨</span>
              <h2 className="text-2xl font-black font-antonio uppercase tracking-wide text-white">
                Matières & Effets Spéciaux
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specials.map((color) => (
                <div
                  key={color.id}
                  className={`color-card-item p-5 rounded-[24px] bg-spoolio-card border flex gap-4 items-center transition-all ${
                    color.isAvailable
                      ? "border-spoolio-border hover:border-[#ff4f00]/30 hover:shadow-xl"
                      : "border-amber-500/30 opacity-70 bg-amber-500/5"
                  }`}
                >
                  <div className={`swatch-spool ${color.className || ""}`} style={getStyleObject(color.style)} />
                  <div className="flex flex-col gap-1 font-sans flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-white text-base leading-tight">{color.name}</h3>
                      {!color.isAvailable && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                          Indisponible
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mt-1">{color.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: COULEURS UNIES */}
        {unis.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8 border-b border-spoolio-border/40 pb-4">
              <span className="text-2xl">🎨</span>
              <h2 className="text-2xl font-black font-antonio uppercase tracking-wide text-white">
                Couleurs Unies Classiques
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unis.map((color) => (
                <div
                  key={color.id}
                  className={`color-card-item p-5 rounded-[24px] bg-spoolio-card border flex gap-4 items-center transition-all ${
                    color.isAvailable
                      ? "border-spoolio-border hover:border-[#ff4f00]/30 hover:shadow-xl"
                      : "border-amber-500/30 opacity-70 bg-amber-500/5"
                  }`}
                >
                  <div className={`swatch-spool ${color.className || ""}`} style={getStyleObject(color.style)} />
                  <div className="flex flex-col gap-1 font-sans flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-white text-base leading-tight">{color.name}</h3>
                      {!color.isAvailable && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                          Indisponible
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mt-1">{color.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
