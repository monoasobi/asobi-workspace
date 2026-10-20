"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@asobi/ui/components/button";
import { useNavigationGuard } from "@/components/NavigationGuard";
import { useEditorGuard } from "@/components/editors/shared/useEditorGuard";
import { RefreshStatus } from "@/components/RefreshStatus";
import type { RefreshResult } from "@/types/refresh";
import { getErrorMessage } from "./utils";
export function MusicLifecycle({
  id,
  restore = false,
}: {
  id: number;
  restore?: boolean;
}) {
  const router = useRouter(),
    guard = useNavigationGuard();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [refresh, setRefresh] = useState<RefreshResult[]>([]),
    [done, setDone] = useState(false);
  const href = restore ? `/musics/${id}` : "/musics/deleted";
  useEditorGuard(`music-lifecycle-${id}`, false, busy);
  async function apply() {
    if (
      busy ||
      !guard.confirmLeave() ||
      !window.confirm(
        restore
          ? "이 곡을 복원할까요? 기존 콜 공개 설정도 다시 적용될 수 있습니다."
          : "곡을 공개 목록에서 숨길까요? 가사·원작·콜·이미지 자료는 보존됩니다.",
      )
    )
      return;
    setBusy(true);
    try {
      const response = await fetch(
        `/api/admin/musics/${id}${restore ? "/restore" : ""}`,
        { method: restore ? "POST" : "DELETE" },
      );
      if (!response.ok)
        throw new Error(
          await getErrorMessage(response, "처리하지 못했습니다."),
        );
      const result = await response.json();
      if ((result.refresh ?? []).some((r: RefreshResult) => !r.ok)) {
        setRefresh(result.refresh);
        setDone(true);
      } else {
        router.replace(href);
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "처리하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <Button
        type="button"
        size="sm"
        variant={restore ? "outline" : "destructive"}
        disabled={busy || guard.busy || done}
        onClick={apply}
      >
        {busy ? "처리 중…" : restore ? "복원" : "곡 숨기기"}
      </Button>
      <RefreshStatus results={refresh} onRefresh={setRefresh} />
      {done && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            router.replace(href);
            router.refresh();
          }}
        >
          처리한 목록 확인
        </Button>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
