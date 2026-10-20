"use client";

import type { LyricLine } from "@asobi/content-core/lyrics";
import { useMemo } from "react";
import { getActiveLineIndex } from "@asobi/content-core/lyricTime";

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
