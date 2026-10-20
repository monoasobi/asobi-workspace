"use client";

import Image from "next/image";
import { Disc3 } from "lucide-react";
import { useState } from "react";
import { cn } from "@asobi/ui/lib/utils";

const monoasobiUrl = process.env.NEXT_PUBLIC_MONOASOBI_URL?.replace(/\/+$/, "");

export function AlbumArtwork({
  albumArtKey,
  src,
  className,
}: {
  albumArtKey?: string | null;
  src?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc =
    src ??
    (monoasobiUrl && albumArtKey
      ? `${monoasobiUrl}/api/content/${albumArtKey}`
      : undefined);
  return imageSrc && !failed ? (
    <Image
      src={imageSrc}
      alt=""
      width={72}
      height={72}
      unoptimized
      className={className}
      onError={() => setFailed(true)}
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn("flex items-center justify-center bg-muted", className)}
    >
      <Disc3 className="size-8 text-muted-foreground" />
    </span>
  );
}
