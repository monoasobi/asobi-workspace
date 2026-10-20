"use client";
import { AlbumArtwork as SharedAlbumArtwork } from "@asobi/ui/components/album-artwork";

export const AlbumArtwork = ({
  src,
  alt,
  size = 72,
  className,
  fit = "cover",
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  fit?: "cover" | "contain";
}) => {
  const key = src.startsWith("/api/content/albumart/")
    ? src.slice("/api/content/".length)
    : undefined;
  return (
    <SharedAlbumArtwork
      src={src}
      albumArtKey={key}
      alt={alt}
      size={size}
      className={className}
      fit={fit}
      assetBaseUrl={process.env.NEXT_PUBLIC_ASSET_BASE_URL}
      transformImages={process.env.NEXT_PUBLIC_ASSET_TRANSFORMS === "true"}
    />
  );
};
