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
