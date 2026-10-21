import { LoaderCircle } from "lucide-react";

export function LoadingOverlay() {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/15 p-6 backdrop-blur-[2px]"
    >
      <LoaderCircle aria-hidden="true" className="size-6 animate-spin text-primary motion-reduce:animate-none" />
    </div>
  );
}
