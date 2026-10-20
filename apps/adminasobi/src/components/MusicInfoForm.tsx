"use client";
import type { RefreshResult } from "@/types/refresh";
import { useState, type FormEvent } from "react";
import { Button } from "@asobi/ui/components/button";
import { Input } from "@asobi/ui/components/input";
import { Label } from "@asobi/ui/components/label";
import type { AdminMusic } from "@/types/music";
import type { MusicInput } from "@asobi/content-core/music";
type SavedMusic = MusicInput & {
  id: number;
  albumArtKey: string | null;
  updatedAt: string;
};
// Fields and payload retain MONOASOBI's music editor contract.
const fields = [
  { key: "title", label: "일본어 제목", required: true },
  { key: "korTitle", label: "한국어 제목", required: true },
  { key: "enTitle", label: "영어 제목", required: true },
  { key: "youtubeId", label: "MONOASOBI YouTube ID" },
  { key: "specialPath", label: "특별 페이지 경로" },
] as const;
export function MusicInfoForm({
  music,
  readOnly,
  onRefresh,
  onSaved,
  onDirtyChange,
  onBusyChange,
}: {
  music: AdminMusic;
  readOnly: boolean;
  onRefresh: (results: RefreshResult[]) => void;
  onSaved: (music: SavedMusic) => void;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [message, setMessage] = useState(""),
    [failed, setFailed] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || readOnly) return;
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(
      fields.map(({ key }) => [key, String(form.get(key) ?? "").trim()]),
    );
    setBusy(true);
    onBusyChange(true);
    setMessage("");
    setFailed(false);
    try {
      const response = await fetch(`/api/admin/musics/${music.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setFailed(true);
        setMessage(result.error ?? "저장하지 못했습니다.");
        return;
      }
      onRefresh(result.refresh ?? []);
      onSaved(result.music);
      setDirty(false);
      onDirtyChange(false);
      setMessage("저장했습니다.");
    } catch {
      setFailed(true);
      setMessage("서버에 연결하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }
  return (
    <form onSubmit={save} aria-busy={busy} className="flex flex-col">
      <fieldset
        disabled={busy || readOnly}
        className="grid gap-5 p-5 sm:p-6"
        onChange={() => {
          setDirty(true);
          onDirtyChange(true);
          setMessage("");
        }}
      >
        {fields.map(({ key, label, ...options }) => (
          <div className="grid gap-2" key={key}>
            <Label htmlFor={`common-${key}`}>{label}</Label>
            <Input
              id={`common-${key}`}
              name={key}
              defaultValue={
                (key === "youtubeId" ? music.commonYoutubeId : music[key]) ?? ""
              }
              required={"required" in options && options.required}
            />
          </div>
        ))}
      </fieldset>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t p-5">
        <p
          className={
            failed
              ? "text-xs text-destructive"
              : "text-xs text-muted-foreground"
          }
          role={failed ? "alert" : "status"}
        >
          {message ||
            (readOnly
              ? "열람 전용 계정입니다."
              : dirty
                ? "저장하지 않은 변경사항이 있습니다."
                : "공통 곡 정보를 수정할 수 있습니다.")}
        </p>
        <Button type="submit" disabled={readOnly || busy}>
          {busy ? "저장 중…" : "곡 정보 저장"}
        </Button>
      </footer>
    </form>
  );
}
