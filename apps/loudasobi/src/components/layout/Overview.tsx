"use client";

import { ScrollArea } from "@asobi/ui/components/scroll-area";
import { OverviewFooter } from "@asobi/ui/components/overview-footer";
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

        <OverviewFooter
          fanNotice={t("fanNotice")}
          copyrightNotice={t("copyrightNotice")}
          instagramLabel={t("instagramLabel")}
          emailLabel={t("emailLabel")}
          contributor="WH"
        />
      </div>
    </ScrollArea>
  );
}
