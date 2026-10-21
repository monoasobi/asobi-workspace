"use client";
import type { ReactNode } from "react";
import { ChevronLeft, Undo2, Redo2, Save } from "lucide-react";
import { Button } from "@asobi/ui/components/button";
import { ButtonGroup } from "@asobi/ui/components/button-group";
import { Separator } from "@asobi/ui/components/separator";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@asobi/ui/components/tooltip";

export function EditorHeader({
  title,
  publication,
  readOnly,
  busy,
  dirty,
  invalid = false,
  history,
  onBack,
  onSave,
  children,
}: {
  title: string;
  publication?: string;
  readOnly: boolean;
  busy: boolean;
  dirty: boolean;
  invalid?: boolean;
  history: {
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
  };
  onBack: () => void;
  onSave: () => void;
  children?: ReactNode;
}) {
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-3 border-b bg-card px-4 py-2">
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label="곡 상세로"
        title="곡 상세로"
        disabled={busy}
        onClick={onBack}
      >
        <ChevronLeft className="size-4" />
      </Button>
      {publication && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {publication}
        </span>
      )}
      <h1 className="max-w-64 truncate text-sm font-semibold" title={title}>
        {title}
      </h1>
      <Separator orientation="vertical" className="h-5 self-center" />
      <ButtonGroup aria-label="편집 이력">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="실행 취소"
              disabled={readOnly || busy || !history.canUndo}
              onClick={history.undo}
            >
              <Undo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>실행 취소 · ⌘/Ctrl+Z</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="다시 실행"
              disabled={readOnly || busy || !history.canRedo}
              onClick={history.redo}
            >
              <Redo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>다시 실행 · ⌘/Ctrl+Shift+Z</TooltipContent>
        </Tooltip>
      </ButtonGroup>
      <p role="status" className="text-xs text-muted-foreground">
        {readOnly
          ? "열람 전용"
          : busy
            ? "저장 중…"
            : dirty
              ? "저장하지 않은 변경"
              : "모든 변경 저장됨"}
      </p>
      <div className="flex-1" />
      {children}
      <Button
        size="sm"
        disabled={readOnly || busy || !dirty || invalid}
        onClick={onSave}
      >
        <Save className="size-4" />
        {busy ? "저장 중…" : "전체 저장"}
      </Button>
    </header>
  );
}
