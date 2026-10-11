"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/components/ProductCard";
import { Sparkles, ArrowRight } from "lucide-react";

export type EditorialTabType = "favoris" | "nouveautes" | "under10";

interface BoutiqueEditorialSelectionProps {
  products: Product[];
  onApplySelectionToCatalogue?: (tab: EditorialTabType) => void;
}

export default function BoutiqueEditorialSelection({
  products,
}: BoutiqueEditorialSelectionProps) {
  // Format price helper
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    return num.toLocaleString("fr-FR", { minimumFractionDigits: num % 1 === 0 ? 0 : 2 }) + " €";
  };

  // 4 curated iconic products from real catalog
  const curatedProducts = useMemo(() => {
    const iconicKeywords = ["clicker", "marcel", "boîte", "dragon", "fidget", "support"];
    const found: Product[] = [];

    iconicKeywords.forEach((kw) => {
      const match = products.find(
        (p) =>
          p.name.toLowerCase().includes(kw) &&
          !found.some((f) => f.id === p.id)
      );
      if (match) found.push(match);
    });

    if (found.length < 4) {
      products.forEach((p) => {
        if (found.length < 4 && !found.some((f) => f.id === p.id)) {
          found.push(p);
        }
      });
    }

    return found.slice(0, 4);
  }, [products]);

  if (curatedProducts.length === 0) return null;

  return (
    <section className="mt-14 pt-10 border-t border-[#E4E4E0] font-sans" aria-labelledby="pepites-heading">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#FF5500] uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>SÉLECTION ÉDITORIALE</span>
          </div>
          <h2 id="pepites-heading" className="text-xl sm:text-2xl font-bold text-[#18181B] tracking-tight">
            Les pépites de l&apos;atelier
          </h2>
        </div>
        <p className="text-xs text-[#71717A] max-w-sm leading-relaxed">
          Quatre créations singulières qui incarnent l&apos;esprit Spoolio.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {curatedProducts.map((p) => {
          const imgUrl = p.images?.[0]?.src || "";
          return (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group bg-white border border-[#E4E4E0] hover:border-[#18181B]/40 rounded-xl p-3 flex flex-col justify-between transition-all duration-200 shadow-2xs hover:shadow-xs"
            >
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#F6F5F2] mb-2.5">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-[#A1A1AA]">
                    SPOOLIO
                  </div>
                )}
                <span className="absolute top-2 left-2 text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                  COUP DE CŒUR
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#18181B] group-hover:text-[#FF5500] transition-colors line-clamp-1 leading-snug">
                  {p.name}
                </h3>
                <div className="flex items-center justify-between font-mono text-xs text-[#71717A]">
                  <span className="font-bold text-[#18181B]">{formatPrice(p.price)}</span>
                  <span className="text-[10px] text-[#FF5500] group-hover:translate-x-0.5 transition-transform flex items-center">
                    Voir <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
