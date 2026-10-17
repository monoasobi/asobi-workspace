"use client";
import { EmojiPicker, type EmojiPickerListProps } from "frimousse";

const components: NonNullable<EmojiPickerListProps["components"]> = {
  CategoryHeader: ({ category, ...props }) => (
    <div
      {...props}
      className="bg-popover px-2 py-1 text-xs font-medium text-muted-foreground"
    >
      {category.label}
    </div>
  ),
  Row: ({ children, ...props }) => (
    <div {...props} className="flex">
      {children}
    </div>
  ),
  Emoji: ({ emoji, ...props }) => (
    <button
      {...props}
      type="button"
      className="flex size-8 items-center justify-center rounded text-xl data-[active]:bg-accent hover:bg-accent"
    >
      {emoji.emoji}
    </button>
  ),
};
export default function EmojiPickerPanel({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) {
  return (
    <EmojiPicker.Root
      locale="ko"
      columns={8}
      emojibaseUrl="https://cdn.jsdelivr.net/npm/emojibase-data@17.0.0"
      onEmojiSelect={({ emoji }) => onSelect(emoji)}
      className="flex w-full flex-col"
    >
      <EmojiPicker.Search
        autoFocus
        aria-label="이모지 검색"
        placeholder="이모지 검색 (예: 박수, 하트)"
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
      />
      <EmojiPicker.Viewport className="relative mt-2 h-64 w-full">
        <EmojiPicker.Loading className="p-3 text-xs text-muted-foreground">
          이모지를 불러오는 중…
        </EmojiPicker.Loading>
        <EmojiPicker.Empty className="p-3 text-xs text-muted-foreground">
          검색 결과가 없습니다.
        </EmojiPicker.Empty>
        <EmojiPicker.List components={components} />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}
