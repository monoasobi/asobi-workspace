import type { MetadataRoute } from "next";
import type { NextRequest } from "next/server";
import { getRequestLocale } from "@/i18n/server";
import { isLocale } from "@/i18n/config";
import { siteDescriptions } from "@/lib/metadata";

export async function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get("lang");
  const locale = isLocale(requested) ? requested : await getRequestLocale();
  const manifest: MetadataRoute.Manifest = {
    name: "LOUDASOBI",
    short_name: "LOUDASOBI",
    lang: locale,
    description: siteDescriptions[locale],
    start_url: "/",
    display: "browser",
    background_color: "#FAFAFA",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
  return Response.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "private, no-store",
      Vary: "Cookie, Accept-Language",
    },
  });
}
