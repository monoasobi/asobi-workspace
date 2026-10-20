"use client";

import { useEffect, useState } from "react";
import { AlbumArtwork } from "@asobi/ui/components/album-artwork";
import {
  ALBUM_ART_ACCEPT,
  ALBUM_ART_MAX_BYTES,
  EMPTY_ALBUM_ART,
} from "@asobi/content-core/albumArt";

export const AlbumArtField = ({
  currentSrc = EMPTY_ALBUM_ART,
  disabled,
}: {
  currentSrc?: string;
  disabled: boolean;
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  return (
    <div className="space-y-2">
      <label htmlFor="album-art-file" className="block text-sm font-semibold">
        앨범아트 (선택)
      </label>
      <AlbumArtwork
        src={preview ?? currentSrc}
        alt="앨범아트 미리보기"
        size={120}
        fit="contain"
      />
      <input
        id="album-art-file"
        name="albumArt"
        type="file"
        accept={ALBUM_ART_ACCEPT}
        disabled={disabled}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.setCustomValidity(
            file && file.size > ALBUM_ART_MAX_BYTES
              ? "3MB 이하의 이미지를 선택해주세요."
              : "",
          );
          event.currentTarget.reportValidity();
          setPreview(
            file && file.size <= ALBUM_ART_MAX_BYTES
              ? URL.createObjectURL(file)
              : null,
          );
        }}
      />
      <p className="text-xs text-muted-foreground">
        JPG·PNG·WebP, 최대 3MB. 이미지를 자르지 않고 비율을 유지합니다.
      </p>
    </div>
  );
};
