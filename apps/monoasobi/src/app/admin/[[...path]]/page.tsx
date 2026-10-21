import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "관리자 이전 안내",
  robots: { index: false, follow: false },
};

export default function RetiredAdminPage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="type-page-title">관리자가 이전되었습니다</h1>
      <p className="type-body">콘텐츠 관리는 통합 관리자 MINASOBI에서 진행해 주세요.</p>
      <Link href="/" className="text-primary underline">홈으로 돌아가기</Link>
    </main>
  );
}
