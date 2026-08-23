"use client";

import React, { useState, useRef, useEffect } from "react";

export interface CustomSelectOption {
  value: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  showSearch?: boolean;
  className?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Sélectionner...",
  icon,
  showSearch = false,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options if search is enabled
  const filteredOptions = showSearch && searchTerm.trim()
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-11 px-4 text-xs font-bold bg-[#141418] hover:bg-[#1b1b22] border border-white/10 hover:border-white/20 rounded-xl text-white outline-none cursor-pointer flex items-center justify-between gap-3 shadow-lg shadow-black/40 transition-all duration-200 group active:scale-[0.99] min-w-[200px]"
      >
        <div className="flex items-center gap-2.5 truncate">
          {icon && <span className="text-gray-400 group-hover:text-white transition-colors">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedOption?.count !== undefined && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
              {selectedOption.count}
            </span>
          )}
          <svg
            className={`w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-transform duration-200 ${
              isOpen ? "rotate-180 text-white" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-2 w-64 max-h-80 overflow-hidden bg-[#16161a]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col divide-y divide-white/5">
          {/* Optional Search */}
          {showSearch && options.length > 7 && (
            <div className="p-2.5 bg-black/20">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full h-8 px-3 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 outline-none focus:border-white/30"
              />
            </div>
          )}

          {/* Options List */}
          <div className="p-1.5 overflow-y-auto max-h-64 space-y-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-gray-500 italic">
                Aucun résultat
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-gradient-to-r from-[#2F3CD9] to-[#5163FF] text-white font-bold shadow-md shadow-[#2F3CD9]/20"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {opt.icon && <span className="text-sm">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.count !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-white/5 text-gray-400"
                          }`}
                        >
                          {opt.count}
                        </span>
                      )}
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
