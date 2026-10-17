import type { CallSection, LyricLine } from "@/types/lyric";

// Add display-only instrumental cards; never write these into shared lyrics.
export function displayTimeline(source: LyricLine[], sections: CallSection[]) {
  const rows = [...source];
  const boundaries = [
    ...new Set([
      ...source.flatMap((line) => [
        line.start,
        line.end,
        ...(line.originalEnd === undefined ? [] : [line.originalEnd]),
      ]),
      ...sections.flatMap((cue) => [cue.start, cue.end]),
    ]),
  ].sort((a, b) => a - b);
  // Cue boundaries divide time, not lyric-free display rows. Merge the entire
  // gap first, then decide whether it needs an instrumental card.
  const gaps: { start: number; end: number }[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i],
      end = boundaries[i + 1];
    if (source.some((line) => line.start <= start && line.end > start))
      continue;
    const previous = gaps.at(-1);
    if (previous?.end === start) previous.end = end;
    else gaps.push({ start, end });
  }
  for (const { start, end } of gaps) {
    if (
      sections.some((cue) => cue.start < end && cue.end > start) ||
      source.some(
        (line) =>
          line.originalEnd !== undefined &&
          line.end < end &&
          line.originalEnd > start,
      )
    )
      rows.push({
        id: `gap:${start}:${end}`,
        start,
        end,
        jp: "",
        kr: "",
        jpReading: "",
        instrumental: true,
      });
  }
  rows.sort((a, b) => a.start - b.start);
  const mapped = sections.map((cue) => ({
    ...cue,
    selection: cue.selection
      ? { ...cue.selection, line: rows.indexOf(source[cue.selection.line]) }
      : undefined,
  }));
  return { rows, sections: mapped };
}
