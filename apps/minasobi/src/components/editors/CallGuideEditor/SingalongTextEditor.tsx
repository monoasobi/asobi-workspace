"use client";
import { useRef } from "react";
import { Button } from "@asobi/ui/components/button";
import { HighlightedText } from "@asobi/loudasobi-view/player/HighlightedText";
import {
  cueTextSelections,
  snapshotLine,
  type CallCue,
} from "@asobi/content-core/callGuide";
import { Input } from "@asobi/ui/components/input";
import { Label } from "@asobi/ui/components/label";
import {
  singalongTextFields,
  lyricTextLabels,
  lyricTextLang,
  type LyricTextField,
} from "@asobi/content-core/lyricText";
import type { LyricLine } from "@asobi/content-core/lyrics";

export function SingalongTextEditor({
  cue,
  lines,
  disabled,
  onChange,
}: {
  cue: CallCue;
  lines: LyricLine[];
  disabled: boolean;
  onChange: (cue: CallCue) => void;
}) {
  const selections = cueTextSelections(cue);
  function change(
    lineId: string,
    field: LyricTextField,
    range?: { start: number; end: number; text: string },
  ) {
    if (disabled) return;
    const others = selections.filter(
      (item) => item.lineId !== lineId || item.field !== field,
    );
    const matching = selections.filter(
      (item) => item.lineId === lineId && item.field === field,
    );
    // Add disjoint selections; merge touching ranges and replace stale snapshots.
    const merged: typeof matching = [];
    if (range) {
      for (const item of [
        ...matching.filter((item) => item.text === range.text),
        { lineId, field, ...range },
      ].sort((a, b) => a.start - b.start)) {
        const previous = merged.at(-1);
        if (previous && item.start <= previous.end)
          previous.end = Math.max(previous.end, item.end);
        else merged.push({ ...item });
      }
    }
    const next = [...others, ...merged];
    onChange({
      ...cue,
      selection: undefined,
      textSelections: next.length ? next : undefined,
    });
  }
  return (
    <div className="min-w-0 space-y-4">
      <div
        role="group"
        aria-label="떼창 표시 방식"
        className="flex flex-wrap gap-2"
      >
        {(
          [
            { value: "highlight", label: "기존 가사 강조" },
            { value: "standalone", label: "별도 문구" },
            { value: "inline", label: "가사 끝 더하기" },
          ] as const
        ).map(({ value, label }) => {
          const selected =
            value === "highlight"
              ? !cue.singalongText
              : cue.singalongText?.placement === value;
          return (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={selected ? "secondary" : "outline"}
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => {
                if (value === "highlight") {
                  onChange({ ...cue, singalongText: undefined });
                  return;
                }
                onChange({
                  ...cue,
                  selection: undefined,
                  textSelections: undefined,
                  lines: value === "standalone" ? [] : cue.lines.slice(0, 1),
                  singalongText: {
                    ...(cue.singalongText ?? {
                      jp: "",
                      jpReading: "",
                      enReading: "",
                    }),
                    placement: value,
                  },
                });
              }}
            >
              {label}
            </Button>
          );
        })}
      </div>
      {cue.singalongText ? (
        <div className="space-y-3 rounded-lg border p-3">
          {cue.singalongText.placement === "inline" && (
            <>
              <Label htmlFor="singalong-anchor">문구를 붙일 가사</Label>
              <select
                id="singalong-anchor"
                disabled={disabled}
                value={cue.lines[0]?.id ?? ""}
                className="w-full min-w-0 rounded-md border bg-background p-2 text-sm"
                onChange={(event) => {
                  const line = lines.find(
                    (line) => line.id === event.target.value,
                  );
                  onChange({ ...cue, lines: line ? [snapshotLine(line)] : [] });
                }}
              >
                <option value="">가사 한 줄을 선택하세요</option>
                {lines
                  .filter((line) => line.id)
                  .map((line) => (
                    <option key={line.id} value={line.id}>
                      {line.jp}
                    </option>
                  ))}
              </select>
            </>
          )}
          {singalongTextFields.map((field) => (
            <div key={field} className="space-y-1">
              <Label htmlFor={`singalong-addition-${field}`}>
                {field === "jp" ? "일본어 독음" : lyricTextLabels[field]}
              </Label>
              <Input
                id={`singalong-addition-${field}`}
                lang={lyricTextLang[field]}
                maxLength={200}
                disabled={disabled}
                value={cue.singalongText![field]}
                onChange={(event) =>
                  onChange({
                    ...cue,
                    singalongText: {
                      ...cue.singalongText!,
                      [field]: event.target.value,
                    },
                  })
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <>
          {cue.lines.map((snapshot, index) => {
            const line = lines.find((line) => line.id === snapshot.id);
            return (
              <section
                key={snapshot.id}
                className="min-w-0 space-y-3 rounded-lg border p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">연결 가사 {index + 1}</h3>
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    disabled={
                      disabled ||
                      !line ||
                      !singalongTextFields.some((field) => line[field]?.trim())
                    }
                    onClick={() => {
                      if (disabled || !line) return;
                      const ranges = singalongTextFields.flatMap((field) => {
                        const text = line[field];
                        return text?.trim()
                          ? [
                              {
                                lineId: snapshot.id,
                                field,
                                start: 0,
                                end: text.length,
                                text,
                              },
                            ]
                          : [];
                      });
                      onChange({
                        ...cue,
                        selection: undefined,
                        textSelections: [
                          ...selections.filter(
                            (range) => range.lineId !== snapshot.id,
                          ),
                          ...ranges,
                        ],
                      });
                    }}
                  >
                    모든 언어 강조
                  </Button>
                </div>
                {!line && (
                  <p className="text-xs text-destructive">
                    원본 줄이 없습니다. 가사를 다시 연결해 주세요.
                  </p>
                )}
                {singalongTextFields.map((field) => (
                  <TextSelectionField
                    key={field}
                    field={field}
                    text={line?.[field] ?? ""}
                    disabled={disabled}
                    selections={selections.filter(
                      (range) =>
                        range.lineId === snapshot.id && range.field === field,
                    )}
                    onRemove={(removed) =>
                      onChange({
                        ...cue,
                        selection: undefined,
                        textSelections: selections.filter(
                          (range) =>
                            !(
                              range.lineId === snapshot.id &&
                              range.field === field &&
                              range.start === removed.start &&
                              range.end === removed.end
                            ),
                        ),
                      })
                    }
                    onChange={(range) => change(snapshot.id, field, range)}
                  />
                ))}
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}

function TextSelectionField({
  field,
  text,
  selections,
  onRemove,
  disabled,
  onChange,
}: {
  field: LyricTextField;
  text: string;
  selections: { start: number; end: number; text: string }[];
  onRemove: (range: { start: number; end: number }) => void;
  disabled: boolean;
  onChange: (range?: { start: number; end: number; text: string }) => void;
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const stale = selections.some((selection) => selection.text !== text);
  function selectText() {
    if (disabled || !text) return;
    const selected = window.getSelection();
    if (!selected?.rangeCount || selected.isCollapsed || !textRef.current)
      return;
    const range = selected.getRangeAt(0);
    if (
      !textRef.current.contains(range.startContainer) ||
      !textRef.current.contains(range.endContainer)
    )
      return;
    const prefix = range.cloneRange();
    prefix.selectNodeContents(textRef.current);
    prefix.setEnd(range.startContainer, range.startOffset);
    const start = prefix.toString().length,
      end = start + range.toString().length;
    if (end <= text.length && start < end) onChange({ start, end, text });
  }
  return (
    <div className="min-w-0 space-y-1">
      <h4 className="text-xs font-medium">{lyricTextLabels[field]}</h4>
      <p
        ref={textRef}
        lang={lyricTextLang[field]}
        tabIndex={text ? 0 : undefined}
        data-text-selection
        onPointerUp={selectText}
        onKeyUp={selectText}
        aria-label={`${lyricTextLabels[field]} 떼창 범위 선택`}
        className="cursor-text select-text whitespace-pre-wrap [overflow-wrap:anywhere] rounded border p-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
      >
        {text ? (
          <HighlightedText
            text={text}
            ranges={selections.filter((selection) => selection.text === text)}
          />
        ) : (
          "자료 없음"
        )}
      </p>
      {stale && (
        <p role="alert" className="text-xs text-destructive">
          내용이 변경되었습니다. 다시 선택하거나 강조를 해제해 주세요.
        </p>
      )}
      {selections.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selections.map((selection) => (
            <Button
              key={`${selection.start}:${selection.end}`}
              size="xs"
              variant="outline"
              disabled={disabled}
              className="h-auto min-h-6 min-w-0 max-w-full items-start whitespace-normal py-1 text-left"
              onClick={() => onRemove(selection)}
              aria-label={`${selection.text.slice(selection.start, selection.end)} 강조 삭제`}
            >
              <span className="min-w-0 [overflow-wrap:anywhere]">
                {selection.text.slice(selection.start, selection.end)}
              </span>
              <span aria-hidden="true" className="shrink-0">
                ×
              </span>
            </Button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        <Button
          size="xs"
          variant="outline"
          disabled={disabled || !text}
          onClick={selectText}
        >
          선택 범위 추가
        </Button>
        <Button
          size="xs"
          variant="ghost"
          disabled={disabled || !text}
          onClick={() => onChange({ start: 0, end: text.length, text })}
        >
          전체 강조
        </Button>
        <Button
          size="xs"
          variant="ghost"
          disabled={disabled || !selections.length}
          onClick={() => onChange()}
        >
          강조 해제
        </Button>
      </div>
    </div>
  );
}
