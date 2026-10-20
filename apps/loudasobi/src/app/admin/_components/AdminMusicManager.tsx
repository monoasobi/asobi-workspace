"use client";
import { Activity, useEffect, useState } from "react";
import { useAtom } from "jotai";
import { adminSidebarAtom, initialAdminSidebar } from "@/atoms/adminSidebar";
import Link from "next/link";
import {
  ChevronLeft,
  ListMusic,
  PanelLeft,
  AudioLines,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { AdminMusic } from "@/types/catalog";
import { AdminAuthForm } from "./AdminAuthForm";
import { MusicSettingsForm } from "./MusicSettingsForm";
import { CallEditorPanel } from "./AdminMusicManager/CallEditorPanel";
import { Button } from "@/components/ui/button";
import { SongList } from "@/components/layout/SongList";
import { projectSidebar, type SidebarLayout } from "@/lib/sidebarOrder";

export function AdminMusicManager({
  initialMusics,
  sidebarLayout,
  readOnly,
}: {
  initialMusics: AdminMusic[];
  sidebarLayout: SidebarLayout;
  readOnly: boolean;
}) {
  const [musics, setMusics] = useState(initialMusics);
  const [storedSidebar, setSidebar] = useAtom(adminSidebarAtom);
  const sidebar = storedSidebar ?? initialAdminSidebar;
  const { sort } = sidebar;
  const selectedId = musics.some((music) => music.id === sidebar.selectedId)
    ? sidebar.selectedId!
    : musics[0]?.id;
  const [infoDirty, setInfoDirty] = useState(false);
  const [guideDirty, setGuideDirty] = useState(false);
  const [infoSaving, setInfoSaving] = useState(false);
  const [guideSaving, setGuideSaving] = useState(false);
  const dirty = infoDirty || guideDirty;
  const saving = infoSaving || guideSaving;
  const [view, setView] = useState<"info" | "guide">("info");
  const [guideOpened, setGuideOpened] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function switchView(next: "info" | "guide") {
    if (saving) return;
    if (next === "guide") setGuideOpened(true);
    setView(next);
  }
  const selected = musics.find((music) => music.id === selectedId);
  const catalog = musics.map((music) => ({
    music: {
      id: music.id,
      title: music.title,
      korTitle: music.korTitle,
      enTitle: music.enTitle,
      albumArtKey: music.albumArtKey,
      fanLightColor: music.fanLightColor ?? undefined,
    },
    hasLyrics: music.hasLyrics,
    publish: music.publish,
  }));
  const layout = projectSidebar(
    sidebarLayout,
    musics.map((music) => music.id),
  );
  function select(id: number) {
    if (saving || id === selectedId) return;
    if (
      dirty &&
      !window.confirm("저장하지 않은 변경사항을 버리고 다른 곡을 선택할까요?")
    )
      return;
    setInfoDirty(false);
    setGuideDirty(false);
    setGuideOpened(view === "guide");
    setSidebar((current) => ({
      ...(current ?? initialAdminSidebar),
      selectedId: id,
    }));
  }
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link
              href="/"
              aria-label="공개 화면으로 돌아가기"
              title="공개 화면으로 돌아가기"
              onNavigate={(event) => {
                if (
                  saving ||
                  (dirty &&
                    !window.confirm(
                      "저장하지 않은 변경사항을 버리고 공개 화면으로 이동할까요?",
                    ))
                )
                  event.preventDefault();
              }}
            >
              <ChevronLeft className="size-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={sidebarOpen ? "곡 목록 접기" : "곡 목록 펼치기"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <PanelLeft className="size-5" />
          </Button>
          <Separator orientation="vertical" className="h-6!" />
          <div>
            <p className="text-xs text-muted-foreground">loudasobi</p>
            <h1 className="text-sm font-semibold">곡 관리</h1>
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {readOnly ? "열람 전용" : "관리자"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link
              href="/admin/sidebar"
              onNavigate={(event) => {
                if (
                  saving ||
                  (dirty &&
                    !window.confirm(
                      "저장하지 않은 변경사항을 버리고 추천 목록으로 이동할까요?",
                    ))
                )
                  event.preventDefault();
              }}
            >
              <ListMusic className="size-4" />
              추천 정렬
            </Link>
          </Button>
          <AdminAuthForm
            authenticated
            onBeforeSubmit={() =>
              !saving &&
              (!dirty ||
                window.confirm(
                  "저장하지 않은 변경사항을 버리고 로그아웃할까요?",
                ))
            }
          />
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <aside
          className={
            sidebarOpen
              ? "flex h-[30dvh] shrink-0 flex-col border-b bg-card md:h-auto md:w-[360px] md:border-r md:border-b-0"
              : "hidden"
          }
          aria-label="관리할 곡"
        >
          <SongList
            catalog={catalog}
            layout={layout}
            sort={sort}
            onSort={(sort) =>
              setSidebar((current) => ({
                ...(current ?? initialAdminSidebar),
                sort,
              }))
            }
            expandedGroups={
              sort === "release" ? undefined : sidebar.expandedGroups[sort]
            }
            onExpandedGroupsChange={(groups) => {
              if (sort !== "release")
                setSidebar((current) => ({
                  ...(current ?? initialAdminSidebar),
                  expandedGroups: {
                    ...(current ?? initialAdminSidebar).expandedGroups,
                    [sort]: groups,
                  },
                }));
            }}
            selectedId={selectedId}
            onSelect={select}
            disabled={saving}
            scrollKey="admin"
            restoreReady={storedSidebar !== null}
          />
        </aside>
        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col bg-muted/30"
          role="region"
          aria-label="곡 설정"
        >
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-2">
            <p className="min-w-0 truncate text-sm font-semibold" lang="ja">
              {selected?.title ?? "곡을 선택해 주세요"}
            </p>
            <div
              role="group"
              aria-label="곡 편집 화면"
              className="flex gap-1 rounded-lg border bg-muted/40 p-1"
            >
              <Button
                size="sm"
                variant={view === "info" ? "default" : "ghost"}
                aria-pressed={view === "info"}
                disabled={!selected || saving}
                onClick={() => switchView("info")}
              >
                <SlidersHorizontal className="size-4" />
                기본 정보{infoDirty ? " ·" : ""}
              </Button>
              <Button
                size="sm"
                variant={view === "guide" ? "default" : "ghost"}
                aria-pressed={view === "guide"}
                disabled={!selected || saving}
                onClick={() => switchView("guide")}
              >
                <AudioLines className="size-4" />콜 편집{guideDirty ? " ·" : ""}
              </Button>
            </div>
          </div>
          {selected ? (
            <div key={selected.id} className="contents">
              <Activity mode={view === "info" ? "visible" : "hidden"}>
                <MusicSettingsForm
                  key={selected.id}
                  music={selected}
                  readOnly={readOnly}
                  onDirtyChange={setInfoDirty}
                  onBusyChange={setInfoSaving}
                  onSaved={(saved) =>
                    setMusics((current) =>
                      current.map((music) =>
                        music.id === saved.id ? saved : music,
                      ),
                    )
                  }
                />
              </Activity>
              {guideOpened && (
                <Activity mode={view === "guide" ? "visible" : "hidden"}>
                  <CallEditorPanel
                    music={selected}
                    readOnly={readOnly}
                    onDirtyChange={setGuideDirty}
                    onBusyChange={setGuideSaving}
                    onSaved={(document) => {
                      setMusics((current) =>
                        current.map((music) =>
                          music.id === document.music.id
                            ? {
                                ...music,
                                syncOffset: document.syncOffset,
                                sourceSync: document.sourceSync,
                              }
                            : music,
                        ),
                      );
                    }}
                  />
                </Activity>
              )}
            </div>
          ) : (
            <p className="p-8 text-sm text-muted-foreground">
              MONOASOBI에 곡을 추가하면 이곳에 자동으로 표시됩니다.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
