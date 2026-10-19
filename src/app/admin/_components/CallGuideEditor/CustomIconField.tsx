"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const IconPickerPanel = dynamic(() => import("./IconPickerPanel"), {
  loading: () => (
    <Button type="button" size="sm" variant="outline" disabled>
      선택기 준비 중…
    </Button>
  ),
});

export function CustomIconField({
  value,
  disabled,
  onChange,
}: {
  value?: string;
  disabled: boolean;
  onChange: (icon: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div data-icon-picker className="space-y-1">
      <p className="text-sm font-medium">커스텀 아이콘</p>
      <div className="flex gap-2">
        <IconPickerPanel
          value={value}
          disabled={disabled}
          open={open && !disabled}
          onOpenChange={setOpen}
          onChange={onChange}
        />
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
