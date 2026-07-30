/**
 * Calculates SEO Score (0 - 100) based on product fields criteria
 */
export function computeSeoScore(data: any): number {
  if (!data) return 0;
  let score = 0;

  const name = (data.name || "").trim();
  const rawShortDesc = data.shortDescription || data.short_description || "";
  const shortDescription = rawShortDesc.replace(/<[^>]+>/g, "").trim();
  const rawDesc = data.description || "";
  const description = rawDesc.replace(/<[^>]+>/g, "").trim();
  const metaTitle = (data.metaTitle || data.meta_title || "").trim();
  const metaDescription = (data.metaDescription || data.meta_description || "").trim();

  let tagsCount = 0;
  if (Array.isArray(data.tags)) {
    tagsCount = data.tags.length;
  } else if (typeof data.tags === "string") {
    tagsCount = data.tags.split(",").filter((t: string) => t.trim().length > 0).length;
  }

  // 1. Product Name length (>= 10 chars) -> 15 pts
  if (name.length >= 10) score += 15;

  // 2. Short description length (>= 50 chars) -> 15 pts
  if (shortDescription.length >= 50) score += 15;

  // 3. Detailed description length (>= 200 chars) -> 20 pts
  if (description.length >= 200) score += 20;

  // 4. Meta Title length (30 - 60 chars) -> 20 pts
  if (metaTitle.length >= 30 && metaTitle.length <= 60) score += 20;

  // 5. Meta Description length (100 - 160 chars) -> 20 pts
  if (metaDescription.length >= 100 && metaDescription.length <= 160) score += 20;

  // 6. Tags count (>= 3 tags) -> 10 pts
  if (tagsCount >= 3) score += 10;

  return score;
}
