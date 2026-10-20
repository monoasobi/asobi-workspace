"use client";
import { useEffect } from "react";
import { useNavigationGuard } from "@/components/NavigationGuard";

export function useEditorGuard(section: string, dirty: boolean, busy: boolean) {
  const { setDirty, setBusy } = useNavigationGuard();
  useEffect(() => {
    setDirty(section, dirty);
  }, [section, dirty, setDirty]);
  useEffect(() => {
    setBusy(section, busy);
  }, [section, busy, setBusy]);
  useEffect(
    () => () => {
      setDirty(section, false);
      setBusy(section, false);
    },
    [section, setDirty, setBusy],
  );
}
