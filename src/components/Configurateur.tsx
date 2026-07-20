"use client";

import { useState } from "react";

interface ConfigurateurProps {
  color: string;
}

export default function Configurateur({ color }: ConfigurateurProps) {
  const [rotationSpeed, setRotationSpeed] = useState(3);
  const [isSpinning, setIsSpinning] = useState(true);

  const getCssColor = (colorName: string) => {
    const cName = colorName.toLowerCase().trim();
    if (cName.startsWith("#") || cName.startsWith("linear-gradient") || cName.startsWith("rgb")) {
      return colorName;
    }
    const colorMap: Record<string, string> = {
      "blanc": "#ffffff",
      "noir": "#121214",
      "noir pailleté": "#222226",
      "argenté": "#cfd9df",
      "argent": "#cfd9df",
      "doré": "#f6d365",
      "doré brillant": "#f6d365",
      "bleu": "#005cff",
      "bleu clair": "#58a6ff",
      "bleu marine": "#0d1b2a",
      "jaune": "#f7eb12",
      "rouge": "#ff2a2a",
      "rouge brillant": "#ff2a2a",
      "orange": "#ff4f00",
      "orange / rouge brillant": "#ff4f00",
      "rose": "#ff66cc",
      "rose poudré": "#ffb7c5",
      "rose pâle": "#ffd1dc",
      "vert": "#2ebd59",
      "vert fluo / pomme": "#66ff33",
      "vert foncé": "#134e1e",
      "vert menthe": "#a2f2c8",
      "violet": "#a32eff",
      "phosphorescent": "#e0ffe0",
      "transparent": "rgba(255,255,255,0.15)",
    };
    for (const key of Object.keys(colorMap)) {
      if (cName.includes(key)) return colorMap[key];
    }
    return "#ff4f00";
  };

  const activeColor = getCssColor(color);

  const handleLaunchSpin = () => {
    setRotationSpeed(0.5);
    setTimeout(() => {
      setRotationSpeed(3);
    }, 2000);
  };

  return (
    <div className="w-full bg-[#18181b]/40 border border-[#222225] rounded-3xl p-6 flex flex-col items-center gap-5 select-none no-invert font-sans">
      <div className="text-center">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Visualiseur de Fidget 3D interactif 🌀
        </h4>
        <p className="text-[10px] text-gray-500 mt-0.5">
          Sélectionnez une couleur pour l'appliquer en temps réel.
        </p>
      </div>

      {/* 3D Scene Container */}
      <div 
        onClick={handleLaunchSpin}
        title="Cliquez pour lancer la rotation !"
        className="w-full aspect-video min-h-[180px] bg-black/30 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner cursor-pointer"
      >
        {/* Shadow floor */}
        <div className="absolute bottom-6 w-32 h-3 bg-black/45 rounded-full filter blur-[6px] transform scale-x-[1.2]" />

        {/* 3D Fidget Object */}
        <div 
          className="relative w-28 h-28 flex items-center justify-center transition-all duration-300"
          style={{
            transform: "rotateX(60deg) rotateY(10deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Rotating parts */}
          <div 
            className="w-full h-full relative"
            style={{
              animation: isSpinning ? `spin ${rotationSpeed}s linear infinite` : "none",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Center bearings cap */}
            <div 
              className="absolute w-8 h-8 rounded-full bg-zinc-700 border border-zinc-600 shadow-lg z-20"
              style={{
                transform: "translateZ(8px)",
                background: "radial-gradient(circle, #444 30%, #111 80%)"
              }}
            />

            {/* Fidget 3 wings */}
            {/* Wing 1 (Up) */}
            <div 
              className="absolute top-0 w-8 h-12 rounded-full shadow-lg transition-colors duration-500"
              style={{
                background: activeColor,
                left: "calc(50% - 16px)",
                transformOrigin: "bottom center",
                transform: "rotate(0deg) translateY(-8px)",
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))"
              }}
            />
            {/* Wing 2 (Bottom Left) */}
            <div 
              className="absolute top-0 w-8 h-12 rounded-full shadow-lg transition-colors duration-500"
              style={{
                background: activeColor,
                left: "calc(50% - 16px)",
                transformOrigin: "bottom center",
                transform: "rotate(120deg) translateY(-8px)",
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))"
              }}
            />
            {/* Wing 3 (Bottom Right) */}
            <div 
              className="absolute top-0 w-8 h-12 rounded-full shadow-lg transition-colors duration-500"
              style={{
                background: activeColor,
                left: "calc(50% - 16px)",
                transformOrigin: "bottom center",
                transform: "rotate(240deg) translateY(-8px)",
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))"
              }}
            />

            {/* Bearings inside wings */}
            {[0, 120, 240].map((angle) => (
              <div 
                key={angle}
                className="absolute top-2 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-900 shadow-inner"
                style={{
                  left: "calc(50% - 10px)",
                  transformOrigin: "50% 48px",
                  transform: `rotate(${angle}deg) translateZ(3px)`,
                  background: "radial-gradient(circle, #555 40%, #222 90%)"
                }}
              />
            ))}
          </div>
        </div>

        {/* Dynamic glow overlay matching selected color */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-10 transition-colors duration-500 blur-2xl"
          style={{ background: activeColor }}
        />
      </div>

      {/* Interactive Controls */}
      <div className="flex gap-4 w-full text-xs">
        <button
          onClick={handleLaunchSpin}
          className="flex-1 h-9 bg-white text-black hover:bg-gray-200 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md text-center flex items-center justify-center"
        >
          🌀 Lancer la rotation
        </button>
        <button
          onClick={() => setIsSpinning(!isSpinning)}
          className="px-4 h-9 bg-[#1c1c21] border border-white/5 hover:border-white/10 text-gray-400 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
        >
          {isSpinning ? "Pause" : "Lecture"}
        </button>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
