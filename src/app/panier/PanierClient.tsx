"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, SelectedRelay } from "@/context/CartContext";
import UnicornIcon from "@/components/UnicornIcon";
import checkoutIconData from "@/components/checkout-bag.json";
import CartCrossSell from "@/components/CartCrossSell";
import { Tag, X, CheckCircle2, Sparkles, Gift } from "lucide-react";

export default function PanierClient() {
  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    cartTotal,
    shippingMethod,
    setShippingMethod,
    selectedRelay,
    setSelectedRelay,
    shippingCost,
    cartTotalWithShipping,
    appliedPromo,
    discountAmount,
    applyPromoCode,
    removePromoCode,
    appliedGiftCard,
    giftCardDiscount,
    giftCardError,
    applyGiftCardCode,
    removeGiftCardCode,
    shippingConfig,
  } = useCart();

  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckoutHovered, setIsCheckoutHovered] = useState(false);
  const [pickupSlot, setPickupSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Promo code UI states
  const [promoInput, setPromoInput] = useState<string>("");
  const [promoLoading, setPromoLoading] = useState<boolean>(false);
  const [promoMessage, setPromoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const eligibleTotal = cartItems
    .filter((item) => item.productId > 0 && !item.isLoyaltyReward)
    .reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
  const pointsEarned = Math.floor(eligibleTotal / 2);

  // Point Relais search UI states
  const [postalCode, setPostalCode] = useState<string>("");
  const [relays, setRelays] = useState<SelectedRelay[]>([]);
  const [loadingRelays, setLoadingRelays] = useState<boolean>(false);
  const [relayError, setRelayError] = useState<string | null>(null);
  const [showRelayFinder, setShowRelayFinder] = useState<boolean>(false);

  // Auto-detect promo code from lottery wheel or URL
  useEffect(() => {
    try {
      const activeCode = localStorage.getItem("spoolio_active_promo_code");
      if (activeCode && !appliedPromo) {
        setPromoInput(activeCode);
        applyPromoCode(activeCode).then((res) => {
          if (res.success) {
            setPromoMessage({ type: "success", text: res.message || "Code promo appliqué !" });
          }
        });
      }
    } catch (e) {}
  }, [appliedPromo, applyPromoCode]);

  const handleApplyPromo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoMessage(null);
    const res = await applyPromoCode(promoInput);
    setPromoLoading(false);
    if (res.success) {
      setPromoMessage({ type: "success", text: res.message || "Code promo appliqué !" });
      setPromoInput("");
    } else {
      setPromoMessage({ type: "error", text: res.error || "Code promo invalide." });
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setPromoMessage(null);
    setPromoInput("");
  };

  useEffect(() => {
    const savedSlot = localStorage.getItem("spoolio_pickup_slot");

    const fetchSlots = async () => {
      try {
        const res = await fetch("/api/pickup-slots");
        if (res.ok) {
          const data = await res.json();
          const activeSlots = data.slots || [];
          setAvailableSlots(activeSlots);
          
          // Validate that the saved slot is still active and valid
          if (savedSlot) {
            if (activeSlots.includes(savedSlot)) {
              setPickupSlot(savedSlot);
            } else {
              console.log("[Pickup Validation] Saved slot is obsolete or has been deleted. Clearing...");
              localStorage.removeItem("spoolio_pickup_slot");
              setPickupSlot("");
            }
          }
        }
      } catch (err) {
        console.error("Failed to load available pickup slots:", err);
      }
    };
    fetchSlots();
  }, []);

  useEffect(() => {
    if (relays.length === 0) return;

    let mapInstance: any = null;

    // Helper to load Leaflet stylesheet
    const loadStylesheet = () => {
      if (document.getElementById("leaflet-css")) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.onload = () => resolve();
        document.head.appendChild(link);
      });
    };

    // Helper to load Leaflet script
    const loadScript = () => {
      if ((window as any).L) return Promise.resolve((window as any).L);
      return new Promise<any>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve((window as any).L);
        document.head.appendChild(script);
      });
    };

    Promise.all([loadStylesheet(), loadScript()]).then(([_, L]) => {
      if (!L) return;
      const mapContainer = document.getElementById("panier-relay-map");
      if (!mapContainer) return;

      // Clean up previous map if it exists
      if ((window as any)._spoolioPanierMap) {
        try {
          (window as any)._spoolioPanierMap.remove();
        } catch (e) {
          console.warn("Error cleaning previous map:", e);
        }
      }

      // Initialize map centered on first relay coordinates (or default)
      const firstRelay = relays[0];
      const defaultLat = firstRelay?.latitude ? parseFloat(firstRelay.latitude) : 50.7667;
      const defaultLng = firstRelay?.longitude ? parseFloat(firstRelay.longitude) : 3.0075;

      const map = L.map("panier-relay-map", {
        center: [defaultLat, defaultLng],
        zoom: 13,
        zoomControl: true
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // Store map instance globally
      (window as any)._spoolioPanierMap = map;
      mapInstance = map;

      const customIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const group: any[] = [];

      relays.forEach((r) => {
        if (!r.latitude || !r.longitude) return;
        const lat = parseFloat(r.latitude);
        const lng = parseFloat(r.longitude);
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        
        group.push([lat, lng]);

        const popupContent = document.createElement("div");
        popupContent.className = "text-black font-sans p-1";
        popupContent.style.color = "#111";
        popupContent.innerHTML = `
          <strong style="display: block; font-size: 13px; font-weight: 800; color: #111; margin-bottom: 2px;">${r.name}</strong>
          <span style="display: block; font-size: 11px; color: #555; margin-top: 2px;">${r.address}</span>
          <span style="display: block; font-size: 11px; color: #555;">${r.cp} ${r.ville}</span>
          <button id="panier-select-relay-${r.id}" style="margin-top: 8px; width: 100%; display: block; background-color: #ff4f00; color: white; font-weight: bold; border: none; padding: 6px 8px; border-radius: 6px; font-size: 10px; cursor: pointer; text-transform: uppercase; text-align: center;">
            Sélectionner ce relais
          </button>
        `;

        marker.bindPopup(popupContent);

        marker.on("popupopen", () => {
          const btn = document.getElementById(`panier-select-relay-${r.id}`);
          if (btn) {
            btn.onclick = () => {
              setSelectedRelay(r);
              setShowRelayFinder(false);
              setRelays([]);
              map.closePopup();
            };
          }
        });
      });

      if (group.length > 0) {
        map.fitBounds(group, { padding: [30, 30] });
      }
    });

    return () => {
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch (e) {
          console.warn("Error destroying Leaflet map instance:", e);
        }
        (window as any)._spoolioPanierMap = null;
      }
    };
  }, [relays]);

  const handleSearchRelays = async () => {
    if (!postalCode || postalCode.length < 3) {
      setRelayError("Veuillez saisir un code postal valide.");
      return;
    }
    setLoadingRelays(true);
    setRelayError(null);
    setRelays([]);
    try {
      const res = await fetch(`/api/shipping/relays?cp=${postalCode}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur de chargement des points relais.");
      }
      setRelays(data.relays || []);
      if (data.relays?.length === 0) {
        setRelayError("Aucun point relais trouvé pour ce code postal.");
      }
    } catch (e: any) {
      setRelayError(e.message || "Erreur réseau.");
    } finally {
      setLoadingRelays(false);
    }
  };

  const handleCheckout = async () => {
    if (shippingMethod === "relay" && !selectedRelay) {
      setError("Veuillez sélectionner un Point Relais de livraison pour votre colis.");
      return;
    }

    if (shippingMethod === "pickup" && !pickupSlot) {
      setError("Veuillez sélectionner une date et heure de retrait à l'Atelier.");
      return;
    }

    setCheckoutLoading(true);
    setError(null);
    try {
      localStorage.setItem("spoolio_shipping_method", shippingMethod);
      if (shippingMethod === "relay" && selectedRelay) {
        localStorage.setItem("spoolio_selected_relay", JSON.stringify(selectedRelay));
      } else {
        localStorage.removeItem("spoolio_selected_relay");
      }

      if (shippingMethod === "pickup" && pickupSlot) {
        localStorage.setItem("spoolio_pickup_slot", pickupSlot);
      } else {
        localStorage.removeItem("spoolio_pickup_slot");
      }

      router.push("/upsell");
    } catch (err: any) {
      setError("Une erreur est survenue lors de la redirection.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center select-none py-24 font-sans bg-spoolio-card border border-spoolio-border rounded-3xl p-8 max-w-xl mx-auto shadow-xl">
        <span className="text-5xl mb-6">🛍️</span>
        <h2 className="text-xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white">Votre panier est vide</h2>
        <p className="text-xs text-zinc-500 dark:text-gray-400 mt-2 max-w-sm leading-relaxed">
          Ajoutez des fidgets originaux et écoresponsables de notre collection pour continuer.
        </p>
        <Link
          href="/boutique"
          className="mt-6 px-6 py-3 text-xs font-black text-white bg-zinc-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-100 rounded-xl transition-all cursor-pointer uppercase tracking-wider shadow-md"
        >
          Retourner à la boutique
        </Link>
      </div>
    );
  }

  const normalTotal = cartItems
    .filter((item) => item.productId > 0)
    .reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);

  const expectedRoundUp = Math.ceil(normalTotal) - normalTotal === 0 ? 1.00 : Math.ceil(normalTotal) - normalTotal;
  const hasRoundUp = cartItems.some((item) => item.productId === -1);
  const hasCoffee = cartItems.some((item) => item.productId === -2);

  const handleToggleRoundUp = () => {
    if (hasRoundUp) {
      const item = cartItems.find((i) => i.productId === -1);
      if (item) removeFromCart(item.id);
    } else {
      addToCart({
        productId: -1,
        name: "Arrondi Solidaire 🌾",
        price: expectedRoundUp.toFixed(2),
        slug: "donation-roundup",
        selectedOptions: {},
        image: ""
      }, 1, false);
    }
  };

  const handleToggleCoffee = () => {
    if (hasCoffee) {
      const item = cartItems.find((i) => i.productId === -2);
      if (item) removeFromCart(item.id);
    } else {
      addToCart({
        productId: -2,
        name: "Un café pour l'atelier ☕",
        price: "2.00",
        slug: "donation-coffee",
        selectedOptions: {},
        image: ""
      }, 1, false);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 font-sans items-start">
      {/* Colonne Gauche : Produits + Dons */}
      <div className="flex-1 flex flex-col gap-6 w-full">
        <div className="bg-spoolio-card border border-spoolio-border rounded-3xl p-6 shadow-xl">
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider mb-6 pb-4 border-b border-zinc-200 dark:border-white/5 flex items-center gap-2">
            <span>📦</span> Vos Fidgets & Objets
          </h3>

          <div className="flex flex-col gap-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 cart-item"
              >
                {/* Image */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-black/20 flex items-center justify-center text-2xl">
                  {item.productId === -1 ? (
                    <span className="select-none">🌾</span>
                  ) : item.productId === -2 ? (
                    <span className="select-none">☕</span>
                  ) : (item.slug === "clicker-mecanique-sur-mesure" || !item.image) && (!item.image || item.image.includes("clicker-sur-mesure-thumb.jpg")) ? (
                    <span className="select-none">⌨️</span>
                  ) : item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover no-invert"
                    />
                  ) : (
                    <span className="select-none">⌨️</span>
                  )}
                </div>

                {/* Info & Options */}
                <div className="flex-1 flex flex-col min-w-0">
                  <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white truncate">
                    {item.slug === "clicker-mecanique-sur-mesure" ? (
                      <Link href={item.selectedOptions._configUrl || "/createur-cliqueur"} className="text-zinc-900 dark:text-white hover:text-[#ff4f00] transition-colors">
                        {item.name}
                      </Link>
                    ) : item.slug === "calendrier-avent" ? (
                      <Link href="/calendrier-avent" className="text-zinc-900 dark:text-white hover:text-[#ff4f00] transition-colors">
                        {item.name}
                      </Link>
                    ) : item.productId < 0 ? (
                      <span className="text-zinc-900 dark:text-white">{item.name}</span>
                    ) : (
                      <Link href={`/product/${item.slug}`} className="text-zinc-900 dark:text-white hover:text-[#ff4f00] transition-colors">
                        {item.name}
                      </Link>
                    )}
                  </h4>
                  
                  {Object.keys(item.selectedOptions).length > 0 && (
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                      {Object.entries(item.selectedOptions)
                        .filter(([key]) => !key.startsWith("_"))
                        .map(([key, val]) => (
                          <span key={key} className="text-[10px] font-bold text-zinc-500 font-sans uppercase">
                            {key}: <span className="text-zinc-700 dark:text-gray-300">{val}</span>
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Edit Custom Clicker Link */}
                  {item.slug === "clicker-mecanique-sur-mesure" && (
                    <Link
                      href={item.selectedOptions._configUrl || "/createur-cliqueur"}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff4f00] hover:underline mt-2 w-fit bg-[#ff4f00]/10 border border-[#ff4f00]/20 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <span>✏️ Modifier ma création 3D</span>
                    </Link>
                  )}

                  {/* Quantity controls */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-200 dark:border-white/5">
                    {item.productId < 0 ? (
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-200 dark:bg-white/5 px-2.5 py-1 rounded-md">
                        Soutien Libre
                      </span>
                    ) : (
                      <div className="flex items-center bg-zinc-100 dark:bg-[#111] border border-zinc-200 dark:border-[#222] rounded-xl h-8 px-2 qty-selector">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded active:scale-95 transition-all text-sm font-bold cursor-pointer qty-btn"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-xs text-zinc-900 dark:text-white qty-display">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded active:scale-95 transition-all text-sm font-bold cursor-pointer qty-btn"
                        >
                          +
                        </button>
                      </div>
                    )}

                    <span className="text-sm font-black text-zinc-900 dark:text-white item-price">
                      {(parseFloat(item.price) * item.quantity).toFixed(2)}€
                    </span>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-8 h-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl flex items-center justify-center transition-colors cursor-pointer text-base remove-item-btn"
                  title="Retirer l'article"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 1-Click Cross-Sell Section */}
        <div className="bg-spoolio-card border border-spoolio-border rounded-3xl p-6 shadow-xl">
          <CartCrossSell variant="page" />
        </div>

        {/* Section Soutien (Dons) */}
        <div className="bg-spoolio-card border border-spoolio-border rounded-3xl p-6 shadow-xl">
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>🧡</span> Soutenir l'Atelier Spoolio
          </h3>
          <p className="text-[11px] text-zinc-600 dark:text-gray-400 mb-6 leading-relaxed">
            Nous fabriquons localement chaque objet en France avec du plastique biodégradable d'origine végétale. Votre soutien finance le fonctionnement des imprimantes 3D et le développement de nouveaux fidgets !
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arrondi */}
            <button
              onClick={handleToggleRoundUp}
              type="button"
              className={`flex flex-col justify-between text-left p-4 rounded-2xl border transition-all cursor-pointer h-[120px] ${
                hasRoundUp 
                  ? "border-[#ff4f00] bg-[#ff4f00]/5 text-zinc-900 dark:text-white" 
                  : "border-zinc-200 dark:border-spoolio-border bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-gray-200"
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  hasRoundUp ? "border-[#ff4f00] bg-[#ff4f00]" : "border-zinc-300 dark:border-white/20"
                }`}>
                  {hasRoundUp && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span className={`font-black text-xs ${hasRoundUp ? "text-zinc-900 dark:text-white" : "text-zinc-700 dark:text-gray-300"}`}>+{expectedRoundUp.toFixed(2)}€</span>
              </div>
              <div>
                <span className={`font-extrabold block text-xs leading-snug ${hasRoundUp ? "text-zinc-900 dark:text-white" : "text-zinc-800 dark:text-gray-300"}`}>Arrondir à l'euro supérieur</span>
                <span className="text-[10px] text-zinc-500 dark:text-gray-500 block leading-tight mt-1">Soutient l'usage de plastique végétal 🌾</span>
              </div>
            </button>

            {/* Café */}
            <button
              onClick={handleToggleCoffee}
              type="button"
              className={`flex flex-col justify-between text-left p-4 rounded-2xl border transition-all cursor-pointer h-[120px] ${
                hasCoffee 
                  ? "border-[#ff4f00] bg-[#ff4f00]/5 text-zinc-900 dark:text-white" 
                  : "border-zinc-200 dark:border-spoolio-border bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-gray-200"
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  hasCoffee ? "border-[#ff4f00] bg-[#ff4f00]" : "border-zinc-300 dark:border-white/20"
                }`}>
                  {hasCoffee && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span className={`font-black text-xs ${hasCoffee ? "text-zinc-900 dark:text-white" : "text-zinc-700 dark:text-gray-300"}`}>+2.00€</span>
              </div>
              <div>
                <span className={`font-extrabold block text-xs leading-snug ${hasCoffee ? "text-zinc-900 dark:text-white" : "text-zinc-800 dark:text-gray-300"}`}>Offrir un café à l'atelier ☕</span>
                <span className="text-[10px] text-zinc-500 dark:text-gray-500 block leading-tight mt-1">Aide à entretenir nos imprimantes 3D</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Colonne Droite : Livraison + Récapitulatif financier */}
      <div className="w-full lg:w-[380px] flex flex-col gap-6 shrink-0">
        {/* Livraison */}
        <div className="bg-spoolio-card border border-spoolio-border rounded-3xl p-6 shadow-xl w-full">
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🚚</span> Livraison & Retrait
          </h3>

          <div className="flex flex-col gap-3">
            {[
              { id: "pickup", name: "Retrait gratuit à l'Atelier", desc: "Comines, Nord (59560)", cost: "Gratuit" },
              { id: "relay", name: "Point Relais (Mondial Relay)", desc: "Suivi Boxtal en point relais", cost: (cartTotal >= shippingConfig.freeShippingThreshold) ? "Gratuit" : `${shippingConfig.relayShippingCost.toFixed(2).replace(".", ",")} €` },
              { id: "home", name: "Colissimo Domicile", desc: "Suivi Boxtal à domicile", cost: (cartTotal >= shippingConfig.freeShippingThreshold) ? "Gratuit" : `${shippingConfig.homeShippingCost.toFixed(2).replace(".", ",")} €` },
            ].map((m) => {
              const active = shippingMethod === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setShippingMethod(m.id as any);
                    if (m.id !== "relay") {
                      setSelectedRelay(null);
                    }
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer shipping-card ${
                    active
                      ? "active border-[#ff4f00] bg-[#ff4f00]/5 ring-1 ring-[#ff4f00]"
                      : "border-zinc-200 dark:border-spoolio-border bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${active ? "border-[#ff4f00]" : "border-zinc-400 dark:border-gray-700"}`}>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-[#ff4f00]" />}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block leading-tight">
                        {m.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-gray-500 block mt-0.5 leading-tight font-sans">
                        {m.desc}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-zinc-900 dark:text-white shrink-0 ml-2">
                    {m.cost}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Pickup Slots */}
          {shippingMethod === "pickup" && (
            <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-2.5 mt-3 select-none">
              <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-wider block">
                Créneau de retrait à l'Atelier 📅
              </span>
              <p className="text-[9px] text-zinc-500 leading-normal">
                Notre atelier de Comines vous accueille du lundi au samedi de 10h à 18h.
              </p>
              <select
                value={pickupSlot}
                onChange={(e) => setPickupSlot(e.target.value)}
                className="w-full h-9 bg-white dark:bg-spoolio-bg border border-zinc-200 dark:border-spoolio-border rounded-lg px-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4f00] font-sans cursor-pointer"
                required
              >
                <option value="" disabled className="text-zinc-400">-- Choisir un créneau disponible --</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot} className="bg-white dark:bg-spoolio-card text-zinc-900 dark:text-white">
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mondial Relay */}
          {shippingMethod === "relay" && (
            <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3 mt-3 relay-widget">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-wider font-sans">
                  Sélection du relais
                </span>
                {selectedRelay && (
                  <button
                    onClick={() => {
                      setSelectedRelay(null);
                      setShowRelayFinder(true);
                    }}
                    className="text-[9px] text-[#ff4f00] font-bold hover:underline cursor-pointer"
                  >
                    Changer
                  </button>
                )}
              </div>

              {!selectedRelay || showRelayFinder ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={5}
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Code postal (ex: 59560)"
                      className="flex-1 h-9 bg-white dark:bg-spoolio-bg border border-zinc-200 dark:border-spoolio-border rounded-lg px-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#ff4f00] font-sans relay-input"
                    />
                    <button
                      onClick={handleSearchRelays}
                      disabled={loadingRelays}
                      className="h-9 px-4 bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-300 dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:bg-white/40 text-xs font-bold rounded-lg transition-colors cursor-pointer relay-btn"
                    >
                      {loadingRelays ? "..." : "Trouver"}
                    </button>
                  </div>

                  {relayError && (
                    <span className="text-[9px] text-red-500 font-bold">
                      {relayError}
                    </span>
                  )}

                  {relays.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-zinc-200 dark:border-white/5 pt-3">
                      {/* Leaflet Map */}
                      <div 
                        id="panier-relay-map" 
                        className="w-full h-[180px] rounded-xl border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-black/10 overflow-hidden relative z-10 no-invert" 
                      />
                      
                      {/* Relays List */}
                      <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
                        {relays.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => {
                              setSelectedRelay(r);
                              setShowRelayFinder(false);
                              setRelays([]);
                            }}
                            className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-spoolio-border bg-white dark:bg-transparent hover:border-[#ff4f00]/50 hover:bg-[#ff4f00]/5 text-left text-xs transition-all cursor-pointer flex flex-col gap-0.5 relay-result-btn"
                          >
                            <span className="font-extrabold text-zinc-900 dark:text-white truncate block">{r.name}</span>
                            <span className="text-[9px] text-zinc-500 dark:text-gray-400 truncate block">{r.address}, {r.cp} {r.ville}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-xl text-xs flex flex-col gap-1 selected-relay-box font-sans">
                  <div className="flex items-center gap-1.5 font-sans">
                    <span className="text-xs shrink-0">🏪</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 truncate block">{selectedRelay.name}</span>
                  </div>
                  <span className="text-[10px] text-zinc-600 dark:text-gray-400 ml-5 block leading-normal">
                    {selectedRelay.address}, {selectedRelay.cp} {selectedRelay.ville}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section Code Promo & Carte Cadeau */}
        <div className="bg-spoolio-card border border-spoolio-border rounded-3xl p-6 shadow-xl w-full space-y-6">
          {/* 1. Code Promo */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#ff4f00]" />
                <span>Code Promo</span>
              </h3>
              {appliedPromo && (
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Actif
                </span>
              )}
            </div>

            {appliedPromo ? (
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-zinc-900 dark:text-white text-xs tracking-wider">
                        {appliedPromo.code}
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-400/20 px-1.5 py-0.5 rounded">
                        {appliedPromo.discountType === "percentage"
                          ? `-${appliedPromo.discountValue}%`
                          : appliedPromo.discountType === "fixed"
                          ? `-${appliedPromo.discountValue.toFixed(2)}€`
                          : "Livraison Offerte"}
                      </span>
                    </div>
                    {appliedPromo.description && (
                      <span className="text-[10px] text-zinc-500 dark:text-gray-400 block truncate mt-0.5">
                        {appliedPromo.description}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleRemovePromo}
                  className="w-7 h-7 rounded-lg bg-zinc-200/50 dark:bg-white/5 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Retirer le code"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Ex: SPOOLIO10"
                      className="w-full h-10 bg-white dark:bg-spoolio-bg border border-zinc-200 dark:border-spoolio-border focus:border-[#ff4f00] rounded-xl px-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono uppercase tracking-wider focus:outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={promoLoading || !promoInput.trim()}
                    className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white/10 dark:hover:bg-white dark:text-white dark:hover:text-black disabled:bg-zinc-200 disabled:text-zinc-400 font-extrabold text-xs rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
                  >
                    {promoLoading ? "..." : "Appliquer"}
                  </button>
                </div>

                {promoMessage && (
                  <div
                    className={`text-[11px] font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 ${
                      promoMessage.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/10 border border-red-500/20 text-red-500"
                    }`}
                  >
                    {promoMessage.type === "success" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{promoMessage.text}</span>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* 2. Carte Cadeau */}
          <div className="pt-4 border-t border-zinc-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Gift className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Carte Cadeau</span>
              </h3>
              {appliedGiftCard && (
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Appliquée
                </span>
              )}
            </div>

            {appliedGiftCard ? (
              <div className="bg-indigo-500/10 border border-indigo-500/25 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-zinc-900 dark:text-white text-xs tracking-wider">
                        {appliedGiftCard.code}
                      </span>
                      <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-400/20 px-1.5 py-0.5 rounded">
                        Solde: {appliedGiftCard.remainingAmount.toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={removeGiftCardCode}
                  className="w-7 h-7 rounded-lg bg-zinc-200/50 dark:bg-white/5 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Retirer la carte cadeau"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="gift-card-input-panier"
                    placeholder="Ex: SPOOLIO-A8K2-9M4P"
                    className="flex-1 h-10 bg-white dark:bg-spoolio-bg border border-zinc-200 dark:border-spoolio-border focus:border-indigo-500 rounded-xl px-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono uppercase tracking-wider focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const input = document.getElementById("gift-card-input-panier") as HTMLInputElement;
                      if (input && input.value) {
                        await applyGiftCardCode(input.value);
                      }
                    }}
                    className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500/20 dark:hover:bg-indigo-500 dark:text-indigo-300 dark:hover:text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer border border-indigo-600 dark:border-indigo-500/30 shrink-0 shadow-sm"
                  >
                    Activer
                  </button>
                </div>
                {giftCardError && (
                  <span className="text-[10px] text-red-500 font-bold px-1">
                    ⚠️ {giftCardError}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Facturation & validation */}
        <div className="bg-spoolio-card border border-spoolio-border rounded-3xl p-6 shadow-xl w-full">
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🧾</span> Récapitulatif
          </h3>

          <div className="flex flex-col gap-2 font-sans border-b border-zinc-200 dark:border-white/5 pb-4 mb-4 text-xs text-zinc-600 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span>Sous-total</span>
              <span className="text-zinc-900 dark:text-white font-extrabold">{cartTotal.toFixed(2)}€</span>
            </div>

            {appliedPromo && discountAmount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>Remise ({appliedPromo.code})</span>
                </span>
                <span className="font-extrabold font-mono">-{discountAmount.toFixed(2)}€</span>
              </div>
            )}

            {appliedGiftCard && giftCardDiscount > 0 && (
              <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
                <span className="flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  <span>Carte Cadeau ({appliedGiftCard.code})</span>
                </span>
                <span className="font-extrabold font-mono">-{giftCardDiscount.toFixed(2)}€</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span>Frais d'envoi</span>
              <span className="text-zinc-900 dark:text-white font-extrabold">
                {shippingCost === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Offert</span>
                ) : (
                  `${shippingCost.toFixed(2)}€`
                )}
              </span>
            </div>

            {/* Loyalty Points Banner */}
            {pointsEarned > 0 && (
              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-blue-500/10 dark:from-[#ff4f00]/20 dark:via-amber-500/15 dark:to-[#005cff]/20 border border-orange-500/20 dark:border-[#ff4f00]/40 my-3 shadow-sm font-sans">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/images/spoolio-mascot.png"
                    alt="Mascotte Spoolio"
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0 filter drop-shadow-[0_6px_15px_rgba(255,79,0,0.3)] hover:scale-105 transition-transform"
                  />
                  <div className="text-left space-y-0.5">
                    <div className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white leading-tight">
                      👑 +{pointsEarned} point{pointsEarned > 1 ? "s" : ""} fidélité gagné{pointsEarned > 1 ? "s" : ""}
                    </div>
                    <span className="text-[10px] sm:text-xs text-zinc-600 dark:text-gray-300 font-semibold block leading-tight">Crédités automatiquement à la validation</span>
                  </div>
                </div>
                <span className="text-xs font-black text-[#ff4f00] font-mono bg-white dark:bg-[#ff4f00]/25 border border-[#ff4f00]/30 dark:border-[#ff4f00]/50 px-3 py-1 rounded-full shrink-0 shadow-sm">
                  +{pointsEarned} PTS
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-6 font-sans">
            <span className="text-xs font-bold text-zinc-600 dark:text-gray-300 uppercase tracking-wider">Total final</span>
            <span className="text-xl font-black text-zinc-900 dark:text-white">{cartTotalWithShipping.toFixed(2)}€</span>
          </div>

          {error && (
            <div className="text-[10px] text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg font-sans mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            onMouseEnter={() => setIsCheckoutHovered(true)}
            onMouseLeave={() => setIsCheckoutHovered(false)}
            className="w-full h-13 flex items-center justify-center gap-2 text-xs font-black text-white bg-[#ff4f00] hover:bg-[#e04500] disabled:bg-[#ff4f00]/50 rounded-xl transition-all shadow-xl shadow-[#ff4f00]/25 hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 cursor-pointer disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {checkoutLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <span>Valider la commande</span>
                <UnicornIcon animationData={checkoutIconData} className="w-8 h-4 scale-[1.3]" isHovered={isCheckoutHovered} loop={true} />
              </>
            )}
          </button>
          
          <span className="text-[9px] text-zinc-500 text-center leading-normal font-sans block mt-4">
            Paiement sécurisé par Stripe. Livraison à domicile ou en point relais.
          </span>
        </div>
      </div>
    </div>
  );
}
