"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import CartCrossSell from "@/components/CartCrossSell";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Sparkles, Truck } from "lucide-react";

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
      {/* Dark Blur Overlay Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Cart Panel Drawer */}
      <div className="relative w-full sm:max-w-[450px] md:max-w-[480px] h-full sm:h-[calc(100vh-2rem)] sm:my-auto bg-[#0a0a0e] border-l sm:border border-white/10 sm:rounded-l-3xl shadow-2xl flex flex-col z-10 overflow-hidden transition-transform duration-300 animate-slide-in">
        
        {/* Subtle Glow Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4f00]/08 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/05 blur-3xl pointer-events-none rounded-full" />

        {/* 1. Unified Header & Free Shipping Progress Bar */}
        <div className="shrink-0 px-4 sm:px-5 py-3.5 border-b border-white/10 bg-[#0a0a0e]/95 backdrop-blur-md space-y-3">
          {/* Top Row: Title + Item Count + Close Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#ff4f00]/15 border border-[#ff4f00]/30 text-[#ff4f00] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4 text-[#ff4f00]" />
              </div>
              <h2 className="text-base font-black text-white uppercase font-antonio tracking-wide flex items-center gap-2">
                <span>Mon Panier</span>
                <span className="text-xs font-mono font-bold text-gray-400 bg-white/10 px-2 py-0.5 rounded-md">
                  {totalQuantity}
                </span>
              </h2>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Fermer"
              aria-label="Fermer le panier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Integrated Free Shipping Gauge */}
          {cartItems.length > 0 && (
            <div className="pt-1.5 space-y-1.5 border-t border-white/5">
              <div className="flex items-center justify-between text-[11px]">
                {missingForFreeShipping > 0 ? (
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Truck className="w-3.5 h-3.5 text-[#ff4f00] shrink-0" />
                    <span>
                      Plus que <strong className="text-[#ff4f00] font-bold">{missingForFreeShipping.toFixed(2)}€</strong> pour la <strong className="text-white">Livraison Offerte</strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Livraison offerte débloquée !</span>
                  </div>
                )}
                <span className="text-[10px] font-mono font-bold text-gray-400">{Math.round(shippingProgress)}%</span>
              </div>

              <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-white/15 relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    missingForFreeShipping > 0
                      ? "bg-gradient-to-r from-[#ff4f00] via-amber-400 to-[#005cff] shadow-[0_0_10px_rgba(255,79,0,0.6)]"
                      : "bg-emerald-400 shadow-[0_0_10px_#34d399]"
                  }`}
                  style={{ width: `${Math.max(shippingProgress > 0 ? 3 : 0, shippingProgress)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Cart Items Scroll Container (flex-1 min-h-0 overflow-y-auto) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-3 space-y-3 custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center select-none py-12">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-3">
                🛍️
              </div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-1 font-antonio">
                Votre panier est vide
              </h3>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-5 font-sans">
                Découvrez nos fidgets sensoriels, créations 3D et pochettes surprises faites main.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-5 py-2.5 text-xs font-black text-white bg-[#ff4f00] hover:bg-[#e04500] rounded-xl transition-all shadow-lg cursor-pointer uppercase tracking-wider"
              >
                Explorer la boutique
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-2xl p-3 transition-all"
                >
                  {/* Thumbnail Image */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/40 flex items-center justify-center text-xl shadow-inner">
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
                        sizes="60px"
                        className="object-cover no-invert"
                      />
                    ) : (
                      <span>⌨️</span>
                    )}
                  </div>

                  {/* Info & Quantity Controls */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-extrabold text-white truncate leading-snug">
                        {item.slug === "tombola" ? (
                          <Link href="/tombola" onClick={() => setIsCartOpen(false)} className="hover:text-[#ff4f00] transition-colors">
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

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-500 hover:text-red-400 p-1 transition-colors cursor-pointer shrink-0"
                        title="Supprimer"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Selected Options */}
                    {Object.keys(item.selectedOptions).length > 0 && (
                      <div className="flex flex-wrap gap-x-2 text-[11px] text-gray-400 mt-0.5">
                        {Object.entries(item.selectedOptions)
                          .filter(([key]) => !key.startsWith("_"))
                          .map(([key, val]) => (
                            <span key={key}>
                              {key}: <strong className="text-gray-200">{val}</strong>
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Quantity Stepper & Price Row */}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5">
                      {item.productId < 0 ? (
                        <span className="text-[11px] font-bold text-amber-400 uppercase font-mono">
                          Qté : {item.quantity}
                        </span>
                      ) : (
                        <div className="flex items-center border border-white/10 rounded-lg bg-black/40 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-white rounded active:scale-90 transition-all cursor-pointer"
                            title="Réduire"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-white font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-white rounded active:scale-90 transition-all cursor-pointer"
                            title="Augmenter"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {item.isLoyaltyReward || parseFloat(item.price) === 0 ? (
                        <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          OFFERT
                        </span>
                      ) : (
                        <span className="text-xs font-extrabold text-white font-mono">
                          {(parseFloat(item.price) * item.quantity).toFixed(2)}€
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Cross-Sell Block in Scroll View */}
              <div className="pt-2">
                <CartCrossSell variant="drawer" />
              </div>
            </div>
          )}
        </div>

        {/* 4. Docked Bottom Footer ("Bas Ferré" - Fixed & Always Visible on Mobile) */}
        {cartItems.length > 0 && (
          <div className="shrink-0 p-4 sm:p-5 border-t border-white/10 bg-[#0d0d11]/95 backdrop-blur-xl space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sticky bottom-0 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.7)]">
            
            {/* Loyalty points info line */}
            {pointsEarned > 0 && (
              <div className="flex items-center justify-between text-xs text-gray-300 font-sans px-1">
                <span className="flex items-center gap-1.5 text-xs">
                  <span>👑</span>
                  <span><strong>+{pointsEarned} points</strong> Spoolio gagnés</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-[#ff4f00] bg-[#ff4f00]/10 border border-[#ff4f00]/30 px-2 py-0.5 rounded-full">
                  +{pointsEarned} PTS
                </span>
              </div>
            )}

            {/* Price Total Row */}
            <div className="space-y-1 font-sans">
              {appliedPromo && (discountAmount > 0 || appliedPromo.discountType === "free_shipping") && (
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <span>Code {appliedPromo.code}</span>
                  <span className="font-mono">
                    {appliedPromo.discountType === "free_shipping" ? "Port Offert" : `-${discountAmount.toFixed(2)}€`}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-gray-200 uppercase tracking-wider">Total</span>
                  <span className="text-[10px] text-gray-400">TVA incluse • Frais de port à l'étape suivante</span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-white font-antonio tracking-tight">
                  {finalTotal.toFixed(2)}€
                </span>
              </div>
            </div>

            {/* Main Action Button - Docked & High Contrast */}
            <button
              onClick={handleGoToCart}
              className="w-full h-12 sm:h-13 flex items-center justify-center gap-2.5 text-xs font-black text-white bg-gradient-to-r from-[#ff4f00] to-[#FF7700] hover:from-[#e04500] hover:to-[#ff4f00] rounded-xl transition-all shadow-[0_4px_20px_rgba(255,79,0,0.4)] hover:scale-[1.01] active:scale-[0.98] cursor-pointer uppercase tracking-wider font-sans group/checkout"
            >
              <span>Valider mon panier ({finalTotal.toFixed(2)}€)</span>
              <ArrowRight className="w-4 h-4 text-white group-hover/checkout:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
