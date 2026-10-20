"use client";
import { cn } from "@asobi/ui/lib/utils";
import { ScrollArea } from "@asobi/ui/components/scroll-area";
import { Button } from "@asobi/ui/components/button";
import Link from "next/link";
import styles from "./Translate.styles";
interface TranslateProps {
  originUrl?: string;
}
export const Translate = ({ originUrl }: TranslateProps) => {
  return (
    <ScrollArea className={styles.container}>
      <div className={cn("flex flex-col", styles.pageFrame)}>
        <section
          className={cn(
            "rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs",
            styles.card,
          )}
        >
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.yoasobi}
              src="/images/assets/yoasobi.jpg"
              alt="yoasobi"
            />
            <h1 className="type-page-title">번역본 없음</h1>
            <span className="type-body">
              해당 작품의 한글 번역본이 존재하지 않습니다.
            </span>

            <div className="flex flex-col gap-4">
              <span className="type-body">
                번역본 기여하기:{" "}
                <a href="mailto:envi.9.official@gmail.com?subject=모노아소비 번역본 기여 문의">
                  envi.9.official@gmail.com
                </a>
              </span>
              {originUrl && (
                <Button size="sm" asChild variant="outline">
                  <Link href={originUrl} target="_blank">
                    원문 보러가기
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </ScrollArea>
  );
};
