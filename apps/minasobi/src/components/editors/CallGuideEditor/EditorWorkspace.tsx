"use client";
import { useMemo, useState, type RefObject } from "react";
import { Copy, ClipboardPaste, Plus, ListMusic, Eye } from "lucide-react";
import { NextIntlClientProvider } from "next-intl";
import { messages } from "@asobi/loudasobi-view/i18n/messages";
import {
  locales,
  localeNames,
  type Locale,
} from "@asobi/loudasobi-view/i18n/config";
import { Button } from "@asobi/ui/components/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@asobi/ui/components/button-group";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asobi/ui/components/toggle-group";
import { EditorHelp } from "../shared/EditorHelp";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@asobi/ui/components/tooltip";
import { ScrollArea } from "@asobi/ui/components/scroll-area";
import {
  NativeSelect,
  NativeSelectOption,
} from "@asobi/ui/components/native-select";
import { GuidePreview } from "@asobi/loudasobi-view/player/GuidePreview";
import type { Playback } from "@asobi/loudasobi-view/player/MusicExperience/usePlayback";
import type { LyricTrack, CallSection } from "@asobi/content-core/lyrics";
import type { Music } from "@asobi/loudasobi-view/types/music";
import {
  roundTime,
  moveCue,
  defaultPulsePattern,
  snapshotLine,
  type CallCue,
  type CallGuide,
} from "@asobi/content-core/callGuide";
import { VerticalTimeline } from "./VerticalTimeline";
import { LyricInspector } from "./LyricInspector";
import {
  setLyricBounds,
  resolveLyricPresentation,
} from "@asobi/content-core/lyricPresentation";
import { CueInspector } from "./CueInspector";
import { useEditorShortcuts } from "./useEditorShortcuts";

export function EditorWorkspace({
  music,
  track,
  guide,
  sections,
  issues,
  playback,
  disabled,
  onChange,
  selected,
  onSelect,
  shortcutRoot,
  onUndo,
  onRedo,
  onSave,
  message,
}: {
  message: string;
  shortcutRoot: RefObject<HTMLElement | null>;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  music: Music;
  track: LyricTrack;
  guide: CallGuide;
  sections: CallSection[];
  issues: Record<string, string>;
  playback: Playback;
  disabled: boolean;
  onChange: (guide: CallGuide) => void;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  useEditorShortcuts({
    root: shortcutRoot,
    ready: playback.ready,
    toggle: playback.toggle,
    seekBy: playback.seekBy,
    undo: () => {
      if (!disabled) onUndo();
    },
    redo: () => {
      if (!disabled) onRedo();
    },
    save: onSave,
  });
  const [copiedCue, setCopiedCue] = useState<CallCue | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [inspectingCue, setInspectingCue] = useState<
    string | null | undefined
  >();
  const inspectingLyrics =
    inspectingCue !== undefined && inspectingCue === selected;
  const presentation = useMemo(
    () => resolveLyricPresentation(guide, track.lyric, track.sync),
    [guide, track.lyric, track.sync],
  );
  const previewTrack = useMemo(
    () => ({
      ...track,
      lyric: presentation.lines,
      guides: presentation.guides,
      songGuide: guide.songGuide,
    }),
    [track, presentation, guide.songGuide],
  );
  const [preview, setPreview] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<Locale>("ko");
  const cue = guide.cues.find((item) => item.id === selected);
  const newDuration = 480 / (music.bpm ?? 120);
  const { clock, seek } = playback;
  function update(next: CallCue) {
    if (!disabled)
      onChange({
        ...guide,
        cues: guide.cues.map((item) => (item.id === next.id ? next : item)),
      });
  }
  function create(start: number, end: number, fromLyrics = false) {
    if (disabled || guide.cues.length >= 500) return;
    const next: CallCue = {
      id: crypto.randomUUID(),
      type: fromLyrics ? "singalong" : "clap",
      label: "",
      start: roundTime(start),
      end: roundTime(end),
      lines: fromLyrics
        ? selectedLines
            .map((index) => track.lyric[index])
            .filter((line) => line.id)
            .map(snapshotLine)
        : [],
      pulseTimes: [],
      pattern: fromLyrics ? undefined : defaultPulsePattern(music.bpm),
    };
    onChange({ ...guide, cues: [...guide.cues, next] });
    setInspectingCue(undefined);
    onSelect(next.id);
  }
  function select(id: string) {
    setInspectingCue(undefined);
    onSelect(id);
  }
  function paste() {
    if (disabled || !copiedCue || guide.cues.length >= 500) return;
    const target = roundTime(Math.max(0, clock.read().time) - track.sync);
    const next = {
      ...moveCue(
        structuredClone(copiedCue),
        roundTime(target - copiedCue.start),
      ),
      id: crypto.randomUUID(),
    };
    if (playback.duration > 0 && next.end + track.sync > playback.duration) {
      setCopyMessage(
        "콜 전체가 곡 길이 안에 들어오는 위치로 이동한 뒤 붙여넣어 주세요.",
      );
      return;
    }
    onChange({ ...guide, cues: [...guide.cues, next] });
    select(next.id);
    setCopyMessage(
      next.type === "singalong"
        ? "떼창을 붙여넣었습니다. 연결 가사와 강조 범위도 복사됩니다. 다른 가사에 적용하려면 ‘선택 블록에 가사 연결’을 사용하세요."
        : "현재 재생 위치에 콜을 붙여넣었습니다. 전체 저장으로 반영됩니다.",
    );
  }
  const selectedSource = selectedLines.map((index) => track.lyric[index]);
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2">
        <ToggleGroup
          type="single"
          value={preview ? "preview" : "timeline"}
          onValueChange={(value) => {
            if (value) setPreview(value === "preview");
          }}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="편집 화면"
        >
          <ToggleGroupItem value="timeline">
            <ListMusic />
            타임라인
          </ToggleGroupItem>
          <ToggleGroupItem value="preview">
            <Eye />
            미리보기
          </ToggleGroupItem>
        </ToggleGroup>
        {preview && (
          <NativeSelect
            aria-label="미리보기 언어"
            value={previewLocale}
            onChange={(event) => setPreviewLocale(event.target.value as Locale)}
          >
            {locales.map((locale) => (
              <NativeSelectOption key={locale} value={locale}>
                {localeNames[locale]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}
        <ButtonGroup aria-label="콜 추가">
          <ButtonGroupText className="gap-1 text-xs">
            <Plus className="size-3" />콜
          </ButtonGroupText>
          <Button
            size="xs"
            variant="outline"
            disabled={
              disabled ||
              guide.cues.length >= 500 ||
              (playback.duration > 0 &&
                playback.clock.read().time >= playback.duration - 0.01)
            }
            onClick={() => {
              const start = roundTime(playback.clock.read().time - track.sync);
              create(
                start,
                roundTime(
                  Math.min(
                    start + newDuration,
                    playback.duration > 0
                      ? playback.duration - track.sync
                      : start + newDuration,
                  ),
                ),
              );
            }}
          >
            현재 위치
          </Button>
          <Button
            size="xs"
            variant="outline"
            disabled={
              disabled || !selectedLines.length || guide.cues.length >= 500
            }
            onClick={() =>
              create(
                presentation.lines[selectedLines[0]].start,
                presentation.lines[selectedLines.at(-1)!].end,
                true,
              )
            }
          >
            선택 가사 ({selectedLines.length})
          </Button>
        </ButtonGroup>
        <Button
          size="xs"
          variant="outline"
          disabled={
            disabled ||
            (guide.guides?.length ?? 0) >= 500 ||
            (!!selectedSource.length && !selectedSource.at(-1)?.id)
          }
          onClick={() => {
            onChange({
              ...guide,
              guides: [
                ...(guide.guides ?? []),
                {
                  id: crypto.randomUUID(),
                  beforeLineId: selectedSource.at(-1)?.id ?? null,
                  labels: { ko: "", ja: "", en: "" },
                },
              ],
            });
            setInspectingCue(selected);
          }}
        >
          <Plus className="size-3" />
          가이드
        </Button>
        {(cue || copiedCue) && (
          <ButtonGroup aria-label="콜 복사와 붙여넣기">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="outline"
                  aria-label="콜 복사"
                  disabled={!cue}
                  onClick={() => {
                    if (!cue) return;
                    setCopiedCue(structuredClone(cue));
                    setCopyMessage(
                      "선택한 콜을 복사했습니다. 원하는 위치로 이동한 뒤 붙여넣어 주세요.",
                    );
                  }}
                >
                  <Copy className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>콜 복사</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="outline"
                  aria-label="현재 위치에 붙여넣기"
                  disabled={disabled || !copiedCue || guide.cues.length >= 500}
                  onClick={paste}
                  title="복사한 콜을 현재 재생 위치에 붙여넣기"
                >
                  <ClipboardPaste className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>현재 위치에 붙여넣기</TooltipContent>
            </Tooltip>
          </ButtonGroup>
        )}
        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
          <p
            role="status"
            className="min-w-0 truncate text-right text-xs text-muted-foreground/70"
            title={message || copyMessage}
          >
            {message || copyMessage}
          </p>
          <EditorHelp />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {preview ? (
          <NextIntlClientProvider
            locale={previewLocale}
            messages={messages[previewLocale]}
            timeZone="Asia/Seoul"
          >
            <GuidePreview
              music={music}
              track={previewTrack}
              sections={sections}
              clock={clock}
              ready={playback.ready}
              offset={track.sync}
              onSeek={seek}
            />
          </NextIntlClientProvider>
        ) : (
          <VerticalTimeline
            lines={track.lyric}
            effectiveLines={presentation.lines}
            guides={guide.guides ?? []}
            trimWarnings={{ ...presentation.warnings, ...presentation.issues }}
            cues={guide.cues}
            sync={track.sync}
            playback={playback}
            selectedId={selected}
            selectedLines={selectedLines}
            disabled={disabled}
            onSelect={select}
            onLines={(indexes) => {
              setSelectedLines(indexes);
              setInspectingCue(selected);
            }}
            onCreate={create}
            onChange={update}
            onLyricChange={(index, start, end) =>
              onChange(setLyricBounds(guide, track.lyric[index], start, end))
            }
          />
        )}
        <ScrollArea className="h-[38%] min-h-0 min-w-0 shrink-0 border-t lg:h-auto lg:w-[360px] lg:border-t-0 lg:border-l">
          {inspectingLyrics ? (
            <LyricInspector
              line={selectedSource.at(-1)}
              lines={track.lyric}
              guide={guide}
              cue={cue}
              sync={track.sync}
              duration={playback.duration}
              disabled={disabled}
              onChange={onChange}
            />
          ) : cue ? (
            <CueInspector
              cue={cue}
              selectedLineCount={selectedLines.length}
              onLinkLyrics={() =>
                update({
                  ...cue,
                  lines: selectedSource
                    .filter((line) => line.id)
                    .map(snapshotLine),
                  selection: undefined,
                  textSelections: undefined,
                })
              }
              lines={track.lyric}
              defaultBpm={music.bpm}
              sync={track.sync}
              playback={playback}
              disabled={disabled}
              issue={
                issues[cue.id] ||
                (cue.start + track.sync < 0
                  ? "블록이 재생 시작 이전에 있습니다. 위치를 조정해 주세요."
                  : undefined)
              }
              onChange={update}
              onDelete={() => {
                if (disabled) return;
                onChange({
                  ...guide,
                  cues: guide.cues.filter((item) => item.id !== cue.id),
                });
                onSelect(null);
              }}
            />
          ) : null}
        </ScrollArea>
      </div>
    </div>
  );
}
