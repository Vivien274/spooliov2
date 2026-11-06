"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard, { Product } from "@/components/ProductCard";
import DropCountdown from "@/components/drops/DropCountdown";
import DropGallery from "@/components/drops/DropGallery";
import { Drop, DropGalleryItem, getDropTitleScale } from "@/lib/drops";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Clock,
  ArrowLeft,
  ArrowDown,
  Package,
  Quote,
  ShieldCheck,
  Lock,
  Camera,
  Palette,
} from "lucide-react";

interface DropDetailClientProps {
  drop: Drop & { products: Product[] };
}

export default function DropDetailClient({ drop }: DropDetailClientProps) {
  const router = useRouter();

  useEffect(() => {
    const cleanName = drop.dropName || (drop.title ? drop.title.replace(/^DROP\s*\d*\s*—\s*/i, "").trim() : drop.title);
    document.title = `Drop - ${cleanName} | Spoolio`;
  }, [drop]);

  const isUpcoming = drop.status === "upcoming";
  const isLive = drop.status === "live";
  const isEnded = drop.status === "ended";

  const formattedDate = new Date(drop.startDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const dTheme = drop.theme;
  const dTitleFont = dTheme?.titleFont || "var(--font-antonio)";

  // Extract gallery photos: either from drop.gallery or fallback to drop.products
  const galleryItems = useMemo<DropGalleryItem[]>(() => {
    if (drop.gallery && drop.gallery.length > 0) {
      return drop.gallery.map((g) => {
        if (typeof g === "string") {
          return { src: g, alt: drop.title, caption: drop.title };
        }
        return g;
      });
    }

    const extracted: DropGalleryItem[] = [];
    drop.products?.forEach((product) => {
      const upGallery = (product as any).attributes?.uniquePieceData?.gallery?.items;
      const cleanProductName = product.name.split("—")[0].trim().replace(/^.+Le\s+/i, "");
      if (Array.isArray(upGallery)) {
        upGallery.forEach((item: any) => {
          if (item.src && !extracted.some((e) => e.src === item.src)) {
            extracted.push({
              src: item.src,
              alt: item.alt || product.name,
              caption: `${product.name}${item.caption ? ` — ${item.caption}` : ""}`,
              category: cleanProductName,
            });
          }
        });
      }

      if (Array.isArray(product.images)) {
        product.images.forEach((img: any) => {
          if (img.src && !extracted.some((e) => e.src === img.src)) {
            extracted.push({
              src: img.src,
              alt: img.alt || product.name,
              caption: product.name,
              category: cleanProductName,
            });
          }
        });
      }
    });

    return extracted;
  }, [drop]);

  const kurbMonstersStory = `Kratch, Crank et Dozy sont les trois premiers Kurb Monsters à sortir de l’atelier.

Chacun a été imaginé comme un véritable petit personnage : une silhouette, une attitude et suffisamment de caractère pour squatter une étagère comme s’il était chez lui.

Pour cette première série, nous avons choisi de ne produire qu’un seul exemplaire Atelier de chaque modèle. Chaque pièce est préparée, peinte, assemblée et finie à la main à Comines.

Une fois ces trois pièces parties, cette édition du drop sera terminée.`;

  const kurbMonstersQuote =
    "Chaque Kurb de cette série est préparé, peint et fini à la main dans notre atelier de Comines. Trois personnages. Trois exemplaires uniques.";

  const storyText =
    drop.slug === "drop-kurb-monsters" || drop.description.includes("40 exemplaires")
      ? kurbMonstersStory
      : drop.description;

  const quoteText =
    drop.slug === "drop-kurb-monsters" || drop.quote?.includes("salve")
      ? kurbMonstersQuote
      : drop.quote || kurbMonstersQuote;

  const taglineText =
    drop.slug === "drop-kurb-monsters" || drop.tagline?.includes("nouveaux voisins")
      ? "Trois gueules. Zéro règle."
      : drop.tagline;

  return (
    <div className="drop-detail-page relative min-h-screen font-sans selection:bg-[#ff4f00] selection:text-white overflow-x-hidden flex flex-col items-center bg-[#FAF9F6] text-zinc-900">
      <Header />

      {/* ============================================================ */}
      {/* 1. HERO PLEIN ÉCRAN CINÉMATOGRAPHIQUE (82vh à 88vh)          */}
      {/* ============================================================ */}
      <section className="relative w-full min-h-[580px] h-[82vh] lg:h-[88vh] max-h-[950px] overflow-hidden select-none flex flex-col justify-between">
        
        {/* Background Visual Media */}
        <div className="absolute inset-0 bg-neutral-900 pointer-events-none">
          {drop.bannerVideo ? (
            <video
              src={drop.bannerVideo}
              poster={drop.bannerImage}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover scale-[1.01] transition-transform duration-1000 ease-out"
            />
          ) : (
            <Image
              src={drop.bannerImage}
              alt={drop.title}
              fill
              priority
              className="object-cover object-center scale-[1.01] transition-transform duration-1000 ease-out"
            />
          )}

          {/* Top Vignette for navigation bar contrast */}
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/75 via-black/35 to-transparent pointer-events-none" />

          {/* Bottom Soft Light Gradient: blends cleanly into Spoolio #FAF9F6 */}
          <div className="absolute inset-x-0 bottom-0 h-[82%] pointer-events-none bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/92 via-55% to-transparent" />
        </div>

        {/* Top Floating Glass Controls Bar */}
        <div className="pt-24 sm:pt-28 px-4 sm:px-8 max-w-[1300px] w-full mx-auto relative z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          {/* Glass Breadcrumb Pill */}
          <nav className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-zinc-200/90 text-xs font-mono font-bold text-zinc-800 shadow-sm transition-all duration-200">
            <Link
              href="/drops"
              className="text-zinc-700 hover:text-[#ff4f00] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
              <span>Tous les Drops</span>
            </Link>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-950 font-black">{drop.dropNumber || "DROP"}</span>
          </nav>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Vente en Direct
              </span>
            ) : isUpcoming ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ff4f00] text-white text-xs font-black uppercase tracking-wider shadow-sm">
                <Clock className="w-3.5 h-3.5" />
                Prochain Drop
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-zinc-700 text-xs font-mono font-bold uppercase tracking-wider border border-zinc-200/90 shadow-sm">
                Édition Clôturée
              </span>
            )}

            {drop.editionSize && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-zinc-900 text-xs font-mono font-black uppercase tracking-wider border border-zinc-200/90 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f00]" />
                <span>{drop.editionSize} PIÈCES ÉDITÉES</span>
              </span>
            )}
          </div>
        </div>

        {/* Centerpiece Hero Bottom Content */}
        <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8 pb-10 sm:pb-14 relative z-20 flex flex-col justify-end space-y-4 pointer-events-auto">
          
          {/* Prefix Badge Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {drop.dropNumber && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ff4f00] text-white font-mono font-black text-xs uppercase tracking-widest shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{drop.dropNumber}</span>
              </span>
            )}

            {drop.badge && (
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full border border-zinc-200/90 shadow-2xs">
                {drop.badge}
              </span>
            )}
          </div>

          {/* Monumental Drop Title */}
          <h1
            className="font-black uppercase tracking-tight leading-[0.95] text-zinc-950"
            style={{
              fontFamily: dTitleFont,
              fontSize: `calc(clamp(2.5rem, 7.5vw, 6.5rem) * ${getDropTitleScale(dTheme?.titleSize)})`,
            }}
          >
            {drop.dropName || drop.title}
          </h1>

          {/* Tagline / Punchline */}
          <div className="space-y-1.5 max-w-3xl">
            <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug text-zinc-800">
              {taglineText}
            </p>
            <p className="text-xs sm:text-sm font-mono tracking-wider uppercase text-zinc-500 font-bold">
              {drop.editionSize ? `Édition Limitée d'Atelier • ${drop.editionSize} Pièces Uniques` : "Édition Limitée d'Atelier • Pièces Uniques"}
            </p>
          </div>

          {/* Quick Action & Countdown Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            
            {/* If Upcoming: Clean Light Countdown Card */}
            {isUpcoming && (
              <div className="inline-flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-3.5 rounded-2xl border border-zinc-200/90 bg-white/95 backdrop-blur-md shadow-md">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#ff4f00]" />
                  <span>Lancement dans :</span>
                </span>
                <DropCountdown
                  targetDate={drop.startDate}
                  onExpire={() => {
                    setTimeout(() => {
                      router.refresh();
                    }, 500);
                  }}
                />
              </div>
            )}

            {/* Smooth Scroll to Products CTA */}
            <a
              href="#catalogue-drop"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-[#ff4f00] text-white hover:bg-[#e04500] shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Explorer les Créations ({drop.products.length})</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </a>

            {/* Smooth Scroll to Gallery CTA */}
            {galleryItems.length > 0 && (
              <a
                href="#galerie-drop"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4 text-[#ff4f00]" />
                <span>Galerie Photo ({galleryItems.length})</span>
              </a>
            )}

          </div>

        </div>

      </section>

      {/* ============================================================ */}
      {/* 2. SECTION ÉDITORIALE : CITATION D'ATELIER & HISTOIRE        */}
      {/* ============================================================ */}
      <section className="w-full max-w-[1240px] px-4 sm:px-8 py-12 sm:py-16 relative z-10 space-y-12">
        
        {/* Grand Pull Quote / Citation d'Atelier */}
        <div className="relative rounded-3xl p-8 sm:p-12 border border-zinc-200/80 bg-white shadow-xs text-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none bg-orange-500/5 blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <Quote className="w-10 h-10 mx-auto text-[#ff4f00] opacity-80" />

            <blockquote className="text-lg sm:text-2xl md:text-3xl font-extrabold italic leading-relaxed tracking-tight text-zinc-900">
              “{quoteText}”
            </blockquote>

            <p className="text-xs sm:text-sm font-mono uppercase tracking-widest font-bold pt-2 text-zinc-500">
              — L'Atelier Spoolio, Comines (Nord, 59)
            </p>
          </div>
        </div>

        {/* 2 Columns: Story & Workshop Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Story narrative */}
          <div className="lg:col-span-7 rounded-3xl p-7 sm:p-9 border border-zinc-200/80 bg-white shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff4f00]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#ff4f00]">
                L'Histoire &amp; la Genèse de ce Drop
              </h2>
            </div>

            <h3
              className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-zinc-900"
              style={{ fontFamily: dTitleFont }}
            >
              Conception d'Atelier &amp; Secrets de Fabrication
            </h3>

            <p className="text-sm sm:text-base leading-relaxed font-normal text-zinc-700 whitespace-pre-line">
              {storyText}
            </p>
          </div>

          {/* Right Column: 4 Workshop Craft Pillars */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            
            <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl shrink-0 bg-orange-50 text-[#ff4f00]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wide text-zinc-900">
                  {drop.editionSize ? `SÉRIE LIMITÉE ${drop.editionSize} PIÈCES` : "SÉRIE LIMITÉE ATELIER"}
                </span>
                <p className="text-xs text-zinc-600">
                  Créations exclusives produites en édition limitée pour ce drop.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl shrink-0 bg-orange-50 text-[#ff4f00]">
                <Palette className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wide text-zinc-900">
                  FABRIQUÉ À LA MAIN À COMINES
                </span>
                <p className="text-xs text-zinc-600">
                  Préparé, imprimé, assemblé et fini avec soin dans notre atelier des Hauts-de-France.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl shrink-0 bg-orange-50 text-[#ff4f00]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wide text-zinc-900">
                  AUTHENTICITÉ ATELIER
                </span>
                <p className="text-xs text-zinc-600">
                  Chaque pièce est vérifiée manuellement avant son expédition soignée.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl shrink-0 bg-orange-50 text-[#ff4f00]">
                <Camera className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wide text-zinc-900">
                  PHOTOS RÉELLES
                </span>
                <p className="text-xs text-zinc-600">
                  Les photos et vidéos montrent fidèlement le rendu réel sorti de l'atelier.
                </p>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ============================================================ */}
      {/* 2b. GALERIE PHOTO D'ATELIER (ÉPURÉE & IMMERSIVE)            */}
      {/* ============================================================ */}
      {galleryItems.length > 0 && (
        <DropGallery
          items={galleryItems}
          title="L'Atelier en Détails"
          subtitle="Clichés authentiques, textures brutes et finitions soignées sous la lumière de l'atelier de Comines."
          badge="Galerie d'Atelier"
        />
      )}

      {/* ============================================================ */}
      {/* 3. GRILLE DE PRODUITS SPÉCIALE « ÉDITION DROP »              */}
      {/* ============================================================ */}
      <section
        id="catalogue-drop"
        className="w-full max-w-[1240px] px-4 sm:px-8 py-12 sm:py-16 relative z-10 scroll-mt-20 space-y-8"
      >
        
        {/* Products Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-2.5 bg-orange-50 text-[#ff4f00] border border-orange-200/60">
              <Package className="w-3.5 h-3.5" />
              <span>SÉRIE LIMITÉE EXCLUSIVE • {drop.products.length} CRÉATION(S)</span>
            </div>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-zinc-900"
              style={{ fontFamily: dTitleFont }}
            >
              Les Créations du {drop.dropName || drop.title}
            </h2>

            <p className="text-xs sm:text-sm mt-1 text-zinc-600">
              Tirage limité d'atelier. Une fois parties, elles ne reviendront pas.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isUpcoming && (
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-[#ff4f00]">
                🔒 VENTE ACTIVE DÈS LE {formattedDate.toUpperCase()}
              </span>
            )}
            {isEnded && (
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-600">
                📦 Tirage clôturé
              </span>
            )}
          </div>
        </div>

        {/* Enhanced Drop Product Grid */}
        {drop.products && drop.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {drop.products.map((product) => (
              <div
                key={product.id}
                className="relative group/dropcard rounded-3xl p-1 transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Standard robust Spoolio Product Card */}
                {isUpcoming ? (
                  <div className="relative overflow-hidden rounded-[22px] sm:rounded-[28px]">
                    <div className="pointer-events-none select-none opacity-85 filter contrast-90">
                      <ProductCard product={product} hideBadge={true} />
                    </div>
                    {/* Locked Badge Overlay */}
                    <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex flex-col items-center justify-center p-5 text-center z-30 transition-all group-hover/dropcard:bg-black/65">
                      <div className="w-12 h-12 rounded-2xl bg-black/80 border border-white/20 flex items-center justify-center mb-3 shadow-2xl text-[#ff5500]">
                        <Lock className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono font-black text-white uppercase tracking-wider">
                        Dévoilé le {formattedDate}
                      </span>
                      <p className="text-[11px] text-zinc-300 font-medium mt-1.5 max-w-[200px]">
                        Fiche et commande disponibles dès le lancement
                      </p>
                    </div>
                  </div>
                ) : (
                  <ProductCard product={product} hideBadge={true} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl border border-zinc-200/80 bg-white shadow-xs space-y-3">
            <Package className="w-8 h-8 mx-auto text-[#ff4f00] opacity-80" />
            <p className="text-sm font-bold text-zinc-900">
              Créations en cours d'inspection
            </p>
            <p className="text-xs text-zinc-600">
              Les pièces de ce drop sont en phase de préparation finale en atelier. Revenez très bientôt !
            </p>
          </div>
        )}

        {/* Back Link to Hub */}
        <div className="pt-12 flex justify-center">
          <Link
            href="/drops"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-zinc-200 bg-white text-zinc-900 text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Découvrir les autres Drops Spoolio</span>
          </Link>
        </div>

      </section>

      <Footer />
    </div>
  );
}
