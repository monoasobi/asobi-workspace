import { z } from "zod";
import { musicSettingsSchema } from "@asobi/content-core/musicSettings";

// Omitted timing fields stay untouched; the call editor owns their controls.
export const musicSettingsUpdateSchema = z.object({
  ...musicSettingsSchema.shape,
  bpm: musicSettingsSchema.shape.bpm.optional(),
  syncOffset: musicSettingsSchema.shape.syncOffset.optional(),
}).strict().refine((value) => !value.publish || value.youtubeId !== null, {
  message: "공개하려면 11자리 YouTube ID를 입력해 주세요.",
  path: ["youtubeId"],
});
