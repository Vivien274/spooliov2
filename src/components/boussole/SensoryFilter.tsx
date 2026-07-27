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
    colorClass: 'hover:border-blue-500 hover:text-blue-400 border-neutral-800',
    activeColorClass: 'border-blue-500 text-blue-400 bg-blue-500/10 ring-2 ring-blue-500/50',
    shadowClass: 'shadow-[0_0_15px_rgba(0,85,255,0.25)]',
  },
  {
    category: 'manipuler',
    label: 'Manipuler à l\'infini',
    description: 'Objets articulés, mouvements fluides',
    icon: InfinityIcon,
    colorClass: 'hover:border-pink-500 hover:text-pink-400 border-neutral-800',
    activeColorClass: 'border-pink-500 text-pink-400 bg-pink-500/10 ring-2 ring-pink-500/50',
    shadowClass: 'shadow-[0_0_15px_rgba(255,0,122,0.25)]',
  },
  {
    category: 'resoudre',
    label: 'Résoudre un défi',
    description: 'Mécanismes complexes, boîtes secrètes',
    icon: Puzzle,
    colorClass: 'hover:border-emerald-500 hover:text-emerald-400 border-neutral-800',
    activeColorClass: 'border-emerald-500 text-emerald-400 bg-emerald-500/10 ring-2 ring-emerald-500/50',
    shadowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
  },
  {
    category: 'caresser',
    label: 'Caresser une texture',
    description: 'Surfaces ondulées, douces ou rugueuses',
    icon: Waves,
    colorClass: 'hover:border-amber-400 hover:text-amber-300 border-neutral-800',
    activeColorClass: 'border-amber-400 text-amber-300 bg-amber-400/10 ring-2 ring-amber-400/50',
    shadowClass: 'shadow-[0_0_15px_rgba(255,230,0,0.25)]',
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
                bg-white dark:bg-[#131316] transition-all duration-300 ease-out cursor-pointer select-none
                outline-hidden focus-visible:ring-3 focus-visible:ring-blue-500
                active:scale-95 sm:hover:-translate-y-1 text-neutral-900 dark:text-white
                ${isActive ? `${option.activeColorClass} ${option.shadowClass}` : option.colorClass}
              `}
            >
              {/* Top Picto Container (Enlarged 2x) */}
              <div className="flex items-center justify-center mb-3">
                <div
                  className={`
                    p-3.5 rounded-2xl border transition-all duration-300
                    ${isActive ? 'bg-transparent border-current scale-110' : 'bg-neutral-100 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 group-hover:border-current group-hover:scale-110'}
                  `}
                >
                  <Icon className="w-10 h-10 stroke-[1.75]" />
                </div>
              </div>

              {/* Text content */}
              <div className="flex flex-col items-center mt-1">
                <h3 className="font-bold text-base sm:text-lg tracking-wide group-hover:scale-[1.02] transition-transform duration-200">
                  {option.label}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
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
            className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:underline transition-colors py-2 px-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
          >
            × Réinitialiser le filtre (Voir tout)
          </button>
        </div>
      )}
    </div>
  );
}
