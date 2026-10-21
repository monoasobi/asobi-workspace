"use client";

import { ScrollArea } from "@asobi/ui/components/scroll-area";
import { Mail } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

// MONOASOBI 오버뷰와 같은 콘텐츠 폭·섹션 여백·히어로 높이를 사용합니다.
const section = "px-8 py-16 max-[480px]:px-5 max-[480px]:py-12";
const inner = "mx-auto flex w-full max-w-[1120px] flex-col gap-6";

export function Overview() {
  const t = useTranslations("overview");
  return (
    <ScrollArea className="h-full w-full bg-background">
      <div className="w-full">
        <section className="relative isolate flex min-h-[min(680px,calc(100dvh-96px))] items-end overflow-hidden text-white max-[1024px]:min-h-[480px] max-[480px]:min-h-[360px]">
          <Image
            src="/assets/overview/live.jpg"
            alt={t("heroAlt")}
            fill
            sizes="(max-width: 767px) 100vw, calc(100vw - 360px)"
            loading="eager"
            className="-z-20 object-cover object-center"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.4)_44%,rgba(0,0,0,0.12)_100%)]" />
          <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-8 pt-[72px] pb-14 max-[480px]:px-5 max-[480px]:pt-14 max-[480px]:pb-10">
            <p className="type-body font-bold tracking-widest text-white/80">
              LOUDASOBI — SHOUT OUR MUSIC
            </p>
            <h1 className="type-page-title">
              {t("heroTitleFirst")}
              <br />
              {t("heroTitleSecond")}
            </h1>
            <p className="type-body text-white/90">
              {t("heroIntroFirst")}
              <br />
              {t("heroIntroSecond")}
            </p>
          </div>
        </section>

        <section className={`${section} border-y border-border bg-card`}>
          <div className={inner}>
            <div className="flex flex-col gap-2">
              <p className="type-eyebrow">ABOUT</p>
              <h2 className="type-section-title">LOUDASOBI?</h2>
            </div>
            <Image
              src="/assets/overview/loudasobi.svg"
              alt="LOUDASOBI — SHOUT OUR MUSIC"
              width={524}
              height={181}
              className="my-8 h-auto w-full max-w-[480px] self-center"
            />
            <div className="type-body flex flex-col gap-3">
              <p>{t("aboutIntro")}</p>
              <p>{t("aboutBody")}</p>
            </div>
          </div>
        </section>

        <section className={section}>
          <div className={inner}>
            <div className="flex flex-col gap-2">
              <p className="type-eyebrow">ONE VOICE</p>
              <h2 className="type-section-title">{t("languageTitle")}</h2>
            </div>
            <div className="type-body flex flex-col gap-3">
              <p>{t("languageIntro")}</p>
              <p>{t("languageBody")}</p>
            </div>
          </div>
        </section>

        <section className={`${section} border-y border-border bg-card`}>
          <div className={inner}>
            <div className="flex flex-col gap-2">
              <p className="type-eyebrow">VOICE, CLAP & LIGHT</p>
              <h2 className="type-section-title">{t("lightTitle")}</h2>
            </div>
            <div className="type-body flex flex-col gap-3">
              <p>{t("lightIntro")}</p>
              <p>{t("lightBody")}</p>
            </div>
          </div>
        </section>

        <section className={section}>
          <div className={inner}>
            <div className="flex flex-col gap-2">
              <p className="type-eyebrow">SEE YOU AT THE NEXT LIVE</p>
              <h2 className="type-section-title">{t("closingTitle")}</h2>
            </div>
            <div className="type-body flex flex-col gap-3">
              <p>{t("closingIntro")}</p>
              <p>{t("closingBody")}</p>
            </div>
          </div>
        </section>

        <footer className="border-t border-border bg-card px-8 py-6 text-right max-[480px]:px-5">
          <div className="type-caption mx-auto flex w-full max-w-[1120px] flex-col items-end gap-3">
            <p className="leading-relaxed">
              {t("fanNotice")}
              <br />
              {t("copyrightNotice")}
            </p>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center justify-end gap-1 leading-5">
                <p>
                  Author.{" "}
                  <span className="font-semibold text-foreground">
                    TRACING A DREAM
                  </span>
                </p>
                <a
                  className="inline-flex size-5 items-center justify-center rounded-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  href="https://www.instagram.com/yoasobi_fc_korea/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("instagramLabel")}
                >
                  <span
                    aria-hidden="true"
                    className="size-3 shrink-0 bg-current [mask:url('/assets/overview/instagram.svg')_center/contain_no-repeat]"
                  />
                </a>
                <a
                  className="inline-flex size-5 items-center justify-center rounded-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  href="mailto:yoasobi.fc.kr@gmail.com"
                  aria-label={t("emailLabel")}
                >
                  <Mail className="size-3 shrink-0" aria-hidden="true" />
                </a>
              </div>
              <p className="leading-5">
                Contributor.{" "}
                <span className="font-semibold text-foreground">WH</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ScrollArea>
  );
}
