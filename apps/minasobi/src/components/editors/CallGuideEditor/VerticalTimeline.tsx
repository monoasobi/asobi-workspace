"use client";
import type { CallGuide } from "@asobi/content-core/callGuide";
import {
  cuePulses,
  cueTextSelections,
  type CallCue,
} from "@asobi/content-core/callGuide";
import type { LyricLine } from "@asobi/content-core/lyrics";
import {
  lyricTextFields,
  lyricTextLang,
  type LyricTextField,
} from "@asobi/content-core/lyricText";
import { formatTime } from "@asobi/content-core/lyricTime";
import { CallIcon } from "@asobi/loudasobi-view/common/CallIcon";
import {
  callLabels,
  callStyles,
} from "@asobi/loudasobi-view/player/GuidePreview/guideStyles";
import { HighlightedText } from "@asobi/loudasobi-view/player/HighlightedText";
import type { Playback } from "@asobi/loudasobi-view/player/MusicExperience/usePlayback";
import { ScrollArea } from "@asobi/ui/components/scroll-area";
import { cn } from "@asobi/ui/lib/utils";
import { Info } from "lucide-react";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TimelineTools } from "../shared/TimelineTools";
import { useLyricResize } from "./useLyricResize";
import { useTimelineDrag } from "./useTimelineDrag";
import { useTimelinePlayback } from "./useTimelinePlayback";
import {
  MAX_TIMELINE_SCALE,
  MIN_TIMELINE_SCALE,
  useTimelineZoom,
} from "./useTimelineZoom";

export function VerticalTimeline({
  lines,
  effectiveLines,
  guides,
  trimWarnings,
  cues,
  sync,
  playback,
  selectedId,
  selectedLines,
  disabled,
  onSelect,
  onLines,
  onCreate,
  onChange,
  onLyricChange,
}: {
  lines: LyricLine[];
  effectiveLines: LyricLine[];
  guides: NonNullable<CallGuide["guides"]>;
  trimWarnings: Record<string, string>;
  cues: CallCue[];
  sync: number;
  playback: Playback;
  selectedId: string | null;
  selectedLines: number[];
  disabled: boolean;
  onSelect: (id: string) => void;
  onLines: (indexes: number[]) => void;
  onCreate: (start: number, end: number) => void;
  onChange: (cue: CallCue) => void;
  onLyricChange: (index: number, start: number, end: number) => void;
}) {
  const [textFields, setTextFields] = useState<LyricTextField[]>(["jpReading"]);
  const selectedTextFields = textFields.filter((field) => field !== "en");
  const displayFields: LyricTextField[] = ["jp", ...selectedTextFields];
  const readingFields = displayFields.filter(
    (field) => field === "jp" || field === "jpReading" || field === "enReading",
  );
  const viewport = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const { scale, zoom } = useTimelineZoom(viewport, canvas);
  const selectionAnchor = useRef(0);
  const bottom =
    Math.max(
      10,
      playback.duration || 180,
      ...lines.map((line) => line.end + sync),
      ...effectiveLines.map((line) => line.end + sync),
      ...cues.map((cue) => cue.end + sync),
    ) + (playback.duration ? 0 : 10);
  const origin = Math.min(
    0,
    ...lines.map((line) => line.start + sync),
    ...effectiveLines.map((line) => line.start + sync),
    ...cues.map((cue) => cue.start + sync),
  );
  const centeredOnMount = useRef(false);
  const centerPlayhead = useCallback(() => {
    const node = viewport.current;
    const content = canvas.current;
    if (
      !node ||
      !content ||
      node.clientHeight === 0 ||
      content.offsetHeight === 0
    )
      return false;
    const canvasTop =
      content.getBoundingClientRect().top -
      node.getBoundingClientRect().top +
      node.scrollTop;
    node.scrollTo({
      top: Math.max(
        0,
        canvasTop +
          (playback.clock.read().time - origin) * scale -
          node.clientHeight / 2,
      ),
      behavior: "instant",
    });
    return true;
  }, [playback.clock, origin, scale]);
  useEffect(() => {
    if (centeredOnMount.current) return;
    // Radix initializes its viewport/content after mounting. Wait for layout to
    // settle, and only finish restoration once the viewport has a real size.
    let frame = 0;
    const observer = new ResizeObserver(schedule);
    function schedule() {
      if (centeredOnMount.current) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (centerPlayhead()) {
            centeredOnMount.current = true;
            observer.disconnect();
          }
        });
      });
    }
    if (viewport.current) observer.observe(viewport.current);
    if (canvas.current) observer.observe(canvas.current);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [centerPlayhead]);
  const snapTargets = useMemo(
    () =>
      effectiveLines.flatMap((line, lineIndex) => [
        { time: line.start, kind: "start" as const, lineIndex },
        { time: line.end, kind: "end" as const, lineIndex },
      ]),
    [effectiveLines],
  );
  const y = (time: number) => (time + sync - origin) * scale;
  const { drag, preview, start, move, finish, cancel } = useTimelineDrag({
    canvas,
    viewport,
    disabled,
    scale,
    sync,
    origin,
    limit: playback.duration || bottom,
    snapTargets,
    onSelect,
    onCreate,
    onChange,
  });
  const callTargets = useMemo(
    () =>
      cues.flatMap((cue, lineIndex) => [
        { time: cue.start, kind: "start" as const, lineIndex },
        { time: cue.end, kind: "end" as const, lineIndex },
      ]),
    [cues],
  );
  const lyricResize = useLyricResize({
    canvas,
    viewport,
    lines: effectiveLines,
    scale,
    sync,
    limit: playback.duration || bottom,
    disabled,
    targets: callTargets,
    onSelect: onLines,
    onChange: onLyricChange,
  });
  const shownLines = effectiveLines.map((line, index) =>
    lyricResize.drag?.index === index
      ? { ...line, start: lyricResize.drag.start, end: lyricResize.drag.end }
      : line,
  );
  const { playhead, cueNodes } = useTimelinePlayback(
    playback.clock,
    cues,
    sync,
    origin,
    scale,
  );
  const shown = preview
    ? cues.map((cue) => (cue.id === preview.id ? preview : cue))
    : cues;
  const lanes = useMemo(() => {
    const ends: number[] = [];
    const indexes = new Map<string, number>();
    [...cues]
      .sort((a, b) => a.start - b.start)
      .forEach((cue) => {
        let lane = ends.findIndex((end) => end <= cue.start);
        if (lane < 0) lane = ends.length;
        ends[lane] = cue.end;
        indexes.set(cue.id, lane);
      });
    return { indexes, count: Math.max(1, ends.length) };
  }, [cues]);
  return (
    <section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <ScrollArea className="min-h-0 flex-1" viewportRef={viewport}>
        <div className="sticky top-0 z-20 grid grid-cols-[60px_1fr_1fr] border-b bg-background p-2 text-xs">
          <span>시간</span>
          <span>가사 · 표시 보정 / 안내 가이드</span>
          <span>콜 트랙</span>
        </div>
        <div
          ref={canvas}
          className="relative ml-15 mr-2"
          style={{ height: (bottom - origin) * scale }}
          onPointerMove={(event) => {
            move(event);
            lyricResize.move(event);
          }}
          onPointerUp={(event) => {
            finish(event);
            lyricResize.finish(event);
          }}
          onPointerCancel={() => {
            cancel();
            lyricResize.cancel();
          }}
          onLostPointerCapture={() => {
            cancel();
            lyricResize.cancel();
          }}
        >
          {Array.from({ length: Math.ceil((bottom - origin) / 2) }, (_, i) => {
            const time = origin + i * 2;
            return (
              <div
                key={i}
                className="pointer-events-none absolute inset-x-0 border-t border-border/60"
                style={{ top: i * 2 * scale }}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  className="pointer-events-auto absolute -left-15 flex w-15 cursor-pointer select-none items-start justify-center border-0 p-0 text-xs tabular-nums text-muted-foreground disabled:cursor-default"
                  style={{ height: Math.min(2, bottom - time) * scale }}
                  aria-label={`${formatTime(time)}로 이동`}
                  disabled={!playback.ready}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={(event) => {
                    const top = canvas.current?.getBoundingClientRect().top;
                    const target =
                      top === undefined
                        ? time
                        : origin + (event.clientY - top) / scale;
                    playback.seek(
                      Math.max(
                        0,
                        Math.min(playback.duration || bottom, target),
                      ),
                    );
                  }}
                >
                  {formatTime(time)}
                </button>
              </div>
            );
          })}
          <div
            className="absolute inset-y-0 left-1/2 right-0 touch-none border-l"
            aria-label="콜 생성 영역"
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) start(event, "create");
            }}
          />
          {lines.map((line, index) => (
            <Fragment key={line.id ?? index}>
              {(shownLines[index].start !== line.start ||
                shownLines[index].end !== line.end) && (
                <div
                  aria-label="원본 가사 구간"
                  className="pointer-events-none absolute left-0 z-10 w-[calc(50%-6px)] border-y border-dashed border-magenta-600/60"
                  style={{
                    top: y(line.start),
                    height: (line.end - line.start) * scale,
                  }}
                />
              )}
              <button
                type="button"
                key={line.id ?? index}
                title={`${displayFields.map((field) => line[field] || "자료 없음").join("\n")}\n${(line.start + sync).toFixed(2)}초`}
                aria-pressed={selectedLines.includes(index)}
                className={cn(
                  "absolute left-0 w-[calc(50%-6px)] overflow-hidden rounded border bg-card px-2 text-left text-xs",
                  selectedLines.includes(index) &&
                    "border-magenta-500 bg-magenta-100 dark:bg-magenta-900",
                )}
                style={{
                  top: y(shownLines[index].start),
                  height: Math.max(
                    4,
                    (shownLines[index].end - shownLines[index].start) * scale,
                  ),
                }}
                onClick={(event) => {
                  if (event.shiftKey)
                    onLines(
                      Array.from(
                        {
                          length: Math.abs(index - selectionAnchor.current) + 1,
                        },
                        (_, i) => Math.min(index, selectionAnchor.current) + i,
                      ),
                    );
                  else {
                    selectionAnchor.current = index;
                    onLines([index]);
                  }
                }}
              >
                {line.id && trimWarnings[line.id] && (
                  <span className="block text-destructive">
                    ⚠ 표시 보정 재확인
                  </span>
                )}
                <span lang="ja" className="block truncate">
                  {line.jp}
                </span>
                {selectedTextFields.map((field) => (
                  <span
                    key={field}
                    lang={lyricTextLang[field]}
                    className="mt-1 block truncate text-muted-foreground"
                  >
                    {line[field] || "자료 없음"}
                  </span>
                ))}
              </button>
              {selectedLines.includes(index) &&
                line.id &&
                !disabled &&
                (["start", "end"] as const).map((edge) => (
                  <button
                    key={edge}
                    type="button"
                    data-lyric-resize
                    aria-label={`가사 ${index + 1} ${edge === "start" ? "시작" : "종료"} 시간 드래그`}
                    title="드래그: 콜에 스냅 · ⌘/Ctrl: 미세 조절"
                    className="absolute left-0 z-20 h-0.75 w-[calc(50%-6px)] -translate-y-1/2 cursor-ns-resize touch-none rounded bg-magenta-500 after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']"
                    style={{ top: y(shownLines[index][edge]) }}
                    onPointerDown={(event) =>
                      lyricResize.start(event, index, edge)
                    }
                  />
                ))}
            </Fragment>
          ))}
          {guides.map((note) => {
            const index =
              note.beforeLineId === null
                ? -1
                : lines.findIndex((line) => line.id === note.beforeLineId);
            if (note.beforeLineId !== null && index < 0) return null;
            const time =
              index < 0
                ? (effectiveLines[0]?.start ?? 0)
                : shownLines[index].start;
            return (
              <button
                key={note.id}
                type="button"
                title={note.labels.ko || "가이드 내용 입력"}
                className="absolute left-0 z-10 flex h-6 w-[calc(50%-6px)] -translate-y-1/2 items-center gap-1 rounded border border-dashed bg-background px-2 text-left text-xs shadow-xs"
                style={{ top: y(time) }}
                onClick={() => onLines(index < 0 ? [] : [index])}
              >
                <Info aria-hidden="true" className="size-3 shrink-0" />
                <span className="truncate">
                  가이드 · {note.labels.ko || "내용을 입력해 주세요"}
                </span>
              </button>
            );
          })}
          {shown.map((cue) => (
            <div
              key={cue.id}
              data-call-drag
              className="absolute"
              style={{
                top: y(cue.start),
                height: Math.max(4, (cue.end - cue.start) * scale),
                left: `${50 + ((lanes.indexes.get(cue.id) ?? 0) * 50) / lanes.count}%`,
                width: `${50 / lanes.count}%`,
              }}
            >
              <button
                ref={(node) => {
                  if (node) cueNodes.current.set(cue.id, node);
                  else cueNodes.current.delete(cue.id);
                }}
                type="button"
                aria-pressed={selectedId === cue.id}
                className={cn(
                  "absolute inset-0 w-full touch-none overflow-hidden rounded border px-2 py-1 text-left text-xs data-[active=true]:ring-2 data-[active=true]:ring-primary/60",
                  callStyles[cue.type],
                  selectedId === cue.id && "outline-2 outline-primary",
                  !disabled && "cursor-grab select-none active:cursor-grabbing",
                )}
                onPointerDown={(event) => start(event, "move", cue)}
                onClick={() => onSelect(cue.id)}
              >
                <span className="relative z-10">
                  <CallIcon type={cue.type} icon={cue.icon} emoji={cue.emoji} />{" "}
                  {callLabels[cue.type]}
                  {readingFields.map((field) => {
                    const text = cue.singalongText?.[field]?.trim();
                    if (!text) return null;
                    const shownText =
                      cue.singalongText?.placement === "inline"
                        ? `(${text})`
                        : text;
                    return (
                      <span
                        key={field}
                        lang={lyricTextLang[field]}
                        className="mt-1 block truncate"
                      >
                        <HighlightedText
                          text={shownText}
                          ranges={[{ start: 0, end: shownText.length }]}
                        />
                      </span>
                    );
                  })}
                  {(cue.type === "chant" || cue.type === "custom"
                    ? (cue.labels?.ko ?? cue.label)
                    : cue.label) &&
                    ` · ${cue.type === "chant" || cue.type === "custom" ? (cue.labels?.ko ?? cue.label) : cue.label}`}
                  {cue.type === "singalong" &&
                    cue.lines.flatMap((snapshot) =>
                      displayFields.map((field) => {
                        const text =
                          lines.find((line) => line.id === snapshot.id)?.[
                            field
                          ] ?? "";
                        const ranges = cueTextSelections(cue).filter(
                          (range) =>
                            range.lineId === snapshot.id &&
                            range.field === field &&
                            range.text === text,
                        );
                        return (
                          <span
                            key={`${snapshot.id}:${field}`}
                            lang={lyricTextLang[field]}
                            className="mt-1 block truncate"
                            title={text || "자료 없음"}
                          >
                            <HighlightedText
                              text={text || "자료 없음"}
                              ranges={ranges}
                            />
                          </span>
                        );
                      }),
                    )}
                </span>
                {cuePulses(cue).map((time, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="pointer-events-none absolute left-0 h-px w-full bg-primary/35"
                    style={{ top: (time - cue.start) * scale }}
                  />
                ))}
              </button>
              {selectedId === cue.id && !disabled && (
                <>
                  {(["start", "end"] as const).map((edge) => (
                    <button
                      key={edge}
                      type="button"
                      aria-label={
                        edge === "start"
                          ? "시작 시간 드래그"
                          : "종료 시간 드래그"
                      }
                      className={`absolute inset-x-0 z-10 h-0.75 cursor-ns-resize touch-none rounded bg-primary after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] ${edge === "start" ? "top-[-1.5px]" : "bottom-[-1.5px]"}`}
                      onPointerDown={(event) => start(event, edge, cue)}
                    />
                  ))}
                </>
              )}
            </div>
          ))}
          {drag &&
            snapTargets.map((target) => {
              const snapped = drag.snap?.time === target.time;
              return (
                <div
                  key={`${target.lineIndex}:${target.kind}`}
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-x-0 z-20 border-t",
                    target.kind === "end" && "border-dashed",
                    snapped ? "border-primary" : "border-foreground/15",
                  )}
                  style={{ top: y(target.time) }}
                >
                  {snapped &&
                    drag.snap?.lineIndex === target.lineIndex &&
                    drag.snap.kind === target.kind && (
                      <span className="absolute right-1 bottom-0 rounded bg-background px-1 text-[10px] font-medium text-primary">
                        가사 {target.lineIndex + 1}{" "}
                        {target.kind === "start" ? "시작" : "끝"} ·{" "}
                        {(target.time + sync).toFixed(2)}초
                      </span>
                    )}
                </div>
              );
            })}
          {lyricResize.drag &&
            callTargets.map((target) => {
              const snapped = lyricResize.drag?.snap === target;
              return (
                <div
                  key={`call:${target.lineIndex}:${target.kind}`}
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-x-0 z-20 border-t",
                    target.kind === "end" && "border-dashed",
                    snapped ? "border-magenta-500" : "border-foreground/15",
                  )}
                  style={{ top: y(target.time) }}
                >
                  {snapped && (
                    <span className="absolute right-1 bottom-0 rounded bg-background px-1 text-[10px] font-medium text-magenta-600">
                      콜 {target.lineIndex + 1}{" "}
                      {target.kind === "start" ? "시작" : "끝"} ·{" "}
                      {(target.time + sync).toFixed(2)}초
                    </span>
                  )}
                </div>
              );
            })}
          {drag?.kind === "create" && (
            <div
              className="pointer-events-none absolute left-1/2 right-0 border-2 border-primary bg-primary/15"
              style={{
                top: y(Math.min(drag.start, drag.end)),
                height: Math.abs(drag.end - drag.start) * scale,
              }}
            />
          )}
          <div
            ref={playhead}
            aria-hidden
            className="pointer-events-none absolute top-0 inset-x-0 z-10 border-t-2 border-primary text-right text-[10px] text-primary"
          />
        </div>
      </ScrollArea>
      <TimelineTools
        scale={scale}
        minScale={MIN_TIMELINE_SCALE}
        maxScale={MAX_TIMELINE_SCALE}
        zoom={zoom}
        onCenter={centerPlayhead}
        fields={lyricTextFields.filter(
          (field) => field !== "jp" && field !== "en",
        )}
        selectedFields={selectedTextFields}
        onFieldsChange={setTextFields}
      />
    </section>
  );
}
