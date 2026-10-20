"use client";

import { AlbumArtwork } from "@/components/common/AlbumArtwork";
import { useLocale, useTranslations } from "next-intl";
import { useLayoutEffect, useRef, useState } from "react";
import type { SongListItem } from "@/types/catalog";
import { Badge } from "@/components/ui/badge";
import { FanLightBadge } from "@/components/common/FanLightBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SidebarLayout } from "@asobi/content-core/sidebarOrder";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getAlbumLayout, type SongSort } from "./SongList/albumOrder";
import {
  readSidebarScroll,
  writeSidebarScroll,
} from "./SongList/sidebarScroll";

export function SongList({
  catalog,
  layout,
  sort,
  onSort,
  selectedId,
  onSelect,
  disabled = false,
  scrollKey = "public",
  expandedGroups,
  onExpandedGroupsChange,
  restoreReady = true,
}: {
  catalog: SongListItem[];
  layout: SidebarLayout;
  sort: SongSort;
  onSort: (sort: SongSort) => void;
  selectedId?: number;
  onSelect: (id: number) => void;
  disabled?: boolean;
  scrollKey?: string;
  expandedGroups?: string[];
  onExpandedGroupsChange?: (groups: string[]) => void;
  restoreReady?: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const scrollRef = useRef<HTMLDivElement>(null);
  const restoredFor = useRef<string | null>(null);
  const [localGroups, setLocalGroups] = useState<string[]>([]);
  const entries = new Map(catalog.map((entry) => [entry.music.id, entry]));
  const groupedLayout = sort === "album" ? getAlbumLayout(catalog) : layout;
  const selectedGroupId = groupedLayout.groups.find((group) =>
    group.musicIds.includes(selectedId ?? -1),
  )?.id;
  const songsFor = (ids: number[]) =>
    ids.flatMap((id) => {
      const entry = entries.get(id);
      return entry ? [entry] : [];
    });
  useLayoutEffect(() => {
    const viewport = scrollRef.current;
    if (!viewport || !restoreReady || restoredFor.current === scrollKey) return;
    if (
      scrollKey === "admin" &&
      sort !== "release" &&
      selectedGroupId &&
      expandedGroups &&
      !expandedGroups.includes(selectedGroupId) &&
      onExpandedGroupsChange
    ) {
      onExpandedGroupsChange([...expandedGroups, selectedGroupId]);
      return;
    }
    restoredFor.current = scrollKey;
    const top = readSidebarScroll(scrollKey);
    let cancelled = false;
    const restore = () => {
      if (cancelled) return;
      viewport.scrollTop = top;
      if (scrollKey !== "admin") return;
      const selected = viewport.querySelector<HTMLElement>(
        'button[aria-current="true"]',
      );
      if (!selected) return;
      const row = selected.getBoundingClientRect();
      const view = viewport.getBoundingClientRect();
      if (row.top < view.top) viewport.scrollTop += row.top - view.top;
      else if (row.bottom > view.bottom)
        viewport.scrollTop += row.bottom - view.bottom;
    };
    restore();
    const frame = requestAnimationFrame(() => {
      restore();
      // Accordion opening can change the scroll height after the first layout.
      void Promise.allSettled(
        viewport
          .getAnimations({ subtree: true })
          .map((animation) => animation.finished),
      ).then(restore);
    });
    const cancel = () => {
      cancelled = true;
    };
    viewport.addEventListener("wheel", cancel, { passive: true });
    viewport.addEventListener("pointerdown", cancel);
    viewport.addEventListener("keydown", cancel);
    return () => {
      cancel();
      cancelAnimationFrame(frame);
      viewport.removeEventListener("wheel", cancel);
      viewport.removeEventListener("pointerdown", cancel);
      viewport.removeEventListener("keydown", cancel);
    };
  }, [
    scrollKey,
    restoreReady,
    selectedId,
    sort,
    expandedGroups,
    selectedGroupId,
    onExpandedGroupsChange,
  ]);

  function renderSong(entry: SongListItem) {
    const { music } = entry;
    const selected = selectedId === music.id;
    const isPending = !entry.hasLyrics;
    return (
      <button
        key={music.id}
        type="button"
        disabled={disabled}
        aria-current={selected ? "true" : undefined}
        title={`${music.title} — ${music.korTitle} / ${music.enTitle}`}
        onClick={() => onSelect(music.id)}
        className={cn(
          "grid w-full cursor-pointer grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-2.5 border-l-2 border-transparent px-4 py-2 text-left transition-colors duration-(--motion-fast) hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring max-[359px]:grid-cols-[minmax(0,1fr)_auto]",
          selected && "border-l-primary bg-accent text-accent-foreground",
          isPending && "text-muted-foreground",
        )}
      >
        <AlbumArtwork
          key={music.albumArtKey ?? music.id}
          albumArtKey={music.albumArtKey}
          className={cn(
            "size-[72px] rounded-sm border object-cover max-[359px]:hidden",
            isPending && "opacity-40 grayscale",
          )}
        />
        <span
          className={cn(
            "flex min-w-0 flex-col gap-1",
            isPending && "opacity-50",
          )}
        >
          <span lang="ja" className="truncate text-sm font-semibold">
            {music.title}
          </span>
          {locale !== "ja" && (
            <span
              lang={locale}
              className="truncate text-xs text-muted-foreground"
            >
              {locale === "ko" ? music.korTitle : music.enTitle}
            </span>
          )}
          {isPending && <Badge variant="outline">{t("pending")}</Badge>}
          {entry.publish !== undefined && (
            <Badge variant={entry.publish ? "secondary" : "outline"}>
              {entry.publish ? "공개" : "비공개"}
            </Badge>
          )}
        </span>
        {music.fanLightColor && (
          <span className="max-w-24 justify-self-end">
            <FanLightBadge color={music.fanLightColor} compact />
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 justify-end border-b p-3">
        <div
          role="group"
          aria-label={t("songSort")}
          className="inline-flex flex-wrap justify-end gap-1 rounded-lg border bg-muted/40 p-1"
        >
          {(["recommended", "album", "release"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="xs"
              variant={sort === value ? "default" : "ghost"}
              aria-pressed={sort === value}
              onClick={() => {
                if (sort === value) return;
                onSort(value);
                setLocalGroups([]);
                writeSidebarScroll(scrollKey, 0);
                if (scrollRef.current) scrollRef.current.scrollTop = 0;
              }}
            >
              {t(`${value}Sort`)}
            </Button>
          ))}
        </div>
      </div>
      <ScrollArea
        className="min-h-0 flex-1"
        viewportRef={scrollRef}
        viewportProps={{
          "aria-label": t("songs"),
          onScroll: (event) => {
            if (restoreReady)
              writeSidebarScroll(scrollKey, event.currentTarget.scrollTop);
          },
        }}
      >
        <nav aria-label={t("selectSong")} className="py-1">
          {sort === "release" ? (
            catalog.map(renderSong)
          ) : (
            <>
              <Accordion
                key={sort}
                type="multiple"
                value={expandedGroups ?? localGroups}
                onValueChange={onExpandedGroupsChange ?? setLocalGroups}
              >
                {groupedLayout.groups.map((group) => {
                  const songs = songsFor(group.musicIds);
                  if (!songs.length) return null;
                  return (
                    <AccordionItem key={group.id} value={group.id}>
                      <AccordionTrigger className="items-center rounded-none bg-muted/50 px-4 py-3 text-base font-semibold hover:no-underline">
                        <span className="min-w-0 break-words">
                          {group.name[locale] || group.name.ko}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0">
                        {songs.map(renderSong)}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
              {songsFor(groupedLayout.ungrouped).map(renderSong)}
            </>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}
