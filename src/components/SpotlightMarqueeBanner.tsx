"use client";

import { useState, useRef, MouseEvent } from "react";
import { Sparkles, Cpu, ShieldCheck, Heart, Truck, Award } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export default function SpotlightMarqueeBanner() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; isHovered: boolean }>({
    x: 0,
    y: 0,
    isHovered: false,
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, isHovered: false }));
  };

  const highlights = [
    {
      icon: Cpu,
      title: t("home.marquee.h1.title"),
      desc: t("home.marquee.h1.desc"),
      badge: t("home.marquee.h1.badge"),
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      icon: Award,
      title: t("home.marquee.h2.title"),
      desc: t("home.marquee.h2.desc"),
      badge: t("home.marquee.h2.badge"),
      color: "from-[#ff4f00]/20 to-amber-500/10 text-[#ff4f00] border-[#ff4f00]/30",
    },
    {
      icon: Sparkles,
      title: t("home.marquee.h3.title"),
      desc: t("home.marquee.h3.desc"),
      badge: t("home.marquee.h3.badge"),
      color: "from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30",
    },
    {
      icon: Truck,
      title: t("home.marquee.h4.title"),
      desc: t("home.marquee.h4.desc"),
      badge: t("home.marquee.h4.badge"),
      color: "from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30",
    },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full rounded-3xl bg-[#0e0e11] border border-white/10 p-6 md:p-8 overflow-hidden select-none shadow-2xl group my-8"
    >
      {/* Dynamic Cursor Spotlight Radial Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-500 z-10"
        style={{
          opacity: mousePos.isHovered ? 1 : 0,
          background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 79, 0, 0.18), rgba(47, 60, 217, 0.08) 50%, transparent 80%)`,
        }}
      />

      {/* Spotlight Border Mask */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-500 z-10"
        style={{
          opacity: mousePos.isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 79, 0, 0.6), transparent 70%)`,
          maskImage: "linear-gradient(black, black)",
          WebkitMaskImage: "linear-gradient(black, black)",
        }}
      />

      {/* Header Banner */}
      <div className="relative z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ff4f00] flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("home.marquee.tagline")}</span>
          </span>
          <h3 className="text-2xl sm:text-3xl font-black uppercase font-antonio tracking-wide text-white">
            {t("home.marquee.title")}
          </h3>
        </div>
        <p className="text-xs text-gray-400 max-w-sm font-sans leading-relaxed">
          {t("home.marquee.subtitle")}
        </p>
      </div>

      {/* Highlights 4-Grid with Interactive Glow */}
      <div className="relative z-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-all duration-300 flex flex-col justify-between h-44 group/card hover:scale-[1.02] hover:border-white/20`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} border`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md bg-white/10 text-gray-300 uppercase">
                  {item.badge}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white group-hover/card:text-[#ff4f00] transition-colors mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-400 font-sans leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
