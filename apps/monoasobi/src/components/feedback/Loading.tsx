"use client";
export const Loading = ({
  label = "불러오는 중입니다.",
}: {
  label?: string;
}) => (
  <div
    role="status"
    aria-live="polite"
    className="flex w-full min-h-[160px] p-4 gap-3 flex-col justify-center items-center"
  >
    <span
      aria-hidden="true"
      className="size-5 animate-spin rounded-full border-2 border-border border-t-primary motion-reduce:animate-none"
    />
    <span className="type-body text-muted-foreground">{label}</span>
  </div>
);
