"use client";

import type { LyricLine } from "@asobi/content-core/lyrics";
import {
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  type CSSProperties,
} from "react";
import styles from "../LyricTimelineEditor.module.css";
import { formatTime, getDisplayEnd, getDisplayStart } from "../time";
import { getTimelineGridInterval, getTimelineTicks } from "./timelineUtils";
import { TimelineLineBlock } from "./TimelineLineBlock";
import type { TimelineEdge } from "./useTimelineResize";

interface TimelineCanvasProps {
  activeLineIndex: number;
  canManage: boolean;
  currentTime: number;
  draftLyrics: LyricLine[];
  draftSync: number;
  editingLineIndex: number | null;
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
  onDeleteLine: (index: number) => void;
  onEditLine: (index: number | null) => void;
  onLineTimeChange: (index: number, edge: TimelineEdge, value: string) => void;
  onLineMouseDown: (
    event: ReactMouseEvent<HTMLDivElement>,
    index: number,
  ) => void;
  onResizeMouseDown: (
    event: ReactMouseEvent<HTMLButtonElement>,
    index: number,
    edge: TimelineEdge,
  ) => void;
  onRulerClick: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onSelectLine: (index: number) => void;
  onSplitLine: (index: number) => void;
  onTrackMouseDown: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onUpdateLine: (index: number, patch: Partial<LyricLine>) => void;
}

export const TimelineCanvas = ({
  activeLineIndex,
  canManage,
  currentTime,
  draftLyrics,
  draftSync,
  editingLineIndex,
  pixelsPerSecond,
  selectedLineIndexes,
  selectionRect,
  timelineEnd,
  timelineRef,
  timelineStart,
  trackRef,
  timelineHeight,
  onConsumeLineClick,
  onDeleteLine,
  onEditLine,
  onLineTimeChange,
  onLineMouseDown,
  onResizeMouseDown,
  onRulerClick,
  onSelectLine,
  onSplitLine,
  onTrackMouseDown,
  onUpdateLine,
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
          <div className={styles.ruler} onClick={onRulerClick}>
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
                  index={index}
                  canManage={canManage}
                  currentTime={currentTime}
                  draftSync={draftSync}
                  isActive={activeLineIndex === index}
                  isEditing={editingLineIndex === index}
                  isSelected={selectedLineIndexes.includes(index)}
                  top={top}
                  line={line}
                  height={height}
                  onConsumeClick={onConsumeLineClick}
                  onDelete={onDeleteLine}
                  onEdit={onEditLine}
                  onLineTimeChange={onLineTimeChange}
                  onMouseDown={onLineMouseDown}
                  onResizeMouseDown={onResizeMouseDown}
                  onSelect={onSelectLine}
                  onSplit={onSplitLine}
                  onUpdateLine={onUpdateLine}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
