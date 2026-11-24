"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";

interface HeroMarqueeBannerProps {
  text?: string;
  speed?: number;
  curviness?: number;
  interactive?: boolean;
}

/**
 * React Bits "Text Loop" (curviness = 0) marquee banner:
 * Seamless SVG <textPath> loop with pointer drag/fling inertia, scroll boost, and edge fade,
 * styled in Spoolio's light theme (#FAF9F6 surface, #121212 ink, #FF5500 accent).
 */
export default function HeroMarqueeBanner({
  text = "SPOOLIO  ✦  OBJETS TACTILES & CURIOSITÉS  ✦  FABRIQUÉ À COMINES  ✦  PETITES SÉRIES D'ATELIER  ✦  ",
  speed = 1.15,
  curviness = 0,
  interactive = true,
}: HeroMarqueeBannerProps) {
  const uid = useId().replace(/:/g, "");
  const pathId = `text-loop-path-${uid}`;
  const measureRef = useRef<SVGTextElement | null>(null);
  const textPathRef = useRef<SVGTextPathElement | null>(null);

  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);

  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const scrollBoostRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const offsetRef = useRef(0);

  // Measure single unit length for seamless modulo wrap
  useEffect(() => {
    if (measureRef.current) {
      const len = measureRef.current.getComputedTextLength();
      if (len > 0) {
        setSpacing(len);
        offsetRef.current = -len;
        setOffset(-len);
      }
    }
  }, [text]);

  // Subtle scroll-boost listener
  useEffect(() => {
    if (typeof window === "undefined") return;
    lastScrollYRef.current = window.scrollY;
    const onScroll = () => {
      const delta = window.scrollY - lastScrollYRef.current;
      lastScrollYRef.current = window.scrollY;
      scrollBoostRef.current = Math.max(-8, Math.min(8, scrollBoostRef.current + delta * 0.04));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Main requestAnimationFrame loop with inertia & scroll decay
  useEffect(() => {
    if (!spacing || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    const tick = () => {
      if (!dragRef.current) {
        const delta = -speed - scrollBoostRef.current + velocityRef.current;
        let next = offsetRef.current + delta;

        if (next <= -spacing * 2) next += spacing;
        if (next > 0) next -= spacing;

        offsetRef.current = next;
        setOffset(next);

        velocityRef.current *= 0.94;
        scrollBoostRef.current *= 0.92;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [spacing, speed]);

  const totalText = useMemo(() => {
    if (!spacing) return text;
    const repeatCount = Math.ceil(2400 / spacing) + 3;
    return Array.from({ length: repeatCount }, () => text).join("");
  }, [text, spacing]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    dragRef.current = true;
    lastXRef.current = e.clientX;
    velocityRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !dragRef.current || !spacing) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velocityRef.current = dx * 0.65;

    let next = offsetRef.current + dx;
    if (next <= -spacing * 2) next += spacing;
    if (next > 0) next -= spacing;
    offsetRef.current = next;
    setOffset(next);
  };

  const handlePointerUp = () => {
    if (!interactive) return;
    dragRef.current = false;
  };

  const pathD = `M-100,18 Q720,${18 + curviness} 1540,18`;

  return (
    <section
      aria-label="Engagements Spoolio Atelier"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`w-full bg-zinc-950 border-y border-zinc-800/90 py-2 sm:py-2.5 text-zinc-100 select-none overflow-hidden relative ${
        interactive ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <svg
        viewBox="0 0 1440 28"
        className="w-full h-6 sm:h-7 overflow-visible block"
        preserveAspectRatio="xMidYMid slice"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
        }}
      >
        <defs>
          <path id={pathId} d={pathD} fill="none" />
        </defs>

        {/* Hidden single-unit measurement node */}
        <text
          ref={measureRef}
          xmlSpace="preserve"
          className="font-sans font-extrabold text-[12px] sm:text-[13px] uppercase tracking-[0.14em] opacity-0 pointer-events-none"
        >
          {text}
        </text>

        {spacing > 0 && (
          <text
            xmlSpace="preserve"
            className="font-sans font-extrabold text-[12px] sm:text-[13px] uppercase tracking-[0.14em]"
            fill="#f4f4f5"
          >
            <textPath
              ref={textPathRef}
              href={`#${pathId}`}
              startOffset={`${offset}px`}
              xmlSpace="preserve"
            >
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </section>
  );
}
