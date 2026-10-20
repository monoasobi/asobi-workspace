import { roundTime, snapshotLine, type CallGuide } from "./callGuide";
import type { LyricLine } from "./lyrics";

// Source snapshots are checked before applying local display bounds.
export function resolveLyricPresentation(
  guide: CallGuide,
  source: readonly LyricLine[],
  sync = 0,
) {
  const warnings: Record<string, string> = {};
  const issues: Record<string, string> = {};
  const bounds = new Map<string, { start: number; end: number }>();
  for (const trim of guide.lyricEnds ?? []) {
    const line = source.find((line) => line.id === trim.source.id);
    if (
      !line ||
      line.jp !== trim.source.jp ||
      line.start !== trim.source.start ||
      line.end !== trim.source.end
    ) {
      warnings[trim.source.id] =
        "원본 가사가 변경되어 표시 구간 보정을 중지했습니다. 재확인해 주세요.";
    } else if (
      (trim.start ?? line.start) + sync < 0 ||
      roundTime(trim.end - (trim.start ?? line.start)) < 0.01
    ) {
      issues[trim.source.id] =
        "표시 구간은 재생 시작 이후, 최소 0.01초가 되도록 지정해 주세요.";
    } else
      bounds.set(trim.source.id, {
        start: trim.start ?? line.start,
        end: trim.end,
      });
  }
  // Removing a conflicting override can expose another conflict with the source.
  // Repeat until every remaining override is safe alongside source fallbacks.
  let changed = true;
  while (changed) {
    changed = false;
    for (let index = 1; index < source.length; index++) {
      const previous = source[index - 1];
      const line = source[index];
      const previousBounds = previous.id ? bounds.get(previous.id) : undefined;
      const currentBounds = line.id ? bounds.get(line.id) : undefined;
      if (
        (previousBounds?.end ?? previous.end) <=
        (currentBounds?.start ?? line.start)
      )
        continue;
      for (const candidate of [previous, line]) {
        if (candidate.id && bounds.delete(candidate.id)) {
          issues[candidate.id] =
            "표시 구간이 인접 가사와 겹칩니다. 시작·종료를 조절해 주세요.";
          changed = true;
        }
      }
    }
  }
  const guides = (guide.guides ?? []).filter((item) => {
    if (
      item.beforeLineId === null ||
      source.some((line) => line.id === item.beforeLineId)
    )
      return true;
    warnings[item.id] =
      "연결된 가사 줄이 없어 가이드를 숨겼습니다. 삽입 위치를 다시 선택해 주세요.";
    return false;
  });
  return {
    lines: source.map((line) => {
      const trim = line.id ? bounds.get(line.id) : undefined;
      return trim
        ? {
            ...line,
            ...(trim.start !== line.start ? { originalStart: line.start } : {}),
            ...(trim.end !== line.end ? { originalEnd: line.end } : {}),
            ...trim,
          }
        : line;
    }),
    guides,
    issues,
    warnings,
  };
}

// Shared by numeric controls and timeline handles; touching edges are allowed.
export function lyricResizeLimits(
  lines: readonly LyricLine[],
  index: number,
  min: number,
  max: number,
) {
  return {
    min: Math.max(min, lines[index - 1]?.end ?? min),
    max: Math.min(max, lines[index + 1]?.start ?? max),
  };
}

export function setLyricBounds(
  guide: CallGuide,
  line: LyricLine,
  start: number,
  end: number,
): CallGuide {
  if (!line.id) return guide;
  start = roundTime(start);
  end = roundTime(end);
  const others = (guide.lyricEnds ?? []).filter(
    (item) => item.source.id !== line.id,
  );
  return {
    ...guide,
    lyricEnds:
      start === line.start && end === line.end
        ? others
        : [
            ...others,
            {
              source: snapshotLine(line),
              ...(start !== line.start ? { start } : {}),
              end,
            },
          ],
  };
}
