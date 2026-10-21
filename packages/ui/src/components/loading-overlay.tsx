import { LoaderCircle } from "lucide-react";

export function LoadingOverlay({ label = "불러오는 중입니다." }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-background p-6 text-foreground"
    >
      <LoaderCircle aria-hidden="true" className="size-6 animate-spin text-primary motion-reduce:animate-none" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
