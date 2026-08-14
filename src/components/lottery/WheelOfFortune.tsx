"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { RefreshCw, Gift, Copy, Check, X, Tag } from "lucide-react";
import { LotteryPrizeItem, spinWheelAction } from "@/app/actions/lotteryActions";

interface WheelOfFortuneProps {
  prizes: LotteryPrizeItem[];
  onSpinComplete?: (prize: LotteryPrizeItem) => void;
  isAdminPreview?: boolean;
}

export default function WheelOfFortune({
  prizes,
  onSpinComplete,
  isAdminPreview = false,
}: WheelOfFortuneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const [wonPrize, setWonPrize] = useState<LotteryPrizeItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio Context for click ticks
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTickSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      if (audioCtxRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, audioCtxRef.current.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, audioCtxRef.current.currentTime + 0.03);
        gain.gain.setValueAtTime(0.12, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.035);
      }
    } catch (e) {
      // Audio not supported or blocked
    }
  }, []);

  // Draw the Wheel on Canvas with HiDPI crispness and non-inverted upright text
  const drawWheel = useCallback(
    (rotationAngleDegrees: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const numSegments = prizes.length;
      if (numSegments === 0) return;

      // Handle HiDPI Crispness (Retina displays)
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = 380;
      const displayHeight = 380;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      const centerX = displayWidth / 2;
      const centerY = displayHeight / 2;
      const outerRadius = Math.min(centerX, centerY) - 14; // 176px
      const innerRadius = 40; // Center hub radius

      const segmentAngle = (2 * Math.PI) / numSegments;
      const rotationAngleRad = (rotationAngleDegrees * Math.PI) / 180;

      // 1. Outer rim glowing background
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#12121B";
      ctx.shadowColor = "#FF5500";
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "rgba(255, 85, 0, 0.7)";
      ctx.stroke();
      ctx.restore();

      // 2. Draw Wheel Segments
      for (let i = 0; i < numSegments; i++) {
        const prize = prizes[i];
        // Start angle offset by rotationAngleRad - 90deg (so segment 0 top)
        const startAngle = i * segmentAngle + rotationAngleRad - Math.PI / 2;
        const endAngle = startAngle + segmentAngle;

        // Draw Slice Arc
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = prize.color || "#FF5500";
        ctx.fill();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.stroke();

        // 3. Draw Text & Icon (Rotated & flipped when in bottom half so text is ALWAYS upright!)
        ctx.save();
        ctx.translate(centerX, centerY);

        const midAngle = startAngle + segmentAngle / 2;
        // Normalize midAngle between 0 and 2*Math.PI
        const normAngle = ((midAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const isBottomHalf = normAngle > Math.PI / 2 && normAngle < (3 * Math.PI) / 2;

        ctx.rotate(midAngle);

        if (isBottomHalf) {
          // Flip 180° so text reads upright from inner edge towards outer rim
          ctx.rotate(Math.PI);
          ctx.textBaseline = "middle";

          // Icon near outer rim
          ctx.font = "bold 15px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(prize.icon || "🎁", -(outerRadius - 16), 0);

          // Title text (positioned further towards outer rim to leave gap from central hub)
          ctx.font = "bold 11px Inter, system-ui, sans-serif";
          ctx.fillStyle = prize.textColor || "#FFFFFF";
          ctx.textAlign = "left";

          let title = prize.title;
          const maxTextWidth = 72; // Strict max width to guarantee gap from central disk
          if (ctx.measureText(title).width > maxTextWidth) {
            if (title.length > 16) title = title.substring(0, 14) + "..";
          }
          ctx.fillText(title, -(outerRadius - 30), 0);
        } else {
          // Top half: text reads from outer rim inwards
          ctx.textBaseline = "middle";

          // Icon near outer rim
          ctx.font = "bold 15px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(prize.icon || "🎁", outerRadius - 16, 0);

          // Title text (positioned further towards outer rim to leave gap from central hub)
          ctx.font = "bold 11px Inter, system-ui, sans-serif";
          ctx.fillStyle = prize.textColor || "#FFFFFF";
          ctx.textAlign = "right";

          let title = prize.title;
          const maxTextWidth = 72; // Strict max width to guarantee gap from central disk
          if (ctx.measureText(title).width > maxTextWidth) {
            if (title.length > 16) title = title.substring(0, 14) + "..";
          }
          ctx.fillText(title, outerRadius - 30, 0);
        }

        ctx.restore();
      }

      // 4. Draw Rim Peg Dots
      for (let i = 0; i < numSegments * 2; i++) {
        const pegAngle = (i * Math.PI) / numSegments + rotationAngleRad - Math.PI / 2;
        const pegX = centerX + Math.cos(pegAngle) * (outerRadius + 3);
        const pegY = centerY + Math.sin(pegAngle) * (outerRadius + 3);

        ctx.beginPath();
        ctx.arc(pegX, pegY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#FFF";
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 5. Draw Center Hub Circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
      const gradient = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, innerRadius);
      gradient.addColorStop(0, "#282836");
      gradient.addColorStop(1, "#0A0A10");
      ctx.fillStyle = gradient;
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "#FF5500";
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#FF5500";
      ctx.font = "900 13px Inter, sans-serif";
      ctx.fillText("SPOOLIO", centerX, centerY - 6);
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("LOTERIE", centerX, centerY + 7);
      ctx.restore();

      ctx.restore();
    },
    [prizes]
  );

  useEffect(() => {
    drawWheel(currentRotation);
  }, [drawWheel, currentRotation]);

  // Direct Spin Action on Click
  const handleSpin = async () => {
    if (isSpinning || prizes.length === 0) return;

    setErrorMessage(null);
    setWonPrize(null);

    let winningIndex = 0;
    let winningPrize = prizes[0];

    if (isAdminPreview) {
      winningIndex = Math.floor(Math.random() * prizes.length);
      winningPrize = prizes[winningIndex];
    } else {
      setIsSpinning(true);
      const res = await spinWheelAction();
      if (!res.success || res.winningIndex === undefined || !res.winningPrize) {
        setIsSpinning(false);
        setErrorMessage(res.error || "Erreur lors du lancer de la roue.");
        return;
      }
      winningIndex = res.winningIndex;
      winningPrize = res.winningPrize;
    }

    setIsSpinning(true);

    const numSegments = prizes.length;
    const segmentDegree = 360 / numSegments;
    const targetSegmentCenterDeg = (winningIndex + 0.5) * segmentDegree;
    const baseTargetDeg = 360 - targetSegmentCenterDeg;

    const totalExtraRotations = 360 * 6;
    const finalRotation = currentRotation + totalExtraRotations + (baseTargetDeg - (currentRotation % 360));

    const durationMs = 4500;
    const startTime = performance.now();
    let lastTickSegment = -1;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 4);
      const animatedRotation = currentRotation + (finalRotation - currentRotation) * easeOutProgress;

      setCurrentRotation(animatedRotation);
      drawWheel(animatedRotation);

      const currentNormDeg = (animatedRotation % 360 + 360) % 360;
      const currentSegIdx = Math.floor(currentNormDeg / segmentDegree);
      if (currentSegIdx !== lastTickSegment) {
        lastTickSegment = currentSegIdx;
        playTickSound();
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setWonPrize(winningPrize);
        if (onSpinComplete) onSpinComplete(winningPrize);

        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: [winningPrize.color, "#FF5500", "#FFD700", "#3B82F6"],
        });
      }
    };

    requestAnimationFrame(animate);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    try {
      localStorage.setItem("spoolio_active_promo_code", code);
    } catch (e) {}
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleUsePrizeInCart = (code?: string | null) => {
    if (code) {
      try {
        localStorage.setItem("spoolio_active_promo_code", code);
      } catch (e) {}
    }
    setWonPrize(null);
    window.location.href = "/boutique";
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4 select-none">
      {/* Top Pointer Indicator */}
      <div className="relative z-20 -mb-6 flex flex-col items-center">
        <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-[#FF5500] filter drop-shadow-[0_4px_12px_rgba(255,85,0,0.8)] animate-pulse" />
      </div>

      {/* Canvas Container */}
      <div className="relative p-2 rounded-full bg-gradient-to-b from-[#1E1E28] to-[#0A0A10] border border-white/10 shadow-2xl">
        <canvas
          ref={canvasRef}
          className="w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] rounded-full"
        />

        {/* Center Spin Button Overlay */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || prizes.length === 0}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#FF5500] to-[#D94400] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(255,85,0,0.6)] border-2 border-white/40 flex flex-col items-center justify-center gap-1 transition-all duration-300 transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 z-30 ${
            isSpinning ? "animate-pulse" : "hover:shadow-[0_0_35px_rgba(255,85,0,0.9)]"
          }`}
        >
          <RefreshCw className={`w-5 h-5 ${isSpinning ? "animate-spin" : ""}`} />
          <span>{isSpinning ? "Tirage..." : "TOURNER !"}</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Victory Prize Modal */}
      {wonPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#181824] to-[#0E0E16] border border-[#FF5500]/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-white text-center space-y-6">
            <button
              onClick={() => setWonPrize(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Banner */}
            <div
              className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-xl border-2 animate-bounce"
              style={{
                backgroundColor: `${wonPrize.color}25`,
                borderColor: wonPrize.color,
              }}
            >
              {wonPrize.icon}
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-mono font-black tracking-widest text-[#FF5500]">
                🎉 BRAVO ! VOUS AVEZ GAGNÉ 🎉
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{wonPrize.title}</h2>
              {wonPrize.subtitle && (
                <p className="text-sm text-neutral-300">{wonPrize.subtitle}</p>
              )}
            </div>

            {/* Coupon Code Section */}
            {wonPrize.couponCode ? (
              <div className="p-4 rounded-2xl bg-[#0A0A10] border border-white/10 space-y-2">
                <span className="text-xs text-neutral-400 font-medium flex items-center justify-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#FF5500]" />
                  Votre code promo à appliquer au panier :
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xl font-extrabold text-amber-400 bg-amber-400/10 px-4 py-2 rounded-xl border border-amber-400/30 tracking-wider">
                    {wonPrize.couponCode}
                  </span>
                  <button
                    onClick={() => handleCopyCode(wonPrize.couponCode!)}
                    className="p-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF6600] text-white transition-all cursor-pointer shadow-lg shadow-[#FF5500]/25"
                    title="Copier le code"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copiedCode && (
                  <p className="text-[11px] text-emerald-400 font-semibold">Code copié ! Vous pouvez l'utiliser sur votre panier.</p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#0A0A10] border border-white/10 text-xs text-neutral-400">
                Profitez de votre avantage directement lors de votre commande !
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => handleUsePrizeInCart(wonPrize.couponCode)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF7700] hover:from-[#FF6600] hover:to-[#FF8800] text-white font-bold text-xs shadow-lg shadow-[#FF5500]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Gift className="w-4 h-4" />
                Copier & Aller à la Boutique 🛍️
              </button>
              <button
                onClick={() => setWonPrize(null)}
                className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
