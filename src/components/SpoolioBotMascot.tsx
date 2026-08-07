"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Heart, Volume2 } from "lucide-react";

const SPEECH_MESSAGES = [
  "Bip Boop ! Salut, je suis Spooly 🤖",
  "Bien joué ! Tu as découvert l'easter egg Spoolio ⚡️",
  "Je fais la patrouille de nuit dans l'atelier 🇫🇷",
  "Psst... Nos fidgets sont 100% bio-sourcés 🌿",
  "Tripoter mes boutons me donne le sourire ! ^_^",
  "Impression 3D à Comines en cours... 🧵",
];

const CONFETTI_COLORS = ["#ff4f00", "#2F3CD9", "#00ffcc", "#ffd700", "#ff66cc"];

export default function SpoolioBotMascot() {
  const [position, setPosition] = useState<{ x: number; y: number; edge: "bottom" | "right" | "top" | "left"; angle: number }>({
    x: 100,
    y: 0,
    edge: "bottom",
    angle: 0,
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [showSpeech, setShowSpeech] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [eyeExpression, setEyeExpression] = useState<"happy" | "blink" | "love" | "star">("happy");
  const [confettiList, setConfettiList] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  const [mounted, setMounted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Check saved session unlock state & setup unlock listeners (keypress "SPOOLIO" + triple click logo)
  useEffect(() => {
    setMounted(true);
    try {
      const saved = sessionStorage.getItem("spoolio_easter_egg_unlocked");
      if (saved === "true") {
        setIsUnlocked(true);
      }
    } catch (e) {}

    const unlockHandler = () => {
      setIsUnlocked(true);
      setShowSpeech(true);
      setIsDancing(true);
      setEyeExpression("star");
      setMsgIndex(1); // "Bien joué ! Tu as découvert l'easter egg Spoolio ⚡️"
      try {
        sessionStorage.setItem("spoolio_easter_egg_unlocked", "true");
      } catch (e) {}
      setTimeout(() => {
        setIsDancing(false);
        setEyeExpression("happy");
      }, 1500);
    };

    // 1. Custom event listener (triple-click logo)
    window.addEventListener("unlock-spooly", unlockHandler);

    // 2. Secret keyboard listener ("spoolio" sequence)
    let typedBuffer = "";
    const keyHandler = (e: KeyboardEvent) => {
      // Ignore when typing inside input fields
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      typedBuffer += e.key.toLowerCase();
      if (typedBuffer.length > 20) typedBuffer = typedBuffer.slice(-20);
      if (typedBuffer.endsWith("spoolio")) {
        unlockHandler();
      }
    };

    window.addEventListener("keydown", keyHandler);

    return () => {
      window.removeEventListener("unlock-spooly", unlockHandler);
      window.removeEventListener("keydown", keyHandler);
    };
  }, []);

  // Patrol animation loop along screen boundaries
  useEffect(() => {
    if (isHovered || isDancing || isMinimized) return;

    const interval = setInterval(() => {
      setPosition((prev) => {
        const margin = 24;
        const w = typeof window !== "undefined" ? window.innerWidth - margin * 2 : 1200;
        const h = typeof window !== "undefined" ? window.innerHeight - margin * 2 : 800;
        const step = 2.5;

        let { x, y, edge, angle } = prev;

        if (edge === "bottom") {
          x += step;
          angle = 0;
          if (x >= w) {
            x = w;
            edge = "right";
          }
        } else if (edge === "right") {
          y += step;
          angle = -90;
          if (y >= h) {
            y = h;
            edge = "top";
          }
        } else if (edge === "top") {
          x -= step;
          angle = 180;
          if (x <= 0) {
            x = 0;
            edge = "left";
          }
        } else if (edge === "left") {
          y -= step;
          angle = 90;
          if (y <= 0) {
            y = 0;
            edge = "bottom";
          }
        }

        return { x, y, edge, angle };
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isHovered, isDancing, isMinimized]);

  // Periodic eye blinking and occasional pop-up speech bubble (3.5s popup every 15s)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeExpression("blink");
      setTimeout(() => setEyeExpression("happy"), 300);
    }, 4500);

    const speechTimer = setInterval(() => {
      if (!isHovered && !isDancing) {
        setMsgIndex((prev) => (prev + 1) % SPEECH_MESSAGES.length);
        setShowSpeech(true);
        setTimeout(() => {
          setShowSpeech(false);
        }, 3500);
      }
    }, 15000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(speechTimer);
    };
  }, [isHovered, isDancing]);

  const handleBotClick = () => {
    setIsDancing(true);
    setEyeExpression("star");
    setMsgIndex((prev) => (prev + 1) % SPEECH_MESSAGES.length);

    // Spawn mini celebratory confetti burst
    const newConfetti = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 80,
      y: (Math.random() - 0.5) * 80 - 40,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    }));
    setConfettiList(newConfetti);

    setTimeout(() => {
      setIsDancing(false);
      setEyeExpression("happy");
      setConfettiList([]);
    }, 1200);
  };

  if (!mounted || !isUnlocked) return null;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 left-4 z-[99999] bg-[#16161f]/95 hover:bg-[#ff4f00] border border-[#ff4f00]/40 text-white px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold font-mono transition-all hover:scale-110 cursor-pointer backdrop-blur-md shadow-[#ff4f00]/20"
        title="Rappeler Spooly Robot 🤖"
      >
        <span className="animate-bounce">🤖</span>
        <span>Spooly</span>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[99998] overflow-hidden"
      aria-label="Spoolio Mascot Easter Egg"
    >
      {/* Moving Mascot Container */}
      <div
        className="absolute pointer-events-auto transition-transform duration-75 ease-linear cursor-pointer group select-none"
        style={{
          left: `${position.x}px`,
          bottom: `${position.y}px`,
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          setEyeExpression("love");
          setShowSpeech(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setEyeExpression("happy");
          setShowSpeech(false);
        }}
        onClick={() => {
          setShowSpeech(true);
          handleBotClick();
        }}
      >
        {/* Confetti Particles */}
        <AnimatePresence>
          {confettiList.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={{ opacity: 0, scale: 0, x: c.x, y: c.y }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute w-2.5 h-2.5 rounded-full pointer-events-none"
              style={{ backgroundColor: c.color, top: "-10px", left: "20px" }}
            />
          ))}
        </AnimatePresence>

        {/* Speech Bubble */}
        <AnimatePresence>
          {showSpeech && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`absolute whitespace-nowrap bg-[#13131a]/95 border border-[#ff4f00]/40 text-white text-[11px] font-bold px-3.5 py-2 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 font-sans z-30 shadow-[#ff4f00]/20 ${
                position.edge === "bottom"
                  ? "bottom-20 left-1/2 -translate-x-1/2"
                  : position.edge === "right"
                  ? "right-20 top-1/2 -translate-y-1/2"
                  : position.edge === "top"
                  ? "top-20 left-1/2 -translate-x-1/2"
                  : "left-20 top-1/2 -translate-y-1/2"
              }`}
            >
              <span>{SPEECH_MESSAGES[msgIndex]}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                }}
                className="w-4 h-4 rounded-full bg-white/10 hover:bg-red-500 hover:text-white text-gray-400 flex items-center justify-center transition-colors cursor-pointer ml-1"
                title="Masquer Spooly"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🤖 Cute 3D-Style Spoolio Mascot SVG Robot Body */}
        <motion.div
          animate={
            isDancing
              ? { rotate: [0, -20, 360, 0], scale: [1, 1.2, 1] }
              : { rotate: position.angle, y: isHovered ? [0, -4, 0] : [0, -2, 0] }
          }
          transition={{
            rotate: { duration: 0.4, ease: "easeInOut" },
            y: { repeat: Infinity, duration: isHovered ? 0.4 : 1.2, ease: "easeInOut" },
          }}
          className="relative w-14 h-16 flex flex-col items-center justify-center origin-center"
        >
          {/* Antenna with Pulsing Glow */}
          <div className="relative flex flex-col items-center -mb-1 z-10">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff4f00] shadow-[0_0_12px_#ff4f00] animate-pulse" />
            <div className="w-0.5 h-2 bg-gray-400" />
          </div>

          {/* Robot Head */}
          <div className="w-12 h-9 rounded-2xl bg-gradient-to-b from-[#2A2A36] to-[#121218] border-2 border-white/20 shadow-xl flex items-center justify-center relative overflow-hidden">
            {/* Screen Visor */}
            <div className="w-9 h-6 rounded-xl bg-black/90 border border-cyan-500/30 flex items-center justify-center gap-1.5 px-1 shadow-inner relative">
              {/* LED Eyes */}
              {eyeExpression === "blink" ? (
                <div className="w-full flex items-center justify-center gap-2 text-cyan-400 font-mono font-black text-xs">
                  - -
                </div>
              ) : eyeExpression === "love" ? (
                <div className="w-full flex items-center justify-center gap-1.5 text-pink-400 font-black text-xs">
                  ♥ ♥
                </div>
              ) : eyeExpression === "star" ? (
                <div className="w-full flex items-center justify-center gap-1 text-amber-300 font-black text-xs">
                  ★ ★
                </div>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse" />
                </>
              )}
            </div>
          </div>

          {/* Robot Body with Spool Core */}
          <div className="w-10 h-7 rounded-xl bg-gradient-to-b from-[#ff4f00] via-[#d03d00] to-[#992d00] border border-white/20 shadow-lg flex items-center justify-center relative mt-0.5">
            {/* Spinning Spool Core */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white flex items-center justify-center"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
            </motion.div>
          </div>

          {/* Robot Legs / Jetpack Glow */}
          <div className="flex items-center gap-3 -mt-0.5">
            <motion.div
              animate={isHovered ? { height: [4, 7, 4] } : { height: [5, 3, 5] }}
              transition={{ repeat: Infinity, duration: 0.3 }}
              className="w-2.5 bg-gradient-to-b from-cyan-400 to-transparent rounded-b-md shadow-[0_4px_10px_#00f0ff]"
            />
            <motion.div
              animate={isHovered ? { height: [4, 7, 4] } : { height: [3, 5, 3] }}
              transition={{ repeat: Infinity, duration: 0.3, delay: 0.15 }}
              className="w-2.5 bg-gradient-to-b from-cyan-400 to-transparent rounded-b-md shadow-[0_4px_10px_#00f0ff]"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
