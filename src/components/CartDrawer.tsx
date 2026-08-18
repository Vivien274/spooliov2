"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import UnicornIcon from "@/components/UnicornIcon";
import checkoutIconData from "@/components/checkout-bag.json";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    cartTotal,
    appliedPromo,
    discountAmount,
  } = useCart();

  const router = useRouter();

  if (!isCartOpen) return null;

  const handleGoToCart = () => {
    setIsCartOpen(false);
    router.push("/panier");
  };

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const freeShippingThreshold = 40;
  const missingForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);
  const shippingProgress = Math.min(100, (cartTotal / freeShippingThreshold) * 100);

  const eligibleTotal = cartItems
    .filter((item) => item.productId > 0 && !item.isLoyaltyReward)
    .reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
  const pointsEarned = Math.floor(eligibleTotal / 2);

  return (
    <div className="fixed inset-0 z-[100000] flex justify-end p-2.5 sm:p-4 font-sans select-none animate-fade-in pointer-events-auto">
      {/* Background Overlay Backdrop with Blur */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Floating Card Cart Panel */}
      <div className="relative w-full sm:max-w-[460px] md:max-w-[490px] h-[calc(100vh-1.25rem)] sm:h-[calc(100vh-2rem)] my-auto bg-[#0d0d10]/95 dark:bg-[#0d0d10]/95 backdrop-blur-2xl border border-white/15 rounded-3xl sm:rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col justify-between z-10 transition-transform duration-300 animate-slide-in cart-panel overflow-hidden">
        
        {/* Subtle Ambient Background Blue & Orange Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#005cff]/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#ff4f00]/08 blur-3xl pointer-events-none rounded-full" />

        {/* 1. Header Section (Ultra-Sexy Glassmorphic Header) */}
        <div className="relative z-10 p-5 sm:px-6 sm:pt-6 sm:pb-4 flex items-center justify-between bg-white/[0.03] backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            {/* Glowing Icon Badge */}
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ff4f00] to-[#ff7700] text-white border border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,79,0,0.4)] shrink-0">
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0d0d10] animate-pulse" />
            </div>

            <div>
              <h2 className="text-base font-black text-white uppercase font-antonio tracking-wider drop-shadow-md">
                Mon Panier
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md hover:rotate-90"
            title="Fermer"
            aria-label="Fermer le panier"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Free Shipping Progress Gauge (Ultra-Sexy Glassmorphic Card) */}
        {cartItems.length > 0 && (
          <div className="relative z-10 px-5 sm:px-6 pt-2 pb-2 bg-transparent">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#ff4f00]/12 via-white/[0.04] to-blue-500/12 border border-white/15 font-sans space-y-2.5 shadow-[0_8px_25px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden group/gauge">
              
              {/* Subtle Card Ambient Glow */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-[#ff4f00]/15 blur-2xl pointer-events-none group-hover/gauge:scale-125 transition-transform duration-500" />

              <div className="flex items-center justify-between text-xs font-bold relative z-10">
                {missingForFreeShipping > 0 ? (
                  <div className="flex items-center gap-2 text-gray-200 text-[11px] leading-tight">
                    <Truck className="w-4 h-4 text-[#ff4f00] shrink-0 animate-bounce" />
                    <span>
                      Plus que <strong className="text-[#ff4f00] font-black text-xs drop-shadow">{missingForFreeShipping.toFixed(2)}€</strong> pour la <span className="text-white font-extrabold">Livraison Offerte</span> !
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-black uppercase text-[10px] tracking-wider">
                    <Sparkles className="w-4 h-4 animate-spin text-emerald-300" />
                    <span>🎉 LIVRAISON OFFERTE DÉBLOQUÉE !</span>
                  </div>
                )}

                <span className="text-[10px] font-mono font-black text-white px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 shadow-inner">
                  {Math.round(shippingProgress)}%
                </span>
              </div>

              {/* Progress Bar with Glowing Tip */}
              <div className="w-full bg-black/60 h-3 rounded-full overflow-hidden p-0.5 border border-white/15 relative shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-700 relative ${
                    missingForFreeShipping > 0
                      ? "bg-gradient-to-r from-[#ff4f00] via-amber-400 to-[#005cff] shadow-[0_0_15px_rgba(255,79,0,0.6)]"
                      : "bg-emerald-400 shadow-[0_0_15px_#34d399]"
                  }`}
                  style={{ width: `${shippingProgress}%` }}
                >
                  {/* Glowing Lead Orb */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Cart Items Scroll Container */}
        <div className="relative z-10 flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center select-none py-16">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-4 shadow-xl">
                🛍️
              </div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-1 font-antonio">
                Votre panier est vide
              </h3>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-6 font-sans">
                Découvrez nos fidgets sensoriels, créations 3D et pochettes surprises faites main.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-3 text-xs font-black text-white bg-[#005cff] hover:bg-[#004ecc] rounded-xl transition-all shadow-lg shadow-[#005cff]/25 cursor-pointer uppercase tracking-wider"
              >
                Explorer la boutique
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl p-3.5 transition-all group/item"
                  >
                    {/* Product Thumbnail */}
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10 bg-black/40 flex items-center justify-center text-2xl shadow-inner">
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
                          sizes="80px"
                          className="object-cover group-hover/item:scale-105 transition-transform duration-300 no-invert"
                        />
                      ) : (
                        <span>⌨️</span>
                      )}
                    </div>

                    {/* Info & Options */}
                    <div className="flex-1 flex flex-col min-w-0">
                      <h4 className="text-sm font-black text-white truncate leading-snug tracking-wide">
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
                      
                      {/* Selected Options list */}
                      {Object.keys(item.selectedOptions).length > 0 && (
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                          {Object.entries(item.selectedOptions)
                            .filter(([key]) => !key.startsWith("_"))
                            .map(([key, val]) => (
                              <span key={key} className="text-xs font-semibold text-gray-300 font-sans">
                                {key}: <strong className="text-white">{val}</strong>
                              </span>
                            ))}
                        </div>
                      )}

                      {/* Edit Custom Clicker Link */}
                      {item.slug === "clicker-mecanique-sur-mesure" && (
                        <Link
                          href={item.selectedOptions._configUrl || "/createur-cliqueur"}
                          onClick={() => setIsCartOpen(false)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#ff4f00] hover:underline mt-1"
                        >
                          <span>✏️ Modifier la création 3D</span>
                        </Link>
                      )}

                      {/* Price & Quantity Adjuster */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10">
                        {item.productId < 0 ? (
                          <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider font-mono">
                            Qté : {item.quantity}
                          </span>
                        ) : (
                          <div className="flex items-center border border-white/15 rounded-lg bg-black/40 p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-white rounded active:scale-90 transition-all cursor-pointer font-extrabold text-sm"
                              title="Réduire"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center text-xs font-black text-white font-mono">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-white rounded active:scale-90 transition-all cursor-pointer font-extrabold text-sm"
                              title="Augmenter"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {item.isLoyaltyReward || parseFloat(item.price) === 0 ? (
                          <span className="text-xs font-black text-emerald-400 font-antonio tracking-wide bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/40 shadow-sm">
                            OFFERT (0,00€)
                          </span>
                        ) : (
                          <span className="text-sm font-black text-white font-antonio tracking-wide">
                            {(parseFloat(item.price) * item.quantity).toFixed(2)}€
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove Item Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Retirer"
                      aria-label="Retirer l'article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
          )}
        </div>

        {/* 4. Footer Section & Checkout CTA */}
        {cartItems.length > 0 && (
          <div className="relative z-10 p-5 sm:p-6 border-t border-white/10 bg-white/[0.02] backdrop-blur-md space-y-4">
            
            {/* Reassurance Micro-Banner (No bottom border line) */}
            <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-bold text-gray-400 uppercase tracking-wider py-1 font-mono">
              <span className="flex items-center justify-center gap-1">🔒 Sécurisé</span>
              <span className="flex items-center justify-center gap-1">🇫🇷 Made in Nord</span>
              <span className="flex items-center justify-center gap-1">⚡ Expédition 24/48h</span>
            </div>

            {/* Loyalty Points Banner */}
            {pointsEarned > 0 && (
              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#ff4f00]/20 via-amber-500/15 to-[#005cff]/20 border border-[#ff4f00]/40 shadow-xl font-sans">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/images/spoolio-mascot.png"
                    alt="Mascotte Spoolio"
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0 filter drop-shadow-[0_6px_15px_rgba(255,79,0,0.45)] hover:scale-105 transition-transform"
                  />
                  <div className="text-left space-y-0.5">
                    <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 font-sans leading-tight">
                      <span>👑 +{pointsEarned} point{pointsEarned > 1 ? "s" : ""} Spoolio gagné{pointsEarned > 1 ? "s" : ""}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-300 font-semibold block leading-tight">
                      Crédités sur votre carte lors de la validation
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-[#ff4f00] font-mono bg-[#ff4f00]/25 border border-[#ff4f00]/50 px-3 py-1 rounded-full shrink-0 shadow-md">
                  +{pointsEarned} PTS
                </span>
              </div>
            )}

            {/* Total Row */}
            <div className="space-y-1.5 font-sans">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Sous-total</span>
                <span className="font-extrabold text-white font-mono">{cartTotal.toFixed(2)}€</span>
              </div>

              {appliedPromo && (discountAmount > 0 || appliedPromo.discountType === "free_shipping") && (
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
                  <span className="flex items-center gap-1.5">
                    <span>🏷️</span>
                    <span>Code {appliedPromo.code}</span>
                  </span>
                  <span className="font-extrabold font-mono">
                    {appliedPromo.discountType === "free_shipping"
                      ? "Port Offert"
                      : `-${discountAmount.toFixed(2)}€`}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Total</span>
                  <span className="text-[10px] text-gray-500 font-medium">TVA incluse • Port calculé à l'étape suivante</span>
                </div>
                <span className="text-2xl font-black text-white font-antonio tracking-tight">
                  {Math.max(0, cartTotal - discountAmount).toFixed(2)}€
                </span>
              </div>
            </div>

            {/* Sexy Checkout CTA Button */}
            <button
              onClick={handleGoToCart}
              className="w-full h-13 flex items-center justify-center gap-3 text-xs font-black text-white bg-gradient-to-r from-[#ff4f00] via-[#ff6600] to-[#ff4f00] hover:from-[#e04500] hover:to-[#ff4f00] rounded-xl transition-all shadow-[0_0_25px_rgba(255,79,0,0.35)] hover:shadow-[0_0_35px_rgba(255,79,0,0.6)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer uppercase tracking-wider font-sans group/checkout"
            >
              <span>Valider mon panier ({Math.max(0, cartTotal - discountAmount).toFixed(2)}€)</span>
              <ArrowRight className="w-4 h-4 text-white group-hover/checkout:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
