"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, ClipboardPaste } from "lucide-react";
import { NextIntlClientProvider } from "next-intl";
import { messages } from "@/i18n/messages";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { GuidePreview } from "@/components/player/GuidePreview";
import type { Playback } from "@/components/player/MusicExperience/usePlayback";
import type { LyricTrack, CallSection } from "@/types/lyric";
import type { Music } from "@/types/music";
import {
  roundTime,
  moveCue,
  defaultPulsePattern,
  snapshotLine,
  type CallCue,
  type CallGuide,
} from "@/lib/callGuide";
import { VerticalTimeline } from "./VerticalTimeline";
import { LyricInspector } from "./LyricInspector";
import { resolveLyricPresentation } from "@/lib/lyricPresentation";
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
  loop,
  onLoopChange,
}: {
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
  loop: boolean;
  onLoopChange: (value: boolean) => void;
}) {
  useEditorShortcuts(playback);
  const [copiedCue, setCopiedCue] = useState<CallCue | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [inspectingCue, setInspectingCue] = useState<
    string | null | undefined
  >();
  const inspectingLyrics =
    inspectingCue !== undefined && inspectingCue === selected;
  const presentation = useMemo(
    () => resolveLyricPresentation(guide, track.lyric),
    [guide, track.lyric],
  );
  const previewTrack = useMemo(
    () => ({
      ...track,
      lyric: presentation.lines,
      guides: presentation.guides,
    }),
    [track, presentation],
  );
  const [preview, setPreview] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<Locale>("ko");
  const loopSeeking = useRef(false);
  const cue = guide.cues.find((item) => item.id === selected);
  const newDuration = 480 / (music.bpm ?? 120);
  const { clock, seek } = playback;
  useEffect(() => {
    if (!loop || !cue) return;
    return clock.subscribeFrame((sample) => {
      if (sample.reset) {
        loopSeeking.current = false;
        return;
      }
      if (!sample.running || loopSeeking.current) return;
      const start = Math.max(0, cue.start + track.sync - 1),
        end = cue.end + track.sync;
      if (sample.time >= end || sample.time < start) {
        loopSeeking.current = true;
        seek(start, true);
      }
    });
  }, [loop, cue, clock, seek, track.sync]);
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
    onLoopChange(false);
  }
  function select(id: string) {
    setInspectingCue(undefined);
    onSelect(id);
    onLoopChange(false);
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
        <Button
          size="xs"
          variant={!preview ? "secondary" : "outline"}
          aria-pressed={!preview}
          onClick={() => setPreview(false)}
        >
          세로 타임라인
        </Button>
        <Button
          size="xs"
          variant={preview ? "secondary" : "outline"}
          aria-pressed={preview}
          onClick={() => setPreview(true)}
        >
          감상 미리보기
        </Button>
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
        <Button
          size="xs"
          variant="outline"
          disabled={
            disabled || !selectedLines.length || guide.cues.length >= 500
          }
          onClick={() =>
            create(selectedSource[0].start, selectedSource.at(-1)!.end, true)
          }
        >
          선택 가사로 콜 추가 ({selectedLines.length})
        </Button>
        <Button
          size="xs"
          variant="outline"
          disabled={disabled || !cue || !selectedLines.length}
          onClick={() =>
            cue &&
            update({
              ...cue,
              lines: selectedSource.filter((line) => line.id).map(snapshotLine),
              selection: undefined,
              textSelections: undefined,
            })
          }
        >
          선택 블록에 가사 연결
        </Button>
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
          현재 위치에 콜 추가
        </Button>
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
          가이드 추가
        </Button>
        <div
          className="flex items-center gap-1"
          role="group"
          aria-label="콜 복사와 붙여넣기"
        >
          <Button
            size="xs"
            variant="outline"
            disabled={!cue}
            onClick={() => {
              if (!cue) return;
              setCopiedCue(structuredClone(cue));
              setCopyMessage(
                "선택한 콜을 복사했습니다. 원하는 위치로 이동한 뒤 붙여넣어 주세요.",
              );
            }}
          >
            <Copy className="size-3" />콜 복사
          </Button>
          <Button
            size="xs"
            variant="outline"
            disabled={disabled || !copiedCue || guide.cues.length >= 500}
            onClick={paste}
            title="복사한 콜을 현재 재생 위치에 붙여넣기"
          >
            <ClipboardPaste className="size-3" />
            현재 위치에 붙여넣기
          </Button>
        </div>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => setInspectingCue(selected)}
        >
          가사·가이드 설정
        </Button>
      </div>
      {copyMessage && (
        <p
          role="status"
          className="shrink-0 border-b px-3 py-2 text-xs text-muted-foreground"
        >
          {copyMessage}
        </p>
      )}
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
              disabled={disabled}
              onChange={onChange}
            />
          ) : cue ? (
            <CueInspector
              cue={cue}
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
                onLoopChange(false);
              }}
              loop={loop}
              onLoop={() => {
                onLoopChange(!loop);
                if (!loop)
                  playback.seek(Math.max(0, cue.start + track.sync - 1), true);
              }}
            />
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              왼쪽 가사를 선택하거나 오른쪽 빈 시간 구간을 드래그해 콜 블록을
              만드세요. 오른쪽에서 종류를 바꾸고 박자 패턴과 ±0.01초 위치 조절을
              설정할 수 있습니다.
            </p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
