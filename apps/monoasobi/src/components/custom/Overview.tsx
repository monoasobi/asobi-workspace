import { OverviewFooter } from "@asobi/ui/components/overview-footer";
import { Button } from "@asobi/ui/components/button";
import { ScrollArea } from "@asobi/ui/components/scroll-area";
import { cn } from "@asobi/ui/lib/utils";
import {
  BookOpenIcon,
  HeartIcon,
  LanguageIcon,
  MusicalNoteIcon,
  PlayCircleIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import styles from "./Overview.styles";
const LOGO_IMAGE = "/images/assets/logowith.svg";
interface FeatureItem {
  icon: typeof BookOpenIcon;
  title: string;
  description: string;
  to?: string;
  action?: string;
}
const features: FeatureItem[] = [
  {
    icon: BookOpenIcon,
    title: "YOASOBI 노래의 원작 읽기",
    description:
      "YOASOBI 음악의 원작 소설을 곡별로 정리하고, 한국어 번역본을 바로 읽을 수 있게 제공합니다.",
  },
  {
    icon: MusicalNoteIcon,
    title: "소설을 읽은 후 가사 곱씹어보기",
    description:
      "작품 페이지 우측 하단의 버튼을 누르면 해당 곡의 MV와 싱크 가사 화면으로 전환됩니다.",
  },
  {
    icon: RectangleStackIcon,
    title: "코믹스와 스페셜 콘텐츠",
    description:
      "「舞台に立って」처럼 소설 외 원작이 있는 곡은 코믹스와 별도 안내 페이지로 묶어 제공합니다.",
  },
  {
    icon: ShoppingBagIcon,
    title: "정식 출판본 안내",
    description:
      "국내 정식 출판으로 전문을 제공하기 어려운 작품은 수록 도서와 구매처를 안내합니다.",
  },
];
export const Overview = () => {
  return (
    <ScrollArea className={styles.container}>
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={cn("flex flex-col gap-4", styles.heroInner)}>
            <div className="flex flex-col gap-3">
              <h1 className="type-page-title">
                YOASOBI의 음악 너머, <br />
                이야기를 발견하다
              </h1>
              <span className={cn("type-body", styles.heroCopy)}>
                모노아소비는 요아소비(YOASOBI)의 음악이 원작으로 삼고 있는
                소설과 번역본, 가사를 한곳에 모아 제공하는 사이트입니다.
              </span>
            </div>
          </div>
        </section>

        <section className={styles.noticeBand}>
          <section className={styles.section}>
            <div className={cn("flex flex-col gap-4", styles.sectionInner)}>
              <div className="flex flex-col gap-2">
                <span className={cn("type-body", styles.eyebrow)}>ABOUT</span>
                <h2 className="type-section-title">MONOASOBI?</h2>
              </div>
              <div className="flex flex-col gap-3">
                <figure className={styles.logo}>
                  <Image src={LOGO_IMAGE} alt="logo" fill />
                </figure>
                <span className="type-body">
                  모노아소비는 요아소비(YOASOBI)의 음악이 원작으로 삼고 있는
                  소설과 그 번역본을 한곳에 모아 제공하는 사이트입니다.
                </span>
                <span className="type-body">
                  모노아소비는 더 많은 사람들이 원작 소설을 즐길 수 있도록 돕고,
                  요아소비의 음악을 더욱 깊이 사랑하게 되기를 바라는 마음으로
                  운영됩니다.
                </span>
                <span className="type-body">
                  사이트에 게시된 모든 원작 소설과 번역본의 저작권은 각각의
                  작가와 번역자에게 있으며, 모노아소비는 이 자료들을
                  공유함으로써 어떠한 상업적 이익도 추구하지 않습니다.
                </span>
              </div>
            </div>
          </section>
        </section>

        <section className={styles.section}>
          <div className={cn("flex flex-col gap-6", styles.sectionInner)}>
            <div className="flex flex-col gap-2">
              <span className={cn("type-body", styles.eyebrow)}>FEATURES</span>
              <h2 className="type-section-title">콘텐츠와 기능</h2>
            </div>
            <div className={styles.featureGrid}>
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <section
                    key={feature.title}
                    className={cn(
                      "rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs",
                      styles.featureCard,
                    )}
                  >
                    <div className="flex flex-col gap-4">
                      <div
                        className={cn(
                          "flex items-center justify-center",
                          styles.iconShell,
                        )}
                      >
                        <Icon width={22} height={22} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <h3 className="type-card-title">{feature.title}</h3>
                        <span className="type-body text-muted-foreground">
                          {feature.description}
                        </span>
                      </div>
                      {feature.to && feature.action && (
                        <Button size="default" variant="secondary" asChild>
                          <Link href={feature.to}>{feature.action}</Link>
                        </Button>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={cn("flex flex-col gap-6", styles.sectionInner)}>
            <div className="flex flex-col gap-2">
              <span className={cn("type-body", styles.eyebrow)}>
                MELTIN&apos; FLOW
              </span>
              <h2 className="type-section-title">주인장 추천 루트</h2>
            </div>

            <section
              className={cn(
                "rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs",
                styles.routeCard,
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-between gap-4",
                  styles.routeStep,
                )}
              >
                <span className="type-body font-bold">소설을 읽는다</span>
                <div className={styles.routeIconContain}>
                  <BookOpenIcon width={24} height={24} />
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center justify-between gap-4",
                  styles.routeStep,
                )}
              >
                <span className="type-body font-bold">
                  번역된 가사와 함께 노래를 들으며 아야세의 작사 실력에 감탄한다
                </span>
                <div className={styles.routeIconContain}>
                  <MusicalNoteIcon width={24} height={24} />
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center justify-between gap-4",
                  styles.routeStep,
                )}
              >
                <span className="type-body font-bold">
                  뮤직비디오를 감상하며 소설에 등장한 디테일을 발견하고 감탄한다
                </span>
                <div className={styles.routeIconContain}>
                  <PlayCircleIcon width={24} height={24} />
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center justify-between gap-4",
                  styles.routeStep,
                )}
              >
                <span className="type-body font-bold text-primary">
                  입덕완료!
                </span>
                <div className={styles.routeIconContain}>
                  <HeartIcon width={24} height={24} />
                </div>
              </div>
            </section>
          </div>
        </section>

        <section className={styles.section}>
          <div className={cn("flex flex-col gap-4", styles.sectionInner)}>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center justify-center",
                  styles.iconShell,
                )}
              >
                <LanguageIcon width={22} height={22} />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="type-section-title">번역 투고 및 기타 문의</h2>
                <span className="type-body text-muted-foreground">
                  번역본 제공, 출처 수정, 사이트 관련 문의를 받을 수 있습니다.
                </span>
              </div>
            </div>
            <Button size="lg" variant="outline" asChild>
              <a href="mailto:yoasobi.fc.kr@gmail.com?subject=모노아소비 문의">
                yoasobi.fc.kr@gmail.com
              </a>
            </Button>
          </div>
        </section>
        <OverviewFooter
          fanNotice="본 사이트는 팬이 제작한 비공식 팬사이트이며,"
          copyrightNotice="모든 음원과 영상 및 이미지의 저작권은 원 아티스트에게 있습니다."
          instagramLabel="TRACING A DREAM 인스타그램"
          emailLabel="TRACING A DREAM 이메일"
        />
      </main>
    </ScrollArea>
  );
};
