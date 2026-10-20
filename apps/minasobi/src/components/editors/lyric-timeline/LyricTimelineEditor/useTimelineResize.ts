"use client";

import type { LyricLine } from "@asobi/content-core/lyrics";
import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type SetStateAction,
} from "react";
import { snapTimelineDelta } from "./timelineSnap";
import { MIN_LINE_DURATION, clamp, roundTime } from "../time";

export type TimelineEdge = "start" | "end";

type DragState = {
  index: number;
  edge: TimelineEdge;
  startY: number;
  lyrics: LyricLine[];
};

interface UseTimelineResizeParams {
  draftLyrics: LyricLine[];
  currentTime: number;
  draftSync: number;
  pixelsPerSecond: number;
  setDraftLyrics: Dispatch<SetStateAction<LyricLine[]>>;
}

export const useTimelineResize = ({
  draftLyrics,
  currentTime,
  draftSync,
  pixelsPerSecond,
  setDraftLyrics,
}: UseTimelineResizeParams) => {
  const dragRef = useRef<DragState | null>(null);

  const resizeLineStart = useCallback(
    (index: number, nextStart: number, sourceLyrics = draftLyrics) => {
      const next = sourceLyrics.map((line) => ({ ...line }));
      const line = next[index];
      if (!line) return sourceLyrics;

      const minStart =
        index > 0 ? next[index - 1].start + MIN_LINE_DURATION : 0;
      const maxStart = line.end - MIN_LINE_DURATION;
      const start = roundTime(clamp(nextStart, minStart, maxStart));

      line.start = start;
      if (index > 0 && next[index - 1].end > start) {
        next[index - 1].end = start;
      }

      return next;
    },
    [draftLyrics],
  );

  const resizeLineEnd = useCallback(
    (index: number, nextEnd: number, sourceLyrics = draftLyrics) => {
      const next = sourceLyrics.map((line) => ({ ...line }));
      const line = next[index];
      if (!line) return sourceLyrics;

      const minEnd = line.start + MIN_LINE_DURATION;
      const maxEnd =
        index < next.length - 1
          ? next[index + 1].end - MIN_LINE_DURATION
          : Number.POSITIVE_INFINITY;
      const end = roundTime(clamp(nextEnd, minEnd, maxEnd));

      line.end = end;
      if (index < next.length - 1 && next[index + 1].start < end) {
        next[index + 1].start = end;
      }

      return next;
    },
    [draftLyrics],
  );

  const handleLineTimeChange = (
    index: number,
    edge: TimelineEdge,
    value: string,
  ) => {
    const time = Number(value);
    if (!Number.isFinite(time)) return;
    setDraftLyrics((prev) =>
      edge === "start"
        ? resizeLineStart(index, time, prev)
        : resizeLineEnd(index, time, prev),
    );
  };

  const handleResizeMouseDown = (
    event: ReactMouseEvent<HTMLButtonElement>,
    index: number,
    edge: TimelineEdge,
  ) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = {
      index,
      edge,
      startY: event.clientY,
      lyrics: draftLyrics,
    };
  };

  const handleDragMove = useCallback(
    (event: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const deltaSeconds = (event.clientY - drag.startY) / pixelsPerSecond;
      const line = drag.lyrics[drag.index];
      if (!line) return;

      const edgeTime = line[drag.edge];
      const min =
        drag.edge === "start"
          ? drag.index > 0
            ? drag.lyrics[drag.index - 1].start + MIN_LINE_DURATION
            : 0
          : line.start + MIN_LINE_DURATION;
      const max =
        drag.edge === "start"
          ? line.end - MIN_LINE_DURATION
          : (drag.lyrics[drag.index + 1]?.end ?? Infinity) - MIN_LINE_DURATION;
      const nextTime =
        edgeTime +
        snapTimelineDelta(
          deltaSeconds,
          [edgeTime],
          currentTime - draftSync,
          pixelsPerSecond,
          min - edgeTime,
          max - edgeTime,
          event.metaKey || event.ctrlKey,
        );
      setDraftLyrics(
        drag.edge === "start"
          ? resizeLineStart(drag.index, nextTime, drag.lyrics)
          : resizeLineEnd(drag.index, nextTime, drag.lyrics),
      );
    },
    [
      currentTime,
      draftSync,
      pixelsPerSecond,
      resizeLineEnd,
      resizeLineStart,
      setDraftLyrics,
    ],
  );

  const stopDragging = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!dragRef.current) return;
      event.preventDefault();
      handleDragMove(event);
    };

    const handleMouseUp = () => {
      stopDragging();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleDragMove, stopDragging]);

  return {
    handleLineTimeChange,
    handleResizeMouseDown,
  };
};
