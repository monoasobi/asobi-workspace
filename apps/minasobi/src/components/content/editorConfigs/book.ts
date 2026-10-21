import type { AdminDashboardData, SelectedNode } from "../data";
import type { EditorConfig } from "../types";
import { formText } from "../utils";
import { field, urlField } from "./fieldFactory";

export const getBookEditorConfig = (
  data: AdminDashboardData,
  selectedNode: Extract<SelectedNode, { type: "book" | "newBook" }>,
): EditorConfig => {
  const book =
    selectedNode.type === "book"
      ? data.books.find((item) => item.id === selectedNode.id)
      : null;

  // Preserve saved links even when their novels are absent from the active catalog.
  const novels = new Map<number, Pick<(typeof data.novels)[number], "id" | "title" | "musicId">>((data.novelOptions ?? data.novels).map(novel => [novel.id, novel]));
  for (const { novel } of book?.novels ?? []) {
    if (!novels.has(novel.id)) novels.set(novel.id, novel);
  }
  const novelOptions = [...novels.values()].map(novel => ({
    value: String(novel.id),
    label: novel.title || `소설 #${novel.id}`,
    description: data.novelOptions?.find(option => option.id === novel.id)?.musicTitle
      || data.musics.find(music => music.id === novel.musicId)?.korTitle
      || data.musics.find(music => music.id === novel.musicId)?.title || "기존 연결 소설",
  }));

  return {
    title: book ? "Edit book" : "Create book",
    submitLabel: book ? "저장" : "생성",
    endpoint: book ? `/api/admin/books/${book.id}` : "/api/admin/books",
    deleteEndpoint: book ? `/api/admin/books/${book.id}` : undefined,
    deleteDescription: "novel 연결 정보와 구매 링크가 함께 삭제됩니다.",
    method: book ? "PUT" : "POST",
    fields: [
      field("name", "name", book?.name, true),
      {
        type: "multi-select",
        name: "novelIds",
        label: "연결 소설",
        defaultValue: book?.novels.map(({ novel }) => String(novel.id)) ?? [],
        options: novelOptions,
      },
      urlField("kyoboUrl", "kyoboUrl", book?.purchaseLinks?.kyoboUrl ?? ""),
      urlField("yes24Url", "yes24Url", book?.purchaseLinks?.yes24Url ?? ""),
      urlField("aladinUrl", "aladinUrl", book?.purchaseLinks?.aladinUrl ?? ""),
      urlField("ridiUrl", "ridiUrl", book?.purchaseLinks?.ridiUrl ?? ""),
      urlField("naverUrl", "naverUrl", book?.purchaseLinks?.naverUrl ?? ""),
    ],
    toPayload: (formData) => ({
      name: formText(formData, "name"),
      novelIds: formText(formData, "novelIds")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      purchaseLinks: {
        kyoboUrl: formText(formData, "kyoboUrl"),
        yes24Url: formText(formData, "yes24Url"),
        aladinUrl: formText(formData, "aladinUrl"),
        ridiUrl: formText(formData, "ridiUrl"),
        naverUrl: formText(formData, "naverUrl"),
      },
    }),
  };
};
