"use client";

import { useEffect, useRef, useState } from "react";

export const requestPlayerFullscreen = async (container: HTMLElement) => {
  if (!container.requestFullscreen || !container.ownerDocument.fullscreenEnabled) return false;
  try {
    await container.requestFullscreen();
    return true;
  } catch {
    // In-app browsers can expose the API while denying the request.
    return false;
  }
};

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
};

export const lockPlayerLandscape = (orientation?: LockableOrientation) => {
  if (!orientation?.lock) return;
  try {
    void orientation.lock("landscape").catch(() => {
      // Orientation locking is optional; playback continues if it is denied.
    });
  } catch {
    return;
  }
  return () => {
    try {
      // Also cancels a pending lock when fullscreen is closed immediately.
      orientation.unlock();
    } catch {
      // Some browsers expose unlock() without supporting it.
    }
  };
};

export const showExpandedPlayer = (dialog: HTMLDialogElement) => {
  // Promote the existing player without moving or recreating the YouTube iframe.
  dialog.close();
  dialog.showModal();
  return () => {
    dialog.close();
    if (dialog.isConnected) dialog.show();
  };
};

export const usePlayerFullscreen = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mode, setMode] = useState<"inline" | "fullscreen" | "expanded">("inline");
  const isExpanded = mode !== "inline";

  useEffect(() => {
    const syncFullscreen = () => {
      if (document.fullscreenElement === containerRef.current) {
        setMode("fullscreen");
      } else {
        setMode((current) => current === "fullscreen" ? "inline" : current);
      }
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    if (mode !== "fullscreen") return;
    return lockPlayerLandscape(window.screen.orientation);
  }, [mode]);

  useEffect(() => {
    if (mode !== "expanded" || !dialogRef.current) return;
    return showExpandedPlayer(dialogRef.current);
  }, [mode]);

  useEffect(() => {
    if (!isExpanded) return;
    const previousOverflow = document.body.style.overflow;
    const button = buttonRef.current;
    document.body.style.overflow = "hidden";
    button?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mode === "expanded") {
        event.preventDefault();
        setMode("inline");
      }
      if (event.key !== "Tab") return;
      const controls = containerRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled)',
      );
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      button?.focus({ preventScroll: true });
    };
  }, [isExpanded, mode]);

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement === container) {
      try {
        await document.exitFullscreen();
      } catch {
        // Keep the exit button available if the browser rejects the request.
      }
      return;
    }
    if (isExpanded) {
      setMode("inline");
      return;
    }
    if (!await requestPlayerFullscreen(container)) setMode("expanded");
  };

  return {
    dialogRef,
    containerRef,
    buttonRef,
    isExpanded,
    toggleFullscreen,
    cancelExpanded: () => setMode("inline"),
  };
};
