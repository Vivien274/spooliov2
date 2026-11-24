"use client";

import React, { useEffect, useRef, useState } from "react";

interface TechTextProps {
  text: string;
  className?: string;
}

const SPECKS = [
  { x: -10, y: 18, size: 2 },
  { x: -14, y: 72, size: 2 },
  { x: 16, y: -12, size: 2 },
  { x: 68, y: -10, size: 2 },
  { x: 104, y: 16, size: 2 },
  { x: 106, y: 78, size: 2 },
  { x: 48, y: 112, size: 2 },
];

/**
 * React Bits "Tech Text" (Vector preset, Dashed 4px/2px, 1.5px stroke, weight 600, -0.05em)
 * adapted to Spoolio's light theme (#121212 text, #FF5500 accent).
 * Both active and inactive states render via the same centered SVG text so there is 0px shift.
 */
export default function TechText({ text, className = "" }: TechTextProps) {
  const chars = Array.from(text);
  const containerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isHovering, setIsHovering] = useState(false);
  const [frameBox, setFrameBox] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const el = charRefs.current[activeIndex];
    const container = containerRef.current;
    if (!el || !container) return;

    const updateBox = () => {
      // Exact cap-height framing inside the same offsetParent as `el`
      const topOffset = Math.round(el.offsetHeight * 0.16);
      const boxHeight = Math.round(el.offsetHeight * 0.72);
      setFrameBox({
        left: el.offsetLeft - 2,
        top: el.offsetTop + topOffset,
        width: el.offsetWidth + 4,
        height: boxHeight,
      });
    };

    updateBox();
    window.addEventListener("resize", updateBox);
    return () => window.removeEventListener("resize", updateBox);
  }, [activeIndex, text]);

  // Smooth auto-sweep when idle
  useEffect(() => {
    if (isHovering || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        let next = (prev + 1) % chars.length;
        if (chars[next] === " ") next = (next + 1) % chars.length;
        return next;
      });
    }, 1150);
    return () => clearInterval(timer);
  }, [isHovering, chars]);

  const activeChar = chars[activeIndex] || "";

  return (
    <div
      ref={containerRef}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative inline-flex items-center justify-center select-none pt-7 pb-3 px-4 ${className}`}
      aria-label={text}
    >
      {/* Characters + Gliding Frame share the exact same relative coordinate parent */}
      <div className="relative z-10 inline-flex items-center">
        {/* Gliding Vector Selection Frame */}
        {frameBox && (
          <div
            aria-hidden="true"
            className="absolute pointer-events-none border border-[#FF5500]/65 transition-all duration-300 ease-out z-20"
            style={{
              left: `${frameBox.left}px`,
              top: `${frameBox.top}px`,
              width: `${frameBox.width}px`,
              height: `${frameBox.height}px`,
            }}
          >
            {/* 4 Fine Square Corner Handles */}
            <span className="absolute -top-[3px] -left-[3px] w-1.5 h-1.5 bg-[#FF5500]" />
            <span className="absolute -top-[3px] -right-[3px] w-1.5 h-1.5 bg-[#FF5500]" />
            <span className="absolute -bottom-[3px] -left-[3px] w-1.5 h-1.5 bg-[#FF5500]" />
            <span className="absolute -bottom-[3px] -right-[3px] w-1.5 h-1.5 bg-[#FF5500]" />

            {/* Tiny technical specks */}
            {SPECKS.map((s, sIdx) => (
              <span
                key={sIdx}
                className="absolute bg-[#FF5500]/55 rounded-[1px]"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                }}
              />
            ))}

            {/* Floating Label */}
            <span className="absolute -top-5 left-0 font-mono text-[10px] font-semibold tracking-wider text-zinc-500 whitespace-nowrap flex items-center gap-1.5">
              <span className="text-[#FF5500] font-bold">{activeChar}</span>
              <span>
                {Math.round(frameBox.width)} × {Math.round(frameBox.height)}
              </span>
            </span>
          </div>
        )}

        {chars.map((char, idx) => {
          if (char === " ") {
            return (
              <span
                key={idx}
                ref={(el) => {
                  charRefs.current[idx] = el;
                }}
                className="w-4 sm:w-6 inline-block"
              />
            );
          }

          const isActive = idx === activeIndex;

          return (
            <span
              key={idx}
              ref={(el) => {
                charRefs.current[idx] = el;
              }}
              onMouseEnter={() => {
                setIsHovering(true);
                setActiveIndex(idx);
              }}
              className="relative inline-block font-be-vietnam font-semibold text-[104px] sm:text-[148px] leading-none tracking-[-0.05em] cursor-crosshair"
            >
              {/* Invisible spacer for exact character width & height */}
              <span className="opacity-0 pointer-events-none" aria-hidden="true">
                {char}
              </span>

              {/* Exact centered SVG glyph (solid #121212 when idle, dashed #FF5500 1.5px when active) */}
              <svg
                className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
                aria-hidden="true"
              >
                <text
                  x="50%"
                  y="52%"
                  dominantBaseline="central"
                  textAnchor="middle"
                  fill={isActive ? "none" : "#121212"}
                  stroke={isActive ? "#FF5500" : "none"}
                  strokeWidth={isActive ? "1.5" : "0"}
                  strokeDasharray={isActive ? "4 2" : undefined}
                  className="font-be-vietnam font-semibold text-[104px] sm:text-[148px] transition-colors duration-150"
                >
                  {char}
                </text>
              </svg>
            </span>
          );
        })}
      </div>
    </div>
  );
}
