export interface SidebarSong {
  music: {
    id: number;
    title: string;
    korTitle: string;
    enTitle: string;
    albumArtKey?: string | null;
    fanLightColor?: string;
  };
  hasLyrics: boolean;
  publish?: boolean;
}
