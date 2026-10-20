"use client";

import type { LyricLine } from "@appTypes/lyric";
import { useMemo } from "react";
import { getActiveLineIndex } from "./time";

export const useActiveLyric = (
  lyrics: LyricLine[] | undefined,
  currentTime: number,
  offset: number,
) => {
  const activeLineIndex = useMemo(
    () => getActiveLineIndex(lyrics, currentTime, offset),
    [lyrics, currentTime, offset],
  );

  return {
    activeLineIndex,
    activeLine: lyrics?.[activeLineIndex] ?? null,
  };
};
