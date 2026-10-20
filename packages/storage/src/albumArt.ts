import "server-only";
import sharp from "sharp";
import { ALBUM_ART_MAX_BYTES } from "@asobi/content-core/albumArt";

export const normalizeAlbumArt = async (input: Uint8Array) => {
  if (!input.byteLength || input.byteLength > ALBUM_ART_MAX_BYTES) {
    throw new Error("앨범아트는 3MB 이하의 이미지여야 합니다.");
  }
  const image = sharp(input, { limitInputPixels: 40_000_000 });
  const metadata = await image.metadata();
  if (
    !metadata.format ||
    !["jpeg", "png", "webp"].includes(metadata.format) ||
    (metadata.pages ?? 1) > 1
  ) {
    throw new Error("정지 이미지 JPG, PNG, WebP만 사용할 수 있습니다.");
  }
  // Retain source dimensions; delivery sizes belong to the public image CDN.
  // Keep the existing byte/pixel/format limits and cap the encoded file as well.
  for (const quality of [90, 80, 70, 60, 50]) {
    const output = await image.clone().rotate().webp({ quality }).toBuffer();
    if (output.byteLength <= ALBUM_ART_MAX_BYTES) return output;
  }
  throw new Error(
    "해상도를 유지한 파일이 3MB를 초과합니다. 압축한 이미지를 선택해 주세요.",
  );
};
