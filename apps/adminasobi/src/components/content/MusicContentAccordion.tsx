"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@asobi/ui/components/accordion";
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

export function MusicContentAccordion({
  data, musicId, readOnly, initialNode, revision,
}: {
  data: AdminDashboardData;
  musicId: number;
  readOnly: boolean;
  initialNode: SelectedNode | null;
  revision?: string;
}) {
  const router = useRouter();
  const guard = useNavigationGuard();
  const docs = getMusicDocuments(data, musicId);
  const groups: { value: string; label: string; items: { label: string; node: SelectedNode }[]; create?: SelectedNode }[] = [
    { value: "novel", label: "소설", items: docs.novels.map(n => ({ label: n.title, node: { type: "novel", id: n.id } })), create: docs.novels.length ? undefined : { type: "newNovel", musicId } },
    { value: "comic", label: "만화", items: docs.comics.map(c => ({ label: c.title, node: { type: "comic", id: c.id } })), create: docs.comics.length ? undefined : { type: "newComic", musicId } },
    { value: "lyric", label: "가사", items: docs.lyric ? [{ label: `가사 문서 · ${docs.lyric.lineCount}줄`, node: { type: "lyric", id: musicId } }] : [], create: docs.lyric ? undefined : { type: "newLyric", musicId } },
    { value: "book", label: "연결 서적", items: docs.books.map(b => ({ label: b.name, node: { type: "book", id: b.id } })), create: { type: "newBook" } },
  ];
  const first = initialNode ?? groups.flatMap(g => g.items)[0]?.node ?? null;
  const [node, setNode] = useState<SelectedNode | null>(first);
  const [category, setCategory] = useState(first ? categoryOf(first) : "novel");
  function select(target: SelectedNode) {
    if (!guard.confirmLeave()) return;
    setNode(target);
    setCategory(categoryOf(target));
  }
  function navigateSaved(href: string) {
    const query = new URL(href, window.location.origin).searchParams;
    query.set("tab", "content");
    router.replace(`/musics/${musicId}?${query}`);
  }
  return (
    <Accordion
      type="single"
      collapsible
      value={category}
      onValueChange={(value) => {
        if (!guard.confirmLeave()) return;
        setCategory(value);
        setNode(groups.find(g => g.value === value)?.items[0]?.node ?? null);
      }}
    >
      {groups.map(group => (
        <AccordionItem key={group.value} value={group.value}>
          <div className="flex items-center gap-2 px-5">
            <AccordionTrigger className="min-w-0 flex-1 py-4" disabled={guard.busy}>
              <span>{group.label} <span className="ml-1 text-muted-foreground">{group.items.length}</span></span>
            </AccordionTrigger>
            {!readOnly && group.create && (
              <Button variant="ghost" size="icon-sm" aria-label={`${group.label} 추가`} disabled={guard.busy} onClick={() => select(group.create!)}>
                <Plus className="size-4" />
              </Button>
            )}
          </div>
          <AccordionContent className="pb-0">
            {group.items.length > 1 && (
              <div className="flex flex-wrap gap-2 px-5 pb-3">
                {group.items.map(item => (
                  <Button key={getSelectedNodeKey(item.node)} variant={node && getSelectedNodeKey(node) === getSelectedNodeKey(item.node) ? "secondary" : "outline"} size="sm" disabled={guard.busy} onClick={() => select(item.node)}>{item.label}</Button>
                ))}
              </div>
            )}
            {category === group.value && node && categoryOf(node) === group.value ? (
              <AdminDocumentPanel
                key={getSelectedNodeKey(node)}
                data={data}
                node={node}
                revision={node.type === "lyric" ? revision : undefined}
                readOnly={readOnly}
                onNavigate={navigateSaved}
                onDeleted={() => {
                  router.replace(`/musics/${musicId}?tab=content`);
                  router.refresh();
                }}
              />
            ) : <p className="px-5 pb-5 type-caption">연결된 {group.label}이 없습니다.</p>}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
