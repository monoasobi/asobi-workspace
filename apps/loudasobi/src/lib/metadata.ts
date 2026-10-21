import type { Metadata, Viewport } from "next";
import type { Locale } from "@/i18n/config";
import { getAlbumArtUrl } from "@asobi/content-core/albumArt";
import type { Music } from "@/types/music";
import { musicPath } from "./musicRoute";

const description =
  "YOASOBI 노래의 가사와 함께 박수, 챈트, 떼창을 연습하는 팬 가이드";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const siteDescriptions = {
  ko: description,
  ja: "YOASOBIの歌詞に合わせて手拍子・チャント・一緒に歌うパートを練習するファンガイド",
  en: "A fan guide to practicing claps, chants, and sing-along parts with YOASOBI lyrics",
};
const guideTitles = {
  ko: "YOASOBI 콜 가이드",
  ja: "YOASOBI コールガイド",
  en: "YOASOBI Call Guide",
};

export const siteMetadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: { default: "LOUDASOBI", template: "%s | LOUDASOBI" },
  description,
  applicationName: "LOUDASOBI",
  ...(siteUrl ? { alternates: { canonical: "/" } } : {}),
  openGraph: {
    title: guideTitles.ko,
    description,
    siteName: "LOUDASOBI",
    locale: "ko_KR",
    type: "website",
    ...(siteUrl ? { url: "/" } : {}),
  },
  twitter: { card: "summary_large_image", title: guideTitles.ko, description },
};

export function localizedMetadata(locale: Locale): Metadata {
  const translated = siteDescriptions[locale];
  return {
    ...siteMetadata,
    manifest: `/manifest.webmanifest?lang=${locale}`,
    description: translated,
    openGraph: {
      ...siteMetadata.openGraph,
      title: guideTitles[locale],
      description: translated,
      locale: { ko: "ko_KR", ja: "ja_JP", en: "en_US" }[locale],
    },
    twitter: {
      ...siteMetadata.twitter,
      title: guideTitles[locale],
      description: translated,
    },
  };
}

export function localizedMusicMetadata(locale: Locale, music: Music): Metadata {
  const base = localizedMetadata(locale);
  const title = (
    { ko: music.korTitle, ja: music.title, en: music.enTitle }[locale] ||
    music.title
  ).trim();
  const shareTitle = `${title} | ${guideTitles[locale]}`;
  const source = getAlbumArtUrl(music.albumArtKey, {
    assetBaseUrl: process.env.NEXT_PUBLIC_ASSET_BASE_URL,
  });
  const image = source
    ? process.env.NEXT_PUBLIC_ASSET_TRANSFORMS === "true"
      ? new URL(
          `/cdn-cgi/image/width=1300,fit=scale-down,format=jpeg,quality=85/${music.albumArtKey}`,
          source,
        ).href
      : source
    : undefined;
  const images = image
    ? [{ url: image, alt: title }]
    : [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: "LOUDASOBI — SHOUT OUR MUSIC",
        },
      ];
  return {
    ...base,
    title,
    ...(siteUrl ? { alternates: { canonical: musicPath(music.id) } } : {}),
    openGraph: {
      ...base.openGraph,
      title: shareTitle,
      ...(siteUrl ? { url: musicPath(music.id) } : {}),
      images,
    },
    twitter: {
      ...base.twitter,
      title: shareTitle,
      images,
    },
  };
}

export const siteViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};
