"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, SelectedRelay } from "@/context/CartContext";
import UnicornIcon from "@/components/UnicornIcon";
import checkoutIconData from "@/components/checkout-bag.json";

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
  } = useCart();

  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckoutHovered, setIsCheckoutHovered] = useState(false);
  const [pickupSlot, setPickupSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Point Relais search UI states
  const [postalCode, setPostalCode] = useState<string>("");
  const [relays, setRelays] = useState<SelectedRelay[]>([]);
  const [loadingRelays, setLoadingRelays] = useState<boolean>(false);
  const [relayError, setRelayError] = useState<string | null>(null);
  const [showRelayFinder, setShowRelayFinder] = useState<boolean>(false);

  useEffect(() => {
    const savedSlot = localStorage.getItem("spoolio_pickup_slot");
    if (savedSlot) setPickupSlot(savedSlot);

    const fetchSlots = async () => {
      try {
        const res = await fetch("/api/pickup-slots");
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.slots || []);
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
      <div className="flex flex-col items-center justify-center text-center select-none py-24 font-sans bg-spoolio-card border border-spoolio-border rounded-3xl p-8 max-w-xl mx-auto">
        <span className="text-5xl mb-6">🛍️</span>
        <h2 className="text-xl font-extrabold uppercase tracking-tight text-white">Votre panier est vide</h2>
        <p className="text-xs text-gray-400 mt-2 max-w-sm leading-relaxed">
          Ajoutez des fidgets originaux et écoresponsables de notre collection pour continuer.
        </p>
        <Link
          href="/boutique"
          className="mt-6 px-6 py-3 text-xs font-black text-black bg-white hover:bg-gray-100 rounded-xl transition-all cursor-pointer uppercase tracking-wider animate-pulse hover:animate-none"
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
          <h3 className="text-base font-extrabold text-white uppercase tracking-wider mb-6 pb-4 border-b border-white/5 flex items-center gap-2">
            <span>📦</span> Vos Fidgets & Objets
          </h3>

          <div className="flex flex-col gap-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 cart-item"
              >
                {/* Image */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/5 bg-black/20 flex items-center justify-center text-2xl">
                  {item.productId === -1 ? (
                    <span className="select-none">🌾</span>
                  ) : item.productId === -2 ? (
                    <span className="select-none">☕</span>
                  ) : item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover no-invert"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white/5" />
                  )}
                </div>

                {/* Info & Options */}
                <div className="flex-1 flex flex-col min-w-0">
                  <h4 className="text-sm font-extrabold text-white truncate">
                    {item.productId < 0 ? (
                      <span>{item.name}</span>
                    ) : (
                      <Link href={`/product/${item.slug}`} className="hover:text-[#ff4f00] transition-colors">
                        {item.name}
                      </Link>
                    )}
                  </h4>
                  
                  {Object.keys(item.selectedOptions).length > 0 && (
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                      {Object.entries(item.selectedOptions).map(([key, val]) => (
                        <span key={key} className="text-[10px] font-bold text-gray-500 font-sans uppercase">
                          {key}: <span className="text-gray-300">{val}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quantity controls */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    {item.productId < 0 ? (
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md">
                        Soutien Libre
                      </span>
                    ) : (
                      <div className="flex items-center bg-[#111] border border-[#222] rounded-xl h-8 px-2 qty-selector">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white rounded active:scale-95 transition-all text-sm font-bold cursor-pointer qty-btn"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-xs text-white qty-display">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white rounded active:scale-95 transition-all text-sm font-bold cursor-pointer qty-btn"
                        >
                          +
                        </button>
                      </div>
                    )}

                    <span className="text-sm font-black text-white item-price">
                      {(parseFloat(item.price) * item.quantity).toFixed(2)}€
                    </span>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-8 h-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl flex items-center justify-center transition-colors cursor-pointer text-base remove-item-btn"
                  title="Retirer l'article"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section Soutien (Dons) */}
        <div className="bg-spoolio-card border border-spoolio-border rounded-3xl p-6 shadow-xl">
          <h3 className="text-base font-extrabold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>🧡</span> Soutenir l'Atelier Spoolio
          </h3>
          <p className="text-[11px] text-gray-400 mb-6 leading-relaxed">
            Nous fabriquons localement chaque objet en France avec du plastique biodégradable d'origine végétale. Votre soutien finance le fonctionnement des imprimantes 3D et le développement de nouveaux fidgets !
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arrondi */}
            <button
              onClick={handleToggleRoundUp}
              type="button"
              className={`flex flex-col justify-between text-left p-4 rounded-2xl border transition-all cursor-pointer h-[120px] ${
                hasRoundUp 
                  ? "border-[#ff4f00] bg-[#ff4f00]/5 text-white no-invert" 
                  : "border-spoolio-border bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200"
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  hasRoundUp ? "border-[#ff4f00] bg-[#ff4f00]" : "border-white/20"
                }`}>
                  {hasRoundUp && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span className={`font-black text-xs ${hasRoundUp ? "text-white" : "text-gray-300"}`}>+{expectedRoundUp.toFixed(2)}€</span>
              </div>
              <div>
                <span className={`font-extrabold block text-xs leading-snug ${hasRoundUp ? "text-white" : "text-gray-300"}`}>Arrondir à l'euro supérieur</span>
                <span className="text-[10px] text-gray-500 block leading-tight mt-1">Soutient l'usage de plastique végétal 🌾</span>
              </div>
            </button>

            {/* Café */}
            <button
              onClick={handleToggleCoffee}
              type="button"
              className={`flex flex-col justify-between text-left p-4 rounded-2xl border transition-all cursor-pointer h-[120px] ${
                hasCoffee 
                  ? "border-[#ff4f00] bg-[#ff4f00]/5 text-white no-invert" 
                  : "border-spoolio-border bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200"
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  hasCoffee ? "border-[#ff4f00] bg-[#ff4f00]" : "border-white/20"
                }`}>
                  {hasCoffee && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span className={`font-black text-xs ${hasCoffee ? "text-white" : "text-gray-300"}`}>+2.00€</span>
              </div>
              <div>
                <span className={`font-extrabold block text-xs leading-snug ${hasCoffee ? "text-white" : "text-gray-300"}`}>Offrir un café à l'atelier ☕</span>
                <span className="text-[10px] text-gray-500 block leading-tight mt-1">Aide à entretenir nos imprimantes 3D</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Colonne Droite : Livraison + Récapitulatif financier */}
      <div className="w-full lg:w-[380px] flex flex-col gap-6 shrink-0">
        {/* Livraison */}
        <div className="bg-spoolio-card border border-spoolio-border rounded-3xl p-6 shadow-xl w-full">
          <h3 className="text-base font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🚚</span> Livraison & Retrait
          </h3>

          <div className="flex flex-col gap-3">
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
                  className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer shipping-card ${
                    active
                      ? "active border-[#005cff] bg-[#005cff]/5"
                      : "border-spoolio-border bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${active ? "border-[#005cff]" : "border-gray-700"}`}>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-[#005cff]" />}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-white block leading-tight">
                        {m.name}
                      </span>
                      <span className="text-[10px] text-gray-500 block mt-0.5 leading-tight font-sans">
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

          {/* Pickup Slots */}
          {shippingMethod === "pickup" && (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-2.5 mt-3 select-none no-invert">
              <span className="text-[10px] font-black text-white uppercase tracking-wider block">
                Créneau de retrait à l'Atelier 📅
              </span>
              <p className="text-[9px] text-gray-500 leading-normal">
                Notre atelier de Comines vous accueille du lundi au samedi de 10h à 18h.
              </p>
              <select
                value={pickupSlot}
                onChange={(e) => setPickupSlot(e.target.value)}
                className="w-full h-9 bg-spoolio-bg border border-spoolio-border rounded-lg px-3 text-xs text-white focus:outline-none focus:border-[#005cff] font-sans cursor-pointer text-gray-800 dark:text-white"
                required
              >
                <option value="" disabled>-- Choisir un créneau disponible --</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot} className="bg-spoolio-card text-gray-800 dark:text-white">
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mondial Relay */}
          {shippingMethod === "relay" && (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 mt-3 relay-widget">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white uppercase tracking-wider font-sans">
                  Sélection du relais
                </span>
                {selectedRelay && (
                  <button
                    onClick={() => {
                      setSelectedRelay(null);
                      setShowRelayFinder(true);
                    }}
                    className="text-[9px] text-[#005cff] font-bold hover:underline cursor-pointer"
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
                      className="flex-1 h-9 bg-spoolio-bg border border-spoolio-border rounded-lg px-3 text-xs text-white focus:outline-none focus:border-[#005cff] font-sans relay-input text-gray-800 dark:text-white"
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
                      {/* Leaflet Map */}
                      <div 
                        id="panier-relay-map" 
                        className="w-full h-[180px] rounded-xl border border-white/5 bg-black/10 overflow-hidden relative z-10 no-invert" 
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
                            className="w-full p-2.5 rounded-lg border border-spoolio-border hover:border-[#005cff]/50 hover:bg-[#005cff]/5 text-left text-xs transition-all cursor-pointer flex flex-col gap-0.5 relay-result-btn"
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
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-xs flex flex-col gap-1 selected-relay-box font-sans">
                  <div className="flex items-center gap-1.5 font-sans">
                    <span className="text-xs shrink-0">🏪</span>
                    <span className="font-extrabold text-emerald-400 truncate block">{selectedRelay.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 ml-5 block leading-normal">
                    {selectedRelay.address}, {selectedRelay.cp} {selectedRelay.ville}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Facturation & validation */}
        <div className="bg-spoolio-card border border-spoolio-border rounded-3xl p-6 shadow-xl w-full">
          <h3 className="text-base font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🧾</span> Récapitulatif
          </h3>

          <div className="flex flex-col gap-2 font-sans border-b border-white/5 pb-4 mb-4 text-xs text-gray-400">
            <div className="flex items-center justify-between">
              <span>Sous-total</span>
              <span className="text-white font-extrabold">{cartTotal.toFixed(2)}€</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Frais d'envoi</span>
              <span className="text-white font-extrabold">{shippingCost === 0 ? "Offert" : `${shippingCost.toFixed(2)}€`}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 font-sans">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Total final</span>
            <span className="text-xl font-black text-white">{cartTotalWithShipping.toFixed(2)}€</span>
          </div>

          {error && (
            <div className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg font-sans mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            onMouseEnter={() => setIsCheckoutHovered(true)}
            onMouseLeave={() => setIsCheckoutHovered(false)}
            className="w-full h-13 flex items-center justify-center gap-2 text-xs font-black text-white bg-[#ff4f00] hover:bg-[#e04500] disabled:bg-[#ff4f00]/50 rounded-xl transition-all shadow-xl shadow-[#ff4f00]/25 hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 cursor-pointer disabled:cursor-not-allowed no-invert uppercase tracking-wider"
          >
            {checkoutLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <span>Étape suivante : Ventes Privées</span>
                <UnicornIcon animationData={checkoutIconData} className="w-8 h-4 scale-[1.3]" isHovered={isCheckoutHovered} loop={true} />
              </>
            )}
          </button>
          
          <span className="text-[9px] text-gray-500 text-center leading-normal font-sans block mt-4">
            Paiement sécurisé par Stripe. Livraison à domicile ou en point relais.
          </span>
        </div>
      </div>
    </div>
  );
}
