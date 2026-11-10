"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X, ShoppingBag, Check, AlertCircle, ExternalLink, Camera } from "lucide-react";
import { BazarItem, BazarScene, BazarZone } from "@/types/bazar";
import { formatPrice, getConditionBadgeStyle, getConditionLabel } from "@/lib/bazar/coordinates";
import { ProductCrop } from "./ProductCrop";
import { useBazarCart } from "@/context/BazarCartContext";

interface ProductQuickViewProps {
  item: BazarItem | null;
  zone?: BazarZone;
  scene?: BazarScene;
  onClose: () => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  item,
  zone,
  scene,
  onClose,
}) => {
  const { addToCart, cart } = useBazarCart();
  const [justAdded, setJustAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Reset selected image index when item changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [item?.id]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const isSold = item.status === "sold" || item.quantity <= 0;
  const badgeStyle = getConditionBadgeStyle(item.condition);

  // Check how many already in cart
  const inCartCount = cart.find((c) => c.item.id === item.id)?.quantity || 0;
  const remainingStock = Math.max(0, item.quantity - inCartCount);
  const canAddMore = !isSold && remainingStock > 0;

  const handleAddToCart = () => {
    if (!canAddMore) return;
    const added = addToCart(item, zone, scene);
    if (added) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const additionalImages = item.additionalImages || [];
  const hasMultipleImages = additionalImages.length > 0;

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-fade-in"
        onClick={onClose}
      />

      {/* Floating Panel: Bottom sheet on mobile, fixed floating card on desktop */}
      <div
        role="dialog"
        aria-labelledby="quick-view-title"
        aria-modal="true"
        className="fixed bottom-0 inset-x-0 md:inset-x-auto md:bottom-8 md:right-8 md:w-96 max-h-[90vh] md:max-h-[85vh] overflow-y-auto z-50 bg-white border border-[#E4E4E0] rounded-t-3xl md:rounded-3xl shadow-2xl p-5 md:p-6 transition-all animate-in slide-in-from-bottom-5 duration-300"
      >
        {/* Header row: badge and close */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
            >
              {getConditionLabel(item.condition)}
            </span>
            {isSold && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600 border border-neutral-300">
                Vendu
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer la fiche produit"
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content row: cropped image thumbnail / photo active + info */}
        <div className="flex gap-4 items-start">
          <div className="shrink-0 flex flex-col gap-2">
            {selectedImageIndex === 0 && scene ? (
              <ProductCrop
                imageUrl={scene.imageUrl}
                zone={zone}
                alt={item.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shadow-inner border border-[#E4E4E0] shrink-0"
                paddingRatio={0.15}
              />
            ) : selectedImageIndex > 0 && additionalImages[selectedImageIndex - 1] ? (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border border-[#E4E4E0] overflow-hidden bg-[#FAF9F6] relative shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={additionalImages[selectedImageIndex - 1]}
                  alt={`${item.name} - Photo détail`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs">
                  Détail
                </span>
              </div>
            ) : null}

            {/* Thumbnails strip if multiple photos exist */}
            {hasMultipleImages && (
              <div className="flex gap-1.5 items-center justify-center">
                {/* Scene crop thumbnail */}
                <button
                  type="button"
                  onClick={() => setSelectedImageIndex(0)}
                  title="Vue d'ensemble sur la photo"
                  className={`w-7 h-7 rounded-lg border overflow-hidden transition-all cursor-pointer ${
                    selectedImageIndex === 0
                      ? "border-[#FF5500] ring-2 ring-[#FF5500]/30 scale-105"
                      : "border-[#E4E4E0] opacity-70 hover:opacity-100"
                  }`}
                >
                  {scene ? (
                    <ProductCrop
                      imageUrl={scene.imageUrl}
                      zone={zone}
                      alt="Vue d'ensemble"
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                      <Camera className="w-3 h-3 text-neutral-500" />
                    </div>
                  )}
                </button>

                {/* Additional photos thumbnails */}
                {additionalImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx + 1)}
                    title={`Photo de détail ${idx + 1}`}
                    className={`w-7 h-7 rounded-lg border overflow-hidden transition-all cursor-pointer ${
                      selectedImageIndex === idx + 1
                        ? "border-[#FF5500] ring-2 ring-[#FF5500]/30 scale-105"
                        : "border-[#E4E4E0] opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Miniature ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2
              id="quick-view-title"
              className="text-lg sm:text-xl font-bold text-[#121212] leading-snug line-clamp-2"
            >
              {item.name}
            </h2>

            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#FF5500] font-righteous">
                {formatPrice(item.priceCents)}
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                {isSold ? (
                  "Épuisé"
                ) : item.quantity === 1 ? (
                  <span className="text-amber-700 font-semibold">1 pièce unique</span>
                ) : (
                  `${item.quantity} disponibles`
                )}
              </span>
            </div>

            {inCartCount > 0 && !isSold && (
              <div className="mt-1 text-xs text-neutral-600 font-medium">
                {inCartCount} déjà dans votre panier
              </div>
            )}
          </div>
        </div>

        {/* Description & Condition Notes */}
        {item.description && (
          <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E4E4E0]">
            {item.description}
          </p>
        )}

        {item.conditionNotes && (
          <div className="mt-2.5 flex items-start gap-1.5 p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>{item.conditionNotes}</span>
          </div>
        )}

        {/* Linked Shop Product (e.g. standard version in Spoolio store) */}
        {item.linkedProductSlug && (
          <Link
            href={`/produit/${item.linkedProductSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/90 hover:bg-orange-100/60 hover:border-orange-300 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white border border-orange-200 flex items-center justify-center shrink-0 shadow-xs">
                <ExternalLink className="w-4 h-4 text-[#FF5500] group-hover:scale-110 transition-transform" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">
                  Modèle officiel en boutique
                </div>
                <div className="text-xs font-bold text-[#121212] truncate">
                  {item.linkedProductName || "Voir la version neuve"}
                  {item.linkedProductPrice ? ` • ${item.linkedProductPrice} €` : ""}
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-[#FF5500] shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform">
              Voir →
            </span>
          </Link>
        )}

        {/* Action Button */}
        <div className="mt-5 pt-3 border-t border-[#E4E4E0]">
          {isSold ? (
            <button
              disabled
              className="w-full py-3 px-4 rounded-2xl bg-neutral-100 text-neutral-400 font-bold text-sm cursor-not-allowed border border-neutral-200 flex items-center justify-center gap-2"
            >
              <span>Objet déjà adopté</span>
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!canAddMore}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
                justAdded
                  ? "bg-emerald-600 text-white"
                  : canAddMore
                  ? "bg-[#FF5500] hover:bg-[#e04b00] text-white"
                  : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Ajouté au panier !</span>
                </>
              ) : canAddMore ? (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Ajouter au panier</span>
                  <span className="text-white/80">•</span>
                  <span>{formatPrice(item.priceCents)}</span>
                </>
              ) : (
                <span>Stock maximum atteint</span>
              )}
            </button>
          )}

          <p className="mt-2 text-center text-[11px] text-neutral-400">
            Pièce vérifiée en atelier • Prête à être expédiée
          </p>
        </div>
      </div>
    </>
  );
};

