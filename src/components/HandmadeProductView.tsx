"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  ShieldCheck,
  Award,
  Sparkles,
  Camera,
  Hammer,
  BookOpen,
  Ruler,
  Box,
  HelpCircle,
  Palette,
  MapPin,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  ShoppingBag,
  ArrowDown,
  ArrowUpRight,
  Truck,
  Play,
  Pause,
  Film,
  Images,
} from "lucide-react";
import { Product } from "@/components/ProductCard";
import { getDefaultUniquePieceData, UniquePieceData } from "@/lib/uniquePieceDefaults";
import { isVideoMedia, isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnail } from "@/lib/mediaUtils";

function stripEmojis(text: string = ""): string {
  return text
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isTechnicalLabel(str?: string): boolean {
  if (!str) return true;
  const s = str.trim();
  if (/^DSC\d+/i.test(s)) return true;
  if (/^IMG[_\d]+/i.test(s)) return true;
  if (/^PXL[_\d]+/i.test(s)) return true;
  if (/upload_\d+/i.test(s)) return true;
  if (/\.(webp|jpg|jpeg|png)$/i.test(s)) return true;
  if (/KurbMonsters\s*\d+/i.test(s)) return true;
  if (/Edition\s*-\s*DSC/i.test(s)) return true;
  if (s.toLowerCase().includes("dsc4")) return true;
  if (s.toLowerCase().includes("fait-main")) return true;
  if (s.toLowerCase().startsWith("spoolio")) return true;
  return false;
}

function renderPerkIcon(icon: string = "", text: string = "") {
  const lower = (icon + " " + text).toLowerCase();
  if (lower.includes("peint") || lower.includes("palette") || lower.includes("art") || lower.includes("couleur")) {
    return <Palette color="#ff4f00" style={{ color: "#ff4f00", stroke: "#ff4f00" }} className="w-3.5 h-3.5 shrink-0" />;
  }
  if (lower.includes("sign") || lower.includes("signature") || lower.includes("award") || lower.includes("certif")) {
    return <Award color="#60a5fa" style={{ color: "#60a5fa", stroke: "#60a5fa" }} className="w-3.5 h-3.5 shrink-0" />;
  }
  if (lower.includes("comines") || lower.includes("france") || lower.includes("atelier") || lower.includes("mappin") || lower.includes("fabriq")) {
    return <MapPin color="#fbbf24" style={{ color: "#fbbf24", stroke: "#fbbf24" }} className="w-3.5 h-3.5 shrink-0" />;
  }
  if (lower.includes("vernis") || lower.includes("protect") || lower.includes("shield")) {
    return <ShieldCheck color="#34d399" style={{ color: "#34d399", stroke: "#34d399" }} className="w-3.5 h-3.5 shrink-0" />;
  }
  return <Sparkles color="#ff4f00" style={{ color: "#ff4f00", stroke: "#ff4f00" }} className="w-3.5 h-3.5 shrink-0" />;
}

interface HandmadeProductViewProps {
  product: Product;
  displayName: string;
  displayShortDesc: string;
  displayFullDesc: string;
  currentPrice: string;
  selectedOptions: Record<string, string>;
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  handleAddToCart: () => void;
  isAdded: boolean;
  onToggleStandardView?: () => void;
  isStandardAvailable?: boolean;
}

export default function HandmadeProductView({
  product,
  displayName,
  displayShortDesc,
  displayFullDesc,
  currentPrice,
  selectedOptions,
  setSelectedOptions,
  quantity,
  setQuantity,
  handleAddToCart,
  isAdded,
  onToggleStandardView,
  isStandardAvailable = true,
}: HandmadeProductViewProps) {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const buyCardRef = useRef<HTMLDivElement>(null);
  const gallerySliderRef = useRef<HTMLDivElement>(null);

  const mainImage = product.images?.[0]?.src || "/images/produits/monstre-skateur-fait-main.jpg";
  const mainImageAlt = product.images?.[0]?.alt || displayName;

  const scrollToBuy = () => {
    if (buyCardRef.current) {
      buyCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };


  // Helper to format prices
  const formatPrice = (p: string | number | undefined | null) => {
    if (!p) return "0,00";
    const num = typeof p === "number" ? p : parseFloat(String(p).replace(",", "."));
    return isNaN(num) ? "0,00" : num.toFixed(2).replace(".", ",");
  };

  // Load custom uniquePieceData or fall back to crafted defaults
  let rawUniqueData: any = null;
  if (product && product.attributes) {
    try {
      const parsed = typeof product.attributes === "string" ? JSON.parse(product.attributes) : product.attributes;
      rawUniqueData = parsed.uniquePieceData;
    } catch {}
  }

  const defaultData = getDefaultUniquePieceData(displayName);

  // Consolidate gallery images
  const fallbackGalleryItems = (product.images && product.images.length > 0)
    ? product.images.map((img: any) => ({
        src: img.src,
        caption: img.alt || img.name || displayName,
        alt: img.alt || displayName,
      }))
    : defaultData.gallery.items;

  const rawGalleryItems = rawUniqueData?.gallery?.items;
  const galleryItems = (Array.isArray(rawGalleryItems) && rawGalleryItems.length > 0)
    ? rawGalleryItems
    : fallbackGalleryItems;

  const data: UniquePieceData = {
    hero: { ...defaultData.hero, ...(rawUniqueData?.hero || {}) },
    gallery: {
      ...defaultData.gallery,
      ...(rawUniqueData?.gallery || {}),
      items: galleryItems,
    },
    savoirFaire: {
      ...defaultData.savoirFaire,
      ...(rawUniqueData?.savoirFaire || {}),
      steps: rawUniqueData?.savoirFaire?.steps || defaultData.savoirFaire.steps,
    },
    lore: {
      ...defaultData.lore,
      ...(rawUniqueData?.lore || {}),
      paragraphs: rawUniqueData?.lore?.paragraphs || defaultData.lore.paragraphs,
    },
    specs: {
      ...defaultData.specs,
      ...(rawUniqueData?.specs || {}),
      items: rawUniqueData?.specs?.items || defaultData.specs.items,
    },
    ecrin: {
      ...defaultData.ecrin,
      ...(rawUniqueData?.ecrin || {}),
      points: rawUniqueData?.ecrin?.points || defaultData.ecrin.points,
    },
    faq: {
      ...defaultData.faq,
      ...(rawUniqueData?.faq || {}),
      items: rawUniqueData?.faq?.items || defaultData.faq.items,
    },
    videoSection: {
      ...defaultData.videoSection,
      ...(rawUniqueData?.videoSection || {}),
    },
  };

  // Video Cover (Hero) state
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [isHeroPlaying, setIsHeroPlaying] = useState(true);

  const heroVideoUrl = data.hero?.video || (isVideoMedia(mainImage) ? mainImage : null);
  const hasHeroVideo = Boolean(heroVideoUrl);
  const isHeroYouTube = heroVideoUrl ? isYouTubeUrl(heroVideoUrl) : false;

  // Liste unifiée des médias plein écran (Couverture Hero en #0 puis Galerie)
  const allLightboxItems = useMemo(() => {
    const list: { src: string; caption?: string; alt?: string; type?: "image" | "video" }[] = [];

    // 1. Média de couverture Hero toujours en premier (#0)
    if (hasHeroVideo && heroVideoUrl) {
      list.push({
        src: heroVideoUrl,
        caption: "Vidéo de Couverture d'Atelier",
        alt: `${displayName} — Vidéo de couverture`,
        type: "video",
      });
    } else if (mainImage) {
      list.push({
        src: mainImage,
        caption: "Photo de Couverture",
        alt: `${displayName} — Couverture principale`,
        type: "image",
      });
    }

    // 2. Ajout des photos & vidéos de la galerie
    galleryItems.forEach((item) => {
      if (item.src && item.src !== heroVideoUrl && item.src !== mainImage) {
        list.push(item);
      } else if (item.src && list.length === 0) {
        list.push(item);
      }
    });

    if (list.length === 0) {
      list.push({
        src: mainImage || "/images/produits/monstre-skateur-fait-main.jpg",
        caption: displayName,
        alt: displayName,
        type: "image",
      });
    }

    return list;
  }, [hasHeroVideo, heroVideoUrl, mainImage, displayName, galleryItems]);

  const toggleHeroPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!heroVideoRef.current) return;
    if (heroVideoRef.current.paused) {
      heroVideoRef.current.play();
      setIsHeroPlaying(true);
    } else {
      heroVideoRef.current.pause();
      setIsHeroPlaying(false);
    }
  };

  // Défilement fluide de la galerie sur 2 lignes
  const scrollGallery = (direction: "left" | "right") => {
    if (!gallerySliderRef.current) return;
    const scrollAmount = Math.max(320, Math.floor(gallerySliderRef.current.clientWidth * 0.75));
    gallerySliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Détection du défilement pour la pagination
  const handleGalleryScroll = () => {
    if (!gallerySliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = gallerySliderRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setActiveGalleryIndex(0);
      return;
    }
    const ratio = Math.min(Math.max(0, scrollLeft / maxScroll), 1);
    const index = Math.round(ratio * (Math.max(1, galleryItems.length - 1)));
    setActiveGalleryIndex(index);
  };

  // Navigation clavier pour la Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : allLightboxItems.length - 1
        );
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null && prev < allLightboxItems.length - 1 ? prev + 1 : 0
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, allLightboxItems.length]);

  return (
    <div className="w-full bg-white text-zinc-900 font-sans selection:bg-[#ff4f00] selection:text-black">
      {/* ============================================================ */}
      {/* PARTIE NOIRE : LE HAUT + LE BLOC D'ACHAT                     */}
      {/* ============================================================ */}
      <div className="w-full bg-[#0b0b0e] text-zinc-100 font-sans selection:bg-[#ff4f00] selection:text-black no-invert keep-white pb-12 sm:pb-16">
        {/* ============================================================ */}
        {/* 1. HERO SECTION PLEINE LARGEUR SOUS LE MENU                 */}
        {/* ============================================================ */}
        <section className="relative w-full h-[72vh] sm:h-[80vh] lg:h-[86vh] min-h-[520px] max-h-[860px] overflow-hidden bg-black select-none">
          {/* Background Full Bleed Media (Video or Product Image) */}
          {hasHeroVideo ? (
            <div className="absolute inset-0">
              {isHeroYouTube ? (
                <iframe
                  src={getYouTubeEmbedUrl(heroVideoUrl!) || ""}
                  title={displayName}
                  className="w-full h-full object-cover pointer-events-none scale-125"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <video
                  ref={heroVideoRef}
                  src={heroVideoUrl!}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={mainImage && !isVideoMedia(mainImage) ? mainImage : undefined}
                  className="w-full h-full object-cover object-center transform scale-100"
                />
              )}

              {/* Floating Hero Video Controls (Play/Pause only) */}
              {!isHeroYouTube && (
                <div className="absolute top-24 sm:top-28 right-4 sm:right-32 z-30 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleHeroPlay}
                    className="p-2.5 rounded-full bg-black/60 hover:bg-[#ff4f00] text-white border border-white/20 backdrop-blur-md transition-all shadow-xl cursor-pointer"
                    title={isHeroPlaying ? "Mettre en pause" : "Lire la vidéo"}
                  >
                    {isHeroPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                </div>
              )}

              {/* Top Subtle Vignette */}
              <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none" />

              {/* Bottom Dramatic Gradient for Text Legibility */}
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#0b0b0e] via-[#0b0b0e]/75 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div 
              onClick={() => setLightboxIndex(0)}
              className="absolute inset-0 cursor-zoom-in group/hero"
            >
              <Image
                src={mainImage}
                alt={mainImageAlt}
                fill
                priority
                className="object-cover object-center sm:object-[center_35%] transform scale-100 group-hover/hero:scale-[1.015] transition-transform duration-700 ease-out"
              />

              {/* Top Subtle Vignette to separate menu */}
              <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none" />

              {/* Bottom Dramatic Gradient for Text Legibility */}
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#0b0b0e] via-[#0b0b0e]/75 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Top Control Bar (Pills & Quick Switcher) */}
          <div className="absolute top-24 sm:top-28 inset-x-0 px-4 sm:px-8 z-20 flex items-center justify-between pointer-events-auto">
            {/* Breadcrumb Glass Pill (High contrast & no-invert) */}
            <nav className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#18181b] border border-white/20 text-xs font-bold text-white shadow-2xl no-invert select-none">
              <Link href="/" className="text-zinc-200 hover:text-white transition-colors">
                Accueil
              </Link>
              <span className="text-zinc-500 font-bold">/</span>
              <Link href="/boutique" className="text-zinc-200 hover:text-white transition-colors">
                Boutique
              </Link>
              <span className="text-zinc-500 font-bold">/</span>
              <span className="text-[#ff4f00] font-black">
                Fait Main
              </span>
            </nav>

            {/* Right Controls: Fullscreen Zoom */}
            <div className="flex items-center gap-2.5 no-invert">
              <button
                type="button"
                onClick={() => setLightboxIndex(0)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#18181b] hover:bg-[#ff4f00] border border-white/20 text-xs font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer no-invert"
                title="Agrandir en plein écran"
              >
                <Maximize2 color="#ffffff" style={{ color: "#ffffff", stroke: "#ffffff" }} className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Plein Écran</span>
              </button>
            </div>
          </div>

          {/* HERO CONTENT OVERLAY (Bottom-Aligned on the Image) */}
          <div className="absolute inset-x-0 bottom-0 z-20 px-4 sm:px-8 lg:px-12 pb-8 sm:pb-12 max-w-7xl mx-auto flex flex-col justify-end">

            {/* Main Product Name */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] mb-3 drop-shadow-md max-w-4xl">
              {displayName}
            </h1>

            {/* Subtitle / Punchline */}
            <p className="text-sm sm:text-base lg:text-lg text-zinc-300 font-medium max-w-2xl leading-relaxed mb-6 drop-shadow">
              {data.hero.punchline}
            </p>

            {/* Action & Price Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              {/* Price section */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  {formatPrice(currentPrice)}€
                </span>
              </div>

              {/* Micro-perks pills: Peint à la main · Signé · Fabriqué à Comines */}
              {(() => {
                const perks = (data.hero.microPerks && data.hero.microPerks.length > 0)
                  ? data.hero.microPerks.map((p) => {
                      if (p.text.toLowerCase().includes("vernis")) return { icon: "award", text: "Signé" };
                      if (p.text.toLowerCase().includes("atelier de comines")) return { icon: "mappin", text: "Fabriqué à Comines" };
                      return p;
                    })
                  : [
                      { icon: "palette", text: "Peint à la main" },
                      { icon: "award", text: "Signé" },
                      { icon: "mappin", text: "Fabriqué à Comines" },
                    ];

                return (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-zinc-300">
                    {perks.map((perk, idx) => (
                      <span
                        key={`perk-${idx}`}
                        className="flex items-center gap-2 bg-black/50 px-3.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-md text-xs font-bold text-zinc-200 shadow-sm"
                      >
                        {renderPerkIcon(perk.icon, perk.text)}
                        <span>{stripEmojis(perk.text)}</span>
                      </span>
                    ))}
                  </div>
                );
              })()}

              {/* Scroll to Action CTA Button */}
              <button
                type="button"
                onClick={scrollToBuy}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-[#ff4f00] hover:bg-[#ff6524] text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#ff4f00]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Adopter cette pièce</span>
                <ArrowDown color="#ffffff" style={{ color: "#ffffff", stroke: "#ffffff" }} className="w-4 h-4 animate-bounce" />
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. BENTO HAUT : COMMANDE D'ATELIER & SAVOIR-FAIRE EN FACE   */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* CARTE 1 : COMMANDE D'ATELIER (Col span 7) */}
            <div
              ref={buyCardRef}
              className="lg:col-span-7 bg-gradient-to-b from-zinc-900/95 to-zinc-900/80 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between"
            >
              {/* Ambient subtle glow */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#ff4f00]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-widest text-[#ff4f00] mb-1">
                      Commande d'Atelier
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Adopter cette Pièce Unique
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {formatPrice(currentPrice)}€
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      ● Prêt à expédier
                    </div>
                  </div>
                </div>

                {/* Presentation note */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
                  Chaque pièce fait main est signée et soigneusement inspectée avant son départ. Une seule unité disponible pour cette référence d'atelier.
                </p>

                {/* Collector Badge & Direct Add to Cart */}
                <div className="space-y-4 mb-6">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Badge 1/1 Unique */}
                    <div className="flex items-center gap-2.5 px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <div className="text-left">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Édition d'Atelier</div>
                        <div className="text-xs font-black text-white">Exemplaire 1/1 unique</div>
                      </div>
                    </div>

                    {/* Big Add to Cart Button */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xl ${
                        isAdded
                          ? "bg-emerald-500 text-white shadow-emerald-500/30 scale-100"
                          : "bg-[#ff4f00] hover:bg-[#ff6524] text-white shadow-[#ff4f00]/30 hover:scale-[1.01] active:scale-[0.99]"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-5 h-5 animate-scale" strokeWidth={3} />
                          <span>Ajouté au panier !</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-5 h-5" strokeWidth={2.5} />
                          <span>Adopter cette pièce unique • {formatPrice(currentPrice)}€</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Reassurance Footer */}
              <div className="pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-zinc-400 font-medium">
                <div className="flex items-center gap-2">
                  <Package color="#a1a1aa" style={{ color: "#a1a1aa", stroke: "#a1a1aa" }} className="w-4 h-4 shrink-0" />
                  <span>Expédition protégée sous 48h</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck color="#a1a1aa" style={{ color: "#a1a1aa", stroke: "#a1a1aa" }} className="w-4 h-4 shrink-0" />
                  <span>Paiement sécurisé Stripe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award color="#ff4f00" style={{ color: "#ff4f00", stroke: "#ff4f00" }} className="w-4 h-4 shrink-0" />
                  <span>Certificat signé par l'artisan</span>
                </div>
              </div>
            </div>

            {/* CARTE 2 : LE SAVOIR-FAIRE ARTISANAL (Col span 5) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-zinc-900/90 to-zinc-900/60 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              <div>
                <div 
                  style={{ color: "#ffffff" }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white !text-white text-[10px] font-extrabold uppercase tracking-wider mb-3 no-invert keep-white shadow-xs"
                >
                  <Hammer color="#ffffff" style={{ color: "#ffffff", stroke: "#ffffff" }} className="w-3.5 h-3.5 shrink-0" />
                  <span style={{ color: "#ffffff" }} className="text-white !text-white no-invert keep-white">
                    {stripEmojis(data.savoirFaire.badge)}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                  {data.savoirFaire.title}
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  {data.savoirFaire.intro}
                </p>

                {/* Steps Timeline */}
                <div className="space-y-4">
                  {data.savoirFaire.steps.map((step, idx) => (
                    <div key={`step-${idx}`} className="flex items-start gap-3.5">
                      <div className="w-7 h-7 rounded-full bg-[#ff4f00]/20 border border-[#ff4f00]/50 text-[#ff4f00] font-black text-xs flex items-center justify-center shrink-0">
                        {step.stepNumber || idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{step.title}</div>
                        <div className="text-[11px] text-zinc-400 leading-snug">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {data.savoirFaire.quote && (
                <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-full bg-zinc-800 border border-[#ff4f00]/40 overflow-hidden shrink-0 shadow-md">
                    <Image
                      src="/images/vivien-avatar.png"
                      alt="Vivien Bocquelet - Artisan & Fondateur Spoolio"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-amber-300/90 italic leading-snug">
                      {data.savoirFaire.quote}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-white">Vivien Bocquelet</span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-[#ff4f00]/20 text-[#ff4f00] border border-[#ff4f00]/30">
                        Artisan & Fondateur Spoolio
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* PARTIE BLANCHE : A PARTIR DE LA GALERIE PHOTO                */}
      {/* ============================================================ */}
      <div className="w-full bg-white text-zinc-900 font-sans">
        {/* ============================================================ */}
        {/* 3. GALERIE PHOTO 100% PLEINE LARGEUR (ÉPURÉE & GALERIE D'ART) */}
        {/* ============================================================ */}
        <section className="w-full bg-zinc-50 border-t border-b border-zinc-200/80 py-12 sm:py-20 relative overflow-hidden select-none">
          {/* Subtle atmospheric ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[350px] bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10 flex flex-wrap items-end justify-between gap-6 relative z-10">
            <div className="max-w-2xl">
              {data.gallery.badge && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-[10px] font-extrabold uppercase tracking-wider text-zinc-800 mb-3 shadow-2xs">
                  <Camera className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                  <span>{stripEmojis(data.gallery.badge)}</span>
                </div>
              )}
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight">
                {data.gallery.title || "Vues détaillées"}
              </h2>
              {data.gallery.description && (
                <p className="mt-2 text-xs sm:text-base text-zinc-600 leading-relaxed">
                  {data.gallery.description}
                </p>
              )}
            </div>

            {/* Bouton d'accès direct plein écran */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLightboxIndex(0)}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-[#ff4f00] text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                title="Parcourir toutes les photos en plein écran"
              >
                <Images className="w-4 h-4 text-white" />
                <span>Ouvrir la galerie ({allLightboxItems.length})</span>
              </button>
            </div>
          </div>

          {/* BENTO GRID ÉDITORIALE (1 grande photo phare + 6 vignettes sur 2 lignes) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {galleryItems.length <= 4 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {galleryItems.map((item, idx) => {
                  const isVid = isVideoMedia(item.src) || item.type === "video";
                  const isItemYT = isYouTubeUrl(item.src);
                  return (
                    <div
                      key={`gallery-item-${idx}`}
                      onClick={() => {
                        const targetIdx = allLightboxItems.findIndex((it) => it.src === item.src);
                        setLightboxIndex(targetIdx >= 0 ? targetIdx : idx);
                      }}
                      className="group relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-200/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-[#ff4f00] hover:-translate-y-1 cursor-pointer"
                    >
                      <div className="relative w-full h-full">
                        {isVid ? (
                          isItemYT ? (
                            <Image
                              src={getYouTubeThumbnail(item.src) || "/images/produits/monstre-skateur-fait-main.jpg"}
                              alt={item.alt || displayName}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                          ) : (
                            <video
                              src={item.src}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                            />
                          )
                        ) : (
                          <Image
                            src={item.src}
                            alt={item.alt || `${displayName} - Vue ${idx + 1}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          />
                        )}
                      </div>
                      <div className="absolute top-3 right-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="w-8 h-8 rounded-full bg-black/60 text-white backdrop-blur-md flex items-center justify-center">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 lg:grid-rows-2 gap-3 sm:gap-4 lg:gap-5 lg:h-[540px]">
                {galleryItems.slice(0, 7).map((item, idx) => {
                  const isVid = isVideoMedia(item.src) || item.type === "video";
                  const isItemYT = isYouTubeUrl(item.src);
                  const isFeature = idx === 0;
                  const isLastCard = idx === 6;
                  const hasMore = isLastCard && galleryItems.length > 7;
                  const remainingCount = galleryItems.length - 6;

                  const bentoGridClasses = isFeature
                    ? "col-span-2 sm:col-span-3 lg:col-span-2 lg:row-span-2 aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto h-full"
                    : "col-span-1 aspect-square sm:aspect-auto lg:h-full";

                  return (
                    <div
                      key={`bento-item-${idx}`}
                      onClick={() => {
                        const targetIdx = allLightboxItems.findIndex((it) => it.src === item.src);
                        setLightboxIndex(targetIdx >= 0 ? targetIdx : idx);
                      }}
                      className={`${bentoGridClasses} group relative rounded-2xl lg:rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-200/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-[#ff4f00] hover:-translate-y-0.5 cursor-pointer`}
                    >
                      <div className="relative w-full h-full overflow-hidden bg-black">
                        {isVid ? (
                          isItemYT ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={getYouTubeThumbnail(item.src) || "/images/produits/monstre-skateur-fait-main.jpg"}
                                alt={item.alt || displayName}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-[#ff4f00] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative w-full h-full">
                              <video
                                src={item.src}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center group-hover:bg-[#ff4f00] group-hover:scale-110 transition-all shadow-lg">
                                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                                </div>
                              </div>
                            </div>
                          )
                        ) : (
                          <Image
                            src={item.src}
                            alt={item.alt || `${displayName} - Vue ${idx + 1}`}
                            fill
                            sizes={
                              isFeature
                                ? "(max-width: 1024px) 100vw, 50vw"
                                : "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            }
                            priority={isFeature}
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          />
                        )}

                        {/* Expand Icon on Hover */}
                        <div className="absolute top-3 right-3 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span 
                            className="w-8 h-8 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#ff4f00]"
                          >
                            <Maximize2 className="w-3.5 h-3.5 text-white" />
                          </span>
                        </div>

                        {/* Meaningful Human Caption (filtered to avoid DSC/technical names) */}
                        {item.caption && !isTechnicalLabel(item.caption) && (
                          <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
                            <span className="inline-block text-[11px] font-semibold text-white line-clamp-1 drop-shadow-sm px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs border border-white/10">
                              {item.caption}
                            </span>
                          </div>
                        )}

                        {/* Overlay "+X autres photos" sur la dernière vignette si la galerie en contient plus */}
                        {hasMore && (
                          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-3 text-center transition-all group-hover:bg-black/75 z-20">
                            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center mb-1 group-hover:scale-110 group-hover:bg-[#ff4f00] transition-all shadow-md">
                              <Images className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl sm:text-2xl font-black text-white leading-none">
                              +{remainingCount}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-300 uppercase tracking-wider mt-1">
                              Autres vues
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION VIDÉO DÉDIÉE : LES COULISSES EN MOUVEMENT            */}
        {/* ============================================================ */}
        {data.videoSection?.enabled && data.videoSection.videoUrl && (
          <section className="w-full bg-[#0b0b0e] text-white py-16 sm:py-20 border-b border-white/10 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#ff4f00]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff4f00]/20 border border-[#ff4f00]/40 text-[#ff4f00] text-xs font-black uppercase tracking-wider mb-3">
                  <Film className="w-3.5 h-3.5" />
                  <span>{stripEmojis(data.videoSection.badge || "Coulisses & Mouvement")}</span>
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {data.videoSection.title || "Découvrez la création en vidéo"}
                </h2>
                {data.videoSection.description && (
                  <p className="mt-2.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {data.videoSection.description}
                  </p>
                )}
              </div>

              {/* Video Player Container */}
              <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black border border-white/15 shadow-2xl">
                {isYouTubeUrl(data.videoSection.videoUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(data.videoSection.videoUrl) || ""}
                    title={data.videoSection.title || "Vidéo de la création"}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={data.videoSection.videoUrl}
                    controls
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* 4. BENTO BAS : 4 CARTES PARFAITEMENT SYMÉTRIQUES (2x2)       */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* -------------------------------------------------------- */}
            {/* CARTE 3 : L'HISTOIRE DU PERSONNAGE (Col span 6)          */}
            {/* -------------------------------------------------------- */}
            <div className="lg:col-span-6 bg-zinc-50 border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-800 text-[10px] font-extrabold uppercase tracking-wider mb-3 shadow-2xs">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                  <span>{stripEmojis(data.lore.badge)}</span>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950 mb-4">
                  {data.lore.title}
                </h2>

                <div className="text-zinc-600 text-xs sm:text-sm leading-relaxed space-y-3 font-sans">
                  {data.lore.paragraphs.map((p, pIdx) => (
                    <p key={`lore-p-${pIdx}`}>{p}</p>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-200 text-[11px] text-zinc-400 font-medium">
                Création originale conçue & peinte à l'atelier Spoolio
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* CARTE 4 : FICHE TECHNIQUE D'ATELIER (Col span 6)         */}
            {/* -------------------------------------------------------- */}
            <div className="lg:col-span-6 bg-zinc-50 border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-800 text-[10px] font-extrabold uppercase tracking-wider mb-3 shadow-2xs">
                  <Ruler className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                  <span>{stripEmojis(data.specs.badge)}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-zinc-950 mb-4">
                  {data.specs.title}
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {data.specs.items.map((item, itIdx) => (
                    <div key={`spec-${itIdx}`} className="bg-white border border-zinc-200 rounded-2xl p-3.5 shadow-2xs">
                      <div className="text-[10px] font-bold text-zinc-500 uppercase">{item.label}</div>
                      <div className="text-sm font-black text-zinc-900 mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-200 text-[11px] text-zinc-400 font-medium">
                Dimensions et poids vérifiés à l'atelier
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* CARTE 5 : ÉCRIN & EXPÉDITION SÉCURISÉE (Col span 6)      */}
            {/* -------------------------------------------------------- */}
            <div className="lg:col-span-6 bg-zinc-50 border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-800 text-[10px] font-extrabold uppercase tracking-wider mb-3 shadow-2xs">
                  <Box className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                  <span>{stripEmojis(data.ecrin.badge)}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950 mb-2">
                  {data.ecrin.title}
                </h2>
                <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                  {data.ecrin.intro}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-700">
                  {data.ecrin.points.map((pt, ptIdx) => (
                    <div key={`pt-${ptIdx}`} className="flex items-center gap-2.5 bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                      <span className="font-medium text-zinc-800">{stripEmojis(pt)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-[11px] text-zinc-500 pt-4 border-t border-zinc-200">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{data.ecrin.shippingMethod}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#ff4f00] shrink-0" />
                  <span className="text-zinc-900 font-bold">{stripEmojis(data.ecrin.origin)}</span>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* CARTE 6 : QUESTIONS FRÉQUENTES FAIT MAIN (Col span 6)    */}
            {/* -------------------------------------------------------- */}
            <div className="lg:col-span-6 bg-zinc-50 border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-800 text-[10px] font-extrabold uppercase tracking-wider mb-3 shadow-2xs">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                  <span>{stripEmojis(data.faq.badge)}</span>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950 mb-3">
                  {data.faq.title}
                </h2>

                <div className="space-y-2">
                  {data.faq.items.map((faq, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="bg-white border border-zinc-200 rounded-2xl p-3.5 cursor-pointer hover:border-zinc-300 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-900">
                        <span>{faq.q}</span>
                        <span className="text-zinc-400 text-sm ml-2 font-black">{activeFaq === i ? "−" : "+"}</span>
                      </div>
                      {activeFaq === i && (
                        <div className="mt-2.5 pt-2.5 border-t border-zinc-100 text-[11px] text-zinc-600 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-200 text-[11px] text-zinc-400 font-medium">
                Une question spécifique ? Contactez l'atelier directement
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* 5. LIGHTBOX PLEIN ÉCRAN MULTI-PHOTOS                        */}
      {/* ============================================================ */}
      {lightboxIndex !== null && (
        <div 
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 sm:p-8 cursor-zoom-out animate-fadeIn select-none"
        >
          {/* Top Bar: Counter & Close */}
          <div 
            className="absolute top-6 inset-x-6 flex items-center justify-between z-50 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-2">
              <span className="text-[#ff4f00] font-black">
                {lightboxIndex === 0
                  ? hasHeroVideo
                    ? "🎬 Vidéo Couverture"
                    : "📷 Photo Couverture"
                  : `Photo #${lightboxIndex}`}
              </span>
              <span className="text-white/40">/</span>
              <span>{allLightboxItems.length} médias</span>
            </div>

            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-[#ff4f00] text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
              title="Fermer (Échap)"
            >
              <X color="#ffffff" style={{ color: "#ffffff", stroke: "#ffffff" }} className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Left Arrow */}
          {allLightboxItems.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : allLightboxItems.length - 1
                );
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-[#ff4f00] text-white flex items-center justify-center transition-all cursor-pointer z-50 border border-white/20"
              title="Média précédent (Flèche gauche)"
            >
              <ChevronLeft color="#ffffff" style={{ color: "#ffffff", stroke: "#ffffff" }} className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Main Fullscreen Media (Video or Image) */}
          <div 
            className="relative w-full max-w-5xl h-full max-h-[80vh] flex items-center justify-center pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const currentItem = allLightboxItems[lightboxIndex] || allLightboxItems[0];
              const currentSrc = currentItem?.src || mainImage;
              const isVid = isVideoMedia(currentSrc) || currentItem?.type === "video";
              if (isVid) {
                if (isYouTubeUrl(currentSrc)) {
                  return (
                    <div className="w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black">
                      <iframe
                        src={getYouTubeEmbedUrl(currentSrc) || ""}
                        title={currentItem?.caption || displayName}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  );
                }
                return (
                  <video
                    src={currentSrc}
                    controls
                    autoPlay
                    playsInline
                    className="max-w-full max-h-[80vh] rounded-3xl shadow-2xl border border-white/20 bg-black"
                  />
                );
              }
              return (
                <div className="relative w-full h-[80vh] flex items-center justify-center">
                  <Image
                    src={currentSrc}
                    alt={currentItem?.alt || displayName}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />
                </div>
              );
            })()}
          </div>

          {/* Right Arrow */}
          {allLightboxItems.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev !== null && prev < allLightboxItems.length - 1 ? prev + 1 : 0
                );
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-[#ff4f00] text-white flex items-center justify-center transition-all cursor-pointer z-50 border border-white/20"
              title="Média suivant (Flèche droite)"
            >
              <ChevronRight color="#ffffff" style={{ color: "#ffffff", stroke: "#ffffff" }} className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Bottom Caption Pill (only if real non-technical description) */}
          {allLightboxItems[lightboxIndex]?.caption && !isTechnicalLabel(allLightboxItems[lightboxIndex]?.caption) && (
            <div 
              className="absolute bottom-6 inset-x-6 text-center z-50 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="inline-block px-5 py-2 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 text-xs sm:text-sm text-zinc-100 font-medium max-w-2xl">
                {allLightboxItems[lightboxIndex]?.caption}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
