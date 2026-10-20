"use client";
import { IconPicker, type IconName } from "@/components/ui/icon-picker";
import { Button } from "@asobi/ui/components/button";
import { CallIcon } from "@/components/common/CallIcon";

const presets = [
  { name: "hand", label: "박수" },
  { name: "hand-fist", label: "챈트 · 주먹" },
  { name: "mic-vocal", label: "떼창 · 마이크" },
  { name: "hand-swing", label: "좌우 스윙" },
  { name: "heart", label: "하트" },
  { name: "hand-metal", label: "응원 · 록" },
  { name: "move-horizontal", label: "좌우 방향" },
] as const;

export default function IconPickerPanel({
  value,
  disabled,
  open,
  onOpenChange,
  onChange,
}: {
  value?: string;
  disabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (icon: string) => void;
}) {
  return (
    <IconPicker
      value={(value ?? "") as IconName | ""}
      open={open}
      onOpenChange={onOpenChange}
      onValueChange={onChange}
      disabled={disabled}
      categorized={false}
      presets={presets}
      searchPlaceholder="아이콘 검색 (영문 이름)"
      triggerPlaceholder="아이콘 선택"
    >
      <Button type="button" size="sm" variant="outline" disabled={disabled}>
        {value && <CallIcon type="custom" icon={value} />}
        {value === "hand-swing" ? "좌우 스윙" : value || "아이콘 선택"}
      </Button>
    </IconPicker>
  );
}
