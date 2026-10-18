export interface Music {
  id: number;
  korTitle: string;
  enTitle: string;
  title: string;
  albumArtKey?: string | null;
  specialPath?: string;
  youtubeId?: string;
  fanLightColor?: string;
  bpm?: number;
}
