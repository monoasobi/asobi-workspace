"use client";

import type { LyricLine } from "@asobi/content-core/lyrics";
import {
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  type CSSProperties,
} from "react";
import styles from "../LyricTimelineEditor.styles";
import { getDisplayEnd, getDisplayStart } from "../time";
import { getTimelineGridInterval, getTimelineTicks } from "./timelineUtils";
import { TimelineLineBlock } from "./TimelineLineBlock";
import { formatTime } from "@asobi/content-core/lyricTime";
import type { LyricTextField } from "@asobi/content-core/lyricText";
import { TimelineTools } from "../../shared/TimelineTools";
import { MIN_PIXELS_PER_SECOND, MAX_PIXELS_PER_SECOND } from "../time";

interface TimelineCanvasProps {
  textFields: LyricTextField[];
  onTextFieldsChange: (fields: LyricTextField[]) => void;
  zoom: (value: number) => void;
  onCenter: () => void;
  activeLineIndex: number;
  canManage: boolean;
  currentTime: number;
  draftLyrics: LyricLine[];
  draftSync: number;
  pixelsPerSecond: number;
  selectedLineIndexes: number[];
  selectionRect: {
    left: number;
    top: number;
    width: number;
    height: number;
  } | null;
  timelineEnd: number;
  timelineRef: RefObject<HTMLDivElement | null>;
  timelineStart: number;
  trackRef: RefObject<HTMLDivElement | null>;
  timelineHeight: number;
  onConsumeLineClick: (index: number) => boolean;
  onLineMouseDown: (
    event: ReactMouseEvent<HTMLDivElement>,
    index: number,
  ) => void;
  onResizeMouseDown: (
    event: ReactMouseEvent<HTMLButtonElement>,
    index: number,
    edge: "start" | "end",
  ) => void;
  onRulerClick: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onSelectLine: (index: number) => void;
  onTrackMouseDown: (event: ReactMouseEvent<HTMLDivElement>) => void;
}

export const TimelineCanvas = ({
  textFields,
  onTextFieldsChange,
  zoom,
  onCenter,
  activeLineIndex,
  canManage,
  currentTime,
  draftLyrics,
  draftSync,
  pixelsPerSecond,
  selectedLineIndexes,
  selectionRect,
  timelineEnd,
  timelineRef,
  timelineStart,
  trackRef,
  timelineHeight,
  onConsumeLineClick,
  onLineMouseDown,
  onResizeMouseDown,
  onRulerClick,
  onSelectLine,
  onTrackMouseDown,
}: TimelineCanvasProps) => {
  const timelineToPixel = (time: number) =>
    (time - timelineStart) * pixelsPerSecond;
  const ticks = getTimelineTicks(timelineStart, timelineEnd);
  const gridInterval = getTimelineGridInterval(pixelsPerSecond);
  const trackStyle = {
    "--timeline-grid-height": `${gridInterval * pixelsPerSecond}px`,
  } as CSSProperties;

  return (
    <section className={styles.timelineSection}>
      <div className={styles.timelineScroll} ref={timelineRef}>
        <div
          className={styles.timelineCanvas}
          style={{ height: timelineHeight }}
        >
          <div
            className={styles.ruler}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onRulerClick}
          >
            {ticks.map((time) => (
              <div
                key={time}
                className={styles.tick}
                style={{ top: timelineToPixel(time) }}
              >
                {formatTime(time)}
              </div>
            ))}
          </div>

          <div
            className={styles.playhead}
            style={{ top: timelineToPixel(currentTime) }}
            aria-label={`현재 시간 ${formatTime(currentTime)}`}
          />

          <div
            className={styles.track}
            data-can-manage={canManage}
            ref={trackRef}
            style={trackStyle}
            onMouseDown={onTrackMouseDown}
          >
            {selectionRect && (
              <div
                className={styles.selectionRect}
                style={selectionRect}
                aria-hidden="true"
              />
            )}
            {draftLyrics.map((line, index) => {
              const displayStart = getDisplayStart(line, draftSync);
              const displayEnd = getDisplayEnd(line, draftSync);
              const top = timelineToPixel(displayStart);
              const height = Math.max(
                10,
                (displayEnd - displayStart) * pixelsPerSecond,
              );

              return (
                <TimelineLineBlock
                  key={line.id ?? index}
                  textFields={textFields}
                  index={index}
                  canManage={canManage}
                  isActive={activeLineIndex === index}
                  isSelected={selectedLineIndexes.includes(index)}
                  top={top}
                  line={line}
                  height={height}
                  onConsumeClick={onConsumeLineClick}
                  onMouseDown={onLineMouseDown}
                  onResizeMouseDown={onResizeMouseDown}
                  onSelect={onSelectLine}
                />
              );
            })}
          </div>
        </div>
      </div>
      <TimelineTools
        scale={pixelsPerSecond}
        minScale={MIN_PIXELS_PER_SECOND}
        maxScale={MAX_PIXELS_PER_SECOND}
        zoom={zoom}
        onCenter={onCenter}
        fields={["kr", "jpReading", "en", "enReading"]}
        selectedFields={textFields}
        onFieldsChange={onTextFieldsChange}
      />
    </section>
  );
};
