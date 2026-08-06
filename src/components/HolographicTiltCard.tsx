"use client";

import { useState, useRef, ReactNode, MouseEvent } from "react";

interface HolographicTiltCardProps {
  children: ReactNode;
  className?: string;
  maxTiltDegrees?: number;
  glowColor?: string;
}

export default function HolographicTiltCard({
  children,
  className = "",
  maxTiltDegrees = 15,
  glowColor = "rgba(255, 79, 0, 0.4)",
}: HolographicTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>("");
  const [shineStyle, setShineStyle] = useState<{
    opacity: number;
    background: string;
  }>({ opacity: 0, background: "" });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position inside element
    const y = e.clientY - rect.top; // y position inside element

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Relative mouse offset normalized from -1 to 1
    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;

    const rotateX = -percentY * maxTiltDegrees;
    const rotateY = percentX * maxTiltDegrees;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
    );

    // Holographic rainbow gradient angle and shine center
    const angle = Math.atan2(percentY, percentX) * (180 / Math.PI) + 90;
    const shineX = (percentX * 50 + 50).toFixed(1);
    const shineY = (percentY * 50 + 50).toFixed(1);

    setShineStyle({
      opacity: 0.7,
      background: `radial-gradient(circle at ${shineX}% ${shineY}%, ${glowColor} 0%, transparent 60%), linear-gradient(${angle}deg, rgba(255, 0, 128, 0.35) 0%, rgba(0, 240, 255, 0.35) 33%, rgba(255, 230, 0, 0.35) 66%, rgba(160, 32, 240, 0.35) 100%)`,
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setShineStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-200 ease-out will-change-transform transform-gpu ${className}`}
      style={{
        transform: transformStyle,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Holographic Refractive Layer */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-20 transition-opacity duration-300 mix-blend-color-dodge overflow-hidden"
        style={{
          opacity: shineStyle.opacity,
          background: shineStyle.background,
        }}
      />

      {/* Holographic Iridescent Border Highlight */}
      <div
        className="absolute -inset-[1px] rounded-[inherit] pointer-events-none z-10 transition-opacity duration-300"
        style={{
          opacity: shineStyle.opacity * 0.8,
          background: `linear-gradient(135deg, rgba(255, 79, 0, 0.8), rgba(0, 240, 255, 0.8), rgba(255, 230, 0, 0.8))`,
          maskImage: "linear-gradient(black, black)",
        }}
      />

      {/* Inner Card Content */}
      <div className="relative z-0 h-full w-full rounded-[inherit]">
        {children}
      </div>
    </div>
  );
}
