import type { CallGuide } from "@asobi/content-core/callGuide";
import { useEditorHistory } from "../shared/useEditorHistory";
export type GuideDraft = { guide: CallGuide; syncOffset: number; bpm: number | null };
export const useGuideHistory = (initial: GuideDraft) =>
  useEditorHistory(initial);
