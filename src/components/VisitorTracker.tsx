"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const trackVisit = async () => {
      try {
        await fetch("/api/visits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: pathname })
        });
      } catch (e) {
        console.warn("Tracking failed:", e);
      }
    };

    // Small delay to ensure route loading finishes smoothly
    const timer = setTimeout(trackVisit, 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
