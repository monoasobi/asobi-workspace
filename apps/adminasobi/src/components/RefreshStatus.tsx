"use client";
import { useState } from "react";
import { Button } from "@asobi/ui/components/button";
import type { RefreshResult } from "@/types/refresh";
export function RefreshStatus({
  results,
  onRefresh,
}: {
  results: RefreshResult[];
  onRefresh: (results: RefreshResult[]) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const failed = results.filter((result) => !result.ok);
  if (!failed.length) return null;
  async function retry() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: failed.some((result) => result.target === "monoasobi")
            ? "shared"
            : "loud",
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "갱신을 요청하지 못했습니다.");
        return;
      }
      onRefresh(result.refresh);
    } catch {
      setError("서버에 연결하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      role="status"
      className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-card p-4"
    >
      <p className="text-sm">
        저장은 완료했지만{" "}
        {failed.map((result) => result.target.toUpperCase()).join(", ")} 공개
        화면 갱신을 확인하지 못했습니다.
        {error && (
          <span role="alert" className="block text-destructive">
            {error}
          </span>
        )}
      </p>
      <Button variant="outline" size="sm" disabled={busy} onClick={retry}>
        {busy ? "갱신 요청 중…" : "공개 갱신 다시 요청"}
      </Button>
    </div>
  );
}
