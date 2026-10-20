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
      <RefreshStatus results={refresh} onRefresh={reportRefresh} />
      <section className="relative mb-5 min-w-0 rounded-xl border bg-card" aria-label="곡 개요">
        <Badge className="absolute right-5 top-5" variant={music.publish ? "secondary" : "outline"}>
          {music.publish ? "콜 공개 중" : "콜 비공개"}
        </Badge>
        <AlbumArtForm
          details={<div className="grid gap-1">
            <h1 lang="ja" className="type-page-title break-words">{music.title}</h1>
            <p className="type-description">{music.korTitle}</p>
            <p className="type-description">{music.enTitle}</p>
          </div>}
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
          <MusicInfoForm
              heading={<div className="flex flex-wrap gap-1" role="group" aria-label="곡 관리 영역">
                <Button type="button" variant={showContent ? "ghost" : "secondary"} size="sm" aria-pressed={!showContent} disabled={guard.busy} onClick={() => setView({ source, content: false })}>곡 정보</Button>
                <Button type="button" variant={showContent ? "secondary" : "ghost"} size="sm" aria-pressed={showContent} disabled={guard.busy} onClick={() => setView({ source, content: true })}>원작·가사 문서</Button>
              </div>}
              editAction={<Button type="button" variant="outline" size="sm" disabled={!initialMusic.hasLyrics || guard.busy} title="가사 타임라인 편집" onClick={() => {
                if (guard.confirmLeave()) router.push(`/musics/${music.id}/lyrics`);
              }}>가사 편집</Button>}
              showFields={!showContent}
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
            {!readOnly && <div hidden={showContent} className="border-t p-5"><MusicLifecycle id={music.id} /></div>}
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
          <MusicSettingsForm
            editAction={<Button type="button" variant="outline" size="sm" disabled={guard.busy} onClick={() => {
              if (guard.confirmLeave()) router.push(`/musics/${music.id}/calls`);
            }}>콜 편집</Button>}
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
