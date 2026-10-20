"use client";
import type { ComponentProps } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SongList as SharedSongList } from "@asobi/ui/components/song-list";
import { AlbumArtwork } from "@/components/common/AlbumArtwork";
import { FanLightBadge } from "@/components/common/FanLightBadge";
import type { Locale } from "@/i18n/config";
type Props = Omit<
  ComponentProps<typeof SharedSongList>,
  "locale" | "labels" | "renderArtwork" | "renderFanLight"
>;
export function SongList(props: Props) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  return (
    <SharedSongList
      {...props}
      locale={locale}
      labels={{
        pending: t("pending"),
        songSort: t("songSort"),
        recommendedSort: t("recommendedSort"),
        albumSort: t("albumSort"),
        releaseSort: t("releaseSort"),
        songs: t("songs"),
        selectSong: t("selectSong"),
        published: "공개",
        unpublished: "비공개",
      }}
      renderArtwork={(music, className) => (
        <AlbumArtwork
          key={music.albumArtKey ?? music.id}
          albumArtKey={music.albumArtKey}
          className={className}
        />
      )}
      renderFanLight={(color) => <FanLightBadge color={color} compact />}
    />
  );
}
