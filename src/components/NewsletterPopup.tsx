"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handleDismiss = useCallback(() => {
    // Dismiss popup for 7 days (or standard dismiss setting)
    localStorage.getItem("spoolio_newsletter_popup_dismissed");
    localStorage.setItem("spoolio_newsletter_popup_dismissed", "true");
    setIsVisible(false);
  }, []);

  useEffect(() => {
    // Check if dismissed or accepted before showing
    const dismissed = localStorage.getItem("spoolio_newsletter_popup_dismissed");
    if (!dismissed) {
      // Show popup after 8 seconds
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

  // Prevent scrolling when modal is open & add Escape key listener
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleDismiss();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isVisible, handleDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[99998] flex items-center justify-center p-4 sm:p-6 font-sans select-none">
      {/* Backdrop blur overlay */}
      <div
        onClick={handleDismiss}
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-fade-in cursor-pointer"
        aria-hidden="true"
      />

      {/* Centered Modal Card */}
      <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] z-10 transition-all duration-300 animate-scale-up text-zinc-900 overflow-hidden flex flex-col gap-5">
        
        {/* Background glowing accents */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#ff4f00]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer z-20"
          title="Fermer"
          aria-label="Fermer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Icon + Title */}
        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shadow-md text-3xl animate-bounce">
            🎁
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-950 uppercase tracking-wider font-sans leading-tight">
              Club Spoolio
            </h3>
            <span className="text-[10px] sm:text-xs font-black text-[#ff4f00] uppercase tracking-widest block mt-1">
              Newsletter &amp; Bons Plans Exclusifs
            </span>
          </div>
        </div>

        {/* Description Text */}
        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed text-center font-medium px-2">
          Rejoins l'atelier ! Découvre nos nouvelles créations 3D en avant-première, reçois des réductions réservées aux membres et participe à nos futurs concours.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 mt-2">
          <Link
            href="/inscription-newsletter-spoolio"
            onClick={handleDismiss}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#ff4f00] hover:bg-[#e04500] text-white transition-all font-black uppercase tracking-wider text-center text-xs sm:text-sm block cursor-pointer shadow-lg shadow-[#ff4f00]/20 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Rejoindre le club ✉️
          </Link>
          <button
            onClick={handleDismiss}
            className="w-full py-2 text-xs text-zinc-400 hover:text-zinc-700 font-bold transition-colors cursor-pointer text-center"
          >
            Non merci, une autre fois
          </button>
        </div>
      </div>
    </div>
  );
}

