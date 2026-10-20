"use client";

import { appearanceAtom } from "@atoms/appearance.atom";
import { privateReaderAtom } from "@atoms/privateReader.atom";
import { sidebarAtom } from "@atoms/sidebar.atom";
import { Theme } from "@radix-ui/themes";
import { Analytics } from "@vercel/analytics/next";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useSyncExternalStore } from "react";

const subscribeToSystemTheme = (notify: () => void) => {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const getSystemDarkMode = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;
const getServerDarkMode = () => false;

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  const appearance = useAtomValue(appearanceAtom);
  const systemDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemDarkMode,
    getServerDarkMode,
  );
  const resolvedAppearance =
    appearance === "system" ? (systemDark ? "dark" : "light") : appearance;
  const setIsSidebar = useSetAtom(sidebarAtom);
  const setHasPrivateReaderAccess = useSetAtom(privateReaderAtom);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedAppearance === "dark");
    document.documentElement.classList.toggle("light", resolvedAppearance === "light");
  }, [resolvedAppearance]);

  useEffect(() => {
    const width = window.innerWidth;
    if (width < 1024) setIsSidebar(false);
  }, [setIsSidebar]);

  useEffect(() => {
    const syncPrivateReaderSession = async () => {
      try {
        const response = await fetch("/api/private-reader/auth/session");
        if (!response.ok) return;

        const data = (await response.json()) as { authenticated?: boolean };
        setHasPrivateReaderAccess(Boolean(data.authenticated));
      } catch {
        setHasPrivateReaderAccess(false);
      }
    };

    void syncPrivateReaderSession();
  }, [setHasPrivateReaderAccess]);

  return (
    <Theme
      appearance={resolvedAppearance}
      accentColor="red"
      panelBackground="solid"
      radius="small"
    >
      {children}
      <Analytics />
    </Theme>
  );
};
