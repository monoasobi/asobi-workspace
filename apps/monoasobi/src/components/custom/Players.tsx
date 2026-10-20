"use client";
/* eslint-disable @next/next/no-img-element */
import { cn } from "@asobi/ui/lib/utils";
import { ScrollArea } from "@asobi/ui/components/scroll-area";
import { Button } from "@asobi/ui/components/button";
import Link from "next/link";
import styles from "./SpecialPage.styles";
export const Players = () => {
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
            <img
              className={styles.largeImage}
              src="/images/assets/players1.jpg"
              alt="players"
            />
            <img
              className={styles.largeImage}
              src="/images/assets/players2.jpg"
              alt="memory of play"
            />
            <h1 className="type-page-title">#MemoryOfPlay</h1>

            <div className={cn("flex flex-col gap-4", styles.desc)}>
              <span className="type-body">
                「PLAYERS」는 플레이 스테이션 발매 30주년 기념 콜라보레이션
                프로젝트 「Project: MEMORY CARD」를 통해 발매된 곡입니다.
              </span>
              <span className="type-body">
                「플레이스테이션의 기억을 음악에 세이브한다」를 컨셉으로,
                플레이스테이션 공식 X에서 「기억을 지우고 다시 한 번 하고 싶은
                게임」의 에피소드를 공모, 약 3만 여개의 에피소드가 모인
                #MEmoryOfPlay를 원작으로 만들어졌습니다.
              </span>

              <Button asChild variant="outline">
                <Link
                  href="https://www.yoasobi-music.jp/projectmemorycard/"
                  target="_blank"
                >
                  원문 보러가기
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </ScrollArea>
  );
};
