"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("spoolio_cookies_consent");
    if (!consent) {
      // Show banner after a short delay for smooth entrance animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("spoolio_cookies_consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("spoolio_cookies_consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-[9999] animate-reveal select-none no-invert">
      <div className="bg-[#131316]/95 backdrop-blur-xl border border-white/10 rounded-[24px] p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4">
        {/* Header Icon + Title */}
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-bounce">🍪</span>
          <h4 className="text-sm font-black text-white uppercase tracking-wider font-sans">
            Respect de la vie privée
          </h4>
        </div>

        {/* Text description */}
        <p className="text-xs text-gray-400 leading-relaxed font-sans font-medium">
          Chez Spoolio, on utilise des cookies pour améliorer ton expérience de navigation, analyser le trafic de l'atelier et sécuriser tes paiements. Rien de louche, promis ! Tu peux en savoir plus sur notre{" "}
          <Link href="/cookies" className="text-[#ff4f00] hover:underline font-bold">
            politique de cookies
          </Link>
          .
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-1 font-sans text-xs">
          <button
            onClick={handleDecline}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-all font-bold cursor-pointer"
          >
            Refuser
          </button>
          
          <button
            onClick={handleAccept}
            className="px-5 py-2.5 rounded-xl bg-[#ff4f00] hover:bg-[#e04500] text-white transition-all font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-[#ff4f00]/15"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
