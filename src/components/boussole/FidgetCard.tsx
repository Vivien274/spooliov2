'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Keyboard, Infinity as InfinityIcon, Puzzle, Waves } from 'lucide-react';
import { FidgetProduct } from '@/types/boussole';

interface FidgetCardProps {
  product: FidgetProduct;
}

const categoryMeta = {
  cliquer: {
    label: 'Cliquer',
    icon: Keyboard,
    colorClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  manipuler: {
    label: 'Manipuler',
    icon: InfinityIcon,
    colorClass: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  },
  resoudre: {
    label: 'Résoudre',
    icon: Puzzle,
    colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  caresser: {
    label: 'Caresser',
    icon: Waves,
    colorClass: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
  },
};

export default function FidgetCard({ product }: FidgetCardProps) {
  const meta = categoryMeta[product.category] || {
    label: product.category,
    icon: Puzzle,
    colorClass: 'bg-slate-700/50 text-slate-300 border-slate-600',
  };
  const IconComponent = meta.icon;

  // Direct internal route in SpoolioV2
  const productUrl = `/product/${product.id}`;

  return (
    <article
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131316] transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xl"
    >
      {/* Product Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        {/* Category Pill Tag */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all duration-300 group-hover:scale-105 shadow-md select-none bg-white/90 dark:bg-black/80 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">
          <IconComponent className="w-3.5 h-3.5" />
          <span>{meta.label}</span>
        </div>

        {/* Price Tag */}
        <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-[#FF5500] text-black font-black text-sm shadow-md select-none">
          {product.price}
        </div>

        {/* Product Image */}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Image overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#131316] via-transparent to-transparent opacity-60" />
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-grow p-6">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight tracking-wide group-hover:text-[#FF5500] transition-colors duration-200">
          {product.name}
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 flex-grow">
          {product.description}
        </p>

        {/* Fixed SpoolioV2 Product Route Button */}
        <div className="mt-6">
          <Link
            href={productUrl}
            className="
              relative flex items-center justify-center gap-2.5 w-full py-3.5 px-6 rounded-2xl
              font-extrabold text-sm tracking-wider uppercase transition-all duration-300 select-none
              bg-[#FF5500] hover:bg-[#ff661a] text-black shadow-lg hover:shadow-[#FF5500]/25 active:scale-95
              border border-amber-300
            "
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Personnaliser &amp; Acheter</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
