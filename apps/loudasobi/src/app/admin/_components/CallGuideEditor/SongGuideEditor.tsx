"use client";
import { TextSuggestions } from "./TextSuggestions";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CallGuide } from "@/lib/callGuide";

export function SongGuideEditor({
  value,
  disabled,
  onChange,
}: {
  value: CallGuide["songGuide"];
  disabled: boolean;
  onChange: (value: NonNullable<CallGuide["songGuide"]>) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <Info className="size-4" />곡 전체 가이드
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="max-h-[70dvh] w-96 max-w-[calc(100vw-2rem)] overflow-y-auto p-4"
      >
        <h2 className="font-semibold">곡 전체 가이드</h2>
        <p className="text-xs text-muted-foreground">
          가사를 보는 동안 상단에 고정 표시됩니다. 전체 저장으로 반영되며, 모두
          비우면 숨깁니다.
        </p>
        <fieldset disabled={disabled} className="min-w-0 space-y-3">
          {(
            [
              ["ko", "한국어"],
              ["ja", "일본어"],
              ["en", "영어"],
            ] as const
          ).map(([locale, label]) => (
            <div key={locale} className="space-y-1">
              <Label htmlFor={`song-guide-${locale}`}>{label}</Label>
              <textarea
                id={`song-guide-${locale}`}
                lang={locale}
                value={value?.[locale] ?? ""}
                maxLength={2000}
                className="min-h-20 w-full rounded-md border border-input bg-transparent p-2 text-sm focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
                onChange={(event) =>
                  onChange({
                    ...(value ?? { ko: "", ja: "", en: "" }),
                    [locale]: event.target.value,
                  })
                }
              />
            </div>
          ))}
          <TextSuggestions
            kind="guide"
            value={value ?? { ko: "", ja: "", en: "" }}
            disabled={disabled}
            onSelect={onChange}
          />
        </fieldset>
        <p className="text-xs text-muted-foreground">
          선택한 언어가 비어 있으면 한국어 등 입력된 다른 언어를 표시합니다.
        </p>
      </PopoverContent>
    </Popover>
  );
}
