"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import UnicornIcon from "@/components/UnicornIcon";
import cartIconData from "@/components/shopping bag.json";

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  categories: { id: number; name: string; slug: string }[];
  images: { id: number; src: string; name: string; alt: string }[];
  short_description?: string;
  description?: string;
  date_created?: string;
  attributes?: any[];
  stock?: number;
  tags?: any[];
}

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  priority?: boolean;
}

export default function ProductCard({ product, compact = false, priority = false }: ProductCardProps) {
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [shineStyle, setShineStyle] = useState<{ opacity: number; background: string }>({
    opacity: 0,
    background: "",
  });
  const [isButtonHovered, setIsButtonHovered] = useState(false);

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

  // Get first real tag if defined, otherwise null
  const firstTag = product.tags && product.tags.length > 0 
    ? (typeof product.tags[0] === 'object' ? product.tags[0].name : product.tags[0])
    : null;

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
  const cleanDescription = product.short_description
    ? decodeHtml(product.short_description.replace(/<[^>]*>/g, ""))
    : "Objet sensoriel 3D imprimé en PLA biosourcé à Comines.";

  if (compact) {
    return (
      <Link
        href={`/product/${product.slug}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={tiltStyle}
        className="group relative flex flex-col aspect-square w-full bg-spoolio-card border border-spoolio-border rounded-[28px] overflow-hidden transition-all duration-300 hover:border-white shadow-lg shadow-black/30 card-holographic"
      >
        {/* Holographic Refractive Layer */}
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none z-20 transition-opacity duration-300 mix-blend-color-dodge overflow-hidden"
          style={{
            opacity: shineStyle.opacity,
            background: shineStyle.background,
          }}
        />

        {/* Full Image background */}
        {hasImage ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05] no-invert"
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

        {/* Tag on top left (Only if real tag is defined) */}
        {firstTag && (
          <span className="absolute top-3.5 left-3.5 px-2.5 py-1 text-[9px] font-bold bg-[#f7eb12] text-black rounded-full shadow-md z-10 no-invert">
            {firstTag}
          </span>
        )}

        {/* Floating Glassmorphic Overlay at Bottom (Nom du produit + Tag Prix Transparent Bordure Blanche) */}
        <div className="absolute bottom-3 left-3 right-3 p-3 sm:p-3.5 bg-black/65 backdrop-blur-md border border-white/15 rounded-2xl shadow-xl flex items-center justify-between gap-3 z-10 no-invert transition-transform group-hover:translate-y-[-2px]">
          <h3 className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-1 font-[family-name:var(--font-plus-jakarta)] min-w-0">
            {product.name}
          </h3>

          {/* Tag Prix avec bordure blanche et texte blanc sans fond */}
          <span className="px-2.5 py-0.5 border border-white/40 text-white font-extrabold text-xs sm:text-sm font-[family-name:var(--font-antonio)] rounded-full shrink-0">
            {formatPrice(product.price)}
          </span>
        </div>
      </Link>
    );
  }

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
          {/* Top-Left Badge (Only if real tag is defined) */}
          {firstTag && (
            <span className="absolute top-4 left-4 px-3 py-1.5 text-[10px] font-bold bg-[#f7eb12] text-black rounded-full shadow-md z-10 no-invert">
              {firstTag}
            </span>
          )}

        </div>

        {/* Content Container (Title, Description) with Padding */}
        <div className="flex flex-col gap-3 p-6 pb-0 font-[family-name:var(--font-plus-jakarta)]">
          {/* Title */}
          <h3 className="text-[18px] font-bold text-white transition-colors duration-200">
            {product.name}
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
