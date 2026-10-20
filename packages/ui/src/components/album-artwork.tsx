"use client";

import { useState, type ReactNode } from "react";
import {
  ALBUM_ART_WIDTHS,
  EMPTY_ALBUM_ART,
  getAlbumArtUrl,
  type AlbumArtDelivery,
} from "@asobi/content-core/albumArt";

// A native img keeps the explicit CDN srcset intact and avoids a second Next optimizer.
export function AlbumArtwork({
  albumArtKey,
  src,
  alt = "",
  size = 72,
  requestWidth,
  className,
  fit = "cover",
  fallback,
  assetBaseUrl,
  transformImages,
}: AlbumArtDelivery & {
  albumArtKey?: string | null;
  src?: string;
  alt?: string;
  size?: number;
  requestWidth?: number;
  className?: string;
  fit?: "cover" | "contain";
  fallback?: ReactNode;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const delivery = { assetBaseUrl, transformImages };
  const cdnSrc = !src?.startsWith("blob:")
    ? getAlbumArtUrl(albumArtKey, delivery, requestWidth ?? size)
    : undefined;
  const imageSrc = cdnSrc ?? src;
  if (!imageSrc || failedSrc === imageSrc) {
    return (
      fallback ?? (
        <img
          src={EMPTY_ALBUM_ART}
          alt={alt}
          width={size}
          height={size}
          className={className}
        />
      )
    );
  }
  const srcSet =
    cdnSrc && transformImages && requestWidth === undefined
      ? ALBUM_ART_WIDTHS.map(
          (width) =>
            `${getAlbumArtUrl(albumArtKey, delivery, width)} ${width}w`,
        ).join(", ")
      : undefined;
  return (
    <img
      src={imageSrc}
      srcSet={srcSet}
      sizes={srcSet ? `${size}px` : undefined}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={className}
      style={{ objectFit: fit }}
      onError={() => setFailedSrc(imageSrc)}
    />
  );
}
