import type { GuideDocument } from "@/server/queries/guide";

export function guideSaveInput(
  saved: GuideDocument,
  latest: GuideDocument,
  draftOffset: number,
  displayedOffset: number,
) {
  // Only metadata revisions may advance here; concurrent guide edits must still conflict.
  if (JSON.stringify(latest.guide) !== JSON.stringify(saved.guide))
    return { revision: saved.revision, syncOffset: displayedOffset };
  return {
    revision: latest.revision,
    syncOffset:
      draftOffset === saved.syncOffset ? latest.syncOffset : draftOffset,
  };
}
