"use client";
/* eslint-disable @next/next/no-img-element */
import {
  adminNavigationAtom,
  confirmAdminNavigation,
} from "@/atoms/adminNavigation.atom";
import { sidebarAtom } from "@atoms/sidebar.atom";
import { Button } from "@asobi/ui/components/button";
import { PanelLeft } from "lucide-react";
import { SettingsMenu } from "./SettingsMenu";
import { useAtomValue, useSetAtom } from "jotai";
import Link from "next/link";
export function Header() {
  const guard = useAtomValue(adminNavigationAtom);
  const setSidebar = useSetAtom(sidebarAtom);
  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-card px-4 py-2.5">
      <Button
        variant="ghost"
        size="icon"
        aria-label="사이드바 열기"
        onClick={(event) => {
          event.stopPropagation();
          setSidebar((v) => !v);
        }}
      >
        <PanelLeft className="size-5" />
      </Button>
      <Button asChild variant="ghost" className="min-w-0">
        <Link
          href="/"
          aria-label="monoasobi 홈"
          onNavigate={(event) => {
            if (!confirmAdminNavigation(guard)) event.preventDefault();
          }}
        >
          <img
            src="/assets/logo.svg"
            alt="monoasobi"
            className="block h-auto w-[120px]"
          />
        </Link>
      </Button>
      <SettingsMenu />
    </header>
  );
}
