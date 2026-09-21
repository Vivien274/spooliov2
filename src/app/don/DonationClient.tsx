"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Tier {
  id: string;
  amount: number;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  color: string;
}

export default function DonationClient() {
  const { addToCart } = useCart();
  const [donationTiers, setDonationTiers] = useState<Tier[]>([]);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch donation tiers from API database
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const res = await fetch("/api/don/tiers");
        if (res.ok) {
          const data = await res.json();
          setDonationTiers(data || []);
          // Set default selected tier to the one near 10€ if available, otherwise first tier
          if (data && data.length > 0) {
            const defaultTier = data.find((t: any) => t.amount === 10) || data[0];
            setSelectedTier(defaultTier.id);
          }
        } else {
          throw new Error("Impossible de charger les paliers de dons.");
        }
      } catch (err: any) {
        setError(err.message || "Erreur de connexion.");
      } finally {
        setLoading(false);
      }
    };
    fetchTiers();
  }, []);

  // Compute final donation amount
  const getDonationAmount = (): number => {
    if (selectedTier === "custom") {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
    }
    const tier = donationTiers.find((t) => t.id === selectedTier);
    return tier ? tier.amount : 0;
  };

  const currentAmount = getDonationAmount();

  const handleDonationSubmit = () => {
    if (currentAmount <= 0) {
      setError("Veuillez choisir ou saisir un montant de don valide.");
      return;
    }

    setError(null);

    // Create a virtual cart item representing this donation
    const donationItem = {
      productId: -3, // Virtual product ID for donations
      name: selectedTier === "custom" 
        ? `Don de soutien libre` 
        : `Don de soutien - ${donationTiers.find(t => t.id === selectedTier)?.title}`,
      price: currentAmount.toString(),
      image: "/images/logo.png",
      slug: "don-soutien",
      selectedOptions: {}
    };

    // Add to cart Context. This will automatically open the CartDrawer (premium UX)
    addToCart(donationItem, 1, true);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-900 font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-white">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 pt-28 lg:pt-32 pb-16 flex flex-col items-center relative">
        {/* Glow Effects in Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(255,79,0,0.06)_0%,transparent_65%)] pointer-events-none" />

        {/* Title area */}
        <div className="text-center max-w-[640px] mb-12 relative">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#ff4f00] bg-[#ff4f00]/10 px-4 py-1.5 rounded-full border border-[#ff4f00]/20 mb-3.5 inline-block font-mono">
            Soutenir Spoolio 🧡
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 mb-3 uppercase font-righteous">
            Soutenir l&apos;Atelier
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed font-sans">
            Spoolio est un atelier artisanal et éco-responsable. Votre don soutient directement nos investissements matériels, notre transition vers le PLA biosourcé et la maintenance de nos machines 3D.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="w-full max-w-[500px] bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-2xl mb-8 flex items-center gap-2 font-sans shadow-xs">
            <span className="text-sm shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16 text-zinc-400 text-xs italic animate-pulse">
            <svg className="animate-spin h-8 w-8 text-[#ff4f00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Chargement des paliers de soutien...</span>
          </div>
        ) : (
          /* Tiers Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full mb-12 animate-fade-in">
            {donationTiers.map((tier) => {
              const isSelected = selectedTier === tier.id;
              
              return (
                <div
                  key={tier.id}
                  onClick={() => {
                    setSelectedTier(tier.id);
                    setCustomAmount("");
                  }}
                  className={`relative rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group select-none ${
                    isSelected
                      ? "bg-white border-2 border-[#ff4f00] shadow-lg shadow-[#ff4f00]/15 -translate-y-1 ring-2 ring-[#ff4f00]/10"
                      : "bg-white border-zinc-200/90 hover:border-zinc-300 hover:shadow-md hover:-translate-y-0.5 shadow-xs"
                  }`}
                >
                  <div>
                    {/* Emoji & Subtitle */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-3xl select-none">{tier.emoji}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors ${
                        isSelected
                          ? "bg-[#ff4f00] text-white"
                          : "bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200/80"
                      }`}>
                        {tier.subtitle}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base sm:text-lg font-bold text-zinc-950 mb-1.5 font-outfit leading-snug">
                      {tier.title}
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed font-sans mb-6">
                      {tier.description}
                    </p>
                  </div>

                  {/* Price Display */}
                  <div className="flex items-baseline gap-1 mt-auto pt-3 border-t border-zinc-100">
                    <span className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-outfit">{tier.amount}</span>
                    <span className="text-sm font-semibold text-zinc-400">€</span>
                  </div>
                </div>
              );
            })}

            {/* Custom Donation Card */}
            <div
              onClick={() => setSelectedTier("custom")}
              className={`relative rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden select-none ${
                selectedTier === "custom"
                  ? "bg-white border-2 border-[#ff4f00] shadow-lg shadow-[#ff4f00]/15 -translate-y-1 ring-2 ring-[#ff4f00]/10"
                  : "bg-white border-zinc-200/90 hover:border-zinc-300 hover:shadow-md hover:-translate-y-0.5 shadow-xs"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl select-none">🎁</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors ${
                    selectedTier === "custom"
                      ? "bg-[#ff4f00] text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}>
                    Don Libre
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-950 mb-1.5 font-outfit leading-snug">
                  Montant Libre
                </h3>
                <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed font-sans mb-4">
                  Saisissez le montant de votre choix pour nous soutenir à hauteur de vos moyens.
                </p>
              </div>

              {/* Custom Input */}
              <div className="mt-auto pt-3 border-t border-zinc-100" onClick={(e) => e.stopPropagation()}>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={customAmount}
                    onClick={() => setSelectedTier("custom")}
                    onChange={(e) => {
                      setSelectedTier("custom");
                      setCustomAmount(e.target.value);
                    }}
                    placeholder="Saisir un montant"
                    className="w-full h-11 pl-4 pr-10 text-sm font-bold bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-[#ff4f00] focus:ring-2 focus:ring-[#ff4f00]/15 transition-all font-outfit"
                  />
                  <span className="absolute right-4 text-sm font-bold text-zinc-400">€</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Add to Cart Button */}
        <div className="w-full max-w-[420px] flex flex-col items-center gap-3 mt-2">
          <button
            onClick={handleDonationSubmit}
            disabled={currentAmount <= 0}
            className="w-full py-4 px-6 flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#ff4f00] hover:bg-[#e04500] disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed rounded-full transition-all shadow-md shadow-[#ff4f00]/25 hover:shadow-lg active:scale-[0.99] cursor-pointer tracking-wide font-sans select-none no-invert"
          >
            <span>Ajouter au panier ({currentAmount.toFixed(0)}€) 🧡</span>
          </button>
          <span className="text-xs text-zinc-400 font-medium font-sans text-center">
            Le don sera ajouté à votre panier. Vous pourrez continuer vos achats ou procéder au paiement.
          </span>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
