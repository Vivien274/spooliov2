"use client";

import React, { useState } from "react";
import { parseItemName } from "@/lib/orderUtils";
import { parseClickerOptions } from "@/components/OrderItemOptionsViewer";

interface OrderItem {
  name: string;
  quantity: number;
  price?: number | string;
}

interface Order {
  id: string;
  status: string;
  customerName?: string | null;
  createdAt: string | Date;
  items?: any;
  archived?: boolean;
  [key: string]: any;
}

interface ColorBatchData {
  colorName: string;
  casesCount: number;
  keycapsCount: number;
  standardsCount: number;
  totalPieces: number;
  casesList: { shape: string; orderId: string; qty: number }[];
  keycapsDetails: { label: string; qty: number; orderId: string }[];
  standardsList: { name: string; qty: number; orderId: string }[];
}

// Color Swatch Hex Helper for UI
function getFilamentColorHex(colorName: string): { bg: string; text: string; border: string } {
  const lower = colorName.toLowerCase();
  if (lower.includes("rose") || lower.includes("pink")) return { bg: "#ec4899", text: "#fff", border: "#f472b6" };
  if (lower.includes("vert") || lower.includes("green")) return { bg: "#22c55e", text: "#fff", border: "#4ade80" };
  if (lower.includes("violet") || lower.includes("purple")) return { bg: "#8b5cf6", text: "#fff", border: "#a78bfa" };
  if (lower.includes("bleu") || lower.includes("blue")) return { bg: "#3b82f6", text: "#fff", border: "#60a5fa" };
  if (lower.includes("jaune") || lower.includes("yellow")) return { bg: "#eab308", text: "#000", border: "#fde047" };
  if (lower.includes("orange")) return { bg: "#f97316", text: "#fff", border: "#fb923c" };
  if (lower.includes("rouge") || lower.includes("red")) return { bg: "#ef4444", text: "#fff", border: "#f87171" };
  if (lower.includes("noir") || lower.includes("black")) return { bg: "#1e293b", text: "#fff", border: "#475569" };
  if (lower.includes("blanc") || lower.includes("white")) return { bg: "#f8fafc", text: "#0f172a", border: "#cbd5e1" };
  if (lower.includes("arc en ciel") || lower.includes("rainbow")) return { bg: "linear-gradient(135deg, #f43f5e, #eab308, #10b981, #3b82f6)", text: "#fff", border: "#f43f5e" };
  return { bg: "#ea580c", text: "#fff", border: "#fb923c" };
}

export default function ProductionColorBatcher({ orders = [] }: { orders: Order[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("active");

  // 1. Filter Orders
  const filteredOrders = orders.filter((o) => {
    if (o.archived) return false;
    if (statusFilter === "active") return o.status === "attente_impression" || o.status === "impression";
    if (statusFilter === "attente") return o.status === "attente_impression";
    if (statusFilter === "impression") return o.status === "impression";
    return true; // "all"
  });

  // 2. Aggregate by Filament Color
  const colorMap = new Map<string, ColorBatchData>();

  function addColorItem(color: string, type: "case" | "keycap" | "standard", detail: any) {
    const colorKey = color ? color.trim() : "Non spécifié / Standard";
    
    if (!colorMap.has(colorKey)) {
      colorMap.set(colorKey, {
        colorName: colorKey,
        casesCount: 0,
        keycapsCount: 0,
        standardsCount: 0,
        totalPieces: 0,
        casesList: [],
        keycapsDetails: [],
        standardsList: [],
      });
    }

    const entry = colorMap.get(colorKey)!;
    if (type === "case") {
      entry.casesCount += detail.qty;
      entry.casesList.push(detail);
    } else if (type === "keycap") {
      entry.keycapsCount += detail.qty;
      entry.keycapsDetails.push(detail);
    } else {
      entry.standardsCount += detail.qty;
      entry.standardsList.push(detail);
    }
    entry.totalPieces += detail.qty;
  }

  filteredOrders.forEach((o) => {
    let itemList: OrderItem[] = [];
    if (typeof o.items === "string") {
      try {
        itemList = JSON.parse(o.items || "[]");
      } catch (e) {
        itemList = [];
      }
    } else if (Array.isArray(o.items)) {
      itemList = o.items;
    }

    itemList.forEach((item) => {
      const qty = item.quantity || 1;
      const { mainName, options } = parseItemName(item.name);
      const { specs, keys } = parseClickerOptions(options);

      if (keys.length > 0 || specs.length > 0) {
        // Case color
        const caseSpec = specs.find(
          (s) => s.key === "Couleur Boîtier" || s.key === "Couleur"
        );
        const caseColor = caseSpec ? caseSpec.val : "Standard";
        const shapeSpec = specs.find((s) => s.key === "Forme");
        const shapeVal = shapeSpec ? shapeSpec.val : mainName;

        const shapeName = shapeVal && mainName.includes(shapeVal) ? mainName : `${mainName} (${shapeVal})`;
        addColorItem(caseColor, "case", {
          shape: shapeName,
          orderId: o.id,
          qty: qty,
        });

        // Keycaps colors
        keys.forEach((k) => {
          const kColor = k.color || "Standard";
          addColorItem(kColor, "keycap", {
            label: `Touche #${k.keyNum}: ${k.val}`,
            qty: qty,
            orderId: o.id,
          });
        });
      } else {
        // Standard non-clicker product (extract color from name if present)
        const colorMatch = item.name.match(/Couleur\s*:\s*([^,)]+)/i);
        const itemColor = colorMatch ? colorMatch[1].trim() : "Standard";
        addColorItem(itemColor, "standard", {
          name: mainName,
          qty: qty,
          orderId: o.id,
        });
      }
    });
  });

  const colorBatches = Array.from(colorMap.values()).sort(
    (a, b) => b.totalPieces - a.totalPieces
  );

  const grandTotalPieces = colorBatches.reduce((acc, c) => acc + c.totalPieces, 0);

  // Print Batch Sheet Generator
  function handlePrintBatchSheet() {
    let rowsHtml = "";

    colorBatches.forEach((batch) => {
      let detailsHtml = "";

      if (batch.casesList.length > 0) {
        detailsHtml += `<div style="margin-bottom:4px;"><strong>📦 Boîtiers (${batch.casesCount}) :</strong><br>`;
        batch.casesList.forEach((c) => {
          detailsHtml += `<span style="display:inline-block; background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:10.5px; margin:2px 4px 2px 0;">x${c.qty} ${c.shape} <span style="color:#ea580c; font-weight:700;">[Cmd #${c.orderId}]</span></span> `;
        });
        detailsHtml += `</div>`;
      }

      if (batch.keycapsDetails.length > 0) {
        detailsHtml += `<div style="margin-bottom:4px;"><strong>⌨️ Touches / Keycaps (${batch.keycapsCount}) :</strong><br>`;
        batch.keycapsDetails.forEach((k) => {
          detailsHtml += `<span style="display:inline-block; background:#fff7ed; border:1px solid #ffedd5; padding:2px 6px; border-radius:4px; font-size:10.5px; margin:2px 4px 2px 0;">x${k.qty} ${k.label} <span style="color:#ea580c; font-weight:700;">[#${k.orderId}]</span></span> `;
        });
        detailsHtml += `</div>`;
      }

      if (batch.standardsList.length > 0) {
        detailsHtml += `<div><strong>🧩 Produits / Fidgets (${batch.standardsCount}) :</strong><br>`;
        batch.standardsList.forEach((s) => {
          detailsHtml += `<span style="display:inline-block; background:#f8fafc; border:1px solid #e2e8f0; padding:2px 6px; border-radius:4px; font-size:10.5px; margin:2px 4px 2px 0;">x${s.qty} ${s.name} <span style="color:#ea580c; font-weight:700;">[#${s.orderId}]</span></span> `;
        });
        detailsHtml += `</div>`;
      }

      rowsHtml += `
        <tr style="page-break-inside: avoid; border-bottom: 1.5px solid #cbd5e1;">
          <td style="padding: 10px; vertical-align: top; width: 140px;">
            <div style="font-size: 14px; font-weight: 900; color: #0f172a;">${batch.colorName}</div>
            <div style="font-size: 11px; font-weight: 800; color: #ea580c; margin-top: 4px;">Total : ${batch.totalPieces} pièce${batch.totalPieces > 1 ? "s" : ""}</div>
          </td>
          <td style="padding: 10px; vertical-align: top;">
            ${detailsHtml}
          </td>
        </tr>
      `;
    });

    const printHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Spoolio Atelier 3D — Fiche de Production par Couleur</title>
  <style>
    @page { size: A4; margin: 8mm; }
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #fff;
      margin: 0;
      padding: 10px;
      font-size: 11px;
      line-height: 1.35;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2.5px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .brand { font-size: 20px; font-weight: 900; color: #0f172a; }
    .brand span { color: #ea580c; }
    .subtitle { font-size: 9px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

    .summary-box {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 12px;
      font-weight: 800;
      font-size: 12px;
    }

    table { width: 100%; border-collapse: collapse; }
    th {
      background: #f1f5f9;
      color: #475569;
      text-transform: uppercase;
      font-size: 9px;
      font-weight: 800;
      padding: 6px 8px;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">SPOOLIO<span>.</span> ATELIER 3D</div>
      <div class="subtitle">Lot de Production par Couleur de Filament — Fiche d'Impression</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size: 12px; font-weight: 800; color: #ea580c;">${new Date().toLocaleDateString("fr-FR", { dateStyle: "long" })}</div>
    </div>
  </div>

  <div class="summary-box">
    <span>Commandes incluses : ${filteredOrders.length} commande(s)</span>
    <span>Total Pièces à Imprimer : ${grandTotalPieces} pièce(s)</span>
    <span>Nuances de Filaments : ${colorBatches.length} couleur(s)</span>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 140px;">Couleur / Filament</th>
        <th>Détail des Pièces & Numéros de Commande</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

    const printWin = window.open("", "_blank", "width=850,height=950");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] border border-white/10 rounded-2xl p-4">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <span>🏭</span>
            <span>Lots de Production par Couleur de Filament</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Regroupement automatique de toutes les pièces (boîtiers, keycaps, fidgets) à charger sur tes imprimantes par nuance de filament.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl p-1 text-xs">
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === "active"
                  ? "bg-[#ff4f00] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              En cours ({orders.filter(o => !o.archived && (o.status === "attente_impression" || o.status === "impression")).length})
            </button>
            <button
              onClick={() => setStatusFilter("attente")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === "attente"
                  ? "bg-amber-500 text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              En attente ⏳
            </button>
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white/20 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Toutes
            </button>
          </div>

          <button
            onClick={handlePrintBatchSheet}
            disabled={colorBatches.length === 0}
            className="px-4 py-2 rounded-xl bg-[#ff4f00] hover:bg-[#ff4f00]/80 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <span>🖨️</span>
            <span>Imprimer la Fiche de Plateau</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Commandes Incluses</span>
            <div className="text-2xl font-black font-mono text-white mt-1">{filteredOrders.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-lg">
            📋
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Nuances de Filaments</span>
            <div className="text-2xl font-black font-mono text-amber-400 mt-1">{colorBatches.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
            🎨
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Total Pièces à Imprimer</span>
            <div className="text-2xl font-black font-mono text-[#ff4f00] mt-1">{grandTotalPieces}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ff4f00]/10 border border-[#ff4f00]/20 text-[#ff4f00] flex items-center justify-center text-lg">
            🧩
          </div>
        </div>
      </div>

      {/* Color Batches Grid */}
      {colorBatches.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <div className="text-3xl">🎉</div>
          <div className="text-sm font-bold text-gray-300">Aucune commande en attente d'impression !</div>
          <div className="text-xs text-gray-500">Toutes tes imprimantes sont actuellement à jour.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {colorBatches.map((batch, idx) => {
            const swatch = getFilamentColorHex(batch.colorName);

            return (
              <div
                key={idx}
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all rounded-2xl p-4.5 space-y-4 shadow-sm flex flex-col justify-between"
              >
                {/* Batch Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full border shadow-sm shrink-0"
                        style={{ background: swatch.bg, borderColor: swatch.border }}
                      />
                      <h3 className="text-base font-black text-white">{batch.colorName}</h3>
                    </div>
                    <span className="font-mono font-black text-sm text-[#ff4f00] bg-[#ff4f00]/10 border border-[#ff4f00]/20 px-2.5 py-1 rounded-xl">
                      {batch.totalPieces} pièce{batch.totalPieces > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Breakdown Pills */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1">
                    {batch.casesCount > 0 && (
                      <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-lg font-bold">
                        📦 {batch.casesCount} Boîtier{batch.casesCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {batch.keycapsCount > 0 && (
                      <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-lg font-bold">
                        ⌨️ {batch.keycapsCount} Touche{batch.keycapsCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {batch.standardsCount > 0 && (
                      <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-lg font-bold">
                        🧩 {batch.standardsCount} Autre{batch.standardsCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-2.5 text-xs bg-black/40 border border-white/5 rounded-xl p-3 max-h-56 overflow-y-auto">
                  {/* Cases */}
                  {batch.casesList.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Boîtiers :</span>
                      <div className="space-y-1.5">
                        {batch.casesList.map((c, cIdx) => (
                          <div key={cIdx} className="flex items-start justify-between text-gray-200 bg-white/5 px-2.5 py-1.5 rounded-lg gap-2 leading-snug">
                            <span className="font-semibold">x{c.qty} {c.shape}</span>
                            <span className="font-mono text-[10px] text-[#ff4f00] font-bold shrink-0">#{c.orderId}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keycaps */}
                  {batch.keycapsDetails.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Touches / Keycaps :</span>
                      <div className="space-y-1.5">
                        {batch.keycapsDetails.map((k, kIdx) => (
                          <div key={kIdx} className="flex items-start justify-between text-amber-200 bg-amber-500/10 px-2.5 py-1.5 rounded-lg gap-2 leading-snug">
                            <span className="font-medium">x{k.qty} {k.label}</span>
                            <span className="font-mono text-[10px] text-amber-400 font-bold shrink-0">#{k.orderId}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Standards */}
                  {batch.standardsList.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Fidgets / Produits :</span>
                      <div className="space-y-1.5">
                        {batch.standardsList.map((s, sIdx) => (
                          <div key={sIdx} className="flex items-start justify-between text-gray-300 bg-white/5 px-2.5 py-1.5 rounded-lg gap-2 leading-snug">
                            <span className="font-medium">x{s.qty} {s.name}</span>
                            <span className="font-mono text-[10px] text-gray-400 font-bold shrink-0">#{s.orderId}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
