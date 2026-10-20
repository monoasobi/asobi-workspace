"use client";
import type { LyricTrack } from "@asobi/content-core/lyrics";
import type { Music } from "@appTypes/music";
import { YouTubeLyricsPlayer } from "@components/common/YouTubeLyricsPlayer";
import { Button } from "@asobi/ui/components/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@asobi/ui/components/popover";
import { BookOpen, Music2, Ellipsis } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
interface ContentsContainerProps {
  children: ReactNode;
  music: Music;
  lyricTrack?: LyricTrack | null;
  content?: {
    title: string;
    writer: string;
    originUrl: string;
    translator?: string;
    translatorUrl?: string;
  };
}
export function ContentsContainer({
  children,
  music,
  lyricTrack = null,
  content,
}: ContentsContainerProps) {
  const router = useRouter(),
    params = useSearchParams();
  const isLyrics = params.get("view") === "lyrics";
  return (
    <div className="relative flex w-full flex-col items-center p-2">
      <header className="absolute top-1 z-5 flex w-[95%] items-center rounded-xl border border-border bg-card px-14 py-3 shadow-xs max-[480px]:px-11">
        <div className="min-w-0 w-full text-center">
          <p className="type-label block truncate text-primary">
            {music.korTitle} {music.korTitle !== music.title && music.title}
          </p>
          {content?.title && (
            <h2 className="type-label mt-1 block truncate">
              {content.writer} &lt;{content.title}&gt;
            </h2>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              size="icon-sm"
              className="absolute top-1/2 right-4 -translate-y-1/2 max-[480px]:right-3"
              aria-label="작품 정보"
            >
              <Ellipsis className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="max-w-80 space-y-3">
            {content?.translator && content.translatorUrl && (
              <div className="flex items-center gap-3">
                <span className="type-caption">역자</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={content.translatorUrl} target="_blank">
                    {content.translator}
                  </Link>
                </Button>
              </div>
            )}
            {content?.originUrl && (
              <div className="flex items-center gap-3">
                <span className="type-caption">원문</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={content.originUrl} target="_blank">
                    보러가기
                  </Link>
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </header>
      {isLyrics ? (
        <YouTubeLyricsPlayer
          key={music.id}
          music={music}
          lyricTrack={lyricTrack}
        />
      ) : (
        children
      )}
      <Button
        size="icon-lg"
        className="fixed right-6 bottom-6 z-10 size-12 rounded-full shadow-lg max-[480px]:right-4 max-[480px]:bottom-4"
        aria-label={isLyrics ? "본문 보기" : "가사 보기"}
        onClick={() =>
          router.replace(isLyrics ? "?" : "?view=lyrics", { scroll: false })
        }
      >
        {isLyrics ? (
          <BookOpen className="size-5" />
        ) : (
          <Music2 className="size-5" />
        )}
      </Button>
    </div>
  );
}
