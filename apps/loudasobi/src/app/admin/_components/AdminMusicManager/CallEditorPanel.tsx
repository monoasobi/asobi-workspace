"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AdminMusic } from "@/types/catalog";
import type { GuideDocument } from "@/server/queries/guide";
import { CallGuideEditor } from "../CallGuideEditor";

export function CallEditorPanel({
  music,
  readOnly,
  onDirtyChange,
  onBusyChange,
  onSaved,
}: {
  music: AdminMusic;
  readOnly: boolean;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange: (busy: boolean) => void;
  onSaved: (document: GuideDocument) => void;
}) {
  const [document, setDocument] = useState<GuideDocument | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (document) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/admin/musics/${music.id}/guide`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error ?? "콜 가이드를 불러오지 못했습니다.");
        if (!controller.signal.aborted) setDocument(result.document);
      } catch (error) {
        if (!controller.signal.aborted)
          setError(
            error instanceof Error
              ? error.message
              : "콜 가이드를 불러오지 못했습니다.",
          );
      }
    }
    void load();
    return () => controller.abort();
  }, [music.id, attempt, document]);

  if (!document)
    return (
      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6"
        role="status"
      >
        <p className="text-sm text-muted-foreground">
          {error || "콜 가이드를 불러오는 중입니다…"}
        </p>
        {error && (
          <Button
            variant="outline"
            onClick={() => {
              setError("");
              setAttempt((value) => value + 1);
            }}
          >
            다시 시도
          </Button>
        )}
      </div>
    );
  return (
    <CallGuideEditor
      initial={document}
      readOnly={readOnly}
      embedded
      musicSettings={music}
      onDirtyChange={onDirtyChange}
      onBusyChange={onBusyChange}
      onSaved={onSaved}
    />
  );
}
