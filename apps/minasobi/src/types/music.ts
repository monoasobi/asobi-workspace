export interface AdminMusic {
  id: number;
  title: string;
  korTitle: string;
  enTitle: string;
  albumArtKey: string | null;
  commonYoutubeId: string | null;
  specialPath: string | null;
  updatedAt: string;
  youtubeId: string | null;
  fanLightColor: string | null;
  bpm: number | null;
  publish: boolean;
  syncOffset: number;
  sourceSync: number;
  hasLyrics: boolean;
  guideUpdatedAt: string | null;
}
