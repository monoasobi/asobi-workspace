import "server-only";
import type { RefreshResult, RefreshTarget } from "@/types/refresh";
export async function refreshPublicCatalog(
  targets: RefreshTarget[],
): Promise<RefreshResult[]> {
  return Promise.all(
    targets.map(async (target) => {
      const prefix = target === "monoasobi" ? "MONOASOBI" : "LOUDASOBI";
      const url = process.env[prefix + "_URL"],
        secret = process.env[prefix + "_REVALIDATION_SECRET"];
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
        return { target, ok: response.ok };
      } catch {
        return { target, ok: false };
      }
    }),
  );
}
