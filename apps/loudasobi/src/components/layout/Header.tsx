"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@asobi/ui/components/button";
import { SettingsMenu } from "./SettingsMenu";

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const t = useTranslations();
  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-card px-4 py-2.5">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("toggleSongs")}
        onClick={onToggleSidebar}
      >
        <Menu className="size-5" />
      </Button>
      <Link href="/" className="rounded-sm outline-offset-4">
        <Image
          src="/assets/logo.svg"
          alt="loudasobi"
          width={410}
          height={129}
          className="h-auto w-[120px]"
        />
      </Link>
      <SettingsMenu />
    </header>
  );
}
