"use client";
import { useRef, useState, type PointerEvent, type RefObject } from "react";
import { roundTime } from "@asobi/content-core/callGuide";
import { lyricResizeLimits } from "@asobi/content-core/lyricPresentation";
import type { LyricLine } from "@asobi/content-core/lyrics";
import { snapCueBounds, type LyricSnapTarget } from "./timelineSnap";

type Resize = {
  pointer: number;
  index: number;
  edge: "start" | "end";
  y: number;
  scroll: number;
  start: number;
  end: number;
  snap?: LyricSnapTarget;
};

export function useLyricResize({
  canvas,
  viewport,
  lines,
  scale,
  sync,
  limit,
  disabled,
  targets,
  onSelect,
  onChange,
}: {
  canvas: RefObject<HTMLDivElement | null>;
  viewport: RefObject<HTMLDivElement | null>;
  lines: LyricLine[];
  scale: number;
  sync: number;
  limit: number;
  disabled: boolean;
  targets: LyricSnapTarget[];
  onSelect: (indexes: number[]) => void;
  onChange: (index: number, start: number, end: number) => void;
}) {
  const [drag, setDrag] = useState<Resize | null>(null);
  const anchor = useRef<Resize | null>(null);
  const latest = useRef<Resize | null>(null);
  function cancel() {
    const pointer = anchor.current?.pointer;
    anchor.current = latest.current = null;
    setDrag(null);
    if (pointer !== undefined && canvas.current?.hasPointerCapture(pointer))
      canvas.current.releasePointerCapture(pointer);
  }
  function start(
    event: PointerEvent<HTMLElement>,
    index: number,
    edge: Resize["edge"],
  ) {
    if (
      disabled ||
      !lines[index].id ||
      event.button !== 0 ||
      !event.isPrimary ||
      !canvas.current ||
      anchor.current
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    canvas.current.setPointerCapture(event.pointerId);
    const state: Resize = {
      pointer: event.pointerId,
      index,
      edge,
      y: event.clientY,
      scroll: viewport.current?.scrollTop ?? 0,
      start: lines[index].start,
      end: lines[index].end,
    };
    anchor.current = latest.current = state;
    setDrag(state);
    onSelect([index]);
  }
  function move(event: PointerEvent<HTMLElement>) {
    const state = anchor.current;
    if (!state || state.pointer !== event.pointerId || disabled) return;
    const node = viewport.current;
    if (node) {
      const rect = node.getBoundingClientRect();
      if (event.clientY > rect.bottom - 30)
        node.scrollBy({ top: 12, behavior: "instant" });
      else if (event.clientY < rect.top + 30)
        node.scrollBy({ top: -12, behavior: "instant" });
    }
    const { min, max } = lyricResizeLimits(
      lines,
      state.index,
      -sync,
      limit - sync,
    );
    const delta =
      (event.clientY - state.y + (node?.scrollTop ?? 0) - state.scroll) / scale;
    const next = { ...state, snap: undefined as LyricSnapTarget | undefined };
    if (state.edge === "start")
      next.start = roundTime(
        Math.max(min, Math.min(state.end - 0.01, state.start + delta)),
      );
    else
      next.end = roundTime(
        Math.max(state.start + 0.01, Math.min(max, state.end + delta)),
      );
    if (!(event.metaKey || event.ctrlKey))
      Object.assign(
        next,
        snapCueBounds(
          next.start,
          next.end,
          state.edge,
          targets,
          scale,
          min,
          max,
        ),
      );
    latest.current = next;
    setDrag(next);
  }
  function finish(event: PointerEvent<HTMLElement>) {
    const state = latest.current;
    const original = anchor.current;
    if (!state || state.pointer !== event.pointerId) return;
    if (
      !disabled &&
      (state.start !== original?.start || state.end !== original?.end)
    )
      onChange(state.index, state.start, state.end);
    cancel();
  }
  return { drag, start, move, finish, cancel };
}
