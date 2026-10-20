"use client";
import { cn } from "@asobi/ui/lib/utils";
import { Button } from "@asobi/ui/components/button";
import { Badge } from "@asobi/ui/components/badge";
import type { CallType, LyricLine } from "@asobi/content-core/lyrics";
import { HandRaisedIcon, MicrophoneIcon } from "@heroicons/react/24/solid";
import { useMemo, useRef } from "react";
import styles from "./LyricsDisplayV2.styles";
import { getDisplayStart } from "@asobi/content-core/lyricTime";
type GroupPos = "solo" | "first" | "middle" | "last";
const TYPE_LABELS: Record<CallType, string> = {
  LOUD: "떼창",
  CLAP: "박수",
  CUSTOM: "콜",
};
const getGroupPos = (lines: LyricLine[], index: number): GroupPos | null => {
  const callType = lines[index].callType;
  if (!callType) return null;
  const prevSame = index > 0 && lines[index - 1].callType === callType;
  const nextSame =
    index < lines.length - 1 && lines[index + 1].callType === callType;
  if (!prevSame && !nextSame) return "solo";
  if (!prevSame && nextSame) return "first";
  if (prevSame && nextSame) return "middle";
  return "last";
};
export interface LyricsDisplayV2Props {
  lyrics: LyricLine[];
  activeIndex: number;
  offset: number;
  onSeek: (time: number) => void;
}
export const LyricsDisplayV2 = ({
  lyrics,
  activeIndex,
  offset,
  onSeek,
}: LyricsDisplayV2Props) => {
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const callGroupStarts = useMemo(
    () =>
      lyrics.flatMap((line, index) => {
        if (!line.callType) return [];
        const groupPos = getGroupPos(lyrics, index);
        if (groupPos !== "first" && groupPos !== "solo") return [];
        return [
          {
            index,
            startTime: getDisplayStart(line, offset),
            type: line.callType,
            label: line.callGuide || TYPE_LABELS[line.callType],
          },
        ];
      }),
    [lyrics, offset],
  );
  const handleJump = (time: number, index: number) => {
    onSeek(time);
    lineRefs.current
      .get(index)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  return (
    <div className={cn("flex flex-col gap-2 grow", styles.container)}>
      <div className={cn("flex items-center gap-2", styles.header)}>
        <div className={cn("flex items-center gap-1", styles.jumpButtons)}>
          {callGroupStarts.map((group, index) => (
            <Button
              key={`${group.type}-${group.startTime}-${index}`}
              type="button"
              size="sm"
              variant="secondary"
              className={
                group.type === "CLAP"
                  ? "border-yellow-600 bg-yellow-100 text-yellow-700"
                  : "border-primary bg-secondary text-primary"
              }
              onClick={() => handleJump(group.startTime, group.index)}
            >
              <span className={styles.icon}>
                {group.type === "CLAP" ? (
                  <HandRaisedIcon />
                ) : (
                  <MicrophoneIcon />
                )}
              </span>
              {group.label} {index + 1}
            </Button>
          ))}
        </div>
      </div>

      <div className={styles.scrollWrapper}>
        <div className={styles.scroll}>
          {lyrics.map((line, index) => {
            const isActive = index === activeIndex;
            const groupPos = getGroupPos(lyrics, index);
            const isGroupStart = groupPos === "solo" || groupPos === "first";
            return (
              <div
                key={`${line.start}-${index}`}
                ref={(element) => {
                  if (element) {
                    lineRefs.current.set(index, element);
                  } else {
                    lineRefs.current.delete(index);
                  }
                }}
                className={styles.line}
                data-active={isActive}
                data-call-type={line.callType ?? undefined}
                data-group-pos={groupPos ?? undefined}
                onClick={() => onSeek(getDisplayStart(line, offset))}
              >
                {line.callType && (isActive || isGroupStart) && (
                  <Badge
                    className={
                      line.callType === "CLAP"
                        ? "border-yellow-600 bg-yellow-100 text-yellow-700"
                        : "border-primary bg-secondary text-primary"
                    }
                  >
                    {line.callGuide || TYPE_LABELS[line.callType]}
                  </Badge>
                )}
                <p className={styles.japanese}>{line.jp}</p>
                <p className={styles.reading}>{line.jpReading}</p>
                <p className={styles.korean}>{line.kr}</p>
                {line.callGuide && line.callType === "CUSTOM" && (
                  <p
                    className={cn(
                      "type-caption text-muted-foreground",
                      styles.callGuide,
                    )}
                  >
                    {line.callGuide}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
