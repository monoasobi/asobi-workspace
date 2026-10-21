import type { ReactNode } from "react";
import { Button } from "@asobi/ui/components/button";
import { Input } from "@asobi/ui/components/input";
import { NovelMarkdownGuide } from "@asobi/ui/components/NovelMarkdownGuide";
import {
  GripVertical,
  PanelLeft,
  SunMoon,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { documentLabels } from "../content/documentLabels";
import { BookDetailSkeleton, BookListSkeleton } from "./BookSkeletons";
import {
  MusicOverviewSkeleton,
  MusicContentSkeleton,
  MusicSettingsSkeleton,
} from "./MusicCardSkeletons";
export {
  MusicOverviewSkeleton,
  MusicContentSkeleton,
  MusicSettingsSkeleton,
} from "./MusicCardSkeletons";
import { Skeleton } from "@asobi/ui/components/skeleton";

export function FormSkeleton() {
  return (
    <div className="space-y-5 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="type-card-title">곡 추가</h2>
        <div className="flex gap-2">
          <Button disabled size="sm" variant="outline">
            취소
          </Button>
          <Button disabled size="sm">
            생성
          </Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="grid gap-2">
            <p className="type-label">
              {
                documentLabels[
                  ["title", "korTitle", "enTitle", "youtubeId", "specialPath"][
                    index
                  ]
                ]
              }
              {index < 3 ? " *" : ""}
            </p>
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
        <Skeleton className="size-[120px] rounded-lg sm:col-span-2" />
      </div>
    </div>
  );
}

export function ListSkeleton({
  variant = "recommendations",
}: {
  variant?: "recommendations" | "deleted";
}) {
  return (
    <div className="space-y-4 p-5">
      {variant === "deleted"
        ? Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 rounded border p-3"
            >
              <Skeleton className="h-4 w-40" />
              <Button disabled size="sm" variant="outline">
                복원
              </Button>
            </div>
          ))
        : [0, 1].map((group) => (
            <div
              key={group}
              className="overflow-hidden rounded-xl border bg-card"
            >
              <div className="flex items-center gap-3 border-b p-4">
                <GripVertical
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <Skeleton className="h-8 flex-1" />
                <Button
                  disabled
                  size="icon-sm"
                  variant="ghost"
                  aria-label="삭제"
                >
                  <Trash2 aria-hidden className="size-4" />
                </Button>
              </div>
              <div className="space-y-2 p-3">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <GripVertical
                      aria-hidden
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                    <Skeleton className="size-10 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Button disabled size="sm" variant="outline">
                      이동
                    </Button>
                    <Button
                      disabled
                      size="icon-sm"
                      variant="ghost"
                      aria-label="삭제"
                    >
                      <Trash2 aria-hidden className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
    </div>
  );
}

export function GuideSkeleton() {
  return <NovelMarkdownGuide className="novel-guide-reading" />;
}

export function SidebarSkeleton() {
  return (
    <div
      className="min-h-0 flex-1 overflow-hidden"
      role="status"
      aria-label="곡 목록을 불러오는 중입니다."
    >
      <div className="contents">
        <div className="flex h-[60px] items-center justify-end border-b px-3">
          <div className="flex gap-2 rounded-lg border p-1">
            {["추천", "앨범", "발매순"].map((label) => (
              <Button key={label} disabled size="xs" variant="ghost">
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex h-12 items-center justify-between px-4">
          <Skeleton className="h-4 w-28" />
          <ChevronDown aria-hidden className="size-4 text-muted-foreground" />
        </div>
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2.5 border-l-2 border-transparent px-4 py-2"
          >
            <Skeleton className="size-[72px] rounded-sm" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPageSkeleton({
  kind = "music",
}: {
  kind?: "music" | "books" | "list" | "deleted" | "form";
}) {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden p-4 sm:p-6"
      role="status"
      aria-label="자료를 불러오는 중입니다."
    >
      {kind === "music" ? (
        <>
          <section className="max-h-[45dvh] shrink-0 overflow-hidden rounded-xl border bg-card xl:max-h-none">
            <MusicOverviewSkeleton />
          </section>
          <div className="grid min-h-0 flex-1 grid-rows-2 gap-5 overflow-hidden xl:grid-cols-2 xl:grid-rows-1">
            <section className="overflow-hidden rounded-xl border bg-card">
              <MusicContentSkeleton />
            </section>
            <section className="overflow-hidden rounded-xl border bg-card">
              <MusicSettingsSkeleton />
            </section>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <h1 className="type-page-title">
              {kind === "books"
                ? "서적 관리"
                : kind === "list"
                  ? "사이드바 · 추천 정렬"
                  : kind === "deleted"
                    ? "숨긴 곡"
                    : "곡 추가"}
            </h1>
            {kind === "books" && (
              <p className="type-description">
                서적 정보와 연결 소설, 구매 링크를 관리합니다.
              </p>
            )}
            {kind === "deleted" && (
              <p className="type-description">
                연결 자료와 콜 공개 설정은 보존됩니다. 복원하면 이전 공개 설정이
                다시 적용될 수 있습니다.
              </p>
            )}
            {kind === "list" && (
              <div className="flex gap-2">
                <Button disabled size="sm" variant="outline">
                  최신 목록
                </Button>
                <Button disabled size="sm">
                  추천 목록 저장
                </Button>
                <Button disabled size="sm" variant="secondary">
                  + 그룹 추가
                </Button>
              </div>
            )}
          </div>
          <div
            className={
              kind === "books"
                ? "grid min-h-0 flex-1 grid-rows-[minmax(8rem,1fr)_minmax(0,2fr)] gap-5 overflow-hidden md:grid-cols-[16rem_minmax(0,1fr)] md:grid-rows-1"
                : "min-h-0 flex-1 overflow-hidden"
            }
          >
            {kind === "books" && (
              <section className="overflow-hidden rounded-xl border bg-card">
                <BookListSkeleton />
              </section>
            )}
            <section className="overflow-hidden rounded-xl border bg-card">
              {kind === "list" || kind === "deleted" ? (
                <ListSkeleton
                  variant={kind === "deleted" ? "deleted" : "recommendations"}
                />
              ) : kind === "books" ? (
                <div className="pt-5">
                  <BookDetailSkeleton />
                </div>
              ) : (
                <FormSkeleton />
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export function AdminFrameSkeleton({ children }: { children?: ReactNode }) {
  return (
    <div
      className="flex h-dvh flex-col overflow-hidden bg-background"
      role="status"
      aria-label="관리 화면을 불러오는 중입니다."
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b bg-card p-4">
        <div className="flex items-center gap-3">
          <Button
            disabled
            variant="ghost"
            size="icon"
            aria-label="곡 목록 접기"
          >
            <PanelLeft className="size-5" />
          </Button>
          <h1 className="text-sm font-semibold">ASOBI 관리자</h1>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            "곡 추가",
            "서적",
            "소설 마크다운 작성 가이드",
            "추천 정렬",
            "숨긴 곡",
          ].map((label) => (
            <Button key={label} disabled size="sm" variant="ghost">
              {label}
            </Button>
          ))}
          <Button disabled size="icon" variant="ghost" aria-label="테마 전환">
            <SunMoon className="size-4" />
          </Button>
          <Button disabled size="sm" variant="outline">
            로그아웃
          </Button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="h-[30dvh] shrink-0 overflow-hidden border-b bg-card md:h-auto md:w-[300px] md:border-r md:border-b-0">
          <SidebarSkeleton />
        </aside>
        {children ?? <AdminPageSkeleton />}
      </div>
    </div>
  );
}

export function LoginSkeleton() {
  return (
    <main
      className="flex h-dvh items-center justify-center bg-muted/30 p-5"
      role="status"
      aria-label="로그인 화면을 불러오는 중입니다."
    >
      <section className="w-full max-w-sm rounded-2xl border bg-card p-8">
        <p className="mb-2 text-sm text-primary">ASOBI</p>
        <h1 className="text-xl font-semibold">관리자 로그인</h1>
        <p className="my-5 text-sm text-muted-foreground">
          MONOASOBI와 LOUDASOBI의 콘텐츠를 관리합니다.
        </p>
        <div className="grid gap-3">
          <label htmlFor="loading-password" className="type-label">
            비밀번호
          </label>
          <Input
            id="loading-password"
            disabled
            type="password"
            placeholder="비밀번호를 입력해 주세요"
          />
          <Button disabled>로그인</Button>
        </div>
      </section>
    </main>
  );
}
