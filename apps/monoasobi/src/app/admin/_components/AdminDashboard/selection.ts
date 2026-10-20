import type { AdminDashboardData, SelectedNode } from "../AdminDashboard";

export const isSelectedNode = (value: unknown): value is SelectedNode => {
  if (!value || typeof value !== "object") return false;

  const node = value as Partial<SelectedNode>;
  if (typeof node.type !== "string") return false;

  switch (node.type) {
    case "music":
    case "novel":
    case "comic":
    case "lyric":
    case "book":
      return Number.isInteger(node.id);
    case "newNovel":
    case "newComic":
    case "newLyric":
      return Number.isInteger(node.musicId);
    case "newMusic":
    case "newBook":
      return true;
    default:
      return false;
  }
};

export const isValidSelectedNode = (
  node: SelectedNode,
  data: AdminDashboardData,
  canManage: boolean,
) => {
  switch (node.type) {
    case "music":
      return data.musics.some((music) => music.id === node.id);
    case "novel":
      return data.novels.some((novel) => novel.id === node.id);
    case "comic":
      return data.comics.some((comic) => comic.id === node.id);
    case "lyric":
      return data.lyricTracks.some((track) => track.musicId === node.id);
    case "book":
      return data.books.some((book) => book.id === node.id);
    case "newMusic":
    case "newBook":
      return canManage;
    case "newNovel":
    case "newComic":
      return (
        canManage && data.musics.some((music) => music.id === node.musicId)
      );
    case "newLyric":
      return (
        canManage &&
        data.musics.some((music) => music.id === node.musicId) &&
        !data.lyricTracks.some((track) => track.musicId === node.musicId)
      );
  }
};

export const getMusicDocuments = (data: AdminDashboardData, musicId?: number) => {
  const novels = data.novels.filter((novel) => novel.musicId === musicId);
  const novelIds = new Set(novels.map((novel) => novel.id));
  return {
    novels,
    comics: data.comics.filter((comic) => comic.musicId === musicId),
    lyric: data.lyricTracks.find((track) => track.musicId === musicId),
    books: data.books.filter((book) =>
      novels.some((novel) => novel.bookId === book.id) ||
      book.novels.some(({ novel }) => novelIds.has(novel.id)),
    ),
  };
};

export const belongsToMusic = (node: SelectedNode, data: AdminDashboardData, musicId?: number) => {
  const documents = getMusicDocuments(data, musicId);
  switch (node.type) {
    case "music": return node.id === musicId;
    case "novel": return documents.novels.some((novel) => novel.id === node.id);
    case "comic": return documents.comics.some((comic) => comic.id === node.id);
    case "lyric": return node.id === musicId;
    case "book": return data.books.some((book) => book.id === node.id);
    case "newNovel":
    case "newComic":
    case "newLyric": return node.musicId === musicId;
    case "newMusic":
    case "newBook": return true;
  }
};

export const readSelection = (key: string, fallback: SelectedNode, data: AdminDashboardData, canManage: boolean, musicId?: number): SelectedNode => {
  try {
    const node: unknown = JSON.parse(sessionStorage.getItem(key) ?? "null");
    return isSelectedNode(node) && node.type !== "newMusic" && isValidSelectedNode(node, data, canManage) && belongsToMusic(node, data, musicId) ? node : fallback;
  } catch {
    return fallback;
  }
};
