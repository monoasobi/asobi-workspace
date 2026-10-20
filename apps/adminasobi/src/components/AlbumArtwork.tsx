"use client";
import { AlbumArtwork as SharedAlbumArtwork } from "@asobi/ui/components/album-artwork";
import { Disc3 } from "lucide-react";
import { cn } from "@asobi/ui/lib/utils";
import { isAlbumArtKey } from "@asobi/content-core/albumArt";

const monoasobiUrl = process.env.NEXT_PUBLIC_MONOASOBI_URL?.replace(/\/+$/, "");

export function AlbumArtwork({
  albumArtKey,
  src,
  className,
  size = 72,
  requestWidth,
}: {
  albumArtKey?: string | null;
  src?: string;
  className?: string;
  size?: number;
  requestWidth?: number;
}) {
  const legacySrc =
    monoasobiUrl && albumArtKey && isAlbumArtKey(albumArtKey)
      ? `${monoasobiUrl}/api/content/${albumArtKey}`
      : undefined;
  return (
    <SharedAlbumArtwork
      albumArtKey={albumArtKey}
      src={src ?? legacySrc}
      className={className}
      size={size}
      requestWidth={requestWidth}
      assetBaseUrl={process.env.NEXT_PUBLIC_ASSET_BASE_URL}
      transformImages={process.env.NEXT_PUBLIC_ASSET_TRANSFORMS === "true"}
      fallback={
        <span
          aria-hidden="true"
          className={cn("flex items-center justify-center bg-muted", className)}
        >
          <Disc3 className="size-8 text-muted-foreground" />
        </span>
      }
    />
  );
}
