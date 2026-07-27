export function parseNoiseLevel(val?: string | number | null): number {
  if (val === undefined || val === null || val === "") return 1;
  if (typeof val === "number") return Math.min(Math.max(Math.round(val), 1), 10);
  const s = String(val).toLowerCase().trim();
  if (s === "silent") return 1;
  if (s === "low") return 3;
  if (s === "medium") return 6;
  if (s === "high") return 9;
  const num = parseInt(s, 10);
  return isNaN(num) ? 1 : Math.min(Math.max(num, 1), 10);
}

export function formatNoiseLevelText(level: number): string {
  const l = parseNoiseLevel(level);
  if (l <= 1) return "1/10 (Silencieux - 0 dB)";
  if (l <= 3) return `${l}/10 (Discret - Murmure)`;
  if (l <= 5) return `${l}/10 (Clic doux)`;
  if (l <= 7) return `${l}/10 (Clic modéré)`;
  if (l <= 9) return `${l}/10 (Clic franc & sonore)`;
  return "10/10 (Ultra sonore & mécanique)";
}
