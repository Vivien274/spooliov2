"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  const { t } = useTranslation();
  const [isLegalOpen, setIsLegalOpen] = useState<boolean>(false);
  const legalRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (legalRef.current && !legalRef.current.contains(event.target as Node)) {
        setIsLegalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <footer className={`w-full border-t border-white/10 bg-[#0a0a0c] py-12 text-xs text-gray-500 relative z-10 ${className} no-invert`}>
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col gap-8">
        
        {/* Upper Section: Brand Description & Social Networks */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-8 border-b border-white/10">
          
          {/* Brand & Description with Vivien Avatar */}
          <div className="flex items-start gap-4 max-w-md">
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-white shrink-0 shadow-2xl overflow-hidden group hover:scale-105 transition-transform">
              <Image
                src="/images/vivien-avatar.png"
                alt="Vivien - Fondateur Spoolio"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-wider uppercase font-antonio">Spoolio</span>
                <span className="text-[10px] text-[#ff4f00] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#ff4f00]/10 border border-[#ff4f00]/30">{t("footer.brand_by")}</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans font-medium">
                {t("footer.description")}
              </p>
              <div className="text-[10px] text-gray-500 font-medium">
                &copy; {new Date().getFullYear()} Spoolio. {t("footer.rights")}
              </div>
            </div>
          </div>

          {/* Social Networks & Club Spoolio Block */}
          <div className="flex flex-col md:items-end gap-3 font-sans">
            <div className="flex items-center gap-3">
              <div className="text-xs font-black text-gray-300 uppercase tracking-widest">
                {t("footer.join_adventure")}
              </div>
              {/* <LanguageSwitcher variant="footer" /> */}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/spoolio.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:border-transparent transition-all duration-300 hover:scale-110 cursor-pointer"
                title="Instagram"
                aria-label="Rejoignez-nous sur Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@spoolio.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black hover:border-[#25F4EE] hover:shadow-[0_0_10px_rgba(37,244,238,0.4)] transition-all duration-300 hover:scale-110 cursor-pointer"
                title="TikTok"
                aria-label="Rejoignez-nous sur TikTok"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.21-.42-.45-.6-.7-.03 3.68-.01 7.35-.02 11.03-.09 1.58-.69 3.19-1.87 4.26-1.52 1.41-3.79 2.05-5.83 1.65-2.61-.43-4.83-2.58-5.23-5.22-.59-3.23 1.43-6.52 4.62-7.05.69-.13 1.4-.15 2.1-.06v4.08c-.76-.17-1.57-.04-2.22.38-.85.5-1.34 1.51-1.22 2.49.12 1.34 1.28 2.44 2.63 2.44 1.31.06 2.53-.94 2.65-2.24.03-3.41.01-6.83.02-10.24-.02-4.22-.01-8.43-.02-12.65z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/spoolio.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1877F2] hover:border-transparent transition-all duration-300 hover:scale-110 cursor-pointer"
                title="Facebook"
                aria-label="Rejoignez-nous sur Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Lower Section: Legal & Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center text-gray-400 font-sans font-semibold">
          
          {/* Newsletter Club Spoolio Link */}
          <Link
            href="/inscription-newsletter-spoolio"
            className="text-blue-400 hover:text-blue-300 font-extrabold transition-all flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2F3CD9]/15 border border-[#2F3CD9]/30 hover:border-[#2F3CD9]/60 hover:bg-[#2F3CD9]/25 shadow-sm"
          >
            <span>{t("footer.club_spoolio")}</span>
          </Link>

          <Link href="/don" className="text-[#ff4f00] hover:underline transition-colors">{t("footer.support_workshop")}</Link>
          <Link href="/a-propos" className="hover:text-[#ff4f00] transition-colors">{t("footer.about")}</Link>
          <Link href="/pro" className="hover:text-[#ff4f00] transition-colors">{t("footer.pro_space")}</Link>
          <Link href="/contact" className="hover:text-[#ff4f00] transition-colors">{t("footer.contact")}</Link>
          <Link href="/faq" className="hover:text-[#ff4f00] transition-colors">{t("footer.faq")}</Link>

          {/* Submenu for Legal Pages */}
          <div
            ref={legalRef}
            className="relative inline-block text-left group"
            onMouseEnter={() => setIsLegalOpen(true)}
            onMouseLeave={() => setIsLegalOpen(false)}
          >
            <button
              onClick={() => setIsLegalOpen(!isLegalOpen)}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-1"
              aria-expanded={isLegalOpen}
            >
              <span>{t("footer.legal_info")}</span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isLegalOpen ? "rotate-180 text-white" : "text-gray-400 group-hover:rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Legal Dropdown Menu with zero gap bridge wrapper */}
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 pb-2.5 z-50 ${isLegalOpen ? "block" : "hidden group-hover:block"}`}>
              <div className="w-56 bg-[#131316]/95 border border-white/15 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col gap-1 text-left animate-scale-up">
                <Link
                  href="/mentions-legales"
                  onClick={() => setIsLegalOpen(false)}
                  className="px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium block"
                >
                  {t("footer.links.legal")}
                </Link>
                <Link
                  href="/cgv"
                  onClick={() => setIsLegalOpen(false)}
                  className="px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium block"
                >
                  {t("footer.links.cgv")}
                </Link>
                <Link
                  href="/cookies"
                  onClick={() => setIsLegalOpen(false)}
                  className="px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium block"
                >
                  {t("footer.links.cookies")}
                </Link>
                <Link
                  href="/retours"
                  onClick={() => setIsLegalOpen(false)}
                  className="px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium block"
                >
                  {t("footer.links.returns")}
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}


