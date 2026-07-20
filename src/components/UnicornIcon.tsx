"use client";

import React, { useState, useRef } from "react";
import Lottie from "lottie-react";

interface UnicornIconProps {
  animationData?: any;
  className?: string;
  loop?: boolean;
}

export default function UnicornIcon({ animationData, className, loop = false }: UnicornIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const lottieRef = useRef<any>(null);

  // Check if we are passing a full Lottie file containing layers
  const isRealLottie = animationData && (animationData.layers || animationData.v);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isRealLottie && lottieRef.current) {
      lottieRef.current.goToAndPlay(0, true); // Play from the start on hover
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (isRealLottie) {
    return (
      <div 
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Lottie 
          lottieRef={lottieRef}
          animationData={animationData} 
          loop={loop} 
          autoplay={false} // Autoplay disabled to trigger only on hover
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  }

  // Fallback: Custom animated interactive SVG shopping cart (Panier blanc animé Spoolio)
  // Uses "currentColor" to adapt to parent text color (white on buttons, gray/black elsewhere)
  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: isHovered ? "scale(1.1)" : "none",
          transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        {/* Cart Basket Body - Slides forward slightly on hover */}
        <path
          d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isHovered ? "translateX(1px) translateY(-0.5px)" : "none",
            transition: "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.15)",
          }}
        />
        
        {/* Left Wheel - Spins on hover */}
        <circle
          cx="9"
          cy="20"
          r="2"
          stroke="currentColor"
          strokeWidth="2.2"
          style={{
            transform: isHovered ? "rotate(360deg)" : "none",
            transformOrigin: "9px 20px",
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Right Wheel - Spins on hover */}
        <circle
          cx="19"
          cy="20"
          r="2"
          stroke="currentColor"
          strokeWidth="2.2"
          style={{
            transform: isHovered ? "rotate(360deg)" : "none",
            transformOrigin: "19px 20px",
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
    </div>
  );
}
