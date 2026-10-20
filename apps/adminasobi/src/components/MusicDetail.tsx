"use client";
import { MusicLifecycle } from "./content/MusicLifecycle";
import { MusicContentAccordion } from "./content/MusicContentAccordion";
import type { AdminDashboardData, SelectedNode } from "./content/data";
import { getSelectedNodeKey } from "./content/utils";
import { RefreshStatus } from "./RefreshStatus";
import type { RefreshResult } from "@/types/refresh";
import { AlbumArtForm } from "./AlbumArtForm";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@asobi/ui/components/button";
import { Badge } from "@asobi/ui/components/badge";
import type { AdminMusic } from "@/types/music";
import { MusicInfoForm } from "./MusicInfoForm";
import { MusicSettingsForm } from "./MusicSettingsForm";
import { useNavigationGuard } from "./NavigationGuard";
export function MusicDetail({
  initialMusic, readOnly, contentData, contentNode, contentRevision, contentActive,
}: {
  initialMusic: AdminMusic;
  readOnly: boolean;
  contentData: AdminDashboardData;
  contentNode: SelectedNode | null;
  contentRevision?: string;
  contentActive: boolean;
}) {
  const [music, setMusic] = useState(initialMusic);
  const source = `${contentActive}:${contentNode ? getSelectedNodeKey(contentNode) : ""}`;
  const [view, setView] = useState<{ source: string; content: boolean } | null>(null);
  const showContent = view?.source === source ? view.content : contentActive;
  const [refresh, setRefresh] = useState<RefreshResult[]>([]);
  function reportRefresh(results: RefreshResult[]) {
    setRefresh(current => [...current.filter(item => !results.some(result => result.target === item.target)), ...results]);
  }
  const router = useRouter();
  const guard = useNavigationGuard();
  const { setDirty, setBusy } = guard;
  useEffect(() => () => {
    for (const section of ["music", "settings", "art"]) {
      setDirty(section, false);
      setBusy(section, false);
    }
  }, [setDirty, setBusy]);
  return (
    <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="grid min-w-0 gap-1">
          <h1 lang="ja" className="type-page-title break-words">{music.title}</h1>
          <p className="type-description">{music.korTitle} · {music.enTitle}</p>
        </div>
        <Badge variant={music.publish ? "secondary" : "outline"}>
          {music.publish ? "콜 공개 중" : "콜 비공개"}
        </Badge>
      </header>
      <RefreshStatus results={refresh} onRefresh={reportRefresh} />
      <section className="mb-5 min-w-0 rounded-xl border bg-card" aria-label="공통 앨범아트">
        <header className="border-b px-5 py-4"><h2 className="type-card-title">앨범아트</h2></header>
        <AlbumArtForm
          onRefresh={reportRefresh}
          musicId={music.id}
          albumArtKey={music.albumArtKey}
          readOnly={readOnly || guard.busy}
          onDirtyChange={value => setDirty("art", value)}
          onBusyChange={value => setBusy("art", value)}
          onSaved={key => {
            setMusic(current => ({ ...current, albumArtKey: key }));
            router.refresh();
          }}
        />
      </section>
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <section className="min-w-0 rounded-xl border bg-card">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
            <div className="flex flex-wrap gap-1" role="group" aria-label="곡 관리 영역">
              <Button variant={showContent ? "ghost" : "secondary"} size="sm" aria-pressed={!showContent} disabled={guard.busy} onClick={() => setView({ source, content: false })}>곡 정보</Button>
              <Button variant={showContent ? "secondary" : "ghost"} size="sm" aria-pressed={showContent} disabled={guard.busy} onClick={() => setView({ source, content: true })}>원작·가사 문서</Button>
            </div>
            <Button variant="outline" size="sm" disabled={!initialMusic.hasLyrics || guard.busy} title="가사 타임라인 편집" onClick={() => {
              if (guard.confirmLeave()) router.push(`/musics/${music.id}/lyrics`);
            }}>가사 편집</Button>
          </header>
          <div hidden={showContent}>
            <MusicInfoForm
              onRefresh={reportRefresh}
              music={music}
              readOnly={readOnly || guard.busy}
              onDirtyChange={value => setDirty("music", value)}
              onBusyChange={value => setBusy("music", value)}
              onSaved={saved => {
                setMusic(current => ({ ...current, ...saved, youtubeId: current.youtubeId, commonYoutubeId: saved.youtubeId }));
                router.refresh();
              }}
            />
            {!readOnly && <div className="border-t p-5"><MusicLifecycle id={music.id} /></div>}
          </div>
          <div hidden={!showContent}>
            <MusicContentAccordion
              key={contentNode ? getSelectedNodeKey(contentNode) : "unselected"}
              data={contentData}
              musicId={music.id}
              readOnly={readOnly}
              initialNode={contentNode}
              revision={contentRevision}
            />
          </div>
        </section>
        <section className="min-w-0 rounded-xl border bg-card">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
            <h2 className="type-section-title">콜 정보</h2>
            <Button variant="outline" size="sm" disabled={guard.busy} onClick={() => {
              if (guard.confirmLeave()) router.push(`/musics/${music.id}/calls`);
            }}>콜 편집</Button>
          </header>
          <MusicSettingsForm
            onRefresh={reportRefresh}
            music={{ ...music, sourceSync: initialMusic.sourceSync, hasLyrics: initialMusic.hasLyrics }}
            readOnly={readOnly || guard.busy}
            onDirtyChange={value => setDirty("settings", value)}
            onBusyChange={value => setBusy("settings", value)}
            onSaved={saved => { setMusic(saved); router.refresh(); }}
          />
        </section>
      </div>
    </div>
  );
}
