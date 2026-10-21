"use client";

import type { LyricLine } from "@asobi/content-core/lyrics";
import type { MouseEvent as ReactMouseEvent } from "react";
import styles from "../LyricTimelineEditor.styles";
import {
  lyricTextLang,
  type LyricTextField,
} from "@asobi/content-core/lyricText";

interface TimelineLineBlockProps {
  textFields: LyricTextField[];
  canManage: boolean;
  index: number;
  isActive: boolean;
  isSelected: boolean;
  top: number;
  line: LyricLine;
  height: number;
  onConsumeClick: (index: number) => boolean;
  onMouseDown: (event: ReactMouseEvent<HTMLDivElement>, index: number) => void;
  onResizeMouseDown: (
    event: ReactMouseEvent<HTMLButtonElement>,
    index: number,
    edge: "start" | "end",
  ) => void;
  onSelect: (index: number) => void;
}

export const TimelineLineBlock = ({
  textFields,
  canManage,
  index,
  isActive,
  isSelected,
  top,
  line,
  height,
  onConsumeClick,
  onMouseDown,
  onResizeMouseDown,
  onSelect,
}: TimelineLineBlockProps) => {
  return (
    <div
      data-timeline-drag
      className={styles.block}
      data-active={isActive}
      data-can-manage={canManage}
      data-selected={isSelected}
      style={{ top, height }}
      role="button"
      tabIndex={0}
      onMouseDown={(event) => {
        if (canManage) onMouseDown(event, index);
      }}
      onClick={(event) => {
        event.preventDefault();

        if (onConsumeClick(index)) return;

        if (!isSelected) onSelect(index);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onSelect(index);
        }
      }}
    >
      {canManage && (
        <button
          type="button"
          className={`${styles.handle} ${styles.handleStart}`}
          aria-label="start 조정"
          onMouseDown={(event) => onResizeMouseDown(event, index, "start")}
          onClick={(event) => event.stopPropagation()}
        />
      )}
      <div className={styles.blockText}>
        <span lang="ja" className={styles.blockMain}>
          {line.jp || `Line ${index + 1}`}
        </span>
        {textFields.map((field) => (
          <span
            key={field}
            lang={lyricTextLang[field]}
            className={styles.blockSub}
          >
            {line[field] || "자료 없음"}
          </span>
        ))}
      </div>
      {canManage && (
        <button
          type="button"
          className={`${styles.handle} ${styles.handleEnd}`}
          aria-label="end 조정"
          onMouseDown={(event) => onResizeMouseDown(event, index, "end")}
          onClick={(event) => event.stopPropagation()}
        />
      )}
    </div>
  );
};
