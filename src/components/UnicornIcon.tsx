"use client";

import React, { useState, useRef, useEffect } from "react";
import Lottie from "lottie-react";

interface UnicornIconProps {
  animationData?: any;
  className?: string;
  loop?: boolean;
  isHovered?: boolean; // Triggered externally by the parent button's hover state
}

export default function UnicornIcon({ animationData, className, loop = false, isHovered: externalHovered }: UnicornIconProps) {
  const [internalHovered, setInternalHovered] = useState(false);
  const lottieRef = useRef<any>(null);

  // Use external hover state if provided, otherwise fallback to local hover state
  const isHovered = externalHovered !== undefined ? externalHovered : internalHovered;

  // Check if we are passing a full Lottie file containing layers
  const isRealLottie = animationData && (animationData.layers || animationData.v);

  // Play animation whenever hover state changes to true
  useEffect(() => {
    if (isHovered && isRealLottie && lottieRef.current) {
      lottieRef.current.goToAndPlay(0, true); // Play from the start on hover
    }
  }, [isHovered, isRealLottie]);

  const handleMouseEnter = () => {
    if (externalHovered === undefined) {
      setInternalHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (externalHovered === undefined) {
      setInternalHovered(false);
    }
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
          autoplay={false} // Autoplay disabled
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  }

  // Fallback: Custom animated interactive SVG shopping cart (Panier blanc animé Spoolio)
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
