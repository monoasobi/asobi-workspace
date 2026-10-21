import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
const description = "MONOASOBI와 LOUDASOBI의 콘텐츠를 관리하는 ASOBI 통합 관리자입니다.";

export const metadata: Metadata = {
  title: {
    default: "MINASOBI | ASOBI 통합 관리자",
    template: "%s | MINASOBI",
  },
  applicationName: "MINASOBI",
  description,
  appleWebApp: { title: "MINASOBI", capable: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "MINASOBI",
    title: "MINASOBI | ASOBI 통합 관리자",
    description,
  },
  twitter: {
    card: "summary",
    title: "MINASOBI | ASOBI 통합 관리자",
    description,
  },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#F2285A" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
