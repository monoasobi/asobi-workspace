import type { AdminDashboardData, SelectedNode } from "./data";
import { documentLabels } from "./documentLabels";
import type { DocumentField, SelectedDocument } from "./types";

export const getSelectedDocument = (
  data: AdminDashboardData,
  selectedNode: SelectedNode,
): SelectedDocument => {
  if (selectedNode.type === "newMusic") {
    return emptyDocument("musics", "곡 추가");
  }

  if (selectedNode.type === "newNovel") {
    const music = data.musics.find((item) => item.id === selectedNode.musicId);
    return emptyDocument("novels", `소설 추가 · ${music?.title ?? ""}`);
  }

  if (selectedNode.type === "newComic") {
    const music = data.musics.find((item) => item.id === selectedNode.musicId);
    return emptyDocument("comics", `만화 추가 · ${music?.title ?? ""}`);
  }

  if (selectedNode.type === "newLyric") {
    const music = data.musics.find((item) => item.id === selectedNode.musicId);
    return emptyDocument(
      "lyric_tracks",
      `가사 추가 · ${music?.title ?? ""}`,
    );
  }

  if (selectedNode.type === "newBook") {
    return emptyDocument("books", "서적 추가");
  }

  if (selectedNode.type === "music") {
    const music = data.musics.find((item) => item.id === selectedNode.id);
    return {
      collection: "musics",
      title: music ? music.title : "곡 정보 없음",
      fields: toFields([
        ["id", music?.id],
        ["title", music?.title],
        ["korTitle", music?.korTitle],
        ["enTitle", music?.enTitle],
        ["youtubeId", music?.youtubeId],
        ["specialPath", music?.specialPath ?? null],
      ]),
    };
  }

  if (selectedNode.type === "novel") {
    const novel = data.novels.find((item) => item.id === selectedNode.id);
    return {
      collection: "novels",
      title: novel ? novel.title : "소설 정보 없음",
      fields: toFields([
        ["id", novel?.id],
        ["music", novel?.music?.title],
        ["book", novel?.book?.name ?? null],
        ["title", novel?.title],
        ["writer", novel?.writer],
        ["originUrl", novel?.originUrl],
        ["translated", novel?.translated],
        ["translator", novel?.translator ?? null],
        ["translatorUrl", novel?.translatorUrl ?? null],
        ["isPublished", novel?.isPublished],
      ]),
    };
  }

  if (selectedNode.type === "comic") {
    const comic = data.comics.find((item) => item.id === selectedNode.id);
    return {
      collection: "comics",
      title: comic ? comic.title : "만화 정보 없음",
      fields: toFields([
        ["id", comic?.id],
        ["music", comic?.music?.title],
        ["title", comic?.title],
        ["writer", comic?.writer],
        ["originUrl", comic?.originUrl],
        ["translator", comic?.translator],
        ["translatorUrl", comic?.translatorUrl],
        ["length", comic?.length],
      ]),
    };
  }

  if (selectedNode.type === "lyric") {
    const track = data.lyricTracks.find(
      (item) => item.musicId === selectedNode.id,
    );
    return {
      collection: "lyric_tracks",
      title: track ? "가사 정보" : "가사 정보 없음",
      fields: toFields([
        ["music", data.musics.find(music => music.id === selectedNode.id)?.title],
        ["sync", track?.sync],
        ["lineCount", track?.lineCount],
      ]),
      jsonText: track ? JSON.stringify(track.lyricJson, null, 2) : undefined,
    };
  }

  const book = data.books.find((item) => item.id === selectedNode.id);
  return {
    collection: "books",
    title: book ? book.name : "서적 정보 없음",
    fields: toFields([
      ["id", book?.id],
      ["name", book?.name],
      [
        "novels",
        book?.novels.map(({ novel }) => novel.title) ?? [],
      ],
      ...getPurchaseFields(book?.purchaseLinks ?? null),
    ]),
  };
};

const getPurchaseFields = (
  links: AdminDashboardData["books"][number]["purchaseLinks"],
): [string, unknown][] => {
  const fields = links ? Object.entries(links).filter(([key, value]) => key.endsWith("Url") && key in documentLabels && Boolean(value)) : [];
  return fields.length ? fields : [["purchaseLinks", null]];
};

const emptyDocument = (
  collection: string,
  title: string,
): SelectedDocument => ({
  collection,
  title,
  fields: [],
});

const toFields = (fields: [string, unknown][]) => fields.map(toField);

const toField = ([key, value]: [string, unknown]): DocumentField => ({
  key,
  label: documentLabels[key] ?? key,
  kind: typeof value === "boolean" ? "status" : typeof value === "string" && URL.canParse(value) && ["https:", "http:"].includes(new URL(value).protocol) ? "link" : "text",
  value:
    value === null || value === undefined
      ? "미등록"
      : Array.isArray(value)
        ? value.length ? value.join(", ") : "연결 없음"
        : String(value),
});
