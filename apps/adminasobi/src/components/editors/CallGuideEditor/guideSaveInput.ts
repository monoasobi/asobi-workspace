import type { GuideDocument } from "@/server/queries/guide";

type SaveSource = Pick<
  GuideDocument,
  "guide" | "revision" | "sourceRevision" | "syncOffset"
>;
export function guideSaveInput(
  saved: SaveSource,
  latest: SaveSource,
  draftOffset: number,
  displayedOffset: number,
) {
  // Only metadata revisions may advance here; concurrent guide edits must still conflict.
  if (
    latest.sourceRevision !== saved.sourceRevision ||
    JSON.stringify(latest.guide) !== JSON.stringify(saved.guide)
  )
    return { revision: saved.revision, syncOffset: displayedOffset };
  return {
    revision: latest.revision,
    syncOffset:
      draftOffset === saved.syncOffset ? latest.syncOffset : draftOffset,
  };
}
