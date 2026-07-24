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
};

export default function FidgetCard({ product }: FidgetCardProps) {
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const meta = categoryMeta[product.category] || {
    label: product.category,
    icon: Puzzle,
  };
  const IconComponent = meta.icon;

  const productUrl = `/product/${product.id}`;

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
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)"
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
      className="group relative flex flex-col justify-between h-full bg-spoolio-card border border-[#1f1f23] rounded-[30px] overflow-hidden transition-all duration-300 hover:border-white shadow-lg shadow-black/30 card-holographic"
    >
      <div className="flex flex-col">
        {/* Image Container with square aspect ratio */}
        <div className="relative w-full aspect-square bg-black/20 border-b border-spoolio-border/30 overflow-hidden">
          {/* Top-Left Yellow Tag Badge (Spoolio.fr style) */}
          <div className="absolute top-4 left-4 px-3 py-1.5 text-[10px] font-bold bg-[#f7eb12] text-black rounded-full shadow-md z-10 no-invert flex items-center gap-1.5">
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
        <div className="flex flex-col gap-2.5 p-6 pb-0 font-[family-name:var(--font-plus-jakarta)]">
          <h3 className="text-[18px] font-bold text-white transition-colors duration-200 group-hover:text-[#005cff]">
            {product.name}
          </h3>

          <p className="text-[14px] text-gray-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Blue Action Button (Spoolio.fr style) */}
      <div className="p-6 pt-5">
        <div className="w-full h-[50px] inline-flex items-center justify-center gap-2 px-4 text-sm font-extrabold text-white bg-[#005cff] hover:bg-[#004ecc] rounded-xl transition-colors shadow-[0_4px_10px_rgba(0,92,255,0.2)] select-none cursor-pointer no-invert">
          <ShoppingCart className="w-4 h-4" />
          <span>Personnaliser &amp; Acheter • {product.price}</span>
        </div>
      </div>
    </Link>
  );
}
