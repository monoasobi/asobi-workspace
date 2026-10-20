"use client";
import {
  Group,
  Panel,
  Separator,
  type GroupProps,
  type SeparatorProps,
} from "react-resizable-panels";
import { cn } from "../lib/utils";
// Existing Mono/admin panel contract: the 18px handle stays easy to grab.
export function ResizablePanelGroup({ className, ...props }: GroupProps) {
  return (
    <Group
      data-slot="resizable-panel-group"
      className={cn("size-full min-h-0 min-w-0", className)}
      {...props}
    />
  );
}
export const ResizablePanel = Panel;
export function ResizableHandle({ className, ...props }: SeparatorProps) {
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        "group/handle relative flex w-4.5 touch-none cursor-col-resize items-center justify-center before:absolute before:inset-y-0 before:w-px before:bg-border hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none relative h-8 w-1.5 rounded-sm border-x-2 border-border bg-border group-hover/handle:border-primary group-focus-visible/handle:border-primary"
      />
    </Separator>
  );
}
