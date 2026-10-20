"use client";

import { Error as ErrorView } from "@components/feedback/Error";
import { Loading } from "@components/feedback/Loading";
import { ScrollArea } from "@asobi/ui/components/scroll-area";
import { useEffect, useRef, useState, type UIEvent } from "react";
import { NovelMarkdown } from "./NovelMarkdown";
import styles from "./NovelReader.module.css";

interface NovelReaderProps {
  id: number | string;
}

// Keep the old reading scrollbar geometry while reusing the shared primitive.
const scrollAreaClasses = [
  "flex flex-col overflow-hidden",
  "[&_[data-slot=scroll-area-scrollbar]]:m-[4px] [&_[data-slot=scroll-area-scrollbar]]:h-auto [&_[data-slot=scroll-area-scrollbar]]:w-[4px]",
  "[&_[data-slot=scroll-area-scrollbar]]:rounded-full [&_[data-slot=scroll-area-scrollbar]]:border-0 [&_[data-slot=scroll-area-scrollbar]]:bg-[var(--gray-a3)] [&_[data-slot=scroll-area-scrollbar]]:p-0",
  "[&_[data-slot=scroll-area-scrollbar][data-state=visible]]:animate-[rt-fade-in_120ms_ease-out] [&_[data-slot=scroll-area-scrollbar][data-state=hidden]]:animate-[rt-fade-out_120ms_ease-out]",
  "[&_[data-slot=scroll-area-thumb]]:bg-[var(--gray-a8)] [&_[data-slot=scroll-area-thumb]]:transition-colors [&_[data-slot=scroll-area-thumb]]:duration-100 [&_[data-slot=scroll-area-thumb]]:hover:bg-[var(--gray-a9)]",
  "[&_[data-slot=scroll-area-thumb]]:before:absolute [&_[data-slot=scroll-area-thumb]]:before:top-1/2 [&_[data-slot=scroll-area-thumb]]:before:left-1/2",
  "[&_[data-slot=scroll-area-thumb]]:before:size-full [&_[data-slot=scroll-area-thumb]]:before:min-h-[16px] [&_[data-slot=scroll-area-thumb]]:before:min-w-[16px]",
  "[&_[data-slot=scroll-area-thumb]]:before:[transform:translate(-50%,-50%)] [&_[data-slot=scroll-area-thumb]]:before:content-['']",
].join(" ");

export const NovelReader = ({ id }: NovelReaderProps) => {
  const [markdown, setMarkdown] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const novelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;
    const fetchNovel = async (novelId: number | string) => {
      const isDev = process.env.NODE_ENV === "development";
      try {
        setIsLoading(true);
        setIsError(false);

        // * 개발 + 소설 검토를 위한 로컬 파일 경로 설정
        let url = "";
        if (isDev) {
          url = `/novel/${novelId}.md`;
        }
        const res = await fetch(url || `/api/content/novels/${novelId}`);

        if (!res.ok) throw new Error("Failed to fetch novel");
        const text = await res.text();
        if (!ignore) setMarkdown(text);
      } catch (error) {
        console.error(error);
        if (!ignore) setIsError(true);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    void fetchNovel(id);
    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    if (!markdown) return;
    const novelElement = novelRef.current;
    if (novelElement) {
      const scrollTop = localStorage.getItem(`novel-${id}`);
      if (scrollTop) novelElement.scrollTo(0, parseInt(scrollTop, 10) || 0);
    }
  }, [markdown, id]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const scrollTop = el.scrollTop;
    const scrollKey = `novel-${id}`;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
      localStorage.removeItem(scrollKey);
    } else {
      localStorage.setItem(scrollKey, scrollTop.toString());
    }
  };

  if (isLoading) return <Loading />;
  if (isError) return <ErrorView />;

  return (
    <ScrollArea
      data-novel-viewer
      viewportRef={novelRef}
      className={`${styles.container} ${scrollAreaClasses}`}
      scrollHideDelay={0}
      viewportProps={{
        onScroll: handleScroll,
        className:
          "flex flex-col overscroll-auto rounded-none transition-none focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-[var(--focus-8)] focus-visible:-outline-offset-2 [&>div]:w-fit [&>div]:grow",
      }}
    >
      <div className={`${styles.readerFrame} flex justify-center`}>
        <div className={styles.novelContainer}>
          <NovelMarkdown className={styles.markdown}>
            {markdown ?? ""}
          </NovelMarkdown>
        </div>
      </div>
    </ScrollArea>
  );
};
