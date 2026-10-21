import { ScrollArea } from "@asobi/ui/components/scroll-area";
import { Mail } from "lucide-react";
import Image from "next/image";

// MONOASOBI 오버뷰와 같은 콘텐츠 폭·섹션 여백·히어로 높이를 사용합니다.
const section = "px-8 py-16 max-[480px]:px-5 max-[480px]:py-12";
const inner = "mx-auto flex w-full max-w-[1120px] flex-col gap-6";

export function Overview() {
  return (
    <ScrollArea className="h-full w-full bg-background">
      <div className="w-full">
        <section className="relative isolate flex min-h-[min(680px,calc(100dvh-96px))] items-end overflow-hidden text-white max-[1024px]:min-h-[480px] max-[480px]:min-h-[360px]">
          <Image
            src="/assets/overview/live.jpg"
            alt="팬 라이트의 빛과 함성으로 가득한 YOASOBI 라이브 공연장"
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
              모든 YOA’S가
              <br />
              하나의 목소리가 될 수 있도록
            </h1>
            <p className="type-body text-white/90">
              좋아하는 노래를 함께 부르고, 손뼉을 치는 순간
              <br />
              무대와 객석이 함께 만들어 가는 YOASOBI의 라이브를 준비해 보세요
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
              <p>
                라우다소비는 YOASOBI의 라이브에서 함께 목소리를 내고, 박수를
                치는 방법을 담은 ‘콜 가이드’를 알려드리는 사이트입니다.
              </p>
              <p>
                어느 부분에서 무엇을 외치는지, 어떤 리듬으로 박수를 치는지. 처음
                공연을 찾는 분들도, 다시 그 순간을 기다리는 분들도 함께 즐기실
                수 있도록 곡마다 응원 방법을 모았습니다.
              </p>
            </div>
          </div>
        </section>

        <section className={section}>
          <div className={inner}>
            <div className="flex flex-col gap-2">
              <p className="type-eyebrow">ONE VOICE</p>
              <h2 className="type-section-title">
                서로 다른 언어로, 같은 노래를
              </h2>
            </div>
            <div className="type-body flex flex-col gap-3">
              <p>
                일본은 물론 아시아를 넘어 북미까지. 서로 다른 곳에서 YOASOBI를
                사랑하게 된 팬들이 같은 콜을 외칠 수 있도록 한국어·일본어·영어로
                가이드를 제공합니다.
              </p>
              <p>
                가사의 뜻과 발음을 익히고, 함께 부를 구절을 따라 불러 보세요.
                서로 쓰는 언어는 달라도, 같은 노래를 향한 마음은 하나로 모일 수
                있으니까요.
              </p>
            </div>
          </div>
        </section>

        <section className={`${section} border-y border-border bg-card`}>
          <div className={inner}>
            <div className="flex flex-col gap-2">
              <p className="type-eyebrow">VOICE, CLAP & LIGHT</p>
              <h2 className="type-section-title">
                목소리와 박수, 그리고 빛까지
              </h2>
            </div>
            <div className="type-body flex flex-col gap-3">
              <p>
                함께 외치는 콜과 떼창, 음악에 맞춰 이어지는 박수에 더해 해외
                공연에서 자주 사용되는 팬 라이트(킹블레이드) 색깔도 준비되어
                있습니다.
              </p>
              <p>
                좋아하는 곡에 어울리는 빛을 떠올리며, 다음 라이브를 기다리는
                시간을 즐겨 보세요.
              </p>
            </div>
          </div>
        </section>

        <section className={section}>
          <div className={inner}>
            <div className="flex flex-col gap-2">
              <p className="type-eyebrow">SEE YOU AT THE NEXT LIVE</p>
              <h2 className="type-section-title">
                다음 라이브에서 함께 만나요
              </h2>
            </div>
            <div className="type-body flex flex-col gap-3">
              <p>
                모든 콜을 완벽하게 외우지 않으셔도 괜찮습니다. 좋아하는 한
                구절을 따라 부르고, 익숙한 리듬에 손뼉을 치는 것부터 시작해
                보세요.
              </p>
              <p>
                각자의 자리에서 연습한 목소리가 공연장에서 하나로 모이는 날까지!
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-border bg-card px-8 py-6 text-right max-[480px]:px-5">
          <div className="type-caption mx-auto flex w-full max-w-[1120px] flex-col items-end gap-3">
            <p className="leading-relaxed">
              본 사이트는 팬이 제작한 비공식 팬사이트이며,
              <br />
              모든 음원과 영상 및 이미지의 저작권은 원 아티스트에게 있습니다.
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
                  aria-label="TRACING A DREAM 인스타그램"
                >
                  <span
                    aria-hidden="true"
                    className="size-3 shrink-0 bg-current [mask:url('/assets/overview/instagram.svg')_center/contain_no-repeat]"
                  />
                </a>
                <a
                  className="inline-flex size-5 items-center justify-center rounded-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  href="mailto:yoasobi.fc.kr@gmail.com"
                  aria-label="TRACING A DREAM 이메일"
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
