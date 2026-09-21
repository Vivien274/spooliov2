/**
 * Universal environment helper to detect if the current running instance
 * is in preproduction (preview on Vercel, preprod branch, or local development).
 *
 * In production (spoolio.fr / main branch on Vercel), this returns false.
 */
export function isPreprodEnv(): boolean {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (
      host.includes("localhost") ||
      host.includes("127.0.0.1") ||
      host.includes("preprod") ||
      host.includes("preview") ||
      (host.endsWith(".vercel.app") && !host.includes("spoolio-main"))
    ) {
      return true;
    }
  }

  return (
    process.env.NEXT_PUBLIC_IS_PREPROD === "true" ||
    process.env.NEXT_PUBLIC_APP_ENV === "preprod" ||
    process.env.VERCEL_GIT_COMMIT_REF === "preprod" ||
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
  );
}
