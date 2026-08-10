"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation, Locale } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Check } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "header" | "footer" | "mobile";
  className?: string;
}

export default function LanguageSwitcher({
  variant = "header",
  className = ""
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇬🇧" }
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  if (variant === "mobile") {
    return (
      <div className={`flex items-center justify-between w-full p-3 rounded-2xl bg-white/5 border border-white/10 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
          <Globe className="w-4 h-4 text-[#ff4f00]" />
          <span>Langue / Language</span>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                locale === lang.code
                  ? "bg-[#ff4f00] text-white shadow-[0_0_12px_rgba(255,79,0,0.5)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{lang.flag}</span>
              <span className="uppercase">{lang.code}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left z-50 ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-extrabold text-gray-200 hover:text-white transition-all backdrop-blur-md shadow-sm group"
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5 text-[#ff4f00] group-hover:rotate-12 transition-transform duration-300" />
        <span className="text-base leading-none">{currentLang.flag}</span>
        <span className="uppercase tracking-wider font-mono font-bold text-xs">{currentLang.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-white" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-36 rounded-2xl bg-[#0f0f13]/95 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl py-1.5 z-50 overflow-hidden"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-all ${
                  locale === lang.code
                    ? "bg-[#ff4f00]/15 text-[#ff4f00]"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {locale === lang.code && <Check className="w-3.5 h-3.5 text-[#ff4f00]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
