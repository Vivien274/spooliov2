"use client";

import Link from "next/link";
import {
  Brain,
  Gamepad2,
  ShieldCheck,
  Gift,
  Dices,
  Keyboard,
  Tag,
  ArrowRight,
} from "lucide-react";

export interface ThemePill {
  id: string;
  label: string;
  href: string;
  icon: any;
}

const THEMES: ThemePill[] = [
  {
    id: "anti-stress",
    label: "Anti-Stress",
    href: "/categorie/Fidgets",
    icon: Brain,
  },
  {
    id: "gaming",
    label: "Gaming & Setup",
    href: "/categorie/Geek %2F Gaming",
    icon: Gamepad2,
  },
  {
    id: "animaux-nfc",
    label: "Animaux & SOS",
    href: "/medaillon-nfc-chien-chat",
    icon: ShieldCheck,
  },
  {
    id: "pochettes",
    label: "Surprises 3D",
    href: "/pochette-surprise",
    icon: Gift,
  },
  {
    id: "app-enjeu",
    label: "Jeux & App",
    href: "/jeux-de-societe",
    icon: Dices,
  },
  {
    id: "studio-clicker",
    label: "Studio Clicker",
    href: "/createur-cliqueur",
    icon: Keyboard,
  },
  {
    id: "petits-budgets",
    label: "Moins de 15€",
    href: "/boutique",
    icon: Tag,
  },
];

export default function ThemeRibbon() {
  return (
    <section className="w-full border-y border-white/10 bg-[#0b0c10]/95 backdrop-blur-md py-3.5 px-4 select-none shadow-md">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory font-sans">
        <span className="hidden xl:flex items-center gap-2 text-[10px] font-mono font-bold text-[#ff4f00] uppercase tracking-widest shrink-0 border-r border-white/10 pr-4">
          <span>PAR ENVIE</span>
        </span>

        <div className="flex items-center justify-between w-full gap-2 sm:gap-4">
          {THEMES.map((theme) => {
            const Icon = theme.icon;

            return (
              <Link
                key={theme.id}
                href={theme.href}
                className="group flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-[#ff4f00]/50 transition-all duration-300 shrink-0 snap-start active:scale-95 cursor-pointer shadow-xs"
              >
                <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#ff4f00] flex items-center justify-center transition-colors duration-300">
                  <Icon className="w-3.5 h-3.5 text-white/90 group-hover:text-white transition-colors" />
                </div>
                <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors whitespace-nowrap">
                  {theme.label}
                </span>
              </Link>
            );
          })}
        </div>

        <Link
          href="/boutique"
          className="hidden md:flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-[#ff4f00] transition-colors shrink-0 border-l border-white/10 pl-4 group"
        >
          <span>Tout</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
