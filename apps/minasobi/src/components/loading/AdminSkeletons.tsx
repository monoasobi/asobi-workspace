import { Skeleton } from "@asobi/ui/components/skeleton";

export function FormSkeleton() {
  return (
    <div className="space-y-6 p-5" aria-hidden="true">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-20" />
      </div>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className={index === 3 ? "h-24 w-full" : "h-8 w-full"} />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-3 p-4" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <Skeleton className="size-12 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
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
        className="flex items-center justify-between border-b p-4"
      >
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
      <ListSkeleton />
    </div>
  );
}

export function MusicOverviewSkeleton() {
  return (
    <div className="space-y-5 p-5" aria-hidden="true">
      <div className="flex justify-between gap-4">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex flex-wrap items-start gap-5">
        <Skeleton className="size-28 shrink-0" />
        <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-5"
      role="status"
      aria-label="편집기를 불러오는 중입니다."
    >
      <div aria-hidden="true" className="flex justify-between gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div
        className="grid min-h-0 flex-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
        aria-hidden="true"
      >
        <div className="space-y-4">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-3 rounded-xl border bg-card p-4">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminPageSkeleton({
  kind = "music",
}: {
  kind?: "music" | "books" | "list" | "form";
}) {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden p-4 sm:p-6"
      role="status"
      aria-label="자료를 불러오는 중입니다."
    >
      {kind === "music" ? (
        <>
          <section className="shrink-0 rounded-xl border bg-card">
            <MusicOverviewSkeleton />
          </section>
          <div className="grid min-h-0 flex-1 gap-5 overflow-hidden xl:grid-cols-2">
            <section className="overflow-hidden rounded-xl border bg-card">
              <FormSkeleton />
            </section>
            <section className="overflow-hidden rounded-xl border bg-card">
              <FormSkeleton />
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
                ? "grid min-h-0 flex-1 gap-5 overflow-hidden md:grid-cols-[16rem_minmax(0,1fr)]"
                : "min-h-0 flex-1 overflow-hidden"
            }
          >
            {kind === "books" && (
              <section className="overflow-hidden rounded-xl border bg-card">
                <ListSkeleton />
              </section>
            )}
            <section className="overflow-hidden rounded-xl border bg-card">
              {kind === "list" ? <ListSkeleton /> : <FormSkeleton />}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export function AdminFrameSkeleton() {
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
        <AdminPageSkeleton />
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
