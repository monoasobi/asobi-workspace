"use client";

import Image from "next/image";
import { Disc3 } from "lucide-react";
import { useState } from "react";
import { cn } from "@asobi/ui/lib/utils";

const monoasobiUrl = process.env.NEXT_PUBLIC_MONOASOBI_URL?.replace(/\/+$/, "");

export function AlbumArtwork({
  albumArtKey,
  className,
}: {
  albumArtKey?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return monoasobiUrl && albumArtKey && !failed ? (
    <Image
      src={`${monoasobiUrl}/api/content/${albumArtKey}`}
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
