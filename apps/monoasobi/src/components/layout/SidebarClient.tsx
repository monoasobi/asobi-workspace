"use client";
import { ScrollArea } from "@asobi/ui/components/scroll-area";
import { Badge } from "@asobi/ui/components/badge";
import {
  adminNavigationAtom,
  confirmAdminNavigation,
} from "@/atoms/adminNavigation.atom";
import { useHydrated } from "@/hooks/useHydrated";
import type { Music } from "@appTypes/music";
import type { Novel } from "@appTypes/novel";
import { privateReaderAtom } from "@atoms/privateReader.atom";
import { sidebarAtom, sidebarScrollTopAtom } from "@atoms/sidebar.atom";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { AlbumArtwork } from "@/components/common/AlbumArtwork";
import { getAlbumArtSrc } from "@/lib/albumArt";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "./Sidebar.styles";
type ItemTone = "active" | "available" | "untranslated";
export interface SidebarItem {
  music: Music;
  novel?: Novel;
}
interface SidebarClientProps {
  items: SidebarItem[];
}
interface ItemProps {
  item: SidebarItem;
  isActive: boolean;
  isAdmin: boolean;
}
export const SidebarClient = ({ items }: SidebarClientProps) => {
  const [isSidebar, setIsSidebar] = useAtom(sidebarAtom);
  const isHydrated = useHydrated();
  const isSidebarOpen = isHydrated ? isSidebar : false;
  const [sidebarScrollTop, setSidebarScrollTop] = useAtom(sidebarScrollTopAtom);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const requestedMusicId = Number(
    searchParams.get("musicId") ??
      (pathname.startsWith("/admin/lyrics/")
        ? pathname.split("/")[3]
        : items[0]?.music.id),
  );
  const selectedMusicId =
    items.find((item) => item.music.id === requestedMusicId)?.music.id ??
    items[0]?.music.id;
  const params = useParams<{
    id?: string;
  }>();
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isSidebarOpen) return;
      const width = window.innerWidth;
      if (
        scrollRef.current &&
        !scrollRef.current.contains(event.target as Node) &&
        width < 1024
      ) {
        setIsSidebar(false);
      }
    };
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    scrollEl.scrollTo({ top: sidebarScrollTop });
    const handleScroll = () => {
      setSidebarScrollTop(scrollEl.scrollTop);
    };
    scrollEl.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    document.addEventListener("click", handleClickOutside);
    return () => {
      scrollEl.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [
    isSidebar,
    setIsSidebar,
    setSidebarScrollTop,
    sidebarScrollTop,
    isSidebarOpen,
  ]);
  return (
    <>
      <button
        type="button"
        className={styles.overlay}
        data-open={isSidebarOpen}
        aria-hidden={!isSidebarOpen}
        tabIndex={isSidebarOpen ? 0 : -1}
        aria-label="곡 목록 닫기"
        onClick={() => setIsSidebar(false)}
      />
      <aside className={styles.container} data-open={isSidebarOpen}>
        <ScrollArea
          viewportRef={scrollRef}
          type="auto"
          className={styles.scrollArea}
        >
          <div className="flex flex-col gap-1">
            {items
              .filter((item) => isAdmin || item.novel)
              .map((item) => (
                <Item
                  item={item}
                  key={item.music.id}
                  isAdmin={isAdmin}
                  isActive={
                    isAdmin
                      ? item.music.id === selectedMusicId
                      : item.music.specialPath
                        ? pathname.includes(item.music.specialPath)
                        : params.id === String(item.novel?.id)
                  }
                />
              ))}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};
const getTone = ({
  isActive,
  specialPath,
  translated,
  isPublished,
}: {
  isActive: boolean;
  specialPath?: string;
  translated?: boolean;
  isPublished?: boolean;
}): ItemTone => {
  if (isActive) return "active";
  if (specialPath || translated || isPublished) return "available";
  return "untranslated";
};
const Item = ({ item, isActive, isAdmin }: ItemProps) => {
  const { music, novel } = item;
  const guard = useAtomValue(adminNavigationAtom);
  const { korTitle, title, enTitle, specialPath } = music;
  const setIsSidebar = useSetAtom(sidebarAtom);
  const hasPrivateReaderAccess = useAtomValue(privateReaderAtom);
  const { isPublished, translated, title: novelTitle } = novel ?? {};
  const closeHandler = () => {
    if (window.innerWidth < 1024) setIsSidebar(false);
  };
  const href = isAdmin
    ? `/admin?musicId=${music.id}`
    : specialPath
      ? `/${specialPath}`
      : `/novel/${novel?.id}`;
  const tone = getTone({ isActive, specialPath, translated, isPublished });
  const showPublishedBadge =
    !isAdmin && isPublished && !hasPrivateReaderAccess && !specialPath;
  return (
    <Link
      href={href}
      onNavigate={(event) => {
        if (!isAdmin) return;
        if (!confirmAdminNavigation(guard)) {
          event.preventDefault();
          return;
        }
        closeHandler();
      }}
      onClick={isAdmin ? undefined : closeHandler}
      title={`${title} - ${korTitle} / ${enTitle}`}
      className={styles.item}
      aria-current={isActive ? "page" : undefined}
      scroll={isAdmin ? false : undefined}
      data-active={isActive}
      data-tone={tone}
    >
      <AlbumArtwork
        src={getAlbumArtSrc(music)}
        requestWidth={200}
        alt={music.title}
        className={styles.artwork}
      />
      <span className={styles.itemText}>
        <span className={styles.textRow}>
          <span className="type-label font-semibold truncate">{title}</span>
          {showPublishedBadge && <Badge>정식 발매</Badge>}
        </span>
        <span className="type-caption truncate">
          {korTitle} / {enTitle}
        </span>
        {novelTitle && (
          <span className="type-caption truncate">&lt;{novelTitle}&gt;</span>
        )}
      </span>
    </Link>
  );
};
