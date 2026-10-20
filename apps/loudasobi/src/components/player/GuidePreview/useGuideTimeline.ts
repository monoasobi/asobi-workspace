"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type RefObject,
} from "react";
import type { CallSection, LyricLine } from "@/types/lyric";
import type { PlaybackClock } from "../MusicExperience/playbackClock";
import { activeLineAt, upperBound } from "./timeline";

export function useGuideTimeline(
  clock: PlaybackClock,
  lines: readonly LyricLine[],
  sections: readonly CallSection[],
  offset: number,
  viewportRef: RefObject<HTMLDivElement | null>,
) {
  const starts = useMemo(() => lines.map((line) => line.start), [lines]);
  const sectionByLine = useMemo(() => {
    const mapped: CallSection[][] = Array.from(
      { length: lines.length },
      () => [],
    );
    for (const section of sections) {
      lines.forEach((line, index) => {
        if (
          section.singalongText?.placement === "inline"
            ? section.singalongText.lineId === line.id
            : section.start < line.end && section.end > line.start
        )
          mapped[index].push(section);
      });
    }
    return mapped;
  }, [lines, sections]);
  const hits = useMemo(
    () =>
      Array.from(
        new Set(sections.flatMap((section) => section.pulseTimes)),
      ).sort((a, b) => a - b),
    [sections],
  );
  const snapshot = useCallback(() => {
    const time = clock.read().time - offset;
    const activeSections = sections.flatMap((section, index) =>
      section.start <= time && time < section.end ? [index] : [],
    );
    return `${activeLineAt(lines, starts, time)}|${activeSections.join(",")}`;
  }, [clock, lines, starts, sections, offset]);
  const subscribe = useCallback(
    (notify: () => void) => {
      let previous = snapshot();
      return clock.subscribeFrame(() => {
        const next = snapshot();
        if (next !== previous) {
          previous = next;
          notify();
        }
      });
    },
    [clock, snapshot],
  );
  const state = useSyncExternalStore(subscribe, snapshot, () => "-1|");
  const [lineState, sectionState] = state.split("|");
  const activeIndex = Number(lineState);
  const activeSectionIds = new Set(
    sectionState
      ? sectionState.split(",").map((index) => sections[Number(index)].id)
      : [],
  );

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const row = viewport?.querySelector<HTMLElement>(
      `[data-line-index="${activeIndex}"]`,
    );
    const block = row?.closest<HTMLElement>("[data-call-block]");
    const position = block?.querySelector<HTMLElement>("[data-chant-position]");
    if (!viewport || !row || !block || !position) return;
    // Move the stable block-owned wrapper; leave the text animation untouched.
    const align = () => {
      const rowRect = (
        row.querySelector<HTMLElement>("[data-lyric-content]") ?? row
      ).getBoundingClientRect();
      position.style.top = `${rowRect.top - block.getBoundingClientRect().top - block.clientTop + rowRect.height / 2}px`;
    };
    align();
    const observer = new ResizeObserver(align);
    observer.observe(viewport);
    observer.observe(block);
    observer.observe(row);
    return () => observer.disconnect();
  }, [activeIndex, lines, sections, viewportRef]);

  useEffect(() => {
    let previousTime = clock.read().time - offset;
    let animation: Animation | null = null;
    let chantAnimations: Animation[] = [];
    let animatedBlock: HTMLElement | null = null;
    const blockAt = (index: number) =>
      viewportRef.current
        ?.querySelector<HTMLElement>(`[data-line-index="${index}"]`)
        ?.closest<HTMLElement>("[data-call-block]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cancel = () => {
      animation?.cancel();
      chantAnimations.forEach((item) => item.cancel());
      chantAnimations = [];
      animation = null;
      animatedBlock = null;
    };
    reduced.addEventListener("change", cancel);
    const unsubscribe = clock.subscribeFrame((sample) => {
      const time = sample.time - offset;
      const previous = previousTime;
      previousTime = time;
      if (
        sample.reset ||
        !sample.running ||
        time < previous ||
        time - previous > 0.5
      ) {
        cancel();
        return;
      }
      const lineIndex = activeLineAt(lines, starts, time);
      // Text belongs to the call block, so lyric changes must not interrupt it.
      if (animatedBlock && blockAt(lineIndex) !== animatedBlock) cancel();
      const hitIndex = upperBound(hits, time) - 1;
      const hit = hits[hitIndex];
      if (hit === undefined || hit <= previous || time - hit > 0.14) return;
      // Keep pulses within their call block, including across lyric boundaries.
      const block = blockAt(activeLineAt(lines, starts, hit));
      if (!block || block !== blockAt(lineIndex)) return;
      const overlay = block.querySelector<HTMLElement>("[data-guide-pulse]");
      if (!overlay) return;
      cancel();
      animatedBlock = block;
      const pulsing = (sectionByLine[lineIndex] ?? []).filter(
        (section) =>
          section.type !== "singalong" &&
          section.start <= hit &&
          hit < section.end &&
          section.pulseTimes.includes(hit),
      );
      const chanting = new Set(
        pulsing
          .filter(
            (section) =>
              section.type === "chant" ||
              (section.type === "custom" && section.customEffects?.text),
          )
          .map((section) => section.id),
      );
      const colors = [
        ...new Set(
          pulsing
            .filter(
              (section) =>
                section.type !== "custom" || section.customEffects?.flash,
            )
            .map((section) =>
              section.type === "custom"
                ? "var(--navy-500)"
                : section.type === "chant"
                  ? "var(--cyan-500)"
                  : "var(--yellow-600)",
            ),
        ),
      ];
      const fills = colors.map(
        (color) => `color-mix(in oklch, ${color} 14%, transparent)`,
      );
      overlay.style.backgroundImage = colors.length
        ? `linear-gradient(110deg, ${fills.length === 1 ? `${fills[0]}, ${fills[0]}` : fills.join(", ")})`
        : "none";
      const border = colors
        .map((color, index) => `inset 0 0 0 ${(index + 1) * 2}px ${color}`)
        .join(", ");
      block
        .querySelectorAll<HTMLElement>("[data-chant-pulse]")
        .forEach((text) => {
          if (!chanting.has(text.dataset.chantPulse ?? "")) return;
          chantAnimations.push(
            text.animate(
              reduced.matches
                ? [{ opacity: 1 }, { opacity: 0 }]
                : [
                    { opacity: 0, transform: "translateY(5px) scale(0.85)" },
                    {
                      opacity: 1,
                      transform: "translateY(0) scale(1.15)",
                      offset: 0.2,
                    },
                    {
                      opacity: 1,
                      transform: "translateY(-2px) scale(1.15)",
                      offset: 0.55,
                    },
                    { opacity: 0, transform: "translateY(-10px) scale(1.2)" },
                  ],
              { duration: reduced.matches ? 180 : 420, easing: "ease-out" },
            ),
          );
        });
      if (colors.length)
        animation = overlay.animate(
          [
            { opacity: reduced.matches ? 0.5 : 1, boxShadow: border },
            {
              opacity: reduced.matches ? 0.5 : 1,
              boxShadow: border,
              offset: 0.35,
            },
            { opacity: 0, boxShadow: border },
          ],
          { duration: reduced.matches ? 180 : 380, easing: "ease-out" },
        );
    });
    return () => {
      unsubscribe();
      cancel();
      reduced.removeEventListener("change", cancel);
    };
  }, [
    clock,
    lines,
    starts,
    hits,
    sections,
    sectionByLine,
    offset,
    viewportRef,
  ]);

  return { activeIndex, activeSectionIds, sectionByLine };
}
