"use client";

import {
  Group,
  Panel,
  Separator,
  type GroupProps,
  type SeparatorProps,
} from "react-resizable-panels";
import styles from "./Resizable/Resizable.module.css";

// shadcn/ui Resizable, styled with the app's CSS Modules and Radix theme.
export function ResizablePanelGroup({ className, ...props }: GroupProps) {
  return (
    <Group
      data-slot="resizable-panel-group"
      className={[styles.group, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export const ResizablePanel = Panel;

export function ResizableHandle({ className, ...props }: SeparatorProps) {
  return (
    <Separator
      data-slot="resizable-handle"
      className={[styles.handle, className].filter(Boolean).join(" ")}
      {...props}
    >
      <span className={styles.grip} aria-hidden="true" />
    </Separator>
  );
}
