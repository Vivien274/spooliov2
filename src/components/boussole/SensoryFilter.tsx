'use client';

import React from 'react';
import { Keyboard, Infinity as InfinityIcon, Puzzle, Waves } from 'lucide-react';
import { SensoryCategory } from '@/types/boussole';

interface FilterOption {
  category: SensoryCategory;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  activeColorClass: string;
  shadowClass: string;
}

const filterOptions: FilterOption[] = [
  {
    category: 'cliquer',
    label: 'Cliquer en boucle',
    description: 'Bruits mécaniques, résistance physique',
    icon: Keyboard,
    colorClass: 'border-zinc-200/90 hover:border-[#ff4f00] hover:text-[#ff4f00] text-zinc-900',
    activeColorClass: 'border-[#ff4f00] text-[#ff4f00] bg-white ring-2 ring-[#ff4f00]/20',
    shadowClass: 'shadow-md shadow-[#ff4f00]/10',
  },
  {
    category: 'manipuler',
    label: 'Manipuler à l\'infini',
    description: 'Objets articulés, mouvements fluides',
    icon: InfinityIcon,
    colorClass: 'border-zinc-200/90 hover:border-pink-500 hover:text-pink-600 text-zinc-900',
    activeColorClass: 'border-pink-500 text-pink-600 bg-white ring-2 ring-pink-500/20',
    shadowClass: 'shadow-md shadow-pink-500/10',
  },
  {
    category: 'resoudre',
    label: 'Résoudre un défi',
    description: 'Mécanismes complexes, boîtes secrètes',
    icon: Puzzle,
    colorClass: 'border-zinc-200/90 hover:border-emerald-600 hover:text-emerald-700 text-zinc-900',
    activeColorClass: 'border-emerald-600 text-emerald-700 bg-white ring-2 ring-emerald-600/20',
    shadowClass: 'shadow-md shadow-emerald-500/10',
  },
  {
    category: 'caresser',
    label: 'Caresser une texture',
    description: 'Surfaces ondulées, douces ou rugueuses',
    icon: Waves,
    colorClass: 'border-zinc-200/90 hover:border-amber-500 hover:text-amber-600 text-zinc-900',
    activeColorClass: 'border-amber-500 text-amber-600 bg-white ring-2 ring-amber-500/20',
    shadowClass: 'shadow-md shadow-amber-500/10',
  },
];

interface SensoryFilterProps {
  selectedCategory: SensoryCategory | null;
  onSelectCategory: (category: SensoryCategory | null) => void;
}

export default function SensoryFilter({
  selectedCategory,
  onSelectCategory,
}: SensoryFilterProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filterOptions.map((option) => {
          const Icon = option.icon;
          const isActive = selectedCategory === option.category;

          return (
            <button
              key={option.category}
              onClick={() => onSelectCategory(isActive ? null : option.category)}
              aria-pressed={isActive}
              className={`
                group relative flex flex-col items-center justify-between p-6 rounded-3xl border-2 text-center
                bg-white transition-all duration-300 ease-out cursor-pointer select-none
                outline-hidden focus-visible:ring-3 focus-visible:ring-[#ff4f00]
                active:scale-95 sm:hover:-translate-y-1 shadow-xs hover:shadow-md text-zinc-900
                ${isActive ? `${option.activeColorClass} ${option.shadowClass}` : option.colorClass}
              `}
            >
              {/* Top Picto Container */}
              <div className="flex items-center justify-center mb-3">
                <div
                  className={`
                    p-3.5 rounded-2xl border transition-all duration-300
                    ${isActive ? 'bg-transparent border-current scale-110' : 'bg-zinc-50 border-zinc-200 group-hover:border-current group-hover:scale-110'}
                  `}
                >
                  <Icon className="w-10 h-10 stroke-[1.75]" />
                </div>
              </div>

              {/* Text content */}
              <div className="flex flex-col items-center mt-1">
                <h3 className="font-bold text-base sm:text-lg tracking-tight font-outfit text-zinc-950 group-hover:scale-[1.02] transition-transform duration-200">
                  {option.label}
                </h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-sans">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {selectedCategory && (
        <div className="flex justify-center mt-6 animate-fade-in">
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors py-2 px-5 rounded-full bg-white border border-zinc-200 shadow-xs cursor-pointer"
          >
            × Réinitialiser le filtre (Voir tout)
          </button>
        </div>
      )}
    </div>
  );
}
