"use client";

import { useState, useRef, MouseEvent } from "react";
import Link from "next/link";

interface BoutiqueCTAButtonProps {
  label: string;
  sublabel?: string;
  badge?: string;
  href?: string;
}

export default function BoutiqueCTAButton({
  label,
  sublabel = "+40 Fidgets & Créations 3D Écoresponsables",
  badge = "BOUTIQUE OFFICIELLE",
  href = "/boutique",
}: BoutiqueCTAButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Subtle magnetic attraction factor
    const moveX = (e.clientX - centerX) * 0.15;
    const moveY = (e.clientY - centerY) * 0.15;

    setPosition({ x: moveX, y: moveY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div className="flex justify-center w-full my-6 select-none">
      <Link
        ref={buttonRef}
        href={href}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
        }}
        className="group relative w-full max-w-xl p-0.5 rounded-3xl bg-gradient-to-r from-[#ff4f00] via-[#ff7700] to-[#ff2200] shadow-[0_0_30px_rgba(255,79,0,0.35)] hover:shadow-[0_0_60px_rgba(255,79,0,0.7)] transition-all duration-300 no-invert cursor-pointer overflow-hidden"
      >
        {/* Animated Conic Glow Layer */}
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,#ff4f00_0deg,#ff9900_120deg,#ff2200_240deg,#ff4f00_360deg)] opacity-40 group-hover:opacity-100 animate-[spin_6s_linear_infinite] blur-md transition-opacity" />

        {/* Shimmer Light Beam */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-10 pointer-events-none" />

        {/* Inner Card Content */}
        <div className="relative z-20 w-full py-4 sm:py-5 px-6 sm:px-8 rounded-[22px] bg-[#111116] group-hover:bg-[#15151c] flex items-center justify-between gap-4 transition-colors duration-300 border border-white/10">
          
          {/* Left Icon & Titles */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Animated Icon Box */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#ff4f00] to-[#e04500] flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-lg shadow-[#ff4f00]/30 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 border border-white/20">
              <span className="no-invert">🛍️</span>
              {/* Pulse Ring */}
              <span className="absolute inset-0 rounded-2xl border-2 border-white/40 animate-ping opacity-25 pointer-events-none" />
            </div>

            <div className="flex flex-col text-left min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#ff4f00] bg-[#ff4f00]/10 border border-[#ff4f00]/30 px-2 py-0.5 rounded-full shrink-0">
                  {badge}
                </span>
              </div>
              <span className="text-base sm:text-lg font-black tracking-wide text-white leading-tight font-antonio uppercase group-hover:text-[#ff4f00] transition-colors truncate">
                {label}
              </span>
              <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-neutral-400 group-hover:text-neutral-200 transition-colors truncate mt-0.5">
                {sublabel}
              </span>
            </div>
          </div>

          {/* Right Centered Arrow Badge */}
          <div className="flex items-center shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-[#ff4f00] group-hover:border-[#ff4f00] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#ff4f00]/40">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-black group-hover:translate-x-0.5 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>

        </div>
      </Link>
    </div>
  );
}
