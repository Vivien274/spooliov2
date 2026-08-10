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

    let specsHtml = "";
    if (specs.length > 0) {
      specsHtml += '<div style="margin-top:4px;">';
      specs.forEach((s) => {
        const label = s.key
          ? s.key === "Couleur Boîtier" || s.key === "Couleur"
            ? "🎨 Boîtier"
            : s.key === "Switchs" || s.key === "Switch"
            ? "🔊 Switchs"
            : s.key === "Attache"
            ? "🔗 Attache"
            : s.key === "Forme"
            ? "⏹️ Forme"
            : s.key
          : "";
        specsHtml += `<span style="display:inline-block; background:#e9ecef; color:#343a40; font-size:11px; padding:2px 6px; border-radius:4px; margin-right:4px; margin-top:2px; font-weight:600;">${label ? label + ": " : ""}${s.val}</span>`;
      });
      specsHtml += '</div>';
    }

    let keysHtml = "";
    if (keys.length > 0) {
      keysHtml += `
        <div style="margin-top:8px; background:#fff; border:1px solid #ff4f00; border-radius:6px; padding:8px;">
          <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#ff4f00; margin-bottom:6px;">
            ⌨️ Personnalisation des Touches (${keys.length} touche${keys.length > 1 ? "s" : ""})
          </div>
          <div style="display:grid; grid-template-cols:repeat(3, 1fr); gap:6px;">
      `;

      keys.forEach((k) => {
        keysHtml += `
          <div style="background:#f8f9fa; border:1px solid #dee2e6; border-radius:4px; padding:4px 6px; font-size:11px;">
            <span style="font-weight:800; color:#ff4f00; font-family:monospace; margin-right:4px;">#${k.keyNum}</span>
            <span style="font-weight:700; color:#111;">${k.val}</span>
            ${k.color ? `<span style="font-size:10px; color:#b58100; display:block; font-weight:600;">🟡 ${k.color}</span>` : ""}
          </div>
        `;
      });

      keysHtml += `
          </div>
        </div>
      `;
    }

    const priceText = item.price ? `${(parseFloat(String(item.price)) * item.quantity).toFixed(2)}€` : "";

    itemsHtml += `
      <tr>
        <td style="width:40px; text-align:center;">
          <span style="font-weight:800; font-size:12px; background:#ffe3d5; color:#d94100; padding:3px 8px; border-radius:4px; font-family:monospace;">x${item.quantity}</span>
        </td>
        <td>
          <div style="font-size:13px; font-weight:700; color:#111;">${mainName}</div>
          ${specsHtml}
          ${keysHtml}
        </td>
        <td style="width:80px; text-align:right; font-weight:700; font-size:13px;">
          ${priceText}
        </td>
      </tr>
    `;
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Bon de Préparation ${order.id} - Spoolio Atelier 3D</title>
  <style>
    @page { size: A4; margin: 10mm; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111;
      background: #fff;
      margin: 0;
      padding: 12px;
      font-size: 13px;
      line-height: 1.4;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2.5px solid #ff4f00;
      padding-bottom: 10px;
      margin-bottom: 16px;
    }
    .brand {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #111;
    }
    .brand span { color: #ff4f00; }
    .subtitle {
      font-size: 10px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 2px;
    }
    .order-title {
      font-size: 18px;
      font-weight: 800;
      text-align: right;
      color: #ff4f00;
    }
    .order-date {
      font-size: 11px;
      color: #555;
      text-align: right;
    }

    .info-grid {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }
    .info-block h4 {
      margin: 0 0 4px 0;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6c757d;
    }
    .info-block p {
      margin: 0;
      font-size: 12px;
      font-weight: 600;
      color: #212529;
      white-space: pre-line;
    }

    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    table.items-table th {
      background: #f1f3f5;
      color: #495057;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
    }
    table.items-table td {
      padding: 10px;
      border-bottom: 1px solid #e9ecef;
      vertical-align: top;
    }

    .total-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 14px;
      font-weight: 800;
    }

    .footer-note {
      margin-top: 24px;
      border-top: 1px dashed #ccc;
      padding-top: 10px;
      font-size: 10px;
      color: #6c757d;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">SPOOLIO<span>.</span></div>
      <div class="subtitle">Atelier d'Impression 3D — Bon de Préparation</div>
    </div>
    <div>
      <div class="order-title">COMMANDE ${order.id}</div>
      <div class="order-date">${dateStr}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-block">
      <h4>Client</h4>
      <p>${order.customerName || "Client Spoolio"}<br>${order.email || ""}${order.customerPhone ? "<br>📞 " + order.customerPhone : ""}</p>
    </div>
    <div class="info-block">
      <h4>Mode de Livraison & Adresse</h4>
      <p><strong>${shippingText}</strong><br>${order.shippingAddress || "N/A"}</p>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width:40px; text-align:center;">Qté</th>
        <th>Article & Spécifications de Fabrication</th>
        <th style="width:80px; text-align:right;">Prix</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="total-box">
    <span>Mode d'envoi : ${shippingText}</span>
    <span>Total Commande : ${order.total ? order.total.toFixed(2) + "€" : "N/A"}</span>
  </div>

  <div class="footer-note">
    Merci de votre commande chez Spoolio Atelier 3D — Fabriqué en France 🇫🇷
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
