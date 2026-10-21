import { Button } from "@asobi/ui/components/button";
import { BookOpen, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { documentLabels } from "../content/documentLabels";
import { Skeleton } from "@asobi/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@asobi/ui/components/table";

const bookFields = [
  "id",
  "name",
  "novels",
  "kyoboUrl",
  "yes24Url",
  "aladinUrl",
  "ridiUrl",
  "naverUrl",
];

export function BookDetailSkeleton({
  creating = false,
}: {
  creating?: boolean;
}) {
  return (
    <section className="min-w-0 px-5 pb-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        {creating ? (
          <h2 className="type-card-title">서적 추가</h2>
        ) : (
          <Skeleton className="h-5 w-28" />
        )}
        <div className="flex gap-2">
          {creating ? (
            <>
              <Button disabled size="sm" variant="outline">
                <X aria-hidden />
                취소
              </Button>
              <Button disabled size="sm">
                <Save aria-hidden />
                생성
              </Button>
            </>
          ) : (
            <>
              <Button
                disabled
                size="icon-sm"
                variant="outline"
                aria-label="수정"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                disabled
                size="icon-sm"
                variant="outline"
                aria-label="삭제"
                className="text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      {creating ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 7 }, (_, index) => (
            <div
              key={index}
              className={`grid gap-2 ${index ? "sm:col-span-2" : ""}`}
            >
              <p className="type-label">
                {
                  documentLabels[
                    [
                      "name",
                      "novelIds",
                      "kyoboUrl",
                      "yes24Url",
                      "aladinUrl",
                      "ridiUrl",
                      "naverUrl",
                    ][index]
                  ]
                }
              </p>
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
                  <TableHead className="h-auto w-28 whitespace-normal bg-muted/30 px-3 py-2.5 align-top text-xs text-muted-foreground">
                    {documentLabels[bookFields[index]]}
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
    <div className="grid gap-1 p-2">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="flex min-h-14 items-center gap-3 border border-transparent px-3 py-3"
        >
          <BookOpen
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground"
          />
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
    <div>
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="type-card-title">서적 목록</h2>
        <Button disabled variant="ghost" size="icon-sm" aria-label="서적 추가">
          <Plus className="size-4" />
        </Button>
      </div>
      <BookRowsSkeleton />
    </div>
  );
}
