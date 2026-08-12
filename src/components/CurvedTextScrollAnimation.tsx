"use client";

import { useEffect, useRef } from "react";

export default function CurvedTextScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textPathRef = useRef<SVGTextPathElement>(null);

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (!containerRef.current || !textPathRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate scroll progress relative to component
      const totalDist = rect.height + windowHeight;
      const currentPos = windowHeight - rect.top;
      const progress = Math.min(1, Math.max(0, currentPos / totalDist));

      // Scrub startOffset from 130% down to -30% (160% total offset range)
      const offsetVal = (130 - progress * 160).toFixed(2) + "%";

      animationFrameId = requestAnimationFrame(() => {
        if (textPathRef.current) {
          textPathRef.current.setAttribute("startOffset", offsetVal);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-screen relative left-1/2 -translate-x-1/2 py-2 my-2 overflow-hidden select-none flex items-center justify-center font-sans max-h-32"
    >
      {/* SVG Full-Width Compact Curve Canvas */}
      <div className="w-full overflow-visible px-0">
        <svg
          className="w-full h-24 sm:h-28 md:h-32 overflow-visible"
          viewBox="0 0 1600 110"
          role="img"
          aria-label="Texte néon ondulant sur un chemin courbe au défilement"
        >
          {/* Dotted/Dashed Wave Curve Path across full screen width */}
          <path
            id="spoolio-curve-path-full"
            d="M -150 75 C 200 75 300 25 650 25 S 1100 75 1400 75 S 1650 30 1850 30"
            fill="none"
            stroke="rgba(255, 85, 0, 0.4)"
            strokeWidth="2.5"
            strokeDasharray="6 8"
          />

          {/* High-visibility Text on Mobile & Desktop */}
          <text
            className="text-[52px] sm:text-[42px] md:text-[34px] lg:text-[28px] font-black uppercase tracking-wider font-antonio fill-white drop-shadow-[0_0_12px_rgba(255,85,0,0.6)]"
          >
            <textPath
              ref={textPathRef}
              href="#spoolio-curve-path-full"
              startOffset="130%"
            >
              ✦ SPOOLIO ATELIER 3D ✦ IMPRESSION ECO-RESPONSABLE ✦ FIDGETS &amp; CRÉATIONS SUR-MESURE ✦ FABRIQUÉ EN FRANCE ✦ SPOOLIO ✦
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  );
}
