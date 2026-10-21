"use client";

import { useState, type ReactNode } from "react";
import { useLoadingRouter } from "@/components/NavigationGuard";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@asobi/ui/components/tabs";
import { Button } from "@asobi/ui/components/button";
import { useNavigationGuard } from "@/components/NavigationGuard";
import { AdminDocumentPanel } from "./AdminDocumentPanel";
import { getMusicDocuments } from "./selection";
import { getSelectedNodeKey } from "./utils";
import type { AdminDashboardData, SelectedNode } from "./data";

const categoryOf = (node: SelectedNode) => {
  if (node.type === "novel" || node.type === "newNovel") return "novel";
  if (node.type === "comic" || node.type === "newComic") return "comic";
  if (node.type === "lyric" || node.type === "newLyric") return "lyric";
  return "book";
};

export function MusicContentTabs({
  data, musicId, readOnly, initialNode, revision, contentActive, media, editAction,
}: {
  media: ReactNode;
  editAction: ReactNode;
  contentActive: boolean;
  data: AdminDashboardData;
  musicId: number;
  readOnly: boolean;
  initialNode: SelectedNode | null;
  revision?: string;
}) {
  const router = useLoadingRouter();
  const guard = useNavigationGuard();
  const docs = getMusicDocuments(data, musicId);
  const groups: { value: string; label: string; items: { label: string; node: SelectedNode }[]; create?: SelectedNode }[] = [
    { value: "novel", label: "소설", items: docs.novels.map(n => ({ label: n.title, node: { type: "novel", id: n.id } })), create: { type: "newNovel", musicId } },
    { value: "comic", label: "만화", items: docs.comics.map(c => ({ label: c.title, node: { type: "comic", id: c.id } })), create: { type: "newComic", musicId } },
    { value: "lyric", label: "가사", items: docs.lyric ? [{ label: `가사 문서 · ${docs.lyric.lineCount}줄`, node: { type: "lyric", id: musicId } }] : [], create: docs.lyric ? undefined : { type: "newLyric", musicId } },
    { value: "book", label: "서적", items: docs.books.map(b => ({ label: b.name, node: { type: "book", id: b.id } })) },
  ];
  const source = `${contentActive}:${initialNode ? getSelectedNodeKey(initialNode) : ""}`;
  const [view, setView] = useState<{ source: string; tab: string } | null>(null);
  const [selections, setSelections] = useState<Record<string, { source: string; node: SelectedNode | null }>>({});
  const tab = view?.source === source ? view.tab : contentActive ? (initialNode ? categoryOf(initialNode) : "novel") : "media";
  function nodeFor(group: typeof groups[number]) {
    const selected = selections[group.value];
    const node = selected?.source === source ? selected.node
      : initialNode && categoryOf(initialNode) === group.value ? initialNode
      : group.items[0]?.node ?? null;
    // A song's book tab only displays books linked through its novels.
    if (group.value === "book")
      return group.items.find(item => node && getSelectedNodeKey(item.node) === getSelectedNodeKey(node))?.node ?? group.items[0]?.node ?? null;
    return node;
  }
  function select(target: SelectedNode) {
    if (!guard.confirmLeave()) return;
    setSelections(current => ({ ...current, [categoryOf(target)]: { source, node: target } }));
  }
  function navigateSaved(href: string) {
    const query = new URL(href, window.location.origin).searchParams;
    query.set("tab", "content");
    router.replace(`/musics/${musicId}?${query}`);
  }
  return (
    <Tabs value={tab} onValueChange={value => {
      if (!guard.busy && !guard.pending) setView({ source, tab: value });
    }} className="min-h-0 gap-0 overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b p-5 shrink-0">
        <TabsList aria-label="곡 콘텐츠 구분">
          <TabsTrigger value="media" disabled={guard.busy || guard.pending}>음원·페이지</TabsTrigger>
          {groups.map(group => <TabsTrigger key={group.value} value={group.value} disabled={guard.busy || guard.pending}>{group.label}</TabsTrigger>)}
        </TabsList>
        {editAction}
      </header>
      <TabsContent value="media" forceMount className="min-h-0 overflow-y-auto p-5 data-[state=inactive]:hidden sm:p-6">{media}</TabsContent>
      {groups.map(group => {
        const node = nodeFor(group);
        const creating = node?.type.startsWith("new") ?? false;
        const showItems = group.items.length > 1 || (creating && group.items.length > 0);
        const canCreate = !readOnly && !!group.create;
        const createAction = canCreate ? (
          <Button type="button" variant="outline" size="icon-sm" aria-label={`${group.label} 추가`} title={`${group.label} 추가`} disabled={guard.busy || guard.pending || creating} onClick={() => select(group.create!)}><Plus className="size-4" /></Button>
        ) : null;
        return (
          <TabsContent key={group.value} value={group.value} forceMount className="relative min-h-0 overflow-y-auto pt-5 data-[state=inactive]:hidden">
            {!node && createAction && <div className="absolute right-5 top-5 z-10">{createAction}</div>}
            {showItems && (
              <div className="mb-4 flex flex-wrap gap-2 px-5">
                {group.items.map(item => <Button key={getSelectedNodeKey(item.node)} variant={node && getSelectedNodeKey(node) === getSelectedNodeKey(item.node) ? "secondary" : "outline"} size="sm" disabled={guard.busy || guard.pending} onClick={() => select(item.node)}>{item.label}</Button>)}
              </div>
            )}
            {node ? (
              <AdminDocumentPanel key={getSelectedNodeKey(node)} embedded createAction={createAction} data={data} node={node}
                revision={node.type === "lyric" ? revision : undefined} readOnly={readOnly || group.value === "book"}
                onNavigate={navigateSaved}
                onCancelCreate={() => setSelections(current => ({ ...current, [group.value]: { source, node: group.items[0]?.node ?? null } }))}
                onDeleted={() => { router.replace(`/musics/${musicId}?tab=content`); router.refresh(); }} />
            ) : <p className="px-5 pb-5 type-caption">{group.label} 연결 정보가 없습니다.</p>}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
