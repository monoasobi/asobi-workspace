"use client";
import type { RefreshResult } from "@/types/refresh";
import { useState, type FormEvent, type ReactNode } from "react";
import { Skeleton } from "@asobi/ui/components/skeleton";
import { PendingSection } from "./loading/PendingSection";
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
  actions,
  readOnly,
  onRefresh,
  onSaved,
  onDirtyChange,
  onBusyChange,
}: {
  music: AdminMusic;
  actions: ReactNode;
  readOnly: boolean;
  onRefresh: (results: RefreshResult[]) => void;
  onSaved: (music: SavedMusic) => void;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false),
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
    <form id={`music-info-${music.id}`} onSubmit={save} aria-busy={busy}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <h1 className="type-section-title">곡 정보</h1>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {actions}
          <Button type="submit" size="sm" disabled={readOnly || busy}>
            {busy ? "저장 중…" : "곡 정보 저장"}
          </Button>
        </div>
      </header>
      {message && <p className={failed ? "px-5 py-3 text-xs text-destructive" : "px-5 py-3 type-caption"} role={failed ? "alert" : "status"}>{message}</p>}
    </form>
  );
}

// Native form ownership keeps the title/artwork forms separate without copying drafts.
export function MusicInfoFields({ music, section, readOnly, onDirtyChange }: {
  music: AdminMusic;
  section: "titles" | "media";
  readOnly: boolean;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const selectedFields = section === "titles" ? fields.slice(0, 3) : fields.slice(3);
  return (
    <div className={section === "titles" ? "grid gap-4 lg:grid-cols-3" : "grid gap-5"}
      onChange={() => onDirtyChange(true)}>
      {selectedFields.map(({ key, label, ...options }) => (
        <div className="grid min-w-0 gap-2" key={key}>
          <Label htmlFor={`common-${key}`}>{label}</Label>
          <PendingSection fallback={<Skeleton className="h-8 w-full" />}>
          <Input id={`common-${key}`} name={key} form={`music-info-${music.id}`}
            disabled={readOnly}
            defaultValue={(key === "youtubeId" ? music.commonYoutubeId : music[key]) ?? ""}
            required={"required" in options && options.required} />
          </PendingSection>
        </div>
      ))}
    </div>
  );
}
