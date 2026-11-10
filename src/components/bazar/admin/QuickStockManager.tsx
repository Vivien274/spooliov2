"use client";

import React, { useState } from "react";
import { BazarItem } from "@/types/bazar";
import { formatPrice, getConditionBadgeStyle, getConditionLabel } from "@/lib/bazar/coordinates";
import { Plus, Minus, CheckCircle, Search, Filter } from "lucide-react";

interface QuickStockManagerProps {
  items: BazarItem[];
  onAdjustStock: (itemId: string, delta: number) => Promise<void>;
  onToggleSold: (itemId: string) => Promise<void>;
}

export const QuickStockManager: React.FC<QuickStockManagerProps> = ({
  items,
  onAdjustStock,
  onToggleSold,
}) => {
  const [search, setSearch] = useState("");
  const [filterCondition, setFilterCondition] = useState<string>("all");

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCond = filterCondition === "all" || item.condition === filterCondition;
    return matchesSearch && matchesCond;
  });

  return (
    <div className="bg-white rounded-3xl border border-[#E4E4E0] shadow-xs overflow-hidden">
      {/* Top Filter Bar */}
      <div className="p-5 border-b border-[#E4E4E0] bg-[#FAF9F6] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[#121212]">
            Gestion rapide des stocks (Retour de braderie)
          </h2>
          <p className="text-xs text-neutral-500">
            Ajustez directement les quantités d&apos;un clic après une vente physique sur un stand.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Rechercher un objet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-[#E4E4E0] text-xs bg-white text-[#121212] focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none"
            />
          </div>

          {/* Condition filter */}
          <select
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E4E4E0] text-xs bg-white text-neutral-700 outline-none"
          >
            <option value="all">Tous les types</option>
            <option value="end_of_series">Fin de série</option>
            <option value="prototype">Prototype</option>
            <option value="color_test">Essai couleur</option>
            <option value="minor_defect">Petit défaut</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E4E4E0] bg-neutral-50/50 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-5">Objet</th>
              <th className="py-3 px-4">Condition</th>
              <th className="py-3 px-4 text-right">Prix</th>
              <th className="py-3 px-4 text-center">Stock</th>
              <th className="py-3 px-5 text-right">Actions rapides</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E4E0]">
            {filteredItems.map((item) => {
              const isSold = item.status === "sold" || item.quantity <= 0;
              const badge = getConditionBadgeStyle(item.condition);

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-neutral-50/80 transition-colors ${
                    isSold ? "opacity-60 bg-neutral-50/40" : ""
                  }`}
                >
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-[#121212] text-sm">{item.name}</div>
                    {item.description && (
                      <div className="text-[11px] text-neutral-500 truncate max-w-sm mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {getConditionLabel(item.condition)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-extrabold text-sm text-[#FF5500]">
                    {formatPrice(item.priceCents)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg font-bold text-xs ${
                        isSold
                          ? "bg-neutral-200 text-neutral-600"
                          : item.quantity === 1
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {item.quantity}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onAdjustStock(item.id, -1)}
                        disabled={item.quantity <= 0}
                        title="Vendu 1 pièce (-1)"
                        className="px-2.5 py-1.5 rounded-xl border border-[#E4E4E0] hover:bg-neutral-100 text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs transition-colors cursor-pointer"
                      >
                        -1
                      </button>

                      <button
                        onClick={() => onAdjustStock(item.id, 1)}
                        title="Ajouter du stock (+1)"
                        className="px-2.5 py-1.5 rounded-xl border border-[#E4E4E0] hover:bg-neutral-100 text-neutral-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        +1
                      </button>

                      <button
                        onClick={() => onToggleSold(item.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                          isSold
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {isSold ? "Remettre en vente" : "Marquer vendu"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-neutral-400">
                  Aucun objet correspondant trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

