"use client";
import type { RefreshResult } from "@/types/refresh";
import { useState, type FormEvent } from "react";
import { AudioLines, Globe, Save, SlidersHorizontal } from "lucide-react";
import { Separator } from "@asobi/ui/components/separator";
import { Button } from "@asobi/ui/components/button";
import { Input } from "@asobi/ui/components/input";
import { Label } from "@asobi/ui/components/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asobi/ui/components/select";
import { Checkbox } from "@asobi/ui/components/checkbox";
import {
  fanLightKeys,
  fanLightBackground,
  normalizeFanLightColor,
} from "@asobi/content-core/fanlights";
import type { AdminMusic } from "@/types/music";

export function MusicSettingsForm({
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
  onSaved: (music: AdminMusic) => void;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [youtubeId, setYoutubeId] = useState(music.youtubeId ?? "");
  const [fanLightColor, setFanLightColor] = useState(
    normalizeFanLightColor(music.fanLightColor) ?? music.fanLightColor ?? "",
  );
  const invalidColor =
    !!fanLightColor && !normalizeFanLightColor(fanLightColor);
  const [publish, setPublish] = useState(music.publish);
  const [bpm, setBpm] = useState(String(music.bpm ?? ""));
  const [syncOffset, setSyncOffset] = useState(String(music.syncOffset));
  const [savedSyncOffset, setSavedSyncOffset] = useState(
    String(music.syncOffset),
  );
  const displayedSyncOffset =
    syncOffset === savedSyncOffset ? String(music.syncOffset) : syncOffset;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [dirty, setDirty] = useState(false);
  function edited() {
    setMessage("");
    onDirtyChange(true);
    setDirty(true);
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || readOnly || invalidColor) return;
    setBusy(true);
    onBusyChange(true);
    setMessage("");
    setFailed(false);
    try {
      const response = await fetch(
        "/api/admin/musics/" + music.id + "/settings",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            youtubeId: youtubeId.trim(),
            fanLightColor: fanLightColor || null,
            publish,
            bpm: bpm.trim() === "" ? null : Number(bpm),
            syncOffset: Number(displayedSyncOffset),
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setFailed(true);
        setMessage(result.error ?? "저장하지 못했습니다.");
        return;
      }
      onRefresh(result.refresh ?? []);
      onSaved({
        ...music,
        ...result.settings,
        id: music.id,
        updatedAt: music.updatedAt,
      });
      setYoutubeId(result.settings.youtubeId ?? "");
      setSyncOffset(String(result.settings.syncOffset));
      setSavedSyncOffset(String(result.settings.syncOffset));
      setBpm(String(result.settings.bpm ?? ""));
      setFanLightColor(result.settings.fanLightColor ?? "");
      setPublish(result.settings.publish);
      onDirtyChange(false);
      setDirty(false);
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
    <form
      onSubmit={save}
      className="flex min-h-0 flex-1 flex-col"
      aria-busy={busy}
    >
      <div>
        <div className="flex w-full flex-col gap-5 p-5 sm:p-6">
          <fieldset disabled={readOnly || busy} className="grid min-w-0 gap-5">
            <section
              className="min-w-0"
              aria-labelledby="media-heading"
            >
              <div className="mb-4 flex items-start gap-3">
                <AudioLines
                  aria-hidden="true"
                  className="mt-0.5 size-5 text-muted-foreground"
                />
                <div>
                  <h3 id="media-heading" className="text-sm font-semibold">
                    음원 및 표시
                  </h3>
                  <p className="mt-1 type-caption">
                    재생할 음원과 곡의 킹블레이드 색상을 설정합니다.
                  </p>
                </div>
              </div>
              <div className="grid items-start gap-5 lg:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="youtube-id">loudasobi 전용 YouTube ID</Label>
                  <Input
                    id="youtube-id"
                    aria-describedby="youtube-help"
                    value={youtubeId}
                    maxLength={11}
                    pattern="[A-Za-z0-9_-]{11}"
                    placeholder="11자리 영상 ID"
                    onChange={(event) => {
                      setYoutubeId(event.target.value);
                      edited();
                    }}
                  />
                  <span id="youtube-help" className="type-caption">
                    URL이 아닌 ID만 입력합니다. MONOASOBI의 MV ID와 별개입니다.
                  </span>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fanlight-color">킹블레이드 색상</Label>
                  <Select
                    disabled={readOnly || busy}
                    value={fanLightColor || "unset"}
                    onValueChange={(value) => {
                      setFanLightColor(value === "unset" ? "" : value);
                      edited();
                    }}
                  >
                    <SelectTrigger
                      id="fanlight-color"
                      className="w-full"
                      aria-invalid={invalidColor}
                      aria-describedby={
                        invalidColor ? "fanlight-help" : undefined
                      }
                    >
                      <SelectValue placeholder="미지정" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        <SelectItem value="unset">미지정</SelectItem>
                        {invalidColor && (
                          <SelectItem value={fanLightColor} disabled>
                            기존 색상: {fanLightColor} (변경 필요)
                          </SelectItem>
                        )}
                        {fanLightKeys.map((key) => (
                          <SelectItem key={key} value={key} textValue={key}>
                            <span
                              aria-hidden="true"
                              className="size-4 shrink-0 rounded-full border border-black/25"
                              style={{ background: fanLightBackground(key) }}
                            />
                            {key}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {invalidColor && (
                    <p id="fanlight-help" className="type-caption">
                      기존 색상을 새 목록에서 다시 선택하거나 미지정으로 바꾼 후
                      저장해 주세요.
                    </p>
                  )}
                </div>
              </div>
            </section>
            <section
              className="min-w-0"
              aria-labelledby="timing-heading"
            >
              <div className="mb-4 flex items-start gap-3">
                <SlidersHorizontal
                  aria-hidden="true"
                  className="mt-0.5 size-5 text-muted-foreground"
                />
                <div>
                  <h3 id="timing-heading" className="text-sm font-semibold">
                    타이밍
                  </h3>
                  <p className="mt-1 type-caption">
                    콜 패턴의 기본 속도와 음원에 맞는 가사 싱크를 조정합니다.
                  </p>
                </div>
              </div>
              <div className="grid items-start gap-5 lg:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="music-bpm">곡 BPM</Label>
                  <Input
                    id="music-bpm"
                    type="number"
                    min={20}
                    max={400}
                    step="any"
                    value={bpm}
                    placeholder="미지정"
                    aria-describedby="bpm-help"
                    onChange={(event) => {
                      setBpm(event.target.value);
                      edited();
                    }}
                  />
                  <p id="bpm-help" className="type-caption">
                    새 펄스 패턴의 기본 BPM입니다. 미지정 시 120을 사용하며 기존
                    블록은 바뀌지 않습니다.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sync-offset">가사 싱크 보정 (초)</Label>
                  <Input
                    id="sync-offset"
                    type="number"
                    required
                    min={-3600}
                    max={3600}
                    step="0.01"
                    aria-describedby="sync-help"
                    value={displayedSyncOffset}
                    onChange={(event) => {
                      setSyncOffset(event.target.value);
                      edited();
                    }}
                  />
                  <p id="sync-help" className="type-caption">
                    MONOASOBI 기본값 {music.sourceSync}초 + 추가 보정값. 양수는
                    가사를 늦게, 음수는 일찍 표시합니다. 기본값 0은 추가 보정
                    없음입니다.
                  </p>
                </div>
              </div>
            </section>
            <section
              className="min-w-0"
              aria-labelledby="publish-heading"
            >
              <div className="mb-4 flex items-start gap-3">
                <Globe
                  aria-hidden="true"
                  className="mt-0.5 size-5 text-muted-foreground"
                />
                <div>
                  <h3 id="publish-heading" className="text-sm font-semibold">
                    공개 설정
                  </h3>
                  <p className="mt-1 type-caption">
                    저장하면 공개 곡 목록에 반영됩니다.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="music-publish"
                  disabled={readOnly || busy}
                  aria-describedby="publish-help"
                  checked={publish}
                  onCheckedChange={(checked) => {
                    setPublish(checked === true);
                    edited();
                  }}
                />
                <Label htmlFor="music-publish">
                  공개 (loudasobi 곡 목록에 표시)
                </Label>
              </div>
              <p
                id="publish-help"
                className="mt-3 text-xs leading-relaxed text-muted-foreground"
              >
                비공개로 전환해도 가사와 콜 자료는 보존됩니다. 공개하려면 전용
                YouTube ID가 필요합니다.
              </p>
            </section>
          </fieldset>
          <div className="space-y-3 px-1 text-xs leading-relaxed text-muted-foreground">
            <Separator />
            <p>
              {music.hasLyrics ? "MONOASOBI 가사 연결됨" : "가사 준비 중"} ·
              제목은 왼쪽 곡 정보에서, 가사는 가사 편집 화면에서 수정합니다.
              <br />콜 편집과 미리보기에는 저장된 설정이 적용됩니다.
            </p>
          </div>
        </div>
      </div>
      <footer className="shrink-0 border-t bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1 type-caption" aria-live="polite">
            {message ? (
              <p
                role={failed ? "alert" : "status"}
                className={failed ? "text-destructive" : ""}
              >
                {message}
              </p>
            ) : readOnly ? (
              "열람 전용 계정입니다."
            ) : dirty ? (
              "저장하지 않은 변경사항이 있습니다."
            ) : (
              "변경사항을 저장하면 설정이 반영됩니다."
            )}
          </div>
          <Button type="submit" disabled={readOnly || busy || invalidColor}>
            <Save className="size-4" />
            {busy ? "저장 중…" : "설정 저장"}
          </Button>
        </div>
      </footer>
    </form>
  );
}
