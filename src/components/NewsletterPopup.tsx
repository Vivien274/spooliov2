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
    <div className="fixed inset-0 z-[99998] flex items-center justify-center p-4 sm:p-6 font-sans select-none no-invert">
      {/* Backdrop blur overlay */}
      <div
        onClick={handleDismiss}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-fade-in cursor-pointer"
        aria-hidden="true"
      />

      {/* Centered Modal Card */}
      <div className="relative w-full max-w-md bg-[#131316]/95 backdrop-blur-2xl border border-white/15 rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] z-10 transition-all duration-300 animate-scale-up text-white overflow-hidden flex flex-col gap-5">
        
        {/* Background glowing accents */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#2F3CD9]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-[#3b49f5]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-20"
          title="Fermer"
          aria-label="Fermer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Icon + Title */}
        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2F3CD9] to-[#1e27a1] flex items-center justify-center shadow-lg shadow-[#2F3CD9]/30 text-3xl animate-bounce">
            🎁
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-sans leading-tight">
              Club Spoolio
            </h3>
            <span className="text-[10px] sm:text-xs font-black text-blue-400 uppercase tracking-widest block mt-1">
              Newsletter & Bons Plans Exclusifs
            </span>
          </div>
        </div>

        {/* Description Text */}
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed text-center font-medium px-2">
          Rejoins l'atelier ! Découvre nos nouvelles créations 3D en avant-première, reçois des réductions réservées aux membres et participe à nos futurs concours.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 mt-2">
          <Link
            href="/inscription-newsletter-spoolio"
            onClick={handleDismiss}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#2F3CD9] to-[#4d59ff] hover:from-[#2532b8] hover:to-[#2F3CD9] text-white transition-all font-black uppercase tracking-wider text-center text-xs sm:text-sm block cursor-pointer shadow-xl shadow-[#2F3CD9]/30 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Rejoindre le club ✉️
          </Link>
          <button
            onClick={handleDismiss}
            className="w-full py-2 text-xs text-gray-400 hover:text-gray-200 font-bold transition-colors cursor-pointer text-center"
          >
            Non merci, une autre fois
          </button>
        </div>
      </div>
    </div>
  );
}

