import { LoadingOverlay } from "@asobi/ui/components/loading-overlay";

export function EditorLoading() {
  return (
    <div className="relative flex min-h-0 flex-1">
      <LoadingOverlay />
    </div>
  );
}
