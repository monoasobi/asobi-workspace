import type { Metadata } from "next";
import { NovelMarkdownGuide } from "@asobi/ui/components/NovelMarkdownGuide";
import "@asobi/ui/novel-guide.css";

export const metadata: Metadata = { title: "소설 마크다운 작성 가이드" };

export default function NovelGuidePage() {
  return <NovelMarkdownGuide className="novel-guide-reading" />;
}
