import { LoaderCircle } from "lucide-react";

export function LoadingOverlay({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/15 p-6 backdrop-blur-[2px]"
    >
      <div className="flex max-w-sm flex-col items-center gap-3 text-center text-foreground">
        <LoaderCircle aria-hidden="true" className="size-6 animate-spin text-primary motion-reduce:animate-none" />
        <div className="space-y-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
