import { CallIcon } from "@/components/common/CallIcon";
import { Badge } from "@/components/ui/badge";
import { callBadgeStyles, callStyles } from "./guideStyles";
import { memo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { CallSection, LyricLine, LyricLocale } from "@/types/lyric";
import { HighlightedText } from "../HighlightedText";
import { LyricGuideCard } from "../LyricGuideCard";
import type { LyricTextField } from "@/lib/lyricText";

export const LyricRow = memo(function LyricRow({
  line,
  index,
  locale,
  sections,
  active,
  badges,
  activeSectionIds,
  ready,
  onSeek,
}: {
  line: LyricLine;
  index: number;
  locale: LyricLocale;
  sections: CallSection[];
  active: boolean;
  badges: CallSection[];
  activeSectionIds: Set<string>;
  ready: boolean;
  onSeek: (index: number) => void;
}) {
  const t = useTranslations();
  const visibleBadges = badges.filter((section) => {
    if (section.type === "custom") return !!(section.icon ?? section.emoji);
    if (section.type !== "clap" && section.type !== "singalong") return true;
    const representative =
      badges.find(
        (item) => item.type === section.type && activeSectionIds.has(item.id),
      ) ?? badges.find((item) => item.type === section.type);
    return section === representative;
  });
  const notes = badges.filter(
    (section) => section.notes?.[locale] || section.notes?.ko,
  );
  const readingField =
    locale === "ja" ? "jp" : locale === "ko" ? "jpReading" : "enReading";
  const standalone = badges.filter(
    (section) =>
      section.singalongText?.placement === "standalone" &&
      section.singalongText[readingField].trim(),
  );
  function additions(field: LyricTextField) {
    if (field !== readingField) return null;
    return sections
      .filter(
        (section) =>
          section.singalongText?.placement === "inline" &&
          section.singalongText.lineId === line.id,
      )
      .map((section) =>
        section.singalongText![field]?.trim() ? (
          <span key={section.id} className="ml-1">
            <HighlightedText
              text={`(${section.singalongText![field]})`}
              ranges={[
                { start: 0, end: section.singalongText![field].length + 2 },
              ]}
            />
          </span>
        ) : null,
      );
  }
  function highlighted(field: LyricTextField) {
    const ranges = sections.flatMap((s) => [
      ...(field === "jp" && s.selection?.line === index ? [s.selection] : []),
      ...(s.textSelections ?? []).filter(
        (range) => range.lineId === line.id && range.field === field,
      ),
    ]);
    return (
      <>
        <HighlightedText text={line[field] ?? ""} ranges={ranges} />
        {additions(field)}
      </>
    );
  }
  return (
    <div data-line-index={index} className="relative">
      {notes.length > 0 && (
        <div className="space-y-2 px-2 py-2 sm:px-3">
          {notes.map((section) => {
            const note = section.notes?.[locale] || section.notes?.ko;
            return note ? (
              <aside
                key={section.id}
                className={cn(
                  "min-w-0 rounded-md px-3 py-2 text-center",
                  callStyles[section.type],
                )}
                style={{
                  backgroundColor:
                    "color-mix(in oklch, var(--guide-color) 8%, var(--background))",
                }}
              >
                <p className="min-w-0 whitespace-pre-wrap text-sm font-semibold leading-relaxed text-foreground [overflow-wrap:anywhere]">
                  {note}
                </p>
              </aside>
            ) : null;
          })}
        </div>
      )}
      {badges
        .filter((section) => section.type === "custom")
        .map((section) => (
          <LyricGuideCard
            key={section.id}
            locale={locale}
            tone="custom"
            guide={{
              id: section.id,
              beforeLineId: line.id ?? null,
              labels: {
                ko: section.labels?.ko || section.label || "",
                ja: section.labels?.ja || "",
                en: section.labels?.en || "",
              },
            }}
          />
        ))}
      <div
        data-lyric-content
        className={cn(
          "relative transition-[background-color,color,box-shadow] duration-(--motion-lyric)",
          active
            ? "bg-black/[0.04] text-foreground shadow-[inset_3px_0_0_rgb(0_0_0/0.18)] dark:bg-white/[0.07] dark:shadow-[inset_3px_0_0_rgb(255_255_255/0.25)]"
            : ready && "hover:bg-muted/50",
        )}
      >
        {badges.length > 0 && (
          <div className="pointer-events-none absolute left-2 top-1/2 z-20 flex w-max min-w-12 -translate-y-1/2 flex-col items-start gap-1 sm:left-3">
            {visibleBadges.map((section) => (
              <Badge
                key={section.id}
                variant="outline"
                title={
                  section.labels?.[locale] || section.label || t(section.type)
                }
                aria-label={
                  section.type === "custom"
                    ? section.labels?.[locale] || section.label || t("custom")
                    : section.type === "clap" || section.type === "chant"
                      ? `${t(section.type)}${section.type === "chant" ? ` · ${section.labels?.[locale] || section.label || ""}` : ""}`
                      : undefined
                }
                data-active={activeSectionIds.has(section.id)}
                className={cn(
                  "h-6 min-w-12 gap-1 border px-1.5 py-1 font-bold leading-none shadow-xs text-[clamp(0.625rem,0.5625rem+0.3125cqi,0.75rem)] transition-colors motion-reduce:transition-none [&>svg]:size-3.5!",
                  section.type !== "chant" && "max-w-[clamp(3rem,12cqi,4rem)]",
                  callBadgeStyles[section.type],
                )}
              >
                {activeSectionIds.has(section.id) && (
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-current"
                  />
                )}
                <CallIcon
                  type={section.type}
                  icon={section.icon}
                  emoji={section.emoji}
                />
                {section.type === "chant" && (
                  <span>
                    {section.labels?.[locale] || section.label || t("chant")}
                  </span>
                )}
                {section.type === "singalong" && (
                  <span className="min-w-0 truncate text-left">
                    {`${t("singalong")}${section.label ? ` · ${section.label}` : ""}`}
                  </span>
                )}
              </Badge>
            ))}
          </div>
        )}
        <button
          type="button"
          disabled={!ready}
          onClick={() => onSeek(index)}
          aria-current={active ? "true" : undefined}
          aria-label={t("seekLyric", {
            lyric: line.instrumental
              ? standalone
                  .map((section) => section.singalongText![readingField])
                  .join(" / ") || t("instrumental")
              : line.jp,
          })}
          className={cn(
            "block w-full px-[clamp(0.5rem,2.5cqi,1.5rem)] py-[clamp(0.875rem,3cqi,1.25rem)] [overflow-wrap:anywhere] text-center transition-[background-color,color,box-shadow] duration-(--motion-lyric) enabled:cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
            sections.length > 0 && "px-[clamp(4rem,12cqi,5rem)]",
          )}
        >
          {(!line.instrumental || standalone.length === 0) && (
            <span
              lang="ja"
              className={cn(
                "block text-[clamp(0.875rem,0.75rem+0.625cqi,1.125rem)] tracking-[clamp(-0.02em,-0.04em+0.1cqi,0em)] leading-relaxed",
                active ? "font-bold" : "font-medium",
              )}
            >
              {line.instrumental ? t("instrumental") : highlighted("jp")}
            </span>
          )}
          {!line.instrumental && locale === "ko" && (
            <>
              <span
                lang="ko"
                className={cn(
                  "mt-1.5 block text-[clamp(0.875rem,0.75rem+0.625cqi,1.125rem)] tracking-[clamp(-0.02em,-0.04em+0.1cqi,0em)] leading-relaxed",
                  active ? "font-semibold" : "font-medium",
                )}
              >
                {highlighted("jpReading")}
              </span>
              <span
                lang="ko"
                className={cn(
                  "mt-2 block text-[clamp(0.6875rem,0.625rem+0.3125cqi,0.875rem)] tracking-[clamp(-0.01em,-0.04em+0.1cqi,0em)] leading-relaxed",
                  active ? "text-inherit opacity-80" : "text-muted-foreground",
                )}
              >
                {highlighted("kr")}
              </span>
            </>
          )}
          {!line.instrumental && locale === "en" && (
            <>
              {(line.enReading ||
                sections.some(
                  (section) =>
                    section.singalongText?.placement === "inline" &&
                    section.singalongText.enReading.trim(),
                )) && (
                <span
                  lang="en"
                  className={cn(
                    "mt-1.5 block text-[clamp(0.875rem,0.75rem+0.625cqi,1.125rem)] tracking-[clamp(-0.02em,-0.04em+0.1cqi,0em)] leading-relaxed",
                    active ? "font-semibold" : "font-medium",
                  )}
                >
                  {highlighted("enReading")}
                </span>
              )}
              {line.en && (
                <span
                  lang="en"
                  className={cn(
                    "mt-2 block text-[clamp(0.6875rem,0.625rem+0.3125cqi,0.875rem)] tracking-[clamp(-0.01em,-0.04em+0.1cqi,0em)] leading-relaxed",
                    active
                      ? "text-inherit opacity-80"
                      : "text-muted-foreground",
                  )}
                >
                  {highlighted("en")}
                </span>
              )}
            </>
          )}
          {standalone.map((section) => (
            <span
              key={section.id}
              lang={locale}
              className={cn(
                "block text-[clamp(0.875rem,0.75rem+0.625cqi,1.125rem)] tracking-[clamp(-0.02em,-0.04em+0.1cqi,0em)] leading-relaxed",
                active ? "font-bold" : "font-medium",
              )}
            >
              <HighlightedText
                text={section.singalongText![readingField]}
                ranges={[
                  {
                    start: 0,
                    end: section.singalongText![readingField].length,
                  },
                ]}
              />
            </span>
          ))}
        </button>
      </div>
    </div>
  );
});
