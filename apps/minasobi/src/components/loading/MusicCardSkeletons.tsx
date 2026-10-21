import { Skeleton } from "@asobi/ui/components/skeleton";
import { Button } from "@asobi/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@asobi/ui/components/tabs";
import { AudioLines, Globe, PanelsTopLeft, Save } from "lucide-react";

function Field({ label, help }: { label: string; help?: string }) {
  return (
    <div className="grid gap-2">
      <p className="type-label">{label}</p>
      <Skeleton className="h-8 w-full" />
      {help && <p className="type-caption">{help}</p>}
    </div>
  );
}

export function MusicOverviewSkeleton() {
  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <h1 className="type-section-title">곡 정보</h1>
        <div className="flex gap-2">
          <Button disabled variant="outline" size="sm">
            곡 숨기기
          </Button>
          <Button disabled size="sm">
            곡 정보 저장
          </Button>
        </div>
      </header>
      <div className="flex min-w-0 items-start gap-4 p-5 sm:p-6">
        <Skeleton className="size-[120px] shrink-0 rounded-lg" />
        <div className="grid min-w-0 flex-1 gap-4 lg:grid-cols-3">
          <Field label="일본어 제목" />
          <Field label="한국어 제목" />
          <Field label="영어 제목" />
        </div>
      </div>
    </div>
  );
}

export function MusicContentSkeleton() {
  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <Tabs value="media">
          <TabsList aria-label="곡 콘텐츠 구분">
            {[
              ["media", "음원·페이지"],
              ["novel", "소설"],
              ["comic", "만화"],
              ["lyric", "가사"],
              ["book", "서적"],
            ].map(([value, label]) => (
              <TabsTrigger key={value} value={value} disabled>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button disabled variant="outline" size="sm">
          <PanelsTopLeft aria-hidden className="size-4" />
          가사 편집
        </Button>
      </header>
      <div className="grid gap-5 p-5 sm:p-6">
        <Field label="MONOASOBI YouTube ID" />
        <Field label="특별 페이지 경로" />
      </div>
    </div>
  );
}

export function MusicSettingsSkeleton() {
  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div className="flex items-center gap-2">
          <h2 className="type-section-title">콜 정보</h2>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Button disabled variant="outline" size="sm">
            <PanelsTopLeft aria-hidden className="size-4" />콜 편집
          </Button>
          <Button disabled size="sm">
            <Save aria-hidden className="size-4" />
            설정 저장
          </Button>
        </div>
      </header>
      <div className="grid gap-5 p-5 sm:p-6">
        <section>
          <div className="mb-4 flex items-start gap-3">
            <AudioLines
              aria-hidden
              className="mt-0.5 size-5 text-muted-foreground"
            />
            <div>
              <h3 className="text-sm font-semibold">음원 및 표시</h3>
              <p className="mt-1 type-caption">
                재생할 음원과 곡의 킹블레이드 색상을 설정합니다.
              </p>
            </div>
          </div>
          <div className="grid items-start gap-5 lg:grid-cols-2">
            <Field
              label="loudasobi 전용 YouTube ID"
              help="URL이 아닌 ID만 입력합니다. MONOASOBI의 MV ID와 별개입니다."
            />
            <Field label="킹블레이드 색상" />
          </div>
        </section>
        <section>
          <div className="mb-4 flex items-start gap-3">
            <Globe
              aria-hidden
              className="mt-0.5 size-5 text-muted-foreground"
            />
            <div>
              <h3 className="text-sm font-semibold">공개 설정</h3>
              <p className="mt-1 type-caption">
                저장하면 공개 곡 목록에 반영됩니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="size-4" />
            <p className="type-label">공개 (loudasobi 곡 목록에 표시)</p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            비공개로 전환해도 가사와 콜 자료는 보존됩니다. 공개하려면 전용
            YouTube ID가 필요합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
