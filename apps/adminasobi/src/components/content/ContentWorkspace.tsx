"use client";
import { useRouter } from "next/navigation";
import { Button } from "@asobi/ui/components/button";
import { useNavigationGuard } from "@/components/NavigationGuard";
import { AdminDocumentPanel } from "./AdminDocumentPanel";
import { getSelectedNodeKey } from "./utils";
import type { AdminDashboardData, SelectedNode } from "./data";

// Standalone book management stays here; song documents use MusicContentTabs.
export function ContentWorkspace({ data, node, readOnly }: {
  data: AdminDashboardData;
  node: SelectedNode | null;
  readOnly: boolean;
}) {
  const router = useRouter();
  const guard = useNavigationGuard();
  const item = (label: string, target: SelectedNode) => (
    <Button
      key={getSelectedNodeKey(target)}
      variant={node && getSelectedNodeKey(node) === getSelectedNodeKey(target) ? "secondary" : "ghost"}
      className="h-auto w-full justify-start whitespace-normal text-left"
      disabled={guard.busy}
      onClick={() => {
        if (guard.confirmLeave()) router.push(`/books?type=${target.type}${"id" in target ? `&id=${target.id}` : ""}`);
      }}
    >{label}</Button>
  );
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      <nav aria-label="서적 관리" className="max-h-[35dvh] shrink-0 space-y-4 overflow-y-auto border-b p-3 md:max-h-none md:w-56 md:border-r">
        <section>
          <h2 className="mb-2 text-sm font-semibold">서적</h2>
          {!readOnly && item("+ 서적 추가", { type: "newBook" })}
          {data.books.map(book => item(book.name, { type: "book", id: book.id }))}
        </section>
      </nav>
      {node ? <AdminDocumentPanel key={getSelectedNodeKey(node)} data={data} node={node} readOnly={readOnly} onDeleted={() => router.replace("/books")} /> : <p className="p-6 text-sm text-muted-foreground">관리할 서적을 선택해 주세요.</p>}
    </div>
  );
}
