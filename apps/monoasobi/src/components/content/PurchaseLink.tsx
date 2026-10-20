"use client";
import { cn } from "@asobi/ui/lib/utils";
import { ScrollArea } from "@asobi/ui/components/scroll-area";
import { Separator } from "@asobi/ui/components/separator";
import { Button } from "@asobi/ui/components/button";
import Link from "next/link";
import styles from "./PurchaseLink.styles";
export interface PurchaseLinkBook {
  id: number;
  name: string;
  novels: {
    id: number;
    title: string;
    writer: string;
    musicKorTitle: string;
  }[];
  purchaseLinks: {
    kyoboURL: string;
    yes24URL: string;
    aladinURL: string;
    ridiURL: string;
    naverURL: string;
  };
}
interface PurchaseLinkProps {
  book: PurchaseLinkBook;
}
export const PurchaseLink = ({ book }: PurchaseLinkProps) => {
  return (
    <ScrollArea className={styles.container}>
      <div className={cn("flex flex-col", styles.pageFrame)}>
        <section
          className={cn(
            "rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs",
            styles.card,
          )}
        >
          <h1 className="type-page-title">소설집 구매 안내</h1>
          <span className="type-body">
            해당 작품은 국내에 정식으로 발간되어 제공이 불가합니다.
          </span>
          <div className="flex flex-col justify-center items-center my-4 gap-3">
            <div className="flex gap-8 w-full justify-center min-[1024px]:items-end items-center flex-col min-[1024px]:flex-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.bookImg}
                src={`/images/books/${book.id}.jpg`}
                alt={book.name}
              />
              <div className="flex flex-col gap-4">
                <h3 className="type-card-title min-[1024px]:text-left text-center">
                  {book.name}
                </h3>
                <Separator />
                <div className="flex flex-col gap-2">
                  {book.novels.map((novel) => (
                    <div key={novel.id} className="flex flex-col gap-1">
                      <span className="type-caption text-center text-muted-foreground">
                        {`♪ ${novel.musicKorTitle}`}
                      </span>
                      <span className="type-body text-center text-muted-foreground">{`${novel.writer} <${novel.title}>`}</span>
                    </div>
                  ))}
                  <span className="type-body text-center text-primary font-medium">
                    총 {book.novels.length}편 수록
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {book.purchaseLinks.kyoboURL && (
                    <Button asChild>
                      <Link href={book.purchaseLinks.kyoboURL} target="_blank">
                        교보문고
                      </Link>
                    </Button>
                  )}
                  {book.purchaseLinks.yes24URL && (
                    <Button asChild>
                      <Link href={book.purchaseLinks.yes24URL} target="_blank">
                        yes24
                      </Link>
                    </Button>
                  )}
                  {book.purchaseLinks.aladinURL && (
                    <Button asChild>
                      <Link href={book.purchaseLinks.aladinURL} target="_blank">
                        알라딘
                      </Link>
                    </Button>
                  )}
                  {book.purchaseLinks.ridiURL && (
                    <Button asChild>
                      <Link href={book.purchaseLinks.ridiURL} target="_blank">
                        리디북스
                      </Link>
                    </Button>
                  )}
                  {book.purchaseLinks.naverURL && (
                    <Button asChild>
                      <Link href={book.purchaseLinks.naverURL} target="_blank">
                        네이버 시리즈
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ScrollArea>
  );
};
