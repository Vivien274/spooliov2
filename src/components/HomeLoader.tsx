"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_STEPS = [
  { progress: 20, text: "Chauffe de la buse à 215°C... 🔥" },
  { progress: 55, text: "Extrusion du filament PLA Biosourcé 🌱" },
  { progress: 85, text: "Impression 3D des fidgets sensoriels... 🌀" },
  { progress: 100, text: "Bienvenue dans l'Atelier Spoolio 🚀" },
];

export default function HomeLoader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState<number>(0);
  const [currentStepText, setCurrentStepText] = useState<string>("Préparation de l'imprimante 3D...");
  const [isDone, setIsDone] = useState<boolean>(false);
  const [shouldRender, setShouldRender] = useState<boolean>(true);

  useEffect(() => {
    // Check if user already saw the loader during this browser session
    try {
      const hasLoaded = sessionStorage.getItem("spoolio_home_loaded");
      if (hasLoaded === "true") {
        setShouldRender(false);
        if (onComplete) onComplete();
        return;
      }
    } catch (e) {}

    // Animate progress smoothly from 0 to 100
    const duration = 4500; // 4.5 seconds total for easy previewing
    const intervalTime = 30;
    const totalSteps = duration / intervalTime;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const currentProgress = Math.min(100, Math.round((step / totalSteps) * 100));
      setProgress(currentProgress);

      // Update status text based on current progress percentage
      if (currentProgress < 30) {
        setCurrentStepText(LOADING_STEPS[0].text);
      } else if (currentProgress < 65) {
        setCurrentStepText(LOADING_STEPS[1].text);
      } else if (currentProgress < 90) {
        setCurrentStepText(LOADING_STEPS[2].text);
      } else {
        setCurrentStepText(LOADING_STEPS[3].text);
      }

      if (step >= totalSteps) {
        clearInterval(timer);
        setTimeout(() => {
          setIsDone(true);
          try {
            sessionStorage.setItem("spoolio_home_loaded", "true");
          } catch (e) {}
          setTimeout(() => {
            setShouldRender(false);
            if (onComplete) onComplete();
          }, 500); // Allow exit animation to finish
        }, 150);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.5, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] bg-[#09090b] flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans"
        >
          {/* Ambient Glow Orbs Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#2F3CD9]/30 via-[#ff4f00]/30 to-transparent rounded-full filter blur-[130px] pointer-events-none animate-pulse" />
          
          <div className="relative z-10 flex flex-col items-center max-w-sm w-full space-y-8 text-center">
            
            {/* Rotating 3D Filament Spool Container */}
            <div className="relative flex items-center justify-center">
              {/* Outer Glowing Neon Halo */}
              <div className="absolute w-52 h-52 rounded-full bg-[#ff4f00]/30 filter blur-2xl animate-pulse" />

              {/* Rotating Ultra-Realistic 3D Filament Spool */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-full overflow-hidden shadow-[0_15px_40px_rgba(255,79,0,0.45)] border-2 border-white/10"
              >
                <Image
                  src="/images/spool_3d_loader.png"
                  alt="3D Spool"
                  fill
                  className="object-cover scale-105"
                  priority
                />
              </motion.div>

              {/* Logo / Spoolio Branding Overlay in Arbor Hole Center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-[#0d0d11]/90 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                  <Image
                    src="/images/logo.png"
                    alt="Spoolio 3D"
                    width={48}
                    height={20}
                    className="h-4.5 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] no-invert"
                  />
                </div>
              </div>
            </div>

            {/* Brand Title & Tagline */}
            <div className="space-y-1 pt-2">
              <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-2">
                <span>SPOOLIO</span>
                <span className="text-[#ff4f00] text-sm animate-bounce">🌀</span>
              </h2>
              <p className="text-xs font-mono text-gray-400 tracking-wider">
                IMPRESSION 3D &amp; FIDGETS SENSORIELS
              </p>
            </div>

            {/* Neon Progress Bar & Percentage */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400 truncate max-w-[240px] text-left">
                  {currentStepText}
                </span>
                <span className="font-extrabold text-[#ff4f00] shrink-0">
                  {progress}%
                </span>
              </div>

              {/* Progress bar shell */}
              <div className="w-full h-2 rounded-full bg-white/10 p-0.5 overflow-hidden border border-white/10 shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#2F3CD9] via-[#ff4f00] to-[#FF8800] shadow-[0_0_12px_rgba(255,79,0,0.8)]"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.05 }}
                />
              </div>
            </div>

            {/* Footer Badge */}
            <div className="pt-2">
              <span className="text-[10px] font-black tracking-widest uppercase text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                🌱 PLA BIOSOURCÉ · FABRIQUÉ EN FRANCE 🇫🇷
              </span>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
