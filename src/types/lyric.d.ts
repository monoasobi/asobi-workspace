export type LyricLocale = "ko" | "ja" | "en";
import type { LyricTextField } from "@/lib/lyricText";

export interface LyricLine {
  instrumental?: boolean;
  originalStart?: number;
  originalEnd?: number;
  id?: string;
  start: number;
  end: number;
  jp: string;
  kr: string;
  jpReading: string;
  en?: string;
  enReading?: string;
}

export interface LyricTrack {
  id: number;
  sync: number;
  lyric: LyricLine[];
  songGuide?: Record<LyricLocale, string>;
  guides?: {
    id: string;
    beforeLineId: string | null;
    labels: Record<LyricLocale, string>;
  }[];
}

export interface CallSection {
  start: number;
  end: number;
  id: string;
  type: "clap" | "chant" | "singalong" | "custom";
  firstLine: number;
  lastLine: number;
  label?: string;
  emoji?: string;
  labels?: Record<LyricLocale, string>;
  notes?: Record<LyricLocale, string>;
  customEffects?: { text: boolean; flash: boolean };
  // Seconds on the lyric timeline; track sync is added when reading player time.
  pulseTimes: number[];
  // Optional selected text offsets, not pre-split lyric segments.
  selection?: { line: number; start: number; end: number };
  textSelections?: {
    lineId: string;
    field: LyricTextField;
    start: number;
    end: number;
  }[];
}
