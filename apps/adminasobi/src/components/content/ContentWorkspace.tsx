"use client";
import { useRouter } from "next/navigation";
import { Button } from "@asobi/ui/components/button";
import { useNavigationGuard } from "@/components/NavigationGuard";
import { AdminDocumentPanel } from "./AdminDocumentPanel";
import { getMusicDocuments } from "./selection";
import { getSelectedNodeKey } from "./utils";
import type { AdminDashboardData, SelectedNode } from "./data";
export function ContentWorkspace({
  data,
  node,
  musicId,
  readOnly,
  revision,
}: {
  data: AdminDashboardData;
  node: SelectedNode | null;
  musicId?: number;
  readOnly: boolean;
  revision?: string;
}) {
  const router = useRouter(),
    guard = useNavigationGuard();
  const docs = getMusicDocuments(data, musicId);
  const base = musicId === undefined ? "/books" : `/musics/${musicId}/content`;
  function navigate(url: string) {
    if (guard.confirmLeave()) router.push(url);
  }
  const item = (label: string, target: SelectedNode) => (
    <Button
      key={getSelectedNodeKey(target)}
      variant={
        node && getSelectedNodeKey(node) === getSelectedNodeKey(target)
          ? "secondary"
          : "ghost"
      }
      className="h-auto w-full justify-start whitespace-normal text-left"
      disabled={guard.busy}
      onClick={() =>
        navigate(
          `${base}?type=${target.type}${"id" in target ? `&id=${target.id}` : ""}`,
        )
      }
    >
      {label}
    </Button>
  );
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      <nav
        aria-label="콘텐츠 관리"
        className="max-h-[35dvh] shrink-0 space-y-4 overflow-y-auto border-b p-3 md:max-h-none md:w-56 md:border-r"
      >
        {musicId !== undefined && (
          <>
            <Button
              variant="outline"
              disabled={guard.busy}
              onClick={() => navigate(`/musics/${musicId}`)}
            >
              곡 상세로
            </Button>
            <section>
              <h2 className="mb-2 text-sm font-semibold">소설</h2>
              {docs.novels.map((n) =>
                item(n.title, { type: "novel", id: n.id }),
              )}
              {!readOnly && item("+ 소설 추가", { type: "newNovel", musicId })}
            </section>
            <section>
              <h2 className="mb-2 text-sm font-semibold">만화</h2>
              {docs.comics.map((c) =>
                item(c.title, { type: "comic", id: c.id }),
              )}
              {!readOnly && item("+ 만화 추가", { type: "newComic", musicId })}
            </section>
            <section>
              <h2 className="mb-2 text-sm font-semibold">가사</h2>
              {docs.lyric
                ? item(`가사 문서 · ${docs.lyric.lineCount}줄`, {
                    type: "lyric",
                    id: musicId,
                  })
                : !readOnly &&
                  item("+ 가사 추가", { type: "newLyric", musicId })}
            </section>
            <section>
              <h2 className="mb-2 text-sm font-semibold">연결 서적</h2>
              {docs.books.map((b) => item(b.name, { type: "book", id: b.id }))}
            </section>
          </>
        )}
        <section>
          <h2 className="mb-2 text-sm font-semibold">전체 서적</h2>
          {!readOnly && item("+ 서적 추가", { type: "newBook" })}
          {data.books.map((b) => item(b.name, { type: "book", id: b.id }))}
        </section>
      </nav>
      {node ? (
        <AdminDocumentPanel
          key={getSelectedNodeKey(node)}
          data={data}
          node={node}
          revision={revision}
          readOnly={readOnly}
          onDeleted={() => router.replace(base)}
        />
      ) : (
        <p className="p-6 text-sm text-muted-foreground">
          관리할 문서를 선택해 주세요.
        </p>
      )}
    </div>
  );
}
