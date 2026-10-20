"use client";
import { recordRecentGuideTexts } from "@/lib/recentGuideTexts";
import { RecentTextProvider } from "./CallGuideEditor/TextSuggestions";
import { useEditorGuard } from "./shared/useEditorGuard";
import { RefreshStatus } from "@/components/RefreshStatus";
import type { RefreshResult } from "@/types/refresh";
import { copyEditorDraft } from "./shared/copyEditorDraft";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@asobi/ui/lib/utils";
import type { AdminMusic } from "@/types/music";
import {
  ArrowLeft,
  Copy,
  Redo2,
  Save,
  SlidersHorizontal,
  Undo2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@asobi/ui/components/popover";
import {
  NativeSelect,
  NativeSelectOption,
} from "@asobi/ui/components/native-select";
import { callLabels } from "@asobi/loudasobi-view/player/GuidePreview/guideStyles";
import { SongGuideEditor } from "./CallGuideEditor/SongGuideEditor";
import { EditorThemeMenu } from "./CallGuideEditor/EditorThemeMenu";
import { useRouter } from "next/navigation";
import { Button } from "@asobi/ui/components/button";
import { Input } from "@asobi/ui/components/input";
import { Label } from "@asobi/ui/components/label";
import { Badge } from "@asobi/ui/components/badge";
import { MusicExperience } from "@asobi/loudasobi-view/player/MusicExperience";
import { resolveLyricPresentation } from "@asobi/content-core/lyricPresentation";
import { resolveGuide, roundTime } from "@asobi/content-core/callGuide";
import type { GuideDocument } from "@/server/queries/guide";
import { useGuideHistory } from "./CallGuideEditor/useGuideHistory";
import { EditorWorkspace } from "./CallGuideEditor/EditorWorkspace";
import { NumberField } from "./CallGuideEditor/NumberField";
import { useEditorViewport } from "./CallGuideEditor/useEditorViewport";
import { guideSaveInput } from "./CallGuideEditor/guideSaveInput";

export function CallGuideEditor({
  initial,
  readOnly,
  embedded = false,
  musicSettings,
  onDirtyChange,
  onBusyChange,
  onSaved,
}: {
  initial: GuideDocument;
  readOnly: boolean;
  embedded?: boolean;
  musicSettings?: AdminMusic;
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  onSaved?: (document: GuideDocument) => void;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLElement>(null);
  const desktop = useEditorViewport(embedded ? containerRef : undefined);
  const Container = embedded ? "section" : "main";
  const [saved, setSaved] = useState(initial);
  const history = useGuideHistory({
    guide: initial.guide,
    syncOffset: initial.syncOffset,
    bpm: initial.music.bpm ?? null,
  });
  const { guide, syncOffset: draftSyncOffset } = history.draft;
  const syncOffset =
    draftSyncOffset === saved.syncOffset
      ? (musicSettings?.syncOffset ?? draftSyncOffset)
      : draftSyncOffset;
  const draftBpm = history.draft.bpm;
  const displayedBpm = draftBpm === (saved.music.bpm ?? null)
    ? (musicSettings?.bpm ?? saved.music.bpm)
    : draftBpm ?? undefined;
  const music = useMemo(
    () =>
      musicSettings
        ? {
            ...saved.music,
            youtubeId: musicSettings.youtubeId ?? undefined,
            fanLightColor: musicSettings.fanLightColor ?? undefined,
            bpm: displayedBpm,
          }
        : { ...saved.music, bpm: displayedBpm },
    [saved.music, musicSettings, displayedBpm],
  );
  const [busy, setBusy] = useState(false);
  const [selectedCue, setSelectedCue] = useState<string | null>(null);
  const [loop, setLoop] = useState(false);
  useLayoutEffect(() => () => setLoop(false), []);
  function selectCue(id: string | null) {
    setSelectedCue(id);
    setLoop(false);
  }
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState<RefreshResult[]>([]);
  const dirty =
    JSON.stringify(guide) !== JSON.stringify(saved.guide) ||
    draftSyncOffset !== saved.syncOffset ||
    draftBpm !== (saved.music.bpm ?? null);
  useEditorGuard("calls", dirty, busy);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  const track = useMemo(
    () => ({ ...saved.track, sync: saved.sourceSync + syncOffset }),
    [saved, syncOffset],
  );
  const resolved = useMemo(
    () => resolveGuide(guide, track.lyric),
    [guide, track.lyric],
  );
  const presentation = useMemo(
    () => resolveLyricPresentation(guide, track.lyric, track.sync),
    [guide, track.lyric, track.sync],
  );
  const invalid =
    (draftBpm !== null && (!Number.isFinite(draftBpm) || draftBpm < 20 || draftBpm > 400)) ||
    guide.guides?.some((item) => !item.labels.ko.trim()) ||
    Object.keys(presentation.issues).length > 0 ||
    Object.keys(resolved.issues).length > 0 ||
    guide.cues.some((cue) => cue.start + track.sync < 0);
  async function save() {
    if (!desktop || readOnly || busy || invalid) return;
    setBusy(true);
    setMessage("");
    try {
      let revision = saved.revision;
      let offsetToSave = syncOffset;
      if (embedded) {
        const latestResponse = await fetch(
          `/api/admin/musics/${saved.music.id}/guide`,
          { cache: "no-store" },
        );
        const latest = await latestResponse.json();
        if (!latestResponse.ok)
          throw new Error(
            latest.error ?? "최신 곡 설정을 확인하지 못했습니다.",
          );
        const input = guideSaveInput(
          saved,
          latest.document,
          draftSyncOffset,
          syncOffset,
        );
        revision = draftBpm !== (saved.music.bpm ?? null) ? saved.revision : input.revision;
        offsetToSave = input.syncOffset;
      }
      const response = await fetch(
        `/api/admin/musics/${saved.music.id}/guide`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ revision, guide, syncOffset: offsetToSave,
            ...(draftBpm !== (saved.music.bpm ?? null) ? { bpm: draftBpm } : {}),
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "저장하지 못했습니다.");
      recordRecentGuideTexts(
        saved.music.id,
        result.document.guide,
        saved.guide,
      );
      setSaved(result.document);
      onSaved?.(result.document);
      history.update(() => ({
        guide: result.document.guide,
        syncOffset: result.document.syncOffset,
        bpm: result.document.music.bpm ?? null,
      }));
      setRefresh(result.refresh ?? []);
      setMessage("콜·가이드·가사 표시 설정을 저장했습니다.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "연결하지 못했습니다. 초안은 유지됩니다.",
      );
    } finally {
      setBusy(false);
    }
  }
  function leave() {
    if (
      !busy &&
      (!dirty || window.confirm("저장하지 않은 변경을 버리고 나갈까요?"))
    )
      router.push("/admin");
  }
  if (!desktop)
    return (
      <Container
        data-editor-workspace
        ref={containerRef}
        className={cn(
          "flex flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground",
          embedded ? "min-h-0 flex-1" : "h-dvh",
        )}
      >
        <h1 className="text-lg font-semibold">
          콜 편집은 넓은 화면에서 이용해 주세요
        </h1>
        <p className="text-sm text-muted-foreground">
          편집 영역 너비 1024px 이상에서 편집할 수 있습니다.{" "}
          {embedded && "사이드바를 접거나 "}창을 다시 넓히면 작성 중인 초안이
          유지됩니다.
        </p>
        {!embedded && (
          <Button variant="outline" disabled={busy} onClick={leave}>
            곡 설정으로 돌아가기
          </Button>
        )}
      </Container>
    );
  return (
    <Container
      data-editor-workspace
      ref={containerRef}
      className={cn(
        "flex flex-col overflow-hidden bg-background text-foreground",
        embedded ? "min-h-0 flex-1" : "h-dvh",
      )}
    >
      <RecentTextProvider musicId={saved.music.id} saved={saved.guide}>
        <header className="flex shrink-0 flex-wrap items-center gap-3 border-b bg-card px-4 py-3">
          {!embedded && (
            <Button
              size="icon"
              variant="ghost"
              aria-label="곡 설정으로 돌아가기"
              title="곡 설정으로 돌아가기"
              disabled={busy}
              onClick={leave}
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-semibold">
                {saved.music.title}
              </h1>
              <Badge variant="outline">
                {(musicSettings?.publish ?? saved.publish)
                  ? "공개 곡"
                  : "비공개 곡"}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              콜 편집 <span aria-hidden>·</span>{" "}
              {readOnly
                ? "열람 전용"
                : dirty
                  ? "저장하지 않은 변경"
                  : "모든 변경 저장됨"}
            </p>
          </div>
          <NativeSelect
            aria-label={`블록 선택 (${guide.cues.length})`}
            className="w-full sm:w-64"
            value={
              guide.cues.some((cue) => cue.id === selectedCue)
                ? selectedCue!
                : ""
            }
            onChange={(event) => selectCue(event.target.value || null)}
          >
            <NativeSelectOption value="">
              블록 선택 ({guide.cues.length})
            </NativeSelectOption>
            {guide.cues.map((item) => (
              <NativeSelectOption key={item.id} value={item.id}>
                {(item.start + track.sync).toFixed(2)}초 ·{" "}
                {callLabels[item.type]} {resolved.issues[item.id] ? "⚠" : ""}{" "}
                {item.type === "chant" || item.type === "custom"
                  ? (item.labels?.ko ?? item.label)
                  : item.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <div className="flex items-center gap-1 border-r pr-3">
            <Button
              size="icon"
              variant="ghost"
              aria-label="실행 취소"
              title="실행 취소 · ⌘/Ctrl+Z"
              disabled={readOnly || busy || !history.canUndo}
              onClick={history.undo}
            >
              <Undo2 className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="다시 실행"
              title="다시 실행 · ⌘/Ctrl+Shift+Z"
              disabled={readOnly || busy || !history.canRedo}
              onClick={history.redo}
            >
              <Redo2 className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="초안 복사"
              title="초안 복사"
              onClick={async () => {
                try {
                  await copyEditorDraft({ guide, syncOffset, bpm: draftBpm });
                  setMessage("콜·가이드·가사 표시 초안을 복사했습니다.");
                } catch {
                  setMessage("클립보드 권한을 확인해 주세요.");
                }
              }}
            >
              <Copy className="size-4" />
            </Button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">곡 BPM {displayedBpm ?? "미지정"}</Button>
            </PopoverTrigger>
            <PopoverContent data-editor-portal align="end" className="grid w-72 gap-3 p-4">
              <Label htmlFor="call-music-bpm">곡 BPM</Label>
              <Input id="call-music-bpm" type="number" min={20} max={400} step="any"
                placeholder="미지정" value={displayedBpm ?? ""} disabled={readOnly || busy}
                onChange={event => history.update(draft => ({ ...draft,
                  bpm: event.target.value === "" ? null : Number(event.target.value),
                }))} />
              <p className="type-caption">새 펄스 패턴의 기본 BPM입니다. 미지정 시 120을 사용하며 기존 블록은 바뀌지 않습니다. 전체 저장으로 반영합니다.</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">
                <SlidersHorizontal className="size-4" />
                싱크 보정 {syncOffset >= 0 ? "+" : ""}
                {syncOffset.toFixed(2)}초
              </Button>
            </PopoverTrigger>
            <PopoverContent
              data-editor-portal
              align="end"
              className="w-80 space-y-2 p-4"
              aria-label="전체 싱크 보정"
            >
              <h2 className="font-semibold">전체 싱크 보정</h2>
              <fieldset
                disabled={readOnly || busy}
                className="flex flex-wrap items-end gap-2"
              >
                <div className="w-44">
                  <NumberField
                    label="가사 싱크 추가 보정 (초)"
                    value={syncOffset}
                    min={-3600}
                    max={3600}
                    onChange={(value) =>
                      history.update((draft) => ({
                        ...draft,
                        syncOffset: value,
                      }))
                    }
                  />
                </div>
                {[-0.1, -0.01, 0.01, 0.1].map((delta) => (
                  <Button
                    key={delta}
                    size="xs"
                    variant="outline"
                    disabled={Math.abs(syncOffset + delta) > 3600}
                    onClick={() =>
                      history.update((draft) => ({
                        ...draft,
                        syncOffset: roundTime(syncOffset + delta),
                      }))
                    }
                  >
                    {delta > 0 ? "+" : ""}
                    {delta.toFixed(2)}
                  </Button>
                ))}
                <span className="pb-1 text-xs text-muted-foreground">
                  원본 {saved.sourceSync}초 + 보정 = {roundTime(track.sync)}초 ·
                  가사와 콜 전체에 적용 / 개별 블록 위치 조절과 별개
                </span>
              </fieldset>
            </PopoverContent>
          </Popover>
          <SongGuideEditor
            value={guide.songGuide}
            disabled={readOnly || busy}
            onChange={(songGuide) =>
              history.update((draft) => ({
                ...draft,
                guide: { ...draft.guide, songGuide },
              }))
            }
          />
          <EditorThemeMenu />
          <Button
            size="sm"
            disabled={readOnly || busy || !dirty || invalid}
            onClick={save}
          >
            <Save className="size-4" />
            {busy ? "저장 중…" : "전체 저장"}
          </Button>
        </header>
        {(message || invalid || !music.youtubeId) && (
          <p role="status" className="shrink-0 border-b px-4 py-2 text-xs">
            {message ||
              (!music.youtubeId
                ? "전용 YouTube ID가 없어 재생은 불가능합니다. 곡 설정에서 연결해 주세요."
                : "저장 전 재확인이 필요한 블록이 있습니다. 블록 설정에서 확인해 주세요.")}
          </p>
        )}
        <RefreshStatus results={refresh} onRefresh={setRefresh} />
        <MusicExperience
          music={music}
          track={track}
          sections={resolved.sections}
          editorOnly
          shortcuts={false}
          editor={(playback) => (
            <EditorWorkspace
              shortcutRoot={containerRef}
              onUndo={history.undo}
              onRedo={history.redo}
              onSave={() => void save()}
              selected={selectedCue}
              onSelect={selectCue}
              loop={loop}
              onLoopChange={setLoop}
              music={music}
              track={track}
              guide={guide}
              sections={resolved.sections}
              issues={resolved.issues}
              playback={playback}
              disabled={readOnly || busy}
              onChange={(next) =>
                history.update((draft) => ({ ...draft, guide: next }))
              }
            />
          )}
        />
      </RecentTextProvider>
    </Container>
  );
}
