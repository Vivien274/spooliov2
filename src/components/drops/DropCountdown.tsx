"use client";

import { useEffect, useState } from "react";
import { DropTheme } from "@/lib/drops";

interface DropCountdownProps {
  targetDate: string;
  className?: string;
  compact?: boolean;
  theme?: DropTheme;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(target: string): TimeRemaining {
  const diff = new Date(target).getTime() - new Date().getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isExpired: false };
}

export default function DropCountdown({ targetDate, className = "", compact = false, theme }: DropCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    setMounted(true);
    setTime(calculateTimeRemaining(targetDate));

    const interval = setInterval(() => {
      setTime(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className={`flex items-center gap-2 opacity-50 ${className}`}>
        <span
          className="text-xs font-mono text-zinc-500"
          style={theme?.subtitleColor ? { color: theme.subtitleColor } : undefined}
        >
          Chargement du compte à rebours...
        </span>
      </div>
    );
  }

  if (time.isExpired) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-black uppercase tracking-wider ${className}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Drop en cours !</span>
      </div>
    );
  }

  const boxBg = theme?.cardBgColor || "white";
  const boxBorder = theme?.borderColor || "rgba(228, 228, 231, 0.9)";
  const textColor = theme?.textColor || "#09090b";
  const labelColor = theme?.subtitleColor || "#a1a1aa";
  const accentColor = theme?.accentColor || "#ff4f00";

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${className}`} style={{ color: textColor }}>
        <span className="px-1.5 py-0.5 rounded border" style={{ backgroundColor: boxBg, borderColor: boxBorder }}>{time.days}j</span>
        <span>:</span>
        <span className="px-1.5 py-0.5 rounded border" style={{ backgroundColor: boxBg, borderColor: boxBorder }}>{String(time.hours).padStart(2, "0")}h</span>
        <span>:</span>
        <span className="px-1.5 py-0.5 rounded border" style={{ backgroundColor: boxBg, borderColor: boxBorder }}>{String(time.minutes).padStart(2, "0")}m</span>
        <span>:</span>
        <span className="px-1.5 py-0.5 rounded border" style={{ backgroundColor: boxBg, borderColor: boxBorder, color: accentColor }}>{String(time.seconds).padStart(2, "0")}s</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      {/* Jours */}
      <div
        className="flex flex-col items-center justify-center min-w-15 sm:min-w-17 p-2 sm:p-2.5 rounded-2xl border shadow-2xs backdrop-blur-xs"
        style={{ backgroundColor: boxBg, borderColor: boxBorder }}
      >
        <span className="text-xl sm:text-2xl font-black font-mono leading-none" style={{ color: textColor }}>
          {time.days}
        </span>
        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: labelColor }}>
          Jours
        </span>
      </div>

      <span className="font-bold text-lg -mt-3" style={{ color: labelColor }}>:</span>

      {/* Heures */}
      <div
        className="flex flex-col items-center justify-center min-w-15 sm:min-w-17 p-2 sm:p-2.5 rounded-2xl border shadow-2xs backdrop-blur-xs"
        style={{ backgroundColor: boxBg, borderColor: boxBorder }}
      >
        <span className="text-xl sm:text-2xl font-black font-mono leading-none" style={{ color: textColor }}>
          {String(time.hours).padStart(2, "0")}
        </span>
        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: labelColor }}>
          Heures
        </span>
      </div>

      <span className="font-bold text-lg -mt-3" style={{ color: labelColor }}>:</span>

      {/* Minutes */}
      <div
        className="flex flex-col items-center justify-center min-w-15 sm:min-w-17 p-2 sm:p-2.5 rounded-2xl border shadow-2xs backdrop-blur-xs"
        style={{ backgroundColor: boxBg, borderColor: boxBorder }}
      >
        <span className="text-xl sm:text-2xl font-black font-mono leading-none" style={{ color: textColor }}>
          {String(time.minutes).padStart(2, "0")}
        </span>
        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: labelColor }}>
          Min
        </span>
      </div>

      <span className="font-bold text-lg -mt-3" style={{ color: labelColor }}>:</span>

      {/* Secondes */}
      <div
        className="flex flex-col items-center justify-center min-w-15 sm:min-w-17 p-2 sm:p-2.5 rounded-2xl border shadow-2xs backdrop-blur-xs"
        style={{ backgroundColor: boxBg, borderColor: accentColor }}
      >
        <span className="text-xl sm:text-2xl font-black font-mono leading-none" style={{ color: accentColor }}>
          {String(time.seconds).padStart(2, "0")}
        </span>
        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: accentColor }}>
          Sec
        </span>
      </div>
    </div>
  );
}
