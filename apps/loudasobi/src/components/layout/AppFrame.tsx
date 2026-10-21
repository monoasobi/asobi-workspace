"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useAtom } from "jotai";
import { sidebarOpenAtom } from "@/atoms/sidebar";
import { useTranslations } from "next-intl";
import { LoadingOverlay } from "@asobi/ui/components/loading-overlay";
import { Header } from "./Header";
import { SongList } from "./SongList";
import type { SongSort } from "./SongList/albumOrder";
import { CatalogError } from "./CatalogError";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@asobi/ui/components/sheet";
import type { SongListItem } from "@/types/catalog";
import { musicIdFromPath, musicPath } from "@/lib/musicRoute";
import { useIsCompact } from "./AppFrame/useIsCompact";
import type { SidebarLayout } from "@asobi/content-core/sidebarOrder";

export function AppFrame({
  catalog,
  sidebarLayout,
  unavailable = false,
  children,
}: {
  catalog: SongListItem[];
  sidebarLayout: SidebarLayout;
  unavailable?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const t = useTranslations();
  const compact = useIsCompact();
  const [desktopOpen, setDesktopOpen] = useAtom(sidebarOpenAtom);
  const [mobileOpen, setMobileOpen] = useState(false);
  const selectedId = musicIdFromPath(pathname);
  const [sort, setSort] = useState<SongSort>("recommended");
  const mainRef = useRef<HTMLElement>(null);

  function selectMusic(id: number) {
    const path = musicPath(id);
    if (pathname !== path) {
      const url = new URL(window.location.href);
      url.pathname = path;
      startTransition(() => {
        router.push(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
      });
    }
    if (compact) setMobileOpen(false);
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only z-50 rounded bg-background p-3 focus:not-sr-only focus:absolute"
      >
        {t("skipLyrics")}
      </a>
      <Header
        onToggleSidebar={() =>
          compact
            ? setMobileOpen((open) => !open)
            : setDesktopOpen((open) => !open)
        }
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {!compact && (
          <aside
            className="w-[360px] shrink-0 overflow-hidden bg-muted/30 transition-[width] duration-(--motion-panel) ease-[ease] data-[open=false]:w-0 motion-reduce:transition-none"
            data-open={desktopOpen}
            inert={!desktopOpen}
            aria-hidden={!desktopOpen}
            aria-label={t("selectSong")}
          >
            <div className="h-full w-[360px] border-r">
              <SongList
                catalog={catalog}
                layout={sidebarLayout}
                sort={sort}
                onSort={setSort}
                selectedId={selectedId ?? undefined}
                onSelect={selectMusic}
              />
            </div>
          </aside>
        )}
        <Sheet open={compact && mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            overlayClassName="top-14"
            className="song-sheet gap-0 overflow-hidden p-0"
            closeLabel={t("close")}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              mainRef.current?.focus();
            }}
          >
            <SheetHeader className="h-14 shrink-0 justify-center border-b px-4 py-0">
              <SheetTitle className="text-sm">{t("songs")}</SheetTitle>
              <SheetDescription className="sr-only">
                {t("selectSongHelp")}
              </SheetDescription>
            </SheetHeader>
            <SongList
              catalog={catalog}
              layout={sidebarLayout}
              sort={sort}
              onSort={setSort}
              selectedId={selectedId ?? undefined}
              onSelect={selectMusic}
            />
          </SheetContent>
        </Sheet>
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          aria-busy={isPending}
          className="relative isolate flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden outline-none"
        >
          <div inert={isPending} className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden">
            {unavailable && pathname !== "/" ? <CatalogError /> : children}
          </div>
          {isPending && <LoadingOverlay />}
        </main>
      </div>
    </div>
  );
}
