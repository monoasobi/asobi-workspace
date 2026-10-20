"use client";
import { cn } from "@asobi/ui/lib/utils";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import styles from "./Error.styles";
export const Error = () => {
  return (
    <div className={cn("flex justify-center items-center", styles.container)}>
      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs">
        <div className="flex flex-col items-center gap-2 p-4">
          <ExclamationTriangleIcon width={60} color="red" />
          <h2 className="type-section-title">오류</h2>
          <span className="type-body">소설을 가져오는데 실패했습니다.</span>
        </div>
      </section>
    </div>
  );
};
