"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@asobi/ui/components/button";
import { ALBUM_ART_ACCEPT } from "@asobi/content-core/albumArt";
import { AlbumArtwork } from "../AlbumArtwork";

export const AlbumArtField = ({
  currentSrc,
  albumArtKey,
  disabled,
  onFileChange,
}: {
  currentSrc?: string;
  albumArtKey?: string | null;
  disabled: boolean;
  onFileChange?: (file: File | undefined) => void;
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);
  return (
    <div className="flex min-w-0 items-center gap-4">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        aria-label="앨범아트 이미지 선택"
        aria-describedby={`${id}-help`}
        className="size-[120px] shrink-0 overflow-hidden rounded-lg p-0"
        onClick={() => input.current?.click()}
      >
        <AlbumArtwork
          key={preview ?? albumArtKey ?? currentSrc}
          src={preview ?? currentSrc}
          size={120}
          fit="contain"
          albumArtKey={albumArtKey}
          className="size-[120px] object-contain"
        />
      </Button>
      <input
        ref={input}
        id={id}
        name="albumArt"
        type="file"
        accept={ALBUM_ART_ACCEPT}
        disabled={disabled}
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          setPreview(file ? URL.createObjectURL(file) : null);
          setFilename(file?.name ?? "");
          onFileChange?.(file);
        }}
      />
      <div className="grid min-w-0 gap-1.5">
        {filename && <p className="type-label break-all">{filename}</p>}
        <p id={`${id}-help`} className="type-caption">
          이미지를 눌러 JPG·PNG·WebP를 선택하세요. 비율을 유지해 저장합니다.
        </p>
      </div>
    </div>
  );
};
