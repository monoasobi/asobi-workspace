"use client";
import { MusicLifecycle } from "./content/MusicLifecycle";
import { MusicContentTabs } from "./content/MusicContentTabs";
import type { AdminDashboardData, SelectedNode } from "./content/data";
import { RefreshStatus } from "./RefreshStatus";
import type { RefreshResult } from "@/types/refresh";
import { AlbumArtForm } from "./AlbumArtForm";
import { useEffect, useState } from "react";
import { MusicContentSkeleton, MusicSettingsSkeleton, MusicOverviewSkeleton } from "./loading/AdminSkeletons";
import { PendingSection } from "./loading/PendingSection";
import { PanelsTopLeft } from "lucide-react";
import { useLoadingRouter } from "@/components/NavigationGuard";
import { Button } from "@asobi/ui/components/button";
import type { AdminMusic } from "@/types/music";
import { MusicInfoForm, MusicInfoFields } from "./MusicInfoForm";
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
  const [refresh, setRefresh] = useState<RefreshResult[]>([]);
  function reportRefresh(results: RefreshResult[]) {
    setRefresh(current => [...current.filter(item => !results.some(result => result.target === item.target)), ...results]);
  }
  const router = useLoadingRouter();
  const guard = useNavigationGuard();
  const { setDirty, setBusy } = guard;
  useEffect(() => () => {
    for (const section of ["music", "settings", "art"]) {
      setDirty(section, false);
      setBusy(section, false);
    }
  }, [setDirty, setBusy]);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden p-4 sm:p-6">
      <RefreshStatus results={refresh} onRefresh={reportRefresh} />
      <section className="max-h-[45dvh] min-w-0 shrink-0 overflow-y-auto rounded-xl border bg-card xl:max-h-none" aria-label="곡 개요">
        <PendingSection fallback={<MusicOverviewSkeleton />}>
        <MusicInfoForm
          music={music}
          readOnly={readOnly || guard.busy}
          actions={!readOnly && <MusicLifecycle id={music.id} />}
          onRefresh={reportRefresh}
          onDirtyChange={value => setDirty("music", value)}
          onBusyChange={value => setBusy("music", value)}
          onSaved={saved => {
            setMusic(current => ({ ...current, ...saved, youtubeId: current.youtubeId, commonYoutubeId: saved.youtubeId }));
            router.refresh();
          }}
        />
        <AlbumArtForm
          details={<MusicInfoFields music={music} section="titles" readOnly={readOnly || guard.busy} onDirtyChange={value => setDirty("music", value)} />}
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
        </PendingSection>
      </section>
      <div className="grid min-h-0 flex-1 grid-rows-2 gap-5 xl:grid-cols-2 xl:grid-rows-1">
        <section className="flex max-h-full min-h-0 min-w-0 self-start flex-col overflow-hidden rounded-xl border bg-card">
          <PendingSection fallback={<MusicContentSkeleton />}>
          <MusicContentTabs
            data={contentData} musicId={music.id} readOnly={readOnly}
            initialNode={contentNode} revision={contentRevision} contentActive={contentActive}
            media={<MusicInfoFields music={music} section="media" readOnly={readOnly || guard.busy} onDirtyChange={value => setDirty("music", value)} />}
            editAction={<Button type="button" variant="outline" size="sm" disabled={!initialMusic.hasLyrics || guard.busy} title="가사 타임라인 편집" onClick={() => {
              if (guard.confirmLeave()) router.push(`/musics/${music.id}/lyrics`);
            }}><PanelsTopLeft aria-hidden="true" className="size-4" />가사 편집</Button>}
          />
          </PendingSection>
        </section>
        <section className="max-h-full min-h-0 min-w-0 self-start overflow-y-auto rounded-xl border bg-card">
          <PendingSection fallback={<MusicSettingsSkeleton />}>
          <MusicSettingsForm
            editAction={<Button type="button" variant="outline" size="sm" disabled={guard.busy} onClick={() => {
              if (guard.confirmLeave()) router.push(`/musics/${music.id}/calls`);
            }}><PanelsTopLeft aria-hidden="true" className="size-4" />콜 편집</Button>}
            onRefresh={reportRefresh}
            music={{ ...music, sourceSync: initialMusic.sourceSync, hasLyrics: initialMusic.hasLyrics }}
            readOnly={readOnly || guard.busy}
            onDirtyChange={value => setDirty("settings", value)}
            onBusyChange={value => setBusy("settings", value)}
            onSaved={saved => { setMusic(saved); router.refresh(); }}
          />
          </PendingSection>
        </section>
      </div>
    </div>
  );
}
