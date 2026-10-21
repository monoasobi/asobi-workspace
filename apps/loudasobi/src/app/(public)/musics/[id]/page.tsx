import { notFound } from "next/navigation";
import { musicIdFromPath } from "@/lib/musicRoute";
import { getPublicCatalog } from "@/server/queries/catalog";
import { getRequestLocale } from "@/i18n/server";
import { localizedMetadata, localizedMusicMetadata } from "@/lib/metadata";

type Props = {
  params: Promise<{ id: string }>;
};

async function getMusic(params: Props["params"]) {
  const { id } = await params;
  const musicId = musicIdFromPath(`/musics/${id}`);
  if (musicId === null) notFound();
  const catalog = await getPublicCatalog().catch(() => null);
  const entry = catalog?.find((entry) => entry.music.id === musicId);
  if (catalog && !entry) notFound();
  return entry?.music;
}

export async function generateMetadata({ params }: Props) {
  const [music, locale] = await Promise.all([
    getMusic(params),
    getRequestLocale(),
  ]);
  return music
    ? localizedMusicMetadata(locale, music)
    : localizedMetadata(locale);
}

export default async function MusicPage({ params }: Props) {
  await getMusic(params);
  return null;
}
