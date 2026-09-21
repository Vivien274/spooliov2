'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Keyboard, Infinity as InfinityIcon, Puzzle, Waves } from 'lucide-react';
import { FidgetProduct } from '@/types/boussole';

interface FidgetCardProps {
  product: FidgetProduct;
}

const categoryMeta = {
  cliquer: {
    label: 'Cliquer',
    icon: Keyboard,
  },
  manipuler: {
    label: 'Manipuler',
    icon: InfinityIcon,
  },
  resoudre: {
    label: 'Résoudre',
    icon: Puzzle,
  },
  caresser: {
    label: 'Caresser',
    icon: Waves,
  },
  tourner: {
    label: 'Tourner',
    icon: InfinityIcon,
  },
  presser: {
    label: 'Presser',
    icon: Keyboard,
  },
};

function stripHtmlAndDecode(str: string): string {
  if (!str) return "";
  return str
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function FidgetCard({ product }: FidgetCardProps) {
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const meta = categoryMeta[product.category] || {
    label: product.category,
    icon: Puzzle,
  };
  const IconComponent = meta.icon;

  const productUrl = product.slug
    ? `/product/${product.slug}`
    : (product.wooCommerceUrl || `/product/${product.id}`);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    const rotateX = -(y / (box.height / 2)) * 6;
    const rotateY = (x / (box.width / 2)) * 6;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: "transform 0.05s ease-out",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)"
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.5s ease"
    });
  };

  return (
    <Link
      href={productUrl}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className="group relative flex flex-col justify-between h-full bg-white border border-zinc-200/90 rounded-[28px] overflow-hidden transition-all duration-300 hover:border-zinc-300 shadow-xs hover:shadow-lg"
    >
      <div className="flex flex-col">
        {/* Image Container with square aspect ratio */}
        <div className="relative w-full aspect-square bg-zinc-100 border-b border-zinc-100 overflow-hidden">
          {/* Top-Left Yellow Tag Badge */}
          <div className="absolute top-4 left-4 px-3 py-1.5 text-[10px] font-bold bg-amber-300 text-zinc-950 rounded-full shadow-xs z-10 no-invert flex items-center gap-1.5">
            <IconComponent className="w-3.5 h-3.5" />
            <span>{meta.label}</span>
          </div>

          {/* Product Image */}
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05] no-invert"
          />
        </div>

        {/* Content Container (Title, Description) */}
        <div className="flex flex-col gap-2 p-5 sm:p-6 pb-0">
          <h3 className="text-base sm:text-lg font-bold text-zinc-950 transition-colors duration-200 group-hover:text-[#ff4f00] font-outfit leading-snug">
            {stripHtmlAndDecode(product.name)}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-500 line-clamp-2 leading-relaxed font-sans">
            {stripHtmlAndDecode(product.description)}
          </p>
        </div>
      </div>

      {/* Spoolio Orange Action Button */}
      <div className="p-5 sm:p-6 pt-4">
        <div className="w-full h-[48px] inline-flex items-center justify-center gap-2 px-4 text-xs sm:text-sm font-bold text-white bg-[#ff4f00] hover:bg-[#e04500] rounded-full transition-all shadow-md shadow-[#ff4f00]/20 select-none cursor-pointer tracking-wide no-invert">
          <ShoppingCart className="w-4 h-4" />
          <span>Personnaliser &amp; Acheter • {product.price}</span>
        </div>
      </div>
    </Link>
  );
}
