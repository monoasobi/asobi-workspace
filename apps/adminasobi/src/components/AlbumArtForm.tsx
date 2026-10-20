"use client";
import type { RefreshResult } from "@/types/refresh";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@asobi/ui/components/button";
import { Input } from "@asobi/ui/components/input";
import { Label } from "@asobi/ui/components/label";
import {
  ALBUM_ART_ACCEPT,
  ALBUM_ART_MAX_BYTES,
} from "@asobi/content-core/albumArt";
import { AlbumArtwork } from "./AlbumArtwork";
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
  const [preview, setPreview] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [failed, setFailed] = useState(false);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
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
      setPreview(null);
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
      className="grid gap-3 border-t p-5 sm:p-6"
    >
      <Label htmlFor="album-art-file">앨범아트</Label>
      <AlbumArtwork
        key={preview ?? albumArtKey ?? musicId}
        src={preview ?? undefined}
        albumArtKey={albumArtKey}
        className="size-[120px] rounded border object-contain"
      />
      <Input
        id="album-art-file"
        name="albumArt"
        type="file"
        accept={ALBUM_ART_ACCEPT}
        required
        disabled={readOnly || busy}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.setCustomValidity(
            file && file.size > ALBUM_ART_MAX_BYTES
              ? "3MB 이하의 이미지를 선택해 주세요."
              : "",
          );
          event.currentTarget.reportValidity();
          setPreview(
            file && file.size <= ALBUM_ART_MAX_BYTES
              ? URL.createObjectURL(file)
              : null,
          );
          onDirtyChange(Boolean(file));
          setMessage("");
        }}
      />
      <p className="text-xs text-muted-foreground">
        JPG·PNG·WebP, 최대 3MB. 비율을 유지해 저장합니다.
      </p>
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
          disabled={readOnly || busy || !preview}
        >
          {busy ? "저장 중…" : "앨범아트 저장"}
        </Button>
      </div>
    </form>
  );
}
