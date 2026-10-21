"use client";

import { useTranslations } from "next-intl";
import { LoadingOverlay } from "@asobi/ui/components/loading-overlay";

export default function Loading() {
  const t = useTranslations();
  return <LoadingOverlay label={t("dataLoading")} />;
}
