"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@asobi/ui/components/button";

export function CatalogError() {
  const router = useRouter();
  const t = useTranslations();
  return (
    <div
      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground"
      role="status"
    >
      <p>{t("catalogError")}</p>
      <Button type="button" onClick={() => router.refresh()} variant="link">
        {t("retry")}
      </Button>
    </div>
  );
}
