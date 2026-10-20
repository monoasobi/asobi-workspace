"use client";
import { useEffect, type RefObject } from "react";
import { editorCommand, isEditorTextTarget } from "./editorKeys";

export function useEditorShortcuts({
  root,
  enabled = true,
  ready = true,
  toggle,
  seekBy,
  undo,
  redo,
  save,
  selectActive,
  zoomIn,
  zoomOut,
}: {
  root?: RefObject<HTMLElement | null>;
  enabled?: boolean;
  ready?: boolean;
  toggle: () => void;
  seekBy: (delta: number) => void;
  undo?: () => void;
  redo?: () => void;
  save?: () => void;
  selectActive?: () => void;
  zoomIn?: () => void;
  zoomOut?: () => void;
}) {
  useEffect(() => {
    if (!enabled) return;
    function handle(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (
        root?.current &&
        target instanceof Element &&
        target !== document.body &&
        !root.current.contains(target) &&
        !target.closest("[data-editor-portal]")
      )
        return;
      const command = editorCommand(
        event,
        isEditorTextTarget(event.target, event.code === "Space"),
      );
      if (!command) return;
      if (
        command === "selectActive" &&
        event.target instanceof Element &&
        event.target.closest('button, a, [role="button"]')
      )
        return;
      const actions = {
        toggle,
        backward: () => seekBy(-0.01),
        forward: () => seekBy(0.01),
        undo,
        redo,
        save,
        selectActive,
        zoomIn,
        zoomOut,
      };
      const action = actions[command];
      if (!action) return;
      const playback = ["toggle", "backward", "forward"].includes(command);
      if (event.type === "keyup" && !playback) return;
      event.preventDefault();
      event.stopPropagation();
      if (
        event.type !== "keydown" ||
        (command === "toggle" && event.repeat) ||
        (playback && !ready)
      )
        return;
      action();
    }
    window.addEventListener("keydown", handle, true);
    window.addEventListener("keyup", handle, true);
    return () => {
      window.removeEventListener("keydown", handle, true);
      window.removeEventListener("keyup", handle, true);
    };
  }, [
    root,
    enabled,
    ready,
    toggle,
    seekBy,
    undo,
    redo,
    save,
    selectActive,
    zoomIn,
    zoomOut,
  ]);
}
