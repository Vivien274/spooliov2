function splitTopLevelCommas(str: string): string[] {
  const result: string[] = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "(") depth++;
    else if (char === ")") depth--;

    if (char === "," && depth === 0) {
      if (current.trim()) result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

export function parseItemName(fullName: string) {
  if (!fullName) return { mainName: "Article", options: [] };

  // Check if there's a primary parenthetical options block starting with key options like (Forme:, (Couleur, (Switchs:, (Touches:
  const matchKeyOption = fullName.match(/\((Forme:|Couleur|Switchs:|Composition:|Touches:|Touche|Taille|Attache:)/i);

  if (matchKeyOption && matchKeyOption.index !== undefined) {
    const startIndex = matchKeyOption.index;
    const mainName = fullName.substring(0, startIndex).trim();
    let rawBlock = fullName.substring(startIndex).trim();

    // Strip outer opening/closing parenthesis if matching outer bounds
    if (rawBlock.startsWith("(") && rawBlock.endsWith(")")) {
      rawBlock = rawBlock.slice(1, -1);
    } else if (rawBlock.startsWith("(")) {
      let depth = 0;
      let endIdx = -1;
      for (let i = 0; i < rawBlock.length; i++) {
        if (rawBlock[i] === "(") depth++;
        else if (rawBlock[i] === ")") {
          depth--;
          if (depth === 0) {
            endIdx = i;
            break;
          }
        }
      }
      if (endIdx !== -1) {
        rawBlock = rawBlock.substring(1, endIdx);
      } else {
        rawBlock = rawBlock.slice(1);
      }
    }

    const options = splitTopLevelCommas(rawBlock);
    return { mainName, options };
  }

  // Fallback for simple single parenthetical options without nested sub-parens
  const lastParenIdx = fullName.lastIndexOf("(");
  if (lastParenIdx !== -1 && fullName.endsWith(")")) {
    const mainName = fullName.substring(0, lastParenIdx).trim();
    const rawBlock = fullName.substring(lastParenIdx + 1, fullName.length - 1).trim();
    const options = splitTopLevelCommas(rawBlock);
    return { mainName, options };
  }

  return { mainName: fullName.trim(), options: [] };
}

import { parseClickerOptions } from "@/components/OrderItemOptionsViewer";

export function generateOrderPackingSlipHtml(order: {
  id: string;
  createdAt: string | Date;
  customerName?: string;
  email?: string;
  customerPhone?: string;
  shippingAddress?: string;
  shippingMethod?: string;
  shippingCost?: number;
  total?: number;
  items?: { name: string; quantity: number; price?: number | string }[];
}): string {
  const dateStr = new Date(order.createdAt).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const shippingText =
    order.shippingMethod === "pickup"
      ? "Retrait Atelier (Click & Collect)"
      : order.shippingMethod === "relay"
      ? "Mondial Relay"
      : "Colissimo Domicile";

  let itemsHtml = "";

  (order.items || []).forEach((item) => {
    const { mainName, options } = parseItemName(item.name);
    const { specs, keys } = parseClickerOptions(options);

    // Column 3: Specs List
    let specsHtml = "";
    if (specs.length > 0) {
      specsHtml = `<ul style="margin: 0; padding-left: 14px; font-size: 11px; color: #334155; line-height: 1.4;">`;
      specs.forEach((s) => {
        const keyLabel = s.key
          ? s.key === "Couleur Boîtier" || s.key === "Couleur"
            ? "Boîtier"
            : s.key
          : "";
        specsHtml += `<li>${keyLabel ? `<strong>${keyLabel}:</strong> ` : ""}${s.val}</li>`;
      });
      specsHtml += `</ul>`;
    } else {
      specsHtml = `<span style="font-size: 11px; color: #94a3b8; font-style: italic;">Standard</span>`;
    }

    // Column 4: 3x3 Keycaps Matrix Box
    let keysMatrixHtml = "";
    if (keys.length > 0) {
      const gridCols = keys.length >= 7 ? 3 : keys.length >= 4 ? 3 : 2;
      keysMatrixHtml += `
        <div style="background: #fafafa; border: 1.5px solid #ea580c; border-radius: 6px; padding: 5px; width: 220px; page-break-inside: avoid;">
          <div style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #ea580c; margin-bottom: 4px; text-align: center; border-bottom: 1px solid #ffedd5; padding-bottom: 2px; letter-spacing: 0.5px;">
            MATRICE ${keys.length} TOUCHES
          </div>
          <div style="display: grid; grid-template-cols: repeat(${gridCols}, 1fr); gap: 3px;">
      `;

      keys.forEach((k) => {
        keysMatrixHtml += `
          <div style="background: #fff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px 2px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 38px;">
            <span style="font-weight: 900; font-size: 9px; color: #ea580c; font-family: monospace; line-height: 1;">#${k.keyNum}</span>
            <span style="font-weight: 700; font-size: 9.5px; color: #0f172a; line-height: 1.1; margin-top: 1px; word-break: break-word;">${k.val}</span>
            ${k.color ? `<span style="font-size: 7.5px; color: #b45309; font-weight: 700; line-height: 1; margin-top: 2px;">${k.color}</span>` : ""}
          </div>
        `;
      });

      keysMatrixHtml += `
          </div>
        </div>
      `;
    } else {
      keysMatrixHtml = `<span style="font-size: 11px; color: #94a3b8;">—</span>`;
    }

    const priceText = item.price ? `${(parseFloat(String(item.price)) * item.quantity).toFixed(2)}€` : "";

    itemsHtml += `
      <tr style="page-break-inside: avoid; border-bottom: 1px solid #e2e8f0;">
        <td style="width: 36px; text-align: center; padding: 8px 4px; vertical-align: top;">
          <span style="font-weight: 800; font-size: 12px; background: #ffedd5; color: #c2410c; padding: 2px 6px; border-radius: 4px; font-family: monospace;">x${item.quantity}</span>
        </td>
        <td style="padding: 8px 10px; vertical-align: top; width: 160px;">
          <div style="font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.3;">${mainName}</div>
        </td>
        <td style="padding: 8px 10px; vertical-align: top; width: 180px;">
          ${specsHtml}
        </td>
        <td style="padding: 8px 10px; vertical-align: top; width: 240px;">
          ${keysMatrixHtml}
        </td>
      </tr>
    `;
  });

  const totalItemCount = (order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Bon de Préparation ${order.id} - Spoolio Atelier 3D</title>
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
      border-bottom: 2px solid #0f172a;
      padding-bottom: 6px;
      margin-bottom: 10px;
    }
    .brand {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
    }
    .brand span { color: #ea580c; }
    .subtitle {
      font-size: 9px;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 1px;
    }
    .order-title {
      font-size: 16px;
      font-weight: 900;
      text-align: right;
      color: #ea580c;
    }
    .order-date {
      font-size: 11px;
      color: #475569;
      text-align: right;
    }

    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }
    .info-table td {
      padding: 6px 10px;
      vertical-align: top;
    }

    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    table.items-table th {
      background: #f1f5f9;
      color: #475569;
      text-transform: uppercase;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.5px;
      padding: 6px 8px;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
    }

    .total-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 800;
    }

    .footer-note {
      margin-top: 16px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 8px;
      font-size: 9.5px;
      color: #64748b;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">SPOOLIO<span>.</span> ATELIER 3D</div>
      <div class="subtitle">Bon de Préparation & Fiche d'Impression</div>
    </div>
    <div>
      <div class="order-title">BON DE PRÉPARATION ${order.id}</div>
      <div class="order-date">${dateStr}</div>
    </div>
  </div>

  <table class="info-table">
    <tr>
      <td style="width: 50%; border-right: 1px solid #e2e8f0;">
        <div style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px;">CLIENT</div>
        <div style="font-size: 11.5px; font-weight: 700; color: #0f172a;">${order.customerName || "Client Spoolio"}</div>
        <div style="font-size: 10.5px; color: #334155;">${order.email || ""}${order.customerPhone ? " • 📞 " + order.customerPhone : ""}</div>
      </td>
      <td style="width: 50%;">
        <div style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px;">LIVRAISON (${shippingText})</div>
        <div style="font-size: 10.5px; font-weight: 600; color: #0f172a; white-space: pre-line;">${order.shippingAddress || "N/A"}</div>
      </td>
    </tr>
  </table>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width:36px; text-align:center;">Qté</th>
        <th style="width:160px;">Produit</th>
        <th style="width:180px;">Spécifications</th>
        <th style="width:240px;">Matrice Touches 3x3</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="total-box">
    <span>Mode de livraison : ${shippingText}</span>
    <span>Nombre d'articles à préparer : ${totalItemCount}</span>
  </div>

  <div class="footer-note">
    Spoolio Atelier 3D — Impression 3D éco-responsable en PLA végétal 🇫🇷
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;
}

export function printOrderPackingSlip(order: any) {
  const html = generateOrderPackingSlipHtml(order);
  const printWin = window.open("", "_blank", "width=850,height=950");
  if (printWin) {
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  }
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function getItemProductUrl(item: { name: string; slug?: string }): string | null {
  if (item.slug) {
    return `/product/${item.slug}`;
  }
  const { mainName } = parseItemName(item.name || "");
  const lowerName = mainName.toLowerCase();

  if (lowerName.includes("don de soutien") || lowerName.includes("arrondi solidaire") || lowerName.startsWith("don-")) {
    return "/don";
  }
  if (lowerName.includes("tombola") || lowerName.includes("ticket")) {
    return "/tombola";
  }
  if (lowerName.includes("pochette surprise")) {
    return "/pochette-surprise";
  }

  const slug = slugify(mainName);
  return slug ? `/product/${slug}` : null;
}
