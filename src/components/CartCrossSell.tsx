"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Plus, Check, Sparkles, ShoppingBag } from "lucide-react";

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
    <div className="w-full bg-[#f8f8f9] px-6 py-5 border-t border-zinc-200/70 space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 font-sans">
          Vous aimerez aussi
        </h3>
      </div>

      <div className="space-y-3">
        {REAL_SPOOLIO_CROSS_SELL.map((item) => {
          const isAlreadyInCart = cartItems.some((ci) => ci.productId === item.id || ci.slug === item.slug);
          const wasJustAdded = justAddedId === item.id;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3"
            >
              {/* Product Thumbnail + Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="relative w-12 h-12 aspect-square rounded-xl bg-zinc-100 overflow-hidden shrink-0 group/img block"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover group-hover/img:scale-105 transition-transform no-invert"
                  />
                </Link>

                <div className="flex flex-col min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    className="text-xs font-semibold text-zinc-900 hover:text-[#ff4f00] transition-colors truncate leading-tight"
                  >
                    {item.name}
                  </Link>
                  <span className="text-xs text-zinc-600 font-medium mt-0.5">
                    {parseFloat(item.price).toFixed(2).replace('.', ',')} €
                  </span>
                </div>
              </div>

              {/* Circular Action Button with Shopping Bag */}
              <button
                type="button"
                onClick={() => handleAdd(item)}
                aria-label={`Ajouter ${item.name} au panier`}
                className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center shrink-0 cursor-pointer active:scale-95 ${
                  isAlreadyInCart || wasJustAdded
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : "border-[#ff4f00] text-[#ff4f00] hover:bg-[#ff4f00]/10"
                }`}
              >
                {isAlreadyInCart || wasJustAdded ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ShoppingBag className="w-4 h-4 text-[#ff4f00]" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
