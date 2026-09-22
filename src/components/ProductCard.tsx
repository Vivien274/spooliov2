"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import UnicornIcon from "@/components/UnicornIcon";
import cartIconData from "@/components/shopping bag.json";
import { useTranslation } from "@/context/LanguageContext";
import { Check, Sparkles, Flame, Sliders } from "lucide-react";

export interface Product {
  id: number;
  name: string;
  nameEn?: string | null;
  name_en?: string | null;
  slug: string;
  permalink: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  productType?: string;
  categories: { id: number; name: string; slug: string }[];
  images: { id: number; src: string; name: string; alt: string }[];
  short_description?: string;
  short_description_en?: string | null;
  shortDescriptionEn?: string | null;
  description?: string;
  description_en?: string | null;
  descriptionEn?: string | null;
  date_created?: string;
  attributes?: any;
  stock?: number;
  tags?: any[];
  views?: number;
}

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  priority?: boolean;
}

function hasProductVariables(p: any): boolean {
  if (p.productType === "variable") return true;
  if (!p.attributes) return false;
  try {
    const parsed = typeof p.attributes === "string" ? JSON.parse(p.attributes) : p.attributes;
    if (Array.isArray(parsed) && parsed.length > 0) return true;
    if (parsed.attributes && Array.isArray(parsed.attributes) && parsed.attributes.length > 0) return true;
  } catch (e) {}
  return false;
}

interface RarityBadgeInfo {
  type: "handmade" | "custom" | "new" | "category";
  label: string;
  icon?: React.ReactNode;
  className: string;
}

function getProductRarityBadge(product: Product, categoryName: string | null): RarityBadgeInfo | null {
  // 1. Pièce Unique / Fait Main (Art Toy, Peint à la main, Édition d'Atelier)
  const isHandmade = Boolean(
    product.slug.includes("fait-main") ||
    product.slug.includes("piece-unique") ||
    Boolean((product as any)?.attributes?.uniquePieceData) ||
    (Array.isArray(product.tags) && product.tags.some((t: any) => {
      const name = (typeof t === "string" ? t : t?.name || "").toLowerCase();
      return name.includes("fait-main") || name.includes("art-toy") || name.includes("peint-a-la-main") || name.includes("artisan");
    })) ||
    (Array.isArray(product.categories) && product.categories.some((c: any) => {
      const name = (typeof c === "string" ? c : c?.name || "").toLowerCase();
      return name.includes("fait main") || name.includes("artisan") || name.includes("unique");
    }))
  );

  if (isHandmade) {
    return {
      type: "handmade",
      label: "Pièce Unique • 1/1",
      icon: <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />,
      className: "bg-gradient-to-r from-amber-500/95 to-orange-500/95 text-white border border-amber-300/40 shadow-sm",
    };
  }

  // 2. Customizer / Produit Sur-Mesure
  const isCustomizer = hasProductVariables(product) || product.slug.includes("clicker-mecanique") || product.slug.includes("sur-mesure");
  if (isCustomizer) {
    return {
      type: "custom",
      label: "Sur-mesure",
      icon: <Sliders className="w-3 h-3 text-zinc-300 shrink-0" />,
      className: "bg-zinc-950/85 backdrop-blur-md text-zinc-200 border border-white/20 shadow-sm",
    };
  }

  // 3. Drop / Nouveauté
  const isNew = Boolean(
    product.tags?.some((t: any) => {
      const name = (typeof t === "string" ? t : t?.name || "").toLowerCase();
      return name.includes("nouveau") || name.includes("drop") || name.includes("exclusif");
    })
  );
  if (isNew) {
    return {
      type: "new",
      label: "Nouveauté",
      icon: <Flame className="w-3 h-3 text-[#ff4f00] shrink-0" />,
      className: "bg-zinc-950/85 backdrop-blur-md text-[#ff4f00] border border-[#ff4f00]/30 shadow-sm",
    };
  }

  // 4. Default Category
  if (categoryName) {
    return {
      type: "category",
      label: categoryName,
      className: "bg-zinc-950/85 backdrop-blur-md text-zinc-200 border border-white/15 shadow-sm",
    };
  }

  return null;
}

export default function ProductCard({ product, compact = false, priority = false }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, cartItems } = useCart();
  const { locale } = useTranslation();
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [shineStyle, setShineStyle] = useState<{ opacity: number; background: string }>({
    opacity: 0,
    background: "",
  });
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [justAddedId, setJustAddedId] = useState<number | null>(null);

  const displayName = (locale === "en" && (product.nameEn || product.name_en))
    ? (product.nameEn || product.name_en)!
    : product.name;

  const rawShortDesc = (locale === "en" && (product.shortDescriptionEn || product.short_description_en))
    ? (product.shortDescriptionEn || product.short_description_en)!
    : product.short_description;

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    
    // Max tilt angle of 10 degrees
    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;
    const rotateX = -percentY * 10;
    const rotateY = percentX * 10;
    
    const angle = Math.atan2(percentY, percentX) * (180 / Math.PI) + 90;
    const shineX = (percentX * 50 + 50).toFixed(1);
    const shineY = (percentY * 50 + 50).toFixed(1);

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`,
      transition: "transform 0.2s ease-out, box-shadow 0.3s ease-out",
      boxShadow: "0 12px 28px -6px rgba(0, 0, 0, 0.07), 0 4px 10px -2px rgba(0, 0, 0, 0.03)",
    });

    setShineStyle({
      opacity: 0.25,
      background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,79,0,0.18) 0%, transparent 60%)`,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
    });
    setShineStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  const hasImage = !!product.images?.[0]?.src;
  const imageUrl = product.images?.[0]?.src || "";
  const imageAlt = product.images?.[0]?.alt || product.name;

  const hasSecondImage = !!product.images?.[1]?.src;
  const secondImageUrl = product.images?.[1]?.src || "";
  const secondImageAlt = product.images?.[1]?.alt || `${product.name} - détail`;

  // Get first category name if defined, fallback to first tag
  const categoryName = product.categories && product.categories.length > 0 
    ? (typeof product.categories[0] === 'object' ? product.categories[0].name : product.categories[0])
    : (product.tags && product.tags.length > 0 
        ? (typeof product.tags[0] === 'object' ? product.tags[0].name : product.tags[0])
        : null);

  const rarityBadge = getProductRarityBadge(product, categoryName);

  // Price formatting to match mockup (e.g. 5,00€)
  const formatPrice = (val: string) => {
    const num = parseFloat(val);
    const formatted = isNaN(num) ? "0,00" : num.toFixed(2).replace(".", ",");
    return `${formatted}€`;
  };

  // Decode HTML entities
  const decodeHtml = (str: string) => {
    return str
      .replace(/&rsquo;/g, "’")
      .replace(/&lsquo;/g, "‘")
      .replace(/&rdquo;/g, "”")
      .replace(/&ldquo;/g, "“")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  };

  // Plain text short description
  const cleanDescription = rawShortDesc
    ? decodeHtml(rawShortDesc.replace(/<[^>]*>/g, ""))
    : (locale === "en" ? "3D sensory object printed in bio-sourced PLA in France." : "Objet sensoriel 3D imprimé en PLA biosourcé à Comines.");

  // =========================================================================
  // 1. COMPACT CARD (Derniers Ajouts & Coups de Cœur avec Corner Scoop Notch)
  // =========================================================================
  if (compact) {
    const isVariable = hasProductVariables(product);
    const isAlreadyInCart = cartItems.some((ci) => ci.productId === product.id || ci.slug === product.slug);
    const wasJustAdded = justAddedId === product.id;

    const handleButtonClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isVariable) {
        router.push(`/product/${product.slug}`);
      } else {
        addToCart(
          {
            productId: product.id,
            name: displayName,
            slug: product.slug,
            price: product.price,
            selectedOptions: {},
            image: imageUrl,
          },
          1,
          true
        );
        setJustAddedId(product.id);
        setTimeout(() => setJustAddedId(null), 1800);
      }
    };

    return (
      <div className="group relative aspect-square w-full rounded-[28px] bg-zinc-100 border border-zinc-200/80 overflow-hidden transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
        {/* Full-bleed Product Image with 2nd Image hover transition */}
        <Link href={`/product/${product.slug}`} className="block w-full h-full relative group/img bg-zinc-50 overflow-hidden">
          {hasImage ? (
            <>
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className={`object-cover transition-all duration-700 ease-out ${
                  hasSecondImage ? "group-hover/img:opacity-0 group-hover/img:scale-105" : "group-hover/img:scale-105"
                } no-invert`}
                priority={priority}
              />
              {hasSecondImage && (
                <Image
                  src={secondImageUrl}
                  alt={secondImageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover absolute inset-0 opacity-0 group-hover/img:opacity-100 scale-100 group-hover/img:scale-105 transition-all duration-700 ease-out no-invert"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100 text-zinc-400">
              <svg className="w-10 h-10 mb-2 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400">Spoolio 3D</span>
            </div>
          )}
        </Link>

        {/* Top Rarity Badge */}
        {rarityBadge && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full backdrop-blur-md shadow-sm no-invert keep-white ${rarityBadge.className}`}>
              {rarityBadge.icon}
              <span>{decodeHtml(rarityBadge.label)}</span>
            </span>
          </div>
        )}

        {/* Specular Bevel Edge */}
        <div className="absolute inset-0 pointer-events-none rounded-[28px] border-t border-l border-white/40 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.6)] z-10" />

        {/* Bottom Gradient overlay for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none z-0" />

        {/* Product Name on the image, at bottom-left */}
        <div className="absolute bottom-3 left-4 right-[160px] z-10 flex items-center min-h-[44px] pointer-events-auto">
          <Link
            href={`/product/${product.slug}`}
            className="text-xs sm:text-sm font-black text-white hover:text-[#ff4f00] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] line-clamp-2 leading-tight transition-colors font-sans"
          >
            {displayName}
          </Link>
        </div>

        {/* Bottom-Right Inverted Corner Scoop & Action Button */}
        <div className="absolute bottom-0 right-0 bg-white p-2 rounded-tl-[24px] z-20 flex items-center justify-center">
          
          {/* Top Inverted Fillet Curve */}
          <div className="absolute -top-[16px] right-0 w-[16px] h-[16px] overflow-hidden pointer-events-none">
            <div className="w-full h-full rounded-br-[16px] shadow-[6px_6px_0_6px_#ffffff]" />
          </div>

          {/* Left Inverted Fillet Curve */}
          <div className="absolute bottom-0 -left-[16px] w-[16px] h-[16px] overflow-hidden pointer-events-none">
            <div className="w-full h-full rounded-br-[16px] shadow-[6px_6px_0_6px_#ffffff]" />
          </div>

          {/* Button: Minimalist Black Pill (turns Spoolio orange on hover) */}
          <button
            type="button"
            onClick={handleButtonClick}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            title={isVariable ? (locale === "en" ? "Choose options" : "Choisir les options (couleur, taille...)") : (locale === "en" ? "Add to cart" : "Ajouter au panier")}
            aria-label={isVariable ? "Choisir les options" : "Ajouter au panier"}
            className={`relative h-11 px-4 rounded-full transition-all duration-200 flex items-center gap-2.5 cursor-pointer outline-none active:scale-95 no-invert shrink-0 ${
              !isVariable && (isAlreadyInCart || wasJustAdded)
                ? "bg-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)]"
                : "bg-zinc-950 hover:bg-[#ff4f00] text-white shadow-[0_4px_14px_rgba(0,0,0,0.16)] hover:scale-[1.02]"
            }`}
          >
            {!isVariable && (isAlreadyInCart || wasJustAdded) ? (
              <>
                <Check className="w-5 h-5 text-white shrink-0" />
                <span className="text-xs font-black uppercase font-mono tracking-tight text-white">Ajouté</span>
              </>
            ) : (
              <>
                <div className="w-7 h-7 flex items-center justify-center pointer-events-none shrink-0 overflow-hidden brightness-0 invert">
                  <UnicornIcon
                    animationData={cartIconData}
                    className="w-10 h-10 scale-[2.2] pointer-events-none"
                    isHovered={isButtonHovered}
                  />
                </div>
                <span className="text-sm font-black font-mono tracking-tight shrink-0 text-white">
                  {formatPrice(product.price)}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. STANDARD FULL-SIZE CARD (Pour "Tout le Catalogue" & autres vues)
  // =========================================================================
  return (
    <Link
      href={`/product/${product.slug}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className="group relative flex flex-col justify-between h-full bg-white border border-zinc-200/90 rounded-[22px] sm:rounded-[28px] overflow-hidden transition-all duration-300 hover:border-zinc-400 shadow-sm hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)]"
    >
      {/* Holographic Refractive Layer */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-20 transition-opacity duration-300 mix-blend-overlay overflow-hidden"
        style={{
          opacity: shineStyle.opacity * 0.5,
          background: shineStyle.background,
        }}
      />

      <div className="flex flex-col flex-1">
        {/* Image Container with strict 1:1 square aspect ratio - flush with edges */}
        <div className="relative w-full aspect-square bg-zinc-50 border-b border-zinc-100 overflow-hidden shrink-0">
          {hasImage ? (
            <>
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className={`object-cover transition-all duration-700 ease-out ${
                  hasSecondImage ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
                } no-invert`}
                priority={priority}
              />
              {hasSecondImage && (
                <Image
                  src={secondImageUrl}
                  alt={secondImageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 scale-100 group-hover:scale-105 transition-all duration-700 ease-out no-invert"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 text-zinc-400">
              <svg className="w-10 h-10 mb-2 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400">Spoolio 3D</span>
            </div>
          )}

          {/* Badges Overlays - Dynamic Rarity Badge */}
          {rarityBadge && (
            <span className={`absolute top-3 left-3 sm:top-3.5 sm:left-3.5 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm z-10 no-invert keep-white ${rarityBadge.className}`}>
              {rarityBadge.icon}
              <span>{decodeHtml(rarityBadge.label)}</span>
            </span>
          )}

          {/* Subtle multi-photo indicator */}
          {hasSecondImage && (
            <div className="absolute bottom-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider border border-white/15">
                2 vues
              </span>
            </div>
          )}
        </div>

        {/* Content Container (Title, Description) with fixed minimum heights for pixel-perfect alignment */}
        <div className="flex flex-col flex-1 justify-between p-3.5 sm:p-5 lg:p-6 pb-2 sm:pb-3 font-[family-name:var(--font-plus-jakarta)]">
          <div className="space-y-1 sm:space-y-1.5">
            {/* Title with fixed minimum height for consistent 2-line baseline */}
            <h3 className="text-xs sm:text-base lg:text-[17px] font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors duration-200 line-clamp-2 leading-tight sm:leading-snug min-h-[2rem] sm:min-h-[2.75rem] flex items-start">
              {displayName}
            </h3>

            {/* Description with fixed minimum height */}
            <p
              className="text-xs sm:text-[13px] text-zinc-500 leading-relaxed hidden sm:block overflow-hidden min-h-[2.25rem] sm:min-h-[2.75rem]"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {cleanDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Row (Price & Cart button) - Strictly pinned to baseline */}
      <div className="p-3.5 sm:p-5 lg:p-6 pt-0 mt-auto shrink-0">
        <div
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          className="w-full h-10 sm:h-[46px] lg:h-[48px] inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 text-xs font-bold text-white bg-zinc-950 hover:bg-[#ff4f00] rounded-xl transition-colors shadow-sm select-none border-none cursor-pointer no-invert"
        >
          <div className="brightness-0 invert flex items-center">
            <UnicornIcon animationData={cartIconData} className="w-6 h-6 sm:w-8 sm:h-8 scale-[1.6] sm:scale-[1.8]" isHovered={isButtonHovered} />
          </div>
          <span className="text-xs sm:text-sm font-extrabold font-mono">{formatPrice(product.price)}</span>
        </div>
      </div>
    </Link>
  );
}
