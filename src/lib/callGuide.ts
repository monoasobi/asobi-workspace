import { z } from "zod";
import type { CallSection, LyricLine } from "@/types/lyric";
import { lyricTextFields, singalongTextFields } from "./lyricText";

const time = z.number().finite().min(-3600).max(86400);
const sourceLine = z.object({
  id: z.string().min(1).max(200),
  jp: z.string().max(10000),
  start: time,
  end: time,
});
const common = {
  id: z.string().min(1).max(100),
  type: z.enum(["clap", "chant", "singalong", "custom"]),
  label: z.string().max(200),
  emoji: z
    .string()
    .max(32)
    .refine(
      (value) =>
        !value ||
        (Array.from(
          new Intl.Segmenter("ko", { granularity: "grapheme" }).segment(value),
        ).length === 1 &&
          /\p{Extended_Pictographic}|\p{Regional_Indicator}|[0-9#*]\uFE0F?\u20E3/u.test(
            value,
          )),
      "이모지 하나를 선택해 주세요.",
    )
    .optional(),
  customEffects: z.object({ text: z.boolean(), flash: z.boolean() }).optional(),
  labels: z
    .object({
      ko: z.string().max(200),
      ja: z.string().max(200),
      en: z.string().max(200),
    })
    .optional(),
  notes: z
    .object({
      ko: z.string().max(2000),
      ja: z.string().max(2000),
      en: z.string().max(2000),
    })
    .optional(),
  lines: z.array(sourceLine).max(500),
  pulseTimes: z.array(time).max(2000),
  textSelections: z
    .array(
      z.object({
        lineId: z.string().min(1).max(200),
        field: z.enum(lyricTextFields),
        text: z.string().min(1).max(10000),
        start: z.number().int().nonnegative(),
        end: z.number().int().positive(),
      }),
    )
    .max(2500)
    .optional(),
  selection: z
    .object({
      start: z.number().int().nonnegative(),
      end: z.number().int().positive(),
    })
    .optional(),
};
const cueSchema = z.object({
  ...common,
  start: time,
  end: time,
  pattern: z
    .object({
      bpm: z.number().finite().min(20).max(400),
      subdivision: z.union([z.literal(1), z.literal(2), z.literal(4)]),
      firstOffset: z.number().finite().nonnegative().max(86400),
      steps: z.array(z.number().int().min(0).max(31)).max(32),
    })
    .optional(),
});
export const guideSchema = z
  .object({
    version: z.literal(2),
    cues: z.array(cueSchema).max(500),
    songGuide: z
      .object({
        ko: z.string().trim().max(2000),
        ja: z.string().trim().max(2000),
        en: z.string().trim().max(2000),
      })
      .optional(),
    guides: z
      .array(
        z
          .object({
            id: z.string().min(1).max(100),
            beforeLineId: z.string().min(1).max(200).nullable().optional(),
            afterLineId: z.string().min(1).max(200).nullable().optional(),
            labels: z.object({
              ko: z.string().trim().min(1).max(2000),
              ja: z.string().max(2000),
              en: z.string().max(2000),
            }),
          })
          .refine(
            (item) =>
              item.beforeLineId !== undefined || item.afterLineId !== undefined,
            "가이드 위치를 지정해 주세요.",
          )
          .transform(({ beforeLineId, afterLineId, ...item }) => ({
            ...item,
            // Read old anchors without writes; their guide now sits above the same lyric.
            beforeLineId:
              beforeLineId !== undefined ? beforeLineId : afterLineId!,
          })),
      )
      .max(500)
      .optional(),
    lyricEnds: z
      .array(
        z.object({ source: sourceLine, start: time.optional(), end: time }),
      )
      .max(500)
      .optional(),
  })
  .superRefine(({ cues, guides, lyricEnds }, ctx) => {
    if (
      new Set(guides?.map((item) => item.id)).size !== (guides?.length ?? 0) ||
      new Set(lyricEnds?.map((item) => item.source.id)).size !==
        (lyricEnds?.length ?? 0)
    )
      ctx.addIssue({
        code: "custom",
        message: "중복된 가이드 또는 가사 종료 보정입니다.",
      });
    if (new Set(cues.map((cue) => cue.id)).size !== cues.length)
      ctx.addIssue({ code: "custom", message: "중복된 콜 ID입니다." });
  });
export type CallGuide = z.infer<typeof guideSchema>;
export type CallCue = CallGuide["cues"][number];
// Existing custom cues with timing used both effects; keep them readable unchanged.
export function customCueEffects(cue: {
  customEffects?: { text: boolean; flash: boolean };
  pattern?: unknown;
  pulseTimes: readonly number[];
}) {
  const enabled = !!cue.pattern || cue.pulseTimes.length > 0;
  return cue.customEffects ?? { text: enabled, flash: enabled };
}
export function cueTextSelections(
  cue: CallCue,
): NonNullable<CallCue["textSelections"]> {
  // Older translation selections remain readable but no longer participate in singing.
  const ranges = (cue.textSelections ?? []).filter((range) =>
    singalongTextFields.some((field) => field === range.field),
  );
  if (!cue.selection || cue.lines.length !== 1) return ranges;
  return [
    {
      ...cue.selection,
      lineId: cue.lines[0].id,
      field: "jp",
      text: cue.lines[0].jp,
    },
    ...ranges,
  ];
}
export function defaultPulsePattern(
  bpm = 120,
): NonNullable<CallCue["pattern"]> {
  return {
    bpm,
    subdivision: 1,
    firstOffset: 0,
    steps: [0, 1, 2, 3, 4, 5, 6, 7],
  };
}
export function changeCueType(
  cue: CallCue,
  type: CallCue["type"],
  bpm?: number,
): CallCue {
  if (cue.type === type) return cue;
  return {
    ...cue,
    type,
    customEffects:
      type === "custom" ? { text: false, flash: false } : undefined,
    selection: type === "singalong" ? cue.selection : undefined,
    textSelections: type === "singalong" ? cue.textSelections : undefined,
    pulseTimes:
      type === "singalong" || type === "custom" || cue.type === "singalong"
        ? []
        : cue.pulseTimes,
    pattern:
      type === "singalong" || type === "custom"
        ? undefined
        : !cuePulses(cue).length
          ? defaultPulsePattern(bpm)
          : cue.pattern,
  };
}
export const roundTime = (value: number) => Math.round(value * 10000) / 10000;

// Read old documents without writes; snapshots preserve their original timing.
export function parseGuide(input: unknown): CallGuide {
  if (input && typeof input === "object" && "version" in input)
    return guideSchema.parse(input);
  const legacy = z
    .object({
      cues: z
        .array(
          z.object({ ...common, lines: z.array(sourceLine).min(1).max(500) }),
        )
        .max(500),
    })
    .parse(input ?? { cues: [] });
  return guideSchema.parse({
    version: 2,
    cues: legacy.cues.map((cue) => ({
      ...cue,
      start: cue.lines[0].start,
      end: cue.lines.at(-1)!.end,
    })),
  });
}
export function snapshotLine(line: LyricLine) {
  if (!line.id) throw new Error("가사 줄 ID가 없습니다.");
  return { id: line.id, jp: line.jp, start: line.start, end: line.end };
}
export function cuePulses(cue: CallCue): number[] {
  if (
    cue.type === "singalong" ||
    (cue.type === "custom" &&
      !customCueEffects(cue).text &&
      !customCueEffects(cue).flash)
  )
    return [];
  if (!cue.pattern) return cue.pulseTimes;
  const { bpm, subdivision, firstOffset, steps } = cue.pattern;
  const interval = 60 / bpm / subdivision;
  const count = Math.min(
    100000,
    Math.ceil((cue.end - cue.start - firstOffset) / interval),
  );
  const result: number[] = [];
  for (let i = 0; i < count && result.length <= 2000; i++) {
    const hit = roundTime(cue.start + firstOffset + i * interval);
    if (
      steps.includes(i % (8 * subdivision)) &&
      hit >= cue.start &&
      hit < cue.end
    )
      result.push(hit);
  }
  return result;
}
export function moveCue(cue: CallCue, delta: number): CallCue {
  return {
    ...cue,
    start: roundTime(cue.start + delta),
    end: roundTime(cue.end + delta),
    pulseTimes: cue.pulseTimes.map((time) => roundTime(time + delta)),
  };
}
export function resizeCue(
  cue: CallCue,
  edge: "start" | "end",
  value: number,
): CallCue {
  const next = { ...cue, [edge]: roundTime(value) };
  // Resizing trims explicit hits; moving a block is the operation that moves all hits.
  next.pulseTimes = next.pulseTimes.filter(
    (time) => time >= next.start && time < next.end,
  );
  if (next.pattern && edge === "start")
    next.pattern = {
      ...next.pattern,
      firstOffset: Math.max(
        0,
        roundTime(cue.start + next.pattern.firstOffset - next.start),
      ),
    };
  return next;
}
export function resolveGuide(guide: CallGuide, lines: readonly LyricLine[]) {
  const sections: CallSection[] = [];
  const issues: Record<string, string> = {};
  for (const cue of guide.cues) {
    const first = lines.findIndex((line) => line.id === cue.lines[0]?.id);
    const selected =
      first < 0 ? [] : lines.slice(first, first + cue.lines.length);
    const pulses = cuePulses(cue);
    let issue = "";
    if (roundTime(cue.end - cue.start) < 0.01)
      issue = "구간은 최소 0.01초여야 합니다.";
    else if (
      cue.type !== "singalong" &&
      (cue.type !== "custom" ||
        customCueEffects(cue).text ||
        customCueEffects(cue).flash) &&
      cue.pattern &&
      (cue.pulseTimes.length ||
        cue.pattern.firstOffset >= cue.end - cue.start ||
        new Set(cue.pattern.steps).size !== cue.pattern.steps.length ||
        cue.pattern.steps.some((step) => step >= 8 * cue.pattern!.subdivision))
    )
      issue = "박자 패턴 설정을 확인해 주세요.";
    else if (
      pulses.length > 2000 ||
      pulses.some(
        (time, i) =>
          time < cue.start ||
          time >= cue.end ||
          (i > 0 && time <= pulses[i - 1]),
      )
    )
      issue =
        "펄스는 블록 안에 중복 없이 오름차순으로 지정해 주세요. 최대 2,000개입니다.";
    else if (cue.type === "custom" && !(cue.labels?.ko || cue.label).trim())
      issue = "커스텀 표시 문구를 입력해 주세요.";
    else if (
      (cue.type === "clap" ||
        cue.type === "chant" ||
        (cue.type === "custom" &&
          (customCueEffects(cue).text || customCueEffects(cue).flash))) &&
      !pulses.length
    )
      issue = "박자 효과의 타이밍을 하나 이상 선택해 주세요.";
    else if (
      cue.type === "singalong" &&
      (!cue.lines.length ||
        selected.length !== cue.lines.length ||
        selected.some(
          (line, i) =>
            line.id !== cue.lines[i].id || line.jp !== cue.lines[i].jp,
        ))
    )
      issue =
        "떼창 원문이 변경되었습니다. 왼쪽 가사를 다시 선택해 연결해 주세요.";
    else if (
      cue.selection &&
      (cue.type !== "singalong" ||
        selected.length !== 1 ||
        cue.selection.start >= cue.selection.end ||
        cue.selection.end > selected[0].jp.length)
    )
      issue = "부분 떼창은 연결된 한 줄 안에서 선택해 주세요.";
    else if (cueTextSelections(cue).length) {
      const ranges = cueTextSelections(cue);
      if (
        cue.type !== "singalong" ||
        new Set(ranges.map((r) => `${r.lineId}:${r.field}:${r.start}:${r.end}`))
          .size !== ranges.length ||
        ranges.some((range) => {
          const line = selected.find((line) => line.id === range.lineId);
          return (
            !line ||
            line[range.field] !== range.text ||
            range.start >= range.end ||
            range.end > range.text.length
          );
        })
      )
        issue =
          "떼창 원문·독음 또는 선택 범위가 변경되었습니다. 해당 표시에서 범위를 다시 선택하거나 강조를 해제해 주세요.";
    }
    if (issue) {
      issues[cue.id] = issue;
      continue;
    }
    sections.push({
      id: cue.id,
      type: cue.type,
      emoji: cue.type === "custom" ? cue.emoji : undefined,
      label: cue.label || undefined,
      labels:
        cue.type === "chant" || cue.type === "custom" ? cue.labels : undefined,
      notes: cue.notes,
      customEffects: cue.type === "custom" ? customCueEffects(cue) : undefined,
      start: cue.start,
      end: cue.end,
      firstLine: first,
      lastLine: first + cue.lines.length - 1,
      pulseTimes: pulses,
      selection: cue.selection ? { ...cue.selection, line: first } : undefined,
      textSelections: cueTextSelections(cue).map(
        ({ lineId, field, start, end }) => ({ lineId, field, start, end }),
      ),
    });
  }
  return { sections, issues };
}
