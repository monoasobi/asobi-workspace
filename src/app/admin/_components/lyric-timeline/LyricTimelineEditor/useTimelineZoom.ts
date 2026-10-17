"use client";

import {
  useCallback,
  useEffect,
  type Dispatch,
  type RefObject,
  type WheelEvent as ReactWheelEvent,
  type SetStateAction,
} from "react";
import {
  MAX_PIXELS_PER_SECOND,
  MIN_PIXELS_PER_SECOND,
  clamp,
} from "../time";
import { ZOOM_FACTOR } from "./timelineUtils";

interface UseTimelineZoomParams {
  currentTime: number;
  pixelsPerSecond: number;
  setPixelsPerSecond: Dispatch<SetStateAction<number>>;
  timelineRef: RefObject<HTMLDivElement | null>;
  timelineStart: number;
}

export const useTimelineZoom = ({
  currentTime,
  pixelsPerSecond,
  setPixelsPerSecond,
  timelineRef,
  timelineStart,
}: UseTimelineZoomParams) => {
  const getAnchorTime = useCallback(
    (clientY?: number) => {
      const timeline = timelineRef.current;
      if (!timeline) return currentTime || 0;

      const rect = timeline.getBoundingClientRect();
      const y = clientY == null ? rect.height / 2 : clientY - rect.top;
      return timelineStart + (timeline.scrollTop + y) / pixelsPerSecond;
    },
    [currentTime, pixelsPerSecond, timelineRef, timelineStart],
  );

  const zoomTimeline = useCallback(
    (nextPixels: number, anchorTime = getAnchorTime()) => {
      const timeline = timelineRef.current;
      const nextPixelsPerSecond = clamp(
        nextPixels,
        MIN_PIXELS_PER_SECOND,
        MAX_PIXELS_PER_SECOND,
      );

      if (!timeline) {
        setPixelsPerSecond(nextPixelsPerSecond);
        return;
      }

      const rect = timeline.getBoundingClientRect();
      const anchorY =
        anchorTime === currentTime
          ? rect.height / 2
          : (anchorTime - timelineStart) * pixelsPerSecond -
            timeline.scrollTop;

      setPixelsPerSecond(nextPixelsPerSecond);

      requestAnimationFrame(() => {
        timeline.scrollTop =
          (anchorTime - timelineStart) * nextPixelsPerSecond - anchorY;
      });
    },
    [
      currentTime,
      getAnchorTime,
      pixelsPerSecond,
      setPixelsPerSecond,
      timelineRef,
      timelineStart,
    ],
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!event.metaKey && !event.ctrlKey) return;

      event.stopPropagation();
      event.preventDefault();

      const direction = event.deltaY > 0 ? -1 : 1;
      const factor = Math.pow(ZOOM_FACTOR, direction);
      zoomTimeline(pixelsPerSecond * factor, getAnchorTime(event.clientY));
    },
    [getAnchorTime, pixelsPerSecond, zoomTimeline],
  );

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    timeline.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      timeline.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel, timelineRef]);

  const handleReactWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!event.metaKey && !event.ctrlKey) return;

    event.preventDefault();
    event.stopPropagation();
  };

  return {
    handleWheel: handleReactWheel,
    zoomTimeline,
  };
};
