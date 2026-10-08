"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard, { Product } from "@/components/ProductCard";
import DropCountdown from "@/components/drops/DropCountdown";
import DropGallery from "@/components/drops/DropGallery";
import { Drop, DropGalleryItem } from "@/lib/drops";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Calendar,
  Clock,
  ArrowLeft,
  ArrowDown,
  Package,
  Quote,
  ShieldCheck,
  Truck,
  MapPin,
  Flame,
  CheckCircle2,
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
  const dBg = dTheme?.bgColor || "#0b0b0e";
  const dText = dTheme?.textColor || "#ffffff";
  const dSubtitle = dTheme?.subtitleColor || "#d8b4fe";
  const dAccent = dTheme?.accentColor || "#ff4f00";
  const dBorder = dTheme?.borderColor || "rgba(255, 255, 255, 0.15)";
  const dCardBg = dTheme?.cardBgColor || "rgba(255, 255, 255, 0.05)";
  const dTitleFont = dTheme?.titleFont || "var(--font-antonio)";
  const dBadgeBg = dTheme?.badgeBgColor || "rgba(255, 79, 0, 0.2)";
  const dBadgeText = dTheme?.badgeTextColor || dAccent;
  const dBtnBg = dTheme?.buttonBgColor || dAccent;
  const dBtnText = dTheme?.buttonTextColor || "#ffffff";

  // Check if dark theme
  const isDark = dText.toLowerCase() === "#ffffff" || dBg.includes("#18") || dBg.includes("#0") || dBg.includes("black");
  const blendColor = isDark ? "#0d0617" : "#fafaf9";

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

    // Fallback: extract from drop.products
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
    <div
      className="drop-detail-page no-invert relative min-h-screen font-sans selection:bg-[#ff4f00] selection:text-white overflow-x-hidden flex flex-col items-center"
      style={{ background: dBg, color: dText }}
    >
      <Header isDark={isDark} />

      {/* ============================================================ */}
      {/* 1. HERO PLEIN ÉCRAN CINÉMATOGRAPHIQUE (82vh à 88vh)          */}
      {/* ============================================================ */}
      <section className="relative w-full min-h-[580px] h-[82vh] lg:h-[88vh] max-h-[950px] overflow-hidden select-none flex flex-col justify-between">
        
        {/* Background Visual Media (Video loop or High-Res Image) */}
        <div className="absolute inset-0 bg-neutral-950 pointer-events-none">
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
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none" />

          {/* Bottom Immersive Gradient: blends seamlessly into drop theme background */}
          <div
            className="absolute inset-x-0 bottom-0 h-3/4 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${blendColor} 0%, ${blendColor}ee 25%, ${blendColor}99 55%, transparent 100%)`,
            }}
          />
        </div>

        {/* Top Floating Glass Controls Bar */}
        <div className="pt-24 sm:pt-28 px-4 sm:px-8 max-w-[1300px] w-full mx-auto relative z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          {/* Glass Breadcrumb Pill */}
          <nav className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 text-xs font-mono font-bold text-white keep-white no-invert shadow-xl transition-all duration-200">
            <Link
              href="/drops"
              className="text-white hover:text-[#ff4f00] transition-colors flex items-center gap-1.5"
              style={{ color: "#ffffff" }}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-white" />
              <span className="text-white" style={{ color: "#ffffff" }}>Tous les Drops</span>
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-white font-black" style={{ color: "#ffffff" }}>{drop.dropNumber || "DROP"}</span>
          </nav>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Vente en Direct
              </span>
            ) : isUpcoming ? (
              <span
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-xs font-black uppercase tracking-wider shadow-lg"
                style={{ backgroundColor: dAccent, color: "#ffffff" }}
              >
                <Clock className="w-3.5 h-3.5" />
                Prochain Drop
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl text-white keep-white no-invert text-xs font-mono font-bold uppercase tracking-wider border border-white/20 shadow-xl"
                style={{ color: "#ffffff" }}
              >
                Édition Clôturée
              </span>
            )}

            <span
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl text-white keep-white no-invert text-xs font-mono font-black uppercase tracking-wider border border-white/20 shadow-xl"
              style={{ color: "#ffffff" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500]" />
              <span>3 PIÈCES UNIQUES</span>
            </span>
          </div>
        </div>

        {/* Centerpiece Hero Bottom Content */}
        <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8 pb-10 sm:pb-14 relative z-20 flex flex-col justify-end space-y-5 pointer-events-auto">
          
          {/* Prefix Badge Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {drop.dropNumber && (
              <span
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-white keep-white no-invert font-mono font-black text-xs uppercase tracking-widest shadow-xl"
                style={{
                  backgroundColor: dAccent,
                  color: "#ffffff",
                  boxShadow: `0 0 20px -2px ${dAccent}80`,
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span style={{ color: "#ffffff" }}>{drop.dropNumber}</span>
              </span>
            )}

            {drop.badge && (
              <span
                className="text-xs font-mono font-bold uppercase tracking-wider text-white keep-white no-invert bg-white/10 backdrop-blur-xl px-3.5 py-1 rounded-full border border-white/20 shadow-lg"
                style={{ color: "#ffffff" }}
              >
                {drop.badge}
              </span>
            )}
          </div>

          {/* Monumental Drop Title */}
          <h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.95] drop-shadow-2xl text-white keep-white no-invert"
            style={{
              fontFamily: dTitleFont,
              color: "#ffffff",
              textShadow: "0 6px 30px rgba(0,0,0,0.8)",
            }}
          >
            {drop.dropName || drop.title}
          </h1>

          {/* Tagline / Punchline */}
          <div className="space-y-1.5 max-w-3xl">
            <p
              className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug drop-shadow-md"
              style={{ color: dSubtitle }}
            >
              {taglineText}
            </p>
            <p className="text-xs sm:text-sm font-mono tracking-wider uppercase text-white/80 font-bold">
              Trois pièces uniques. Pas une de plus.
            </p>
          </div>

          {/* Quick Action & Countdown Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            
            {/* If Upcoming: Sleek Countdown Card */}
            {isUpcoming && (
              <div
                className="inline-flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 sm:p-4 rounded-2xl border backdrop-blur-md"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.65)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  boxShadow: `0 10px 25px -5px ${dAccent}30`,
                }}
              >
                <span
                  className="text-xs font-mono font-bold uppercase tracking-wider text-white keep-white no-invert flex items-center gap-1.5"
                  style={{ color: "#ffffff" }}
                >
                  <Clock className="w-4 h-4" style={{ color: dAccent }} />
                  <span>Lancement dans :</span>
                </span>
                <DropCountdown
                  targetDate={drop.startDate}
                  theme={dTheme}
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
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
              style={{
                backgroundColor: dBtnBg,
                color: dBtnText,
                boxShadow: `0 12px 30px -5px ${dAccent}70`,
              }}
            >
              <span>Explorer les Créations ({drop.products.length})</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </a>

            {/* Smooth Scroll to Gallery CTA */}
            {galleryItems.length > 0 && (
              <a
                href="#galerie-drop"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xl"
              >
                <Camera className="w-4 h-4 text-white" />
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
        <div
          className="relative rounded-3xl p-8 sm:p-12 border overflow-hidden backdrop-blur-md shadow-2xl text-center"
          style={{
            backgroundColor: dCardBg,
            borderColor: dBorder,
          }}
        >
          {/* Subtle Accent Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
            style={{ backgroundColor: dAccent }}
          />

          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <Quote
              className="w-12 h-12 mx-auto opacity-35"
              style={{ color: dAccent }}
            />

            <blockquote
              className="text-lg sm:text-2xl md:text-3xl font-extrabold italic leading-relaxed tracking-tight"
              style={{ color: dText }}
            >
              “{quoteText}”
            </blockquote>

            <p
              className="text-xs sm:text-sm font-mono uppercase tracking-widest font-bold pt-2"
              style={{ color: dSubtitle }}
            >
              — L'Atelier Spoolio, Comines (Nord, 59)
            </p>
          </div>
        </div>

        {/* 2 Columns: Story & Workshop Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Story narrative */}
          <div
            className="lg:col-span-7 rounded-3xl p-7 sm:p-9 border backdrop-blur-md space-y-4 shadow-xl"
            style={{ backgroundColor: dCardBg, borderColor: dBorder }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: dAccent }}
              />
              <h2
                className="text-xs font-mono font-bold uppercase tracking-wider"
                style={{ color: dAccent }}
              >
                L'Histoire &amp; la Genèse de ce Drop
              </h2>
            </div>

            <h3
              className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight"
              style={{ fontFamily: dTitleFont, color: dText }}
            >
              Conception d'Atelier &amp; Secrets de Fabrication
            </h3>

            <p
              className="text-sm sm:text-base leading-relaxed font-medium whitespace-pre-line"
              style={{ color: dSubtitle }}
            >
              {storyText}
            </p>
          </div>

          {/* Right Column: 4 Workshop Craft Pillars */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            
            <div
              className="p-5 rounded-2xl border backdrop-blur-xs flex items-start gap-3.5 shadow-md"
              style={{ backgroundColor: dCardBg, borderColor: dBorder }}
            >
              <div
                className="p-2.5 rounded-xl shrink-0"
                style={{ backgroundColor: dBadgeBg, color: dBadgeText }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wide" style={{ color: dText }}>
                  PIÈCE 01/01
                </span>
                <p className="text-xs" style={{ color: dSubtitle }}>
                  Un seul exemplaire Atelier de chaque personnage pour ce drop.
                </p>
              </div>
            </div>

            <div
              className="p-5 rounded-2xl border backdrop-blur-xs flex items-start gap-3.5 shadow-md"
              style={{ backgroundColor: dCardBg, borderColor: dBorder }}
            >
              <div
                className="p-2.5 rounded-xl shrink-0"
                style={{ backgroundColor: dBadgeBg, color: dBadgeText }}
              >
                <Palette className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wide" style={{ color: dText }}>
                  PEINT À LA MAIN À COMINES
                </span>
                <p className="text-xs" style={{ color: dSubtitle }}>
                  Préparé, peint, assemblé et fini individuellement dans notre atelier.
                </p>
              </div>
            </div>

            <div
              className="p-5 rounded-2xl border backdrop-blur-xs flex items-start gap-3.5 shadow-md"
              style={{ backgroundColor: dCardBg, borderColor: dBorder }}
            >
              <div
                className="p-2.5 rounded-xl shrink-0"
                style={{ backgroundColor: dBadgeBg, color: dBadgeText }}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wide" style={{ color: dText }}>
                  CARTE COLLECTOR INCLUSE
                </span>
                <p className="text-xs" style={{ color: dSubtitle }}>
                  Chaque Kurb est accompagné de sa carte DROP 001 dédiée et numérotée.
                </p>
              </div>
            </div>

            <div
              className="p-5 rounded-2xl border backdrop-blur-xs flex items-start gap-3.5 shadow-md"
              style={{ backgroundColor: dCardBg, borderColor: dBorder }}
            >
              <div
                className="p-2.5 rounded-xl shrink-0"
                style={{ backgroundColor: dBadgeBg, color: dBadgeText }}
              >
                <Camera className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wide" style={{ color: dText }}>
                  CELUI DES PHOTOS
                </span>
                <p className="text-xs" style={{ color: dSubtitle }}>
                  La pièce que vous voyez sur les photos est exactement celle que vous recevrez.
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
          theme={dTheme}
          title="L'Atelier en Détails"
          subtitle="Clichés authentiques, textures brutes et finitions peintes à la main sous la lumière de l'atelier de Comines."
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
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b"
          style={{ borderColor: dBorder }}
        >
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-2.5"
              style={{ backgroundColor: dBadgeBg, color: dBadgeText }}
            >
              <Package className="w-3.5 h-3.5" />
              <span>SÉRIE LIMITÉE EXCLUSIVE • 3 PIÈCES UNIQUES</span>
            </div>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight"
              style={{ fontFamily: dTitleFont, color: dText }}
            >
              Les Créations du {drop.dropName || drop.title}
            </h2>

            <p className="text-xs sm:text-sm mt-1" style={{ color: dSubtitle }}>
              3 personnages. 3 pièces uniques. Une fois parties, elles ne reviendront pas.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isUpcoming && (
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl bg-black/60 backdrop-blur border border-white/20 text-white shadow-lg">
                🔒 VENTE ACTIVE DÈS LE 10 OCTOBRE 2026 À 20:00
              </span>
            )}
            {isEnded && (
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur border border-white/20 text-zinc-300">
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
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${dAccent}25, transparent 75%)`,
                }}
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
                        Dévoilé le 10 octobre 2026 à 20:00
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
          <div
            className="p-12 text-center rounded-3xl border backdrop-blur-md space-y-3"
            style={{ backgroundColor: dCardBg, borderColor: dBorder }}
          >
            <Package className="w-8 h-8 mx-auto opacity-40" style={{ color: dAccent }} />
            <p className="text-sm font-bold" style={{ color: dText }}>
              Créations en cours d'inspection
            </p>
            <p className="text-xs" style={{ color: dSubtitle }}>
              Les pièces de ce drop sont en phase de préparation finale en atelier. Revenez très bientôt !
            </p>
          </div>
        )}

        {/* Back Link to Hub */}
        <div className="pt-12 flex justify-center">
          <Link
            href="/drops"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-xl backdrop-blur-md cursor-pointer"
            style={{
              backgroundColor: dCardBg,
              borderColor: dBorder,
              color: dText,
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Découvrir les autres Drops Spoolio</span>
          </Link>
        </div>

      </section>

      <Footer isDark={isDark} />
    </div>
  );
}
