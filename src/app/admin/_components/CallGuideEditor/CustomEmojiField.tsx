"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
const EmojiPickerPanel = dynamic(() => import("./EmojiPickerPanel"), {
  loading: () => <p className="p-3 text-xs">이모지 선택기 준비 중…</p>,
});
export function CustomEmojiField({
  value,
  disabled,
  onChange,
}: {
  value?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">커스텀 아이콘</p>
      <div className="flex gap-2">
        <Popover open={open && !disabled} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
            >
              {value || "이모지 선택"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72">
            <EmojiPickerPanel
              onSelect={(emoji) => {
                onChange(emoji);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled || !value}
          onClick={() => onChange("")}
        >
          아이콘 없음
        </Button>
      </div>
    </div>
  );
}
