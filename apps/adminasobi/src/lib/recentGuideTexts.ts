import { z } from "zod";
import type { CallGuide } from "@asobi/content-core/callGuide";

export type GuideTextKind = "call" | "badge" | "note" | "guide";
export type GuideTextValue = { ko: string; ja: string; en: string };
export const recentTextsKey = "loudasobi:recent-guide-texts:v1";
const entrySchema = z
  .object({
    kind: z.enum(["call", "badge", "note", "guide"]),
    musicId: z.number().int().nonnegative(),
    value: z.object({
      ko: z.string().max(2000),
      ja: z.string().max(2000),
      en: z.string().max(2000),
    }),
  })
  .refine(({ value }) => Object.values(value).some((text) => text.trim()))
  .refine(
    ({ kind, value }) =>
      (kind !== "call" && kind !== "badge") ||
      Object.values(value).every((text) => text.length <= 200),
  );
export type RecentGuideText = z.infer<typeof entrySchema>;
export const guideTextKey = (kind: GuideTextKind, value: GuideTextValue) =>
  JSON.stringify([kind, value.ko.trim(), value.ja.trim(), value.en.trim()]);

export function collectGuideTexts(
  guide: CallGuide,
  musicId: number,
): RecentGuideText[] {
  const result: RecentGuideText[] = [];
  const add = (kind: GuideTextKind, value?: GuideTextValue) => {
    if (!value || !Object.values(value).some((text) => text.trim())) return;
    result.push({
      kind,
      musicId,
      value: { ko: value.ko.trim(), ja: value.ja.trim(), en: value.en.trim() },
    });
  };
  for (const cue of guide.cues) {
    if (cue.type === "chant" || cue.type === "custom")
      add("call", cue.labels ?? { ko: cue.label, ja: "", en: "" });
    else add("badge", { ko: cue.label, ja: "", en: "" });
    add("note", cue.notes);
  }
  for (const note of guide.guides ?? []) add("guide", note.labels);
  add("guide", guide.songGuide);
  return result;
}
export function parseRecentTexts(raw: string): RecentGuideText[] {
  try {
    return z.array(entrySchema).max(80).parse(JSON.parse(raw));
  } catch {
    return [];
  }
}
export function mergeRecentTexts(
  previous: RecentGuideText[],
  additions: RecentGuideText[],
) {
  const seen = new Set<string>();
  const counts = { call: 0, badge: 0, note: 0, guide: 0 };
  return [...additions]
    .reverse()
    .concat(previous)
    .filter((entry) => {
      const key = guideTextKey(entry.kind, entry.value);
      if (seen.has(key) || counts[entry.kind] >= 20) return false;
      seen.add(key);
      counts[entry.kind]++;
      return true;
    });
}
export function recordRecentGuideTexts(
  musicId: number,
  saved: CallGuide,
  before: CallGuide,
) {
  try {
    const oldKeys = new Set(
      collectGuideTexts(before, musicId).map((entry) =>
        guideTextKey(entry.kind, entry.value),
      ),
    );
    const additions = collectGuideTexts(saved, musicId).filter(
      (entry) => !oldKeys.has(guideTextKey(entry.kind, entry.value)),
    );
    if (!additions.length) return;
    const previous = parseRecentTexts(
      localStorage.getItem(recentTextsKey) ?? "",
    );
    localStorage.setItem(
      recentTextsKey,
      JSON.stringify(mergeRecentTexts(previous, additions)),
    );
    window.dispatchEvent(new Event(recentTextsKey));
  } catch {
    /* Storage restrictions must never turn a successful save into a failure. */
  }
}
export function getTextSuggestions(
  kind: GuideTextKind,
  value: GuideTextValue,
  musicId: number,
  saved: CallGuide,
  recent: RecentGuideText[],
) {
  const candidates = [
    ...recent.filter((entry) => entry.musicId === musicId),
    ...collectGuideTexts(saved, musicId).reverse(),
    ...recent.filter((entry) => entry.musicId !== musicId),
  ];
  const seen = new Set([guideTextKey(kind, value)]);
  return candidates
    .filter((entry) => {
      if (entry.kind !== kind) return false;
      const key = guideTextKey(kind, entry.value);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5);
}
