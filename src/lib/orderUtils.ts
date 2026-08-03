export function parseItemName(fullName: string) {
  if (!fullName) return { mainName: "Article", options: [] };
  
  const parenMatches = [...fullName.matchAll(/\(([^()]+)\)/g)];
  if (parenMatches.length === 0) {
    return { mainName: fullName.trim(), options: [] };
  }

  let mainName = fullName;
  let optionsRaw = "";

  const optionsParenIndex = parenMatches.findIndex(m => m[1].includes(":") || m[1].includes("Composition"));
  if (optionsParenIndex !== -1 && parenMatches[optionsParenIndex].index !== undefined) {
    mainName = fullName.substring(0, parenMatches[optionsParenIndex].index).trim();
    optionsRaw = parenMatches[optionsParenIndex][1];
  } else {
    const lastMatch = parenMatches[parenMatches.length - 1];
    if (lastMatch.index !== undefined) {
      mainName = fullName.substring(0, lastMatch.index).trim();
      optionsRaw = lastMatch[1];
    }
  }

  const options: string[] = [];
  if (optionsRaw) {
    if (optionsRaw.includes("Composition:")) {
      const parts = optionsRaw.split(/(?=Taille de la pochette:|Composition:)/g).map(s => s.replace(/^[\s,]+/, '').trim()).filter(Boolean);
      options.push(...parts);
    } else {
      const parts = optionsRaw.split(",").map(o => o.trim()).filter(Boolean);
      options.push(...parts);
    }
  }

  return { mainName, options };
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
