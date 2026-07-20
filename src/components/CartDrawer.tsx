"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import UnicornIcon from "@/components/UnicornIcon";
import checkoutIconData from "@/components/checkout-bag.json";

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  const router = useRouter();

  if (!isCartOpen) return null;

  const handleGoToCart = () => {
    setIsCartOpen(false);
    router.push("/panier");
  };

  return (
    <div className="fixed inset-0 z-[10000] flex justify-end font-sans select-none animate-fade-in">
      {/* Background Overlay Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Cart Panel Slide-over */}
      <div className="relative w-full sm:max-w-[440px] md:max-w-[480px] h-full bg-[#111113] border-l border-[#222225] shadow-2xl flex flex-col justify-between z-10 transition-transform duration-300 animate-slide-in cart-panel">
        {/* Header Section */}
        <div className="p-6 border-b border-[#222225] flex items-center justify-between cart-header">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛒</span>
            <h2 className="text-md font-extrabold text-white tracking-tight uppercase">Mon Panier</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2F3CD9]/20 text-blue-400">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer text-lg font-bold close-btn"
          >
            &times;
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        {cartItems.length > 0 && (
          <div className="px-6 py-4 bg-[#161619]/60 border-b border-[#222225] flex flex-col gap-2 font-sans select-none no-invert">
            <div className="flex items-center justify-between text-[11px] font-bold">
              {cartTotal < 40 ? (
                <>
                  <span className="text-gray-400">
                    Plus que <strong className="text-[#ff4f00]">{(40 - cartTotal).toFixed(2)}€</strong> pour la livraison offerte !
                  </span>
                  <span className="text-[#ff4f00] animate-bounce">🚀</span>
                </>
              ) : (
                <>
                  <span className="text-emerald-400 flex items-center gap-1">
                    🎉 Livraison offerte active !
                  </span>
                  <span className="text-emerald-400 font-black uppercase tracking-wider text-[10px]">Offerte</span>
                </>
              )}
            </div>
            <div className="w-full bg-[#222225] h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  cartTotal < 40 ? "bg-gradient-to-r from-[#ff4f00]/60 to-[#ff4f00]" : "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                }`}
                style={{ width: `${Math.min((cartTotal / 40) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items Scroll Container */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 cart-content">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center select-none py-12">
              <span className="text-4xl mb-4 opacity-40">🛍️</span>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Votre panier est vide</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 px-5 py-2.5 text-xs font-bold text-black bg-white hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Continuer mes achats
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-[#18181b]/50 border border-[#222225] rounded-2xl p-3 cart-item"
                >
                  {/* Product Image */}
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/5 bg-black/20 flex items-center justify-center text-lg">
                    {item.productId === -1 ? (
                      <span className="select-none">🌾</span>
                    ) : item.productId === -2 ? (
                      <span className="select-none">☕</span>
                    ) : item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover no-invert"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-white/5" />
                    )}
                  </div>

                  {/* Info & Options */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {item.productId < 0 ? (
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
                        {Object.entries(item.selectedOptions).map(([key, val]) => (
                          <span key={key} className="text-[9px] font-bold text-gray-500 font-sans uppercase">
                            {key}: <span className="text-gray-300">{val}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      {/* Quantity selectors */}
                      {item.productId < 0 ? (
                        <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest font-sans">
                          Soutien
                        </span>
                      ) : (
                        <div className="flex items-center bg-[#111] border border-[#222] rounded-lg h-7 px-1.5 qty-selector">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white rounded active:scale-95 transition-all text-xs font-bold cursor-pointer qty-btn"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold text-[10px] text-white qty-display">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white rounded active:scale-95 transition-all text-xs font-bold cursor-pointer qty-btn"
                          >
                            +
                          </button>
                        </div>
                      )}

                      <span className="text-xs font-black text-white item-price">
                        {(parseFloat(item.price) * item.quantity).toFixed(2)}€
                      </span>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-7 h-7 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg flex items-center justify-center transition-colors cursor-pointer text-xs remove-item-btn"
                    title="Retirer l'article"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer & Go to checkout */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-[#222225] bg-[#131316]/50 flex flex-col gap-4 cart-footer">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sous-total</span>
              <span className="text-base font-black text-white">{cartTotal.toFixed(2)}€</span>
            </div>

            <button
              onClick={handleGoToCart}
              className="w-full h-12 flex items-center justify-center gap-2 text-xs font-black text-white bg-[#ff4f00] hover:bg-[#e04500] rounded-xl transition-all shadow-xl shadow-[#ff4f00]/15 cursor-pointer uppercase tracking-wider font-sans no-invert"
            >
              <span>Voir mon panier</span>
              <UnicornIcon animationData={checkoutIconData} className="w-8 h-4 scale-[1.3]" loop={true} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
