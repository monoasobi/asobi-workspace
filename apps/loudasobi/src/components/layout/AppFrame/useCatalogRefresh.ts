"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { catalogUpdateKey } from "@/lib/catalogUpdates";

export function useCatalogRefresh() {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => router.refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key === catalogUpdateKey) refresh();
    };
    // Also replace a cached public route when returning from an admin screen.
    refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
    };
  }, [router]);
}
