import { LoadingOverlay } from "@asobi/ui/components/loading-overlay";

export default function Loading() {
  return <LoadingOverlay label="데이터를 불러오는 중…" description="잠시만 기다려 주세요." />;
}
