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
    <div className="min-h-screen bg-spoolio-bg text-white font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-black">
      {/* Header */}
      <div className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-md border-b border-[#1f1f23]">
        <Header className="h-24 flex items-center justify-between px-6 max-w-[1200px] mx-auto w-full" />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 py-16 flex flex-col items-center">
        {/* Glow Effects in Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(255,79,0,0.05)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(47,60,217,0.04)_0%,transparent_65%)] pointer-events-none" />

        {/* Title area */}
        <div className="text-center max-w-[600px] mb-12 relative">
          <span className="text-[10px] font-black tracking-[0.25em] uppercase text-[#ff4f00] bg-[#ff4f00]/10 px-3.5 py-1.5 rounded-full border border-[#ff4f00]/25 mb-4 inline-block">
            Soutenir Spoolio 🧡
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4 uppercase font-antonio">
            Soutenir l'Atelier
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed font-sans">
            Spoolio est une marque artisanale et éco-responsable. Votre don soutient directement nos investissements matériels, notre transition vers le PLA 100% recyclé et la maintenance de nos imprimantes 3D.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="w-full max-w-[500px] bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl mb-8 flex items-center gap-2 animate-pulse font-sans">
            <span className="text-sm shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-500 text-xs italic animate-pulse">
            <svg className="animate-spin h-8 w-8 text-[#ff4f00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Chargement des paliers de soutien...</span>
          </div>
        ) : (
          /* Tiers Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12 animate-fade-in">
            {donationTiers.map((tier) => {
              const isSelected = selectedTier === tier.id;
              const isOrange = tier.color === "orange";
              
              return (
                <div
                  key={tier.id}
                  onClick={() => {
                    setSelectedTier(tier.id);
                    setCustomAmount("");
                  }}
                  className={`relative rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group select-none ${
                    isSelected
                      ? isOrange
                        ? "bg-[#ff4f00]/5 border-[#ff4f00] shadow-[0_0_20px_rgba(255,79,0,0.1)] scale-[1.01]"
                        : "bg-[#2F3CD9]/5 border-[#2F3CD9] shadow-[0_0_20px_rgba(47,60,217,0.1)] scale-[1.01]"
                      : "bg-spoolio-card border-spoolio-border hover:border-white/20 hover:bg-spoolio-card/80 hover:scale-[1.005]"
                  }`}
                >
                  {/* Visual Glow Indicator */}
                  {isSelected && (
                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none -mr-8 -mt-8 ${
                      isOrange ? "bg-[#ff4f00]" : "bg-[#2F3CD9]"
                    }`} />
                  )}

                  <div>
                    {/* Emoji & Subtitle */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-3xl filter drop-shadow-md select-none">{tier.emoji}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        isOrange ? "text-[#ff4f00]" : "text-[#2f3cd9]"
                      }`}>
                        {tier.subtitle}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                      {tier.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed font-sans mb-6">
                      {tier.description}
                    </p>
                  </div>

                  {/* Price Display */}
                  <div className="flex items-baseline gap-1 mt-auto">
                    <span className="text-2xl font-black text-white">{tier.amount}</span>
                    <span className="text-sm font-extrabold text-gray-500">€</span>
                  </div>
                </div>
              );
            })}

            {/* Custom Donation Card */}
            <div
              onClick={() => setSelectedTier("custom")}
              className={`relative rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden select-none ${
                selectedTier === "custom"
                  ? "bg-[#ff4f00]/5 border-[#ff4f00] shadow-[0_0_20px_rgba(255,79,0,0.1)] scale-[1.01]"
                  : "bg-spoolio-card border-spoolio-border hover:border-white/20 hover:bg-spoolio-card/80 hover:scale-[1.005]"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl filter drop-shadow-md select-none">🎁</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                    Don Libre
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                  Montant Libre
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed font-sans mb-4">
                  Saisissez le montant de votre choix pour nous soutenir à hauteur de vos moyens.
                </p>
              </div>

              {/* Custom Input */}
              <div className="mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
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
                    className="w-full h-11 pl-4 pr-10 text-sm font-semibold bg-[#1a1a1f] border border-[#2d2d34] rounded-xl text-white placeholder-gray-600 outline-none focus:border-[#ff4f00]/50 transition-all font-sans donation-input"
                  />
                  <span className="absolute right-4 text-sm font-bold text-gray-500">€</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Add to Cart Button */}
        <div className="w-full max-w-[400px] flex flex-col items-center gap-4 mt-4">
          <button
            onClick={handleDonationSubmit}
            disabled={currentAmount <= 0}
            className="w-full h-14 flex items-center justify-center gap-2 text-xs font-black text-white bg-[#ff4f00] hover:bg-[#e04500] disabled:bg-white/5 disabled:text-gray-600 disabled:border-transparent rounded-xl transition-all shadow-xl shadow-[#ff4f00]/15 cursor-pointer uppercase tracking-wider font-sans select-none no-invert"
          >
            <span>Ajouter au panier ({currentAmount.toFixed(0)}€) 🧡</span>
          </button>
          <span className="text-[10px] text-gray-500 font-medium font-sans text-center">
            Le don sera ajouté à votre panier. Vous pourrez continuer vos achats ou procéder au paiement.
          </span>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
