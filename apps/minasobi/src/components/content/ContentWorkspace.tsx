"use client";
import { useLoadingRouter } from "@/components/NavigationGuard";
import { BookOpen, Check, Plus } from "lucide-react";
import { Button } from "@asobi/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@asobi/ui/components/card";
import { useNavigationGuard } from "@/components/NavigationGuard";
import { FormSkeleton, ListSkeleton } from "../loading/AdminSkeletons";
import { PendingSection } from "../loading/PendingSection";
import { AdminDocumentPanel } from "./AdminDocumentPanel";
import { getSelectedNodeKey } from "./utils";
import type { AdminDashboardData, SelectedNode } from "./data";

export function ContentWorkspace({ data, node, readOnly }: {
  data: AdminDashboardData;
  node: SelectedNode | null;
  readOnly: boolean;
}) {
  const router = useLoadingRouter();
  const guard = useNavigationGuard();
  function open(target: SelectedNode) {
    if (guard.confirmLeave()) router.push(`/books?type=${target.type}${"id" in target ? `&id=${target.id}` : ""}`);
  }
  const addBook = () => open({ type: "newBook" });
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden p-4 sm:p-6">
      <header className="flex shrink-0 items-start gap-3">
        <BookOpen aria-hidden className="mt-0.5 size-6 text-primary" />
        <div className="grid gap-1">
          <h1 className="type-page-title">서적 관리</h1>
          <p className="type-description">서적 정보와 연결 소설, 구매 링크를 관리합니다.</p>
        </div>
      </header>
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(8rem,1fr)_minmax(0,2fr)] gap-5 md:grid-cols-[16rem_minmax(0,1fr)] md:grid-rows-1">
        <Card className="min-h-0 gap-0 py-0">
          <CardHeader className="flex shrink-0 flex-row items-center justify-between border-b px-5 py-4">
            <CardTitle className="type-card-title">서적 목록</CardTitle>
            {!readOnly && <Button type="button" variant="ghost" size="icon-sm" aria-label="서적 추가" title="서적 추가" disabled={guard.busy} onClick={addBook}><Plus className="size-4" /></Button>}
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-y-auto p-2">
            <PendingSection loading={guard.refreshing} fallback={<ListSkeleton />}>
            <nav aria-label="서적 관리">
              <ul className="grid gap-1">
                {data.books.map(book => {
                  const selected = node?.type === "book" && node.id === book.id;
                  const novels = [...new Set([...book.novels.map(({ novel }) => novel.title), ...(data.novelOptions ?? data.novels).filter(novel => novel.bookId === book.id).map(novel => novel.title)])];
                  return <li key={book.id}>
                    <Button type="button" variant={selected ? "secondary" : "ghost"}
                      aria-current={selected ? "page" : undefined}
                      className={`h-auto min-h-14 w-full justify-start gap-3 whitespace-normal border px-3 py-3 text-left ${selected ? "border-primary/30" : "border-transparent"}`}
                      disabled={guard.busy} onClick={() => open({ type: "book", id: book.id })}>
                      <BookOpen aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                      <span className="grid min-w-0 flex-1 gap-1">
                        <span className="break-words type-label">{book.name}</span>
                        <span className="line-clamp-2 type-caption">{novels.join(" · ") || "연결된 소설 없음"}</span>
                      </span>
                      {selected && <Check aria-hidden className="size-4 shrink-0 text-primary" />}
                    </Button>
                  </li>;
                })}
              </ul>
              {!data.books.length && <p className="px-3 py-6 text-center type-caption">등록된 서적이 없습니다.</p>}
            </nav>
            </PendingSection>
          </CardContent>
        </Card>
        <Card className="min-h-0 gap-0 py-0">
          <CardContent className="min-h-0 flex-1 overflow-y-auto p-0 pt-5">
            <PendingSection fallback={<FormSkeleton />}>
            {node ? <AdminDocumentPanel key={getSelectedNodeKey(node)} embedded data={data} node={node} readOnly={readOnly} onDeleted={() => router.replace("/books")} /> : (
              <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 pb-5 text-center">
                <span className="flex size-12 items-center justify-center rounded-xl bg-muted"><BookOpen aria-hidden className="size-6 text-muted-foreground" /></span>
                <h2 className="type-section-title">{data.books.length ? "서적을 선택해 주세요" : "첫 서적을 추가해 주세요"}</h2>
                <p className="max-w-sm type-description">{data.books.length ? "목록에서 서적을 선택하면 상세 정보를 확인하고 수정할 수 있습니다." : "서적을 등록하고 소설을 연결하면 해당 곡의 서적 탭에도 표시됩니다."}</p>
                {!readOnly && <Button type="button" size="sm" className="mt-1" disabled={guard.busy} onClick={addBook}><Plus className="size-4" />서적 추가</Button>}
              </div>
            )}
            </PendingSection>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
