"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface AdminThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  // Pre-computed class helpers
  cls: {
    pageBg: string;
    sidebarBg: string;
    cardBg: string;
    inputBg: string;
    border: string;
    textMain: string;
    textMuted: string;
    textFaint: string;
    badgeBg: string;
    statusBg: string;
    hoverRow: string;
    divider: string;
  };
}

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Sync with existing global theme
    const saved = localStorage.getItem("theme") as Theme | null;
    const isLight =
      saved === "light" || document.documentElement.classList.contains("light");
    if (isLight) setTheme("light");
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    if (next === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  const d = theme === "dark";

  const cls: AdminThemeContextValue["cls"] = {
    pageBg:     d ? "bg-[#0a0a0f]"   : "bg-[#f4f4f8]",
    sidebarBg:  d ? "bg-[#0d0d14]"   : "bg-white",
    cardBg:     d ? "bg-[#131316]"   : "bg-white",
    inputBg:    d ? "bg-[#0d0d14]"   : "bg-gray-50",
    border:     d ? "border-[#1e1e2a]" : "border-[#e2e2ea]",
    textMain:   d ? "text-white"      : "text-gray-900",
    textMuted:  d ? "text-gray-400"   : "text-gray-500",
    textFaint:  d ? "text-gray-600"   : "text-gray-400",
    badgeBg:    d ? "bg-[#1e1e2a] text-gray-400" : "bg-gray-100 text-gray-500",
    statusBg:   d ? "bg-[#1a1a22] border-[#2a2a35]" : "bg-gray-100 border-gray-200",
    hoverRow:   d ? "hover:bg-white/[0.02]" : "hover:bg-gray-50",
    divider:    d ? "divide-[#1e1e2a]" : "divide-gray-100",
  };

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, cls }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme(): AdminThemeContextValue {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error("useAdminTheme must be used inside AdminThemeProvider");
  return ctx;
}
