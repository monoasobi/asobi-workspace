"use client";
import type { RefreshResult } from "@/types/refresh";
import { useState, type FormEvent } from "react";
import { Button } from "@asobi/ui/components/button";
import { AlbumArtField } from "./content/AlbumArtField";
export function AlbumArtForm({
  musicId,
  albumArtKey,
  readOnly,
  onRefresh,
  onSaved,
  onDirtyChange,
  onBusyChange,
}: {
  musicId: number;
  albumArtKey: string | null;
  readOnly: boolean;
  onRefresh: (results: RefreshResult[]) => void;
  onSaved: (key: string) => void;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [hasFile, setHasFile] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [failed, setFailed] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || readOnly) return;
    const form = event.currentTarget;
    const file = new FormData(form).get("albumArt");
    if (!(file instanceof File) || !file.size) return;
    setBusy(true);
    onBusyChange(true);
    setFailed(false);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/musics/${musicId}/album-art`, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const result = await response.json();
      if (!response.ok) {
        setFailed(true);
        setMessage(result.error ?? "앨범아트를 저장하지 못했습니다.");
        return;
      }
      onRefresh(result.refresh ?? []);
      onSaved(result.albumArtKey);
      onDirtyChange(false);
      form.reset();
      setHasFile(false);
      setMessage("앨범아트를 저장했습니다.");
    } catch {
      setFailed(true);
      setMessage("서버에 연결하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }
  return (
    <form
      onSubmit={save}
      aria-busy={busy}
      className="grid gap-4 p-5 sm:p-6"
    >
      <AlbumArtField
        key={albumArtKey}
        albumArtKey={albumArtKey}
        disabled={readOnly || busy}
        onFileChange={(file) => {
          setHasFile(Boolean(file));
          onDirtyChange(Boolean(file));
          setMessage("");
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          role={failed ? "alert" : "status"}
          className={
            failed
              ? "text-xs text-destructive"
              : "text-xs text-muted-foreground"
          }
        >
          {message}
        </p>
        <Button
          type="submit"
          variant="outline"
          disabled={readOnly || busy || !hasFile}
        >
          {busy ? "저장 중…" : "앨범아트 저장"}
        </Button>
      </div>
    </form>
  );
}
