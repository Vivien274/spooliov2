"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Plus, Check, Sparkles } from "lucide-react";

export interface CrossSellItem {
  id: number;
  name: string;
  price: string;
  slug: string;
  image: string;
  badge: string;
}

export const REAL_SPOOLIO_CROSS_SELL: CrossSellItem[] = [
  {
    id: 11035,
    name: "Fidget bague rotative",
    price: "3.00",
    slug: "fidget-bague-rotative",
    image: "/images/imported/Spoolio-fidget-bague-rotative-5-scaled.webp",
    badge: "Bague Anti-Stress",
  },
  {
    id: 11074,
    name: "Fidget \"Twist\"",
    price: "3.00",
    slug: "fidget-twist",
    image: "/images/imported/Spoolio-fidget-twist-2-scaled.webp",
    badge: "Sensoriel & Focus",
  },
  {
    id: 10092,
    name: "Les mini potes",
    price: "2.00",
    slug: "bonhomme-bureau",
    image: "/images/imported/Spoolio_SecretSanta-bonhommes-9-scaled.webp",
    badge: "Figurine 3D",
  },
];

interface CartCrossSellProps {
  variant?: "drawer" | "page";
}

export default function CartCrossSell({ variant = "drawer" }: CartCrossSellProps) {
  const { cartItems, addToCart } = useCart();
  const [justAddedId, setJustAddedId] = useState<number | null>(null);

  const handleAdd = (item: CrossSellItem) => {
    addToCart(
      {
        productId: item.id,
        name: item.name,
        slug: item.slug,
        price: item.price,
        selectedOptions: {},
        image: item.image,
      },
      1,
      false
    );

    setJustAddedId(item.id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  return (
    <div className="w-full space-y-3 font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white">
          <Sparkles className="w-3.5 h-3.5 text-[#ff4f00]" />
          <span>Complétez votre commande</span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">Mini-prix Spoolio</span>
      </div>

      <div className={variant === "drawer" ? "space-y-2.5" : "grid grid-cols-1 sm:grid-cols-3 gap-3"}>
        {REAL_SPOOLIO_CROSS_SELL.map((item) => {
          const isAlreadyInCart = cartItems.some((ci) => ci.productId === item.id || ci.slug === item.slug);
          const wasJustAdded = justAddedId === item.id;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 transition-all gap-3"
            >
              {/* Product Thumbnail + Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="relative w-12 h-12 rounded-xl bg-black/40 border border-white/10 overflow-hidden shrink-0 group/img block"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover group-hover/img:scale-110 transition-transform no-invert"
                  />
                </Link>

                <div className="flex flex-col min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    className="text-xs font-bold text-white hover:text-[#ff4f00] transition-colors truncate leading-tight"
                  >
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-black text-[#ff4f00]">
                      {item.price}€
                    </span>
                    <span className="text-[9px] font-mono text-gray-400 truncate">
                      • {item.badge}
                    </span>
                  </div>
                </div>
              </div>

              {/* 1-Click Add Button */}
              <button
                type="button"
                onClick={() => handleAdd(item)}
                className={`h-8 px-3 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer shadow-md active:scale-95 ${
                  isAlreadyInCart || wasJustAdded
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-[#ff4f00] hover:bg-[#e04500] text-white shadow-[#ff4f00]/25"
                }`}
              >
                {isAlreadyInCart || wasJustAdded ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Ajouté</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    <span>Ajouter</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
