import type { CallGuide } from "./callGuide";
import type { LyricLine } from "@/types/lyric";

// Source snapshots are checked before applying any local end-time override.
export function resolveLyricPresentation(
  guide: CallGuide,
  source: readonly LyricLine[],
) {
  const warnings: Record<string, string> = {};
  const issues: Record<string, string> = {};
  const ends = new Map<string, number>();
  for (const trim of guide.lyricEnds ?? []) {
    const line = source.find((line) => line.id === trim.source.id);
    if (
      !line ||
      line.jp !== trim.source.jp ||
      line.start !== trim.source.start ||
      line.end !== trim.source.end
    ) {
      warnings[trim.source.id] =
        "원본 가사가 변경되어 종료 보정을 중지했습니다. 재확인해 주세요.";
    } else if (trim.end < line.start + 0.01 || trim.end >= line.end) {
      issues[trim.source.id] =
        "표시 종료는 가사 시작 0.01초 뒤부터 원본 종료 이전으로 지정해 주세요.";
    } else ends.set(trim.source.id, trim.end);
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
    lines: source.map((line) =>
      line.id && ends.has(line.id)
        ? { ...line, originalEnd: line.end, end: ends.get(line.id)! }
        : line,
    ),
    guides,
    issues,
    warnings,
  };
}
