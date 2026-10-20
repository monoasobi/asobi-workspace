export const ALBUM_ART_MAX_BYTES = 3 * 1024 * 1024;
export const ALBUM_ART_ACCEPT = "image/jpeg,image/png,image/webp";
export const EMPTY_ALBUM_ART = "/images/albumart/empty.svg";
export const ALBUM_ART_WIDTHS = [200, 400, 800, 1200, 1600] as const;

export interface AlbumArtDelivery {
  assetBaseUrl?: string;
  transformImages?: boolean;
}

export const isAlbumArtKey = (key: string) =>
  /^albumart\/(0|[1-9]\d*)\/[a-f0-9-]+\.webp$/.test(key);

// Only public artwork keys reach this origin; private content paths are excluded.
export const getAlbumArtUrl = (
  key: string | null | undefined,
  delivery: AlbumArtDelivery,
  width?: number,
) => {
  if (!key || !isAlbumArtKey(key) || !delivery.assetBaseUrl) return undefined;
  let base: URL;
  try {
    base = new URL(delivery.assetBaseUrl);
  } catch {
    return undefined;
  }
  if (
    base.protocol !== "https:" ||
    base.username ||
    base.password ||
    base.pathname !== "/" ||
    base.search ||
    base.hash
  )
    return undefined;
  if (!delivery.transformImages || width === undefined)
    return `${base.origin}/${key}`;
  const bounded = Number.isFinite(width) && width > 0 ? width : 200;
  const size = ALBUM_ART_WIDTHS.find((value) => value >= bounded) ?? 1600;
  return `${base.origin}/cdn-cgi/image/width=${size},fit=scale-down,format=auto,quality=85/${key}`;
};

export const getAlbumArtSrc = (
  music: { id: number; albumArtKey?: string | null },
  delivery: AlbumArtDelivery = {},
) =>
  getAlbumArtUrl(music.albumArtKey, delivery) ??
  (music.albumArtKey && isAlbumArtKey(music.albumArtKey)
    ? `/api/content/${music.albumArtKey}`
    : `/images/albumart/${music.id}.webp`);
