import { z } from "zod";
const musicId = z.coerce.number().int().nonnegative();
export const lyricLineSchema = z
  .object({
    id: z.string().min(1).max(128).optional(),
    start: z.number().nonnegative(),
    end: z.number().positive(),
    jp: z.string(),
    kr: z.string(),
    jpReading: z.string(),
    en: z.string().optional(),
    enReading: z.string().optional(),
    callType: z.enum(["LOUD", "CLAP", "CUSTOM"]).optional(),
    callGuide: z.string().optional(),
  })
  .refine((line) => line.end > line.start, {
    message: "end는 start보다 커야 합니다.",
    path: ["end"],
  });

export const lyricTrackSchema = z.object({
  musicId,
  sync: z.coerce.number(),
  lyricJson: z.array(lyricLineSchema).superRefine((lines, ctx) => {
    const ids = new Set<string>();
    lines.forEach((line, index) => {
      if (!line.id) return;
      if (ids.has(line.id))
        ctx.addIssue({
          code: "custom",
          message: "가사 줄 ID는 중복될 수 없습니다.",
          path: [index, "id"],
        });
      ids.add(line.id);
    });
  }),
});
