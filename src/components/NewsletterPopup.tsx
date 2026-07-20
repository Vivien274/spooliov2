"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Check if dismissed or accepted before showing
    const dismissed = localStorage.getItem("spoolio_newsletter_popup_dismissed");
    if (!dismissed) {
      // Show slide-in after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 8000);

      // Or show on scroll past 35% of the page
      const handleScroll = () => {
        const scrolled = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll > 0 && scrolled / maxScroll > 0.35) {
          setIsVisible(true);
          window.removeEventListener("scroll", handleScroll);
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const handleDismiss = () => {
    // Dismiss popup for 7 days
    localStorage.setItem("spoolio_newsletter_popup_dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:right-auto md:left-6 md:max-w-sm z-[9998] animate-reveal select-none no-invert">
      <div className="bg-[#131316]/95 backdrop-blur-xl border border-white/10 rounded-[24px] p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-3.5 relative">
        
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="Fermer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content Badge + Title */}
        <div className="flex items-center gap-2.5">
          <span className="text-2xl animate-pulse">🎁</span>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider font-sans leading-none">
              Club Spoolio
            </h4>
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mt-1 block">
              Newsletter & Bons Plans
            </span>
          </div>
        </div>

        {/* Text */}
        <p className="text-xs text-gray-400 leading-relaxed font-sans font-medium pr-6">
          Rejoins l'atelier ! Découvre nos créations 3D en avant-première et reçois des codes promos exclusifs directement dans ta boîte.
        </p>

        {/* Action Button */}
        <Link
          href="/inscription-newsletter-spoolio"
          onClick={() => {
            // Dismiss popup when user clicks to subscribe
            localStorage.setItem("spoolio_newsletter_popup_dismissed", "true");
            setIsVisible(false);
          }}
          className="w-full py-3 rounded-xl bg-[#ff4f00] hover:bg-[#e04500] text-white transition-all font-black uppercase tracking-wider text-center text-xs block cursor-pointer shadow-lg shadow-[#ff4f00]/15"
        >
          S'inscrire à la newsletter ✉️
        </Link>
      </div>
    </div>
  );
}
