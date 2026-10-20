import type { SidebarLayout } from "@asobi/content-core/sidebarOrder";
import type { SongListItem } from "@/types/catalog";

export type SongSort = "recommended" | "album" | "release";

// Official CD track order, including instrumentals when present in the catalog.
// THE BOOK / THE BOOK 2:
// https://prtimes.jp/main/html/rd/p/000000257.000055377.html
// THE BOOK 3:
// https://prtimes.jp/main/html/rd/p/000000778.000055377.html
// THE BOOK for,:
// https://yoasobi-fc.com/s/n135/page/rl_THEBOOKfor
const albums = [
  {
    title: "THE BOOK",
    tracks: [
      "Epilogue",
      "アンコール",
      "ハルジオン",
      "あの夢をなぞって",
      "たぶん",
      "群青",
      "ハルカ",
      "夜に駆ける",
      "Prologue",
    ],
  },
  {
    title: "THE BOOK 2",
    tracks: [
      "ツバメ",
      "三原色",
      "大正浪漫",
      "もう少しだけ",
      "優しい彗星",
      "怪物",
      "もしも命が描けたら",
      "ラブレター",
    ],
  },
  {
    title: "THE BOOK 3",
    tracks: [
      "勇者",
      'Interlude "Awakening"',
      "祝福",
      "海のまにまに",
      "ミスター",
      'Interlude "Worship"',
      "アイドル",
      "セブンティーン",
      "アドベンチャー",
      "好きだ",
    ],
  },
  {
    title: "THE BOOK for,",
    tracks: [
      "オリオン",
      "アドレナ",
      "UNDEAD",
      "PLAYERS",
      "モノトーン",
      "BABY",
      "Watch me!",
      "Biri-Biri",
      "New me",
      "HEART BEAT",
      "舞台に立って",
      "劇上",
    ],
  },
];

const normalizeTitle = (title: string) =>
  title.normalize("NFKC").trim().toLowerCase().replace(/[“”]/g, '"');

export function getAlbumLayout(catalog: SongListItem[]): SidebarLayout {
  const remaining = new Map(catalog.map(({ music }) => [music.id, music]));
  const groups = albums.map(({ title, tracks }) => ({
    id: title,
    name: { ko: title, ja: title, en: title },
    musicIds: tracks.flatMap((track) => {
      const music = [...remaining.values()].find(
        (music) => normalizeTitle(music.title) === normalizeTitle(track),
      );
      if (!music) return [];
      remaining.delete(music.id);
      return [music.id];
    }),
  }));
  return { groups, ungrouped: [...remaining.keys()] };
}
