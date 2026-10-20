"use client";
import { useCallback, useSyncExternalStore, type RefObject } from "react";

const query = "(min-width: 1024px)";
function subscribe(notify: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}
export function useEditorViewport(container?: RefObject<HTMLElement | null>) {
  const subscribeToWidth = useCallback(
    (notify: () => void) => {
      if (!container) return subscribe(notify);
      const element = container.current;
      if (!element) return () => {};
      const observer = new ResizeObserver(notify);
      observer.observe(element);
      return () => observer.disconnect();
    },
    [container],
  );
  const snapshot = useCallback(
    () =>
      container
        ? (container.current?.clientWidth ?? 0) >= 1024
        : window.matchMedia(query).matches,
    [container],
  );
  return useSyncExternalStore(subscribeToWidth, snapshot, () => false);
}
