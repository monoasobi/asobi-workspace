"use client";
import type { LyricLine } from "@asobi/content-core/lyrics";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@asobi/ui/components/accordion";
import { Button } from "@asobi/ui/components/button";
import { Input } from "@asobi/ui/components/input";
import { MIN_LINE_DURATION, roundTime } from "../time";
import type { TimelineEdge } from "./useTimelineResize";
interface TimelineLineEditorProps {
  currentTime: number;
  draftSync: number;
  index: number;
  line: LyricLine;
  onDelete: (index: number) => void;
  onLineTimeChange: (index: number, edge: TimelineEdge, value: string) => void;
  onSplit: (index: number) => void;
  onUpdateLine: (index: number, patch: Partial<LyricLine>) => void;
}

export const TimelineLineEditor = ({
  currentTime,
  draftSync,
  index,
  line,
  onDelete,
  onLineTimeChange,
  onSplit,
  onUpdateLine,
}: TimelineLineEditorProps) => {
  const splitTime = roundTime(currentTime - draftSync);
  const canSplit =
    splitTime > line.start + MIN_LINE_DURATION &&
    splitTime < line.end - MIN_LINE_DURATION;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">Line {index + 1}</h3>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            if (canSplit) onSplit(index);
            else
              window.alert(
                "인디케이터를 이 블록 안쪽에 놓은 뒤 다시 분할해 주세요.",
              );
          }}
        >
          분할
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            if (
              window.confirm(
                `Line ${index + 1}을 삭제할까요? 저장 전 실행 취소로 복구할 수 있습니다.`,
              )
            )
              onDelete(index);
          }}
        >
          삭제
        </Button>
      </div>
      {(
        [
          ["jp", "일본어"],
          ["jpReading", "한국어 독음"],
          ["kr", "한국어"],
          ["en", "영어 해석"],
          ["enReading", "영어 독음"],
        ] as const
      ).map(([field, label]) => (
        <label className="grid gap-1 text-xs" key={field}>
          {label}
          <textarea
            className="min-h-16 w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={line[field] ?? ""}
            onChange={(event) =>
              onUpdateLine(index, { [field]: event.target.value })
            }
          />
        </label>
      ))}
      <Accordion key={line.id ?? index} type="single" collapsible>
        <AccordionItem value="timing">
          <AccordionTrigger>시작·끝 시간</AccordionTrigger>
          <AccordionContent>
            <div className="flex gap-2">
              {(["start", "end"] as const).map((edge) => (
                <label className="grid min-w-0 flex-1 gap-1 text-xs" key={edge}>
                  {edge === "start" ? "시작 (초)" : "끝 (초)"}
                  <Input
                    type="number"
                    step="0.01"
                    value={line[edge]}
                    onChange={(event) =>
                      onLineTimeChange(index, edge, event.target.value)
                    }
                  />
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
