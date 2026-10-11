"use client";

export interface CachedTombolaData {
  isActive: boolean;
  tombola?: {
    title: string;
    estimatedValue: number;
    totalCases: number;
    status: string;
  } | null;
}

// In-memory cache for the browser session
let memoryCache: CachedTombolaData | null = null;
let cacheTimestamp = 0;
let inFlightPromise: Promise<CachedTombolaData> | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches tombola status with cross-component deduplication and 5-min caching.
 * Prevents redundant HTTP requests across layout, header, drawer & banners on page transitions.
 */
export async function fetchTombolaStatus(): Promise<CachedTombolaData> {
  const now = Date.now();

  // 1. In-memory cache check
  if (memoryCache !== null && now - cacheTimestamp < CACHE_TTL_MS) {
    return memoryCache;
  }

  // 2. Return in-flight request if another component is currently fetching
  if (inFlightPromise) {
    return inFlightPromise;
  }

  // 3. SessionStorage cache check
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("spoolio_tombola_cache");
      const storedTs = sessionStorage.getItem("spoolio_tombola_ts");
      if (stored && storedTs && now - parseInt(storedTs, 10) < CACHE_TTL_MS) {
        const parsed: CachedTombolaData = JSON.parse(stored);
        memoryCache = parsed;
        cacheTimestamp = parseInt(storedTs, 10);
        return parsed;
      }
    } catch {}
  }

  // 4. Fetch once from API
  inFlightPromise = (async () => {
    try {
      const res = await fetch("/api/tombola", {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        const fallback: CachedTombolaData = { isActive: false, tombola: null };
        return fallback;
      }
      const data = await res.json();
      const isActive = Boolean(data.success && data.tombola?.status === "active");
      const result: CachedTombolaData = {
        isActive,
        tombola: isActive ? data.tombola : null,
      };

      memoryCache = result;
      cacheTimestamp = Date.now();

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("spoolio_tombola_cache", JSON.stringify(result));
          sessionStorage.setItem("spoolio_tombola_ts", String(cacheTimestamp));
        } catch {}
      }

      return result;
    } catch {
      return { isActive: false, tombola: null };
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}
