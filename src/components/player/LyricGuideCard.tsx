import { Info } from "lucide-react";
import type { LyricLocale, LyricTrack } from "@/types/lyric";

export function LyricGuideCard({
  guide,
  locale,
}: {
  guide: NonNullable<LyricTrack["guides"]>[number];
  locale: LyricLocale;
}) {
  return (
    <aside className="mx-3 my-3 flex items-start gap-2 rounded-md border border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p className="whitespace-pre-wrap break-words">
        {guide.labels[locale] || guide.labels.ko}
      </p>
    </aside>
  );
}
