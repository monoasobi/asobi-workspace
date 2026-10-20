"use client";

import type { LyricLine } from "@asobi/content-core/lyrics";

import { useLyricPlayer } from "@/components/editors/playback/useLyricPlayer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/editors/Resizable";

import {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  type Dispatch,
  type SetStateAction,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { TimelineCanvas } from "./LyricTimelineEditor/TimelineCanvas";
import { TimelineSidePanel } from "./LyricTimelineEditor/TimelineSidePanel";

import { getNormalizedLyrics } from "./LyricTimelineEditor/timelineUtils";
import { useTimelineResize } from "./LyricTimelineEditor/useTimelineResize";
import { useTimelineSelection } from "./LyricTimelineEditor/useTimelineSelection";
import { useEditorShortcuts } from "../shared/useEditorShortcuts";
import { useEditorHistory } from "../shared/useEditorHistory";
import { useEditorViewport } from "../shared/useEditorViewport";
import { useEditorGuard } from "../shared/useEditorGuard";
import { copyEditorDraft } from "../shared/copyEditorDraft";
import { RefreshStatus } from "@/components/RefreshStatus";
import type { RefreshResult } from "@/types/refresh";
import type { LyricsDocument } from "@/server/queries/lyrics";
import { useTimelineZoom } from "../shared/useTimelineZoom";
import styles from "./LyricTimelineEditor.module.css";
import {
  DEFAULT_PIXELS_PER_SECOND,
  MIN_PIXELS_PER_SECOND,
  MAX_PIXELS_PER_SECOND,
  MIN_LINE_DURATION,
  getTimelineEnd,
  getTimelineStart,
  roundTime,
} from "./time";

export const LyricTimelineEditor = ({
  initial,
  readOnly,
}: {
  initial: LyricsDocument;
  readOnly: boolean;
}) => {
  const [saved, setSaved] = useState(initial);
  const { music, lyricTrack } = saved;
  const canManage = !readOnly;
  const containerRef = useRef<HTMLDivElement>(null);
  const desktop = useEditorViewport(containerRef);
  const [refresh, setRefresh] = useState<RefreshResult[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const history = useEditorHistory({
    lyrics: getNormalizedLyrics(initial.lyricTrack.lyricJson),
    sync: initial.lyricTrack.sync,
  });
  const { lyrics: draftLyrics } = history.draft;
  const updateDraft = history.update;
  const setDraftLyrics = useCallback<Dispatch<SetStateAction<LyricLine[]>>>(
    (change) =>
      updateDraft((draft) => ({
        ...draft,
        lyrics: typeof change === "function" ? change(draft.lyrics) : change,
      })),
    [updateDraft],
  );
  const rawPlayer = useLyricPlayer({
    youtubeId: music.youtubeId ?? "",
    lyrics: draftLyrics,
    sync: history.draft.sync,
    showReading: true,
  });
  const setSync = (value: number) => {
    if (canManage && Number.isFinite(value))
      history.update((draft) => ({ ...draft, sync: roundTime(value) }));
  };
  const player = {
    ...rawPlayer,
    offset: history.draft.sync,
    setOffset: setSync,
    adjustOffset: (delta: number) => setSync(history.draft.sync + delta),
    resetOffset: () => setSync(saved.lyricTrack.sync),
  };
  const { currentTime, duration, activeLineIndex, offset: draftSync } = player;
  const { scale: pixelsPerSecond } = useTimelineZoom(
    timelineRef,
    trackRef,
    DEFAULT_PIXELS_PER_SECOND,
    MIN_PIXELS_PER_SECOND,
    MAX_PIXELS_PER_SECOND,
  );
  const [selectedLineIndexes, setSelection] = useState<number[]>([0]);
  const [loop, setLoop] = useState(false);
  const setSelectedLineIndexes = useCallback<
    Dispatch<SetStateAction<number[]>>
  >((change) => {
    setLoop(false);
    setSelection(change);
  }, []);
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  const timelineStart = useMemo(
    () => getTimelineStart(draftLyrics, draftSync),
    [draftLyrics, draftSync],
  );
  const timelineEnd = useMemo(
    () => getTimelineEnd(draftLyrics, draftSync, duration),
    [draftLyrics, draftSync, duration],
  );
  const timelineHeight = Math.max(
    960,
    (timelineEnd - timelineStart) * pixelsPerSecond,
  );
  const dirty =
    draftSync !== lyricTrack.sync ||
    JSON.stringify(draftLyrics) !==
      JSON.stringify(getNormalizedLyrics(lyricTrack.lyricJson));

  const updateLine = (index: number, patch: Partial<LyricLine>) => {
    if (!canManage) return;

    setDraftLyrics((prev) =>
      prev.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line,
      ),
    );
  };

  const splitLine = (index: number) => {
    if (!canManage) return;

    const line = draftLyrics[index];
    if (!line) return;

    const splitTime = roundTime(currentTime - draftSync);
    const canSplit =
      splitTime > line.start + MIN_LINE_DURATION &&
      splitTime < line.end - MIN_LINE_DURATION;
    if (!canSplit) return;

    const nextLyrics = [
      ...draftLyrics.slice(0, index),
      { ...line, end: splitTime },
      { ...line, id: crypto.randomUUID(), start: splitTime },
      ...draftLyrics.slice(index + 1),
    ];
    setDraftLyrics(nextLyrics);
    setSelectedLineIndexes([index + 1]);
    setEditingLineIndex(index + 1);
  };

  const deleteLine = (index: number) => {
    if (!canManage) return;

    const nextLyrics = draftLyrics.filter(
      (_, lineIndex) => lineIndex !== index,
    );
    const nextIndex =
      nextLyrics.length === 0 ? null : Math.min(index, nextLyrics.length - 1);

    setDraftLyrics(nextLyrics);
    setSelectedLineIndexes(nextIndex == null ? [] : [nextIndex]);
    setEditingLineIndex(null);
  };

  const { handleLineTimeChange, handleResizeMouseDown } = useTimelineResize({
    draftLyrics,
    currentTime,
    draftSync,
    pixelsPerSecond,
    setDraftLyrics,
  });

  const {
    consumeLineClick,
    handleLineMouseDown,
    handleTrackMouseDown,
    selectionRect,
    selectLine,
  } = useTimelineSelection({
    canManage,
    currentTime,
    draftLyrics,
    draftSync,
    pixelsPerSecond,
    selectedLineIndexes,
    setDraftLyrics,
    setSelectedLineIndexes,
    timelineStart,
    trackRef,
  });

  useEditorGuard("lyrics", dirty, isSaving);
  const pausePlayback = rawPlayer.pause;
  const seekAndPlay = rawPlayer.seekAndPlay;
  useLayoutEffect(() => pausePlayback, [pausePlayback]);
  useEffect(() => {
    if (!desktop) pausePlayback();
  }, [desktop, pausePlayback]);
  useEditorShortcuts({
    root: containerRef,
    enabled: desktop,
    toggle: player.togglePlay,
    seekBy: player.seekBy,
    undo: () => {
      if (canManage && !isSaving) history.undo();
    },
    redo: () => {
      if (canManage && !isSaving) history.redo();
    },
    save: () => void save(),
    selectActive: () => {
      if (activeLineIndex >= 0) selectLine(activeLineIndex);
    },
  });
  const selectedLine = draftLyrics[selectedLineIndexes[0]];
  useEffect(() => {
    if (!loop || !selectedLine || !rawPlayer.shouldPlay) return;
    const start = Math.max(0, selectedLine.start + draftSync - 1),
      end = selectedLine.end + draftSync;
    if (end > start && (currentTime >= end || currentTime < start))
      seekAndPlay(start);
  }, [
    loop,
    selectedLine,
    draftSync,
    currentTime,
    rawPlayer.shouldPlay,
    seekAndPlay,
  ]);

  const handleSeekDisplayTime = (time: number) => {
    player.seekAndPause(time);
  };

  const handleRulerClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const rect = timeline.getBoundingClientRect();
    const time =
      timelineStart +
      (timeline.scrollTop + event.clientY - rect.top) / pixelsPerSecond;
    handleSeekDisplayTime(time);
  };

  async function save() {
    if (!canManage || isSaving || !desktop) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/musics/${music.id}/lyrics`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revision: saved.revision,
          lyricTrack: {
            musicId: music.id,
            sync: roundTime(draftSync),
            lyricJson: getNormalizedLyrics(draftLyrics),
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "저장에 실패했습니다.");
      setSaved(result.document);
      history.update(() => ({
        lyrics: getNormalizedLyrics(result.document.lyricTrack.lyricJson),
        sync: result.document.lyricTrack.sync,
      }));
      setRefresh(result.refresh ?? []);
      const issues = Object.keys(result.guideIssues ?? {}).length;
      setMessage({
        tone: "success",
        text: issues
          ? `저장했습니다. 콜의 가사 참조 ${issues}건을 재확인해 주세요.`
          : "저장했습니다.",
      });
    } catch (error) {
      setMessage({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "연결에 실패했습니다. 초안은 유지됩니다.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div data-editor-workspace ref={containerRef} className={styles.editor}>
      <RefreshStatus results={refresh} onRefresh={setRefresh} />
      {!desktop && (
        <p className="p-6 text-sm">
          타임라인은 편집 영역 너비 1024px 이상에서 이용해 주세요. 사이드바를
          접거나 창을 넓히면 초안이 유지됩니다.
        </p>
      )}
      <div
        className={styles.workspace}
        style={{ display: desktop ? undefined : "none" }}
      >
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize="50%" minSize="320px">
            <TimelineSidePanel
              player={player}
              dirty={dirty}
              canManage={canManage && !isSaving}
              isSaving={isSaving}
              message={message}
              historyControls={{
                canUndo: history.canUndo,
                canRedo: history.canRedo,
                undo: history.undo,
                redo: history.redo,
                loop,
                toggleLoop: () => setLoop((value) => !value),
                hasSelection: !!selectedLine,
                copy: async () => {
                  try {
                    await copyEditorDraft({
                      musicId: music.id,
                      sync: draftSync,
                      lyricJson: draftLyrics,
                    });
                    setMessage({
                      tone: "success",
                      text: "가사 초안을 복사했습니다.",
                    });
                  } catch {
                    setMessage({
                      tone: "error",
                      text: "클립보드 권한을 확인해 주세요.",
                    });
                  }
                },
              }}
              onSave={save}
              onReset={() => {
                if (!window.confirm("저장하지 않은 변경을 초기화할까요?"))
                  return;
                history.reset({
                  lyrics: getNormalizedLyrics(lyricTrack.lyricJson),
                  sync: lyricTrack.sync,
                });
                setLoop(false);
                setMessage(null);
              }}
              srtExport={{
                music,
                lyrics: canManage ? draftLyrics : lyricTrack.lyricJson,
              }}
            />
          </ResizablePanel>
          <ResizableHandle aria-label="영상과 타임라인 너비 조절" />
          <ResizablePanel defaultSize="50%" minSize="320px">
            <TimelineCanvas
              activeLineIndex={activeLineIndex}
              currentTime={currentTime}
              draftLyrics={draftLyrics}
              draftSync={draftSync}
              editingLineIndex={editingLineIndex}
              pixelsPerSecond={pixelsPerSecond}
              selectedLineIndexes={selectedLineIndexes}
              selectionRect={selectionRect}
              timelineEnd={timelineEnd}
              timelineRef={timelineRef}
              timelineStart={timelineStart}
              trackRef={trackRef}
              timelineHeight={timelineHeight}
              onConsumeLineClick={consumeLineClick}
              onDeleteLine={deleteLine}
              onEditLine={setEditingLineIndex}
              onLineTimeChange={handleLineTimeChange}
              onLineMouseDown={handleLineMouseDown}
              onResizeMouseDown={handleResizeMouseDown}
              onRulerClick={handleRulerClick}
              onSelectLine={selectLine}
              onSplitLine={splitLine}
              onTrackMouseDown={handleTrackMouseDown}
              onUpdateLine={updateLine}
              canManage={canManage && !isSaving}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
