import { z } from "zod";
const requiredText = z.string().trim().min(1);
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));
export const musicSchema = z.object({
  title: requiredText,
  korTitle: requiredText,
  enTitle: requiredText,
  youtubeId: optionalText,
  specialPath: optionalText,
});
export type MusicInput = z.infer<typeof musicSchema>;
