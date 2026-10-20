"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import { isEditorTextTarget } from "./editorKeys";

export const MIN_TIMELINE_SCALE = 8;
export const MAX_TIMELINE_SCALE = 480;
type Anchor = { time: number; offset: number };

export function useTimelineZoom(
  viewportRef: RefObject<HTMLDivElement | null>,
  canvasRef: RefObject<HTMLDivElement | null>,
  initialScale = 48,
  minScale = MIN_TIMELINE_SCALE,
  maxScale = MAX_TIMELINE_SCALE,
) {
  const [scale, setScale] = useState(initialScale);
  const pending = useRef<Anchor | null>(null);
  const gesture = useRef<
    (Anchor & { pointer: number; y: number; scale: number }) | null
  >(null);
  const suppressClick = useRef(false);
  const currentScale = useRef(scale);

  const anchor = useCallback(
    (offset: number): Anchor | null => {
      const node = viewportRef.current;
      const content = canvasRef.current;
      if (!node || !content) return null;
      return {
        time:
          (node.getBoundingClientRect().top +
            offset -
            content.getBoundingClientRect().top) /
          currentScale.current,
        offset,
      };
    },
    [viewportRef, canvasRef],
  );

  const zoom = useCallback(
    (
      value: number,
      point = anchor((viewportRef.current?.clientHeight ?? 0) / 2),
    ) => {
      const next = Math.round(Math.max(minScale, Math.min(maxScale, value)));
      if (next === currentScale.current) return;
      pending.current = point;
      currentScale.current = next;
      setScale(next);
    },
    [anchor, viewportRef, minScale, maxScale],
  );

  useLayoutEffect(() => {
    const point = pending.current;
    const node = viewportRef.current;
    const content = canvasRef.current;
    if (point && node && content) {
      const top =
        content.getBoundingClientRect().top -
        node.getBoundingClientRect().top +
        node.scrollTop;
      node.scrollTo({
        top: top + point.time * scale - point.offset,
        behavior: "instant",
      });
    }
    pending.current = null;
  }, [scale, viewportRef, canvasRef]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    // The scrollbar is a sibling of the viewportRef; include it in modified gestures.
    const surface =
      node.closest<HTMLElement>('[data-slot="scroll-area"]') ?? node;
    function cancel() {
      const pointer = gesture.current?.pointer;
      gesture.current = null;
      node!.style.removeProperty("cursor");
      if (pointer !== undefined && node!.hasPointerCapture(pointer))
        node!.releasePointerCapture(pointer);
    }
    // On call blocks, Cmd/Ctrl belongs to precise dragging rather than zoom.
    function down(event: PointerEvent) {
      suppressClick.current = false;
      if (
        (event.target instanceof Element &&
          !!event.target.closest(
            "[data-call-drag], [data-lyric-resize], [data-timeline-drag]",
          )) ||
        !(event.metaKey || event.ctrlKey) ||
        event.button !== 0 ||
        event.isPrimary === false ||
        gesture.current
      )
        return;
      const point = anchor(event.clientY - node!.getBoundingClientRect().top);
      if (!point) return;
      event.preventDefault();
      event.stopPropagation();
      gesture.current = {
        pointer: event.pointerId,
        y: event.clientY,
        scale: currentScale.current,
        ...point,
      };
      suppressClick.current = true;
      node!.setPointerCapture(event.pointerId);
      node!.style.setProperty("cursor", "ns-resize");
    }
    function move(event: PointerEvent) {
      const current = gesture.current;
      if (!current || current.pointer !== event.pointerId) return;
      event.preventDefault();
      event.stopPropagation();
      zoom(
        current.scale * Math.exp((current.y - event.clientY) / 180),
        current,
      );
    }
    function finish(event: PointerEvent) {
      if (gesture.current?.pointer !== event.pointerId) return;
      event.preventDefault();
      event.stopPropagation();
      cancel();
    }
    function lost(event: PointerEvent) {
      if (event.target === node) finish(event);
    }
    function click(event: MouseEvent) {
      if (!suppressClick.current || event.detail === 0) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick.current = false;
    }
    function wheel(event: WheelEvent) {
      if (!(event.metaKey || event.ctrlKey) || gesture.current) return;
      event.preventDefault();
      event.stopPropagation();
      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? node!.clientHeight
            : 1);
      zoom(
        currentScale.current * Math.exp(-delta / 300),
        anchor(event.clientY - node!.getBoundingClientRect().top),
      );
    }
    function key(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        !(event.ctrlKey || event.metaKey) ||
        isEditorTextTarget(event.target)
      )
        return;
      const scope = surface.closest("[data-editor-workspace]") ?? surface;
      if (
        event.target instanceof Element &&
        event.target !== document.body &&
        !scope.contains(event.target) &&
        !event.target.closest("[data-editor-portal]")
      )
        return;
      const direction = ["=", "+"].includes(event.key)
        ? 1
        : event.key === "-"
          ? -1
          : 0;
      if (!direction) return;
      event.preventDefault();
      event.stopPropagation();
      zoom(currentScale.current * Math.pow(1.18, direction));
    }
    window.addEventListener("keydown", key, true);
    // Native capture receives modified gestures before the timeline's React drag handlers.
    // Window listeners keep the drag alive when the pointer leaves the viewportRef.
    surface.addEventListener("pointerdown", down, true);
    node.addEventListener("lostpointercapture", lost);
    surface.addEventListener("click", click, true);
    surface.addEventListener("wheel", wheel, { capture: true, passive: false });
    window.addEventListener("pointermove", move, {
      capture: true,
      passive: false,
    });
    window.addEventListener("pointerup", finish, true);
    window.addEventListener("pointercancel", finish, true);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("keydown", key, true);
      surface.removeEventListener("pointerdown", down, true);
      node.removeEventListener("lostpointercapture", lost);
      surface.removeEventListener("click", click, true);
      surface.removeEventListener("wheel", wheel, true);
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", finish, true);
      window.removeEventListener("pointercancel", finish, true);
      window.removeEventListener("blur", cancel);
      cancel();
    };
  }, [viewportRef, anchor, zoom]);

  return { scale, zoom };
}
