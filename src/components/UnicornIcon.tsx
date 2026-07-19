"use client";

import React, { useState } from "react";
import Lottie from "lottie-react";

interface UnicornIconProps {
  animationData: any;
  className?: string;
  loop?: boolean;
}

export default function UnicornIcon({ animationData, className, loop = true }: UnicornIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Check if it's a real Lottie file (has layers or playhead)
  const isRealLottie = animationData && (animationData.layers || animationData.v);

  if (isRealLottie) {
    return <Lottie animationData={animationData} loop={loop} className={className} />;
  }

  // Draw custom animated SVG shopping cart (Panier blanc animé)
  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: isHovered ? "scale(1.08)" : "none",
          transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        {/* Cart Basket Body - Slides forward slightly on hover */}
        <path
          d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isHovered ? "translateX(1.2px) translateY(-0.5px)" : "none",
            transition: "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.15)",
          }}
        />
        
        {/* Left Wheel - Spins on hover */}
        <circle
          cx="9"
          cy="20"
          r="2"
          stroke="#ffffff"
          strokeWidth="2"
          style={{
            transform: isHovered ? "rotate(360deg)" : "none",
            transformOrigin: "9px 20px",
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Right Wheel - Spins on hover */}
        <circle
          cx="19"
          cy="20"
          r="2"
          stroke="#ffffff"
          strokeWidth="2"
          style={{
            transform: isHovered ? "rotate(360deg)" : "none",
            transformOrigin: "19px 20px",
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
    </div>
  );
}
