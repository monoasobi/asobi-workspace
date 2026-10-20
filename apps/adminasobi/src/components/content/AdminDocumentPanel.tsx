"use client";
import { useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Save, Trash2, X, ExternalLink } from "lucide-react";
import { Badge } from "@asobi/ui/components/badge";
import { Label } from "@asobi/ui/components/label";
import { Table, TableBody, TableRow, TableHead, TableCell } from "@asobi/ui/components/table";
import { Popover, PopoverTrigger, PopoverContent } from "@asobi/ui/components/popover";
import { documentLabels } from "./documentLabels";
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
  embedded = false,
  reserveActionSpace = false,
  data,
  node,
  readOnly,
  revision,
  onDeleted,
  onNavigate,
}: {
  embedded?: boolean;
  reserveActionSpace?: boolean;
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
  const formId = `${fieldIdPrefix}-form`;
  function cancel() {
    if (dirty && !window.confirm("변경사항을 버릴까요?")) return;
    setDirty(false);
    setFlags(getInitialVisibilityFlags(config));
    setEditing(false);
    if (savedMusicId.current !== null) {
      navigate(`/musics/${savedMusicId.current}`);
      router.refresh();
    }
  }
  return (
    <section className={embedded ? "min-w-0 p-5 pt-0" : "min-h-0 min-w-0 flex-1 overflow-y-auto p-5"} aria-busy={busy}>
      <header className={`mb-4 flex flex-wrap items-start justify-between gap-3 ${reserveActionSpace ? "pr-10" : ""}`}>
        <h2 className="min-w-0 flex-1 break-words type-card-title">{document.title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {node.type === "lyric" && (
            <Button type="button" size="sm" variant="outline" disabled={dirty || blocked} onClick={() => {
              if (guard.confirmLeave()) router.push(`/musics/${node.id}/lyrics`);
            }}>타임라인 편집</Button>
          )}
          {!readOnly && !nextHref && !deleted && (editing ? <>
            <Button type="button" size="sm" variant="outline" disabled={blocked} onClick={cancel}><X />취소</Button>
            <Button type="submit" form={formId} size="sm" disabled={blocked}><Save />{busy ? "저장 중…" : config.submitLabel}</Button>
          </> : <Button type="button" size="sm" variant="outline" disabled={blocked} onClick={() => {
            setEditRevision(revision); setEditing(true);
          }}><Pencil />{config.method === "POST" ? "작성" : "수정"}</Button>)}
          {!readOnly && config.deleteEndpoint && !deleted && (
            <Button type="button" size="sm" variant="destructive" disabled={blocked} onClick={remove}><Trash2 />삭제</Button>
          )}
        </div>
      </header>
      <RefreshStatus results={refresh} onRefresh={setRefresh} />
      {nextHref && <Button size="sm" onClick={() => navigate(nextHref)}>저장한 문서로 이동</Button>}
      {deleted && <Button size="sm" onClick={() => { onDeleted(); router.refresh(); }}>목록으로</Button>}
      {lyric && music && (
        <Popover>
          <PopoverTrigger asChild><Button type="button" variant="outline" size="sm" className="mb-4">SRT 다운로드</Button></PopoverTrigger>
          <PopoverContent align="start" className="w-80"><AdminSrtExport music={music} lyrics={lyric.lyricJson} /></PopoverContent>
        </Popover>
      )}
      {editing ? (
        <form id={formId} key={`${node.type}-${"id" in node ? node.id : "new"}`}
          onSubmit={submit} onChange={event => { if (event.target instanceof HTMLElement && event.target.getAttribute("name")) setDirty(true); }}>
          <fieldset disabled={blocked} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {config.fields.map(field => {
              const hidden = !!field.showWhen && !field.showWhen(flags);
              const wide = field.type === "textarea" || field.type === "url" || field.type === "readonly" || field.name === "novelIds";
              return (
                <div key={field.name} hidden={hidden}
                  className={hidden ? "hidden" : field.type === "checkbox" ? "flex min-h-9 items-center gap-3 rounded-lg border px-3 py-2" : `grid min-w-0 content-start gap-2 ${wide ? "sm:col-span-2" : ""}`}>
                  <Label htmlFor={`${fieldIdPrefix}-${field.name}`} className={field.type === "checkbox" ? "order-2" : ""}>
                    {documentLabels[field.name] ?? field.label}{"required" in field && field.required ? " *" : ""}
                  </Label>
                  <AdminEditorField id={`${fieldIdPrefix}-${field.name}`} field={field} disabled={blocked} onEdit={() => setDirty(true)} visibilityFlags={flags}
                    onVisibilityChange={(key, value) => { setFlags(prev => ({ ...prev, [key]: value })); setDirty(true); }} />
                </div>
              );
            })}
            {node.type === "newMusic" && <div className="sm:col-span-2"><AlbumArtField disabled={blocked} /></div>}
          </fieldset>
        </form>
      ) : (
        <div className="grid min-w-0 gap-4">
          {document.fields.length > 0 && <div className="overflow-hidden rounded-lg border">
            <Table className="table-fixed">
              <TableBody>
                {document.fields.map(field => (
                  <TableRow key={field.key}>
                    <TableHead scope="row" className="h-auto w-28 whitespace-normal bg-muted/30 px-3 py-2.5 align-top text-xs text-muted-foreground">{field.label}</TableHead>
                    <TableCell className="break-words whitespace-pre-wrap px-3 py-2.5 align-top">
                      {field.kind === "status" ? <Badge variant={field.value === "true" ? "secondary" : "outline"}>
                        {field.key === "translated" ? field.value === "true" ? "번역됨" : "미번역" : field.value === "true" ? "발매됨" : "미발매"}
                      </Badge> : field.kind === "link" ? <a href={field.value} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 text-primary underline-offset-4 hover:underline" title={field.value}>
                        <span className="break-all">{new URL(field.value).hostname}</span><ExternalLink className="size-3.5 shrink-0" aria-hidden />
                      </a> : field.value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>}
          {document.jsonText && <details className="min-w-0 rounded-lg border">
            <summary className="cursor-pointer px-3 py-2.5 text-sm font-medium">가사 JSON 보기</summary>
            <pre className="overflow-x-auto border-t p-3 text-xs">{document.jsonText}</pre>
          </details>}
        </div>
      )}
      {message && <p role="status" className="mt-4 whitespace-pre-wrap rounded-lg border p-3 text-sm">{message}</p>}
    </section>
  );
}
