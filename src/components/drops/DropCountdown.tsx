"use client";

import { useEffect, useState } from "react";

interface DropCountdownProps {
  targetDate: string;
  className?: string;
  compact?: boolean;
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

export default function DropCountdown({ targetDate, className = "", compact = false }: DropCountdownProps) {
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
        <span className="text-xs font-mono text-zinc-500">Chargement du compte à rebours...</span>
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

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-800 ${className}`}>
        <span className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200">{time.days}j</span>
        <span>:</span>
        <span className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200">{String(time.hours).padStart(2, "0")}h</span>
        <span>:</span>
        <span className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200">{String(time.minutes).padStart(2, "0")}m</span>
        <span>:</span>
        <span className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[#ff4f00]">{String(time.seconds).padStart(2, "0")}s</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      {/* Jours */}
      <div className="flex flex-col items-center justify-center min-w-15 sm:min-w-17 p-2 sm:p-2.5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs">
        <span className="text-xl sm:text-2xl font-black text-zinc-950 font-mono leading-none">
          {time.days}
        </span>
        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 tracking-wider mt-1">
          Jours
        </span>
      </div>

      <span className="text-zinc-400 font-bold text-lg -mt-3">:</span>

      {/* Heures */}
      <div className="flex flex-col items-center justify-center min-w-15 sm:min-w-17 p-2 sm:p-2.5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs">
        <span className="text-xl sm:text-2xl font-black text-zinc-950 font-mono leading-none">
          {String(time.hours).padStart(2, "0")}
        </span>
        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 tracking-wider mt-1">
          Heures
        </span>
      </div>

      <span className="text-zinc-400 font-bold text-lg -mt-3">:</span>

      {/* Minutes */}
      <div className="flex flex-col items-center justify-center min-w-15 sm:min-w-17 p-2 sm:p-2.5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs">
        <span className="text-xl sm:text-2xl font-black text-zinc-950 font-mono leading-none">
          {String(time.minutes).padStart(2, "0")}
        </span>
        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 tracking-wider mt-1">
          Min
        </span>
      </div>

      <span className="text-zinc-400 font-bold text-lg -mt-3">:</span>

      {/* Secondes */}
      <div className="flex flex-col items-center justify-center min-w-15 sm:min-w-17 p-2 sm:p-2.5 rounded-2xl bg-[#ff4f00]/5 border border-[#ff4f00]/25 shadow-2xs">
        <span className="text-xl sm:text-2xl font-black text-[#ff4f00] font-mono leading-none">
          {String(time.seconds).padStart(2, "0")}
        </span>
        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#ff4f00] tracking-wider mt-1">
          Sec
        </span>
      </div>
    </div>
  );
}
