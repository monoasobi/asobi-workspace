"use client";

import { Error as ErrorView } from "@components/feedback/Error";
import { LoadingOverlay } from "@asobi/ui/components/loading-overlay";
import { ScrollArea } from "@asobi/ui/components/scroll-area";
import { useEffect, useRef, useState, type UIEvent } from "react";
import { NovelMarkdown } from "./NovelMarkdown";
import { fetchNovelMarkdown } from "./NovelReader/fetchNovelMarkdown";
import styles from "./NovelReader.module.css";

interface NovelDocument {
  id: string;
  markdown: string;
  error?: boolean;
}

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
  const [document, setDocument] = useState<NovelDocument | null>(null);
  const [readyDocument, setReadyDocument] = useState<NovelDocument | null>(null);
  const isCurrent = document?.id === String(id);
  const isLoading = !isCurrent || !document || readyDocument !== document;
  const isError = isCurrent && document?.error;
  const markdown = document?.markdown ?? "";
  const novelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;
    const fetchNovel = async (novelId: number | string) => {
      const isDev = process.env.NODE_ENV === "development";
      try {
        const text = await fetchNovelMarkdown(novelId, isDev);
        if (!ignore) setDocument({ id: String(novelId), markdown: text });
      } catch (error) {
        console.error(error);
        if (!ignore) setDocument({ id: String(novelId), markdown: "", error: true });
      }
    };

    void fetchNovel(id);
    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    if (!document || document.id !== String(id) || document.error) return;
    const frame = requestAnimationFrame(() => {
      const novelElement = novelRef.current;
      if (!novelElement) return;
      try {
        const scrollTop = localStorage.getItem(`novel-${id}`);
        novelElement.scrollTo(0, parseInt(scrollTop ?? "0", 10) || 0);
      } catch {
        // Reading remains available when browser storage is blocked.
      }
      setReadyDocument(document);
    });
    return () => cancelAnimationFrame(frame);
  }, [document, id]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (isLoading) return;
    const el = event.currentTarget;
    const scrollTop = el.scrollTop;
    const scrollKey = `novel-${id}`;

    try {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
        localStorage.removeItem(scrollKey);
      } else {
        localStorage.setItem(scrollKey, scrollTop.toString());
      }
    } catch {
      // Storage failures must not interrupt reading.
    }
  };

  if (isError) return <ErrorView />;

  return (
    <div className="relative isolate w-full" aria-busy={isLoading}>
      <div inert={isLoading} className="relative z-0">
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
      </div>
      {isLoading && (
        <LoadingOverlay
          label={isCurrent ? "읽던 위치를 복원하는 중입니다." : "소설 본문을 불러오는 중입니다."}
          description="잠시만 기다려 주세요."
        />
      )}
    </div>
  );
};
