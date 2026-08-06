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
      className="w-screen relative left-1/2 -translate-x-1/2 py-1 my-0 overflow-hidden select-none flex items-center justify-center font-sans max-h-24"
    >
      {/* SVG Full-Width Compact Curve Canvas */}
      <div className="w-full overflow-visible px-0">
        <svg
          className="w-full h-20 sm:h-24 overflow-visible"
          viewBox="0 0 1600 100"
          role="img"
          aria-label="Subtle neon text riding a curved path while scrolling"
        >
          {/* Dotted/Dashed Wave Curve Path across full screen width */}
          <path
            id="spoolio-curve-path-full"
            d="M -150 70 C 200 70 300 25 650 25 S 1100 70 1400 70 S 1650 30 1850 30"
            fill="none"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="5 7"
          />

          {/* Pure White Text with Soft Subtle Neon Aura */}
          <text
            className="text-base sm:text-lg lg:text-xl font-extrabold uppercase tracking-wider font-antonio fill-white drop-shadow-[0_0_8px_rgba(255,79,0,0.4)]"
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
