"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import CartCrossSell from "@/components/CartCrossSell";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Sparkles, Truck } from "lucide-react";
import { isPreprodEnv } from "@/lib/env";

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    appliedPromo,
    discountAmount,
    shippingConfig,
  } = useCart();

  const router = useRouter();

  if (!isCartOpen) return null;

  const handleGoToCart = () => {
    setIsCartOpen(false);
    router.push("/panier");
  };

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const finalTotal = Math.max(0, cartTotal - discountAmount);
  const freeShippingThreshold = shippingConfig.freeShippingThreshold;
  const isFreeShippingByPromo = shippingConfig.enablePromoFreeShipping && appliedPromo?.discountType === "free_shipping";
  const missingForFreeShipping = isFreeShippingByPromo ? 0 : Math.max(0, freeShippingThreshold - finalTotal);
  const shippingProgress = isFreeShippingByPromo ? 100 : Math.min(100, (finalTotal / freeShippingThreshold) * 100);

  const eligibleTotal = cartItems
    .filter((item) => item.productId > 0 && !item.isLoyaltyReward)
    .reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
  const pointsEarned = Math.floor(eligibleTotal / 2);

  return (
    <div className="fixed inset-0 z-[100000] flex justify-end font-sans select-none animate-fade-in pointer-events-auto">
      {/* Soft Backdrop Overlay */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Cart Panel Drawer */}
      <div className="relative w-full sm:max-w-[440px] md:max-w-[460px] h-full bg-white shadow-2xl flex flex-col z-10 overflow-hidden transition-transform duration-300 animate-slide-in text-zinc-900">
        
        {/* 1. Header & Free Shipping Progress (Seamless, NO liseré above shipping bar) */}
        <div className="shrink-0 px-6 pt-5 pb-4 bg-white border-b border-zinc-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
              Panier
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-zinc-500 hover:text-zinc-950 transition-colors p-1 cursor-pointer"
              title="Fermer"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Integrated Free Shipping Gauge (Directly integrated, no border above) */}
          {cartItems.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-zinc-600">
                {missingForFreeShipping > 0 ? (
                  <span>
                    Plus que <strong className="text-zinc-950 font-semibold">{missingForFreeShipping.toFixed(2).replace('.', ',')} €</strong> pour la livraison offerte
                  </span>
                ) : (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    Livraison offerte débloquée ! 🎉
                  </span>
                )}
                <span className="text-[10px] font-mono text-zinc-400">{Math.round(shippingProgress)}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    missingForFreeShipping > 0 ? "bg-[#ff4f00]" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.max(shippingProgress > 0 ? 3 : 0, shippingProgress)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Cart Items Scroll Container */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col justify-between">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center select-none py-16 px-6">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-3xl mb-3 shadow-xs">
                🛍️
              </div>
              <h3 className="text-base font-bold text-zinc-950 tracking-tight mb-1">
                Votre panier est vide
              </h3>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed mb-6">
                Découvrez nos créations 3D, objets tactiles et pochettes surprises d'atelier faites main.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-3 text-xs font-bold text-white bg-zinc-950 hover:bg-[#ff4f00] rounded-full transition-all shadow-md cursor-pointer tracking-wider uppercase"
              >
                Explorer la boutique
              </button>
            </div>
          ) : (
            <div>
              {/* Items List */}
              <div className="px-6 py-5 space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4"
                  >
                    {/* Thumbnail Image - Generous Cropped square */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-2xl overflow-hidden shrink-0 bg-zinc-100 flex items-center justify-center text-3xl shadow-2xs">
                      {item.productId === -1 ? (
                        <span>🌾</span>
                      ) : item.productId === -2 ? (
                        <span>☕</span>
                      ) : (item.slug === "clicker-mecanique-sur-mesure" || !item.image) && (!item.image || item.image.includes("clicker-sur-mesure-thumb.jpg")) ? (
                        <span>⌨️</span>
                      ) : item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 96px, 112px"
                          className="object-cover no-invert"
                        />
                      ) : (
                        <span>⌨️</span>
                      )}
                    </div>

                    {/* Info & Quantity Controls */}
                    <div className="flex-1 flex flex-col min-w-0 justify-between py-0.5">
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900 leading-snug">
                          {item.slug === "tombola" ? (
                            <Link href="/tombola" onClick={() => setIsCartOpen(false)} className="hover:text-[#ff4f00] transition-colors">
                              {item.name}
                            </Link>
                          ) : item.slug === "calendrier-avent" ? (
                            <Link href="/calendrier-avent" onClick={() => setIsCartOpen(false)} className="hover:text-[#ff4f00] transition-colors">
                              {item.name}
                            </Link>
                          ) : item.slug === "clicker-mecanique-sur-mesure" ? (
                            <Link href={item.selectedOptions._configUrl || "/createur-cliqueur"} onClick={() => setIsCartOpen(false)} className="hover:text-[#ff4f00] transition-colors">
                              {item.name}
                            </Link>
                          ) : item.productId < 0 ? (
                            <span>{item.name}</span>
                          ) : (
                            <Link href={`/product/${item.slug}`} onClick={() => setIsCartOpen(false)} className="hover:text-[#ff4f00] transition-colors">
                              {item.name}
                            </Link>
                          )}
                        </h4>

                        {/* Selected Options */}
                        {Object.keys(item.selectedOptions).length > 0 && (
                          <div className="flex flex-wrap gap-x-2 text-xs text-zinc-500 mt-0.5">
                            {Object.entries(item.selectedOptions)
                              .filter(([key]) => !key.startsWith("_"))
                              .map(([key, val]) => (
                                <span key={key}>
                                  {key}: <strong className="text-zinc-700 font-semibold">{val}</strong>
                                </span>
                              ))}
                          </div>
                        )}

                        {/* Price */}
                        <div className="text-sm text-zinc-700 font-medium mt-1">
                          {item.isLoyaltyReward || parseFloat(item.price) === 0 ? (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              OFFERT
                            </span>
                          ) : (
                            <span>
                              {(parseFloat(item.price) * item.quantity).toFixed(2).replace('.', ',')} €
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stepper + Supprimer link */}
                      <div className="flex items-center gap-3 mt-3">
                        {item.productId < 0 ? (
                          <span className="text-xs font-medium text-zinc-500">
                            Qté : {item.quantity}
                          </span>
                        ) : (
                          <div className="inline-flex items-center border border-zinc-250 rounded-full px-3 py-1 bg-white text-zinc-800">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="text-zinc-500 hover:text-zinc-950 active:scale-90 transition-transform p-0.5 cursor-pointer"
                              title="Réduire"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center text-xs font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="text-zinc-500 hover:text-zinc-950 active:scale-90 transition-transform p-0.5 cursor-pointer"
                              title="Augmenter"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-zinc-400 hover:text-zinc-700 underline underline-offset-2 transition-colors cursor-pointer ml-1"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cross-Sell Block */}
              <CartCrossSell variant="drawer" />
            </div>
          )}
        </div>

        {/* 4. Docked Bottom Footer */}
        {cartItems.length > 0 && (
          <div className="shrink-0 px-6 py-5 border-t border-zinc-100 bg-white space-y-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            
            {/* Loyalty Points Info Line */}
            {pointsEarned > 0 && (
              <div className="flex items-center justify-between text-xs text-zinc-600 font-sans px-1">
                <span className="flex items-center gap-1.5 text-xs">
                  <span>👑</span>
                  <span><strong>+{pointsEarned} points</strong> Spoolio gagnés</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-[#ff4f00] bg-[#ff4f00]/10 border border-[#ff4f00]/25 px-2 py-0.5 rounded-full">
                  +{pointsEarned} PTS
                </span>
              </div>
            )}

            {/* Promo Discount Row */}
            {appliedPromo && (discountAmount > 0 || appliedPromo.discountType === "free_shipping") && (
              <div className="flex items-center justify-between text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                <span>Code promo : {appliedPromo.code}</span>
                <span className="font-mono">
                  {appliedPromo.discountType === "free_shipping" ? "Port Offert" : `-${discountAmount.toFixed(2).replace('.', ',')} €`}
                </span>
              </div>
            )}

            {/* Main Action Button - Spoolio Orange Pill */}
            <button
              onClick={handleGoToCart}
              className="w-full py-4 px-6 rounded-full bg-[#ff4f00] hover:bg-[#e04500] text-white font-bold text-sm sm:text-base tracking-wide transition-all shadow-md shadow-[#ff4f00]/20 active:scale-[0.99] flex items-center justify-center cursor-pointer"
            >
              <span>Passer la commande • {finalTotal.toFixed(2).replace('.', ',')} €</span>
            </button>

            {/* Subtext */}
            <p className="text-xs text-zinc-400 text-center font-normal">
              Livraison et taxes calculées à l&apos;étape suivante
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
