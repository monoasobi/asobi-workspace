import { Info } from "lucide-react";
import type { LyricLocale, LyricTrack } from "@asobi/content-core/lyrics";
import { cn } from "@asobi/ui/lib/utils";

export function LyricGuideCard({
  guide,
  locale,
  tone = "default",
}: {
  guide: NonNullable<LyricTrack["guides"]>[number];
  locale: LyricLocale;
  tone?: "default" | "custom";
}) {
  return (
    <aside
      className={cn(
        "relative mx-3 my-3 rounded-md border border-dashed px-9 py-2 text-center text-sm font-semibold",
        tone === "custom"
          ? "border-navy-500/30 bg-navy-500/10 text-navy-600 dark:text-navy-400"
          : "border-primary/30 bg-primary/10 text-primary",
      )}
    >
      <Info aria-hidden="true" className="absolute top-3 left-3 size-4" />
      <p className="whitespace-pre-wrap break-words">
        {guide.labels[locale] || guide.labels.ko}
      </p>
    </aside>
  );
}
