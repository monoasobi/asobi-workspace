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
      if (!url || !secret)
        return { target, ok: false, error: "관리자 서버의 MONOASOBI_URL 또는 MONOASOBI_REVALIDATION_SECRET이 설정되지 않았습니다." };
      let endpoint: URL;
      try {
        endpoint = new URL("/api/internal/revalidate", url);
        if (!["http:", "https:"].includes(endpoint.protocol) || endpoint.username || endpoint.password)
          throw new Error("Invalid origin");
      } catch {
        return { target, ok: false, error: "MONOASOBI_URL을 올바른 Mono 주소로 설정해 주세요." };
      }
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ scope: "catalog" }),
          cache: "no-store",
          redirect: "manual",
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) {
          const error = response.status >= 300 && response.status < 400
            ? "Mono 주소가 다른 주소로 이동합니다. MONOASOBI_URL을 최종 운영 주소로 설정해 주세요."
            : response.status === 401 || response.status === 403
              ? "Mono 인증이 거부됐습니다. 양쪽 캐시 알림 비밀값과 배포 접근 보호 설정을 확인해 주세요."
              : response.status === 404
                ? "Mono 캐시 API를 찾지 못했습니다. MONOASOBI_URL과 배포 버전을 확인해 주세요."
                : response.status === 503
                  ? "Mono 캐시 API를 사용할 수 없습니다. Mono의 REVALIDATION_SECRET 설정을 확인해 주세요."
                  : "Mono 캐시 API에서 오류가 발생했습니다.";
          return { target, ok: false, status: response.status, error };
        }
        const result = await response.json().catch(() => null);
        return result?.ok === true
          ? { target, ok: true }
          : { target, ok: false, status: response.status, error: "Mono 응답에서 캐시 초기화 성공을 확인하지 못했습니다. 주소와 배포 접근 보호 설정을 확인해 주세요." };
      } catch (error) {
        return {
          target, ok: false,
          error: error instanceof Error && error.name === "TimeoutError"
            ? "Mono 캐시 API 응답이 5초를 초과했습니다. 잠시 후 다시 요청해 주세요."
            : "Mono 서버에 연결하지 못했습니다. MONOASOBI_URL과 서버 연결 상태를 확인해 주세요.",
        };
      }
    }),
  );
}
