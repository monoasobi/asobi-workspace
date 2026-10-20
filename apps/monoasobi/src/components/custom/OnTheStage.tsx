"use client";
import { cn } from "@asobi/ui/lib/utils";
import { ScrollArea } from "@asobi/ui/components/scroll-area";
import { Button } from "@asobi/ui/components/button";
/* eslint-disable @next/next/no-img-element */
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import styles from "./OnTheStage.styles";
export const OnTheStage = () => {
  return (
    <ScrollArea className={styles.container}>
      <div className={cn("flex flex-col", styles.pageFrame)}>
        <section
          className={cn(
            "rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs",
            styles.card,
          )}
        >
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 rounded-lg border border-border bg-secondary p-3 type-body">
              <div>
                <InformationCircleIcon width={24} />
              </div>
              <p>
                「舞台に立って(무대에 서서)」는 소년 점프+ 와의 「NHK 스포츠
                테마 2024」 콜라보레이션 단편 코믹스를 원작으로 하며, 원작
                만화를 토대로 한 소설 역시 공개되어 있습니다.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Content
                image="/images/assets/onthestage1.png"
                title="떨어진 두 사람"
                comicHref="/comic/1"
                novelHref="/novel/26"
              />
              <Content
                image="/images/assets/onthestage2.png"
                title="Parallel Lane"
                comicHref="/comic/2"
                novelHref="/novel/27"
              />
              <Content
                image="/images/assets/onthestage3.png"
                title="끝나지 않는 듀스"
                comicHref="/comic/3"
                novelHref="/novel/28"
              />
            </div>
          </div>
        </section>
      </div>
    </ScrollArea>
  );
};
interface ContentProps {
  image: string;
  title: string;
  comicHref: string;
  novelHref: string;
}
const Content = ({ image, title, comicHref, novelHref }: ContentProps) => (
  <section
    className={cn(
      "rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs",
      styles.content,
    )}
  >
    <div className="flex min-[520px]:flex-row flex-col gap-4 min-[520px]:items-end items-center">
      <img src={image} alt={title} />
      <div className="flex flex-col gap-4 w-full">
        <h2 className="type-section-title min-[520px]:text-left text-center">
          {title}
        </h2>
        <div className="flex flex-col gap-2 w-full">
          <Button size="lg" asChild variant="outline">
            <Link href={comicHref}>코믹스</Link>
          </Button>
          <Button size="lg" asChild variant="outline">
            <Link href={novelHref}>소설</Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);
