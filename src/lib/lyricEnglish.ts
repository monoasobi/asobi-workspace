import type { LyricLine } from "@appTypes/lyric";

// Keep English out of public views.
export function withoutEnglish(line: LyricLine): LyricLine {
  const result = { ...line };
  delete result.en;
  delete result.enReading;
  return result;
}
