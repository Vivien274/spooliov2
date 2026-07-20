"use client";

import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";

interface UnicornIconProps {
  animationData?: any;
  iconPath?: string; // Path to config JSON in public folder (ex: "/icons/shopping-bag.json")
  className?: string;
  loop?: boolean;
}

export default function UnicornIcon({ animationData, iconPath, className, loop = true }: UnicornIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load lottie-interactive custom element script if iconPath is used
  useEffect(() => {
    if (!iconPath) return;

    // Check if script is already loaded
    if (window.customElements && window.customElements.get("lottie-interactive")) {
      setScriptLoaded(true);
      return;
    }

    const scriptId = "lottie-interactive-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/lottie-interactive@latest/dist/lottie-interactive.js";
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, [iconPath]);

  // Check if we are passing a full Lottie file containing layers
  const isRealLottie = animationData && (animationData.layers || animationData.v);

  if (isRealLottie) {
    return <Lottie animationData={animationData} loop={loop} className={className} />;
  }

  // If using Unicorn Icons config JSON via URL in public directory
  if (iconPath && scriptLoaded) {
    return (
      <div className={className}>
        {/* @ts-ignore */}
        <lottie-interactive
          path={iconPath}
          interaction="hover"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  }

  // Fallback: Custom animated interactive SVG shopping cart (Panier blanc animé Spoolio)
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
          stroke="currentColor"
          strokeWidth="2.5"
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
          strokeWidth="2.5"
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
          strokeWidth="2.5"
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
