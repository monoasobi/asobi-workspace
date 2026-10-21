import { Skeleton } from "@asobi/ui/components/skeleton";

const pulse =
  "animate-pulse motion-reduce:animate-none [&_[data-slot=skeleton]]:animate-none";

function Field({ help = false }: { help?: boolean }) {
  return (
    <div className="grid gap-2">
      <Skeleton className="h-4 w-36 max-w-full" />
      <Skeleton className="h-8 w-full" />
      {help && <Skeleton className="h-3 w-5/6" />}
    </div>
  );
}

export function MusicOverviewSkeleton() {
  return (
    <div aria-hidden="true" className={pulse}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <Skeleton className="h-5 w-16" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-7 w-24" />
        </div>
      </div>
      <div className="flex min-w-0 items-start gap-4 p-5 sm:p-6">
        <Skeleton className="size-[120px] shrink-0 rounded-lg" />
        <div className="grid min-w-0 flex-1 gap-4 lg:grid-cols-3">
          <Field />
          <Field />
          <Field />
        </div>
      </div>
    </div>
  );
}

export function MusicContentSkeleton() {
  return (
    <div aria-hidden="true" className={pulse}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div className="flex items-center gap-2">
          {[72, 32, 32, 32, 32].map((width, index) => (
            <Skeleton key={index} className="h-6" style={{ width }} />
          ))}
        </div>
        <Skeleton className="h-7 w-24" />
      </div>
      <div className="grid gap-5 p-5 sm:p-6">
        <Field />
        <Field />
      </div>
    </div>
  );
}

export function MusicSettingsSkeleton() {
  return (
    <div aria-hidden="true" className={pulse}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-24" />
        </div>
      </div>
      <div className="grid gap-5 p-5 sm:p-6">
        <div>
          <div className="mb-4 flex items-start gap-3">
            <Skeleton className="mt-0.5 size-5 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-72 max-w-full" />
            </div>
          </div>
          <div className="grid items-start gap-5 lg:grid-cols-2">
            <Field help />
            <Field />
          </div>
        </div>
        <div>
          <div className="mb-4 flex items-start gap-3">
            <Skeleton className="mt-0.5 size-5 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-48 max-w-full" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="size-4" />
            <Skeleton className="h-4 w-52 max-w-full" />
          </div>
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}
