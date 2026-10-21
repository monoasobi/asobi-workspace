import { LoadingOverlay } from "@asobi/ui/components/loading-overlay";

export const Loading = () => (
  <div className="relative isolate flex min-h-[160px] w-full flex-1 self-stretch">
    <LoadingOverlay />
  </div>
);
