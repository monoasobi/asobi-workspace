"use client";
import { useAtom } from "jotai";
import { usePathname } from "next/navigation";
import { useLoadingRouter } from "@/components/NavigationGuard";
import { useTheme } from "next-themes";
import { PanelLeft, SunMoon } from "lucide-react";
import { Button } from "@asobi/ui/components/button";
import { LoadingOverlay } from "@asobi/ui/components/loading-overlay";
import { SidebarSkeleton } from "./loading/AdminSkeletons";
import { PendingSection } from "./loading/PendingSection";
import { Badge } from "@asobi/ui/components/badge";
import { SongList } from "@asobi/ui/components/song-list";
import {
  projectSidebar,
  type SidebarLayout,
} from "@asobi/content-core/sidebarOrder";
import { adminSidebarAtom, initialAdminSidebar } from "@/atoms/adminSidebar";
import type { getAdminMusicList } from "@/server/queries/music";
import { AdminAuthForm } from "./AdminAuthForm";
import { AlbumArtwork } from "./AlbumArtwork";
import { NavigationGuard, useNavigationGuard } from "./NavigationGuard";
type AdminMusicList = Awaited<ReturnType<typeof getAdminMusicList>>;
export function AdminFrame(props: {
  musics: AdminMusicList;
  layout: SidebarLayout;
  readOnly: boolean;
  children: React.ReactNode;
}) {
  return (
    <NavigationGuard>
      <Frame {...props} />
    </NavigationGuard>
  );
}
function Frame({
  musics,
  layout,
  readOnly,
  children,
}: {
  musics: AdminMusicList;
  layout: SidebarLayout;
  readOnly: boolean;
  children: React.ReactNode;
}) {
  const path = usePathname(),
    router = useLoadingRouter(),
    guard = useNavigationGuard();
  const editorLoading = guard.pending && (/\/(lyrics|calls)(?:[?#]|$)/.test(path) || /\/(lyrics|calls)(?:[?#]|$)/.test(guard.destination ?? ""));
  const { resolvedTheme, setTheme } = useTheme();
  const [stored, setSidebar] = useAtom(adminSidebarAtom);
  const sidebar = stored ?? initialAdminSidebar;
  const raw = path.match(/^\/musics\/(\d+)(?:\/|$)/)?.[1];
  const selectedId = raw === undefined ? undefined : Number(raw);
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={sidebar.collapsed ? "곡 목록 펼치기" : "곡 목록 접기"}
            aria-expanded={!sidebar.collapsed}
            onClick={() =>
              setSidebar((current) => ({
                ...(current ?? initialAdminSidebar),
                collapsed: !sidebar.collapsed,
              }))
            }
          >
            <PanelLeft className="size-5" />
          </Button>
          <h1 className="text-sm font-semibold">ASOBI 관리자</h1>
          <Badge variant="secondary">{readOnly ? "열람 전용" : "관리자"}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            ...(!readOnly ? [{ href: "/musics/new", label: "곡 추가" }] : []),
            { href: "/books", label: "서적" },
            { href: "/guide", label: "소설 마크다운 작성 가이드" },
            { href: "/sidebar", label: "추천 정렬" },
            { href: "/musics/deleted", label: "숨긴 곡" },
          ].map((item) => (
            <Button
              key={item.href}
              size="sm"
              variant="ghost"
              disabled={guard.busy}
              onClick={() => {
                if (guard.confirmLeave()) router.push(item.href);
              }}
            >
              {item.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            aria-label="테마 전환"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <SunMoon className="size-4" />
          </Button>
          <AdminAuthForm authenticated onBeforeSubmit={guard.confirmLeave} />
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <aside
          aria-label="관리할 곡"
          className={
            sidebar.collapsed
              ? "hidden"
              : "flex h-[30dvh] shrink-0 flex-col border-b bg-card md:h-auto md:w-[300px] md:border-r md:border-b-0"
          }
        >
          <PendingSection loading={stored === null || guard.refreshing} fallback={<SidebarSkeleton />}><SongList
            showBadges={false}
            catalog={musics.map((music) => ({
              music,
              hasLyrics: music.hasLyrics,
            }))}
            layout={projectSidebar(
              layout,
              musics.map((music) => music.id),
            )}
            locale="ko"
            labels={{
              pending: "가사 준비 중",
              songSort: "곡 정렬",
              recommendedSort: "추천",
              albumSort: "앨범",
              releaseSort: "발매순",
              songs: "곡 목록",
              selectSong: "곡 선택",
              published: "콜 공개",
              unpublished: "콜 비공개",
            }}
            sort={sidebar.sort}
            onSort={(sort) =>
              setSidebar((current) => ({
                ...(current ?? initialAdminSidebar),
                sort,
              }))
            }
            selectedId={selectedId}
            onSelect={(id) => {
              if (id !== selectedId && guard.confirmLeave())
                router.push(
                  `/musics/${id}${path.endsWith("/calls") ? "/calls" : path.endsWith("/lyrics") && musics.find((music) => music.id === id)?.hasLyrics ? "/lyrics" : ""}`,
                );
            }}
            disabled={guard.busy}
            scrollKey="admin"
            restoreReady={stored !== null}
            expandedGroups={
              sidebar.sort === "release"
                ? undefined
                : sidebar.expandedGroups[sidebar.sort]
            }
            onExpandedGroupsChange={(groups) => {
              if (sidebar.sort !== "release")
                setSidebar((current) => ({
                  ...(current ?? initialAdminSidebar),
                  expandedGroups: {
                    ...(current ?? initialAdminSidebar).expandedGroups,
                    [sidebar.sort]: groups,
                  },
                }));
            }}
            renderArtwork={(music, className) => (
              <AlbumArtwork
                key={music.albumArtKey ?? music.id}
                requestWidth={200}
                albumArtKey={music.albumArtKey}
                className={className}
              />
            )}
          /></PendingSection>
        </aside>
        <div className="relative isolate flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted/30">
          <div inert={editorLoading} className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
          {editorLoading && <LoadingOverlay />}
        </div>
      </div>
    </main>
  );
}
