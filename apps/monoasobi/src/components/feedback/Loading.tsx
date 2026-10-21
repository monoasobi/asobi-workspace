"use client";
import { LoadingOverlay } from "@asobi/ui/components/loading-overlay";

export const Loading = ({
  label = "불러오는 중입니다.",
}: {
  label?: string;
}) => (
  <div className="relative isolate flex min-h-[160px] w-full flex-1 self-stretch">
    <LoadingOverlay label={label} description="잠시만 기다려 주세요." />
  </div>
);
