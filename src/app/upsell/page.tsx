"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Footer from "@/components/Footer";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  images: { id: number; src: string; name: string; alt: string }[];
  short_description?: string;
  categories?: { id: number; name: string; slug: string }[];
}

export default function UpsellPage() {
  const router = useRouter();
  const { cartItems, cartTotal, addToCart } = useCart();
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [addingIds, setAddingIds] = useState<Record<number, boolean>>({});
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // 1. Fetch products from API and filter suggestions
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.products || []);
          setCatalog(items);
        }
      } catch (e) {
        console.error("Failed to load catalog products:", e);
      }
    };
    fetchProducts();
  }, []);

  // Filter 3 appropriate suggestions not already in cart, prioritizing those that help reach free shipping (>= missing amount)
  useEffect(() => {
    if (catalog.length === 0) return;

    const inCartIds = new Set(cartItems.map((item) => String(item.productId)));
    const missingAmount = 40 - cartTotal;

    // Filter out products already in cart
    const available = catalog.filter((p) => !inCartIds.has(String(p.id)));

    let filtered: Product[] = [];
    if (missingAmount > 0) {
      // 1. Prioritize products that cost at least the missing amount to reach free shipping
      const prioritize = available.filter((p) => parseFloat(p.price) >= missingAmount);
      
      // Sort those by price ascending so the user sees the cheapest option that gets them to free shipping first
      prioritize.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

      filtered = prioritize.slice(0, 3);

      // 2. If we have less than 3 products, backfill with other available products (cheapest first)
      if (filtered.length < 3) {
        const remaining = available
          .filter((p) => !filtered.some((f) => f.id === p.id))
          .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        
          filtered = [...filtered, ...remaining].slice(0, 3);
      }
    } else {
      // If free shipping is already reached, suggest cheapest items to add as little extra cost as possible
      filtered = available
        .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        .slice(0, 3);
    }

    setSuggestions(filtered);
  }, [catalog, cartItems, cartTotal]);

  // Redirect to home if cart is empty and not loading checkout
  useEffect(() => {
    if (cartItems.length === 0 && !checkoutLoading) {
      router.push("/");
    }
  }, [cartItems, checkoutLoading, router]);

  const handleAddSuggestion = (p: Product) => {
    setAddingIds((prev) => ({ ...prev, [p.id]: true }));
    
    // Add product to cart without opening the drawer
    addToCart({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      price: p.sale_price || p.price,
      selectedOptions: {},
      image: p.images[0]?.src || "/images/figma_keychains.jpg"
    }, 1, false);

    // Simulate success animation state
    setTimeout(() => {
      setAddingIds((prev) => ({ ...prev, [p.id]: false }));
    }, 800);
  };

  const handleFinalCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);

    // Retrieve shipping options saved in localStorage
    const shippingMethod = localStorage.getItem("spoolio_shipping_method") || "pickup";
    const selectedRelayStr = localStorage.getItem("spoolio_selected_relay");
    let selectedRelay = null;
    if (selectedRelayStr) {
      try {
        selectedRelay = JSON.parse(selectedRelayStr);
      } catch (e) {
        console.warn("Could not parse saved selected relay");
      }
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          shippingMethod,
          selectedRelay,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'initialisation de la commande.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("L'URL de paiement est introuvable.");
      }
    } catch (e: any) {
      setCheckoutError(e.message || "Erreur de connexion avec la passerelle Stripe.");
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return null; // will redirect to home
  }

  return (
    <div className="min-h-screen bg-spoolio-bg text-white flex flex-col justify-between selection:bg-[#ff4f00] selection:text-white">
      {/* Centered Minimal Header */}
      <header className="h-24 w-full flex items-center justify-center max-w-[1200px] mx-auto px-6">
        <Link href="/">
          <Image
            src="/images/logo-spoolio-web-white.png"
            alt="Spoolio Logo"
            width={130}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col items-center justify-center">
        {/* Progress Banner */}
        <div className="w-full flex items-center justify-between text-xs text-gray-500 uppercase tracking-widest font-bold mb-8 max-w-2xl font-sans">
          <span className="text-[#005cff] flex items-center gap-1.5 font-sans">✓ Panier</span>
          <span className="w-8 h-px bg-white/10" />
          <span className="text-[#ff4f00] flex items-center gap-1.5 animate-pulse font-sans">🛒 Ventes Privées</span>
          <span className="w-8 h-px bg-white/10" />
          <span className="text-gray-600 font-sans">Paiement sécurisé</span>
        </div>

        {/* Header Title */}
        <div className="text-center max-w-xl mb-8">
          <h2 className="text-3xl sm:text-4xl font-black font-antonio tracking-tight uppercase text-white">
            Vous aimeriez peut-être aussi...
          </h2>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            Profitez-en pour ajouter une touche de fun à votre colis ! Aucun frais de port supplémentaire ne s'appliquera pour ces objets.
          </p>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="w-full max-w-2xl bg-spoolio-card border border-spoolio-border rounded-[24px] p-5 mb-10 flex flex-col gap-3 font-sans select-none shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold font-sans">
            {cartTotal < 40 ? (
              <>
                <span className="text-gray-400 font-sans">
                  Plus que <strong className="text-[#ff4f00] text-sm font-sans">{(40 - cartTotal).toFixed(2)}€</strong> pour profiter de la <span className="text-white">livraison offerte</span> !
                </span>
                <span className="text-[#ff4f00] animate-bounce text-sm">🚀</span>
              </>
            ) : (
              <>
                <span className="text-emerald-400 flex items-center gap-1.5 text-sm font-sans">
                  🎉 Livraison offerte active !
                </span>
                <span className="text-emerald-400 font-black uppercase tracking-wider text-[11px] font-sans">Offerte</span>
              </>
            )}
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                cartTotal < 40 ? "bg-gradient-to-r from-[#ff4f00]/60 to-[#ff4f00]" : "bg-emerald-400 shadow-[0_0_12px_#34d399]"
              }`}
              style={{ width: `${Math.min((cartTotal / 40) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Grille des suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-12">
          {suggestions.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-500 text-xs font-sans">
              Chargement des suggestions exclusives...
            </div>
          ) : (
            suggestions.map((p) => {
              const isAdding = addingIds[p.id];
              const price = parseFloat(p.price);
              return (
                <div 
                  key={p.id}
                  className="bg-spoolio-card border border-spoolio-border rounded-[24px] p-5 flex flex-col justify-between hover:border-spoolio-orange/30 hover:shadow-2xl transition-all duration-300 shadow-xl group font-sans"
                >
                  <div className="flex flex-col gap-3">
                    {/* Suggestion Image */}
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/20">
                      <Image
                        src={p.images[0]?.src || "/images/figma_keychains.jpg"}
                        alt={p.images[0]?.alt || p.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-102 no-invert"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                      <span className="absolute top-3 right-3 bg-white text-black font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow no-invert">
                        {price.toFixed(2)}€
                      </span>
                    </div>

                    {/* Metadata */}
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-[#ff4f00] transition-colors leading-tight">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-normal">
                        {p.short_description?.replace(/<[^>]*>/g, "") || "Objet fun imprimé en 3D."}
                      </p>
                    </div>
                  </div>

                  {/* Add button */}
                  <button
                    onClick={() => handleAddSuggestion(p)}
                    disabled={cartItems.some((item) => String(item.productId) === String(p.id)) || isAdding}
                    className={`w-full mt-4 h-9 flex items-center justify-center gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all no-invert ${
                      cartItems.some((item) => String(item.productId) === String(p.id))
                        ? "bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed"
                        : isAdding 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-wait" 
                          : "bg-[#005cff] text-white hover:bg-[#004ecc] hover:scale-[1.02] cursor-pointer"
                    }`}
                  >
                    {cartItems.some((item) => String(item.productId) === String(p.id)) 
                      ? "✓ Ajouté au colis" 
                      : isAdding 
                        ? "Ajout..." 
                        : "Ajouter au colis"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Total Summary and checkout actions */}
        <div className="w-full max-w-md bg-spoolio-card border border-spoolio-border p-6 rounded-[28px] flex flex-col gap-4 font-sans text-center shadow-2xl">
          <div className="flex items-center justify-between text-sm pb-3 border-b border-white/5">
            <span className="text-gray-400 font-medium font-sans">Panier total actualisé :</span>
            <div className="flex flex-col items-end">
              <span className="font-black text-xl text-white">{cartTotal.toFixed(2)}€</span>
              {cartTotal < 40 ? (
                <span className="text-[10px] text-gray-500 font-semibold mt-0.5 font-sans">+ 3,90€ de port</span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-bold mt-0.5 font-sans">Livraison offerte</span>
              )}
            </div>
          </div>

          {checkoutError && (
            <div className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg text-left">
              {checkoutError}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleFinalCheckout}
              disabled={checkoutLoading}
              className="w-full h-12 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-white bg-[#ff4f00] hover:bg-[#e04500] disabled:bg-[#ff4f00]/50 rounded-xl transition-all shadow-xl shadow-[#ff4f00]/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed no-invert"
            >
              {checkoutLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <span>Payer ma commande</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>

            <button
              onClick={handleFinalCheckout}
              disabled={checkoutLoading}
              className="text-[10px] text-gray-500 hover:text-white font-bold tracking-wide transition-colors cursor-pointer font-sans"
            >
              Non merci, procéder directement au paiement
            </button>
          </div>

          <span className="text-[9px] text-gray-600 leading-normal block font-sans">
            Paiement chiffré et sécurisé par Stripe. Expédié sous 48h.
          </span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
