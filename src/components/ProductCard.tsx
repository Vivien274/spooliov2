"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import UnicornIcon from "@/components/UnicornIcon";
import cartIconData from "@/components/shopping bag.json";
import { useTranslation } from "@/context/LanguageContext";
import { Check } from "lucide-react";

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
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: "transform 0.05s ease-out",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
    });

    setShineStyle({
      opacity: 0.6,
      background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,79,0,0.35) 0%, transparent 60%), linear-gradient(${angle}deg, rgba(255, 0, 128, 0.25) 0%, rgba(0, 240, 255, 0.25) 33%, rgba(255, 230, 0, 0.25) 66%, rgba(160, 32, 240, 0.25) 100%)`,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.5s ease",
    });
    setShineStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  const hasImage = !!product.images[0]?.src;
  const imageUrl = product.images[0]?.src || "";
  const imageAlt = product.images[0]?.alt || product.name;

  // Get first category name if defined, fallback to first tag
  const categoryName = product.categories && product.categories.length > 0 
    ? (typeof product.categories[0] === 'object' ? product.categories[0].name : product.categories[0])
    : (product.tags && product.tags.length > 0 
        ? (typeof product.tags[0] === 'object' ? product.tags[0].name : product.tags[0])
        : null);

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
      <div className="group relative aspect-square w-full rounded-[28px] bg-transparent border-none overflow-hidden transition-all duration-300 shadow-xl">
        {/* Full-bleed Product Image */}
        <Link href={`/product/${product.slug}`} className="block w-full h-full relative group/img">
          {hasImage ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover group-hover/img:scale-105 transition-transform duration-500 no-invert"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-spoolio-card/85 text-gray-600">
              <svg className="w-10 h-10 mb-2 text-spoolio-border/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Spoolio 3D</span>
            </div>
          )}
        </Link>

        {/* Apple Specular Bevel Edge (Liseré de verre supérieur) */}
        <div className="absolute inset-0 pointer-events-none rounded-[28px] border-t border-l border-white/20 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.3)] z-10" />

        {/* Bottom Gradient overlay for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none z-0" />

        {/* Product Name on the image, at bottom-left, aligned with the button */}
        <div className="absolute bottom-3 left-4 right-[160px] z-10 flex items-center min-h-[44px] pointer-events-auto">
          <Link
            href={`/product/${product.slug}`}
            className="text-xs sm:text-sm font-black text-white hover:text-[#ff4f00] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] line-clamp-2 leading-tight transition-colors font-sans"
          >
            {displayName}
          </Link>
        </div>

        {/* Bottom-Right Inverted Corner Scoop & Liquid Glass Pill Button */}
        <div className="absolute bottom-0 right-0 bg-[#070709] p-2 rounded-tl-[24px] z-20 flex items-center justify-center">
          
          {/* Top Inverted Fillet Curve */}
          <div className="absolute -top-[16px] right-0 w-[16px] h-[16px] overflow-hidden pointer-events-none">
            <div className="w-full h-full rounded-br-[16px] shadow-[6px_6px_0_6px_#070709]" />
          </div>

          {/* Left Inverted Fillet Curve */}
          <div className="absolute bottom-0 -left-[16px] w-[16px] h-[16px] overflow-hidden pointer-events-none">
            <div className="w-full h-full rounded-br-[16px] shadow-[6px_6px_0_6px_#070709]" />
          </div>

          {/* Button: Liquid Glass Pill (Verre translucide + Reflet spéculaire interne net) */}
          <button
            type="button"
            onClick={handleButtonClick}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            title={isVariable ? (locale === "en" ? "Choose options" : "Choisir les options (couleur, taille...)") : (locale === "en" ? "Add to cart" : "Ajouter au panier")}
            aria-label={isVariable ? "Choisir les options" : "Ajouter au panier"}
            className={`relative h-11 px-4 rounded-full transition-all duration-300 flex items-center gap-2.5 cursor-pointer outline-none active:scale-95 no-invert shrink-0 ${
              !isVariable && (isAlreadyInCart || wasJustAdded)
                ? "bg-emerald-500 text-white border border-emerald-400/50 shadow-[0_4px_16px_rgba(16,185,129,0.4)]"
                : "bg-white/95 hover:bg-white text-black backdrop-blur-xl border border-white/80 hover:border-white shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),inset_0_-1px_1px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),0_6px_16px_rgba(0,0,0,0.45)] hover:scale-[1.03]"
            }`}
          >
            {!isVariable && (isAlreadyInCart || wasJustAdded) ? (
              <>
                <Check className="w-5 h-5 text-white shrink-0" />
                <span className="text-xs font-black uppercase font-mono tracking-tight text-white">Ajouté</span>
              </>
            ) : (
              <>
                <div className="w-7 h-7 flex items-center justify-center pointer-events-none shrink-0 overflow-hidden brightness-0">
                  <UnicornIcon
                    animationData={cartIconData}
                    className="w-10 h-10 scale-[2.2] pointer-events-none"
                    isHovered={isButtonHovered}
                  />
                </div>
                <span className="text-sm font-black font-mono tracking-tight shrink-0 text-black">
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
      className="group relative flex flex-col justify-between h-full bg-spoolio-card border border-[#1f1f23] rounded-[30px] overflow-hidden transition-all duration-300 hover:border-white shadow-lg shadow-black/30 card-holographic"
    >
      {/* Holographic Refractive Layer */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-20 transition-opacity duration-300 mix-blend-color-dodge overflow-hidden"
        style={{
          opacity: shineStyle.opacity,
          background: shineStyle.background,
        }}
      />

      <div className="flex flex-col">
        {/* Image Container with square aspect ratio - flush with edges */}
        <div className="relative w-full aspect-square bg-black/20 border-b border-spoolio-border/30">
          {hasImage ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02] no-invert"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-spoolio-card/85 text-gray-600">
              <svg className="w-10 h-10 mb-2 text-spoolio-border/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Spoolio 3D</span>
            </div>
          )}

          {/* Badges Overlays */}
          {/* Top-Left Category Badge */}
          {categoryName && (
            <span className="absolute top-4 left-4 px-3 py-1.5 text-[10px] font-bold bg-[#f7eb12] text-black rounded-full shadow-md z-10 no-invert">
              {decodeHtml(categoryName)}
            </span>
          )}
        </div>

        {/* Content Container (Title, Description) with Padding */}
        <div className="flex flex-col gap-3 p-6 pb-0 font-[family-name:var(--font-plus-jakarta)]">
          {/* Title */}
          <h3 className="text-[18px] font-bold text-white transition-colors duration-200">
            {displayName}
          </h3>

          {/* Description */}
          <p className="text-[14px] text-gray-400 line-clamp-2 leading-relaxed">
            {cleanDescription}
          </p>
        </div>
      </div>

      <div className="p-6 pt-5">
        <div
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          className="w-full h-[50px] inline-flex items-center justify-center gap-2 px-4 text-xs font-bold text-white bg-[#005cff] hover:bg-[#004ecc] rounded-xl transition-colors shadow-[0_4px_10px_rgba(0,92,255,0.15)] select-none border-none cursor-pointer no-invert"
        >
          <UnicornIcon animationData={cartIconData} className="w-8 h-8 scale-[1.8]" isHovered={isButtonHovered} />
          <span className="text-sm font-extrabold">{formatPrice(product.price)}</span>
        </div>
      </div>
    </Link>
  );
}
