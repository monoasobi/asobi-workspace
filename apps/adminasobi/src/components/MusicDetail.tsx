"use client";
import { RefreshStatus } from "./RefreshStatus";
import type { RefreshResult } from "@/types/refresh";
import { AlbumArtForm } from "./AlbumArtForm";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@asobi/ui/components/button";
import type { AdminMusic } from "@/types/music";
import { MusicInfoForm } from "./MusicInfoForm";
import { MusicSettingsForm } from "./MusicSettingsForm";
import { useNavigationGuard } from "./NavigationGuard";
export function MusicDetail({
  initialMusic,
  readOnly,
}: {
  initialMusic: AdminMusic;
  readOnly: boolean;
}) {
  const [music, setMusic] = useState(initialMusic);
  const [refresh, setRefresh] = useState<RefreshResult[]>([]);
  function reportRefresh(results: RefreshResult[]) {
    setRefresh((current) => [
      ...current.filter(
        (item) => !results.some((result) => result.target === item.target),
      ),
      ...results,
    ]);
  }
  const router = useRouter();
  const guard = useNavigationGuard();
  const { setDirty, setBusy } = guard;
  useEffect(
    () => () => {
      setDirty("music", false);
      setDirty("settings", false);
      setDirty("art", false);
      setBusy("music", false);
      setBusy("settings", false);
      setBusy("art", false);
    },
    [setDirty, setBusy],
  );
  return (
    <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
      <RefreshStatus results={refresh} onRefresh={reportRefresh} />
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <section className="min-w-0 rounded-xl border bg-card">
          <header className="flex items-center justify-between gap-3 border-b p-5">
            <h2 className="font-semibold">곡 정보</h2>
            <Button
              variant="outline"
              size="sm"
              disabled={!music.hasLyrics || guard.busy}
              title={
                music.hasLyrics
                  ? "가사 타임라인 편집"
                  : "가사 트랙을 먼저 추가해 주세요"
              }
              onClick={() => {
                if (guard.confirmLeave())
                  router.push(`/musics/${music.id}/lyrics`);
              }}
            >
              가사 편집
            </Button>
          </header>
          <MusicInfoForm
            onRefresh={reportRefresh}
            music={music}
            readOnly={readOnly || guard.busy}
            onDirtyChange={(value) => setDirty("music", value)}
            onBusyChange={(value) => setBusy("music", value)}
            onSaved={(saved) => {
              setMusic((current) => ({
                ...current,
                ...saved,
                youtubeId: current.youtubeId,
                commonYoutubeId: saved.youtubeId,
              }));
              router.refresh();
            }}
          />
          <AlbumArtForm
            onRefresh={reportRefresh}
            musicId={music.id}
            albumArtKey={music.albumArtKey}
            readOnly={readOnly || guard.busy}
            onDirtyChange={(value) => setDirty("art", value)}
            onBusyChange={(value) => setBusy("art", value)}
            onSaved={(key) => {
              setMusic((current) => ({ ...current, albumArtKey: key }));
              router.refresh();
            }}
          />
        </section>
        <section className="min-w-0 rounded-xl border bg-card">
          <header className="flex items-center justify-between gap-3 border-b p-5">
            <h2 className="font-semibold">콜 정보</h2>
            <Button
              variant="outline"
              size="sm"
              disabled={guard.busy}
              onClick={() => {
                if (guard.confirmLeave())
                  router.push(`/musics/${music.id}/calls`);
              }}
            >
              콜 편집
            </Button>
          </header>
          <MusicSettingsForm
            onRefresh={reportRefresh}
            music={music}
            readOnly={readOnly || guard.busy}
            onDirtyChange={(value) => setDirty("settings", value)}
            onBusyChange={(value) => setBusy("settings", value)}
            onSaved={(saved) => {
              setMusic(saved);
              router.refresh();
            }}
          />
        </section>
      </div>
    </div>
  );
}
