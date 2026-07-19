"use client";

import Link from "next/link";
import Image from "next/image";
import UnicornIcon from "@/components/UnicornIcon";
import cartIconData from "@/components/shopping bag.json";
import { useCart } from "@/context/CartContext";

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
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const hasImage = !!product.images[0]?.src;
  const imageUrl = product.images[0]?.src || "";
  const imageAlt = product.images[0]?.alt || product.name;

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Choose default variations if they exist in the product attributes
    const defaultOptions: Record<string, string> = {};
    if (product.attributes) {
      product.attributes.forEach((attr: any) => {
        if (attr.options && attr.options.length > 0) {
          defaultOptions[attr.name] = attr.options[0].replace(/\u00a0/g, ' ').trim();
        }
      });
    }

    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      selectedOptions: defaultOptions,
      image: product.images[0]?.src || ""
    }, 1);
  };

  // Mockup index-based badge text
  const getBadgeText = (id: number) => {
    const badges = ["Satisfaisant !", "Nouveau", "Nouveau", "Adhérent", "Adhérent", "Nouveau", "Adhérent", "Adhérent"];
    return badges[(id - 1) % 8];
  };

  const badgeText = getBadgeText(product.id);

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
    : "La mini-boîte qui sauve tes soirées (et tes lendemains). Bouchons d'oreille, cachet du matin.";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col justify-between h-full bg-spoolio-card border border-spoolio-border rounded-[30px] overflow-hidden transition-all duration-300 hover:border-white hover:-translate-y-1 hover:shadow-lg hover:shadow-black/50"
    >
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
              priority={product.id <= 4}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-spoolio-card/85 text-gray-600">
              <svg className="w-10 h-10 mb-2 text-spoolio-border/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Spoolio 3D</span>
            </div>
          )}

          {/* Badges Overlays */}
          {/* Top-Left Badge (Adhérent / Nouveau) */}
          <span className="absolute top-4 left-4 px-3 py-1.5 text-[10px] font-semibold bg-[#2a2a30]/85 text-gray-300 rounded-full backdrop-blur-sm tracking-wide z-10 no-invert">
            {badgeText}
          </span>

          {/* Top-Right Price Badge */}
          <span className="absolute top-4 right-4 px-3 py-1.5 text-[10px] font-bold bg-[#f7eb12] text-black rounded-full shadow-md z-10">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Content Container (Title, Description) with Padding */}
        <div className="flex flex-col gap-3 p-6 pb-0">
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

      {/* Blue Actions Button at the bottom with Padding */}
      <div className="p-6 pt-5">
        <button
          onClick={handleBuyClick}
          className="w-full h-[50px] inline-flex items-center justify-center gap-2 px-4 text-xs font-bold text-white bg-[#005cff] hover:bg-[#004ecc] rounded-xl transition-colors shadow-[0_4px_10px_rgba(0,92,255,0.15)] select-none border-none cursor-pointer no-invert"
        >
          <UnicornIcon animationData={cartIconData} className="w-4 h-4" />
          ACHETER
        </button>
      </div>
    </Link>
  );
}
