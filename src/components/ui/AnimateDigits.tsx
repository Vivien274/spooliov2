"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimateDigitsProps {
  value: number;
  className?: string;
  currencySymbol?: string;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function DigitColumn({ digit }: { digit: number }) {
  return (
    <div className="relative h-[1.15em] w-[0.62em] overflow-hidden inline-block align-baseline select-none">
      <motion.div
        animate={{ y: `-${digit * 10}%` }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="absolute top-0 left-0 w-full flex flex-col items-center"
      >
        {DIGITS.map((d) => (
          <span key={d} className="h-[1.15em] flex items-center justify-center font-black">
            {d}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function AnimateDigits({
  value,
  className = "",
  currencySymbol = "€"
}: AnimateDigitsProps) {
  const formatted = (Number(value) || 0).toFixed(2);
  const parts = formatted.split("");

  return (
    <div className={`inline-flex items-baseline gap-0.5 tracking-tight font-black ${className}`}>
      {parts.map((char, index) => {
        if (char === "." || char === ",") {
          return (
            <span key={`sep-${index}`} className="opacity-80 px-[1px]">
              ,
            </span>
          );
        }

        const numericDigit = parseInt(char, 10);
        if (isNaN(numericDigit)) {
          return <span key={`char-${index}`}>{char}</span>;
        }

        return <DigitColumn key={`pos-${index}`} digit={numericDigit} />;
      })}
      {currencySymbol && (
        <span className="ml-1 text-[0.85em] font-extrabold text-[#ff4f00]">
          {currencySymbol}
        </span>
      )}
    </div>
  );
}
