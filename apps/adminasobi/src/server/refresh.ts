import "server-only";
import type { RefreshResult, RefreshTarget } from "@/types/refresh";
export async function refreshPublicCatalog(
  targets: RefreshTarget[],
): Promise<RefreshResult[]> {
  return Promise.all(
    // Loud reads the database per request; it has no server catalog cache to invalidate.
    targets.filter((target) => target === "monoasobi").map(async (target) => {
      const url = process.env.MONOASOBI_URL,
        secret = process.env.MONOASOBI_REVALIDATION_SECRET;
      if (!url || !secret) return { target, ok: false };
      try {
        const response = await fetch(new URL("/api/internal/revalidate", url), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ scope: "catalog" }),
          cache: "no-store",
          redirect: "error",
          signal: AbortSignal.timeout(5000),
        });
        const result = await response.json().catch(() => null);
        return { target, ok: response.ok && result?.ok === true };
      } catch {
        return { target, ok: false };
      }
    }),
  );
}
