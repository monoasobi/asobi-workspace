"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  snapshotLine,
  roundTime,
  type CallCue,
  type CallGuide,
} from "@/lib/callGuide";
import { resolveLyricPresentation } from "@/lib/lyricPresentation";
import type { LyricLine } from "@/types/lyric";
import { NumberField } from "./NumberField";

export function LyricInspector({
  line,
  lines,
  guide,
  cue,
  sync,
  disabled,
  onChange,
}: {
  line?: LyricLine;
  lines: LyricLine[];
  guide: CallGuide;
  cue?: CallCue;
  sync: number;
  disabled: boolean;
  onChange: (guide: CallGuide) => void;
}) {
  const presentation = resolveLyricPresentation(guide, lines);
  const trim = guide.lyricEnds?.find((item) => item.source.id === line?.id);
  function setEnd(end: number) {
    if (disabled || !line?.id) return;
    const others = (guide.lyricEnds ?? []).filter(
      (item) => item.source.id !== line.id,
    );
    onChange({
      ...guide,
      lyricEnds:
        end === line.end
          ? others
          : [...others, { source: snapshotLine(line), end: roundTime(end) }],
    });
  }
  function updateNote(
    id: string,
    patch: Partial<NonNullable<CallGuide["guides"]>[number]>,
  ) {
    if (!disabled)
      onChange({
        ...guide,
        guides: guide.guides?.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      });
  }
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-sm font-semibold">가사 표시 · 안내 가이드</h2>
      {line && (
        <fieldset
          disabled={disabled || !line.id}
          className="space-y-3 rounded-lg border p-3"
        >
          <p className="text-sm font-medium">{line.jp}</p>
          <p className="text-xs text-muted-foreground">
            원본 {(line.start + sync).toFixed(2)} ~{" "}
            {(line.end + sync).toFixed(2)}초 · 표시 종료만 줄입니다.
          </p>
          {line.id &&
            (presentation.warnings[line.id] ||
              presentation.issues[line.id]) && (
              <p role="alert" className="text-xs text-destructive">
                {presentation.warnings[line.id] || presentation.issues[line.id]}
              </p>
            )}
          <NumberField
            label="라우드아소비 표시 종료 (재생 초)"
            value={roundTime((trim?.end ?? line.end) + sync)}
            min={line.start + sync + 0.01}
            max={line.end + sync}
            onChange={(value) => setEnd(value - sync)}
          />
          <div className="flex flex-wrap gap-1">
            <Button
              size="xs"
              variant="outline"
              disabled={
                !cue || cue.start < line.start + 0.01 || cue.start >= line.end
              }
              onClick={() => cue && setEnd(cue.start)}
            >
              선택 콜 시작에 맞추기
            </Button>
            <Button
              size="xs"
              variant="ghost"
              disabled={!trim}
              onClick={() => setEnd(line.end)}
            >
              원본으로 복원
            </Button>
            {trim && line.id && presentation.warnings[line.id] && (
              <Button
                size="xs"
                variant="outline"
                disabled={trim.end < line.start + 0.01 || trim.end >= line.end}
                onClick={() => setEnd(trim.end)}
              >
                현재 원본으로 보정 재확인
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            가사 내용과 MONOASOBI 원본은 변경하지 않습니다. 전체 저장으로
            반영됩니다.
          </p>
        </fieldset>
      )}
      {!!guide.lyricEnds?.length && (
        <Accordion type="single" collapsible>
          <AccordionItem value="trims">
            <AccordionTrigger>
              종료 보정 목록 ({guide.lyricEnds.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {guide.lyricEnds.map((item) => (
                  <div
                    key={item.source.id}
                    className="rounded border p-2 text-xs"
                  >
                    <p>
                      {item.source.jp} → {(item.end + sync).toFixed(2)}초
                    </p>
                    {(presentation.warnings[item.source.id] ||
                      presentation.issues[item.source.id]) && (
                      <p className="text-destructive">
                        {presentation.warnings[item.source.id] ||
                          presentation.issues[item.source.id]}
                      </p>
                    )}
                    <Button
                      size="xs"
                      variant="ghost"
                      disabled={disabled}
                      onClick={() =>
                        onChange({
                          ...guide,
                          lyricEnds: guide.lyricEnds?.filter(
                            (entry) => entry.source.id !== item.source.id,
                          ),
                        })
                      }
                    >
                      보정 삭제
                    </Button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      <p className="text-xs text-muted-foreground">
        가이드는 가사 사이에 삽입되는 안내입니다. 콜 타이밍·박자와 연결되지
        않습니다.
      </p>
      <Accordion
        type="multiple"
        key={`${line?.id ?? "intro"}:${guide.guides?.map((note) => note.id).join(",")}`}
        defaultValue={guide.guides
          ?.filter(
            (note) =>
              note.beforeLineId === (line?.id ?? null) ||
              !note.labels.ko.trim(),
          )
          .map((note) => note.id)}
      >
        {guide.guides?.map((note) => (
          <AccordionItem key={note.id} value={note.id}>
            <AccordionTrigger>
              <span className="min-w-0 truncate">
                {presentation.warnings[note.id] ? "⚠ " : ""}
                {note.labels.ko || "새 가이드"}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <fieldset
                disabled={disabled}
                className="space-y-3 rounded-lg border border-dashed p-3"
              >
                <Label htmlFor={`guide-anchor-${note.id}`}>
                  가이드 삽입 위치
                </Label>
                <NativeSelect
                  id={`guide-anchor-${note.id}`}
                  value={note.beforeLineId ?? "intro"}
                  onChange={(event) =>
                    updateNote(note.id, {
                      beforeLineId:
                        event.target.value === "intro"
                          ? null
                          : event.target.value,
                    })
                  }
                >
                  <NativeSelectOption value="intro">
                    첫 가사 앞
                  </NativeSelectOption>
                  {note.beforeLineId &&
                    !lines.some((item) => item.id === note.beforeLineId) && (
                      <NativeSelectOption value={note.beforeLineId}>
                        원본 줄 없음 · 위치 재선택 필요
                      </NativeSelectOption>
                    )}
                  {lines
                    .filter((item) => item.id)
                    .map((item) => (
                      <NativeSelectOption key={item.id} value={item.id}>
                        {item.jp} 앞
                      </NativeSelectOption>
                    ))}
                </NativeSelect>
                {presentation.warnings[note.id] && (
                  <p role="alert" className="text-xs text-destructive">
                    {presentation.warnings[note.id]}
                  </p>
                )}
                {(
                  [
                    ["ko", "한국어 (필수)"],
                    ["ja", "일본어"],
                    ["en", "영어"],
                  ] as const
                ).map(([locale, name]) => (
                  <div key={locale} className="space-y-1">
                    <Label htmlFor={`guide-text-${note.id}-${locale}`}>
                      {name}
                    </Label>
                    <textarea
                      id={`guide-text-${note.id}-${locale}`}
                      lang={locale}
                      required={locale === "ko"}
                      maxLength={2000}
                      className="min-h-20 w-full rounded-md border bg-transparent p-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
                      value={note.labels[locale]}
                      onChange={(event) =>
                        updateNote(note.id, {
                          labels: {
                            ...note.labels,
                            [locale]: event.target.value,
                          },
                        })
                      }
                    />
                  </div>
                ))}
                {!note.labels.ko.trim() && (
                  <p className="text-xs text-destructive">
                    한국어 가이드 내용을 입력해 주세요.
                  </p>
                )}
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() =>
                    onChange({
                      ...guide,
                      guides: guide.guides?.filter(
                        (item) => item.id !== note.id,
                      ),
                    })
                  }
                >
                  가이드 삭제
                </Button>
              </fieldset>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
