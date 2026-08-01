export function parseItemName(fullName: string) {
  if (!fullName) return { mainName: "Article", options: [] };
  const match = fullName.match(/^(.*?)(?:\s*\((.*?)\))?$/);
  if (!match) return { mainName: fullName, options: [] };
  const mainName = match[1].trim();
  const optionsRaw = match[2];
  const options = optionsRaw 
    ? optionsRaw.split(",").map(o => o.trim()).filter(Boolean)
    : [];
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
