"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import fr from "@/locales/fr.json";
import en from "@/locales/en.json";

export type Locale = "fr" | "en";

const translations: Record<Locale, any> = { fr, en };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const router = useRouter();

  // Load language preference from localStorage/cookies on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem("spoolio_locale") as Locale;
    if (savedLocale === "fr" || savedLocale === "en") {
      setLocaleState(savedLocale);
    } else {
      // Browser language check
      const browserLang = navigator.language.split("-")[0];
      const defaultLocale: Locale = browserLang === "en" ? "en" : "fr";
      setLocaleState(defaultLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("spoolio_locale", newLocale);
    
    // Set cookies so the server reads the locale on next request
    document.cookie = `spoolio_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Refresh Server Components so server-rendered sections update
    router.refresh();
  };

  // Translation helper function
  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let current: any = translations[locale];

    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        // Fallback: if translation not found in current language, try French
        let frCurrent = translations["fr"];
        for (const frK of keys) {
          if (frCurrent && typeof frCurrent === "object" && frK in frCurrent) {
            frCurrent = frCurrent[frK];
          } else {
            frCurrent = null;
            break;
          }
        }
        if (typeof frCurrent === "string") {
          current = frCurrent;
        } else {
          return key; // return key as fallback if absolutely not found
        }
        break;
      }
    }

    if (typeof current !== "string") {
      return key;
    }

    let result = current;
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        result = result.replace(new RegExp(`{${placeholder}}`, "g"), String(value));
      });
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
