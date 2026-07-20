"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, SelectedRelay } from "@/context/CartContext";

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    shippingMethod,
    setShippingMethod,
    selectedRelay,
    setSelectedRelay,
    shippingCost,
    cartTotalWithShipping,
  } = useCart();

  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Point Relais search UI states
  const [postalCode, setPostalCode] = useState<string>("");
  const [relays, setRelays] = useState<SelectedRelay[]>([]);
  const [loadingRelays, setLoadingRelays] = useState<boolean>(false);
  const [relayError, setRelayError] = useState<string | null>(null);
  const [showRelayFinder, setShowRelayFinder] = useState<boolean>(false);

  useEffect(() => {
    if (relays.length === 0 || !isCartOpen) return;

    let mapInstance: any = null;

    // Helper to load stylesheet
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
      const mapContainer = document.getElementById("relay-map");
      if (!mapContainer) return;

      // Clean up previous map if it exists
      if ((window as any)._spoolioMap) {
        try {
          (window as any)._spoolioMap.remove();
        } catch (e) {
          console.warn("Error cleaning previous map:", e);
        }
      }

      // Initialize map centered on first relay coordinates (or default)
      const firstRelay = relays[0];
      const defaultLat = firstRelay?.latitude ? parseFloat(firstRelay.latitude) : 50.7667;
      const defaultLng = firstRelay?.longitude ? parseFloat(firstRelay.longitude) : 3.0075;

      const map = L.map("relay-map", {
        center: [defaultLat, defaultLng],
        zoom: 12,
        zoomControl: false // Hide controls for compact size
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // Store map instance globally to remove it on hot-reload or unmount
      (window as any)._spoolioMap = map;
      mapInstance = map;

      // Custom icon using standard Leaflet styling
      const customIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Fit bounds to show all markers
      const group: any[] = [];

      relays.forEach((r) => {
        if (!r.latitude || !r.longitude) return;
        const lat = parseFloat(r.latitude);
        const lng = parseFloat(r.longitude);
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        
        group.push([lat, lng]);

        // Construct HTML details for popup click
        const popupContent = document.createElement("div");
        popupContent.className = "text-black font-sans p-1";
        popupContent.style.color = "#111";
        popupContent.innerHTML = `
          <strong style="display: block; font-size: 13px; font-weight: 800; color: #111; margin-bottom: 2px;">${r.name}</strong>
          <span style="display: block; font-size: 11px; color: #555; margin-top: 2px;">${r.address}</span>
          <span style="display: block; font-size: 11px; color: #555;">${r.cp} ${r.ville}</span>
          <button id="select-relay-${r.id}" style="margin-top: 8px; width: 100%; display: block; background-color: #ff4f00; color: white; font-weight: bold; border: none; padding: 6px 8px; border-radius: 6px; font-size: 10px; cursor: pointer; text-transform: uppercase; text-align: center;">
            Sélectionner
          </button>
        `;

        marker.bindPopup(popupContent);

        // Bind event on popup open to wire button click
        marker.on("popupopen", () => {
          const btn = document.getElementById(`select-relay-${r.id}`);
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
        map.fitBounds(group, { padding: [20, 20] });
      }
    });

    return () => {
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch (e) {
          console.warn("Error destroying Leaflet map instance:", e);
        }
        (window as any)._spoolioMap = null;
      }
    };
  }, [relays, isCartOpen]);

  if (!isCartOpen) return null;

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
    // If Point Relais is chosen, enforce selecting a specific relay before checking out
    if (shippingMethod === "relay" && !selectedRelay) {
      setError("Veuillez sélectionner un Point Relais de livraison pour votre colis.");
      return;
    }

    setCheckoutLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          shippingMethod,
          selectedRelay: shippingMethod === "relay" ? selectedRelay : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'initialisation de la commande.");
      }

      // Redirect user to secure Stripe Checkout page
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("L'URL de paiement est introuvable.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion avec la passerelle de paiement.");
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex justify-end font-sans select-none">
      {/* Background Overlay Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
      />

      {/* Cart Panel Slide-over */}
      <div className="relative w-full max-w-md h-full bg-[#111113] border-l border-[#222225] shadow-2xl flex flex-col justify-between z-10 transition-transform duration-300 animate-slide-in cart-panel">
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

        {/* Content Section (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 cart-content">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center my-12">
              <span className="text-4xl">🌀</span>
              <h3 className="text-sm font-extrabold text-white">Votre panier est vide</h3>
              <p className="text-xs text-gray-400 max-w-[240px] leading-relaxed">
                Remplissez-le avec nos fidgets satisfaisants et créations 3D originales !
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 px-5 py-2.5 text-xs font-bold text-black bg-white hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Continuer mes achats
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items list */}
              <div className="flex flex-col gap-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-[#18181b]/50 border border-[#222225] rounded-2xl p-3 cart-item"
                  >
                    {/* Product Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/5 bg-black/20">
                      {item.image ? (
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
                      <h4 className="text-xs font-bold text-white truncate hover:text-[#ff4f00] transition-colors">
                        <Link href={`/product/${item.slug}`} onClick={() => setIsCartOpen(false)}>
                          {item.name}
                        </Link>
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

              {/* Shipping Method Selector inside content */}
              <div className="mt-6 border-t border-white/5 pt-6 flex flex-col gap-3 font-sans shipping-section">
                <h4 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                  Mode de livraison
                </h4>

                <div className="flex flex-col gap-2">
                  {[
                    { id: "pickup", name: "Retrait gratuit à l'Atelier", desc: "Comines, Nord (59560)", cost: "Gratuit" },
                    { id: "relay", name: "Point Relais (Mondial Relay)", desc: "Suivi Boxtal en point relais", cost: cartTotal >= 40 ? "Gratuit" : "3,90 €" },
                    { id: "home", name: "Colissimo Domicile", desc: "Suivi Boxtal à domicile", cost: cartTotal >= 40 ? "Gratuit" : "4,90 €" },
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
                        className={`w-full p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer shipping-card ${
                          active
                            ? "active border-[#ff4f00] bg-[#ff4f00]/5"
                            : "border-[#222225] bg-black/20 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${active ? "border-[#ff4f00]" : "border-gray-700"}`}>
                            {active && <div className="w-1.5 h-1.5 rounded-full bg-[#ff4f00]" />}
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold text-white block leading-tight">
                              {m.name}
                            </span>
                            <span className="text-[10px] text-gray-500 font-sans block mt-0.5">
                              {m.desc}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-white shrink-0 ml-2">
                          {m.cost}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Point Relais Selector Widget block */}
                {shippingMethod === "relay" && (
                  <div className="bg-[#18181b] border border-[#222225] rounded-2xl p-4 flex flex-col gap-3 mt-2 relay-widget">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">
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
                            className="flex-1 h-9 bg-black border border-[#222225] rounded-lg px-3 text-xs text-white focus:outline-none focus:border-[#ff4f00] font-sans relay-input"
                          />
                          <button
                            onClick={handleSearchRelays}
                            disabled={loadingRelays}
                            className="h-9 px-4 bg-white text-black hover:bg-gray-200 disabled:bg-white/40 text-xs font-bold rounded-lg transition-colors cursor-pointer relay-btn"
                          >
                            {loadingRelays ? "..." : "Trouver"}
                          </button>
                        </div>

                        {relayError && (
                          <span className="text-[9px] text-red-400 font-bold">
                            {relayError}
                          </span>
                        )}

                        {relays.length > 0 && (
                          <div className="flex flex-col gap-3 border-t border-white/5 pt-3">
                            {/* Interactive Leaflet Map Container */}
                            <div 
                              id="relay-map" 
                              className="w-full h-[180px] rounded-xl border border-white/5 bg-black/10 overflow-hidden relative z-10 no-invert" 
                            />
                            
                            {/* Text List Fallback */}
                            <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
                              {relays.map((r) => (
                                <button
                                  key={r.id}
                                  onClick={() => {
                                    setSelectedRelay(r);
                                    setShowRelayFinder(false);
                                    setRelays([]);
                                  }}
                                  className="w-full p-2.5 rounded-lg border border-[#222225] hover:border-[#ff4f00]/50 hover:bg-[#ff4f00]/5 text-left text-xs transition-all cursor-pointer flex flex-col gap-0.5 relay-result-btn"
                                >
                                  <span className="font-extrabold text-white truncate block">{r.name}</span>
                                  <span className="text-[9px] text-gray-400 truncate block">{r.address}, {r.cp} {r.ville}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-xs flex flex-col gap-1 selected-relay-box">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs shrink-0">🏪</span>
                          <span className="font-extrabold text-emerald-400 truncate block">{selectedRelay.name}</span>
                        </div>
                        <span className="text-[9px] text-gray-400 ml-5">
                          {selectedRelay.address}, {selectedRelay.cp} {selectedRelay.ville}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer & Checkout Section */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-[#222225] bg-[#131316]/50 flex flex-col gap-4 cart-footer">
            {/* Price detail lists */}
            <div className="flex flex-col gap-1.5 text-xs font-sans">
              <div className="flex items-center justify-between text-gray-500 cart-row">
                <span>Sous-total</span>
                <span>{cartTotal.toFixed(2)}€</span>
              </div>
              <div className="flex items-center justify-between text-gray-500 cart-row">
                <span>Frais d'envoi</span>
                <span>{shippingCost === 0 ? "Offert" : `${shippingCost.toFixed(2)}€`}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider total-title">Total</span>
                <span className="text-xl font-black text-white total-value">{cartTotalWithShipping.toFixed(2)}€</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg font-sans">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full h-12 flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#ff4f00] hover:bg-[#e04500] disabled:bg-[#ff4f00]/50 rounded-xl transition-all shadow-xl shadow-[#ff4f00]/25 hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 cursor-pointer disabled:cursor-not-allowed no-invert"
            >
              {checkoutLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <span>Valider la commande</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>
            <span className="text-[9px] text-gray-500 text-center leading-normal font-sans cart-secure-text">
              Paiement entièrement sécurisé par Stripe. Livraison soignée.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
