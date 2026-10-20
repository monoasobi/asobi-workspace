"use client";
/* eslint-disable @next/next/no-img-element */
import {
  adminNavigationAtom,
  confirmAdminNavigation,
} from "@/atoms/adminNavigation.atom";
import { appearanceAtom } from "@atoms/appearance.atom";
import { fontAtom } from "@atoms/font.atom";
import { sidebarAtom } from "@atoms/sidebar.atom";
import { Button } from "@asobi/ui/components/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@asobi/ui/components/popover";
import { PanelLeft, Settings } from "lucide-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Link from "next/link";
export function Header() {
  const guard = useAtomValue(adminNavigationAtom);
  const [appearance, setAppearance] = useAtom(appearanceAtom),
    [font, setFont] = useAtom(fontAtom);
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
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="설정">
            <Settings className="size-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 gap-4 p-4">
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="type-eyebrow mb-2 p-0">테마</legend>
            <div className="flex gap-2">
              {(["light", "dark"] as const).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={appearance === value ? "secondary" : "outline"}
                  aria-pressed={appearance === value}
                  onClick={() => setAppearance(value)}
                >
                  {value === "light" ? "라이트" : "다크"}
                </Button>
              ))}
            </div>
          </fieldset>
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="type-eyebrow mb-2 p-0">폰트</legend>
            <div className="flex gap-2">
              {(["gothic", "batang"] as const).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={font === value ? "secondary" : "outline"}
                  aria-pressed={font === value}
                  onClick={() => setFont(value)}
                >
                  <span
                    className={
                      value === "batang"
                        ? "font-bold [font-family:'KoPub_Batang',serif]"
                        : "font-bold"
                    }
                  >
                    {value === "gothic" ? "Pretendard" : "KoPub 바탕"}
                  </span>
                </Button>
              ))}
            </div>
          </fieldset>
        </PopoverContent>
      </Popover>
    </header>
  );
}
