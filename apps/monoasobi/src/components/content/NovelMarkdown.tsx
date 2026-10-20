"use client";

import { fontAtom } from "@atoms/font.atom";
import { useAtomValue } from "jotai";
import { NovelMarkdown as SharedNovelMarkdown } from "@asobi/ui/components/NovelMarkdown";

export const NovelMarkdown = (props: { children: string; className?: string }) => {
  const font = useAtomValue(fontAtom);
  return <SharedNovelMarkdown {...props} font={font} />;
};
