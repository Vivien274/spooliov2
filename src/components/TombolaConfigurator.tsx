"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export interface TombolaConfig {
  id: string;
  title: string;
  description: string;
  image: string;
  estimatedValue: number;
  endDate: string;
  totalCases: number;
  ticketPrice: number;
  status: "active" | "ended" | "drawn";
  winnerTicket?: number | null;
  winnerDrawnAt?: string | null;
}

const DEFAULT_CONFIG: TombolaConfig = {
  id: "tombola-1",
  title: "Mega Pack Fidget & Impression 3D Spoolio",
  description:
    "Tente ta chance de remporter un lot exclusif composé d'objets fidgets sensoriels TDAH, de figurines 3D et d'un porte-clés NFC Spoolio !",
  image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
  estimatedValue: 85.00,
  endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  totalCases: 40,
  ticketPrice: 2.00,
  status: "active",
  winnerTicket: null,
  winnerDrawnAt: null,
};

const INITIAL_RESERVED: number[] = []; // Default clean empty grid

function calculateTimeLeft(endDateStr?: string) {
  if (!endDateStr) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const targetTime = new Date(endDateStr).getTime();
  if (isNaN(targetTime)) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const diff = targetTime - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

export default function TombolaConfigurator() {
  const { addToCart, setIsCartOpen, cartItems } = useCart();

  // State management
  const [config, setConfig] = useState<TombolaConfig>(DEFAULT_CONFIG);
  const [ticketPrice, setTicketPrice] = useState<number>(2.00); // 1€ or 2€
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [reservedTickets, setReservedTickets] = useState<number[]>([]);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  // Hydrate config & reserved tickets from DB / localStorage
  useEffect(() => {
    setIsClient(true);

    try {
      const savedConfig = localStorage.getItem("spoolio_tombola_config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed && parsed.title) {
          setConfig((prev) => ({ ...prev, ...parsed }));
          if (parsed.ticketPrice) setTicketPrice(parsed.ticketPrice);
        }
      }
    } catch (e) {}

    const fetchTombolaData = async () => {
      try {
        const res = await fetch("/api/tombola");
        const data = await res.json();
        if (data.success && data.tombola) {
          setConfig(data.tombola);
          if (data.tombola.ticketPrice) setTicketPrice(data.tombola.ticketPrice);
          if (Array.isArray(data.reservedTickets)) {
            setReservedTickets(data.reservedTickets);
          }
        }
      } catch (err) {
        console.warn("API Tombola indisponible");
      }
    };

    fetchTombolaData();
  }, []);

  // Countdown timer calculation based on real config.endDate
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(config.endDate));

  useEffect(() => {
    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft(config.endDate));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [config.endDate]);

  // Compute ticket numbers currently in user's active cart
  const cartTicketNumbers = useMemo(() => {
    if (!cartItems || !Array.isArray(cartItems)) return [];
    return cartItems
      .filter((item: any) => item.slug === "tombola" && item.selectedOptions && item.selectedOptions["Case"])
      .map((item: any) => parseInt(item.selectedOptions["Case"].replace("#", ""), 10))
      .filter((n: number) => !isNaN(n));
  }, [cartItems]);

  // Toggle ticket selection
  const handleTicketClick = (num: number) => {
    if (reservedTickets.includes(num)) return;
    if (selectedTickets.includes(num)) {
      setSelectedTickets(selectedTickets.filter((n) => n !== num));
    } else {
      setSelectedTickets([...selectedTickets, num].sort((a, b) => a - b));
    }
  };

  // Quick random pick
  const handleRandomPick = () => {
    const available = Array.from({ length: config.totalCases }, (_, i) => i + 1).filter(
      (n) => !reservedTickets.includes(n) && !selectedTickets.includes(n) && !cartTicketNumbers.includes(n)
    );
    if (available.length === 0) return;
    const randomIndex = Math.floor(Math.random() * available.length);
    const picked = available[randomIndex];
    setSelectedTickets([...selectedTickets, picked].sort((a, b) => a - b));
  };

  // Clear current selection
  const handleClearSelection = () => {
    setSelectedTickets([]);
  };

  const currentTicketPrice = config.ticketPrice || 2.00;

  // Add selected tickets to cart
  const handleAddToCart = () => {
    if (selectedTickets.length === 0) return;

    selectedTickets.forEach((num) => {
      addToCart(
        {
          productId: -400 - num, // Unique ID per ticket number
          name: `Ticket Tombola Spoolio - Case #${num}`,
          slug: "tombola",
          price: currentTicketPrice.toFixed(2),
          selectedOptions: {
            "Case": `#${num}`,
            "Prix ticket": `${currentTicketPrice.toFixed(2)}€`,
            "Lot": config.title,
          },
          image: config.image || "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
        },
        1,
        false
      );
    });

    // Show confirmation feedback
    setSelectedTickets([]);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);

    // Open Cart Drawer
    setIsCartOpen(true);
  };

  // Reset local dev state
  const handleResetStorage = () => {
    setReservedTickets(INITIAL_RESERVED);
    setSelectedTickets([]);
    localStorage.removeItem("spoolio_tombola_reserved");
  };

  // Calculated totals
  const totalAmount = (selectedTickets.length * currentTicketPrice).toFixed(2);
  const totalReservedCount = reservedTickets.length;
  const progressPercent = Math.round((totalReservedCount / config.totalCases) * 100);

  return (
    <div className="w-full flex flex-col gap-10">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-black font-extrabold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="text-xl">🎟️</span>
          <span>Tickets ajoutés au panier avec succès !</span>
        </div>
      )}

      {/* Winner Banner if Drawn */}
      {config.status === "drawn" && config.winnerTicket && (
        <div className="w-full p-6 sm:p-8 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/50 rounded-3xl flex items-center justify-between flex-wrap gap-4 shadow-2xl backdrop-blur-xl animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-black font-black text-3xl flex items-center justify-center shadow-xl animate-bounce">
              #{config.winnerTicket}
            </div>
            <div>
              <span className="inline-block px-3 py-1 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider rounded-full mb-1">
                🎉 Tirage effectué !
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                La case gagnante est la n° {config.winnerTicket} !
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header & Prize Card Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Lot à Gagner Card (Encart) */}
        <div className="lg:col-span-7 tombola-card bg-[#131316]/90 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl shadow-2xl group">
          {/* Neon Background Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4f00]/15 rounded-full filter blur-3xl pointer-events-none group-hover:bg-[#ff4f00]/25 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00F0FF]/15 rounded-full filter blur-3xl pointer-events-none" />

          {/* Top Badge & Title */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff4f00]/20 border border-[#ff4f00]/40 text-[#ff4f00] text-xs font-black uppercase tracking-wider">
                <span>🎁</span> Lot à gagner
              </span>
              <div className="flex items-center gap-2 tombola-inner-box bg-white/5 px-3 py-1 rounded-full border border-white/10 text-xs text-gray-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{config.status === "drawn" ? "Tirage terminé" : "Tirage en cours"}</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              {config.title}
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed font-medium mb-6">
              {config.description}
            </p>
          </div>

          {/* Product Image & Value Badge */}
          <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-white/10 my-2 shadow-inner group/img">
            <Image
              src={config.image || "/images/imported/Spoolio_Kit-Festival-16-scaled.webp"}
              alt={config.title}
              fill
              priority
              className="object-cover group-hover/img:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Value Tag Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 no-invert">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Valeur du lot</span>
              <span className="text-xl font-black text-white">{config.estimatedValue.toFixed(2)} €</span>
            </div>

            <div className="absolute bottom-4 right-4 bg-[#ff4f00] text-white px-3 py-1.5 rounded-lg text-xs font-extrabold shadow-lg no-invert">
              {config.totalCases} cases seulement !
            </div>
          </div>

          {/* Progress & Countdown Section */}
          <div className="mt-6 flex flex-col gap-4">
            {/* Live Progress Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-300">Progression des réservations</span>
                <span className="text-[#ff4f00] font-mono font-black">{totalReservedCount} / {config.totalCases} cases ({progressPercent}%)</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5 tombola-inner-box">
                <div
                  className="h-full bg-gradient-to-r from-[#ff4f00] to-[#00F0FF] rounded-full transition-all duration-500 shadow-[0_0_12px_#ff4f00]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Countdown Box */}
            <div className="tombola-inner-box bg-black/40 border border-white/10 rounded-xl p-3 sm:p-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                <span className="text-lg">⏳</span>
                <span>Fin du tirage dans :</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono font-bold text-white text-sm">
                <div className="tombola-badge-pill bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                  <span>{String(timeLeft.days).padStart(2, "0")}</span>
                  <span className="text-[9px] text-gray-400 ml-1">j</span>
                </div>
                <span>:</span>
                <div className="tombola-badge-pill bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                  <span>{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span className="text-[9px] text-gray-400 ml-1">h</span>
                </div>
                <span>:</span>
                <div className="tombola-badge-pill bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                  <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <span className="text-[9px] text-gray-400 ml-1">m</span>
                </div>
                <span>:</span>
                <div className="tombola-badge-pill bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-[#ff4f00]">
                  <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
                  <span className="text-[9px] text-gray-400 ml-1">s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Price Configurator & Selection Panel */}
        <div className="lg:col-span-5 tombola-card bg-[#131316]/90 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between backdrop-blur-xl shadow-2xl">
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight mb-4 flex items-center gap-2">
              <span>🎟️</span> Choisir mes tickets
            </h3>

            {/* Single Fixed Price per Ticket */}
            <div className="mb-6 tombola-inner-box bg-black/40 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Tarif unique de la case
                </span>
                <span className="text-2xl font-black text-[#ff4f00] font-mono mt-0.5 block">
                  {config.ticketPrice.toFixed(2)} €
                </span>
              </div>
              <span className="bg-[#ff4f00]/20 border border-[#ff4f00]/40 text-[#ff4f00] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Prix unitaire ⭐
              </span>
            </div>

            {/* Quick Actions Buttons */}
            <div className="flex items-center gap-2 mb-6">
              <button
                type="button"
                onClick={handleRandomPick}
                className="flex-1 py-2 px-3 tombola-inner-box bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🎲</span> Case au hasard
              </button>
              {selectedTickets.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold border border-red-500/20 transition-colors cursor-pointer"
                >
                  Effacer ({selectedTickets.length})
                </button>
              )}
            </div>

            {/* Summary Box */}
            <div className="tombola-inner-box bg-black/50 rounded-2xl p-4 border border-white/10 mb-6 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-400">Cases sélectionnées :</span>
                <span className="text-white font-mono">{selectedTickets.length} ticket(s)</span>
              </div>

              {selectedTickets.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {selectedTickets.map((num) => (
                    <span
                      key={num}
                      className="bg-[#ff4f00]/20 border border-[#ff4f00]/40 text-[#ff4f00] text-xs font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"
                    >
                      #{num}
                      <button
                        type="button"
                        onClick={() => handleTicketClick(num)}
                        className="hover:text-white transition-colors cursor-pointer"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Cliquez sur les numéros dans la grille ci-dessous pour choisir vos tickets.
                </p>
              )}

              <div className="h-[1px] bg-white/10 my-1" />

              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-gray-300 uppercase">Sous-total tombola</span>
                <span className="text-2xl font-black text-white font-mono">{totalAmount} €</span>
              </div>
            </div>
          </div>

          {/* Add to Cart CTA Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={selectedTickets.length === 0}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xl no-invert ${
              selectedTickets.length > 0
                ? "tombola-btn-active bg-[#ff4f00] hover:bg-[#e04500] text-white shadow-[#ff4f00]/25 hover:scale-[1.02] active:scale-[0.98]"
                : "tombola-btn-disabled bg-white/10 text-gray-500 cursor-not-allowed border border-white/5"
            }`}
          >
            <span>Ajouter au panier</span>
            <span className="text-lg">🛒</span>
          </button>
        </div>
      </div>

      {/* SVG Noise Filter Definition for Authentic Hand-Drawn Pencil Roughness */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id="pencil-rough" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Grid 1 to N Interactive Section */}
      <div className="tombola-card bg-[#131316]/90 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>🎯</span> Grille des {config.totalCases} numéros
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Choisis tes numéros fétiches avant qu&apos;ils ne soient réservés !
            </p>
          </div>

          {/* Grid Legend */}
          <div className="flex items-center gap-4 text-xs font-bold flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md tombola-inner-box bg-white/10 border border-white/20" />
              <span className="text-gray-300">Disponible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-[#ff4f00] border border-[#ff4f00]" />
              <span className="text-white">Sélectionné</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative w-3.5 h-3.5 rounded-md tombola-grid-btn-reserved bg-red-950/80 border border-red-800/80 flex items-center justify-center">
                <svg className="w-full h-full text-red-500" viewBox="0 0 20 20" fill="none" style={{ filter: "url(#pencil-rough)" }}>
                  <path d="M 2,18 L 18,2 M 3,15 L 17,4 M 2,2 L 18,18 M 4,3 L 16,17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </span>
              <span className="text-gray-400">Pris / Raturé</span>
            </div>
          </div>
        </div>

        {/* 1..totalCases Grid Items */}
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5 sm:gap-3.5">
          {Array.from({ length: config.totalCases }, (_, i) => i + 1).map((num) => {
            const isReserved = reservedTickets.includes(num);
            const isSelected = selectedTickets.includes(num);
            const isInCart = cartTicketNumbers.includes(num);

            return (
              <button
                key={num}
                type="button"
                disabled={isReserved}
                onClick={() => handleTicketClick(num)}
                className={`relative aspect-square rounded-2xl font-mono font-black text-base sm:text-lg flex flex-col items-center justify-center transition-all duration-200 select-none border overflow-hidden ${
                  isReserved
                    ? "tombola-grid-btn-reserved bg-red-950/20 text-gray-500 border-red-900/30 cursor-not-allowed opacity-80"
                    : isSelected
                    ? "no-invert bg-[#ff4f00] text-white border-[#ff4f00] shadow-[0_0_18px_rgba(255,79,0,0.6)] scale-105 z-10 cursor-pointer"
                    : isInCart
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md cursor-pointer"
                    : "tombola-grid-btn bg-white/5 text-white border-white/10 hover:bg-white/15 hover:border-white/30 hover:scale-105 cursor-pointer"
                }`}
              >
                {/* Simple & Small Hand-Drawn Pen Cross Overlay */}
                {isReserved && (
                  <div
                    className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
                    style={{ transform: `rotate(${(num * 7) % 10 - 5}deg)` }}
                  >
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-red-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ filter: "url(#pencil-rough)" }}
                    >
                      <path
                        d={
                          num % 2 === 0
                            ? "M 5,19 Q 12,12 19,5 M 5,5 Q 12,12 19,19"
                            : "M 4,20 Q 12,11 20,4 M 4,4 Q 12,13 20,20"
                        }
                        stroke="#ef4444"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}

                <span className={`relative z-10 ${isReserved ? "line-through text-gray-500/80 font-bold decoration-red-500/70" : ""}`}>
                  {num}
                </span>

                {isReserved ? (
                  <span className="text-[8px] font-sans text-red-400/80 font-bold tracking-tighter uppercase leading-none mt-0.5 relative z-10">
                    Vendu
                  </span>
                ) : isInCart ? (
                  <span className="text-[7px] font-sans text-amber-400 font-bold tracking-tighter uppercase leading-none mt-0.5 relative z-10">
                    Panier
                  </span>
                ) : isSelected ? (
                  <span className="text-[8px] font-sans text-white font-black tracking-tighter uppercase leading-none mt-0.5 relative z-10">
                    Choisi
                  </span>
                ) : (
                  <span className="text-[8px] font-sans text-gray-500 group-hover:text-gray-300 leading-none mt-0.5 relative z-10">
                    {currentTicketPrice.toFixed(2)}€
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
