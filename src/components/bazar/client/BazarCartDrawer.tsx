"use client";

import React, { useState } from "react";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { useBazarCart } from "@/context/BazarCartContext";
import { formatPrice } from "@/lib/bazar/coordinates";
import { ProductCrop } from "./ProductCrop";

export const BazarCartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalCents,
    totalCount,
    isCheckoutOpen,
    setIsCheckoutOpen,
    orderConfirmation,
    clearOrderConfirmation,
    submitSimulatedCheckout,
    resetDemoData,
  } = useBazarCart();

  const [customerName, setCustomerName] = useState("Camille");
  const [customerEmail, setCustomerEmail] = useState("camille@exemple.fr");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen && !isCheckoutOpen && !orderConfirmation) return null;

  const handleStartCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await submitSimulatedCheckout(customerName, customerEmail);
    setIsSubmitting(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-fade-in"
        onClick={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(false);
        }}
      />

      {/* Cart Sliding Drawer */}
      {isCartOpen && (
        <div
          role="dialog"
          aria-labelledby="cart-drawer-title"
          aria-modal="true"
          className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-[#E4E4E0] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#E4E4E0] flex items-center justify-between bg-[#FAF9F6]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#FF5500]" />
              <h2 id="cart-drawer-title" className="text-lg font-bold text-[#121212]">
                Panier Le Bazar
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#FF5500]/10 text-[#FF5500] font-bold text-xs">
                {totalCount}
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#E4E4E0]">
            {cart.map((cartItem) => {
              const { item, quantity, zone, scene } = cartItem;
              return (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                  {scene && (
                    <ProductCrop
                      imageUrl={scene.imageUrl}
                      zone={zone}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl border border-[#E4E4E0] shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#121212] truncate">
                      {item.name}
                    </h3>

                    <div className="text-xs font-extrabold text-[#FF5500] mt-0.5">
                      {formatPrice(item.priceCents)}
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-[#FAF9F6] border border-[#E4E4E0] rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, quantity - 1)}
                          className="p-1 rounded text-neutral-600 hover:bg-white transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <span className="px-2 text-xs font-bold text-[#121212]">
                          {quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.id, quantity + 1)}
                          disabled={quantity >= item.quantity}
                          className="p-1 rounded text-neutral-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Retirer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {cart.length === 0 && (
              <div className="py-16 text-center">
                <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-700">Votre panier est vide</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Explorez les photographies et touchez un objet pour le glisser dans votre panier.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#E4E4E0] bg-[#FAF9F6] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 font-medium">Sous-total</span>
                <span className="text-xl font-black text-[#121212] font-righteous">
                  {formatPrice(totalCents)}
                </span>
              </div>

              <button
                onClick={handleStartCheckout}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#FF5500] hover:bg-[#e04b00] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Commander (Simulation)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                <button
                  onClick={clearCart}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Vider le panier
                </button>
                <span>Environnement local isolé</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Simulated Checkout Modal */}
      {isCheckoutOpen && (
        <div
          role="dialog"
          aria-labelledby="checkout-modal-title"
          aria-modal="true"
          className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white border border-[#E4E4E0] rounded-3xl shadow-2xl z-50 p-6 md:p-8 animate-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 id="checkout-modal-title" className="text-xl font-extrabold text-[#121212]">
              Finalisation de commande
            </h3>
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mandatory Simulation Warning Notice */}
          <div className="mb-5 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">PROTOTYPE LOCAL UNIQUEMENT</strong>
              Aucun paiement Stripe réel n&apos;est déclenché. La validation décrémentera uniquement le stock du prototype local pour simuler l&apos;achat en direct.
            </div>
          </div>

          <form onSubmit={handleConfirmOrder} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Nom complet
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] text-sm text-[#121212] focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Email de confirmation
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] text-sm text-[#121212] focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none"
              />
            </div>

            <div className="pt-2 border-t border-[#E4E4E0] flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-600">Total à régler (fictif)</span>
              <span className="text-2xl font-black text-[#FF5500] font-righteous">
                {formatPrice(totalCents)}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#FF5500] hover:bg-[#e04b00] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Validation en cours...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmer la commande simulée</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Order Confirmation Screen */}
      {orderConfirmation && (
        <div
          role="dialog"
          aria-labelledby="success-modal-title"
          aria-modal="true"
          className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white border border-[#E4E4E0] rounded-3xl shadow-2xl z-50 p-6 md:p-8 animate-in zoom-in-95 duration-200"
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 id="success-modal-title" className="text-2xl font-black text-[#121212] font-righteous">
              Commande confirmée !
            </h3>

            <p className="text-xs text-neutral-500 mt-1">
              Référence : <span className="font-mono font-bold text-[#FF5500]">{orderConfirmation.orderId}</span>
            </p>

            <div className="mt-4 p-3 rounded-2xl bg-[#FAF9F6] border border-[#E4E4E0] text-xs text-neutral-600 text-left">
              <div className="font-bold text-[#121212] mb-1">Objets adoptés :</div>
              <ul className="list-disc list-inside space-y-0.5">
                {orderConfirmation.items.map((it) => (
                  <li key={it.item.id}>
                    {it.quantity}x {it.item.name} ({formatPrice(it.item.priceCents * it.quantity)})
                  </li>
                ))}
              </ul>
              <div className="mt-2 pt-2 border-t border-[#E4E4E0] font-bold flex justify-between text-[#121212]">
                <span>Total fictif</span>
                <span>{formatPrice(orderConfirmation.totalCents)}</span>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-neutral-400">
              Les stocks locaux ont été décrémentés. Les objets à quantité zéro sont désormais indiqués comme « Vendu » sur la photo.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={clearOrderConfirmation}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#121212] text-white hover:bg-neutral-800 text-xs font-bold transition-all cursor-pointer"
              >
                Continuer à chiner
              </button>

              <button
                onClick={resetDemoData}
                className="py-3 px-4 rounded-2xl border border-[#E4E4E0] hover:bg-neutral-50 text-neutral-600 hover:text-[#121212] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Remet les stocks initiaux et les scènes par défaut"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser la démo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

