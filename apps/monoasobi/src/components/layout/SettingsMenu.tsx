"use client";

import { useAtom } from "jotai";
import { Check, Moon, Sun, Type } from "lucide-react";
import { appearanceAtom } from "@atoms/appearance.atom";
import { fontAtom } from "@atoms/font.atom";
import { Button } from "@asobi/ui/components/button";
import { SettingsPopover } from "@asobi/ui/components/settings-popover";
import { cn } from "@asobi/ui/lib/utils";

const selectedStyle =
  "border-primary bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary dark:bg-primary/5 dark:hover:bg-primary/10";

export function SettingsMenu() {
  const [appearance, setAppearance] = useAtom(appearanceAtom);
  const [font, setFont] = useAtom(fontAtom);
  return (
    <SettingsPopover
      title="설정"
      description="편하게 읽을 수 있도록 화면을 설정하세요."
      closeLabel="닫기"
    >
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="type-label mb-3 flex items-center gap-2 p-0 font-semibold">
          <Sun className="size-4 text-muted-foreground" aria-hidden />
          테마
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: "light", label: "라이트", Icon: Sun },
            { value: "dark", label: "다크", Icon: Moon },
          ] as const).map(({ value, label, Icon }) => (
            <Button
              key={value}
              variant="outline"
              aria-pressed={appearance === value}
              onClick={() => setAppearance(value)}
              className={cn(
                "h-auto min-h-20 flex-col gap-2 px-1 py-3 text-xs",
                appearance === value && selectedStyle,
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Button>
          ))}
        </div>
      </fieldset>
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="type-label mb-1 flex items-center gap-2 p-0 font-semibold">
          <Type className="size-4 text-muted-foreground" aria-hidden />
          글꼴
        </legend>
        <p className="type-caption mb-3">소설 본문에 적용됩니다.</p>
        <div className="space-y-1.5">
          {(["gothic", "batang"] as const).map((value) => (
            <Button
              key={value}
              variant="outline"
              aria-pressed={font === value}
              onClick={() => setFont(value)}
              className={cn(
                "h-auto min-h-11 w-full justify-between px-3 py-2 text-sm",
                font === value && selectedStyle,
              )}
            >
              <span
                className={cn(
                  "font-bold",
                  value === "batang" && "[font-family:'KoPub_Batang',serif]",
                )}
              >
                {value === "gothic" ? "Pretendard" : "KoPub 바탕"}
              </span>
              <Check
                className={cn("size-4 text-primary", font !== value && "invisible")}
                aria-hidden
              />
            </Button>
          ))}
        </div>
      </fieldset>
    </SettingsPopover>
  );
}
