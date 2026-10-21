import type { ReactNode } from "react";
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
    <div
      aria-hidden="true"
      className="space-y-5 p-5 animate-pulse motion-reduce:animate-none [&_[data-slot=skeleton]]:animate-none"
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-7 w-20" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="grid gap-2">
            <Skeleton className="h-4 w-24" />
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
    <div
      aria-hidden="true"
      className="space-y-4 p-5 animate-pulse motion-reduce:animate-none [&_[data-slot=skeleton]]:animate-none"
    >
      {variant === "deleted"
        ? Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 rounded border p-3"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))
        : [0, 1].map((group) => (
            <div
              key={group}
              className="overflow-hidden rounded-xl border bg-card"
            >
              <div className="flex items-center gap-3 border-b p-4">
                <Skeleton className="size-4 shrink-0" />
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="size-7" />
              </div>
              <div className="space-y-2 p-3">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Skeleton className="size-4 shrink-0" />
                    <Skeleton className="size-10 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="size-7" />
                  </div>
                ))}
              </div>
            </div>
          ))}
    </div>
  );
}

export function GuideSkeleton() {
  return (
    <div
      role="status"
      aria-label="가이드를 불러오는 중입니다."
      className="min-h-0 flex-1 space-y-6 overflow-hidden p-6"
    >
      <Skeleton className="h-7 w-60" />
      <Skeleton className="h-4 w-4/5" />
      {[0, 1].map((index) => (
        <div key={index} className="space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48 w-full" />
            <div className="space-y-3 rounded-lg border p-5">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div
      className="min-h-0 flex-1 overflow-hidden"
      role="status"
      aria-label="곡 목록을 불러오는 중입니다."
    >
      <div
        aria-hidden="true"
        className="animate-pulse motion-reduce:animate-none [&_[data-slot=skeleton]]:animate-none"
      >
        <div className="flex h-[60px] items-center justify-end border-b px-3">
          <div className="flex gap-2 rounded-lg border p-1">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-6 w-9" />
            ))}
          </div>
        </div>
        <div className="flex h-12 items-center justify-between px-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="size-4" />
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
          <div aria-hidden="true" className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-64 max-w-full" />
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
      <header
        className="flex shrink-0 items-center justify-between gap-4 border-b bg-card p-4"
        aria-hidden="true"
      >
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-8 w-60 max-w-[45%]" />
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
      <section
        className="w-full max-w-sm rounded-2xl border bg-card p-8"
        aria-hidden="true"
      >
        <Skeleton className="mb-3 h-4 w-16" />
        <Skeleton className="mb-5 h-7 w-40" />
        <Skeleton className="mb-6 h-4 w-full" />
        <Skeleton className="mb-3 h-4 w-20" />
        <Skeleton className="mb-5 h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </section>
    </main>
  );
}
