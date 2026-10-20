import { z } from "zod";

export const linesSchema = z
  .array(
    z.object({
      // Legacy source rows remain readable until MONOASOBI ID backfill is deployed.
      id: z.string().min(1).optional(),
      start: z.number().finite().nonnegative(),
      end: z.number().finite(),
      jp: z.string(),
      kr: z.string(),
      jpReading: z.string(),
      en: z.string().optional(),
      enReading: z.string().optional(),
    }),
  )
  .superRefine((lines, ctx) => {
    const ids = new Set<string>();
    lines.forEach((line, index) => {
      if (
        (line.id !== undefined && ids.has(line.id)) ||
        line.end <= line.start ||
        (index > 0 && line.start < lines[index - 1].end)
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid lyric timeline",
          path: [index],
        });
      }
      if (line.id) ids.add(line.id);
    });
  });
