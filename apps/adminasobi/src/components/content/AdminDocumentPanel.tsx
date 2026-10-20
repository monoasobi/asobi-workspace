"use client";
import { useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@asobi/ui/components/button";
import { getEditorConfig } from "./adminEditorConfig";
import { getSelectedDocument } from "./adminSelectedDocument";
import { getErrorMessage, getInitialVisibilityFlags } from "./utils";
import { AlbumArtField } from "./AlbumArtField";
import { AdminEditorField } from "./AdminEditorField";
import type { AdminDashboardData, SelectedNode } from "./data";
import { useNavigationGuard } from "@/components/NavigationGuard";
import { useEditorGuard } from "@/components/editors/shared/useEditorGuard";
import { RefreshStatus } from "@/components/RefreshStatus";
import type { RefreshResult } from "@/types/refresh";
import { AdminSrtExport } from "@/components/editors/AdminSrtExport";

export function AdminDocumentPanel({
  data,
  node,
  readOnly,
  revision,
  onDeleted,
  onNavigate,
}: {
  data: AdminDashboardData;
  node: SelectedNode;
  readOnly: boolean;
  revision?: string;
  onDeleted: () => void;
  onNavigate?: (href: string) => void;
}) {
  const fieldIdPrefix = useId();
  const router = useRouter();
  const navigate = (href: string) => onNavigate ? onNavigate(href) : router.replace(href);
  const config = getEditorConfig(data, node)!;
  const document = getSelectedDocument(data, node);
  const [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const guard = useNavigationGuard();
  const blocked = busy || guard.busy;
  const [editRevision, setEditRevision] = useState(revision);
  const [flags, setFlags] = useState(() => getInitialVisibilityFlags(config));
  const [editing, setEditing] = useState(config.method === "POST" && !readOnly);
  const [refresh, setRefresh] = useState<RefreshResult[]>([]);
  const savedMusicId = useRef<number | null>(null);
  const [nextHref, setNextHref] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);
  useEditorGuard(`document-${fieldIdPrefix}`, dirty, busy);
  const lyric =
    node.type === "lyric"
      ? data.lyricTracks.find((t) => t.musicId === node.id)
      : undefined;
  const music = lyric
    ? data.musics.find((m) => m.id === lyric.musicId)
    : undefined;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (readOnly || blocked) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const payload = config.toPayload(form);
      const endpoint =
        node.type === "lyric"
          ? `/api/admin/musics/${node.id}/lyrics`
          : node.type === "newMusic" && savedMusicId.current !== null
            ? `/api/admin/musics/${savedMusicId.current}`
            : config.endpoint;
      const body =
        node.type === "lyric"
          ? { revision: editRevision, lyricTrack: payload }
          : payload;
      const response = await fetch(endpoint, {
        method:
          node.type === "newMusic" && savedMusicId.current !== null
            ? "PUT"
            : config.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok)
        throw new Error(
          await getErrorMessage(response, "저장하지 못했습니다."),
        );
      const result = await response.json();
      let refreshResults: RefreshResult[] = result.refresh ?? [];
      setRefresh(refreshResults);
      if (node.type === "newMusic") {
        savedMusicId.current = result.music.id;
        const file = form.get("albumArt");
        if (file instanceof File && file.size > 0) {
          const upload = await fetch(
            `/api/admin/musics/${result.music.id}/album-art`,
            {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file,
            },
          );
          if (!upload.ok)
            throw new Error(
              `곡 정보는 저장되었습니다. ${await getErrorMessage(upload, "앨범아트 업로드에 실패했습니다.")} 저장 버튼으로 다시 시도하면 같은 곡에 재시도합니다.`,
            );
          const uploaded = await upload.json();
          refreshResults = uploaded.refresh ?? refreshResults;
        }
      }
      setRefresh(refreshResults);
      setDirty(false);
      setEditing(false);
      const warnings = Object.keys(result.guideIssues ?? {}).length;
      setMessage(
        warnings
          ? `저장했습니다. 콜의 가사 참조 ${warnings}건을 재확인해 주세요.`
          : "저장했습니다.",
      );
      const href =
        node.type === "newMusic"
          ? `/musics/${result.music.id}`
          : node.type === "newNovel"
            ? `/musics/${node.musicId}/content?type=novel&id=${result.novel.id}`
            : node.type === "newComic"
              ? `/musics/${node.musicId}/content?type=comic&id=${result.comic.id}`
              : node.type === "newLyric"
                ? `/musics/${node.musicId}/content?type=lyric&id=${node.musicId}`
                : node.type === "newBook"
                  ? `/books?type=book&id=${result.book.id}`
                  : null;
      if (href) {
        if (refreshResults.some((r) => !r.ok)) setNextHref(href);
        else navigate(href);
      }
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "입력값을 확인해 주세요. 가사 JSON 형식도 확인해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (
      readOnly ||
      blocked ||
      !config.deleteEndpoint ||
      !window.confirm(
        `${document.title} 문서를 삭제할까요? ${config.deleteDescription}`,
      )
    )
      return;
    setBusy(true);
    try {
      const response = await fetch(config.deleteEndpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: node.type === "lyric" ? JSON.stringify({ revision }) : undefined,
      });
      if (!response.ok)
        throw new Error(
          await getErrorMessage(response, "삭제하지 못했습니다."),
        );
      const result = await response.json();
      setDirty(false);
      setEditing(false);
      if ((result.refresh ?? []).some((r: RefreshResult) => !r.ok)) {
        setRefresh(result.refresh);
        setDeleted(true);
        setMessage("삭제했습니다. 공개 갱신 결과를 확인해 주세요.");
      } else {
        onDeleted();
        router.refresh();
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "삭제하지 못했습니다.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="min-w-0 flex-1 overflow-y-auto p-4" aria-busy={busy}>
      <header className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="mr-auto font-semibold">{document.title}</h2>
        {node.type === "lyric" && (
          <Button
            variant="outline"
            disabled={dirty || blocked}
            onClick={() => {
              if (guard.confirmLeave()) router.push(`/musics/${node.id}/lyrics`);
            }}
          >
            타임라인 편집
          </Button>
        )}
        {!readOnly && !editing && !nextHref && !deleted && (
          <Button
            onClick={() => {
              setEditRevision(revision);
              setEditing(true);
            }}
            disabled={blocked}
          >
            수정
          </Button>
        )}
        {!readOnly && config.deleteEndpoint && !deleted && (
          <Button variant="destructive" disabled={blocked} onClick={remove}>
            삭제
          </Button>
        )}
      </header>
      <RefreshStatus results={refresh} onRefresh={setRefresh} />
      {nextHref && (
        <Button onClick={() => navigate(nextHref)}>
          저장한 문서로 이동
        </Button>
      )}
      {deleted && (
        <Button
          onClick={() => {
            onDeleted();
            router.refresh();
          }}
        >
          목록으로
        </Button>
      )}
      {lyric && music && (
        <AdminSrtExport music={music} lyrics={lyric.lyricJson} />
      )}
      {editing ? (
        <form
          key={`${node.type}-${"id" in node ? node.id : "new"}`}
          onSubmit={submit}
          onChange={() => setDirty(true)}
          className="space-y-4"
        >
          <fieldset disabled={blocked} className="space-y-4">
            {config.fields.map((field) => (
              <div
                key={field.name}
                hidden={!!field.showWhen && !field.showWhen(flags)}
                className="space-y-2"
              >
                <label
                  htmlFor={`${fieldIdPrefix}-${field.name}`}
                  className="block text-sm font-medium"
                >
                  {field.label}
                  {"required" in field && field.required ? " *" : ""}
                </label>
                <AdminEditorField
                  id={`${fieldIdPrefix}-${field.name}`}
                  field={field}
                  visibilityFlags={flags}
                  onVisibilityChange={(key, value) => {
                    setFlags((prev) => ({ ...prev, [key]: value }));
                    setDirty(true);
                  }}
                />
              </div>
            ))}
            {node.type === "newMusic" && <AlbumArtField disabled={blocked} />}
          </fieldset>
          <div className="flex gap-2">
            <Button type="submit" disabled={blocked}>
              {busy ? "저장 중…" : config.submitLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={blocked}
              onClick={() => {
                if (!dirty || window.confirm("변경사항을 버릴까요?")) {
                  setDirty(false);
                  setFlags(getInitialVisibilityFlags(config));
                  setEditing(false);
                  if (savedMusicId.current !== null) {
                    navigate(`/musics/${savedMusicId.current}`);
                    router.refresh();
                  }
                }
              }}
            >
              취소
            </Button>
          </div>
        </form>
      ) : (
        <dl className="space-y-3">
          {document.fields.map((field) => (
            <div key={field.key} className="border-b pb-2">
              <dt className="text-xs text-muted-foreground">{field.key}</dt>
              <dd className="break-words whitespace-pre-wrap text-sm">
                {field.value}
              </dd>
            </div>
          ))}
          {document.jsonText && (
            <pre className="overflow-x-auto rounded border p-3 text-xs">
              {document.jsonText}
            </pre>
          )}
        </dl>
      )}
      {message && (
        <p
          role="status"
          className="mt-4 whitespace-pre-wrap rounded border p-3 text-sm"
        >
          {message}
        </p>
      )}
    </section>
  );
}
