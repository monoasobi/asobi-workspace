import assert from "node:assert/strict";
import {
  localizedMetadata,
  localizedMusicMetadata,
  siteDescriptions,
} from "../apps/loudasobi/src/lib/metadata";

process.env.NEXT_PUBLIC_ASSET_BASE_URL = "https://assets.example.com";
process.env.NEXT_PUBLIC_ASSET_TRANSFORMS = "true";
const music = {
  id: 0,
  title: "群青",
  korTitle: "군청",
  enTitle: "Blue",
  albumArtKey: "albumart/0/abc-def.webp",
};
for (const [locale, title, guideTitle] of [
  ["ko", "군청", "YOASOBI 콜 가이드"],
  ["ja", "群青", "YOASOBI コールガイド"],
  ["en", "Blue", "YOASOBI Call Guide"],
] as const) {
  const site = localizedMetadata(locale);
  assert.equal(site.openGraph?.title, guideTitle);
  assert.equal(site.twitter?.title, guideTitle);
  assert.equal(site.description, siteDescriptions[locale]);
  assert.equal(site.manifest, `/manifest.webmanifest?lang=${locale}`);
  const page = localizedMusicMetadata(locale, music);
  assert.equal(page.title, title);
  assert.equal(page.openGraph?.title, `${title} | ${guideTitle}`);
  assert.equal(page.twitter?.title, `${title} | ${guideTitle}`);
  assert.deepEqual(page.openGraph?.images, page.twitter?.images);
  assert.deepEqual(page.openGraph?.images, [
    {
      url: "https://assets.example.com/cdn-cgi/image/width=1300,fit=scale-down,format=jpeg,quality=85/albumart/0/abc-def.webp",
      alt: title,
    },
  ]);
}
const fallback = localizedMusicMetadata("en", {
  ...music,
  enTitle: "",
  albumArtKey: "invalid",
});
assert.equal(fallback.title, music.title);
assert.deepEqual(fallback.openGraph?.images, [
  {
    url: "/opengraph-image.png",
    width: 1200,
    height: 630,
    alt: "LOUDASOBI — SHOUT OUR MUSIC",
  },
]);
console.log("LOUDASOBI localized site/music metadata passed");
