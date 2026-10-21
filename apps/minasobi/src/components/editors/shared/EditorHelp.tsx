"use client";
import { CircleHelp } from "lucide-react";
import { Button } from "@asobi/ui/components/button";
import { Kbd, KbdGroup } from "@asobi/ui/components/kbd";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@asobi/ui/components/popover";
export function EditorHelp({ kind = "calls" }: { kind?: "calls" | "lyrics" }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon-sm" variant="ghost" aria-label="편집 도움말">
          <CircleHelp className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        data-editor-portal
        align="end"
        aria-label="편집 도움말"
        className="w-96 max-w-[calc(100vw-2rem)] gap-4 p-4 text-xs"
      >
        <h2 className="text-sm font-semibold">편집 도움말</h2>
        <p>
          {kind === "calls"
            ? "빈 콜 트랙을 드래그해 콜을 추가합니다. 콜과 가사의 가장자리를 드래그하면 길이를 조절할 수 있습니다."
            : "가사를 선택하면 영상 아래에서 내용을 편집할 수 있습니다. 블록 가장자리를 드래그해 시간을 조절합니다."}
        </p>
        <p>
          {kind === "calls"
            ? "이동·길이 조절 시 시작은 실선, 끝은 점선에 스냅됩니다."
            : "이동·길이 조절 시 재생 위치에 스냅됩니다."}{" "}
          <Kbd>⌘ / Ctrl</Kbd>을 누르면 스냅을 해제합니다.
        </p>
        <dl className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3">
          <dt>확대·축소</dt>
          <dd>
            <Kbd>⌘ / Ctrl</Kbd> + 드래그·스크롤
          </dd>
          <dt>가사 범위 선택</dt>
          <dd>
            {kind === "calls" ? (
              <>
                <Kbd>Shift</Kbd> + 클릭
              </>
            ) : (
              "빈 곳 드래그"
            )}
          </dd>
          <dt>재생·정지</dt>
          <dd>
            <Kbd>Space</Kbd>
          </dd>
          <dt>0.01초 이동</dt>
          <dd>
            <KbdGroup>
              <Kbd>←</Kbd>
              <Kbd>→</Kbd>
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
            </KbdGroup>
          </dd>
          <dt>실행 취소</dt>
          <dd>
            <KbdGroup>
              <Kbd>⌘ / Ctrl</Kbd>
              <Kbd>Z</Kbd>
            </KbdGroup>
          </dd>
          <dt>다시 실행</dt>
          <dd>
            <KbdGroup>
              <Kbd>⌘ / Ctrl</Kbd>
              <Kbd>Shift</Kbd>
              <Kbd>Z</Kbd>
            </KbdGroup>
          </dd>
          <dt>전체 저장</dt>
          <dd>
            <KbdGroup>
              <Kbd>⌘ / Ctrl</Kbd>
              <Kbd>S</Kbd>
            </KbdGroup>
          </dd>
        </dl>
      </PopoverContent>
    </Popover>
  );
}
