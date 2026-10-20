"use client";
import { useEffect } from "react";
import type { Playback } from "./usePlayback";

export function usePlaybackShortcuts({ ready, toggle }: Playback, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    function handle(event: KeyboardEvent) {
      if (
        event.code !== "Space" ||
        event.isComposing ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      const target = event.target;
      if (target instanceof Element) {
        if (target.closest("[data-icon-picker]")) return;
        const input = target.closest("input");
        if (
          (target instanceof HTMLElement && target.isContentEditable) ||
          target.closest('textarea, [role="textbox"]') ||
          (input &&
            ![
              "range",
              "checkbox",
              "radio",
              "button",
              "submit",
              "reset",
              "file",
              "color",
            ].includes(input.type))
        )
          return;
      }
      // Cancel both halves of native Space activation before any focused control.
      event.preventDefault();
      event.stopPropagation();
      if (ready && event.type === "keydown" && !event.repeat) toggle();
    }
    window.addEventListener("keydown", handle, true);
    window.addEventListener("keyup", handle, true);
    return () => {
      window.removeEventListener("keydown", handle, true);
      window.removeEventListener("keyup", handle, true);
    };
  }, [ready, toggle, enabled]);
}
