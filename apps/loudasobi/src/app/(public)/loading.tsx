"use client";

import { useTranslations } from "next-intl";
import { LoadingOverlay } from "@asobi/ui/components/loading-overlay";

export default function Loading() {
  const t = useTranslations("dataLoading");
  return <LoadingOverlay label={t("label")} description={t("description")} />;
}
