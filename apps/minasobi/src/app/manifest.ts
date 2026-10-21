import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "MINASOBI",
    short_name: "MINASOBI",
    description: "MONOASOBI와 LOUDASOBI의 콘텐츠를 관리하는 ASOBI 통합 관리자입니다.",
    lang: "ko",
    start_url: "/",
    scope: "/",
    display: "browser",
    background_color: "#FAFAFA",
    theme_color: "#F2285A",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
