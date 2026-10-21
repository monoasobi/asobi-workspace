import { Skeleton } from "@asobi/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@asobi/ui/components/table";

const pulse =
  "animate-pulse motion-reduce:animate-none [&_[data-slot=skeleton]]:animate-none";

export function BookDetailSkeleton({
  creating = false,
}: {
  creating?: boolean;
}) {
  return (
    <section aria-hidden="true" className={`min-w-0 px-5 pb-5 ${pulse}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-28" />
        <div className="flex gap-2">
          <Skeleton className={creating ? "h-7 w-16" : "size-7"} />
          <Skeleton className={creating ? "h-7 w-16" : "size-7"} />
        </div>
      </div>
      {creating ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 7 }, (_, index) => (
            <div
              key={index}
              className={`grid gap-2 ${index ? "sm:col-span-2" : ""}`}
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table className="table-fixed">
            <TableBody>
              {Array.from({ length: 8 }, (_, index) => (
                <TableRow key={index}>
                  <TableHead className="h-auto w-28 bg-muted/30 px-3 py-2.5 align-top">
                    <Skeleton className="mt-1 h-3 w-14" />
                  </TableHead>
                  <TableCell className="px-3 py-2.5 align-top">
                    <Skeleton
                      className={`my-0.5 h-4 ${index === 0 ? "w-6" : index === 1 ? "w-28" : "w-4/5"}`}
                    />
                    {index === 2 && <Skeleton className="mt-1 h-4 w-3/5" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

export function BookRowsSkeleton() {
  return (
    <div aria-hidden="true" className={`grid gap-1 p-2 ${pulse}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="flex min-h-14 items-center gap-3 border border-transparent px-3 py-3"
        >
          <Skeleton className="size-4 shrink-0" />
          <div className="grid min-w-0 flex-1 gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookListSkeleton() {
  return (
    <div aria-hidden="true">
      <div
        className={`flex items-center justify-between border-b px-5 py-4 ${pulse}`}
      >
        <Skeleton className="h-5 w-16" />
        <Skeleton className="size-7" />
      </div>
      <BookRowsSkeleton />
    </div>
  );
}
