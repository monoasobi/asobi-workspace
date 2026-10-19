import { Fragment, useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { CallIcon } from "@/components/common/CallIcon";
import type { CallSection } from "@/types/lyric";
import { clapSteps, clapStepAt } from "./ClapIndicator/clapSteps";
import type { PlaybackClock } from "./MusicExperience/playbackClock";
import { upperBound } from "./GuidePreview/timeline";

export function ClapIndicator({
  sections,
  clock,
  offset = 0,
}: {
  sections: CallSection[];
  clock?: PlaybackClock;
  offset?: number;
}) {
  const t = useTranslations();
  const root = useRef<HTMLSpanElement>(null);
  const patterns = useMemo(() => {
    const result: {
      section: CallSection;
      steps: boolean[] | null;
      sources: CallSection[];
    }[] = [];
    const seen = new Map<string, number>();
    for (const section of sections) {
      if (section.type !== "clap" || !section.pulseTimes.length) continue;
      const steps = section.clapPattern ? clapSteps(section.clapPattern) : null;
      const key = steps ? steps.join(",") : section.id;
      const previous = seen.get(key);
      if (previous !== undefined) {
        result[previous].sources.push(section);
        continue;
      }
      seen.set(key, result.length);
      result.push({ section, steps, sources: [section] });
    }
    return result;
  }, [sections]);
  useEffect(() => {
    if (!clock || !root.current) return;
    const rows = Array.from(
      root.current.querySelectorAll<HTMLElement>("[data-clap-pattern]"),
      (row, index) => ({
        ...patterns[index],
        cells: Array.from(
          row.querySelectorAll<HTMLElement>("[data-clap-step]"),
        ),
        active: -1,
      }),
    );
    const update = ({ time }: { time: number }) => {
      const lyricTime = time - offset;
      for (const row of rows) {
        const source = row.sources.find(
          (section) => section.start <= lyricTime && lyricTime < section.end,
        );
        let next = -1;
        if (source) {
          if (row.steps) next = clapStepAt(source, row.steps.length, lyricTime);
          else {
            const index = upperBound(source.pulseTimes, lyricTime) - 1;
            if (index >= 0 && lyricTime - source.pulseTimes[index] < 0.14)
              next = index;
          }
        }
        if (next === row.active) continue;
        row.cells[row.active]?.removeAttribute("data-active");
        row.cells[next]?.setAttribute("data-active", "true");
        row.active = next;
      }
    };
    update(clock.read());
    const unsubscribe = clock.subscribeFrame(update);
    return () => {
      unsubscribe();
      rows.forEach((row) =>
        row.cells[row.active]?.removeAttribute("data-active"),
      );
    };
  }, [clock, offset, patterns]);
  if (!patterns.length) return null;
  return (
    <span
      ref={root}
      data-clap-indicator
      className="mb-2 flex flex-col items-center gap-1.5"
    >
      {patterns.map(({ section, steps }) => (
        <span
          key={section.id}
          data-clap-pattern
          role="img"
          aria-label={
            steps
              ? t("clapPattern", {
                  count: steps.length,
                  hits: steps
                    .flatMap((hit, index) => (hit ? [index + 1] : []))
                    .join(", "),
                })
              : t("clapTiming", { count: section.pulseTimes.length })
          }
          className={`block max-w-full ${steps ? "w-fit" : "w-36"} rounded-md border border-yellow-600/15 bg-yellow-100/30 px-1.5 py-1 text-yellow-700 dark:border-yellow-400/20 dark:bg-yellow-900/15 dark:text-yellow-400 [&_svg]:size-3!`}
        >
          {steps ? (
            <span
              aria-hidden="true"
              className="grid w-[137px] max-w-full grid-cols-[repeat(4,minmax(0,1fr))_9px_repeat(4,minmax(0,1fr))] items-center gap-y-0.5"
            >
              {steps.map((hit, index) => (
                <Fragment key={index}>
                  {index % 8 === 4 && (
                    <span className="flex justify-center px-1">
                      <span className="h-3 border-l border-yellow-600/20 dark:border-yellow-400/20" />
                    </span>
                  )}
                  <span
                    data-clap-step
                    className={`flex aspect-square w-full min-w-0 items-center justify-center rounded-sm data-[active=true]:bg-yellow-600/25 data-[active=true]:ring-1 data-[active=true]:ring-inset data-[active=true]:ring-yellow-600/50 dark:data-[active=true]:bg-yellow-400/25 dark:data-[active=true]:ring-yellow-400/60`}
                  >
                    {hit ? (
                      <CallIcon type="clap" />
                    ) : (
                      <span className="size-1 rounded-full bg-current opacity-25" />
                    )}
                  </span>
                </Fragment>
              ))}
            </span>
          ) : (
            <span aria-hidden="true" className="flex h-4 items-center gap-2">
              <CallIcon type="clap" />
              <span className="relative mx-1 block h-4 min-w-0 flex-1">
                <span className="absolute inset-x-0 top-1/2 border-t border-current opacity-15" />
                {section.pulseTimes.map((time) => (
                  <span
                    key={time}
                    data-clap-step
                    className="absolute top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 bg-current data-[active=true]:h-3 data-[active=true]:w-1 data-[active=true]:rounded-full data-[active=true]:shadow-[0_0_4px_currentColor]"
                    style={{
                      left: `${((time - section.start) / (section.end - section.start)) * 100}%`,
                    }}
                  />
                ))}
              </span>
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
