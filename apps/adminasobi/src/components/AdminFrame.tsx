"use client";
import { useAtom } from "jotai";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { PanelLeft, SunMoon } from "lucide-react";
import { Button } from "@asobi/ui/components/button";
import { Badge } from "@asobi/ui/components/badge";
import { SongList } from "@asobi/ui/components/song-list";
import {
  projectSidebar,
  type SidebarLayout,
} from "@asobi/content-core/sidebarOrder";
import { adminSidebarAtom, initialAdminSidebar } from "@/atoms/adminSidebar";
import type { AdminMusic } from "@/types/music";
import { AdminAuthForm } from "./AdminAuthForm";
import { AlbumArtwork } from "./AlbumArtwork";
import { NavigationGuard, useNavigationGuard } from "./NavigationGuard";
export function AdminFrame(props: {
  musics: AdminMusic[];
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
  musics: AdminMusic[];
  layout: SidebarLayout;
  readOnly: boolean;
  children: React.ReactNode;
}) {
  const path = usePathname(),
    router = useRouter(),
    guard = useNavigationGuard();
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
        <div className="flex items-center gap-2">
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
          <SongList
            catalog={musics.map((music) => ({
              music: {
                ...music,
                fanLightColor: music.fanLightColor ?? undefined,
              },
              hasLyrics: music.hasLyrics,
              publish: music.publish,
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
                albumArtKey={music.albumArtKey}
                className={className}
              />
            )}
          />
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted/30">
          {children}
        </div>
      </div>
    </main>
  );
}
